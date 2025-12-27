import type { Element } from '../types/monster';

export function getElementGradient(element: Element): string {
  const gradients: Record<Element, string> = {
    fire: 'linear-gradient(135deg, #fc5c65 0%, #fd9644 100%)',
    water: 'linear-gradient(135deg, #45aaf2 0%, #48dbfb 100%)',
    wind: 'linear-gradient(135deg, #26de81 0%, #20bf6b 100%)',
    light: 'linear-gradient(135deg, #fed330 0%, #f7b731 100%)',
    dark: 'linear-gradient(135deg, #a55eea 0%, #8854d0 100%)',
  };
  return gradients[element];
}

export function getElementColor(element: Element): string {
  const colors: Record<Element, string> = {
    fire: '#fc5c65',
    water: '#48dbfb',
    wind: '#26de81',
    light: '#fed330',
    dark: '#a55eea',
  };
  return colors[element];
}

export function getElementGlow(element: Element): string {
  const glows: Record<Element, string> = {
    fire: 'rgba(252, 92, 101, 0.5)',
    water: 'rgba(72, 219, 251, 0.5)',
    wind: 'rgba(38, 222, 129, 0.5)',
    light: 'rgba(254, 211, 48, 0.5)',
    dark: 'rgba(165, 94, 234, 0.5)',
  };
  return glows[element];
}

export function getRarityGradient(rarity: 'common' | 'rare' | 'sr' | 'ssr'): string {
  const gradients = {
    common: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
    rare: 'linear-gradient(135deg, #48dbfb 0%, #0abde3 100%)',
    sr: 'linear-gradient(135deg, #a55eea 0%, #8854d0 100%)',
    ssr: 'linear-gradient(135deg, #fed330 0%, #f79f1f 100%)',
  };
  return gradients[rarity];
}

export function getRarityColor(rarity: 'common' | 'rare' | 'sr' | 'ssr'): string {
  const colors = {
    common: '#95a5a6',
    rare: '#48dbfb',
    sr: '#a55eea',
    ssr: '#fed330',
  };
  return colors[rarity];
}
