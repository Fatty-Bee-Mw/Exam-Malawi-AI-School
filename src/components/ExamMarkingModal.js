import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function ExamMarkingModal({ isOpen, onClose, questions, answers, onComplete }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [markingResults, setMarkingResults] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    if (isOpen && questions && answers) {
      simulateMarking();
    }
  }, [isOpen, questions, answers]);

  const simulateMarking = async () => {
    const results = [];
    
    for (let i = 0; i < questions.length; i++) {
      // Simulate AI marking delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const question = questions[i];
      const answer = answers[i] || '';
      
      // Simulate marking logic (in real app, this would come from backend)
      const isCorrect = Math.random() > 0.4; // 60% chance of correct for demo
      
      results.push({
        question: question.question,
        answer: answer,
        correct: isCorrect,
        feedback: isCorrect 
          ? 'Excellent answer! Well done.' 
          : 'Incorrect. Review the topic and try again.'
      });
      
      setMarkingResults([...results]);
      setCurrentQuestionIndex(i + 1);
    }
    
    // Calculate final score
    const correctCount = results.filter(r => r.correct).length;
    const score = Math.round((correctCount / questions.length) * 100);
    setFinalScore(score);
    setIsComplete(true);
    
    // Notify parent component
    if (onComplete) {
      setTimeout(() => {
        onComplete({
          score,
          question_results: results,
          grade: score >= 70 ? 'A' : score >= 60 ? 'B' : score >= 50 ? 'C' : 'D'
        });
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-secondary rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-dark-muted">
        {/* Header */}
        <div className="sticky top-0 bg-dark-secondary border-b border-dark-muted p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <SparklesIcon className="h-8 w-8 text-dark-neon-blue mr-3 animate-pulse" />
              <div>
                <h2 className="text-2xl font-bold text-white">AI Marking in Progress</h2>
                <p className="text-gray-400 text-sm">
                  {isComplete ? 'Marking Complete!' : `Analyzing Question ${currentQuestionIndex}/${questions?.length || 0}`}
                </p>
              </div>
            </div>
            {!isComplete && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {!isComplete && (
          <div className="px-6 py-4">
            <div className="w-full bg-dark-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-dark-neon-blue to-dark-neon-purple h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentQuestionIndex / (questions?.length || 1)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {!isComplete ? (
            <div className="space-y-4">
              {markingResults.map((result, index) => (
                <div 
                  key={index} 
                  className="p-4 bg-dark-accent rounded-lg border border-dark-muted animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-bold text-white">Q{index + 1}</span>
                    {result.correct ? (
                      <CheckCircleIcon className="h-6 w-6 text-green-500" />
                    ) : (
                      <XCircleIcon className="h-6 w-6 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{result.question}</p>
                  <div className="p-2 bg-dark-primary rounded border-l-4 border-dark-neon-blue">
                    <p className="text-xs text-gray-400 mb-1">Your Answer:</p>
                    <p className="text-sm text-white">{result.answer || 'No answer provided'}</p>
                  </div>
                  <p className={`text-xs mt-2 ${result.correct ? 'text-green-400' : 'text-red-400'}`}>
                    {result.feedback}
                  </p>
                </div>
              ))}
              
              {currentQuestionIndex < (questions?.length || 0) && (
                <div className="p-4 bg-dark-accent/50 rounded-lg border border-dark-muted border-dashed">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-dark-neon-blue mr-3"></div>
                    <p className="text-sm text-gray-400">Analyzing next question...</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mb-6">
                <SparklesIcon className="h-16 w-16 text-dark-neon-green mx-auto animate-bounce" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Marking Complete!</h3>
              
              {/* Final Score - Green color, 75px, bold */}
              <div className="mb-6">
                <div className="text-[75px] font-bold text-green-500 leading-none">
                  {finalScore}%
                </div>
                <p className="text-lg text-gray-400 mt-2">
                  {finalScore >= 70 ? 'Excellent!' : finalScore >= 50 ? 'Good effort!' : 'Keep practicing!'}
                </p>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-dark-accent rounded-lg">
                  <div className="text-2xl font-bold text-green-500">
                    {markingResults.filter(r => r.correct).length}
                  </div>
                  <p className="text-xs text-gray-400">Correct</p>
                </div>
                <div className="p-4 bg-dark-accent rounded-lg">
                  <div className="text-2xl font-bold text-red-500">
                    {markingResults.filter(r => !r.correct).length}
                  </div>
                  <p className="text-xs text-gray-400">Incorrect</p>
                </div>
                <div className="p-4 bg-dark-accent rounded-lg">
                  <div className="text-2xl font-bold text-white">
                    {questions?.length || 0}
                  </div>
                  <p className="text-xs text-gray-400">Total</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-8 py-3 bg-dark-neon-green text-white rounded-lg font-semibold hover:bg-dark-neon-green/80 text-lg"
              >
                View Detailed Results
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
