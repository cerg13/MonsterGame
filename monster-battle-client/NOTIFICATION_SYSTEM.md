# Notification System - Toast Notifications

Modern toast notification system для Monster Battle game с полной поддержкой различных типов уведомлений, анимаций и accessibility.

## Overview

Система нотификаций предоставляет:
- 5 типов уведомлений (success, error, warning, info, achievement)
- Auto-dismiss с progress bar
- Manual close
- Action buttons
- Priority levels
- Custom icons
- Анимированные эффекты (включая particles для achievements)
- Полная поддержка accessibility
- Responsive design
- Reduced motion support

---

## Components

### 1. NotificationToast

**Location**: `src/components/notifications/NotificationToast.tsx`

Компонент отдельного toast уведомления.

#### Props

```typescript
interface Notification {
  id: string;
  type: NotificationType;              // 'success' | 'error' | 'warning' | 'info' | 'achievement'
  title?: string;                       // Опциональный заголовок
  message: string;                      // Основное сообщение
  duration?: number;                    // Время показа (default: 4000ms)
  priority?: NotificationPriority;      // 'low' | 'medium' | 'high'
  icon?: string;                        // Custom icon (default: type-specific)
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

#### Features

**Visual Elements**:
- Иконка с pop animation
- Заголовок и сообщение
- Action button (опционально)
- Close button
- Progress bar показывает оставшееся время
- Achievement particles (только для type='achievement')

**Animations**:
- Slide in with bounce (entrance)
- Slide out (exit)
- Icon pop animation
- Type-specific effects (shake для error, pulse для warning, glow для achievement)

---

### 2. NotificationProvider

**Location**: `src/contexts/NotificationContext.tsx`

Context provider для управления нотификациями.

#### Props

```typescript
interface NotificationProviderProps {
  children: React.ReactNode;
  maxNotifications?: number;            // Max одновременных (default: 5)
  position?:                            // Позиция на экране
    | 'top-right'                       // Default
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
}
```

#### Context API

```typescript
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
```

---

## Usage

### 1. Setup

Оберните приложение в `NotificationProvider`:

```tsx
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  return (
    <NotificationProvider position="top-right" maxNotifications={5}>
      {/* Your app content */}
    </NotificationProvider>
  );
}
```

### 2. Basic Usage

Используйте `useNotification` hook:

```tsx
import { useNotification } from './contexts/NotificationContext';

function MyComponent() {
  const { success, error, warning, info, achievement } = useNotification();

  const handleSuccess = () => {
    success('Operation completed successfully!', {
      title: 'Success',
      duration: 4000,
    });
  };

  const handleError = () => {
    error('Something went wrong!', {
      title: 'Error',
      duration: 6000,
      priority: 'high',
    });
  };

  return (
    <div>
      <button onClick={handleSuccess}>Success</button>
      <button onClick={handleError}>Error</button>
    </div>
  );
}
```

### 3. Achievement Notifications

С action button и particles:

```tsx
const handleAchievement = () => {
  achievement('First Victory! You won your first battle.', {
    title: '🏆 Achievement Unlocked',
    duration: 6000,
    priority: 'high',
    action: {
      label: 'View',
      onClick: () => {
        navigate('/achievements');
      },
    },
  });
};
```

### 4. Custom Notifications

С custom icon:

```tsx
const { addNotification } = useNotification();

addNotification({
  type: 'info',
  message: 'Energy restored to full!',
  title: 'Energy',
  icon: '⚡',
  duration: 3000,
});
```

---

## Examples by Use Case

### Battle Events

```tsx
// Battle start
info('Battle started!', { duration: 2000 });

// Critical hit
info('Critical hit! 1,337 damage', { duration: 2000 });

// Low HP warning
warning('Low HP!', { title: 'Warning', duration: 2000 });

// Victory
success('Victory!', { title: 'Battle Won', duration: 3000 });

// Defeat
error('Defeat...', { title: 'Battle Lost', duration: 3000 });
```

### Gacha Pull

```tsx
// Start pulling
info('Summoning...', { duration: 2000 });

// SSR pull
setTimeout(() => {
  achievement('SSR Monster! Fire Dragon obtained!', {
    title: '⭐⭐⭐ SSR PULL',
    duration: 8000,
    priority: 'high',
    action: {
      label: 'View Monster',
      onClick: () => navigate('/monsters'),
    },
  });
}, 2000);
```

### Resource Notifications

```tsx
// Not enough resources
error('Not enough crystals!', {
  title: 'Error',
  priority: 'high',
  action: {
    label: 'Buy Crystals',
    onClick: () => navigate('/shop'),
  },
});

// Energy refill
success('Energy refilled to 120!', {
  title: 'Energy',
  icon: '⚡',
});
```

### Monster Leveling

```tsx
// Level up sequence
success('Monster +1 level', { title: 'Level Up', duration: 2000 });
success('Monster +1 level', { title: 'Level Up', duration: 2000 });
success('Monster +1 level', { title: 'Level Up', duration: 2000 });

// Achievement at milestone
achievement('Reached Level 10!', {
  title: '🏆 Achievement',
  priority: 'high',
});
```

### Guild & Social

```tsx
// Guild war reminder
warning('Guild war starts in 10 minutes!', {
  title: 'Guild War',
  duration: 5000,
  action: {
    label: 'Prepare Team',
    onClick: () => navigate('/guild-war'),
  },
});

// Friend request
info('New friend request from Player123', {
  title: 'Friends',
  action: {
    label: 'View',
    onClick: () => navigate('/friends'),
  },
});
```

---

## Notification Types

### Success
- **Color**: Green (#26de81)
- **Icon**: ✓
- **Duration**: 4000ms
- **Use**: Successful actions, completions, positive events
- **Animation**: Smooth pop-in

### Error
- **Color**: Red (#fc5c65)
- **Icon**: ✕
- **Duration**: 6000ms (longer)
- **Priority**: High (default)
- **Use**: Errors, failures, critical issues
- **Animation**: Shake effect

### Warning
- **Color**: Yellow (#fdcb6e)
- **Icon**: ⚠
- **Duration**: 5000ms
- **Use**: Warnings, low resources, reminders
- **Animation**: Pulsing icon

### Info
- **Color**: Cyan (#48dbfb)
- **Icon**: ℹ
- **Duration**: 4000ms
- **Use**: General information, updates, tips
- **Animation**: Standard pop-in

### Achievement
- **Color**: Gold (#fed330)
- **Icon**: 🏆
- **Duration**: 6000ms (longer for celebration)
- **Priority**: High (default)
- **Use**: Unlocked achievements, milestones, special events
- **Animation**: Glow effect + particle burst

---

## Priority Levels

### Low
- **Opacity**: 0.9
- **Use**: Minor notifications, background info

### Medium (Default)
- **Standard styling**
- **Use**: Most notifications

### High
- **Enhanced border** (2px)
- **Stronger shadow**
- **ARIA**: assertive
- **Use**: Important messages, errors, achievements

---

## Position Options

```tsx
<NotificationProvider position="top-right">    {/* Default */}
<NotificationProvider position="top-left">
<NotificationProvider position="bottom-right">
<NotificationProvider position="bottom-left">
<NotificationProvider position="top-center">
<NotificationProvider position="bottom-center">
```

**Recommendation**: `top-right` для desktop, `top-center` для mobile

---

## Accessibility

### ARIA Attributes
- `role="alert"` на каждом toast
- `aria-live="polite"` для low/medium priority
- `aria-live="assertive"` для high priority
- `aria-label` на action и close кнопках

### Keyboard Support
- Кнопки доступны через Tab navigation
- Enter/Space для активации

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  /* Все анимации отключены */
  /* Toasts появляются мгновенно */
}
```

---

## Styling Customization

### CSS Variables

Используйте CSS variables для кастомизации:

```css
:root {
  /* Glass morphism */
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.1);

  /* Colors - override per type in notification CSS */
}
```

### Custom Animations

Добавьте свои keyframes в `NotificationToast.css`:

```css
@keyframes myCustomAnimation {
  /* Your animation */
}

.notification-toast.my-custom-type {
  animation: myCustomAnimation 0.4s ease;
}
```

---

## Performance

### Optimizations
- Auto-cleanup после dismiss
- Limit max notifications (default: 5)
- Efficient CSS animations (transform + opacity)
- RequestAnimationFrame для progress bar
- No re-renders на каждый tick

### Memory Management
- Toasts auto-removed from state после animation
- Event listeners cleaned up в useEffect
- Timers cleared on unmount

---

## Testing

### Demo Page

Navigate to `/notification-demo` для интерактивного тестирования:

```
http://localhost:5173/notification-demo
```

**Features**:
- Test всех типов notifications
- Scenario testing (battle, gacha, etc.)
- Code examples
- Feature list

---

## Future Enhancements

Planned improvements:
1. **Sound effects** - Audio feedback per type
2. **Custom templates** - Pre-defined templates для common scenarios
3. **Persistent notifications** - For critical messages
4. **Notification center** - History view
5. **Grouping** - Stack similar notifications
6. **Rich content** - Images, progress bars в notifications
7. **Swipe to dismiss** - Mobile gesture support

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Fallbacks**:
- No backdrop-filter → solid background
- No animations → instant display (reduced-motion)
- No CSS Grid → Flexbox fallback

---

## Integration Checklist

- [x] NotificationToast component
- [x] NotificationProvider context
- [x] useNotification hook
- [x] 5 notification types
- [x] Achievement particles
- [x] Progress bar
- [x] Action buttons
- [x] Priority levels
- [x] Position variants
- [x] Accessibility (ARIA)
- [x] Reduced motion
- [x] Responsive design
- [x] Demo page
- [ ] Integration в real screens (Battle, Gacha, etc.)
- [ ] Sound effects
- [ ] Notification history

---

Last Updated: 2025-12-27
Version: 1.0.0
