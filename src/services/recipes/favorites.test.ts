import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryStorage } from '../../test/memoryStorage';
import { RecipeApiError } from '../api/recipesApi';
import type { Recipe } from '../../types/recipe.types';
import {
  favoritesKey,
  loadFavoriteRecipes,
  migrateFavoriteIds,
  readFavoriteIds,
  toggleFavoriteId,
  writeFavoriteIds,
} from './favorites';

const KEY = favoritesKey('user-1');

const recipe = (id: string): Recipe => ({
  id,
  name: `Recipe ${id}`,
  thumbnail: `${id}.jpg`,
  category: 'Beef',
  cuisine: 'British',
  ingredients: [],
  instructions: [],
  tags: [],
});

beforeEach(() => {
  vi.stubGlobal('localStorage', new MemoryStorage());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('migrateFavoriteIds', () => {
  it('keeps TheMealDB ids in order and drops old mock ids, duplicates and junk', () => {
    expect(migrateFavoriteIds(['recipe-001', '52772', '52772', 52874, null, '52874', ''])).toEqual(['52772', '52874']);
  });

  it('treats anything that is not an array as empty', () => {
    expect(migrateFavoriteIds({ ids: ['52772'] })).toEqual([]);
    expect(migrateFavoriteIds('52772')).toEqual([]);
    expect(migrateFavoriteIds(null)).toEqual([]);
  });
});

describe('readFavoriteIds', () => {
  it('uses the existing key', () => {
    expect(KEY).toBe('user_favorites_user-1');
  });

  it('drops old ids and rewrites storage on first load', () => {
    localStorage.setItem(KEY, JSON.stringify(['recipe-001', '52772', 'recipe-002']));
    expect(readFavoriteIds('user-1')).toEqual(['52772']);
    expect(localStorage.getItem(KEY)).toBe('["52772"]');
  });

  it('survives corrupt JSON', () => {
    localStorage.setItem(KEY, '{not json');
    expect(readFavoriteIds('user-1')).toEqual([]);
    expect(localStorage.getItem(KEY)).toBe('[]');
  });

  it('returns [] without writing when nothing is stored', () => {
    expect(readFavoriteIds('user-1')).toEqual([]);
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('round-trips with writeFavoriteIds', () => {
    writeFavoriteIds('user-1', ['52772', '52874']);
    expect(readFavoriteIds('user-1')).toEqual(['52772', '52874']);
  });
});

describe('toggleFavoriteId', () => {
  it('adds to the end and removes in place', () => {
    expect(toggleFavoriteId(['1', '2'], '3')).toEqual(['1', '2', '3']);
    expect(toggleFavoriteId(['1', '2', '3'], '2')).toEqual(['1', '3']);
  });
});

describe('loadFavoriteRecipes', () => {
  it('loads details in saved order and skips recipes TheMealDB no longer has', async () => {
    const get = vi.fn(async (id: string) => {
      if (id === '99999') throw new RecipeApiError('notFound', 'gone', 404);
      return recipe(id);
    });
    const recipes = await loadFavoriteRecipes(['52874', '99999', '52772'], get);
    expect(recipes.map((r) => r.id)).toEqual(['52874', '52772']);
  });

  it('rejects on any other failure', async () => {
    const get = vi.fn(async () => {
      throw new RecipeApiError('unavailable', 'down', 503);
    });
    await expect(loadFavoriteRecipes(['52772'], get)).rejects.toMatchObject({ kind: 'unavailable' });
  });
});
