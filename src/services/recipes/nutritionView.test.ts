import { describe, expect, it } from 'vitest';
import type { RecipeNutrition } from '../../types/recipe.types';
import { toNutritionView } from './nutritionView';

function estimate(overrides: Partial<RecipeNutrition> = {}): RecipeNutrition {
  return {
    recipeId: '52772',
    source: 'USDA FoodData Central',
    totals: { calories: 1846, protein: 122.2, carbohydrate: 294.5, fat: 17.9, fiber: 25.3, sugars: 55.6, sodium: 10908 },
    coverage: { counted: 9, total: 9 },
    ingredients: [],
    ...overrides,
  };
}

describe('toNutritionView', () => {
  it('formats calories, grams and sodium in their units', () => {
    const view = toNutritionView(estimate());
    expect(view.calories).toBe('1,846 kcal');
    expect(view.nutrients).toEqual([
      { key: 'protein', label: 'Protein', value: '122.2 g' },
      { key: 'carbohydrate', label: 'Carbs', value: '294.5 g' },
      { key: 'fat', label: 'Fat', value: '17.9 g' },
      { key: 'fiber', label: 'Fibre', value: '25.3 g' },
      { key: 'sugars', label: 'Sugars', value: '55.6 g' },
      { key: 'sodium', label: 'Sodium', value: '10,908 mg' },
    ]);
  });

  it('keeps one decimal on whole-gram totals', () => {
    const view = toNutritionView(estimate({ totals: { ...estimate().totals, fat: 18 } }));
    expect(view.nutrients.find((n) => n.key === 'fat')?.value).toBe('18.0 g');
  });

  it('marks incomplete nutrients as a lower bound', () => {
    const view = toNutritionView(estimate({ incomplete: ['sugars', 'calories'] }));
    expect(view.calories).toBe('at least 1,846 kcal');
    expect(view.nutrients.find((n) => n.key === 'sugars')?.value).toBe('at least 55.6 g');
    expect(view.nutrients.find((n) => n.key === 'protein')?.value).toBe('122.2 g');
  });

  it('describes coverage, with a singular for one ingredient', () => {
    expect(toNutritionView(estimate()).coverage).toBe('Based on 9 of 9 ingredients');
    expect(toNutritionView(estimate({ coverage: { counted: 1, total: 1 } })).coverage).toBe('Based on 1 of 1 ingredient');
  });

  it('is partial only when fewer than half the ingredients were counted', () => {
    expect(toNutritionView(estimate({ coverage: { counted: 3, total: 7 } })).partial).toBe(true);
    expect(toNutritionView(estimate({ coverage: { counted: 2, total: 4 } })).partial).toBe(false);
    expect(toNutritionView(estimate({ coverage: { counted: 9, total: 9 } })).partial).toBe(false);
  });

  it('is none, and not partial, when nothing was counted', () => {
    const view = toNutritionView(estimate({ coverage: { counted: 0, total: 3 } }));
    expect(view.none).toBe(true);
    expect(view.partial).toBe(false);
    expect(toNutritionView(estimate()).none).toBe(false);
  });

  it('describes a counted line with its food, grams and calories, including 0 kcal', () => {
    const view = toNutritionView(
      estimate({
        ingredients: [
          {
            name: 'water',
            measure: '1/2 cup',
            status: 'counted',
            grams: 118.5,
            food: { fdcId: 174158, description: 'Water, bottled, generic' },
            calories: 0,
          },
          {
            name: 'chicken breasts',
            measure: '2',
            status: 'counted',
            grams: 348,
            food: { fdcId: 171077, description: 'Chicken breast, raw' },
            calories: 418,
          },
        ],
      }),
    );
    expect(view.lines).toEqual([
      { name: 'water', measure: '1/2 cup', counted: true, detail: 'Water, bottled, generic · 118.5 g · 0 kcal' },
      { name: 'chicken breasts', measure: '2', counted: true, detail: 'Chicken breast, raw · 348 g · 418 kcal' },
    ]);
  });

  it('leaves calories out of a counted line when USDA reported no energy', () => {
    const view = toNutritionView(
      estimate({
        ingredients: [
          { name: 'mystery', measure: '100g', status: 'counted', grams: 100, food: { fdcId: 9, description: 'Mystery, raw' } },
        ],
      }),
    );
    expect(view.lines[0].detail).toBe('Mystery, raw · 100 g');
  });

  it('explains each not-counted reason in plain English', () => {
    const view = toNutritionView(
      estimate({
        ingredients: [
          { name: 'salt', measure: 'pinch', status: 'notCounted', reason: 'unmeasurable' },
          { name: 'garam masala', measure: '1 tsp', status: 'notCounted', reason: 'noPortion' },
          { name: 'unicorn dust', measure: '2', status: 'notCounted', reason: 'noMatch' },
        ],
      }),
    );
    expect(view.lines.map((l) => [l.counted, l.detail])).toEqual([
      [false, 'Not counted: the amount can’t be measured'],
      [false, 'Not counted: USDA data has no weight for this measure'],
      [false, 'Not counted: no matching food in USDA data'],
    ]);
  });
});
