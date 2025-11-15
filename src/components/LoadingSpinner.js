import React from 'react';

export default function LoadingSpinner({ size = 'md', text = 'Loading...', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-dark-neon-blue ${sizeClasses[size]}`}></div>
      {text && (
        <p className="mt-4 text-gray-400 text-sm animate-pulse">{text}</p>
      )}
    </div>
  );
}

export function InlineSpinner({ size = 'sm', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`animate-spin rounded-full border-t-2 border-b-2 border-dark-neon-blue ${sizeClasses[size]} ${className}`}></div>
  );
}
