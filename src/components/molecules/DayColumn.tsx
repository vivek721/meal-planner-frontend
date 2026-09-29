import React from 'react';
import { Copy } from 'lucide-react';
import { format, isToday } from 'date-fns';
import type { DayMeals } from '../../types/recipe.types';
import { MealSlot } from './MealSlot';

interface DayColumnProps {
  date: Date;
  meals: DayMeals;
  onAddMeal: (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => void;
  onRemoveMeal: (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => void;
  onCopyDay: () => void;
}

export const DayColumn: React.FC<DayColumnProps> = ({
  date,
  meals,
  onAddMeal,
  onRemoveMeal,
  onCopyDay,
}) => {
  const isCurrentDay = isToday(date);
  const dayName = format(date, 'EEEE');
  const dayDate = format(date, 'MMM d');
  const dateKey = format(date, 'yyyy-MM-dd');

  const mealTypes: Array<'breakfast' | 'lunch' | 'dinner' | 'snacks'> = [
    'breakfast',
    'lunch',
    'dinner',
    'snacks',
  ];

  return (
    <div
      data-testid="meal-plan-day"
      className={`
        flex flex-col bg-white rounded-lg border-2 overflow-hidden
        ${isCurrentDay ? 'border-primary-500 shadow-lg' : 'border-gray-200'}
      `}
    >
      {/* Day header */}
      <div
        className={`
          p-4 border-b
          ${isCurrentDay ? 'bg-primary-50 border-primary-200' : 'bg-gray-50 border-gray-200'}
        `}
      >
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{dayName}</h3>
            <p className="text-sm text-gray-600">{dayDate}</p>
          </div>

          {/* Copy day button */}
          <button
            onClick={onCopyDay}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-white rounded-md transition-colors"
            aria-label={`Copy ${dayName}'s meals`}
            title="Copy day"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        {isCurrentDay && (
          <div className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
            Today
          </div>
        )}
      </div>

      {/* Meal slots */}
      <div className="flex-1 p-3 space-y-3">
        {mealTypes.map((mealType) => (
          <div key={mealType}>
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
              {mealType}
            </label>
            <MealSlot
              dayDate={dateKey}
              mealType={mealType}
              meal={meals[mealType]}
              onAdd={() => onAddMeal(mealType)}
              onRemove={() => onRemoveMeal(mealType)}
              isCurrentDay={isCurrentDay}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
