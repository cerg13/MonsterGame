import React from 'react';

export type StarSize = 'sm' | 'md' | 'lg';

interface StarRatingProps {
  stars: number;
  maxStars?: number;
  size?: StarSize;
  showEmpty?: boolean;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  stars,
  maxStars = 6,
  size = 'md',
  showEmpty = false,
  className = '',
}) => {
  const sizeClass = size !== 'md' ? `star-${size}` : '';

  return (
    <div className={`star-rating ${className}`}>
      {Array.from({ length: maxStars }).map((_, i) => (
        <span
          key={i}
          className={`star ${sizeClass} ${i >= stars ? 'star-empty' : ''}`}
          style={{ display: !showEmpty && i >= stars ? 'none' : undefined }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
