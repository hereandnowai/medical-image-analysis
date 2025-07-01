
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string; // Tailwind color class e.g., text-sky-500
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium', color = 'text-sky-400' }) => {
  const sizeClasses = {
    small: 'w-5 h-5 border-2',
    medium: 'w-8 h-8 border-4',
    large: 'w-12 h-12 border-4',
  };

  return (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} border-t-transparent ${color} border-solid`} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
};
