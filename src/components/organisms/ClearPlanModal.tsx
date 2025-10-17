import React, { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Modal } from '../atoms/Modal';
import { Button } from '../atoms/Button';
import { Checkbox } from '../atoms/Checkbox';
import type { DayMeals } from '../../types/recipe.types';

interface ClearPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekDays: Date[];
  existingMeals: { [dayDate: string]: DayMeals };
  hasShoppingList?: boolean;
  onClear: (options: {
    targetDays: string[] | 'all';
    mealTypes?: Array<'breakfast' | 'lunch' | 'dinner' | 'snacks'> | 'all';
    deleteShoppingList?: boolean;
  }) => void;
}

export const ClearPlanModal: React.FC<ClearPlanModalProps> = ({
  isOpen,
  onClose,
  weekDays,
  existingMeals,
  hasShoppingList = false,
  onClear,
}) => {
  const [clearMode, setClearMode] = useState<'all' | 'specific'>('all');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([]);
  const [deleteShoppingList, setDeleteShoppingList] = useState(false);

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];

  // Count total meals
  const getTotalMealCount = (): number => {
    return Object.values(existingMeals).reduce((total, dayMeals) => {
      return total + Object.values(dayMeals).filter(Boolean).length;
    }, 0);
  };

  // Count meals to be cleared
  const getMealsToClear = (): number => {
    if (clearMode === 'all') {
      if (selectedMealTypes.length === 0) {
        return getTotalMealCount();
      }
      // Count meals of selected types
      return Object.values(existingMeals).reduce((total, dayMeals) => {
        return (
          total +
          selectedMealTypes.filter((type) => dayMeals[type as keyof DayMeals]).length
        );
      }, 0);
    } else {
      // Specific days
      let count = 0;
      selectedDays.forEach((dayDate) => {
        const dayMeals = existingMeals[dayDate];
        if (!dayMeals) return;

        if (selectedMealTypes.length === 0) {
          count += Object.values(dayMeals).filter(Boolean).length;
        } else {
          count += selectedMealTypes.filter((type) => dayMeals[type as keyof DayMeals]).length;
        }
      });
      return count;
    }
  };

  const handleDayToggle = (dayDate: string) => {
    setSelectedDays((prev) =>
      prev.includes(dayDate)
        ? prev.filter((d) => d !== dayDate)
        : [...prev, dayDate]
    );
  };

  const handleMealTypeToggle = (mealType: string) => {
    setSelectedMealTypes((prev) =>
      prev.includes(mealType)
        ? prev.filter((t) => t !== mealType)
        : [...prev, mealType]
    );
  };

  const handleClear = () => {
    onClear({
      targetDays: clearMode === 'all' ? 'all' : selectedDays,
      mealTypes: selectedMealTypes.length === 0 ? 'all' : selectedMealTypes as any,
      deleteShoppingList,
    });
    handleClose();
  };

  const handleClose = () => {
    setClearMode('all');
    setSelectedDays([]);
    setSelectedMealTypes([]);
    setDeleteShoppingList(false);
    onClose();
  };

  const mealsToClear = getMealsToClear();
  const canClear =
    (clearMode === 'all' || selectedDays.length > 0) && mealsToClear > 0;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            <h3 className="text-xl font-semibold text-gray-900">Clear Meal Plan</h3>
          </div>
          <p className="text-gray-600">
            {getTotalMealCount()} total meal{getTotalMealCount() !== 1 ? 's' : ''} in this week
          </p>
        </div>

        {/* Clear mode selection */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors hover:border-gray-300">
            <input
              type="radio"
              name="clearMode"
              checked={clearMode === 'all'}
              onChange={() => setClearMode('all')}
              className="w-4 h-4 text-primary-500"
            />
            <div>
              <span className="font-medium text-gray-900">Clear entire week</span>
              <p className="text-sm text-gray-600">Remove all meals from all days</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors hover:border-gray-300">
            <input
              type="radio"
              name="clearMode"
              checked={clearMode === 'specific'}
              onChange={() => setClearMode('specific')}
              className="w-4 h-4 text-primary-500"
            />
            <div>
              <span className="font-medium text-gray-900">Clear specific days</span>
              <p className="text-sm text-gray-600">Choose which days to clear</p>
            </div>
          </label>
        </div>

        {/* Specific days selection */}
        {clearMode === 'specific' && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select days:
            </label>
            <div className="space-y-2">
              {weekDays.map((day) => {
                const dayDate = format(day, 'yyyy-MM-dd');
                const dayName = format(day, 'EEEE, MMM d');
                const mealCount = Object.values(existingMeals[dayDate] || {}).filter(
                  Boolean
                ).length;

                return (
                  <label
                    key={dayDate}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedDays.includes(dayDate)}
                        onChange={() => handleDayToggle(dayDate)}
                      />
                      <span className="text-sm text-gray-900">{dayName}</span>
                    </div>
                    {mealCount > 0 && (
                      <span className="text-xs text-gray-500">
                        {mealCount} meal{mealCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Meal type filter */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Clear only specific meal types (optional):
          </label>
          <div className="grid grid-cols-2 gap-2">
            {mealTypes.map((mealType) => (
              <label
                key={mealType}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Checkbox
                  checked={selectedMealTypes.includes(mealType)}
                  onChange={() => handleMealTypeToggle(mealType)}
                />
                <span className="text-sm text-gray-900 capitalize">{mealType}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Leave unchecked to clear all meal types
          </p>
        </div>

        {/* Shopping list option */}
        {hasShoppingList && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={deleteShoppingList}
                onChange={(e) => setDeleteShoppingList(e.target.checked)}
                className="mt-0.5"
              />
              <div>
                <span className="font-medium text-orange-900">
                  Also delete shopping list
                </span>
                <p className="text-sm text-orange-700 mt-1">
                  A shopping list exists for this week
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Warning */}
        <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-red-900">
              {mealsToClear > 0
                ? `This will clear ${mealsToClear} meal${mealsToClear !== 1 ? 's' : ''}`
                : 'No meals to clear with current selection'}
            </p>
            {mealsToClear > 0 && (
              <p className="text-sm text-red-700 mt-1">
                This action cannot be undone
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleClear}
            disabled={!canClear}
            className="flex-1 bg-red-500 hover:bg-red-600"
          >
            Clear {mealsToClear > 0 && `${mealsToClear} meal${mealsToClear !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
