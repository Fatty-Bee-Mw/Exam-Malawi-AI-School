import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useUserLimits } from '../contexts/UserLimitsContext';
import { useUserStats } from '../contexts/UserStatsContext';
import { useAuth } from '../contexts/AuthContext';
import { getBackendPlanKey } from '../constants/limits';
import aiService from '../services/aiService';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import ExamFlow from './ExamFlow';
import DrawingCanvas from './DrawingCanvas';
import {
  PaperAirplaneIcon,
  DocumentTextIcon,
  SparklesIcon,
  StopIcon,
  DocumentArrowUpIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

const SUGGESTIONS = {
  question: ['What is photosynthesis?', 'Explain algebra', 'Help with essay writing'],
  exam: ['Math quiz', 'Science exam', 'English grammar test'],
};

export default function AIAssistant() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('question');
  const [selectedSubject, setSelectedSubject] = useState('General');
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [showExamFlow, setShowExamFlow] = useState(false);
  const [showDrawingCanvas, setShowDrawingCanvas] = useState(false);
  
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const { currentUser } = useAuth();
  const {
    canAskQuestion,
    canGenerateExam,
    updateUsage,
    getRemainingQuestions,
    getRemainingExams,
    currentPlan,
  } = useUserLimits();
  const { recordQuestion, recordExam } = useUserStats();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, isLoading]);

  useEffect(() => {
    if (!showExamFlow && !isLoading) {
      inputRef.current?.focus();
    }
  }, [showExamFlow, isLoading]);

  const getAIResponse = useCallback(async (prompt, history) => {
    try {
      const response = await aiService.chat({
        message: prompt,
        conversation_history: history,
        user_name: currentUser?.name,
        is_premium: currentPlan === 'premium',
        user_plan: getBackendPlanKey(currentPlan, currentUser?.subscription),
        user_id: currentUser?.id,
        use_my_documents: true,
      });

      let text = response.response || 'Sorry, I could not generate a response.';
      if (response.sources?.length) {
        text += `\n\nSources: ${response.sources.slice(0, 3).join(', ')}`;
      }
      return text;
    } catch (error) {
      if (!navigator.onLine) return 'You are offline. Connect to the internet and try again.';
      return `Could not reach the tutor: ${error.message}.`;
    }
  }, [currentUser?.name, currentUser?.id, currentUser?.subscription, currentPlan]);

  const handleFileUpload = useCallback(async (fileList) => {
    if (!currentUser?.id || !fileList?.length) return;
    setUploading(true);
    try {
      const result = await aiService.uploadStudyDocuments(
        currentUser.id,
        Array.from(fileList),
        selectedSubject !== 'General' ? selectedSubject : null
      );
      setUploadMessage(`Uploaded ${result.uploaded} file(s).`);
    } catch (err) {
      setUploadMessage('Upload failed');
    } finally {
      setUploading(false);
    }
  }, [currentUser?.id, selectedSubject]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const history = messages
      .filter((m) => m.type !== 'error')
      .map((m) => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.content }));

    setMessages((prev) => [...prev, { type: 'user', content: text, timestamp: new Date().toISOString() }]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await getAIResponse(text, history);
      setMessages((prev) => [...prev, { type: 'ai', content: aiResponse, timestamp: new Date().toISOString() }]);
      if (mode === 'question') {
        updateUsage('question');
        recordQuestion(selectedSubject, text);
      } else {
        updateUsage('exam');
        recordExam(selectedSubject, 85);
      }
    } catch {
      setMessages((prev) => [...prev, { type: 'error', content: 'Something went wrong.' }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, mode, messages, canAskQuestion, canGenerateExam, updateUsage, recordQuestion, recordExam, selectedSubject, getAIResponse]);

  return (
    <div className="h-full flex flex-col rounded-xl border border-dark-muted bg-dark-secondary/60 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex flex-wrap items-center gap-2 p-2 sm:p-3 border-b border-dark-muted bg-dark-accent/40">
        <SparklesIcon className="h-4 w-4 text-dark-neon-blue" />
        <span className="text-sm font-medium text-white mr-auto">AI Tutor</span>
        <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="bg-dark-primary border border-dark-muted rounded-md px-2 py-1 text-xs text-white max-w-[120px]">
          {['General', 'Mathematics', 'Science', 'English', 'Biology', 'Chemistry', 'Physics', 'Geography', 'Agriculture'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex rounded-md bg-dark-primary p-0.5 text-xs">
          <button type="button" onClick={() => setMode('question')} className={`px-2 py-1 rounded ${mode === 'question' ? 'bg-dark-neon-blue text-white' : 'text-gray-400'}`}>Ask</button>
          <button type="button" onClick={() => { setMode('exam'); setShowExamFlow(true); }} className={`px-2 py-1 rounded ${mode === 'exam' ? 'bg-dark-neon-purple text-white' : 'text-gray-400'}`}>Exam</button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
        {showExamFlow ? (
          <ExamFlow subject={selectedSubject} onComplete={() => setShowExamFlow(false)} onCancel={() => setShowExamFlow(false)} />
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <p className="text-sm text-white mb-4">{mode === 'question' ? 'Ask a MANEB study question' : 'Describe the practice exam'}</p>
          </div>
        ) : (
          <>
            {messages.map((m, i) => <ChatMessage key={i} message={m.content} isUser={m.type === 'user'} />)}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex-shrink-0 flex gap-2 p-2 sm:p-3 border-t border-dark-muted bg-dark-accent/30">
        <div className="flex-1 relative">
          <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} className="w-full px-3 py-2 bg-dark-primary border-4 border-dark-muted rounded-lg text-sm text-white" disabled={isLoading} />
        </div>
        <button type="submit" disabled={isLoading || !input.trim()} className="btn-primary text-white px-3 py-2 rounded-lg">Send</button>
      </form>
    </div>
  );
}