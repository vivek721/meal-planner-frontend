import React, { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ChefHat, ExternalLink, Home, Youtube } from 'lucide-react';
import { useToast } from '../contexts/useToast';
import { Badge } from '../components/atoms/Badge';
import { Breadcrumb } from '../components/atoms/Breadcrumb';
import { Button } from '../components/atoms/Button';
import { ErrorPanel } from '../components/molecules/ErrorPanel';
import { NutritionCard } from '../components/molecules/NutritionCard';
import { RecipeActions } from '../components/molecules/RecipeActions';
import { RecipeCard } from '../components/molecules/RecipeCard';
import { useAsync } from '../hooks/useAsync';
import recipesApi, { RECIPE_NOT_AVAILABLE_MESSAGE } from '../services/api/recipesApi';
import { getRecipe } from '../services/recipes/recipeData';
import { isRecipeId, pickSimilar } from '../services/recipes/recipeUtils';

const SIMILAR_COUNT = 4;

const PageShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-3xl mx-auto px-4 py-16">{children}</div>
  </div>
);

/** Shown for old mock ids ("recipe-001"), unknown ids and ids TheMealDB rejects. */
const NotAvailable: React.FC = () => {
  const navigate = useNavigate();
  return (
    <PageShell>
      <div className="bg-white rounded-xl shadow-sm p-12 text-center" data-testid="recipe-not-available">
        <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{RECIPE_NOT_AVAILABLE_MESSAGE}</h1>
        <p className="text-gray-600 mb-6">It may have been saved from an older version of the app.</p>
        <div className="flex justify-center">
          <Button onClick={() => navigate('/recipes')}>Browse recipes</Button>
        </div>
      </div>
    </PageShell>
  );
};

export const RecipeDetail: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showError } = useToast();
  const validId = isRecipeId(id);

  // Old mock ids never reach the API; details come from the session cache
  const loadRecipe = useCallback(() => getRecipe(id), [id]);
  const { data: recipe, error, loading, retry } = useAsync(validId ? loadRecipe : null);

  // Similar recipes: up to 4 others from the same category
  const category = recipe?.category ?? '';
  const loadSimilar = useMemo(
    () => (category ? () => recipesApi.searchRecipes({ category, limit: 5 }) : null),
    [category],
  );
  const similarPage = useAsync(loadSimilar);
  const similarRecipes = similarPage.data ? pickSimilar(similarPage.data.recipes, id, SIMILAR_COUNT) : [];

  const handleAddToPlan = () => {
    // Unchanged from before this work: the detail page has no day/meal picker yet
    showError('Add to Plan feature - requires meal plan modal integration');
  };

  const handleSimilarClick = (similarId: string) => {
    navigate(`/recipes/${similarId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!validId) return <NotAvailable />;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    if (error.kind === 'notFound' || error.kind === 'badRequest') return <NotAvailable />;
    return (
      <PageShell>
        <ErrorPanel message={error.message} onRetry={retry} />
      </PageShell>
    );
  }

  if (!recipe) return null;

  return (
    <div className="min-h-screen bg-gray-50" data-testid="recipe-detail">
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
            {/* Full-size photo */}
            <div className="relative h-96 md:h-auto">
              <img src={recipe.thumbnail} alt={recipe.name} className="w-full h-full object-cover" />
            </div>

            {/* Info */}
            <div className="p-8" data-testid="recipe-hero">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{recipe.name}</h1>

              <div className="flex flex-wrap gap-2 mb-6">
                {recipe.category && <Badge variant="primary">{recipe.category}</Badge>}
                {recipe.cuisine && <Badge variant="secondary">{recipe.cuisine}</Badge>}
                {recipe.tags.map((tag, index) => (
                  <Badge key={`${tag}-${index}`}>{tag}</Badge>
                ))}
              </div>

              {(recipe.youtubeUrl || recipe.sourceUrl) && (
                <div className="flex flex-wrap gap-4 mb-6">
                  {recipe.youtubeUrl && (
                    <a
                      href={recipe.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-medium text-red-600 hover:text-red-700"
                    >
                      <Youtube className="w-5 h-5" />
                      Watch on YouTube
                    </a>
                  )}
                  {recipe.sourceUrl && (
                    <a
                      href={recipe.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-medium text-primary-600 hover:text-primary-700"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Original recipe
                    </a>
                  )}
                </div>
              )}

              <RecipeActions recipe={recipe} onAddToPlan={handleAddToPlan} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Ingredients & Instructions */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Ingredients</h2>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li
                    key={`${index}-${ingredient.name}`}
                    data-testid="ingredient"
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-900">
                      {ingredient.measure && <span className="font-semibold">{ingredient.measure}</span>}{' '}
                      {ingredient.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Instructions</h2>
              <ol className="space-y-6">
                {recipe.instructions.map((step, index) => (
                  <li key={index} data-testid="instruction" className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Right Column - Nutrition & Similar */}
          <div className="space-y-8">
            <NutritionCard recipeId={recipe.id} />

            {similarRecipes.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6" data-testid="similar-recipes">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Recipes</h3>
                <div className="space-y-4">
                  {similarRecipes.map((similar) => (
                    <RecipeCard
                      key={similar.id}
                      recipe={similar}
                      variant="compact"
                      onClick={() => handleSimilarClick(similar.id)}
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
