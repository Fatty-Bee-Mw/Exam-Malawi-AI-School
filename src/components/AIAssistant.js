import React, { useState, useRef, useEffect } from 'react';
import { useUserLimits } from '../contexts/UserLimitsContext';
import { useUserStats } from '../contexts/UserStatsContext';
import { useAdmin } from '../contexts/AdminContext';
import { useAuth } from '../contexts/AuthContext';
import aiService from '../services/aiService';
import VoiceInput from './VoiceInput';
import { 
  PaperAirplaneIcon,
  DocumentTextIcon,
  SparklesIcon,
  StopIcon
} from '@heroicons/react/24/outline';

export default function AIAssistant() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('question');
  const [selectedSubject, setSelectedSubject] = useState('General');
  const messagesEndRef = useRef(null);
  const { currentUser } = useAuth();
  const { canAskQuestion, canGenerateExam, updateUsage, getRemainingQuestions, getRemainingExams, currentPlan } = useUserLimits();
  const { recordQuestion, recordExam } = useUserStats();
  const { recordAIInteraction } = useAdmin();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = async (prompt) => {
    try {
      if (process.env.REACT_APP_TUTOR_FUNCTION_URL || process.env.NODE_ENV === 'production') {
        const responseText = await aiService.askTutor({ question: prompt });
        return responseText || 'Sorry, I could not generate a response.';
      }

      // Check if backend is available
      const health = await aiService.checkHealth();
      
      if (!health.online) {
        // Custom message when AI is not available
        return `🤖💤 **AI Agent Is Sleeping, Try next time.**\n\nOur AI tutor is currently taking a rest. Please try again later when the AI agent is awake and ready to help with your studies!\n\n✨ *Tip: The AI agent works best when you have a stable internet connection.*`;
      }

      // Get real AI response with user context
      const response = await aiService.chat({
        message: prompt,
        conversation_history: messages.filter(m => m.type !== 'error').map(m => ({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.content
        })),
        user_name: currentUser?.name,
        is_premium: currentPlan === 'premium',
        user_id: currentUser?.id
      });
      
      return response.response || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('AI Service Error:', error);
      return `⚠️ Error connecting to AI: ${error.message}\n\nIf you are running on Netlify, please ensure the /.netlify/functions/ask function is deployed and the GROQ_API_KEY environment variable is set.`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    if (mode === 'question' && !canAskQuestion()) {
      setMessages(prev => [...prev, {
        type: 'error',
        content: `You've reached your daily limit of ${getRemainingQuestions() === 0 ? '10' : '0'} questions. Upgrade to Premium for unlimited access!`
      }]);
      return;
    }
    
    if (mode === 'exam' && !canGenerateExam()) {
      setMessages(prev => [...prev, {
        type: 'error',
        content: `You've reached your daily limit of ${getRemainingExams() === 0 ? '3' : '0'} exams. Upgrade to Premium for unlimited access!`
      }]);
      return;
    }

    const userMessage = {
      type: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const startTime = Date.now();
      const aiResponse = await getAIResponse(input);
      const responseTime = Date.now() - startTime;
      
      const aiMessage = {
        type: 'ai',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Record usage in user limits
      if (mode === 'question') {
        updateUsage('question');
        recordQuestion(selectedSubject, input);
      } else if (mode === 'exam') {
        updateUsage('exam');
        recordExam(selectedSubject, 85); // Default score for now
      }

      // Record interaction in admin analytics
      recordAIInteraction(mode, selectedSubject, responseTime, true);
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      const responseTime = Date.now() - (Date.now() - 3000); // Estimate error time
      
      setMessages(prev => [...prev, {
        type: 'error',
        content: 'Sorry, I encountered an error. Please try again. Make sure the backend server is running.'
      }]);

      // Record failed interaction
      recordAIInteraction(mode, selectedSubject, responseTime, false);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleVoiceTranscript = (transcript) => {
    if (transcript.trim()) {
      setInput(transcript);
    }
  };

  return (
    <div className="card-hover rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <SparklesIcon className="h-6 w-6 text-dark-neon-blue mr-2" />
          <h3 className="text-xl font-semibold text-white">AI Study Assistant</h3>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-dark-accent border border-dark-muted rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-dark-neon-blue"
          >
            <option value="General">General</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
            <option value="English">English</option>
            <option value="Social Studies">Social Studies</option>
            <option value="Geography">Geography</option>
            <option value="Biology">Biology</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Physics">Physics</option>
          </select>
          <div className="flex bg-dark-accent rounded-lg p-1">
            <button
              onClick={() => setMode('question')}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                mode === 'question'
                  ? 'bg-dark-neon-blue text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Ask Question
            </button>
            <button
              onClick={() => setMode('exam')}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                mode === 'exam'
                  ? 'bg-dark-neon-purple text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Generate Exam
            </button>
          </div>
          <button
            onClick={clearChat}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="bg-dark-accent/50 rounded-lg p-4 h-96 overflow-y-auto mb-4 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-dark-neon-blue to-dark-neon-purple rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-lg font-medium text-white mb-2">
              {mode === 'question' ? 'Ask me anything!' : 'Generate practice exams'}
            </h4>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              {mode === 'question' 
                ? 'I can help you understand concepts, solve problems, and prepare for exams.'
                : 'Get customized practice exams based on your subjects and difficulty level.'
              }
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {mode === 'question' ? [
                'What is photosynthesis?',
                'Explain algebra basics',
                'Help with essay writing'
              ] : [
                'Mathematics quiz',
                'Science exam',
                'English grammar test'
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-1 bg-dark-muted text-gray-300 rounded-full text-sm hover:bg-dark-neon-blue/20 hover:text-dark-neon-blue transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-dark-neon-blue to-cyan-500 text-white'
                      : message.type === 'error'
                      ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                      : 'bg-dark-muted text-gray-300'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  <p className="text-xs mt-2 opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-dark-muted px-4 py-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-dark-neon-blue rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-dark-neon-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-dark-neon-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-400">AI is thinking<span className="loading-dots"></span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Voice Input Section */}
      <div className="mb-4">
        <VoiceInput 
          onTranscript={handleVoiceTranscript}
          isLoading={isLoading}
          disabled={isLoading}
        />
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-2">
        <div className="flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'question' ? 'Ask your question or use voice input above...' : 'Describe the exam you want or use voice input above...'}
            className="w-full px-4 py-3 bg-dark-accent border border-dark-muted rounded-lg text-white placeholder-gray-500 focus:outline-none input-glow transition-all"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="btn-primary text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading ? (
            <StopIcon className="h-5 w-5" />
          ) : mode === 'exam' ? (
            <DocumentTextIcon className="h-5 w-5" />
          ) : (
            <PaperAirplaneIcon className="h-5 w-5" />
          )}
        </button>
      </form>

      <div className="mt-4 text-xs text-gray-400 text-center">
        {mode === 'question' 
          ? `${getRemainingQuestions()} questions remaining today`
          : `${getRemainingExams()} exams remaining today`
        }
      </div>
    </div>
  );
}
