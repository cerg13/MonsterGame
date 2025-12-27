import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import './NotificationDemo.css';

export const NotificationDemo: React.FC = () => {
  const navigate = useNavigate();
  const { success, error, warning, info, achievement } = useNotification();

  const showSuccessExample = () => {
    success('Monster successfully summoned!', {
      title: 'Success',
      duration: 4000,
    });
  };

  const showErrorExample = () => {
    error('Not enough crystals!', {
      title: 'Error',
      duration: 6000,
      priority: 'high',
    });
  };

  const showWarningExample = () => {
    warning('Energy is running low', {
      title: 'Warning',
      duration: 5000,
    });
  };

  const showInfoExample = () => {
    info('Guild war starts in 10 minutes', {
      title: 'Info',
      duration: 4000,
    });
  };

  const showAchievementExample = () => {
    achievement('First Victory! You won your first battle.', {
      title: '🏆 Achievement Unlocked',
      duration: 6000,
      priority: 'high',
      action: {
        label: 'View',
        onClick: () => {
          console.log('Navigate to achievements');
          navigate('/achievements');
        },
      },
    });
  };

  const showMultipleNotifications = () => {
    success('Monster +1 level', { title: 'Level Up' });
    setTimeout(() => success('Monster +1 level', { title: 'Level Up' }), 200);
    setTimeout(() => success('Monster +1 level', { title: 'Level Up' }), 400);
    setTimeout(() => achievement('Reached Level 10!', {
      title: '🏆 Achievement',
      priority: 'high',
    }), 600);
  };

  const showBattleNotifications = () => {
    info('Battle started', { duration: 2000 });
    setTimeout(() => info('Critical hit! 1,337 damage', { duration: 2000 }), 1000);
    setTimeout(() => warning('Low HP!', { title: 'Warning', duration: 2000 }), 2000);
    setTimeout(() => success('Victory!', { title: 'Battle Won', duration: 3000 }), 3000);
  };

  const showGachaNotifications = () => {
    info('Summoning...', { duration: 2000 });
    setTimeout(() => {
      const isSSR = Math.random() > 0.9;
      if (isSSR) {
        achievement('SSR Monster! Fire Dragon obtained!', {
          title: '⭐⭐⭐ SSR PULL',
          duration: 8000,
          priority: 'high',
          action: {
            label: 'View Monster',
            onClick: () => console.log('View monster'),
          },
        });
      } else {
        success('Rare Monster obtained', { duration: 3000 });
      }
    }, 2000);
  };

  return (
    <div className="notification-demo">
      <div className="demo-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1>Notification System Demo</h1>
        <p>Test различных типов уведомлений</p>
      </div>

      <div className="demo-content">
        <section className="demo-section">
          <h2>Basic Types</h2>
          <div className="demo-buttons">
            <button className="demo-btn btn-success" onClick={showSuccessExample}>
              ✓ Success
            </button>
            <button className="demo-btn btn-error" onClick={showErrorExample}>
              ✕ Error
            </button>
            <button className="demo-btn btn-warning" onClick={showWarningExample}>
              ⚠ Warning
            </button>
            <button className="demo-btn btn-info" onClick={showInfoExample}>
              ℹ Info
            </button>
            <button className="demo-btn btn-achievement" onClick={showAchievementExample}>
              🏆 Achievement
            </button>
          </div>
        </section>

        <section className="demo-section">
          <h2>Scenarios</h2>
          <div className="demo-buttons">
            <button className="demo-btn btn-scenario" onClick={showMultipleNotifications}>
              Multiple Notifications
            </button>
            <button className="demo-btn btn-scenario" onClick={showBattleNotifications}>
              Battle Sequence
            </button>
            <button className="demo-btn btn-scenario" onClick={showGachaNotifications}>
              Gacha Pull
            </button>
          </div>
        </section>

        <section className="demo-section">
          <h2>Features</h2>
          <ul className="feature-list">
            <li>✓ 5 notification types (success, error, warning, info, achievement)</li>
            <li>✓ Auto-dismiss с прогресс баром</li>
            <li>✓ Manual close кнопка</li>
            <li>✓ Action buttons опционально</li>
            <li>✓ Priority levels (low, medium, high)</li>
            <li>✓ Custom icons</li>
            <li>✓ Achievement particles эффект</li>
            <li>✓ Type-specific animations</li>
            <li>✓ Responsive design</li>
            <li>✓ Accessibility support (ARIA)</li>
            <li>✓ Reduced motion support</li>
          </ul>
        </section>

        <section className="demo-section">
          <h2>Usage Example</h2>
          <pre className="code-block">{`import { useNotification } from '../contexts/NotificationContext';

function MyComponent() {
  const { success, error, achievement } = useNotification();

  const handleAction = () => {
    success('Action completed!', {
      title: 'Success',
      duration: 4000,
    });
  };

  const handleAchievement = () => {
    achievement('First Victory!', {
      title: '🏆 Achievement Unlocked',
      priority: 'high',
      action: {
        label: 'View',
        onClick: () => navigate('/achievements'),
      },
    });
  };

  return <button onClick={handleAction}>Do Something</button>;
}`}</pre>
        </section>
      </div>
    </div>
  );
};

export default NotificationDemo;
