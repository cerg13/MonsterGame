import React, { createContext, useContext, useState, useCallback } from 'react';
import { NotificationToast } from '../components/notifications/NotificationToast';
import type { Notification, NotificationType, NotificationPriority } from '../components/notifications/NotificationToast';
import './NotificationContext.css';

interface NotificationContextValue {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;

  // Convenience methods
  success: (message: string, options?: NotificationOptions) => string;
  error: (message: string, options?: NotificationOptions) => string;
  warning: (message: string, options?: NotificationOptions) => string;
  info: (message: string, options?: NotificationOptions) => string;
  achievement: (message: string, options?: NotificationOptions) => string;
}

interface NotificationOptions {
  title?: string;
  duration?: number;
  priority?: NotificationPriority;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
  maxNotifications?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxNotifications = 5,
  position = 'top-right',
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id'>): string => {
      const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      setNotifications((prev) => {
        const newNotifications = [
          ...prev,
          { ...notification, id } as Notification,
        ];

        // Limit max notifications
        if (newNotifications.length > maxNotifications) {
          return newNotifications.slice(-maxNotifications);
        }

        return newNotifications;
      });

      return id;
    },
    [maxNotifications]
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const success = useCallback(
    (message: string, options?: NotificationOptions): string => {
      return addNotification({
        type: 'success',
        message,
        ...options,
      });
    },
    [addNotification]
  );

  const error = useCallback(
    (message: string, options?: NotificationOptions): string => {
      return addNotification({
        type: 'error',
        message,
        duration: options?.duration ?? 6000, // Longer for errors
        priority: options?.priority ?? 'high',
        ...options,
      });
    },
    [addNotification]
  );

  const warning = useCallback(
    (message: string, options?: NotificationOptions): string => {
      return addNotification({
        type: 'warning',
        message,
        duration: options?.duration ?? 5000,
        ...options,
      });
    },
    [addNotification]
  );

  const info = useCallback(
    (message: string, options?: NotificationOptions): string => {
      return addNotification({
        type: 'info',
        message,
        ...options,
      });
    },
    [addNotification]
  );

  const achievement = useCallback(
    (message: string, options?: NotificationOptions): string => {
      return addNotification({
        type: 'achievement',
        message,
        duration: options?.duration ?? 6000,
        priority: options?.priority ?? 'high',
        ...options,
      });
    },
    [addNotification]
  );

  const value: NotificationContextValue = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info,
    achievement,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* Notification Container */}
      <div className={`notification-container notification-${position}`}>
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
