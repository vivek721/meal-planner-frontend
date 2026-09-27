import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Search, Filter, Home } from 'lucide-react';
import { useRecipes } from '../contexts/RecipeContext';
import { Breadcrumb } from '../components/atoms/Breadcrumb';
import { Input } from '../components/atoms/Input';
import { Button } from '../components/atoms/Button';
import { Dropdown } from '../components/atoms/Dropdown';
import { RecipeCard } from '../components/molecules/RecipeCard';
import type { Recipe, MealCategory } from '../types/recipe.types';

type SortOption = 'name' | 'recent' | 'time' | 'rating';

export const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const { favoriteRecipes, loadFavorites } = useRecipes();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);

  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'].map(
    (category) => ({ value: category, label: category })
  );
  const sortOptions = [
    { value: 'recent', label: 'Recently Added' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'time', label: 'Quickest First' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [favoriteRecipes, searchQuery, selectedCategory, sortBy]);

  const applyFiltersAndSort = () => {
    let filtered = [...favoriteRecipes];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(query) ||
          recipe.description?.toLowerCase().includes(query) ||
          recipe.cuisine.toLowerCase().includes(query) ||
          recipe.dietaryTags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(
        (recipe) => recipe.category === selectedCategory as MealCategory
      );
    }

    // Sort
    filtered = sortRecipes(filtered, sortBy);

    setFilteredRecipes(filtered);
  };

  const sortRecipes = (recipes: Recipe[], sort: SortOption): Recipe[] => {
    const sorted = [...recipes];

    switch (sort) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));

      case 'time':
        return sorted.sort((a, b) => {
          const aTime = a.prepTime + a.cookTime;
          const bTime = b.prepTime + b.cookTime;
          return aTime - bTime;
        });

      case 'rating':
        return sorted.sort((a, b) => {
          const aRating = a.rating || 0;
          const bRating = b.rating || 0;
          return bRating - aRating;
        });

      case 'recent':
      default:
        // Keep original order (most recently added first)
        return sorted.reverse();
    }
  };

  const handleRecipeClick = (recipe: Recipe) => {
    navigate(`/recipes/${recipe.id}`);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSortBy('recent');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Breadcrumb
            items={[
              { label: 'Home', path: '/dashboard', icon: <Home className="w-4 h-4" /> },
              { label: 'Favorites' },
            ]}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <h1 className="text-4xl font-bold text-gray-900">My Favorites</h1>
          </div>
          <p className="text-gray-600">
            Your collection of saved recipes - {favoriteRecipes.length}{' '}
            {favoriteRecipes.length === 1 ? 'recipe' : 'recipes'}
          </p>
        </div>

        {favoriteRecipes.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No favorites yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start saving recipes you love by clicking the heart icon
            </p>
            <Button onClick={() => navigate('/recipes')}>
              Browse Recipes
            </Button>
          </div>
        ) : (
          <>
            {/* Filters & Search */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="grid md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search favorites..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <Dropdown
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  options={categories}
                  placeholder="Category"
                />

                {/* Sort */}
                <Dropdown
                  value={sortBy}
                  onChange={(value) => setSortBy(value as SortOption)}
                  options={sortOptions.map((opt) => ({
                    value: opt.value,
                    label: opt.label,
                  }))}
                  placeholder="Sort by"
                />
              </div>

              {/* Active Filters */}
              {(searchQuery || selectedCategory !== 'All') && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Showing {filteredRecipes.length} of {favoriteRecipes.length}{' '}
                    favorites
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>

            {/* Results */}
            {filteredRecipes.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onClick={() => handleRecipeClick(recipe)}
                    showFavorite={true}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
