import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, ChefHat, Home } from 'lucide-react';
import { useRecipes } from '../contexts/useRecipes';
import { useToast } from '../contexts/useToast';
import { Breadcrumb } from '../components/atoms/Breadcrumb';
import { Badge } from '../components/atoms/Badge';
import { ServingAdjuster } from '../components/atoms/ServingAdjuster';
import { NutritionCard } from '../components/molecules/NutritionCard';
import { RecipeActions } from '../components/molecules/RecipeActions';
import { RecipeCard } from '../components/molecules/RecipeCard';
import RecipeService from '../services/RecipeService';
import type { Recipe } from '../types/recipe.types';

export const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setCurrentRecipe, adjustedServings, setAdjustedServings, getAdjustedRecipe } = useRecipes();
  const { showError } = useToast();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [similarRecipes, setSimilarRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load the recipe whenever the :id route param changes
  useEffect(() => {
    setIsLoading(true);

    const foundRecipe = id ? RecipeService.getRecipeById(id) : null;

    if (!foundRecipe) {
      showError('Recipe not found');
      navigate('/recipes');
      return;
    }

    setRecipe(foundRecipe);
    setCurrentRecipe(foundRecipe);
    setAdjustedServings(foundRecipe.servings);

    // Load similar recipes
    setSimilarRecipes(RecipeService.getSimilarRecipes(foundRecipe.id, 4));

    setIsLoading(false);
  }, [id, navigate, showError, setCurrentRecipe, setAdjustedServings]);

  const handleServingsChange = (newServings: number) => {
    setAdjustedServings(newServings);
  };

  const handleAddToPlan = () => {
    // TODO: Open meal plan modal to select day/meal type
    // For now, just show a message
    showError('Add to Plan feature - requires meal plan modal integration');
  };

  const handleSimilarRecipeClick = (similarRecipe: Recipe) => {
    navigate(`/recipes/${similarRecipe.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!recipe) {
    return null;
  }

  const adjustedRecipe = getAdjustedRecipe() || recipe;
  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Breadcrumb
            items={[
              { label: 'Home', path: '/dashboard', icon: <Home className="w-4 h-4" /> },
              { label: 'Recipes', path: '/recipes' },
              { label: recipe.name },
            ]}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image */}
            <div className="relative h-96 md:h-auto">
              <img
                src={recipe.thumbnail}
                alt={recipe.name}
                className="w-full h-full object-cover"
              />
              {recipe.rating && (
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 text-lg">★</span>
                    <span className="font-semibold text-gray-900">
                      {recipe.rating.toFixed(1)}
                    </span>
                    {recipe.reviewCount && (
                      <span className="text-sm text-gray-600">
                        ({recipe.reviewCount})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-8">
              <div className="mb-4">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  {recipe.name}
                </h1>
                {recipe.description && (
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {recipe.description}
                  </p>
                )}
              </div>

              {/* Dietary Tags */}
              {recipe.dietaryTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {recipe.dietaryTags.map((tag) => (
                    <Badge key={tag} variant="primary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Clock className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{totalTime}</div>
                  <div className="text-sm text-gray-600">minutes</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Users className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{recipe.servings}</div>
                  <div className="text-sm text-gray-600">servings</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <ChefHat className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-gray-900 capitalize">
                    {recipe.cuisine}
                  </div>
                  <div className="text-sm text-gray-600">cuisine</div>
                </div>
              </div>

              {/* Actions */}
              <RecipeActions
                recipe={recipe}
                onAddToPlan={handleAddToPlan}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Ingredients & Instructions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Ingredients */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Ingredients</h2>
                <ServingAdjuster
                  servings={adjustedServings}
                  onServingsChange={handleServingsChange}
                />
              </div>

              <ul className="space-y-3">
                {adjustedRecipe.ingredients.map((ingredient) => (
                  <li
                    key={ingredient.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-900">
                      <span className="font-semibold">
                        {ingredient.amount} {ingredient.unit}
                      </span>{' '}
                      {ingredient.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Instructions</h2>

              <ol className="space-y-6">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed pt-1">
                      {instruction}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Right Column - Nutrition & Similar */}
          <div className="space-y-8">
            {/* Nutrition */}
            <NutritionCard
              nutrition={adjustedRecipe.nutrition}
              servings={adjustedServings}
            />

            {/* Time Breakdown */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Time Breakdown
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Prep Time</span>
                  <span className="font-semibold text-gray-900">
                    {recipe.prepTime} min
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cook Time</span>
                  <span className="font-semibold text-gray-900">
                    {recipe.cookTime} min
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total Time</span>
                    <span className="font-bold text-primary-600">
                      {totalTime} min
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Similar Recipes */}
            {similarRecipes.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Similar Recipes
                </h3>
                <div className="space-y-4">
                  {similarRecipes.map((similar) => (
                    <RecipeCard
                      key={similar.id}
                      recipe={similar}
                      variant="compact"
                      onClick={() => handleSimilarRecipeClick(similar)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
