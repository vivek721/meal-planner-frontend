// Types for the bundled mock catalogue (src/data/mockRecipes.ts). Screens move
// to the API types in recipe.types.ts one at a time; this file is deleted with
// the mock data once nothing imports it.
export type MealCategory = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Dessert';

export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber?: number; // grams
  sugar?: number; // grams
}

export interface Recipe {
  id: string;
  name: string;
  category: MealCategory;
  cuisine: string;
  thumbnail: string;
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  dietaryTags: string[];
  nutrition: NutritionInfo;
  description?: string;
  rating?: number;
  reviewCount?: number;
}

export interface RecipeFilter {
  category?: MealCategory[];
  dietaryTags?: string[];
  maxPrepTime?: number;
  searchQuery?: string;
  cuisine?: string[];
}
