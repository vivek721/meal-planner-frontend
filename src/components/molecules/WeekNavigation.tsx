import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../atoms/Button';

interface WeekNavigationProps {
  weekStartDate: Date;
  weekEndDate: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onThisWeek: () => void;
  isCurrentWeek: boolean;
}

export const WeekNavigation: React.FC<WeekNavigationProps> = ({
  weekStartDate,
  weekEndDate,
  onPreviousWeek,
  onNextWeek,
  onThisWeek,
  isCurrentWeek,
}) => {
  const weekRange = `${format(weekStartDate, 'MMM d')} - ${format(weekEndDate, 'MMM d, yyyy')}`;

  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      {/* Week range */}
      <div className="flex-1">
        <h2 className="text-xl font-semibold text-gray-900">Week of {weekRange}</h2>
        {isCurrentWeek && (
          <p className="text-sm text-primary-600 mt-1">Current Week</p>
        )}
      </div>

      {/* Navigation controls */}
      <div className="flex items-center gap-2">
        {/* Previous week */}
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousWeek}
          aria-label="Previous week"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* This week */}
        {!isCurrentWeek && (
          <Button
            variant="outline"
            size="sm"
            onClick={onThisWeek}
            aria-label="This week"
          >
            <Calendar className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">This Week</span>
          </Button>
        )}

        {/* Next week */}
        <Button
          variant="outline"
          size="sm"
          onClick={onNextWeek}
          aria-label="Next week"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
