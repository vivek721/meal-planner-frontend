import { Recipe } from '../types/recipe.types';
import RecipeService from './RecipeService';
import MealPlanService from './MealPlanService';

interface UserPreferences {
  dietaryPreferences?: string[];
  favoriteCuisines?: string[];
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  allergies?: string[];
}

interface SuggestionReason {
  primary: string;
  secondary?: string;
}

interface RecipeSuggestion {
  recipe: Recipe;
  score: number;
  reason: SuggestionReason;
}

class MockAIService {
  /**
   * Generate meal suggestions based on user preferences and history
   */
  generateSuggestions(
    userId: string,
    preferences?: UserPreferences,
    count: number = 8
  ): RecipeSuggestion[] {
    const allRecipes = RecipeService.getAllRecipes();
    const mealPlan = MealPlanService.getMealPlan(userId);

    // Get recipes already in current meal plan
    const plannedRecipeIds = new Set<string>();
    if (mealPlan) {
      Object.values(mealPlan.days).forEach(dayMeals => {
        if (dayMeals.breakfast) plannedRecipeIds.add(dayMeals.breakfast.recipeId);
        if (dayMeals.lunch) plannedRecipeIds.add(dayMeals.lunch.recipeId);
        if (dayMeals.dinner) plannedRecipeIds.add(dayMeals.dinner.recipeId);
        if (dayMeals.snacks) plannedRecipeIds.add(dayMeals.snacks.recipeId);
      });
    }

    // Get time of day for context-aware suggestions
    const hour = new Date().getHours();
    const timeOfDay =
      hour < 11 ? 'morning' :
      hour < 15 ? 'afternoon' :
      hour < 19 ? 'evening' : 'night';

    // Score each recipe
    const scoredRecipes = allRecipes.map(recipe => {
      let score = 0;
      let primaryReason = '';
      let secondaryReason = '';

      // Skip if already in meal plan
      if (plannedRecipeIds.has(recipe.id)) {
        return { recipe, score: -1000, reason: { primary: '' } };
      }

      // Base score from rating
      if (recipe.rating) {
        score += recipe.rating * 2;
      }

      // Match dietary preferences (HIGH WEIGHT)
      if (preferences?.dietaryPreferences && preferences.dietaryPreferences.length > 0) {
        const matchingTags = recipe.dietaryTags.filter(tag =>
          preferences.dietaryPreferences!.some(pref =>
            pref.toLowerCase() === tag.toLowerCase()
          )
        );

        if (matchingTags.length > 0) {
          score += matchingTags.length * 8;
          primaryReason = `Matches your ${matchingTags[0]} diet`;
        }
      }

      // Match favorite cuisines
      if (preferences?.favoriteCuisines && preferences.favoriteCuisines.length > 0) {
        if (preferences.favoriteCuisines.some(cuisine =>
          cuisine.toLowerCase() === recipe.cuisine.toLowerCase()
        )) {
          score += 6;
          if (!primaryReason) {
            primaryReason = `You love ${recipe.cuisine} cuisine`;
          } else {
            secondaryReason = `${recipe.cuisine} cuisine`;
          }
        }
      }

      // Time-based suggestions
      if (timeOfDay === 'morning' && recipe.category === 'Breakfast') {
        score += 5;
        if (!primaryReason) {
          primaryReason = 'Perfect for breakfast';
        }
      } else if ((timeOfDay === 'afternoon' || timeOfDay === 'evening') && recipe.category === 'Lunch') {
        score += 4;
        if (!primaryReason) {
          primaryReason = 'Great lunch option';
        }
      } else if (timeOfDay === 'evening' && recipe.category === 'Dinner') {
        score += 4;
        if (!primaryReason) {
          primaryReason = 'Ideal for dinner';
        }
      }

      // Quick recipes get bonus (under 30 min)
      if (recipe.prepTime <= 30) {
        score += 3;
        if (!secondaryReason) {
          secondaryReason = `Quick: ${recipe.prepTime} min`;
        }
      }

      // High protein bonus
      if (recipe.dietaryTags.includes('High Protein')) {
        score += 2;
        if (!secondaryReason && !primaryReason.includes('protein')) {
          secondaryReason = 'High protein';
        }
      }

      // Popular recipes (high review count)
      if (recipe.reviewCount && recipe.reviewCount > 300) {
        score += 3;
        if (!secondaryReason) {
          secondaryReason = 'Popular choice';
        }
      }

      // Featured/high-rated recipes
      if (recipe.rating && recipe.rating >= 4.8) {
        score += 4;
        if (!primaryReason) {
          primaryReason = 'Highly rated recipe';
        }
      }

      // Skill level matching
      if (preferences?.skillLevel) {
        const isComplexRecipe = recipe.instructions.length > 8 || recipe.cookTime > 45;

        if (preferences.skillLevel === 'beginner' && !isComplexRecipe) {
          score += 3;
        } else if (preferences.skillLevel === 'advanced' && isComplexRecipe) {
          score += 3;
        }
      }

      // Diversity bonus - favor different categories
      if (!primaryReason) {
        primaryReason = `${recipe.category} suggestion`;
      }

      // Add some randomness for variety (±2 points)
      score += (Math.random() - 0.5) * 4;

      return {
        recipe,
        score,
        reason: {
          primary: primaryReason || 'Recommended for you',
          secondary: secondaryReason,
        },
      };
    });

    // Sort by score and filter out already planned recipes
    const suggestions = scoredRecipes
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, count * 2); // Get extra for diversity

    // Ensure diversity by limiting recipes from same category
    const diverseSuggestions: RecipeSuggestion[] = [];
    const categoryCount: Record<string, number> = {};
    const maxPerCategory = Math.ceil(count / 5); // Allow 2-3 per category for 8 suggestions

    for (const suggestion of suggestions) {
      const category = suggestion.recipe.category;
      if (!categoryCount[category]) {
        categoryCount[category] = 0;
      }

      if (categoryCount[category] < maxPerCategory || diverseSuggestions.length < count) {
        diverseSuggestions.push(suggestion);
        categoryCount[category]++;

        if (diverseSuggestions.length >= count) {
          break;
        }
      }
    }

    return diverseSuggestions;
  }

  /**
   * Get suggestion reason text for display
   */
  getSuggestionReasonText(suggestion: RecipeSuggestion): string {
    const { primary, secondary } = suggestion.reason;
    if (secondary) {
      return `${primary} • ${secondary}`;
    }
    return primary;
  }

  /**
   * Generate weekly meal plan (auto-fill for the week)
   */
  generateWeeklyPlan(
    userId: string,
    preferences?: UserPreferences
  ): { breakfast: Recipe[]; lunch: Recipe[]; dinner: Recipe[] } {
    const suggestions = this.generateSuggestions(userId, preferences, 30);

    const breakfast: Recipe[] = [];
    const lunch: Recipe[] = [];
    const dinner: Recipe[] = [];

    suggestions.forEach(suggestion => {
      const recipe = suggestion.recipe;
      if (breakfast.length < 7 && recipe.category === 'Breakfast') {
        breakfast.push(recipe);
      } else if (lunch.length < 7 && (recipe.category === 'Lunch' || recipe.category === 'Snack')) {
        lunch.push(recipe);
      } else if (dinner.length < 7 && recipe.category === 'Dinner') {
        dinner.push(recipe);
      }
    });

    // Fill remaining slots with any available recipes
    const allRecipes = RecipeService.getAllRecipes();

    while (breakfast.length < 7) {
      const recipe = allRecipes.find(r =>
        r.category === 'Breakfast' &&
        !breakfast.some(b => b.id === r.id)
      );
      if (recipe) breakfast.push(recipe);
      else break;
    }

    while (lunch.length < 7) {
      const recipe = allRecipes.find(r =>
        (r.category === 'Lunch' || r.category === 'Snack') &&
        !lunch.some(l => l.id === r.id)
      );
      if (recipe) lunch.push(recipe);
      else break;
    }

    while (dinner.length < 7) {
      const recipe = allRecipes.find(r =>
        r.category === 'Dinner' &&
        !dinner.some(d => d.id === r.id)
      );
      if (recipe) dinner.push(recipe);
      else break;
    }

    return { breakfast, lunch, dinner };
  }
}

export default new MockAIService();
