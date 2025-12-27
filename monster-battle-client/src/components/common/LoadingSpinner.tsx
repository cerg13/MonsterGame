import React from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClass = size !== 'md' ? `loading-spinner-${size}` : '';

  return <div className={`loading-spinner ${sizeClass} ${className}`} />;
};

// Full-screen loading overlay
interface LoadingOverlayProps {
  text?: string;
  isVisible: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  text = 'Loading...',
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div className="loading-overlay">
      <LoadingSpinner size="lg" />
      <span className="loading-text">{text}</span>
    </div>
  );
};

export default LoadingSpinner;
