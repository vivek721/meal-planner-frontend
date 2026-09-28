import type { Recipe } from '../../types/recipe.types';
import { RecipeApiError } from '../api/recipesApi';
import { isRecipeId } from './recipeUtils';

const KEY_PREFIX = 'user_favorites';

/** localStorage key for a user's favourite ids (unchanged from the mock era). */
export const favoritesKey = (userId: string): string => `${KEY_PREFIX}_${userId}`;

/**
 * Keeps TheMealDB ids in saved order and drops everything else: old mock ids
 * ("recipe-001"), duplicates, and anything that is not a string.
 */
export function migrateFavoriteIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const ids: string[] = [];
  for (const value of raw) {
    if (isRecipeId(value) && !ids.includes(value)) ids.push(value);
  }
  return ids;
}

/**
 * Reads a user's favourite ids. Old or corrupt data is cleaned up and written
 * back the first time favourites load.
 */
export function readFavoriteIds(userId: string): string[] {
  const key = favoritesKey(userId);
  const stored = localStorage.getItem(key);
  if (stored === null) return [];

  let parsed: unknown = null;
  try {
    parsed = JSON.parse(stored);
  } catch {
    parsed = null;
  }
  const ids = migrateFavoriteIds(parsed);
  const normalized = JSON.stringify(ids);
  if (normalized !== stored) localStorage.setItem(key, normalized);
  return ids;
}

export function writeFavoriteIds(userId: string, ids: string[]): void {
  localStorage.setItem(favoritesKey(userId), JSON.stringify(ids));
}

/** Adds the id at the end, or removes it if present. */
export function toggleFavoriteId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((existing) => existing !== id) : [...ids, id];
}

/**
 * Loads each favourite's details, in saved order. A recipe TheMealDB no longer
 * has (404) is skipped; any other failure rejects so the page can offer Retry.
 */
export async function loadFavoriteRecipes(
  ids: string[],
  getRecipe: (id: string) => Promise<Recipe>,
): Promise<Recipe[]> {
  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        return await getRecipe(id);
      } catch (error) {
        if (error instanceof RecipeApiError && error.kind === 'notFound') return null;
        throw error;
      }
    }),
  );
  return results.filter((recipe): recipe is Recipe => recipe !== null);
}
