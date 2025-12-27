import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconOnly?: boolean;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconOnly = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClass = size !== 'md' ? `btn-${size}` : '';
  const iconOnlyClass = iconOnly ? 'btn-icon' : '';
  const loadingClass = loading ? 'btn-loading' : '';

  return (
    <button
      className={`btn btn-${variant} ${sizeClass} ${iconOnlyClass} ${loadingClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="btn-spinner" />}
      {icon && <span className="btn-icon-element">{icon}</span>}
      {children && <span className="btn-text">{children}</span>}
    </button>
  );
};

export default Button;
