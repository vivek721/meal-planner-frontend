import React, { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Modal } from '../atoms/Modal';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { Dropdown } from '../atoms/Dropdown';
import { RecipeCard } from '../molecules/RecipeCard';
import RecipeService from '../../services/RecipeService';
import type { Recipe, RecipeFilter } from '../../types/recipe.types';

interface RecipeBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  dayName?: string;
  mealType?: string;
}

export const RecipeBrowserModal: React.FC<RecipeBrowserModalProps> = ({
  isOpen,
  onClose,
  onSelectRecipe,
  dayName,
  mealType,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [filters, setFilters] = useState<RecipeFilter>({});
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];
  const cuisines = ['All', 'Italian', 'Mexican', 'Asian', 'American', 'Mediterranean', 'Indian'];
  const dietaryTags = ['All', 'Vegan', 'Vegetarian', 'Gluten-Free', 'Keto', 'Paleo'];

  useEffect(() => {
    if (isOpen) {
      loadRecipes();
    }
  }, [isOpen]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filters, recipes]);

  const loadRecipes = async () => {
    setIsLoading(true);
    try {
      const allRecipes = await RecipeService.getRecipes(filters);
      setRecipes(allRecipes);
    } catch (error) {
      console.error('Failed to load recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...recipes];

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(query) ||
          recipe.cuisine.toLowerCase().includes(query) ||
          recipe.ingredients.some((ing) => ing.name.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (filters.category && filters.category !== 'All') {
      filtered = filtered.filter((recipe) => recipe.category === filters.category);
    }

    // Cuisine filter
    if (filters.cuisine && filters.cuisine !== 'All') {
      filtered = filtered.filter((recipe) => recipe.cuisine === filters.cuisine);
    }

    // Dietary tag filter
    if (filters.dietaryTag && filters.dietaryTag !== 'All') {
      filtered = filtered.filter((recipe) => recipe.dietaryTags.includes(filters.dietaryTag!));
    }

    setFilteredRecipes(filtered);
  };

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
    setFilters({});
    setSelectedRecipe(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <div className="flex flex-col h-[80vh] max-h-[800px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add Recipe</h2>
            {dayName && mealType && (
              <p className="text-sm text-gray-600 mt-1">
                to {dayName} {mealType}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
              value={filters.category || 'All'}
              onChange={(value) => setFilters({ ...filters, category: value === 'All' ? undefined : value })}
              options={categories}
              placeholder="Category"
              className="flex-1 min-w-[150px]"
            />
            <Dropdown
              value={filters.cuisine || 'All'}
              onChange={(value) => setFilters({ ...filters, cuisine: value === 'All' ? undefined : value })}
              options={cuisines}
              placeholder="Cuisine"
              className="flex-1 min-w-[150px]"
            />
            <Dropdown
              value={filters.dietaryTag || 'All'}
              onChange={(value) =>
                setFilters({ ...filters, dietaryTag: value === 'All' ? undefined : value })
              }
              options={dietaryTags}
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
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : filteredRecipes.length === 0 ? (
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
