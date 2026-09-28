import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
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
import { DayColumn } from '../molecules/DayColumn';
import { WeekNavigation } from '../molecules/WeekNavigation';
import { RecipeCard } from '../molecules/RecipeCard';
import type { MealPlan, MealType } from '../../types/recipe.types';
import type { Recipe } from '../../types/legacyRecipe.types';

interface MealSlotDropData {
  dayDate: string;
  mealType: MealType;
}

interface MealPlanCalendarProps {
  /** Sunday that starts the week being shown */
  weekStart: Date;
  onWeekStartChange: (weekStart: Date) => void;
  /** Plan for the week being shown; null while it is loading */
  mealPlan: MealPlan | null;
  onAddMealClick: (dayDate: string, mealType: MealType) => void;
  onRemoveMeal: (dayDate: string, mealType: MealType) => void;
  onDropRecipe: (recipe: Recipe, dayDate: string, mealType: MealType) => void;
  onCopyDayClick: (dayDate: string) => void;
}

export const MealPlanCalendar: React.FC<MealPlanCalendarProps> = ({
  weekStart,
  onWeekStartChange,
  mealPlan,
  onAddMealClick,
  onRemoveMeal,
  onDropRecipe,
  onCopyDayClick,
}) => {
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const weekEndDate = endOfWeek(weekStart, { weekStartsOn: 0 });
  const isCurrentWeek = isSameWeek(weekStart, new Date(), { weekStartsOn: 0 });

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handlePreviousWeek = () => {
    onWeekStartChange(subWeeks(weekStart, 1));
  };

  const handleNextWeek = () => {
    onWeekStartChange(addWeeks(weekStart, 1));
  };

  const handleThisWeek = () => {
    onWeekStartChange(startOfWeek(new Date(), { weekStartsOn: 0 }));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const recipe = event.active.data.current?.recipe as Recipe | undefined;
    if (recipe) {
      setActiveRecipe(recipe);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveRecipe(null);

    if (!over || !mealPlan) return;

    const recipe = active.data.current?.recipe as Recipe | undefined;
    const dropTarget = over.data.current as MealSlotDropData | undefined;

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

      onDropRecipe(recipe, dayDate, mealType);
    }
  };

  if (!mealPlan) {
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
          weekStartDate={weekStart}
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
            const dayMeals = mealPlan.days[dayKey] || {};

            return (
              <DayColumn
                key={dayKey}
                date={day}
                meals={dayMeals}
                onAddMeal={(mealType) => onAddMealClick(dayKey, mealType)}
                onRemoveMeal={(mealType) => onRemoveMeal(dayKey, mealType)}
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
