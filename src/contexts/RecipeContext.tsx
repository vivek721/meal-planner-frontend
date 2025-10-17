import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Recipe, RecipeFilter } from '../types/recipe.types';
import RecipeService, { SortOption } from '../services/RecipeService';
import { useAuth } from './AuthContext';

interface RecipeContextType {
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

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipes must be used within a RecipeProvider');
  }
  return context;
};

interface RecipeProviderProps {
  children: ReactNode;
}

export const RecipeProvider: React.FC<RecipeProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [adjustedServings, setAdjustedServings] = useState(0);

  // Load favorites on mount or user change
  useEffect(() => {
    loadFavorites();
  }, [user]);

  const loadFavorites = useCallback(() => {
    if (!user) {
      setFavorites(new Set());
      setFavoriteRecipes([]);
      return;
    }

    const favoriteIds = RecipeService.getFavoriteIds(user.id);
    setFavorites(new Set(favoriteIds));

    const recipes = RecipeService.getFavoriteRecipes(user.id);
    setFavoriteRecipes(recipes);
  }, [user]);

  const toggleFavorite = useCallback((recipeId: string): boolean => {
    if (!user) return false;

    const isFavorited = RecipeService.toggleFavorite(user.id, recipeId);

    // Update local state optimistically
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (isFavorited) {
        newSet.add(recipeId);
      } else {
        newSet.delete(recipeId);
      }
      return newSet;
    });

    // Reload favorite recipes
    loadFavorites();

    return isFavorited;
  }, [user, loadFavorites]);

  const isFavorite = useCallback((recipeId: string): boolean => {
    return favorites.has(recipeId);
  }, [favorites]);

  const searchRecipes = useCallback((filters: RecipeFilter, options?: { sortBy?: SortOption; limit?: number; offset?: number }) => {
    setIsSearching(true);

    // Simulate async search (in real app, this might be an API call)
    setTimeout(() => {
      const result = RecipeService.searchRecipes(filters, options);
      setSearchResults(result.recipes);
      setTotalResults(result.total);
      setIsSearching(false);
    }, 0);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setTotalResults(0);
  }, []);

  // Reset adjusted servings when current recipe changes
  useEffect(() => {
    if (currentRecipe) {
      setAdjustedServings(currentRecipe.servings);
    }
  }, [currentRecipe]);

  const getAdjustedRecipe = useCallback((): Recipe | null => {
    if (!currentRecipe) return null;
    return RecipeService.adjustServingSize(currentRecipe, adjustedServings);
  }, [currentRecipe, adjustedServings]);

  const value: RecipeContextType = {
    favorites,
    toggleFavorite,
    isFavorite,
    favoriteRecipes,
    loadFavorites,
    searchResults,
    totalResults,
    isSearching,
    searchRecipes,
    clearSearch,
    currentRecipe,
    setCurrentRecipe,
    adjustedServings,
    setAdjustedServings,
    getAdjustedRecipe,
  };

  return <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>;
};
