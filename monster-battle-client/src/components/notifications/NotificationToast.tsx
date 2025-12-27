import React, { useEffect, useState } from 'react';
import './NotificationToast.css';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'achievement';
export type NotificationPriority = 'low' | 'medium' | 'high';

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  priority?: NotificationPriority;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationToastProps {
  notification: Notification;
  onClose: (id: string) => void;
}

const ICONS: Record<NotificationType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
  achievement: '🏆',
};

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  const {
    id,
    type,
    title,
    message,
    duration = 4000,
    priority = 'medium',
    icon,
    action,
  } = notification;

  useEffect(() => {
    // Progress bar animation
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
    }, 16);

    // Auto-close timer
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [id, duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300);
  };

  const handleAction = () => {
    if (action?.onClick) {
      action.onClick();
      handleClose();
    }
  };

  return (
    <div
      className={`notification-toast notification-${type} priority-${priority} ${
        isExiting ? 'exiting' : ''
      }`}
      role="alert"
      aria-live={priority === 'high' ? 'assertive' : 'polite'}
    >
      {/* Icon */}
      <div className="notification-icon">
        {icon || ICONS[type]}
      </div>

      {/* Content */}
      <div className="notification-content">
        {title && <div className="notification-title">{title}</div>}
        <div className="notification-message">{message}</div>
      </div>

      {/* Action Button */}
      {action && (
        <button
          className="notification-action"
          onClick={handleAction}
          aria-label={action.label}
        >
          {action.label}
        </button>
      )}

      {/* Close Button */}
      <button
        className="notification-close"
        onClick={handleClose}
        aria-label="Close notification"
      >
        ✕
      </button>

      {/* Progress Bar */}
      <div className="notification-progress">
        <div
          className="notification-progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Particles for Achievement */}
      {type === 'achievement' && (
        <div className="achievement-particles">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="achievement-particle"
              style={{
                '--angle': `${i * 60}deg`,
                '--delay': `${i * 0.1}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationToast;
