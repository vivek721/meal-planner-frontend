import recipesApi, { MAX_PAGE_SIZE } from './api/recipesApi';
import type { MealPlan, RecipePage, RecipeQuery, RecipeSummary } from '../types/recipe.types';

// A simple heuristic (no AI): time of day picks the category, the week's plan
// adds variety, and one API call supplies the candidates.
export const BREAKFAST_CATEGORY = 'Breakfast';
export const MAIN_CATEGORIES = ['Chicken', 'Beef', 'Pasta', 'Seafood', 'Vegetarian', 'Lamb', 'Pork'] as const;
export const BREAKFAST_CUTOFF_HOUR = 11;
export const SUGGESTION_COUNT = 4;
export const BREAKFAST_REASON = 'Breakfast idea';
export const VARIETY_REASON = 'Something different this week';

/** Returns a number in [0, 1), like Math.random (injectable for tests). */
export type RandomSource = () => number;

export interface Suggestion {
  recipe: RecipeSummary;
  reason: string;
}

export interface PlannedMeals {
  ids: Set<string>;
  categories: Set<string>;
}

/** Recipe ids and known categories already in the week's plan. */
export function plannedMeals(plan: MealPlan | null): PlannedMeals {
  const ids = new Set<string>();
  const categories = new Set<string>();
  for (const day of Object.values(plan?.days ?? {})) {
    for (const slot of [day.breakfast, day.lunch, day.dinner, day.snacks]) {
      if (!slot) continue;
      ids.add(slot.recipeId);
      if (slot.category) categories.add(slot.category);
    }
  }
  return { ids, categories };
}

const randomIndex = (length: number, random: RandomSource): number =>
  Math.min(Math.floor(random() * length), length - 1);

/**
 * Before 11:00 → Breakfast. Otherwise a main category, preferring ones not yet
 * planned this week.
 */
export function chooseCategory(
  hour: number,
  planned: PlannedMeals,
  random: RandomSource,
): { category: string; reason: string } {
  if (hour < BREAKFAST_CUTOFF_HOUR) {
    return { category: BREAKFAST_CATEGORY, reason: BREAKFAST_REASON };
  }
  const fresh = MAIN_CATEGORIES.filter((c) => !planned.categories.has(c));
  const pool: readonly string[] = fresh.length > 0 ? fresh : MAIN_CATEGORIES;
  const category = pool[randomIndex(pool.length, random)];
  const weekHasMains = MAIN_CATEGORIES.some((c) => planned.categories.has(c));
  const reason = weekHasMains && fresh.length > 0 ? VARIETY_REASON : `${category} idea`;
  return { category, reason };
}

/** Up to `count` distinct items chosen at random. */
export function pickRandom<T>(items: T[], count: number, random: RandomSource): T[] {
  const pool = [...items];
  const picked: T[] = [];
  while (picked.length < count && pool.length > 0) {
    picked.push(pool.splice(randomIndex(pool.length, random), 1)[0]);
  }
  return picked;
}

export class SuggestionService {
  constructor(private readonly search: (query: RecipeQuery) => Promise<RecipePage>) {}

  /** Four suggestions for the week's plan; rejects with RecipeApiError if the API fails. */
  async getSuggestions(
    plan: MealPlan | null,
    now: Date = new Date(),
    random: RandomSource = Math.random,
  ): Promise<Suggestion[]> {
    const planned = plannedMeals(plan);
    const { category, reason } = chooseCategory(now.getHours(), planned, random);
    const page = await this.search({ category, limit: MAX_PAGE_SIZE });
    const candidates = page.recipes.filter((recipe) => !planned.ids.has(recipe.id));
    return pickRandom(candidates, SUGGESTION_COUNT, random).map((recipe) => ({
      recipe: { ...recipe, category: recipe.category ?? category },
      reason,
    }));
  }
}

export default new SuggestionService((query) => recipesApi.searchRecipes(query));
