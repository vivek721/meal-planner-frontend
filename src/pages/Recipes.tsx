import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Home } from 'lucide-react';
import { useRecipes } from '../contexts/useRecipes';
import { Breadcrumb } from '../components/atoms/Breadcrumb';
import { Input } from '../components/atoms/Input';
import { Button } from '../components/atoms/Button';
import { Dropdown } from '../components/atoms/Dropdown';
import { Checkbox } from '../components/atoms/Checkbox';
import { RecipeCard } from '../components/molecules/RecipeCard';
import RecipeService, { SortOption } from '../services/RecipeService';
import type { Recipe, RecipeFilter, MealCategory } from '../types/recipe.types';

export const Recipes: React.FC = () => {
  const navigate = useNavigate();
  const { searchRecipes, searchResults, totalResults, isSearching } = useRecipes();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<MealCategory[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<string[]>([]);
  const [maxPrepTime, setMaxPrepTime] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [showFilters, setShowFilters] = useState(false);

  const availableCuisines = RecipeService.getAvailableCuisines();
  const availableDietaryTags = RecipeService.getAvailableDietaryTags();

  const categories: MealCategory[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];
  const timeOptions = [
    { value: '', label: 'Any time' },
    { value: '30', label: 'Under 30 min' },
    { value: '60', label: 'Under 1 hour' },
    { value: '120', label: 'Under 2 hours' },
  ];
  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'quick', label: 'Quickest First' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'newest', label: 'Newest' },
  ];

  const performSearch = useCallback(() => {
    const filters: RecipeFilter = {
      searchQuery: searchQuery || undefined,
      category: selectedCategories.length > 0 ? selectedCategories : undefined,
      cuisine: selectedCuisines.length > 0 ? selectedCuisines : undefined,
      dietaryTags: selectedDietaryTags.length > 0 ? selectedDietaryTags : undefined,
      maxPrepTime: maxPrepTime || undefined,
    };

    searchRecipes(filters, { sortBy });
  }, [searchRecipes, searchQuery, selectedCategories, selectedCuisines, selectedDietaryTags, maxPrepTime, sortBy]);

  // Search immediately on mount, then debounce searches when filters change
  const hasSearched = useRef(false);
  useEffect(() => {
    if (!hasSearched.current) {
      hasSearched.current = true;
      performSearch();
      return;
    }

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [performSearch]);

  const handleCategoryToggle = (category: MealCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleCuisineToggle = (cuisine: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine)
        ? prev.filter((c) => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const handleDietaryTagToggle = (tag: string) => {
    setSelectedDietaryTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedCuisines([]);
    setSelectedDietaryTags([]);
    setMaxPrepTime(undefined);
  };

  const handleRecipeClick = (recipe: Recipe) => {
    navigate(`/recipes/${recipe.id}`);
  };

  const activeFilterCount =
    selectedCategories.length +
    selectedCuisines.length +
    selectedDietaryTags.length +
    (maxPrepTime ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Breadcrumb
            items={[
              { label: 'Home', path: '/dashboard', icon: <Home className="w-4 h-4" /> },
              { label: 'Recipes' },
            ]}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Recipe Collection
          </h1>
          <p className="text-gray-600">
            Discover and save delicious recipes for every meal
          </p>
        </div>

        {/* Search & Filters Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search recipes, ingredients, cuisine..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Sort */}
            <Dropdown
              value={sortBy}
              onChange={(value) => setSortBy(value as SortOption)}
              options={sortOptions.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
              placeholder="Sort by"
              className="md:w-48"
            />

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:w-auto"
            >
              <Filter className="w-5 h-5" />
              <span>
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </span>
            </Button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="pt-6 border-t border-gray-200 space-y-6">
              {/* Categories */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Cuisines */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Cuisine</h3>
                <div className="flex flex-wrap gap-2">
                  {availableCuisines.map((cuisine) => (
                    <label
                      key={cuisine}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedCuisines.includes(cuisine)}
                        onChange={() => handleCuisineToggle(cuisine)}
                      />
                      <span className="text-sm text-gray-700">{cuisine}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dietary Tags */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Dietary Preferences</h3>
                <div className="flex flex-wrap gap-2">
                  {availableDietaryTags.map((tag) => (
                    <label
                      key={tag}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedDietaryTags.includes(tag)}
                        onChange={() => handleDietaryTagToggle(tag)}
                      />
                      <span className="text-sm text-gray-700">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Max Prep Time */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Cooking Time</h3>
                <Dropdown
                  value={maxPrepTime?.toString() || ''}
                  onChange={(value) =>
                    setMaxPrepTime(value ? parseInt(value, 10) : undefined)
                  }
                  options={timeOptions.map((opt) => ({
                    value: opt.value,
                    label: opt.label,
                  }))}
                  className="md:w-64"
                />
              </div>

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <Button variant="ghost" onClick={handleClearFilters}>
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Results count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {isSearching ? (
                'Searching...'
              ) : (
                <>
                  Showing {searchResults.length} of {totalResults} recipes
                </>
              )}
            </p>
          </div>
        </div>

        {/* Results Grid */}
        {isSearching ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-96 bg-gray-200 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        ) : searchResults.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No recipes found
            </h2>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filters
            </p>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {searchResults.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => handleRecipeClick(recipe)}
                showFavorite={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
