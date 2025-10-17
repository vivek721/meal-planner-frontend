import { startOfWeek, format } from 'date-fns';
import { MealPlan, MealSlot, MealType, DayMeals } from '../types/recipe.types';
import RecipeService from './RecipeService';

class MealPlanService {
  private readonly STORAGE_KEY_PREFIX = 'mealPlans';

  /**
   * Get the storage key for a specific week and user
   */
  private getStorageKey(userId: string, weekStartDate: string): string {
    return `${this.STORAGE_KEY_PREFIX}_${userId}_${weekStartDate}`;
  }

  /**
   * Get week start date (Sunday) for a given date
   */
  private getWeekStartDate(date: Date): string {
    const weekStart = startOfWeek(date, { weekStartsOn: 0 }); // Sunday
    return format(weekStart, 'yyyy-MM-dd');
  }

  /**
   * Get meal plan for a specific week
   */
  getMealPlan(userId: string, date: Date = new Date()): MealPlan | null {
    const weekStartDate = this.getWeekStartDate(date);
    const storageKey = this.getStorageKey(userId, weekStartDate);
    const stored = localStorage.getItem(storageKey);

    if (!stored) {
      // Return empty meal plan
      return {
        userId,
        weekStartDate,
        days: {},
      };
    }

    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing meal plan:', error);
      return null;
    }
  }

  /**
   * Save meal plan
   */
  saveMealPlan(mealPlan: MealPlan): void {
    const storageKey = this.getStorageKey(mealPlan.userId, mealPlan.weekStartDate);
    localStorage.setItem(storageKey, JSON.stringify(mealPlan));
  }

  /**
   * Add a meal to a specific day and meal type
   */
  addMeal(
    userId: string,
    date: Date,
    dayDate: string,
    mealType: MealType,
    recipeId: string
  ): MealPlan | null {
    const recipe = RecipeService.getRecipeById(recipeId);
    if (!recipe) {
      console.error('Recipe not found:', recipeId);
      return null;
    }

    const mealPlan = this.getMealPlan(userId, date);
    if (!mealPlan) return null;

    const mealSlot: MealSlot = {
      recipeId: recipe.id,
      recipeName: recipe.name,
      thumbnail: recipe.thumbnail,
      prepTime: recipe.prepTime,
      addedAt: new Date().toISOString(),
    };

    // Initialize day if it doesn't exist
    if (!mealPlan.days[dayDate]) {
      mealPlan.days[dayDate] = {};
    }

    // Add meal to the specified slot
    mealPlan.days[dayDate][mealType] = mealSlot;

    // Save the updated meal plan
    this.saveMealPlan(mealPlan);

    return mealPlan;
  }

  /**
   * Remove a meal from a specific day and meal type
   */
  removeMeal(
    userId: string,
    date: Date,
    dayDate: string,
    mealType: MealType
  ): MealPlan | null {
    const mealPlan = this.getMealPlan(userId, date);
    if (!mealPlan) return null;

    if (mealPlan.days[dayDate] && mealPlan.days[dayDate][mealType]) {
      delete mealPlan.days[dayDate][mealType];

      // Remove day if all meals are empty
      const dayMeals = mealPlan.days[dayDate];
      if (
        !dayMeals.breakfast &&
        !dayMeals.lunch &&
        !dayMeals.dinner &&
        !dayMeals.snacks
      ) {
        delete mealPlan.days[dayDate];
      }

      this.saveMealPlan(mealPlan);
    }

    return mealPlan;
  }

  /**
   * Copy meals from one day to another (or multiple days)
   */
  copyDay(
    userId: string,
    date: Date,
    sourceDayDate: string,
    targetDayDates: string[],
    replaceExisting: boolean = false
  ): MealPlan | null {
    const mealPlan = this.getMealPlan(userId, date);
    if (!mealPlan) return null;

    const sourceMeals = mealPlan.days[sourceDayDate];
    if (!sourceMeals) {
      console.error('Source day has no meals');
      return null;
    }

    // Deep clone source meals
    const mealsToCopy = JSON.parse(JSON.stringify(sourceMeals)) as DayMeals;

    // Update addedAt timestamp
    const updateTimestamps = (meals: DayMeals): DayMeals => {
      const updated = { ...meals };
      const now = new Date().toISOString();

      Object.keys(updated).forEach(key => {
        const mealType = key as MealType;
        if (updated[mealType]) {
          updated[mealType]!.addedAt = now;
        }
      });

      return updated;
    };

    const updatedMeals = updateTimestamps(mealsToCopy);

    // Copy to each target day
    targetDayDates.forEach(targetDate => {
      if (replaceExisting) {
        // Replace all meals for the day
        mealPlan.days[targetDate] = { ...updatedMeals };
      } else {
        // Only copy to empty slots
        if (!mealPlan.days[targetDate]) {
          mealPlan.days[targetDate] = {};
        }

        const targetMeals = mealPlan.days[targetDate];

        // Copy each meal type only if target slot is empty
        (['breakfast', 'lunch', 'dinner', 'snacks'] as MealType[]).forEach(mealType => {
          if (updatedMeals[mealType] && !targetMeals[mealType]) {
            targetMeals[mealType] = { ...updatedMeals[mealType]! };
          }
        });
      }
    });

    this.saveMealPlan(mealPlan);
    return mealPlan;
  }

  /**
   * Clear meal plan for specific options
   */
  clearPlan(
    userId: string,
    date: Date,
    options: {
      clearAll?: boolean;
      specificDays?: string[];
      mealType?: MealType;
    } = { clearAll: true }
  ): MealPlan | null {
    const mealPlan = this.getMealPlan(userId, date);
    if (!mealPlan) return null;

    if (options.clearAll) {
      // Clear entire week
      mealPlan.days = {};
    } else if (options.specificDays && options.specificDays.length > 0) {
      // Clear specific days
      if (options.mealType) {
        // Clear specific meal type on specific days
        options.specificDays.forEach(dayDate => {
          if (mealPlan.days[dayDate]) {
            delete mealPlan.days[dayDate][options.mealType!];

            // Remove day if all meals are empty
            const dayMeals = mealPlan.days[dayDate];
            if (
              !dayMeals.breakfast &&
              !dayMeals.lunch &&
              !dayMeals.dinner &&
              !dayMeals.snacks
            ) {
              delete mealPlan.days[dayDate];
            }
          }
        });
      } else {
        // Clear all meals on specific days
        options.specificDays.forEach(dayDate => {
          delete mealPlan.days[dayDate];
        });
      }
    } else if (options.mealType) {
      // Clear specific meal type across all days
      Object.keys(mealPlan.days).forEach(dayDate => {
        if (mealPlan.days[dayDate]) {
          delete mealPlan.days[dayDate][options.mealType!];

          // Remove day if all meals are empty
          const dayMeals = mealPlan.days[dayDate];
          if (
            !dayMeals.breakfast &&
            !dayMeals.lunch &&
            !dayMeals.dinner &&
            !dayMeals.snacks
          ) {
            delete mealPlan.days[dayDate];
          }
        }
      });
    }

    this.saveMealPlan(mealPlan);
    return mealPlan;
  }

  /**
   * Get all meal plans for a user
   */
  getAllMealPlans(userId: string): MealPlan[] {
    const mealPlans: MealPlan[] = [];
    const prefix = `${this.STORAGE_KEY_PREFIX}_${userId}_`;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            mealPlans.push(JSON.parse(stored));
          } catch (error) {
            console.error('Error parsing meal plan:', error);
          }
        }
      }
    }

    return mealPlans;
  }

  /**
   * Delete meal plan for a specific week
   */
  deleteMealPlan(userId: string, weekStartDate: string): void {
    const storageKey = this.getStorageKey(userId, weekStartDate);
    localStorage.removeItem(storageKey);
  }

  /**
   * Check if a day has any meals
   */
  hasMeals(mealPlan: MealPlan, dayDate: string): boolean {
    const dayMeals = mealPlan.days[dayDate];
    if (!dayMeals) return false;

    return Boolean(
      dayMeals.breakfast ||
      dayMeals.lunch ||
      dayMeals.dinner ||
      dayMeals.snacks
    );
  }

  /**
   * Get meal count for the week
   */
  getMealCount(mealPlan: MealPlan): number {
    let count = 0;
    Object.values(mealPlan.days).forEach(dayMeals => {
      if (dayMeals.breakfast) count++;
      if (dayMeals.lunch) count++;
      if (dayMeals.dinner) count++;
      if (dayMeals.snacks) count++;
    });
    return count;
  }
}

export default new MealPlanService();
