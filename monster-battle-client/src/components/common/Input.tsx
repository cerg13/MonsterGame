import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  error = false,
  success = false,
  icon,
  className = '',
  ...props
}) => {
  const stateClass = error ? 'input-error' : success ? 'input-success' : '';

  return (
    <div className="input-wrapper" style={{ position: 'relative' }}>
      <input
        className={`input ${stateClass} ${className}`}
        style={icon ? { paddingLeft: '40px' } : undefined}
        {...props}
      />
      {icon && (
        <span
          className="input-icon"
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#666',
          }}
        >
          {icon}
        </span>
      )}
    </div>
  );
};

export default Input;
