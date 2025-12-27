import React from 'react';
import type { Rarity } from '../../types/monster';

export type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  name: string;
  image?: string;
  size?: AvatarSize;
  rarity?: Rarity;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  image,
  size = 'md',
  rarity,
  className = '',
}) => {
  const sizeClass = size !== 'md' ? `avatar-${size}` : '';
  const rarityClass = rarity ? `avatar-rarity-${rarity}` : '';

  // Get initials from name
  const initials = name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className={`avatar ${sizeClass} ${rarityClass} ${className}`}>
      {image ? (
        <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        initials
      )}
    </div>
  );
};

export default Avatar;
