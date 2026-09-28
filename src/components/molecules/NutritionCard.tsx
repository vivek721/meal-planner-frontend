import React from 'react';
import { Flame } from 'lucide-react';

interface NutritionCardProps {
  className?: string;
}

/**
 * TheMealDB has no nutrition data, so none is shown or estimated. Nutrition
 * from USDA FoodData Central is planned (part 2 of the TheMealDB work).
 */
export const NutritionCard: React.FC<NutritionCardProps> = ({ className = '' }) => (
  <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
    <div className="flex items-center gap-2 mb-2">
      <Flame className="w-5 h-5 text-orange-500" />
      <h3 className="text-lg font-semibold text-gray-900">Nutrition</h3>
    </div>
    <p className="text-sm text-gray-600">Nutrition information coming soon</p>
  </div>
);
