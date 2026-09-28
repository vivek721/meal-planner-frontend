import React, { useEffect, useMemo, useState } from 'react';
import { Filter, Search } from 'lucide-react';
import { Modal } from '../atoms/Modal';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { Dropdown } from '../atoms/Dropdown';
import { ErrorPanel } from '../molecules/ErrorPanel';
import { Pagination } from '../molecules/Pagination';
import { RecipeCard } from '../molecules/RecipeCard';
import { useAsync } from '../../hooks/useAsync';
import recipesApi, { DEFAULT_PAGE_SIZE, MAX_SEARCH_LENGTH } from '../../services/api/recipesApi';
import { loadCategories, loadCuisines } from '../../services/recipes/recipeData';
import { filterOptions, previewImage } from '../../services/recipes/recipeUtils';
import type { MealType, RecipeSummary } from '../../types/recipe.types';

interface RecipeBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipe: (recipe: RecipeSummary) => void;
  dayName?: string;
  mealType?: MealType;
}

const SEARCH_DELAY_MS = 300;

/** The category the picker opens on, so there is something to choose straight away. */
const DEFAULT_CATEGORY: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Chicken',
  dinner: 'Chicken',
  snacks: 'Dessert',
};

export const RecipeBrowserModal: React.FC<RecipeBrowserModalProps> = ({
  isOpen,
  onClose,
  onSelectRecipe,
  dayName,
  mealType,
}) => {
  const [nameInput, setNameInput] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(mealType ? DEFAULT_CATEGORY[mealType] : '');
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [cuisine, setCuisine] = useState('');
  const [page, setPage] = useState(1);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeSummary | null>(null);

  // Apply the name search after a short pause. It searches every category
  // unless the user picked one themselves.
  useEffect(() => {
    const next = nameInput.trim();
    if (next === query) return;
    const timer = setTimeout(() => {
      setQuery(next);
      setPage(1);
      if (next && !categoryTouched) setCategory('');
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [nameInput, query, categoryTouched]);

  const categories = useAsync(loadCategories);
  const cuisines = useAsync(loadCuisines);
  const hasCriteria = Boolean(query || category || cuisine);
  const loadResults = useMemo(
    () =>
      hasCriteria
        ? () => recipesApi.searchRecipes({ q: query, category, cuisine, page, limit: DEFAULT_PAGE_SIZE })
        : null,
    [hasCriteria, query, category, cuisine, page],
  );
  const results = useAsync(loadResults);

  const categoryOptions = filterOptions('All categories', (categories.data ?? []).map((c) => c.name), category);
  const cuisineOptions = filterOptions('All cuisines', cuisines.data ?? [], cuisine);

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setCategoryTouched(true);
    setPage(1);
  };

  const handleCuisineChange = (value: string) => {
    setCuisine(value);
    setPage(1);
  };

  const handleAddRecipe = () => {
    if (!selectedRecipe) return;
    onSelectRecipe(selectedRecipe);
    onClose();
  };

  const total = results.data?.total ?? 0;
  const summary = !hasCriteria
    ? ''
    : results.loading
      ? 'Searching...'
      : results.data
        ? `${total} ${total === 1 ? 'recipe' : 'recipes'} found`
        : '';
  const selectedMeta = selectedRecipe
    ? [selectedRecipe.category, selectedRecipe.cuisine].filter(Boolean).join(' • ')
    : '';

  let body: React.ReactNode;
  if (!hasCriteria) {
    body = (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Search className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Find a recipe</h3>
        <p className="text-gray-600">Search by name, or choose a category or cuisine</p>
      </div>
    );
  } else if (results.loading) {
    body = (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  } else if (results.error) {
    body = <ErrorPanel compact message={results.error.message} onRetry={results.retry} />;
  } else if (!results.data || results.data.recipes.length === 0) {
    body = (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Filter className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
        <p className="text-gray-600">Try adjusting your search or filters</p>
      </div>
    );
  } else {
    body = (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.data.recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onClick={() => setSelectedRecipe(recipe)} />
          ))}
        </div>
        <Pagination page={results.data.page} totalPages={results.data.totalPages} onPageChange={setPage} />
      </>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Recipe" size="xl">
      <div className="flex flex-col h-[70vh] max-h-[700px]">
        {dayName && mealType && (
          <p className="text-sm text-gray-600 mb-4">
            to {dayName} {mealType}
          </p>
        )}

        {/* Search and filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <Input
              type="text"
              aria-label="Search recipes by name"
              placeholder="Search recipes by name..."
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={MAX_SEARCH_LENGTH}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Dropdown
              ariaLabel="Category"
              value={category}
              onChange={handleCategoryChange}
              options={categoryOptions}
              placeholder=""
              className="flex-1 min-w-[150px]"
            />
            <Dropdown
              ariaLabel="Cuisine"
              value={cuisine}
              onChange={handleCuisineChange}
              options={cuisineOptions}
              placeholder=""
              className="flex-1 min-w-[150px]"
            />
          </div>

          <p className="text-sm text-gray-600">{summary}</p>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6">{body}</div>

        {/* Footer with selected recipe */}
        {selectedRecipe && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={previewImage(selectedRecipe.thumbnail)}
                  alt={selectedRecipe.name}
                  className="w-12 h-12 rounded-md object-cover"
                />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{selectedRecipe.name}</p>
                  {selectedMeta && <p className="text-sm text-gray-600">{selectedMeta}</p>}
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
