import { describe, expect, it } from 'vitest';
import { RecipeApiError } from './api/recipesApi';
import {
  BREAKFAST_REASON,
  MAIN_CATEGORIES,
  SuggestionService,
  VARIETY_REASON,
  chooseCategory,
  pickRandom,
  plannedMeals,
} from './SuggestionService';
import type { MealPlan, RecipePage, RecipeQuery, RecipeSummary } from '../types/recipe.types';

const WEEK = ['2026-09-27', '2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03'];
const nothingPlanned = { ids: new Set<string>(), categories: new Set<string>() };
const first = () => 0;
const last = () => 0.999999;

function planWith(slots: Array<{ id: string; category?: string }>): MealPlan {
  const days: MealPlan['days'] = {};
  slots.forEach((slot, i) => {
    days[WEEK[i]] = {
      dinner: {
        recipeId: slot.id,
        recipeName: `Recipe ${slot.id}`,
        thumbnail: `${slot.id}.jpg`,
        ...(slot.category ? { category: slot.category } : {}),
        addedAt: '2026-09-27T12:00:00.000Z',
      },
    };
  });
  return { userId: 'user-1', weekStartDate: '2026-09-27', days };
}

const summaries = (ids: string[]): RecipeSummary[] =>
  ids.map((id) => ({ id, name: `Recipe ${id}`, thumbnail: `${id}.jpg` }));

function serviceReturning(recipes: RecipeSummary[]) {
  const queries: RecipeQuery[] = [];
  const service = new SuggestionService(async (query) => {
    queries.push(query);
    const page: RecipePage = { recipes, total: recipes.length, page: 1, totalPages: 1 };
    return page;
  });
  return { service, queries };
}

describe('chooseCategory', () => {
  it('suggests breakfast before 11:00', () => {
    expect(chooseCategory(10, nothingPlanned, last)).toEqual({ category: 'Breakfast', reason: BREAKFAST_REASON });
    expect(BREAKFAST_REASON).toBe('Breakfast idea');
  });

  it('picks one of the main categories from 11:00', () => {
    expect(MAIN_CATEGORIES).toEqual(['Chicken', 'Beef', 'Pasta', 'Seafood', 'Vegetarian', 'Lamb', 'Pork']);
    expect(chooseCategory(11, nothingPlanned, first)).toEqual({ category: 'Chicken', reason: 'Chicken idea' });
    expect(chooseCategory(23, nothingPlanned, last)).toEqual({ category: 'Pork', reason: 'Pork idea' });
  });

  it('prefers categories not planned this week', () => {
    const planned = { ids: new Set<string>(), categories: new Set(['Chicken', 'Beef']) };
    expect(chooseCategory(14, planned, first)).toEqual({ category: 'Pasta', reason: VARIETY_REASON });
    expect(VARIETY_REASON).toBe('Something different this week');
  });

  it('falls back to any main category when all are planned', () => {
    const planned = { ids: new Set<string>(), categories: new Set<string>(MAIN_CATEGORIES) };
    expect(chooseCategory(14, planned, first)).toEqual({ category: 'Chicken', reason: 'Chicken idea' });
  });

  it('never indexes past the end, even if random() returns 1', () => {
    expect(chooseCategory(14, nothingPlanned, () => 1).category).toBe('Pork');
  });
});

describe('plannedMeals', () => {
  it('collects ids and known categories (old slots have no category)', () => {
    const planned = plannedMeals(planWith([{ id: '52772', category: 'Chicken' }, { id: 'recipe-001' }]));
    expect([...planned.ids].sort()).toEqual(['52772', 'recipe-001']);
    expect([...planned.categories]).toEqual(['Chicken']);
  });

  it('treats a missing plan as empty', () => {
    expect(plannedMeals(null)).toEqual(nothingPlanned);
  });
});

describe('pickRandom', () => {
  it('returns distinct items, at most `count`', () => {
    expect(pickRandom([1, 2, 3, 4, 5, 6], 4, first)).toEqual([1, 2, 3, 4]);
    expect(pickRandom([1, 2, 3, 4, 5, 6], 4, last)).toEqual([6, 5, 4, 3]);
    expect(pickRandom([1, 2], 4, first)).toEqual([1, 2]);
  });
});

describe('SuggestionService.getSuggestions', () => {
  it('fetches one category (limit 50) and returns 4 unplanned recipes with a reason', async () => {
    const { service, queries } = serviceReturning(summaries(['1', '2', '3', '4', '5', '6']));
    const plan = planWith([{ id: '1', category: 'Chicken' }]);
    const result = await service.getSuggestions(plan, new Date(2026, 8, 30, 14, 0), first);
    expect(queries).toEqual([{ category: 'Beef', limit: 50 }]);
    expect(result.map((s) => s.recipe.id)).toEqual(['2', '3', '4', '5']);
    expect(result.every((s) => s.reason === VARIETY_REASON && s.recipe.category === 'Beef')).toBe(true);
  });

  it('returns fewer when most of the category is already planned', async () => {
    const { service } = serviceReturning(summaries(['1', '2']));
    const result = await service.getSuggestions(
      planWith([{ id: '1', category: 'Breakfast' }]),
      new Date(2026, 8, 30, 8, 0),
      first,
    );
    expect(result).toEqual([
      { recipe: { id: '2', name: 'Recipe 2', thumbnail: '2.jpg', category: 'Breakfast' }, reason: BREAKFAST_REASON },
    ]);
  });

  it('passes API errors through', async () => {
    const service = new SuggestionService(async () => {
      throw new RecipeApiError('unavailable', 'down', 503);
    });
    await expect(service.getSuggestions(null, new Date(2026, 8, 30, 8, 0), first)).rejects.toMatchObject({
      kind: 'unavailable',
    });
  });
});
