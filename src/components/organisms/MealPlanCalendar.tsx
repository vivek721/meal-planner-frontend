import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameWeek,
  format,
} from 'date-fns';
import MealPlanService from '../../services/MealPlanService';
import { DayColumn } from '../molecules/DayColumn';
import { WeekNavigation } from '../molecules/WeekNavigation';
import { RecipeCard } from '../molecules/RecipeCard';
import type { MealPlan, Recipe } from '../../types/recipe.types';

interface MealPlanCalendarProps {
  userId: string;
  onAddMealClick: (dayDate: string, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => void;
  onCopyDayClick: (dayDate: string) => void;
}

export const MealPlanCalendar: React.FC<MealPlanCalendarProps> = ({
  userId,
  onAddMealClick,
  onCopyDayClick,
}) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const weekEndDate = endOfWeek(currentWeekStart, { weekStartsOn: 0 });
  const isCurrentWeek = isSameWeek(currentWeekStart, new Date(), { weekStartsOn: 0 });

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Load meal plan
  useEffect(() => {
    loadMealPlan();
  }, [currentWeekStart, userId]);

  const loadMealPlan = async () => {
    setIsLoading(true);
    try {
      const weekStartStr = format(currentWeekStart, 'yyyy-MM-dd');
      const plan = await MealPlanService.getMealPlan(userId, weekStartStr);
      setMealPlan(plan);
    } catch (error) {
      console.error('Failed to load meal plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const handleThisWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));
  };

  const handleDragStart = (event: any) => {
    const recipe = event.active.data.current?.recipe;
    if (recipe) {
      setActiveRecipe(recipe);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveRecipe(null);

    if (!over || !mealPlan) return;

    const recipe = active.data.current?.recipe as Recipe;
    const dropTarget = over.data.current;

    if (recipe && dropTarget) {
      const { dayDate, mealType } = dropTarget;

      // Check if slot is already filled
      const existingMeal = mealPlan.days[dayDate]?.[mealType];
      if (existingMeal) {
        const confirmed = window.confirm(
          `Replace existing meal "${existingMeal.recipeName}" with "${recipe.name}"?`
        );
        if (!confirmed) return;
      }

      // Add meal to plan
      try {
        await MealPlanService.addMeal(
          userId,
          format(currentWeekStart, 'yyyy-MM-dd'),
          dayDate,
          mealType,
          {
            recipeId: recipe.id,
            recipeName: recipe.name,
            thumbnail: recipe.thumbnail,
            prepTime: recipe.prepTime,
            addedAt: new Date().toISOString(),
          }
        );

        // Reload meal plan
        loadMealPlan();

        // Show success toast (assuming a toast context exists)
        console.log(`Recipe added to ${mealType} on ${dayDate}`);
      } catch (error) {
        console.error('Failed to add meal:', error);
      }
    }
  };

  const handleRemoveMeal = async (
    dayDate: string,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks'
  ) => {
    if (!mealPlan) return;

    try {
      await MealPlanService.removeMeal(
        userId,
        format(currentWeekStart, 'yyyy-MM-dd'),
        dayDate,
        mealType
      );

      // Reload meal plan
      loadMealPlan();
    } catch (error) {
      console.error('Failed to remove meal:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-16 bg-gray-200 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-[600px] bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div>
        {/* Week navigation */}
        <WeekNavigation
          weekStartDate={currentWeekStart}
          weekEndDate={weekEndDate}
          onPreviousWeek={handlePreviousWeek}
          onNextWeek={handleNextWeek}
          onThisWeek={handleThisWeek}
          isCurrentWeek={isCurrentWeek}
        />

        {/* Calendar grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayMeals = mealPlan?.days[dayKey] || {};

            return (
              <DayColumn
                key={dayKey}
                date={day}
                meals={dayMeals}
                onAddMeal={(mealType) => onAddMealClick(dayKey, mealType)}
                onRemoveMeal={(mealType) => handleRemoveMeal(dayKey, mealType)}
                onCopyDay={() => onCopyDayClick(dayKey)}
              />
            );
          })}
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeRecipe && (
          <div className="opacity-80">
            <RecipeCard recipe={activeRecipe} variant="compact" />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};
