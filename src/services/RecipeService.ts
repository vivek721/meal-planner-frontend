import { Recipe, RecipeFilter, MealCategory } from '../types/recipe.types';
import { mockRecipes } from '../data/mockRecipes';

export type SortOption = 'popular' | 'quick' | 'newest' | 'rating' | 'name';

export interface RecipeSearchOptions extends RecipeFilter {
  sortBy?: SortOption;
  limit?: number;
  offset?: number;
}

export interface PaginatedRecipes {
  recipes: Recipe[];
  total: number;
  hasMore: boolean;
}

class RecipeService {
  private recipes: Recipe[] = mockRecipes;
  private readonly FAVORITES_KEY_PREFIX = 'user_favorites';

  /**
   * Get all recipes
   */
  getAllRecipes(): Recipe[] {
    return [...this.recipes];
  }

  /**
   * Get recipe by ID
   */
  getRecipeById(id: string): Recipe | null {
    return this.recipes.find(recipe => recipe.id === id) || null;
  }

  /**
   * Get recipes by category
   */
  getRecipesByCategory(category: MealCategory): Recipe[] {
    return this.recipes.filter(recipe => recipe.category === category);
  }

  /**
   * Advanced search with fuzzy matching, filtering, sorting, and pagination
   */
  searchRecipes(filters: RecipeFilter, options?: { sortBy?: SortOption; limit?: number; offset?: number }): PaginatedRecipes {
    let filteredRecipes = [...this.recipes];

    // 1. SEARCH QUERY (fuzzy matching across multiple fields)
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      filteredRecipes = filteredRecipes.filter(recipe => {
        // Search in recipe name
        const nameMatch = recipe.name.toLowerCase().includes(query);

        // Search in description
        const descMatch = recipe.description?.toLowerCase().includes(query) || false;

        // Search in cuisine
        const cuisineMatch = recipe.cuisine.toLowerCase().includes(query);

        // Search in ingredients
        const ingredientMatch = recipe.ingredients.some(ing =>
          ing.name.toLowerCase().includes(query)
        );

        // Search in dietary tags
        const tagMatch = recipe.dietaryTags.some(tag =>
          tag.toLowerCase().includes(query)
        );

        return nameMatch || descMatch || cuisineMatch || ingredientMatch || tagMatch;
      });
    }

    // 2. CATEGORY FILTER
    if (filters.category && filters.category.length > 0) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        filters.category!.includes(recipe.category)
      );
    }

    // 3. DIETARY TAGS FILTER (match ANY tag)
    if (filters.dietaryTags && filters.dietaryTags.length > 0) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        filters.dietaryTags!.some(tag => recipe.dietaryTags.includes(tag))
      );
    }

    // 4. CUISINE FILTER
    if (filters.cuisine && filters.cuisine.length > 0) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        filters.cuisine!.includes(recipe.cuisine)
      );
    }

    // 5. MAX PREP TIME FILTER (total time = prep + cook)
    if (filters.maxPrepTime) {
      filteredRecipes = filteredRecipes.filter(
        recipe => (recipe.prepTime + recipe.cookTime) <= filters.maxPrepTime!
      );
    }

    // 6. SORTING
    const sortBy = options?.sortBy || 'popular';
    filteredRecipes = this.sortRecipes(filteredRecipes, sortBy);

    // 7. PAGINATION
    const total = filteredRecipes.length;
    const offset = options?.offset || 0;
    const limit = options?.limit || total; // No limit by default
    const paginatedRecipes = filteredRecipes.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      recipes: paginatedRecipes,
      total,
      hasMore,
    };
  }

  /**
   * Sort recipes by different criteria
   */
  private sortRecipes(recipes: Recipe[], sortBy: SortOption): Recipe[] {
    const sorted = [...recipes];

    switch (sortBy) {
      case 'popular':
        // Sort by review count, then rating
        return sorted.sort((a, b) => {
          const aScore = (a.reviewCount || 0) * (a.rating || 0);
          const bScore = (b.reviewCount || 0) * (b.rating || 0);
          return bScore - aScore;
        });

      case 'quick':
        // Sort by total time (prep + cook)
        return sorted.sort((a, b) => {
          const aTime = a.prepTime + a.cookTime;
          const bTime = b.prepTime + b.cookTime;
          return aTime - bTime;
        });

      case 'rating':
        // Sort by rating, then review count
        return sorted.sort((a, b) => {
          const aDiff = (b.rating || 0) - (a.rating || 0);
          if (aDiff !== 0) return aDiff;
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        });

      case 'name':
        // Sort alphabetically
        return sorted.sort((a, b) => a.name.localeCompare(b.name));

      case 'newest':
        // For mock data, use id as proxy for newest (higher id = newer)
        return sorted.sort((a, b) => b.id.localeCompare(a.id));

      default:
        return sorted;
    }
  }

  /**
   * Get autocomplete suggestions for search
   */
  getSearchSuggestions(query: string, limit: number = 5): string[] {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    const suggestions = new Set<string>();

    this.recipes.forEach(recipe => {
      // Recipe names
      if (recipe.name.toLowerCase().includes(lowerQuery)) {
        suggestions.add(recipe.name);
      }

      // Cuisines
      if (recipe.cuisine.toLowerCase().includes(lowerQuery)) {
        suggestions.add(recipe.cuisine);
      }

      // Ingredients
      recipe.ingredients.forEach(ing => {
        if (ing.name.toLowerCase().includes(lowerQuery)) {
          suggestions.add(ing.name);
        }
      });
    });

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Get available cuisines for filter
   */
  getAvailableCuisines(): string[] {
    const cuisines = new Set<string>();
    this.recipes.forEach(recipe => cuisines.add(recipe.cuisine));
    return Array.from(cuisines).sort();
  }

  /**
   * Get available dietary tags for filter
   */
  getAvailableDietaryTags(): string[] {
    const tags = new Set<string>();
    this.recipes.forEach(recipe => {
      recipe.dietaryTags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }

  // FAVORITES MANAGEMENT

  /**
   * Get favorites storage key for a user
   */
  private getFavoritesKey(userId: string): string {
    return `${this.FAVORITES_KEY_PREFIX}_${userId}`;
  }

  /**
   * Get user's favorite recipe IDs
   */
  getFavoriteIds(userId: string): string[] {
    const key = this.getFavoritesKey(userId);
    const stored = localStorage.getItem(key);
    if (!stored) return [];

    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing favorites:', error);
      return [];
    }
  }

  /**
   * Check if recipe is favorited
   */
  isFavorite(userId: string, recipeId: string): boolean {
    const favorites = this.getFavoriteIds(userId);
    return favorites.includes(recipeId);
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(userId: string, recipeId: string): boolean {
    const favorites = this.getFavoriteIds(userId);
    const index = favorites.indexOf(recipeId);

    let newFavorites: string[];
    let isFavorited: boolean;

    if (index > -1) {
      // Remove from favorites
      newFavorites = favorites.filter(id => id !== recipeId);
      isFavorited = false;
    } else {
      // Add to favorites
      newFavorites = [...favorites, recipeId];
      isFavorited = true;
    }

    const key = this.getFavoritesKey(userId);
    localStorage.setItem(key, JSON.stringify(newFavorites));

    return isFavorited;
  }

  /**
   * Get favorite recipes
   */
  getFavoriteRecipes(userId: string): Recipe[] {
    const favoriteIds = this.getFavoriteIds(userId);
    return this.recipes.filter(recipe => favoriteIds.includes(recipe.id));
  }

  /**
   * Clear all favorites
   */
  clearFavorites(userId: string): void {
    const key = this.getFavoritesKey(userId);
    localStorage.removeItem(key);
  }

  // SERVING SIZE CALCULATIONS

  /**
   * Adjust ingredient amounts for different serving sizes
   */
  adjustServingSize(recipe: Recipe, newServings: number): Recipe {
    if (newServings === recipe.servings) return recipe;

    const ratio = newServings / recipe.servings;

    return {
      ...recipe,
      servings: newServings,
      ingredients: recipe.ingredients.map(ing => ({
        ...ing,
        amount: this.scaleIngredientAmount(ing.amount, ratio),
      })),
      nutrition: {
        calories: Math.round(recipe.nutrition.calories * ratio),
        protein: Math.round(recipe.nutrition.protein * ratio),
        carbs: Math.round(recipe.nutrition.carbs * ratio),
        fat: Math.round(recipe.nutrition.fat * ratio),
        fiber: recipe.nutrition.fiber
          ? Math.round(recipe.nutrition.fiber * ratio)
          : undefined,
        sugar: recipe.nutrition.sugar
          ? Math.round(recipe.nutrition.sugar * ratio)
          : undefined,
      },
    };
  }

  /**
   * Scale ingredient amount with proper fraction handling
   */
  private scaleIngredientAmount(amount: string, ratio: number): string {
    // Handle fractions and mixed numbers
    const fractionRegex = /^(\d+)?\s*(\d+)\/(\d+)$/;
    const match = amount.match(fractionRegex);

    if (match) {
      const [, whole = '0', numerator, denominator] = match;
      const wholeNum = parseInt(whole, 10);
      const num = parseInt(numerator, 10);
      const den = parseInt(denominator, 10);

      const decimalValue = wholeNum + (num / den);
      const scaledValue = decimalValue * ratio;

      return this.formatFraction(scaledValue);
    }

    // Handle decimal numbers
    const numericValue = parseFloat(amount);
    if (!isNaN(numericValue)) {
      const scaledValue = numericValue * ratio;
      return this.formatFraction(scaledValue);
    }

    // Return as-is if not parseable
    return amount;
  }

  /**
   * Format decimal to fraction (e.g., 0.5 => "1/2", 1.25 => "1 1/4")
   */
  private formatFraction(value: number): string {
    const tolerance = 0.01;
    const whole = Math.floor(value);
    const decimal = value - whole;

    // Common fractions
    const fractions: Array<[number, string]> = [
      [1/4, '1/4'],
      [1/3, '1/3'],
      [1/2, '1/2'],
      [2/3, '2/3'],
      [3/4, '3/4'],
    ];

    for (const [frac, str] of fractions) {
      if (Math.abs(decimal - frac) < tolerance) {
        return whole > 0 ? `${whole} ${str}` : str;
      }
    }

    // If no common fraction matches, use decimal
    if (decimal < tolerance) {
      return whole.toString();
    }

    return value.toFixed(1);
  }

  /**
   * Get random recipes
   */
  getRandomRecipes(count: number = 10): Recipe[] {
    const shuffled = [...this.recipes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Get similar recipes based on dietary tags and cuisine
   */
  getSimilarRecipes(recipeId: string, count: number = 5): Recipe[] {
    const recipe = this.getRecipeById(recipeId);
    if (!recipe) return [];

    // Find recipes with matching dietary tags or cuisine
    const similar = this.recipes
      .filter(r => r.id !== recipeId)
      .map(r => {
        let score = 0;

        // Same cuisine = +3 points
        if (r.cuisine === recipe.cuisine) score += 3;

        // Matching dietary tags = +1 point each
        const matchingTags = r.dietaryTags.filter(tag =>
          recipe.dietaryTags.includes(tag)
        );
        score += matchingTags.length;

        // Same category = +2 points
        if (r.category === recipe.category) score += 2;

        return { recipe: r, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(item => item.recipe);

    return similar;
  }

  /**
   * Get recipes by prep time
   */
  getQuickRecipes(maxMinutes: number = 30): Recipe[] {
    return this.recipes.filter(recipe => recipe.prepTime <= maxMinutes);
  }

  /**
   * Get recipes by dietary tags
   */
  getRecipesByDietaryTags(tags: string[]): Recipe[] {
    return this.recipes.filter(recipe =>
      tags.some(tag => recipe.dietaryTags.includes(tag))
    );
  }

  /**
   * Get featured recipes (high rated)
   */
  getFeaturedRecipes(count: number = 10): Recipe[] {
    return [...this.recipes]
      .filter(recipe => recipe.rating && recipe.rating >= 4.7)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, count);
  }

  /**
   * Get breakfast recipes
   */
  getBreakfastRecipes(): Recipe[] {
    return this.getRecipesByCategory('Breakfast');
  }

  /**
   * Get lunch recipes
   */
  getLunchRecipes(): Recipe[] {
    return this.getRecipesByCategory('Lunch');
  }

  /**
   * Get dinner recipes
   */
  getDinnerRecipes(): Recipe[] {
    return this.getRecipesByCategory('Dinner');
  }

  /**
   * Get snack recipes
   */
  getSnackRecipes(): Recipe[] {
    return this.getRecipesByCategory('Snack');
  }
}

export default new RecipeService();
