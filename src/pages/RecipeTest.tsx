import React, { useState, useEffect } from 'react';
import { RecipeSearchBar } from '../components/molecules/RecipeSearchBar';
import { RecipeCard } from '../components/molecules/RecipeCard';
import { useRecipes } from '../contexts/RecipeContext';
import RecipeService from '../services/RecipeService';
import { Recipe } from '../types/recipe.types';

export const RecipeTest: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const { searchResults, totalResults, favoriteRecipes } = useRecipes();

  // Load initial recipes
  useEffect(() => {
    const allRecipes = RecipeService.getAllRecipes();
    setRecipes(allRecipes.slice(0, 12)); // Show first 12 recipes
  }, []);

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    if (query.trim()) {
      const results = RecipeService.searchRecipes({ searchQuery: query });
      setRecipes(results.recipes);
    } else {
      const allRecipes = RecipeService.getAllRecipes();
      setRecipes(allRecipes.slice(0, 12));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Recipe Test Page
          </h1>
          <p className="text-gray-600">
            Testing RecipeSearchBar, RecipeCard, and Favorites functionality
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Search Recipes
          </h2>
          <RecipeSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Total Recipes</div>
            <div className="text-2xl font-bold text-gray-900">
              {recipes.length}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Search Results</div>
            <div className="text-2xl font-bold text-gray-900">
              {totalResults}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Favorites</div>
            <div className="text-2xl font-bold text-red-500">
              {favoriteRecipes.length}
            </div>
          </div>
        </div>

        {/* Favorites Section */}
        {favoriteRecipes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Favorites ({favoriteRecipes.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onClick={() => console.log('Clicked recipe:', recipe.name)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Recipes */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {searchQuery ? `Search Results (${recipes.length})` : 'All Recipes'}
          </h2>
          {recipes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No recipes found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onClick={() => console.log('Clicked recipe:', recipe.name)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Testing Instructions:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-blue-800">
            <li>Type in the search bar to filter recipes</li>
            <li>Click the heart icon on any recipe card to favorite it</li>
            <li>Favorites are saved to localStorage and persist across page reloads</li>
            <li>Search suggestions appear as you type</li>
            <li>Search works across recipe names, ingredients, cuisines, and tags</li>
            <li>Click on a recipe card to see console output (detail page coming soon)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
