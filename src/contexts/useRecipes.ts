import { createContext, useContext } from 'react';
import type { Recipe, RecipeFilter } from '../types/recipe.types';
import type { SortOption } from '../services/RecipeService';

export interface RecipeContextType {
  // Favorites
  favorites: Set<string>;
  toggleFavorite: (recipeId: string) => boolean;
  isFavorite: (recipeId: string) => boolean;
  favoriteRecipes: Recipe[];
  loadFavorites: () => void;

  // Search & Filter
  searchResults: Recipe[];
  totalResults: number;
  isSearching: boolean;
  searchRecipes: (filters: RecipeFilter, options?: { sortBy?: SortOption; limit?: number; offset?: number }) => void;
  clearSearch: () => void;

  // Current recipe (for detail page)
  currentRecipe: Recipe | null;
  setCurrentRecipe: (recipe: Recipe | null) => void;

  // Serving size adjustment
  adjustedServings: number;
  setAdjustedServings: (servings: number) => void;
  getAdjustedRecipe: () => Recipe | null;
}

// Kept apart from RecipeProvider so RecipeContext.tsx only exports components
// (required for React Fast Refresh).
export const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipes must be used within a RecipeProvider');
  }
  return context;
};
