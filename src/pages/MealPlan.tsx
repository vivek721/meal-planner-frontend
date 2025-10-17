import React, { useState } from 'react';
import { startOfWeek, endOfWeek, addDays, format } from 'date-fns';
import { Trash2, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MealPlanCalendar } from '../components/organisms/MealPlanCalendar';
import { RecipeBrowserModal } from '../components/organisms/RecipeBrowserModal';
import { MealSuggestions } from '../components/organisms/MealSuggestions';
import { CopyDayModal } from '../components/organisms/CopyDayModal';
import { ClearPlanModal } from '../components/organisms/ClearPlanModal';
import { Button } from '../components/atoms/Button';
import MealPlanService from '../services/MealPlanService';
import type { Recipe, DayMeals, MealSlot } from '../types/recipe.types';

export const MealPlan: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || '';
  const userPreferences = user?.preferences?.dietaryPreferences || [];

  const [isRecipeBrowserOpen, setIsRecipeBrowserOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    dayDate: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  } | null>(null);
  const [isCopyDayModalOpen, setIsCopyDayModalOpen] = useState(false);
  const [copySourceDay, setCopySourceDay] = useState<string>('');
  const [isClearPlanModalOpen, setIsClearPlanModalOpen] = useState(false);
  const [mealPlanData, setMealPlanData] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const handleAddMealClick = (
    dayDate: string,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks'
  ) => {
    setSelectedSlot({ dayDate, mealType });
    setIsRecipeBrowserOpen(true);
  };

  const handleRecipeSelect = async (recipe: Recipe) => {
    if (!selectedSlot || !user) return;

    const { dayDate, mealType } = selectedSlot;
    const weekStartStr = format(currentWeekStart, 'yyyy-MM-dd');

    try {
      await MealPlanService.addMeal(userId, weekStartStr, dayDate, mealType, {
        recipeId: recipe.id,
        recipeName: recipe.name,
        thumbnail: recipe.thumbnail,
        prepTime: recipe.prepTime,
        addedAt: new Date().toISOString(),
      });

      // Trigger refresh
      setRefreshKey((prev) => prev + 1);

      // Show success message
      console.log(`✓ ${recipe.name} added to ${mealType} on ${dayDate}`);
    } catch (error) {
      console.error('Failed to add recipe:', error);
    }
  };

  const handleCopyDayClick = async (dayDate: string) => {
    if (!user) return;

    const plan = await MealPlanService.getMealPlan(user.id, currentWeekStart);

    setCopySourceDay(dayDate);
    setMealPlanData(plan);
    setIsCopyDayModalOpen(true);
  };

  const handleCopyDay = async (targetDays: string[], replaceExisting: boolean) => {
    if (!user || !copySourceDay) return;

    const weekStartStr = format(currentWeekStart, 'yyyy-MM-dd');

    try {
      await MealPlanService.copyDay(
        user.id,
        weekStartStr,
        copySourceDay,
        targetDays,
        replaceExisting
      );

      // Trigger refresh
      setRefreshKey((prev) => prev + 1);

      // Show success message
      console.log(`✓ Copied meals to ${targetDays.length} day(s)`);
    } catch (error) {
      console.error('Failed to copy day:', error);
    }
  };

  const handleClearPlan = async (options: {
    targetDays: string[] | 'all';
    mealTypes?: Array<'breakfast' | 'lunch' | 'dinner' | 'snacks'> | 'all';
    deleteShoppingList?: boolean;
  }) => {
    if (!user) return;

    const weekStartStr = format(currentWeekStart, 'yyyy-MM-dd');

    try {
      if (options.targetDays === 'all') {
        await MealPlanService.clearPlan(user.id, weekStartStr);
      } else {
        // Clear specific days/meal types
        const plan = await MealPlanService.getMealPlan(user.id, currentWeekStart);

        if (plan) {
          for (const dayDate of options.targetDays) {
            const mealTypesToClear =
              options.mealTypes === 'all'
                ? (['breakfast', 'lunch', 'dinner', 'snacks'] as const)
                : options.mealTypes || (['breakfast', 'lunch', 'dinner', 'snacks'] as const);

            for (const mealType of mealTypesToClear) {
              if (plan.days[dayDate]?.[mealType]) {
                await MealPlanService.removeMeal(user.id, weekStartStr, dayDate, mealType);
              }
            }
          }
        }
      }

      // Trigger refresh
      setRefreshKey((prev) => prev + 1);

      // Show success message
      console.log('✓ Meal plan cleared');
    } catch (error) {
      console.error('Failed to clear plan:', error);
    }
  };

  const handleAddFromSuggestion = async (
    recipe: Recipe,
    dayDate: string,
    mealType: string
  ) => {
    if (!user) return;

    const weekStartStr = format(currentWeekStart, 'yyyy-MM-dd');
    const mealTypeKey = mealType.toLowerCase() as 'breakfast' | 'lunch' | 'dinner' | 'snacks';

    try {
      await MealPlanService.addMeal(user.id, weekStartStr, dayDate, mealTypeKey, {
        recipeId: recipe.id,
        recipeName: recipe.name,
        thumbnail: recipe.thumbnail,
        prepTime: recipe.prepTime,
        addedAt: new Date().toISOString(),
      });

      // Trigger refresh
      setRefreshKey((prev) => prev + 1);

      // Show success message
      console.log(`✓ ${recipe.name} added from AI suggestions`);
    } catch (error) {
      console.error('Failed to add recipe from suggestion:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1920px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meal Plan</h1>
            <p className="text-gray-600 mt-2">Plan your meals for the week</p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsClearPlanModalOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Plan
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-8">
          {/* Meal Plan Calendar */}
          <MealPlanCalendar
            key={refreshKey}
            userId={userId}
            onAddMealClick={handleAddMealClick}
            onCopyDayClick={handleCopyDayClick}
          />

          {/* AI Suggestions */}
          <MealSuggestions
            userId={userId}
            preferences={userPreferences}
            onAddToPlan={handleAddFromSuggestion}
            weekDays={weekDays}
          />
        </div>

        {/* Recipe Browser Modal */}
        <RecipeBrowserModal
          isOpen={isRecipeBrowserOpen}
          onClose={() => {
            setIsRecipeBrowserOpen(false);
            setSelectedSlot(null);
          }}
          onSelectRecipe={handleRecipeSelect}
          dayName={
            selectedSlot ? format(new Date(selectedSlot.dayDate), 'EEEE, MMM d') : undefined
          }
          mealType={selectedSlot?.mealType}
        />

        {/* Copy Day Modal */}
        {mealPlanData && (
          <CopyDayModal
            isOpen={isCopyDayModalOpen}
            onClose={() => setIsCopyDayModalOpen(false)}
            sourceDayDate={copySourceDay}
            sourceDayMeals={mealPlanData.days[copySourceDay] || {}}
            weekDays={weekDays}
            existingMeals={mealPlanData.days}
            onCopy={handleCopyDay}
          />
        )}

        {/* Clear Plan Modal */}
        {mealPlanData && (
          <ClearPlanModal
            isOpen={isClearPlanModalOpen}
            onClose={() => setIsClearPlanModalOpen(false)}
            weekDays={weekDays}
            existingMeals={mealPlanData.days || {}}
            hasShoppingList={false}
            onClear={handleClearPlan}
          />
        )}
      </div>
    </div>
  );
};
