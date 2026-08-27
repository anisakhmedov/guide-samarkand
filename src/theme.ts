import { PlaceCategory, RouteTheme } from './api/types';

// Signature colour per category/theme — deliberately varied (not all-teal) so the
// guide reads as lively and colourful rather than a flat corporate palette.
export const categoryColor: Record<PlaceCategory, string> = {
  restaurant: 'var(--color-accent)',
  cafe: 'var(--color-gold)',
  attraction: 'var(--color-primary)',
  service: 'var(--color-purple)',
};

export const categoryColorLight: Record<PlaceCategory, string> = {
  restaurant: 'var(--color-accent-light)',
  cafe: 'var(--color-gold-light)',
  attraction: 'var(--color-primary-light)',
  service: 'var(--color-purple-light)',
};

export const categoryColorDark: Record<PlaceCategory, string> = {
  restaurant: 'var(--color-accent-dark)',
  cafe: 'var(--color-gold-dark)',
  attraction: 'var(--color-primary-dark)',
  service: 'var(--color-purple-dark)',
};

export const themeColor: Record<RouteTheme, string> = {
  history: 'var(--color-primary)',
  food: 'var(--color-accent)',
  kids: 'var(--color-pink)',
  evening: 'var(--color-purple)',
  photo: 'var(--color-blue)',
};

export const themeColorLight: Record<RouteTheme, string> = {
  history: 'var(--color-primary-light)',
  food: 'var(--color-accent-light)',
  kids: 'var(--color-pink-light)',
  evening: 'var(--color-purple-light)',
  photo: 'var(--color-blue-light)',
};

export const themeColorDark: Record<RouteTheme, string> = {
  history: 'var(--color-primary-dark)',
  food: 'var(--color-accent-dark)',
  kids: 'var(--color-pink-dark)',
  evening: 'var(--color-purple-dark)',
  photo: 'var(--color-blue-dark)',
};
