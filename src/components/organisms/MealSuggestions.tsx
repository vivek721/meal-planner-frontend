import React, { useCallback, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Dropdown } from '../atoms/Dropdown';
import { Modal } from '../atoms/Modal';
import { ErrorPanel } from '../molecules/ErrorPanel';
import { SuggestionCard } from '../molecules/SuggestionCard';
import { useAsync } from '../../hooks/useAsync';
import MealPlanService from '../../services/MealPlanService';
import SuggestionService from '../../services/SuggestionService';
import { previewImage } from '../../services/recipes/recipeUtils';
import type { MealType, RecipeSummary } from '../../types/recipe.types';

interface MealSuggestionsProps {
  userId: string;
  onAddToPlan: (recipe: RecipeSummary, dayDate: string, mealType: MealType) => void;
  /** The seven days of the week being shown, Sunday first */
  weekDays: Date[];
}

const mealTypeOptions: Array<{ value: MealType; label: string }> = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snacks', label: 'Snacks' },
];

export const MealSuggestions: React.FC<MealSuggestionsProps> = ({ userId, onAddToPlan, weekDays }) => {
  const weekKey = format(weekDays[0], 'yyyy-MM-dd');

  // The plan is read when suggestions load, so adding a meal does not
  // reshuffle them; Refresh or another week loads a new set.
  const loadSuggestions = useCallback(
    () =>
      SuggestionService.getSuggestions(userId ? MealPlanService.getMealPlan(userId, parseISO(weekKey)) : null),
    [userId, weekKey],
  );
  const { data, error, loading, retry } = useAsync(loadSuggestions);
  const suggestions = data ?? [];

  const [selectedRecipe, setSelectedRecipe] = useState<RecipeSummary | null>(null);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');

  const handleAddToPlan = (recipe: RecipeSummary) => {
    setSelectedRecipe(recipe);
    setSelectedDay(weekKey);
    setSelectedMealType(recipe.category === 'Breakfast' ? 'breakfast' : 'dinner');
  };

  const closeModal = () => setSelectedRecipe(null);

  const handleConfirmAdd = () => {
    if (!selectedRecipe || !selectedDay) return;
    onAddToPlan(selectedRecipe, selectedDay, selectedMealType);
    setSelectedRecipe(null);
  };

  const dayOptions = weekDays.map((day) => ({
    value: format(day, 'yyyy-MM-dd'),
    label: format(day, 'EEEE, MMM d'),
  }));

  let content: React.ReactNode;
  if (loading) {
    content = (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  } else if (error) {
    content = <ErrorPanel compact message={error.message} onRetry={retry} />;
  } else if (suggestions.length === 0) {
    content = (
      <div className="text-center py-8">
        <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">No suggestions right now</p>
        <p className="text-sm text-gray-500 mt-1">Try refreshing in a moment</p>
      </div>
    );
  } else {
    content = (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {suggestions.map(({ recipe, reason }) => (
          <SuggestionCard
            key={recipe.id}
            recipe={recipe}
            reason={reason}
            onAddToPlan={() => handleAddToPlan(recipe)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6" data-testid="meal-suggestions">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-gray-900">Suggested for You</h3>
        </div>
        <Button variant="outline" size="sm" onClick={retry} disabled={loading} aria-label="Refresh suggestions">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {content}

      {/* Add to plan modal */}
      <Modal isOpen={selectedRecipe !== null} onClose={closeModal} title="Add to Meal Plan" size="sm">
        <div className="space-y-6">
          {selectedRecipe && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <img
                src={previewImage(selectedRecipe.thumbnail)}
                alt={selectedRecipe.name}
                className="w-12 h-12 rounded-md object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{selectedRecipe.name}</p>
                {selectedRecipe.category && <p className="text-sm text-gray-600">{selectedRecipe.category}</p>}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="suggestion-day" className="block text-sm font-medium text-gray-700 mb-2">
                Choose Day
              </label>
              <Dropdown id="suggestion-day" value={selectedDay} onChange={setSelectedDay} options={dayOptions} />
            </div>

            <div>
              <label htmlFor="suggestion-meal-type" className="block text-sm font-medium text-gray-700 mb-2">
                Choose Meal Type
              </label>
              <Dropdown
                id="suggestion-meal-type"
                value={selectedMealType}
                onChange={(value) => setSelectedMealType(value as MealType)}
                options={mealTypeOptions}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={closeModal} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleConfirmAdd} className="flex-1">
              Add to Plan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
