import React from 'react';
import { Flame, Beef, Wheat, Droplet } from 'lucide-react';
import { NutritionInfo } from '../../types/legacyRecipe.types';

interface NutritionCardProps {
  nutrition: NutritionInfo;
  servings?: number;
  className?: string;
}

export const NutritionCard: React.FC<NutritionCardProps> = ({
  nutrition,
  servings,
  className = '',
}) => {
  const nutritionItems = [
    {
      icon: Flame,
      label: 'Calories',
      value: nutrition.calories,
      unit: 'kcal',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      icon: Beef,
      label: 'Protein',
      value: nutrition.protein,
      unit: 'g',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      icon: Wheat,
      label: 'Carbs',
      value: nutrition.carbs,
      unit: 'g',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: Droplet,
      label: 'Fat',
      value: nutrition.fat,
      unit: 'g',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Nutrition Facts</h3>
        {servings && (
          <span className="text-sm text-gray-600">Per serving</span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {nutritionItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`${item.bgColor} rounded-lg p-4 text-center`}
            >
              <div className="flex justify-center mb-2">
                <Icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {item.value}
                <span className="text-sm font-normal text-gray-600 ml-1">
                  {item.unit}
                </span>
              </div>
              <div className="text-xs text-gray-600 font-medium">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

      {(nutrition.fiber !== undefined || nutrition.sugar !== undefined) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {nutrition.fiber !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-600">Dietary Fiber</span>
                <span className="font-medium text-gray-900">
                  {nutrition.fiber}g
                </span>
              </div>
            )}
            {nutrition.sugar !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-600">Total Sugars</span>
                <span className="font-medium text-gray-900">
                  {nutrition.sugar}g
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
