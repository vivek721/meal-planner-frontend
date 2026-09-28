import { createContext, useContext } from 'react';

export interface RecipeContextType {
  /** The signed-in user's favourite TheMealDB ids, oldest first. */
  favoriteIds: string[];
  isFavorite: (recipeId: string) => boolean;
  /** Adds or removes a favourite; returns true when it is now a favourite. */
  toggleFavorite: (recipeId: string) => boolean;
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
