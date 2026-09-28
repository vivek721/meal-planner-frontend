import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Clock, Plus, X } from 'lucide-react';
import type { MealSlot as MealSlotType } from '../../types/recipe.types';
import RecipeService from '../../services/RecipeService';

interface MealSlotProps {
  dayDate: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  meal?: MealSlotType;
  onAdd: () => void;
  onRemove: () => void;
  isCurrentDay?: boolean;
}

export const MealSlot: React.FC<MealSlotProps> = ({
  dayDate,
  mealType,
  meal,
  onAdd,
  onRemove,
  isCurrentDay = false,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${dayDate}-${mealType}`,
    data: { dayDate, mealType },
  });

  const isEmpty = !meal;
  // Prefer live recipe data so saved slots pick up thumbnail/time fixes
  const recipe = meal ? RecipeService.getRecipeById(meal.recipeId) : null;
  const totalTime = recipe ? recipe.prepTime + recipe.cookTime : meal?.prepTime;

  return (
    <div
      ref={setNodeRef}
      className={`
        relative rounded-lg border-2 transition-all duration-200 min-h-[80px]
        ${isEmpty ? 'border-dashed border-gray-300' : 'border-gray-200'}
        ${isOver ? 'border-primary-500 bg-primary-50' : ''}
        ${isCurrentDay && !isEmpty ? 'shadow-md' : ''}
        hover:shadow-sm
      `}
    >
      {isEmpty ? (
        <button
          onClick={onAdd}
          className="w-full h-full min-h-[80px] flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-primary-500 hover:bg-gray-50 rounded-lg transition-colors p-3"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">Add meal</span>
        </button>
      ) : (
        <div className="relative p-3 group">
          {/* Remove button */}
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 z-10"
            aria-label="Remove meal"
          >
            <X className="w-4 h-4 text-red-500" />
          </button>

          {/* Meal content */}
          <div className="flex gap-3">
            {/* Thumbnail */}
            <img
              src={recipe?.thumbnail ?? meal.thumbnail}
              alt={meal.recipeName}
              className="w-16 h-16 rounded-md object-cover flex-shrink-0"
            />

            {/* Details */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-gray-900 truncate mb-1">
                {meal.recipeName}
              </h4>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{totalTime} min</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
