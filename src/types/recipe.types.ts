export type MealCategory = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Dessert';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

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

export interface MealSlot {
  recipeId: string;
  recipeName: string;
  thumbnail: string;
  prepTime: number;
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

export interface RecipeFilter {
  category?: MealCategory[];
  dietaryTags?: string[];
  maxPrepTime?: number;
  searchQuery?: string;
  cuisine?: string[];
}
