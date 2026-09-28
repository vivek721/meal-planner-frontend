import type { MealCategory } from '../types/recipe.types';

// Colour and icon per meal category, so every recipe gets a consistent,
// offline placeholder instead of an unrelated random stock photo.
const CATEGORY_STYLES: Record<MealCategory, { from: string; to: string; emoji: string }> = {
  Breakfast: { from: '#fde68a', to: '#f59e0b', emoji: '🥞' },
  Lunch: { from: '#bbf7d0', to: '#22c55e', emoji: '🥗' },
  Dinner: { from: '#fed7aa', to: '#ea580c', emoji: '🍲' },
  Snack: { from: '#e9d5ff', to: '#a855f7', emoji: '🥨' },
  Dessert: { from: '#fbcfe8', to: '#ec4899', emoji: '🍰' },
};

/** Returns an SVG data URI placeholder image for a recipe (400x300). */
export const recipeThumbnail = (category: MealCategory): string => {
  const { from, to, emoji } = CATEGORY_STYLES[category];
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>` +
    `</linearGradient></defs>` +
    `<rect width="400" height="300" fill="url(#g)"/>` +
    `<text x="200" y="150" font-size="110" text-anchor="middle" dominant-baseline="central">${emoji}</text>` +
    `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
