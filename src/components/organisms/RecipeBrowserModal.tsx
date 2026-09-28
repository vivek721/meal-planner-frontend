import React, { useMemo, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Modal } from '../atoms/Modal';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { Dropdown } from '../atoms/Dropdown';
import { RecipeCard } from '../molecules/RecipeCard';
import RecipeService from '../../services/RecipeService';
import type { MealCategory, Recipe, RecipeFilter } from '../../types/legacyRecipe.types';

interface RecipeBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  dayName?: string;
  mealType?: string;
}

const ALL = 'All';
const categories: MealCategory[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];

const toOptions = (values: string[]) =>
  [ALL, ...values].map((value) => ({ value, label: value }));

const categoryOptions = toOptions(categories);
const cuisineOptions = toOptions(RecipeService.getAvailableCuisines());
const dietaryTagOptions = toOptions(RecipeService.getAvailableDietaryTags());

export const RecipeBrowserModal: React.FC<RecipeBrowserModalProps> = ({
  isOpen,
  onClose,
  onSelectRecipe,
  dayName,
  mealType,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState(ALL);
  const [cuisine, setCuisine] = useState(ALL);
  const [dietaryTag, setDietaryTag] = useState(ALL);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Filtering, search and sorting all live in RecipeService
  const filteredRecipes = useMemo(() => {
    const filter: RecipeFilter = {
      searchQuery,
      category: category === ALL ? undefined : [category as MealCategory],
      cuisine: cuisine === ALL ? undefined : [cuisine],
      dietaryTags: dietaryTag === ALL ? undefined : [dietaryTag],
    };
    return RecipeService.searchRecipes(filter, { sortBy: 'popular' }).recipes;
  }, [searchQuery, category, cuisine, dietaryTag]);

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleAddRecipe = () => {
    if (selectedRecipe) {
      onSelectRecipe(selectedRecipe);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setCategory(ALL);
    setCuisine(ALL);
    setDietaryTag(ALL);
    setSelectedRecipe(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Recipe" size="xl">
      <div className="flex flex-col h-[70vh] max-h-[700px]">
        {dayName && mealType && (
          <p className="text-sm text-gray-600 mb-4">
            to {dayName} {mealType}
          </p>
        )}

        {/* Search and filters */}
        <div className="mb-6 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search recipes, ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap gap-3">
            <Dropdown
              value={category}
              onChange={setCategory}
              options={categoryOptions}
              placeholder="Category"
              className="flex-1 min-w-[150px]"
            />
            <Dropdown
              value={cuisine}
              onChange={setCuisine}
              options={cuisineOptions}
              placeholder="Cuisine"
              className="flex-1 min-w-[150px]"
            />
            <Dropdown
              value={dietaryTag}
              onChange={setDietaryTag}
              options={dietaryTagOptions}
              placeholder="Dietary"
              className="flex-1 min-w-[150px]"
            />
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-600">
            {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'} found
          </p>
        </div>

        {/* Recipe grid */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {filteredRecipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Filter className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onClick={() => handleRecipeClick(recipe)}
                  isDraggable={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer with selected recipe */}
        {selectedRecipe && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedRecipe.thumbnail}
                  alt={selectedRecipe.name}
                  className="w-12 h-12 rounded-md object-cover"
                />
                <div>
                  <p className="font-medium text-gray-900">{selectedRecipe.name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedRecipe.prepTime + selectedRecipe.cookTime} min • {selectedRecipe.servings} servings
                  </p>
                </div>
              </div>
              <Button onClick={handleAddRecipe} size="lg">
                Add to {mealType || 'Plan'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
