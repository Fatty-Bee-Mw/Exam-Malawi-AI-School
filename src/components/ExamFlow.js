import React, { useState, useEffect, useRef } from 'react';
import { ClockIcon, CheckCircleIcon, XCircleIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import aiService from '../services/aiService';
import ExamMarkingModal from './ExamMarkingModal';

export default function ExamFlow({ subject, conversationHistory, onComplete, onCancel }) {
  const [examQuestions, setExamQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showMarkingModal, setShowMarkingModal] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startExam = async () => {
    setIsLoading(true);
    try {
      // Generate exam questions based on conversation context and student performance
      const response = await fetch('/api/exam/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject,
          num_questions: 5,
          conversation_history: conversationHistory || [],
        }),
      });
      const data = await response.json();
      
      if (data.success) {
        setExamQuestions(data.questions);
        setTimeRemaining(data.time_limit * 60); // Convert to seconds
        setIsStarted(true);
      }
    } catch (error) {
      console.error('Error generating exam:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswerSubmit = () => {
    if (!currentAnswer.trim()) return;
    
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: currentAnswer,
    }));
    
    if (currentQuestionIndex < examQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setCurrentAnswer('');
    } else {
      submitExam();
    }
  };

  const submitExam = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Show marking modal instead of submitting directly
    setShowMarkingModal(true);
  };

  const handleMarkingComplete = (markingResults) => {
    setResults(markingResults);
    setIsCompleted(true);
    setShowMarkingModal(false);
    onComplete(markingResults);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isStarted) {
    return (
      <>
        <div className="p-3 text-center">
          <h3 className="text-base font-bold text-white mb-2">Practice Exam - {subject}</h3>
          <p className="text-xs text-gray-400 mb-3">Questions based on your weak areas.</p>
          <div className="mb-3 p-2 bg-dark-accent rounded-lg">
            <p className="text-xs text-gray-300"><strong>Exam Details:</strong><br />• 5 questions • 10 minutes • Free</p>
          </div>
          <button onClick={startExam} disabled={isLoading} className="px-4 py-2 bg-dark-neon-purple text-white rounded-lg font-semibold hover:bg-dark-neon-purple/80 disabled:opacity-50 text-sm">
            {isLoading ? 'Loading...' : 'Start Exam'}
          </button>
          <button onClick={onCancel} className="ml-2 px-4 py-2 bg-dark-muted text-white rounded-lg font-semibold hover:bg-dark-muted/80 text-sm">
            Cancel
          </button>
        </div>
        <ExamMarkingModal
          isOpen={showMarkingModal}
          onClose={() => setShowMarkingModal(false)}
          questions={examQuestions}
          answers={userAnswers}
          onComplete={handleMarkingComplete}
        />
      </>
    );
  }

  if (isCompleted && results) {
    // Filter incorrect answers to show corrections first
    const incorrectAnswers = results.question_results.filter(qr => !qr.correct);
    
    return (
      <>
        <div className="p-3">
          <h3 className="text-lg font-bold text-white mb-2 text-center">Exam Results</h3>
          <div className="mb-3 p-3 bg-dark-accent rounded-lg text-center">
            <div className="text-3xl font-bold text-dark-neon-green mb-1">{results.score}%</div>
            <div className="text-xs text-gray-300">{results.grade}</div>
          </div>
          
          {/* Show corrections at the top for incorrect answers */}
          {incorrectAnswers.length > 0 && (
            <div className="mb-3 p-3 bg-dark-neon-purple/20 rounded-lg border border-dark-neon-purple/50">
              <h4 className="text-sm font-bold text-white mb-2 flex items-center">
                <LightBulbIcon className="h-4 w-4 text-dark-neon-blue mr-1" />
                Corrections & Improvements
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {incorrectAnswers.map((qr, index) => (
                  <div key={index} className="p-2 bg-dark-primary rounded border border-dark-muted">
                    <p className="text-xs text-dark-neon-blue font-medium mb-1">Q{results.question_results.indexOf(qr) + 1}:</p>
                    <p className="text-xs text-gray-300 mb-1">{qr.correction}</p>
                    {qr.improvement_tip && (
                      <p className="text-xs text-gray-400 italic">💡 {qr.improvement_tip}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Show all questions below */}
          <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
            {results.question_results.map((qr, index) => (
              <div key={index} className="p-2 bg-dark-primary rounded-lg border border-dark-muted">
                <div className="flex items-start justify-between mb-1">
                  <span className="text-xs font-medium text-white">Q{index + 1}</span>
                  {qr.correct ? (
                    <CheckCircleIcon className="h-4 w-4 text-dark-neon-green" />
                  ) : (
                    <XCircleIcon className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <p className="text-xs text-gray-300 mb-1 truncate">{qr.question}</p>
              </div>
            ))}
          </div>
          <button onClick={onCancel} className="w-full px-4 py-2 bg-dark-neon-purple text-white rounded-lg font-semibold hover:bg-dark-neon-purple/80 text-sm">
            Close
          </button>
        </div>
        <ExamMarkingModal
          isOpen={showMarkingModal}
          onClose={() => setShowMarkingModal(false)}
          questions={examQuestions}
          answers={userAnswers}
          onComplete={handleMarkingComplete}
        />
      </>
    );
  }

  const currentQuestion = examQuestions[currentQuestionIndex];

  return (
    <>
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 text-dark-neon-blue mr-1" />
            <span className="text-sm text-white font-semibold">{formatTime(timeRemaining)}</span>
          </div>
          <div className="text-xs text-gray-400">
            Q{currentQuestionIndex + 1}/{examQuestions.length}
          </div>
        </div>
        <div className="mb-2">
          <div className="w-full bg-dark-muted rounded-full h-1">
            <div className="bg-dark-neon-purple h-1 rounded-full transition-all" style={{ width: `${((currentQuestionIndex + 1) / examQuestions.length) * 100}%` }} />
          </div>
        </div>
        <div className="p-3 bg-dark-accent rounded-lg mb-3">
          <p className="text-sm text-white mb-2">{currentQuestion.question}</p>
          {currentQuestion.options && (
            <div className="space-y-1">
              {currentQuestion.options.map((option, index) => (
                <button key={index} onClick={() => setCurrentAnswer(option)} className={`w-full p-2 text-left rounded border text-xs ${
                    currentAnswer === option
                      ? 'border-dark-neon-purple bg-dark-neon-purple/20 text-white'
                      : 'border-dark-muted text-gray-300 hover:border-dark-neon-purple/50'
                  }`}>
                  {option}
                </button>
              ))}
            </div>
          )}
          {!currentQuestion.options && (
            <textarea value={currentAnswer} onChange={(e) => setCurrentAnswer(e.target.value)} placeholder="Type your answer..." className="w-full p-2 bg-dark-primary border border-dark-muted rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-dark-neon-purple text-xs" rows={2} />
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={handleAnswerSubmit} disabled={!currentAnswer.trim() || isLoading} className="flex-1 px-4 py-2 bg-dark-neon-purple text-white rounded-lg font-semibold hover:bg-dark-neon-purple/80 disabled:opacity-50 text-sm">
            {currentQuestionIndex < examQuestions.length - 1 ? 'Next' : 'Submit'}
          </button>
          <button onClick={onCancel} className="px-4 py-2 bg-dark-muted text-white rounded-lg font-semibold hover:bg-dark-muted/80 text-sm">
            Cancel
          </button>
        </div>
      </div>
      <ExamMarkingModal
        isOpen={showMarkingModal}
        onClose={() => setShowMarkingModal(false)}
        questions={examQuestions}
        answers={userAnswers}
        onComplete={handleMarkingComplete}
      />
    </>
  );
}
