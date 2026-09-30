import recipesApi from '../api/recipesApi';
import type { Recipe, RecipeCategory, RecipeNutrition } from '../../types/recipe.types';
import { createAsyncCache } from './asyncCache';

// In-memory, per-session caches: each recipe, its nutrition estimate, and the
// category and cuisine lists are fetched at most once until the page reloads.
const details = createAsyncCache((id: string) => recipesApi.getRecipe(id));
const nutrition = createAsyncCache((id: string) => recipesApi.getNutrition(id));
const categories = createAsyncCache((_key: 'all') => recipesApi.getCategories());
const cuisines = createAsyncCache((_key: 'all') => recipesApi.getCuisines());

/** Recipe detail by TheMealDB id, cached for the session. */
export const getRecipe = (id: string): Promise<Recipe> => details.get(id);

/** USDA nutrition estimate by TheMealDB id, cached for the session. */
export const getNutrition = (id: string): Promise<RecipeNutrition> => nutrition.get(id);

/** All categories, cached for the session. */
export const loadCategories = (): Promise<RecipeCategory[]> => categories.get('all');

/** All cuisines (sorted), cached for the session. */
export const loadCuisines = (): Promise<string[]> => cuisines.get('all');
