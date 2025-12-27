import React from 'react';

interface PanelProps {
  title?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  glow?: boolean;
  className?: string;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  actions,
  footer,
  children,
  glow = false,
  className = '',
}) => {
  return (
    <div className={`panel ${glow ? 'panel-glow' : ''} ${className}`}>
      {(title || actions) && (
        <div className="panel-header">
          {title && <h3 className="panel-title">{title}</h3>}
          {actions && <div className="panel-actions">{actions}</div>}
        </div>
      )}
      <div className="panel-body">{children}</div>
      {footer && <div className="panel-footer">{footer}</div>}
    </div>
  );
};

export default Panel;
