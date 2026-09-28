import React from 'react';
import { Clock, Plus, Info } from 'lucide-react';
import type { Recipe } from '../../types/legacyRecipe.types';
import { Badge } from '../atoms/Badge';

interface SuggestionCardProps {
  recipe: Recipe;
  reason?: string;
  onAddToPlan: () => void;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  recipe,
  reason,
  onAddToPlan,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative h-32 overflow-hidden">
        <img
          src={recipe.thumbnail}
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
        {recipe.dietaryTags.length > 0 && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" size="sm">
              {recipe.dietaryTags[0]}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h4 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2">
          {recipe.name}
        </h4>

        <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{recipe.prepTime + recipe.cookTime} min</span>
          </div>
          <span className="capitalize">{recipe.category}</span>
        </div>

        {/* Reason */}
        {reason && typeof reason === 'string' && (
          <div className="flex items-start gap-2 mb-3 p-2 bg-primary-50 rounded-md">
            <Info className="w-3 h-3 text-primary-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-primary-700">{reason}</p>
          </div>
        )}

        {/* Add to plan button */}
        <button
          onClick={onAddToPlan}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary-500 text-white text-sm font-medium rounded-md hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add to Plan
        </button>
      </div>
    </div>
  );
};
