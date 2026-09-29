import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, Home, Search } from 'lucide-react';
import { Breadcrumb } from '../components/atoms/Breadcrumb';
import { Button } from '../components/atoms/Button';
import { Dropdown } from '../components/atoms/Dropdown';
import { Input } from '../components/atoms/Input';
import { CategoryGrid } from '../components/molecules/CategoryGrid';
import { ErrorPanel } from '../components/molecules/ErrorPanel';
import { Pagination } from '../components/molecules/Pagination';
import { RecipeCard } from '../components/molecules/RecipeCard';
import { useAsync } from '../hooks/useAsync';
import recipesApi, { DEFAULT_PAGE_SIZE, MAX_SEARCH_LENGTH } from '../services/api/recipesApi';
import { loadCategories, loadCuisines } from '../services/recipes/recipeData';
import { filterOptions, listedSpelling } from '../services/recipes/recipeUtils';

type FilterKey = 'q' | 'category' | 'cuisine' | 'ingredient';

const SEARCH_DELAY_MS = 300;

const readPage = (value: string | null): number => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

const Skeletons: React.FC<{ count: number; height: string }> = ({ count, height }) => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`${height} bg-gray-200 rounded-lg animate-pulse`}></div>
    ))}
  </div>
);

export const Recipes: React.FC = () => {
  const navigate = useNavigate();

  // Filters live in the URL, so Back from a recipe returns to the same results
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? '';
  const cuisine = searchParams.get('cuisine') ?? '';
  const ingredient = searchParams.get('ingredient') ?? '';
  const page = readPage(searchParams.get('page'));
  const hasCriteria = Boolean(q || category || cuisine || ingredient);

  // Any filter change goes back to page 1
  const setFilters = useCallback(
    (changes: Partial<Record<FilterKey, string>>, replace = false) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(changes)) {
            const trimmed = (value ?? '').trim();
            if (trimmed) next.set(key, trimmed);
            else next.delete(key);
          }
          next.delete('page');
          return next;
        },
        { replace },
      );
    },
    [setSearchParams],
  );

  // Text inputs update the URL after a short pause, and follow the URL when
  // it changes (Back, "Back to categories")
  const [nameInput, setNameInput] = useState(q);
  const [ingredientInput, setIngredientInput] = useState(ingredient);
  useEffect(() => {
    setNameInput((current) => (current.trim() === q ? current : q));
  }, [q]);
  useEffect(() => {
    setIngredientInput((current) => (current.trim() === ingredient ? current : ingredient));
  }, [ingredient]);
  useEffect(() => {
    if (nameInput.trim() === q && ingredientInput.trim() === ingredient) return;
    const timer = setTimeout(() => setFilters({ q: nameInput, ingredient: ingredientInput }, true), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [nameInput, ingredientInput, q, ingredient, setFilters]);

  const categories = useAsync(loadCategories);
  const cuisines = useAsync(loadCuisines);
  const loadResults = useMemo(
    () =>
      hasCriteria
        ? () => recipesApi.searchRecipes({ q, category, cuisine, ingredient, page, limit: DEFAULT_PAGE_SIZE })
        : null,
    [hasCriteria, q, category, cuisine, ingredient, page],
  );
  const results = useAsync(loadResults);

  const categoryOptions = filterOptions('All categories', (categories.data ?? []).map((c) => c.name), category);
  const cuisineOptions = filterOptions('All cuisines', cuisines.data ?? [], cuisine);

  // Tidy hand-typed URLs, replacing the history entry so Back still works:
  // drop an invalid page number, move a page past the end to the last page,
  // and use the listed spelling of a category or cuisine ("beef" → "Beef").
  const rawPage = searchParams.get('page');
  const lastPage =
    results.data && results.data.total > 0 && page > results.data.totalPages ? results.data.totalPages : null;
  const listedCategory = categories.data
    ? listedSpelling(
        categories.data.map((c) => c.name),
        category,
      )
    : undefined;
  const listedCuisine = cuisines.data ? listedSpelling(cuisines.data, cuisine) : undefined;
  useEffect(() => {
    const fixes: Record<string, string | null> = {};
    if (rawPage !== null && rawPage !== String(page)) fixes.page = page > 1 ? String(page) : null;
    if (lastPage !== null) fixes.page = String(lastPage);
    if (listedCategory && listedCategory !== category) fixes.category = listedCategory;
    if (listedCuisine && listedCuisine !== cuisine) fixes.cuisine = listedCuisine;
    if (Object.keys(fixes).length === 0) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(fixes)) {
          if (value === null) next.delete(key);
          else next.set(key, value);
        }
        return next;
      },
      { replace: true },
    );
  }, [rawPage, page, lastPage, category, listedCategory, cuisine, listedCuisine, setSearchParams]);

  const showCategory = (name: string) => setFilters({ category: name, q: '', cuisine: '', ingredient: '' });
  const backToCategories = () => setSearchParams(new URLSearchParams());
  const goToPage = (next: number) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set('page', String(next));
      return params;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const total = results.data?.total ?? 0;
  const summary = results.loading
    ? 'Searching...'
    : results.data
      ? `${total} ${total === 1 ? 'recipe' : 'recipes'}`
      : '';

  let body: React.ReactNode;
  if (!hasCriteria) {
    if (categories.loading) {
      body = <Skeletons count={8} height="h-48" />;
    } else if (categories.error) {
      body = <ErrorPanel message={categories.error.message} onRetry={categories.retry} />;
    } else {
      body = (
        <>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Browse by category</h2>
          <CategoryGrid categories={categories.data ?? []} onSelect={showCategory} />
        </>
      );
    }
  } else if (results.loading) {
    body = <Skeletons count={8} height="h-72" />;
  } else if (results.error) {
    // A rejected request (e.g. a search over 100 characters) fails the same way every time
    const canRetry = results.error.kind !== 'badRequest';
    body = <ErrorPanel message={results.error.message} onRetry={canRetry ? results.retry : undefined} />;
  } else if (!results.data || results.data.recipes.length === 0) {
    body = (
      <>
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No recipes found</h2>
          <p className="text-gray-600">Try a different name or filter, or browse by category.</p>
        </div>
        <Pagination page={page} totalPages={results.data?.totalPages ?? 0} onPageChange={goToPage} />
      </>
    );
  } else {
    body = (
      <>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.data.recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onClick={() => navigate(`/recipes/${recipe.id}`)} />
          ))}
        </div>
        <Pagination page={results.data.page} totalPages={results.data.totalPages} onPageChange={goToPage} />
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
              { label: 'Recipes' },
            ]}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Recipe Collection</h1>
          <p className="text-gray-600">Real recipes and photos from TheMealDB</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <Input
                type="text"
                aria-label="Search recipes by name"
                placeholder="Search recipes by name..."
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={MAX_SEARCH_LENGTH}
                className="pl-10 py-3"
              />
            </div>
            <Dropdown
              ariaLabel="Category"
              value={category}
              onChange={(value) => setFilters({ category: value })}
              options={categoryOptions}
              placeholder=""
            />
            <Dropdown
              ariaLabel="Cuisine"
              value={cuisine}
              onChange={(value) => setFilters({ cuisine: value })}
              options={cuisineOptions}
              placeholder=""
            />
            <Input
              type="text"
              aria-label="Main ingredient"
              placeholder="Main ingredient, e.g. chicken"
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
              maxLength={MAX_SEARCH_LENGTH}
              className="py-3"
            />
          </div>

          {hasCriteria && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">{summary}</p>
              <Button variant="ghost" size="sm" onClick={backToCategories}>
                <ArrowLeft className="w-4 h-4" />
                Back to categories
              </Button>
            </div>
          )}
        </div>

        {body}
      </div>
    </div>
  );
};
