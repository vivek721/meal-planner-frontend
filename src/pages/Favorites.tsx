import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Heart, Home, Search } from 'lucide-react';
import { useRecipes } from '../contexts/useRecipes';
import { Breadcrumb } from '../components/atoms/Breadcrumb';
import { Button } from '../components/atoms/Button';
import { Dropdown } from '../components/atoms/Dropdown';
import { Input } from '../components/atoms/Input';
import { ErrorPanel } from '../components/molecules/ErrorPanel';
import { RecipeCard } from '../components/molecules/RecipeCard';
import { useAsync } from '../hooks/useAsync';
import { MAX_SEARCH_LENGTH } from '../services/api/recipesApi';
import { loadFavoriteRecipes } from '../services/recipes/favorites';
import { getRecipe } from '../services/recipes/recipeData';
import { filterOptions } from '../services/recipes/recipeUtils';

type SortOption = 'recent' | 'name';

const sortOptions = [
  { value: 'recent', label: 'Recently Added' },
  { value: 'name', label: 'Name (A-Z)' },
];

export const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const { favoriteIds } = useRecipes();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Details come from the per-session cache, so revisits cost no requests
  const loadFavorites = useCallback(() => loadFavoriteRecipes(favoriteIds, getRecipe), [favoriteIds]);
  const favorites = useAsync(favoriteIds.length > 0 ? loadFavorites : null);
  const recipes = useMemo(() => favorites.data ?? [], [favorites.data]);

  const categoryOptions = useMemo(
    () =>
      filterOptions(
        'All categories',
        Array.from(new Set(recipes.map((recipe) => recipe.category))).sort(),
        selectedCategory,
      ),
    [recipes, selectedCategory],
  );

  const filteredRecipes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const matching = recipes.filter(
      (recipe) =>
        (!query || recipe.name.toLowerCase().includes(query)) &&
        (!selectedCategory || recipe.category === selectedCategory),
    );
    // Saved order is oldest first, so "recent" is that order reversed
    return sortBy === 'name'
      ? [...matching].sort((a, b) => a.name.localeCompare(b.name))
      : [...matching].reverse();
  }, [recipes, searchQuery, selectedCategory, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('recent');
  };

  const count = favorites.data ? recipes.length : favoriteIds.length;
  const isEmpty = favoriteIds.length === 0 || (favorites.data !== null && recipes.length === 0);

  let content: React.ReactNode;
  if (isEmpty) {
    content = (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No favorites yet</h2>
        <p className="text-gray-600 mb-6">Start saving recipes you love by clicking the heart icon</p>
        <div className="flex justify-center">
          <Button onClick={() => navigate('/recipes')}>Browse Recipes</Button>
        </div>
      </div>
    );
  } else if (favorites.loading) {
    content = (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: Math.min(favoriteIds.length, 8) }).map((_, i) => (
          <div key={i} className="h-72 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  } else if (favorites.error) {
    content = <ErrorPanel message={favorites.error.message} onRetry={favorites.retry} />;
  } else {
    content = (
      <>
        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <Input
                  type="text"
                  aria-label="Search favorites"
                  placeholder="Search favorites by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  maxLength={MAX_SEARCH_LENGTH}
                  className="pl-10 py-3"
                />
              </div>
            </div>

            <Dropdown
              ariaLabel="Category"
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={categoryOptions}
              placeholder=""
            />

            <Dropdown
              ariaLabel="Sort by"
              value={sortBy}
              onChange={(value) => setSortBy(value as SortOption)}
              options={sortOptions}
              placeholder=""
            />
          </div>

          {(searchQuery || selectedCategory) && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {filteredRecipes.length} of {recipes.length} favorites
              </p>
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* Results */}
        {filteredRecipes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No recipes found</h2>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
            <div className="flex justify-center">
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} onClick={() => navigate(`/recipes/${recipe.id}`)} />
            ))}
          </div>
        )}
      </>
    );
  }

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
            Your collection of saved recipes - {count} {count === 1 ? 'recipe' : 'recipes'}
          </p>
        </div>

        {content}
      </div>
    </div>
  );
};
