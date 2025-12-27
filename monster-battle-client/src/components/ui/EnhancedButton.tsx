import React from 'react';
import './EnhancedButton.css';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  glow?: boolean;
  shimmer?: boolean;
  children: React.ReactNode;
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  variant = 'primary',
  size = 'md',
  glow = false,
  shimmer = false,
  children,
  className = '',
  disabled = false,
  ...props
}) => {
  const classes = [
    'btn-premium',
    `btn-${variant}`,
    `btn-${size}`,
    glow ? 'btn-glow' : '',
    shimmer ? 'shimmer' : '',
    disabled ? 'btn-disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={disabled} {...props}>
      <span className="btn-content">{children}</span>
    </button>
  );
};

export default EnhancedButton;
