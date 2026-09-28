import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryStorage } from '../test/memoryStorage';
import MealPlanService from './MealPlanService';
import type { MealPlan } from '../types/recipe.types';

const USER = 'user-1';
const WEEK_KEY = `mealPlans_${USER}_2026-09-27`; // the Sunday that starts the week of 30 Sept 2026

const TERIYAKI = {
  id: '52772',
  name: 'Teriyaki Chicken Casserole',
  thumbnail: 'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg',
  category: 'Chicken',
  cuisine: 'Japanese',
};

const LEGACY_PLAN = {
  userId: USER,
  weekStartDate: '2026-09-27',
  days: {
    '2026-09-28': {
      breakfast: {
        recipeId: 'recipe-001',
        recipeName: 'Classic Avocado Toast',
        thumbnail: 'data:image/svg+xml;charset=utf-8,%3Csvg%2F%3E',
        prepTime: 10,
        addedAt: '2026-09-28T08:00:00.000Z',
      },
    },
  },
};

beforeEach(() => {
  vi.stubGlobal('localStorage', new MemoryStorage());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('MealPlanService.addMeal', () => {
  it('stores the summary fields on the slot, with no lookup and no time', () => {
    const plan = MealPlanService.addMeal(USER, '2026-09-30', 'dinner', TERIYAKI);
    expect(plan?.days['2026-09-30'].dinner).toEqual({
      recipeId: '52772',
      recipeName: 'Teriyaki Chicken Casserole',
      thumbnail: TERIYAKI.thumbnail,
      category: 'Chicken',
      addedAt: expect.any(String),
    });
    const stored = JSON.parse(localStorage.getItem(WEEK_KEY) ?? 'null') as MealPlan;
    expect(stored.days['2026-09-30'].dinner?.recipeId).toBe('52772');
  });

  it('leaves category out when the summary has none', () => {
    const plan = MealPlanService.addMeal(USER, '2026-09-30', 'lunch', {
      id: '52795',
      name: 'Chicken Handi',
      thumbnail: 'https://www.themealdb.com/images/media/meals/wyxwsp1486979827.jpg',
    });
    expect(plan?.days['2026-09-30'].lunch).not.toHaveProperty('category');
    expect(plan?.days['2026-09-30'].lunch?.recipeName).toBe('Chicken Handi');
  });
});

describe('slots saved before TheMealDB', () => {
  it('are read back unchanged', () => {
    localStorage.setItem(WEEK_KEY, JSON.stringify(LEGACY_PLAN));
    const plan = MealPlanService.getMealPlan(USER, new Date(2026, 8, 30));
    expect(plan?.days['2026-09-28'].breakfast).toMatchObject({
      recipeId: 'recipe-001',
      recipeName: 'Classic Avocado Toast',
    });
  });

  it('can still be copied to other days', () => {
    localStorage.setItem(WEEK_KEY, JSON.stringify(LEGACY_PLAN));
    const plan = MealPlanService.copyDay(USER, '2026-09-28', ['2026-09-29']);
    expect(plan?.days['2026-09-29'].breakfast).toMatchObject({
      recipeId: 'recipe-001',
      recipeName: 'Classic Avocado Toast',
    });
  });
});
