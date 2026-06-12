import React, { memo } from 'react';

const ChatMessage = memo(function ChatMessage({ message, isUser, timestamp, isError = false }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[90%] sm:max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
          isError
            ? 'bg-red-500/10 border border-red-500/30 text-red-300'
            : isUser
            ? 'bg-dark-neon-blue text-white rounded-br-sm'
            : 'bg-dark-accent text-gray-100 rounded-bl-sm border border-dark-muted'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message}</p>
        {timestamp && (
          <p className={`text-[10px] mt-1 ${isUser ? 'text-blue-100/70' : 'text-gray-500'}`}>
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
});

export default ChatMessage;
