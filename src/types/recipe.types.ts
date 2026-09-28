// Recipe types follow the backend's /api/recipes contract (TheMealDB data).
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

/** One ingredient line. `measure` is TheMealDB's free text, e.g. "3/4 cup". */
export interface Ingredient {
  name: string;
  measure: string;
}

/**
 * A search result. `category` and `cuisine` are present only when the API
 * knows them (the request filtered on them, or it was a name search).
 */
export interface RecipeSummary {
  id: string;
  name: string;
  thumbnail: string;
  category?: string;
  cuisine?: string;
}

/** A full recipe from GET /api/recipes/:id. */
export interface Recipe {
  id: string;
  name: string;
  thumbnail: string;
  category: string;
  cuisine: string;
  ingredients: Ingredient[];
  instructions: string[];
  tags: string[];
  youtubeUrl?: string;
  sourceUrl?: string;
}

/** One page of GET /api/recipes results. */
export interface RecipePage {
  recipes: RecipeSummary[];
  total: number;
  page: number;
  totalPages: number;
}

/** An entry from GET /api/recipes/categories. */
export interface RecipeCategory {
  name: string;
  thumbnail: string;
  description: string;
}

/** Query for GET /api/recipes; at least one of q/category/cuisine/ingredient is required. */
export interface RecipeQuery {
  q?: string;
  category?: string;
  cuisine?: string;
  ingredient?: string;
  page?: number;
  limit?: number;
}

/**
 * A planned meal. The calendar renders it from these stored fields alone (no
 * API call). Slots saved before TheMealDB carry an old "recipe-001" id, a
 * placeholder image, a leftover cooking-time field and no category; they
 * still render.
 */
export interface MealSlot {
  recipeId: string;
  recipeName: string;
  thumbnail: string;
  /** TheMealDB category when known; suggestions use it for variety. */
  category?: string;
  addedAt: string; // ISO timestamp
}

export interface DayMeals {
  breakfast?: MealSlot;
  lunch?: MealSlot;
  dinner?: MealSlot;
  snacks?: MealSlot;
}

export interface MealPlan {
  userId: string;
  weekStartDate: string; // ISO date (e.g., "2025-10-12")
  days: {
    [dayKey: string]: DayMeals; // dayKey format: "2025-10-12"
  };
}
