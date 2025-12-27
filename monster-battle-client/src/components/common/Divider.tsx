import React from 'react';

interface DividerProps {
  vertical?: boolean;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  vertical = false,
  className = '',
}) => {
  return (
    <div className={`${vertical ? 'divider-vertical' : 'divider'} ${className}`} />
  );
};

export default Divider;
