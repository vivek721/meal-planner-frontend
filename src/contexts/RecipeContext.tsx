import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';
import { RecipeContext, RecipeContextType } from './useRecipes';
import { readFavoriteIds, toggleFavoriteId, writeFavoriteIds } from '../services/recipes/favorites';

interface RecipeProviderProps {
  children: ReactNode;
}

/** Holds the signed-in user's favourites (ids in localStorage). */
export const RecipeProvider: React.FC<RecipeProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // Load favourites on sign-in; old mock ids are dropped here the first time
  useEffect(() => {
    setFavoriteIds(userId ? readFavoriteIds(userId) : []);
  }, [userId]);

  const isFavorite = useCallback((recipeId: string) => favoriteIds.includes(recipeId), [favoriteIds]);

  const toggleFavorite = useCallback(
    (recipeId: string): boolean => {
      if (!userId) return false;
      const next = toggleFavoriteId(readFavoriteIds(userId), recipeId);
      writeFavoriteIds(userId, next);
      setFavoriteIds(next);
      return next.includes(recipeId);
    },
    [userId],
  );

  const value = useMemo<RecipeContextType>(
    () => ({ favoriteIds, isFavorite, toggleFavorite }),
    [favoriteIds, isFavorite, toggleFavorite],
  );

  return <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>;
};
