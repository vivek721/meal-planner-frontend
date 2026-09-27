import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Dropdown } from '../atoms/Dropdown';
import { Modal } from '../atoms/Modal';
import { SuggestionCard } from '../molecules/SuggestionCard';
import MockAIService from '../../services/MockAIService';
import type { MealType, Recipe } from '../../types/recipe.types';
import { format } from 'date-fns';

interface MealSuggestionsProps {
  userId: string;
  preferences?: string[];
  onAddToPlan: (recipe: Recipe, dayDate: string, mealType: MealType) => void;
  weekDays: Date[];
}

// Stable default so the effect below does not re-run on every render
const NO_PREFERENCES: string[] = [];

const mealTypeOptions: Array<{ value: MealType; label: string }> = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snacks', label: 'Snacks' },
];

export const MealSuggestions: React.FC<MealSuggestionsProps> = ({
  userId,
  preferences = NO_PREFERENCES,
  onAddToPlan,
  weekDays,
}) => {
  const [suggestions, setSuggestions] = useState<Array<{ recipe: Recipe; reason: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');

  useEffect(() => {
    loadSuggestions();
  }, [userId, preferences]);

  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      const suggestionResults = await MockAIService.generateSuggestions(userId, { dietaryPreferences: preferences });
      // Convert reason object to string
      const formattedSuggestions = suggestionResults.map(({ recipe, reason }) => ({
        recipe,
        reason: typeof reason === 'object'
          ? (reason.secondary ? `${reason.primary} • ${reason.secondary}` : reason.primary)
          : reason
      }));
      setSuggestions(formattedSuggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadSuggestions();
  };

  const handleAddToPlan = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setSelectedDay(format(weekDays[0], 'yyyy-MM-dd'));
    setSelectedMealType('breakfast');
    setIsModalOpen(true);
  };

  const handleConfirmAdd = () => {
    if (selectedRecipe && selectedDay && selectedMealType) {
      onAddToPlan(selectedRecipe, selectedDay, selectedMealType);
      setIsModalOpen(false);
      setSelectedRecipe(null);
    }
  };

  const dayOptions = weekDays.map((day) => ({
    value: format(day, 'yyyy-MM-dd'),
    label: format(day, 'EEEE, MMM d'),
  }));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-gray-900">AI Suggestions</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Suggestions grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No suggestions available</p>
          <p className="text-sm text-gray-500 mt-1">Try updating your preferences</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {suggestions.slice(0, 8).map(({ recipe, reason }) => (
            <SuggestionCard
              key={recipe.id}
              recipe={recipe}
              reason={reason}
              onAddToPlan={() => handleAddToPlan(recipe)}
            />
          ))}
        </div>
      )}

      {/* Add to plan modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add to Meal Plan"
        size="sm"
      >
        <div className="space-y-6">
          <div>
            {selectedRecipe && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <img
                  src={selectedRecipe.thumbnail}
                  alt={selectedRecipe.name}
                  className="w-12 h-12 rounded-md object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{selectedRecipe.name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedRecipe.prepTime + selectedRecipe.cookTime} min
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Day
              </label>
              <Dropdown
                value={selectedDay}
                onChange={setSelectedDay}
                options={dayOptions}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Meal Type
              </label>
              <Dropdown
                value={selectedMealType}
                onChange={(value) => setSelectedMealType(value as MealType)}
                options={mealTypeOptions}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
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
