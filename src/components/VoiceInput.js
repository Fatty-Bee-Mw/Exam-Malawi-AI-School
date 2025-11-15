import React, { useState, useRef, useEffect } from 'react';
import { 
  MicrophoneIcon, 
  StopIcon,
  SpeakerWaveIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function VoiceInput({ onTranscript, isLoading, disabled }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    // Check for Web Speech API support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      initializeSpeechRecognition();
    } else {
      setIsSupported(false);
      setError('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // Primary language
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setError('');
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const fullTranscript = finalTranscript || interimTranscript;
      setTranscript(fullTranscript);

      // Send final transcript to parent
      if (finalTranscript && onTranscript) {
        onTranscript(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      
      switch (event.error) {
        case 'no-speech':
          setError('No speech detected. Please try speaking clearly.');
          break;
        case 'audio-capture':
          setError('Microphone access denied. Please allow microphone access.');
          break;
        case 'not-allowed':
          setError('Microphone permission denied. Please enable microphone access.');
          break;
        case 'network':
          setError('Network error. Please check your internet connection.');
          break;
        default:
          setError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  };

  const startRecording = async () => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition not available.');
      return;
    }

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setError('');
      setTranscript('');
      recognitionRef.current.start();
    } catch (err) {
      console.error('Microphone access error:', err);
      setError('Microphone access denied. Please allow microphone access and try again.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center space-x-2 text-gray-400">
        <ExclamationTriangleIcon className="h-5 w-5" />
        <span className="text-sm">Voice input not supported</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      {/* Voice Input Button */}
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleRecording}
          disabled={disabled || isLoading}
          className={`p-2 rounded-lg transition-all duration-200 ${
            isRecording
              ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
              : 'bg-dark-accent hover:bg-dark-muted text-gray-300 hover:text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={isRecording ? 'Stop recording' : 'Start voice input'}
        >
          {isRecording ? (
            <StopIcon className="h-5 w-5" />
          ) : (
            <MicrophoneIcon className="h-5 w-5" />
          )}
        </button>

        {/* Recording Status */}
        {isRecording && (
          <div className="flex items-center space-x-2 text-red-400">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Listening...</span>
          </div>
        )}

        {/* Transcript Preview */}
        {transcript && !isRecording && (
          <div className="flex items-center space-x-2 text-green-400">
            <SpeakerWaveIcon className="h-4 w-4" />
            <span className="text-sm">Transcript ready</span>
          </div>
        )}
      </div>

      {/* Live Transcript */}
      {transcript && (
        <div className="p-3 bg-dark-accent/50 rounded-lg border border-dark-muted">
          <div className="flex items-start space-x-2">
            <SpeakerWaveIcon className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 mb-1">
                {isRecording ? 'Live transcript:' : 'Final transcript:'}
              </p>
              <p className="text-white text-sm">{transcript}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-red-400 mb-1">Voice input error:</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isRecording && !transcript && !error && (
        <div className="text-xs text-gray-500">
          Click the microphone to start voice input. Speak clearly in English.
        </div>
      )}
    </div>
  );
}
