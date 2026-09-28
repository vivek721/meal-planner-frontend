import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

vi.mock('./apiClient', () => ({ default: { get: vi.fn() } }));

import apiClient from './apiClient';
import recipesApi, {
  buildSearchParams,
  toRecipeApiError,
  RecipeApiError,
  RECIPES_UNAVAILABLE_MESSAGE,
  RECIPE_NOT_AVAILABLE_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  SESSION_EXPIRED_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  NO_CRITERIA_MESSAGE,
  TOO_LONG_MESSAGE,
} from './recipesApi';

const get = vi.mocked(apiClient.get);

const requestConfig = (): InternalAxiosRequestConfig =>
  ({ headers: new AxiosHeaders() }) as InternalAxiosRequestConfig;

function ok<T>(data: T): AxiosResponse<T> {
  return { data } as AxiosResponse<T>;
}

function httpError(status: number, data: unknown = {}): AxiosError {
  const config = requestConfig();
  const response = { status, statusText: '', data, headers: {}, config } as AxiosResponse;
  return new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_RESPONSE', config, {}, response);
}

function networkError(): AxiosError {
  return new AxiosError('Network Error', 'ERR_NETWORK', requestConfig(), {});
}

async function rejectionOf(promise: Promise<unknown>): Promise<RecipeApiError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof RecipeApiError) return error;
    throw error;
  }
  throw new Error('expected the promise to reject');
}

beforeEach(() => {
  get.mockReset();
});

describe('buildSearchParams', () => {
  it('trims values and drops blank ones', () => {
    expect(buildSearchParams({ q: '  chicken ', category: '', cuisine: '   ', page: 2, limit: 24 })).toEqual({
      q: 'chicken',
      page: 2,
      limit: 24,
    });
  });

  it('caps limit at 50', () => {
    expect(buildSearchParams({ category: 'Beef', limit: 500 })).toEqual({ category: 'Beef', limit: 50 });
  });

  it('ignores a page or limit that is not a positive integer', () => {
    expect(buildSearchParams({ cuisine: 'Thai', page: 0, limit: -1 })).toEqual({ cuisine: 'Thai' });
    expect(buildSearchParams({ cuisine: 'Thai', page: 1.5 })).toEqual({ cuisine: 'Thai' });
  });

  it('refuses a search with no criteria', () => {
    expect(() => buildSearchParams({ q: '  ', page: 1 })).toThrow(NO_CRITERIA_MESSAGE);
  });

  it('accepts 100 characters and refuses 101, counting characters rather than UTF-16 units', () => {
    expect(buildSearchParams({ q: 'a'.repeat(100) }).q).toHaveLength(100);
    expect(buildSearchParams({ q: '🍜'.repeat(100) }).q).toBe('🍜'.repeat(100));
    expect(() => buildSearchParams({ ingredient: 'a'.repeat(101) })).toThrow(TOO_LONG_MESSAGE);
  });
});

describe('toRecipeApiError', () => {
  it('maps 503 to the exact unavailable message', () => {
    const error = toRecipeApiError(httpError(503, { error: 'recipes are temporarily unavailable, please try again shortly' }));
    expect(error).toMatchObject({ kind: 'unavailable', status: 503 });
    expect(error.message).toBe('Recipes are temporarily unavailable, please try again shortly');
    expect(RECIPES_UNAVAILABLE_MESSAGE).toBe('Recipes are temporarily unavailable, please try again shortly');
  });

  it('maps 404 to "no longer available"', () => {
    expect(toRecipeApiError(httpError(404))).toMatchObject({ kind: 'notFound', message: RECIPE_NOT_AVAILABLE_MESSAGE });
    expect(RECIPE_NOT_AVAILABLE_MESSAGE).toBe('This recipe is no longer available');
  });

  it('maps 401 to unauthorized', () => {
    expect(toRecipeApiError(httpError(401))).toMatchObject({ kind: 'unauthorized', message: SESSION_EXPIRED_MESSAGE });
  });

  it('keeps the server message for 400', () => {
    expect(toRecipeApiError(httpError(400, { error: 'invalid recipe id' }))).toMatchObject({
      kind: 'badRequest',
      message: 'invalid recipe id',
    });
  });

  it('maps other statuses to unknown', () => {
    expect(toRecipeApiError(httpError(500))).toMatchObject({ kind: 'unknown', status: 500, message: GENERIC_ERROR_MESSAGE });
  });

  it('maps a request with no response to network', () => {
    expect(toRecipeApiError(networkError())).toMatchObject({ kind: 'network', message: NETWORK_ERROR_MESSAGE });
  });

  it('wraps other errors and passes a RecipeApiError through unchanged', () => {
    expect(toRecipeApiError(new Error('boom'))).toMatchObject({ kind: 'unknown', message: GENERIC_ERROR_MESSAGE });
    const original = new RecipeApiError('notFound', 'gone', 404);
    expect(toRecipeApiError(original)).toBe(original);
  });
});

describe('recipesApi', () => {
  it('searchRecipes sends the cleaned params and returns the page', async () => {
    const page = {
      recipes: [{ id: '52772', name: 'Teriyaki Chicken Casserole', thumbnail: 't.jpg', category: 'Chicken' }],
      total: 1,
      page: 1,
      totalPages: 1,
    };
    get.mockResolvedValueOnce(ok(page));
    await expect(recipesApi.searchRecipes({ q: ' teriyaki ', limit: 24 })).resolves.toEqual(page);
    expect(get).toHaveBeenCalledWith('/api/recipes', { params: { q: 'teriyaki', limit: 24 } });
  });

  it('searchRecipes rejects an empty search without calling the API', async () => {
    const error = await rejectionOf(recipesApi.searchRecipes({ q: '' }));
    expect(error.kind).toBe('badRequest');
    expect(get).not.toHaveBeenCalled();
  });

  it('getRecipe requests the id and maps a 404', async () => {
    get.mockRejectedValueOnce(httpError(404, { error: 'recipe not found' }));
    const error = await rejectionOf(recipesApi.getRecipe('52772'));
    expect(get).toHaveBeenCalledWith('/api/recipes/52772');
    expect(error.kind).toBe('notFound');
  });

  it('getCategories and getCuisines use their endpoints', async () => {
    get.mockResolvedValueOnce(ok([{ name: 'Beef', thumbnail: 'b.png', description: 'Beef dishes' }]));
    get.mockResolvedValueOnce(ok(['British', 'Italian']));
    await expect(recipesApi.getCategories()).resolves.toHaveLength(1);
    await expect(recipesApi.getCuisines()).resolves.toEqual(['British', 'Italian']);
    expect(get).toHaveBeenNthCalledWith(1, '/api/recipes/categories');
    expect(get).toHaveBeenNthCalledWith(2, '/api/recipes/cuisines');
  });

  it('maps a 503 from any call', async () => {
    get.mockRejectedValueOnce(httpError(503));
    expect((await rejectionOf(recipesApi.getCuisines())).kind).toBe('unavailable');
  });
});
