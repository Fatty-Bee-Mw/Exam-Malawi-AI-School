import React, { useState } from 'react';
import { 
  DocumentTextIcon, 
  ClipboardDocumentIcon,
  ExclamationTriangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function TextPasteTraining({ onTextSubmit, isLoading, disabled }) {
  const [pastedText, setPastedText] = useState('');
  const [fileName, setFileName] = useState('');
  const [contentType, setContentType] = useState('general');
  const [showPreview, setShowPreview] = useState(false);

  const contentTypes = {
    'general': 'General Educational Content',
    'questions': 'Exam Questions & Answers',
    'pastpaper': 'Past Paper Questions',
    'notes': 'Study Notes & Materials',
    'syllabus': 'Curriculum & Syllabus',
    'textbook': 'Textbook Content'
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    setPastedText(text);
    
    // Auto-detect content type based on text patterns
    if (text.includes('Question') && text.includes('Answer')) {
      setContentType('questions');
    } else if (text.includes('PAST PAPER') || text.includes('EXAMINATION')) {
      setContentType('pastpaper');
    } else if (text.includes('Chapter') || text.includes('Lesson')) {
      setContentType('textbook');
    } else if (text.includes('Syllabus') || text.includes('Curriculum')) {
      setContentType('syllabus');
    }
  };

  const handleSubmit = () => {
    if (!pastedText.trim()) return;

    const textData = {
      name: fileName || `pasted_content_${Date.now()}.txt`,
      content: pastedText,
      contentType: contentType,
      source: 'text_paste',
      size: pastedText.length,
      wordCount: pastedText.split(/\s+/).length,
      timestamp: new Date().toISOString()
    };

    onTextSubmit(textData);
    
    // Clear form after submission
    setPastedText('');
    setFileName('');
    setContentType('general');
    setShowPreview(false);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setPastedText(text);
      handleTextChange({ target: { value: text } });
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      // Fallback: show instruction to paste manually
      alert('Please paste the content manually in the text area below.');
    }
  };

  const getWordCount = () => {
    return pastedText.trim() ? pastedText.split(/\s+/).length : 0;
  };

  const getCharCount = () => {
    return pastedText.length;
  };

  const isValidContent = () => {
    return pastedText.trim().length >= 50; // Minimum 50 characters
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ClipboardDocumentIcon className="h-5 w-5 text-dark-neon-blue" />
          <h3 className="text-lg font-semibold text-white">Paste Training Content</h3>
        </div>
        <button
          onClick={handlePasteFromClipboard}
          className="text-sm bg-dark-accent hover:bg-dark-muted text-gray-300 hover:text-white px-3 py-1 rounded transition-colors"
        >
          📋 Paste from Clipboard
        </button>
      </div>

      {/* Content Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Content Type
          </label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="w-full px-3 py-2 bg-dark-accent border border-dark-muted rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-dark-neon-blue"
            disabled={disabled}
          >
            {Object.entries(contentTypes).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            File Name (Optional)
          </label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="e.g., math_pastpaper_2023.txt"
            className="w-full px-3 py-2 bg-dark-accent border border-dark-muted rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-dark-neon-blue"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Text Area */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Training Content
        </label>
        <textarea
          value={pastedText}
          onChange={handleTextChange}
          placeholder={`Paste your ${contentTypes[contentType].toLowerCase()} here...

Examples:
• Exam questions with answers
• Past paper questions
• Study notes and explanations
• Textbook chapters
• Educational materials

Tip: For best results with past papers, include both questions and answers in a clear format.`}
          className="w-full h-64 px-4 py-3 bg-dark-accent border border-dark-muted rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-dark-neon-blue resize-vertical"
          disabled={disabled}
        />
      </div>

      {/* Content Statistics */}
      {pastedText && (
        <div className="grid grid-cols-3 gap-4 p-3 bg-dark-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-semibold text-white">{getCharCount()}</div>
            <div className="text-xs text-gray-400">Characters</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-white">{getWordCount()}</div>
            <div className="text-xs text-gray-400">Words</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-semibold ${isValidContent() ? 'text-green-400' : 'text-red-400'}`}>
              {isValidContent() ? '✓' : '✗'}
            </div>
            <div className="text-xs text-gray-400">Valid</div>
          </div>
        </div>
      )}

      {/* Content Preview Toggle */}
      {pastedText && (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="text-sm text-dark-neon-blue hover:text-blue-300 transition-colors"
          >
            {showPreview ? '🔼 Hide Preview' : '🔽 Show Preview'}
          </button>
        </div>
      )}

      {/* Content Preview */}
      {showPreview && pastedText && (
        <div className="p-4 bg-dark-accent/50 rounded-lg border border-dark-muted">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Content Preview:</h4>
          <div className="text-sm text-gray-400 max-h-32 overflow-y-auto">
            {pastedText.substring(0, 500)}
            {pastedText.length > 500 && '...'}
          </div>
        </div>
      )}

      {/* Validation Messages */}
      {pastedText && !isValidContent() && (
        <div className="flex items-start space-x-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-yellow-400 text-sm font-medium">Content too short</p>
            <p className="text-yellow-300 text-xs">Please provide at least 50 characters of educational content for effective training.</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center space-x-3">
        <button
          onClick={handleSubmit}
          disabled={!isValidContent() || isLoading || disabled}
          className="flex-1 btn-primary text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          {isLoading ? (
            <>
              <SparklesIcon className="h-5 w-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Add to Training Data
            </>
          )}
        </button>

        {pastedText && (
          <button
            onClick={() => {
              setPastedText('');
              setFileName('');
              setShowPreview(false);
            }}
            className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
            disabled={disabled}
          >
            Clear
          </button>
        )}
      </div>

      {/* Tips */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-start space-x-2">
          <SparklesIcon className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-blue-400 text-sm font-medium">Training Tips:</p>
            <ul className="text-blue-300 text-xs mt-1 space-y-1">
              <li>• For past papers: Include both questions and answers</li>
              <li>• Use clear formatting with question numbers</li>
              <li>• Include subject context and difficulty levels</li>
              <li>• Paste multiple questions at once for better training</li>
              <li>• The AI will learn question styles and answer formats</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
