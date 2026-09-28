import React, { useCallback, useEffect, useState } from 'react';
import { startOfWeek, addDays, format, parseISO } from 'date-fns';
import { Trash2, Download } from 'lucide-react';
import { useAuth } from '../contexts/useAuth';
import { useToast } from '../contexts/useToast';
import { MealPlanCalendar } from '../components/organisms/MealPlanCalendar';
import { RecipeBrowserModal } from '../components/organisms/RecipeBrowserModal';
import { MealSuggestions } from '../components/organisms/MealSuggestions';
import { CopyDayModal } from '../components/organisms/CopyDayModal';
import { ClearPlanModal } from '../components/organisms/ClearPlanModal';
import { Button } from '../components/atoms/Button';
import MealPlanService from '../services/MealPlanService';
import type { MealPlan as MealPlanData, MealType, RecipeSummary } from '../types/recipe.types';

const ALL_MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snacks'];

export const MealPlan: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const userId = user?.id || '';

  // The week being shown. Owned here so the calendar, suggestions and
  // modals all work on the same week.
  const [weekStart, setWeekStart] = useState<Date>(() =>
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [mealPlan, setMealPlan] = useState<MealPlanData | null>(null);

  const [isRecipeBrowserOpen, setIsRecipeBrowserOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    dayDate: string;
    mealType: MealType;
  } | null>(null);
  const [isCopyDayModalOpen, setIsCopyDayModalOpen] = useState(false);
  const [copySourceDay, setCopySourceDay] = useState<string>('');
  const [isClearPlanModalOpen, setIsClearPlanModalOpen] = useState(false);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Re-read the shown week from storage (the single source of truth)
  const refreshMealPlan = useCallback(() => {
    setMealPlan(userId ? MealPlanService.getMealPlan(userId, weekStart) : null);
  }, [userId, weekStart]);

  useEffect(() => {
    refreshMealPlan();
  }, [refreshMealPlan]);

  const addRecipeToSlot = (recipe: RecipeSummary, dayDate: string, mealType: MealType) => {
    if (!userId) return;

    const updated = MealPlanService.addMeal(userId, dayDate, mealType, recipe);
    if (!updated) {
      showError(`Could not add ${recipe.name} to your plan`);
      return;
    }

    refreshMealPlan();
    showSuccess(`${recipe.name} added to ${mealType} on ${format(parseISO(dayDate), 'EEEE')}`);
  };

  const handleAddMealClick = (dayDate: string, mealType: MealType) => {
    setSelectedSlot({ dayDate, mealType });
    setIsRecipeBrowserOpen(true);
  };

  const handleRecipeSelect = (recipe: RecipeSummary) => {
    if (!selectedSlot) return;
    addRecipeToSlot(recipe, selectedSlot.dayDate, selectedSlot.mealType);
  };

  const handleRemoveMeal = (dayDate: string, mealType: MealType) => {
    if (!userId) return;
    MealPlanService.removeMeal(userId, dayDate, mealType);
    refreshMealPlan();
  };

  const handleCopyDayClick = (dayDate: string) => {
    setCopySourceDay(dayDate);
    setIsCopyDayModalOpen(true);
  };

  const handleCopyDay = (targetDays: string[], replaceExisting: boolean) => {
    if (!userId || !copySourceDay) return;

    const updated = MealPlanService.copyDay(userId, copySourceDay, targetDays, replaceExisting);
    if (!updated) {
      showError('Could not copy meals: the selected day has no meals');
      return;
    }

    refreshMealPlan();
    showSuccess(`Copied meals to ${targetDays.length} day${targetDays.length !== 1 ? 's' : ''}`);
  };

  const handleClearPlan = (options: {
    targetDays: string[] | 'all';
    mealTypes?: MealType[] | 'all';
    deleteShoppingList?: boolean;
  }) => {
    if (!userId) return;

    const allMealTypes = !options.mealTypes || options.mealTypes === 'all';

    if (options.targetDays === 'all' && allMealTypes) {
      MealPlanService.clearPlan(userId, weekStart, { clearAll: true });
    } else {
      const days =
        options.targetDays === 'all'
          ? weekDays.map((day) => format(day, 'yyyy-MM-dd'))
          : options.targetDays;
      const mealTypes = allMealTypes ? ALL_MEAL_TYPES : (options.mealTypes as MealType[]);

      for (const dayDate of days) {
        for (const mealType of mealTypes) {
          if (mealPlan?.days[dayDate]?.[mealType]) {
            MealPlanService.removeMeal(userId, dayDate, mealType);
          }
        }
      }
    }

    refreshMealPlan();
    showSuccess('Meal plan cleared');
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
            weekStart={weekStart}
            onWeekStartChange={setWeekStart}
            mealPlan={mealPlan}
            onAddMealClick={handleAddMealClick}
            onRemoveMeal={handleRemoveMeal}
            onDropRecipe={addRecipeToSlot}
            onCopyDayClick={handleCopyDayClick}
          />

          {/* Suggestions (the user profile has no dietary preferences yet) */}
          <MealSuggestions
            userId={userId}
            onAddToPlan={addRecipeToSlot}
            weekDays={weekDays}
          />
        </div>

        {/* Recipe Browser Modal (mounted only while open) */}
        {isRecipeBrowserOpen && (
          <RecipeBrowserModal
            isOpen={isRecipeBrowserOpen}
            onClose={() => {
              setIsRecipeBrowserOpen(false);
              setSelectedSlot(null);
            }}
            onSelectRecipe={handleRecipeSelect}
            dayName={
              selectedSlot ? format(parseISO(selectedSlot.dayDate), 'EEEE, MMM d') : undefined
            }
            mealType={selectedSlot?.mealType}
          />
        )}

        {/* Copy Day Modal */}
        {mealPlan && copySourceDay && (
          <CopyDayModal
            isOpen={isCopyDayModalOpen}
            onClose={() => setIsCopyDayModalOpen(false)}
            sourceDayDate={copySourceDay}
            sourceDayMeals={mealPlan.days[copySourceDay] || {}}
            weekDays={weekDays}
            existingMeals={mealPlan.days}
            onCopy={handleCopyDay}
          />
        )}

        {/* Clear Plan Modal */}
        {mealPlan && (
          <ClearPlanModal
            isOpen={isClearPlanModalOpen}
            onClose={() => setIsClearPlanModalOpen(false)}
            weekDays={weekDays}
            existingMeals={mealPlan.days}
            hasShoppingList={false}
            onClear={handleClearPlan}
          />
        )}
      </div>
    </div>
  );
};
