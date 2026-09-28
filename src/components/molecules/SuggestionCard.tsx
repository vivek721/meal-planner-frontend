import React from 'react';
import { Info, Plus } from 'lucide-react';
import type { RecipeSummary } from '../../types/recipe.types';
import { Badge } from '../atoms/Badge';
import { previewImage } from '../../services/recipes/recipeUtils';

interface SuggestionCardProps {
  recipe: RecipeSummary;
  reason: string;
  onAddToPlan: () => void;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ recipe, reason, onAddToPlan }) => (
  <div
    data-testid="suggestion-card"
    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
  >
    {/* Image */}
    <div className="relative h-32 overflow-hidden">
      <img src={previewImage(recipe.thumbnail)} alt={recipe.name} loading="lazy" className="w-full h-full object-cover" />
      {recipe.category && (
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" size="sm">
            {recipe.category}
          </Badge>
        </div>
      )}
    </div>

    {/* Content */}
    <div className="p-3">
      <h4 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2">{recipe.name}</h4>

      {/* Reason */}
      <div className="flex items-start gap-2 mb-3 p-2 bg-primary-50 rounded-md">
        <Info className="w-3 h-3 text-primary-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-primary-700">{reason}</p>
      </div>

      {/* Add to plan button */}
      <button
        type="button"
        onClick={onAddToPlan}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary-500 text-white text-sm font-medium rounded-md hover:bg-primary-600 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add to Plan
      </button>
    </div>
  </div>
);
