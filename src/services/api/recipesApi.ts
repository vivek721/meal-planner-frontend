import axios from 'axios';
import apiClient from './apiClient';
import type { Recipe, RecipeCategory, RecipeNutrition, RecipePage, RecipeQuery } from '../../types/recipe.types';

export const RECIPES_UNAVAILABLE_MESSAGE = 'Recipes are temporarily unavailable, please try again shortly';
export const NUTRITION_UNAVAILABLE_MESSAGE = 'Nutrition is temporarily unavailable, please try again shortly';

/**
 * A first (uncached) estimate makes many USDA calls on the server, each
 * allowed 15 s, so the shared client's 10 s timeout is too short for it.
 */
export const NUTRITION_TIMEOUT_MS = 30000;
export const RECIPE_NOT_AVAILABLE_MESSAGE = 'This recipe is no longer available';
export const NETWORK_ERROR_MESSAGE = 'Could not reach the server. Check your connection and try again.';
export const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please sign in again.';
export const GENERIC_ERROR_MESSAGE = 'Something went wrong while loading recipes.';
export const NO_CRITERIA_MESSAGE = 'Enter a recipe name or choose a category, cuisine or ingredient.';
export const TOO_LONG_MESSAGE = 'Search terms must be at most 100 characters.';

/** Backend limits (see the API contract in the TheMealDB integration spec). */
export const MAX_SEARCH_LENGTH = 100;
export const DEFAULT_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 50;

export type RecipeErrorKind = 'unavailable' | 'notFound' | 'badRequest' | 'unauthorized' | 'network' | 'unknown';

/** The only error the recipe API rejects with; `message` is ready to show. */
export class RecipeApiError extends Error {
  readonly kind: RecipeErrorKind;
  readonly status?: number;

  constructor(kind: RecipeErrorKind, message: string, status?: number) {
    super(message);
    this.name = 'RecipeApiError';
    this.kind = kind;
    this.status = status;
  }
}

/** Converts anything thrown by a recipe request into a RecipeApiError. */
export function toRecipeApiError(error: unknown): RecipeApiError {
  if (error instanceof RecipeApiError) return error;
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === undefined) return new RecipeApiError('network', NETWORK_ERROR_MESSAGE);
    switch (status) {
      case 503:
        return new RecipeApiError('unavailable', RECIPES_UNAVAILABLE_MESSAGE, status);
      case 404:
        return new RecipeApiError('notFound', RECIPE_NOT_AVAILABLE_MESSAGE, status);
      case 401:
        return new RecipeApiError('unauthorized', SESSION_EXPIRED_MESSAGE, status);
      case 400: {
        const data = error.response?.data as { error?: unknown } | undefined;
        const message = typeof data?.error === 'string' && data.error ? data.error : GENERIC_ERROR_MESSAGE;
        return new RecipeApiError('badRequest', message, status);
      }
      default:
        return new RecipeApiError('unknown', GENERIC_ERROR_MESSAGE, status);
    }
  }
  return new RecipeApiError('unknown', GENERIC_ERROR_MESSAGE);
}

const TEXT_FIELDS = ['q', 'category', 'cuisine', 'ingredient'] as const;

const isPositiveInteger = (value: number | undefined): value is number =>
  value !== undefined && Number.isInteger(value) && value > 0;

/**
 * Cleans a query so the backend never rejects it: trims text, drops blanks,
 * refuses an empty search or a value over 100 characters, and caps limit at 50.
 */
export function buildSearchParams(query: RecipeQuery): RecipeQuery {
  const params: RecipeQuery = {};
  for (const field of TEXT_FIELDS) {
    const value = query[field]?.trim();
    if (!value) continue;
    if (Array.from(value).length > MAX_SEARCH_LENGTH) {
      throw new RecipeApiError('badRequest', TOO_LONG_MESSAGE);
    }
    params[field] = value;
  }
  if (Object.keys(params).length === 0) {
    throw new RecipeApiError('badRequest', NO_CRITERIA_MESSAGE);
  }
  if (isPositiveInteger(query.page)) params.page = query.page;
  if (isPositiveInteger(query.limit)) params.limit = Math.min(query.limit, MAX_PAGE_SIZE);
  return params;
}

// Recipe API service (TheMealDB data, cached by the backend)
class RecipesApi {
  /**
   * Search recipes
   * GET /api/recipes
   */
  async searchRecipes(query: RecipeQuery): Promise<RecipePage> {
    const params = buildSearchParams(query);
    try {
      const response = await apiClient.get<RecipePage>('/api/recipes', { params });
      return response.data;
    } catch (error) {
      throw toRecipeApiError(error);
    }
  }

  /**
   * Get one recipe
   * GET /api/recipes/:id
   */
  async getRecipe(id: string): Promise<Recipe> {
    try {
      const response = await apiClient.get<Recipe>(`/api/recipes/${encodeURIComponent(id)}`);
      return response.data;
    } catch (error) {
      throw toRecipeApiError(error);
    }
  }

  /**
   * Nutrition estimate for one recipe (USDA FoodData Central)
   * GET /api/recipes/:id/nutrition
   */
  async getNutrition(id: string): Promise<RecipeNutrition> {
    try {
      const response = await apiClient.get<RecipeNutrition>(`/api/recipes/${encodeURIComponent(id)}/nutrition`, {
        timeout: NUTRITION_TIMEOUT_MS,
      });
      return response.data;
    } catch (error) {
      // A timeout means the server is still working, not that it is unreachable
      const timedOut = axios.isAxiosError(error) && (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT');
      const mapped = toRecipeApiError(error);
      if (timedOut || mapped.kind === 'unavailable') {
        throw new RecipeApiError('unavailable', NUTRITION_UNAVAILABLE_MESSAGE, mapped.status);
      }
      throw mapped;
    }
  }

  /**
   * List categories
   * GET /api/recipes/categories
   */
  async getCategories(): Promise<RecipeCategory[]> {
    try {
      const response = await apiClient.get<RecipeCategory[]>('/api/recipes/categories');
      return response.data;
    } catch (error) {
      throw toRecipeApiError(error);
    }
  }

  /**
   * List cuisines (sorted)
   * GET /api/recipes/cuisines
   */
  async getCuisines(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>('/api/recipes/cuisines');
      return response.data;
    } catch (error) {
      throw toRecipeApiError(error);
    }
  }
}

export default new RecipesApi();
