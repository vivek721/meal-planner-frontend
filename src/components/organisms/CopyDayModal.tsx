import React, { useState } from 'react';
import { format } from 'date-fns';
import { Copy, AlertTriangle } from 'lucide-react';
import { Modal } from '../atoms/Modal';
import { Button } from '../atoms/Button';
import { Checkbox } from '../atoms/Checkbox';
import type { DayMeals } from '../../types/recipe.types';

interface CopyDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceDayDate: string;
  sourceDayMeals: DayMeals;
  weekDays: Date[];
  existingMeals: { [dayDate: string]: DayMeals };
  onCopy: (targetDays: string[], replaceExisting: boolean) => void;
}

export const CopyDayModal: React.FC<CopyDayModalProps> = ({
  isOpen,
  onClose,
  sourceDayDate,
  sourceDayMeals,
  weekDays,
  existingMeals,
  onCopy,
}) => {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [replaceExisting, setReplaceExisting] = useState(false);

  const sourceDayName = format(new Date(sourceDayDate), 'EEEE');

  // Count how many meals exist in source day
  const sourceMealCount = Object.values(sourceDayMeals).filter(Boolean).length;

  // Get available target days (excluding source day)
  const targetDays = weekDays
    .map((day) => format(day, 'yyyy-MM-dd'))
    .filter((dayDate) => dayDate !== sourceDayDate);

  // Count existing meals in each target day
  const getExistingMealCount = (dayDate: string): number => {
    const meals = existingMeals[dayDate];
    if (!meals) return 0;
    return Object.values(meals).filter(Boolean).length;
  };

  // Calculate total existing meals in selected days
  const getTotalExistingMeals = (): number => {
    return selectedDays.reduce((total, dayDate) => {
      return total + getExistingMealCount(dayDate);
    }, 0);
  };

  const handleDayToggle = (dayDate: string) => {
    setSelectedDays((prev) =>
      prev.includes(dayDate)
        ? prev.filter((d) => d !== dayDate)
        : [...prev, dayDate]
    );
  };

  const handleCopy = () => {
    if (selectedDays.length === 0) return;
    onCopy(selectedDays, replaceExisting);
    handleClose();
  };

  const handleClose = () => {
    setSelectedDays([]);
    setReplaceExisting(false);
    onClose();
  };

  const hasExistingMeals = getTotalExistingMeals() > 0;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Copy className="w-5 h-5 text-primary-500" />
            <h3 className="text-xl font-semibold text-gray-900">Copy Day's Meals</h3>
          </div>
          <p className="text-gray-600">
            Copy {sourceMealCount} meal{sourceMealCount !== 1 ? 's' : ''} from {sourceDayName} to other days
          </p>
        </div>

        {/* Day selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select target days:
          </label>
          <div className="space-y-2">
            {targetDays.map((dayDate) => {
              const day = new Date(dayDate);
              const dayName = format(day, 'EEEE, MMM d');
              const existingCount = getExistingMealCount(dayDate);
              const isSelected = selectedDays.includes(dayDate);

              return (
                <label
                  key={dayDate}
                  className={`
                    flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors
                    ${isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleDayToggle(dayDate)}
                    />
                    <div>
                      <span className="font-medium text-gray-900">{dayName}</span>
                      {existingCount > 0 && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {existingCount} existing meal{existingCount !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Replace option */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.target.checked)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <span className="font-medium text-gray-900">Replace existing meals</span>
              <p className="text-sm text-gray-600 mt-1">
                {replaceExisting
                  ? 'Existing meals in selected days will be replaced'
                  : 'Only copy to empty meal slots'}
              </p>
            </div>
          </label>
        </div>

        {/* Warning for existing meals */}
        {hasExistingMeals && replaceExisting && (
          <div className="flex gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-orange-900">
                This will replace {getTotalExistingMeals()} existing meal
                {getTotalExistingMeals() !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-orange-700 mt-1">
                The replaced meals cannot be recovered
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleCopy}
            disabled={selectedDays.length === 0}
            className="flex-1"
          >
            Copy to {selectedDays.length} day{selectedDays.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
