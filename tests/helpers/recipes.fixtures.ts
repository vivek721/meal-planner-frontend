import type { Page, Route } from '@playwright/test';
import type { Recipe, RecipeCategory, RecipeSummary } from '../../src/types/recipe.types';
import { fulfillJson, fulfillPreflight, isPreflight } from './api.helper';

const MEAL_IMAGES = 'https://www.themealdb.com/images/media/meals';

/** 1×1 transparent PNG served for every TheMealDB image, so tests never reach TheMealDB. */
const PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

/**
 * The backend's raw 503 body text. `toRecipeApiError` ignores this body and
 * always maps a 503 to the fixed `RECIPES_UNAVAILABLE_MESSAGE` constant (see
 * below), so specs assert against that constant rather than this string; it
 * exists only to make `outage()`'s fixture response shaped like the real
 * backend's.
 */
export const RECIPES_UNAVAILABLE_ERROR = 'recipes are temporarily unavailable, please try again shortly';

/**
 * Mirrors `RECIPES_UNAVAILABLE_MESSAGE` from `src/services/api/recipesApi.ts`.
 * Not re-exported from there: that module imports `apiClient.ts`, which reads
 * `import.meta.env.VITE_API_URL` — Vite-only syntax that Playwright's test
 * loader (no Vite involved) cannot evaluate, so pulling it into a spec file
 * fails at collection time with "Cannot read properties of undefined".
 */
export const RECIPES_UNAVAILABLE_MESSAGE = 'Recipes are temporarily unavailable, please try again shortly';

function recipe(id: string, name: string, category: string, cuisine: string, extra: Partial<Recipe> = {}): Recipe {
  return {
    id,
    name,
    category,
    cuisine,
    thumbnail: `${MEAL_IMAGES}/${id}.jpg`,
    ingredients: [{ name: 'salt', measure: '1 pinch' }],
    instructions: ['Prepare the ingredients.', 'Cook and serve.'],
    tags: [],
    ...extra,
  };
}

export const RECIPES: Recipe[] = [
  recipe('52772', 'Teriyaki Chicken Casserole', 'Chicken', 'Japanese', {
    ingredients: [
      { name: 'soy sauce', measure: '3/4 cup' },
      { name: 'water', measure: '1/2 cup' },
      { name: 'brown sugar', measure: '1/4 cup' },
      { name: 'chicken breasts', measure: '2' },
    ],
    instructions: [
      'Preheat oven to 350° F.',
      'Combine soy sauce, water and brown sugar in a pan.',
      'Bake the chicken in the sauce for 35 minutes.',
    ],
    tags: ['Meat', 'Casserole'],
    youtubeUrl: 'https://www.youtube.com/watch?v=4aZr5hZXP_s',
  }),
  recipe('52795', 'Chicken Handi', 'Chicken', 'Indian'),
  recipe('52940', 'Brown Stew Chicken', 'Chicken', 'Jamaican', {
    tags: ['Stew'],
    sourceUrl: 'https://www.example.com/brown-stew-chicken',
  }),
  recipe('52874', 'Beef and Mustard Pie', 'Beef', 'British', { tags: ['Meat', 'Pie'] }),
  recipe('52959', 'Baked salmon with fennel & tomatoes', 'Seafood', 'British'),
  recipe('52835', 'Fettucine alfredo', 'Pasta', 'Italian'),
  recipe('52807', 'Baingan Bharta', 'Vegetarian', 'Indian'),
  recipe('52782', 'Lamb tomato and sweet spices', 'Lamb', 'Moroccan'),
  recipe('52885', 'Bubble & Squeak', 'Pork', 'British'),
  recipe('52854', 'Pancakes', 'Dessert', 'American'),
  recipe('52768', 'Apple Frangipan Tart', 'Dessert', 'British'),
  recipe('52965', 'Breakfast Potatoes', 'Breakfast', 'Canadian'),
  recipe('52895', 'English Breakfast', 'Breakfast', 'British'),
  recipe('52896', 'Full English Breakfast', 'Breakfast', 'British'),
  recipe('52957', 'Fruit and Cream Cheese Breakfast Pastries', 'Breakfast', 'American'),
  recipe('53000', 'Smoked Haddock Kedgeree', 'Breakfast', 'British'),
  // 30 recipes in one category, so results span two pages of 24
  ...Array.from({ length: 30 }, (_, i) =>
    recipe(String(60001 + i), `Misc Dish ${i + 1}`, 'Miscellaneous', 'British'),
  ),
];

const CATEGORY_NAMES = ['Beef', 'Breakfast', 'Chicken', 'Dessert', 'Lamb', 'Miscellaneous', 'Pasta', 'Pork', 'Seafood', 'Vegetarian'];

export const CATEGORIES: RecipeCategory[] = CATEGORY_NAMES.map((name) => ({
  name,
  thumbnail: `https://www.themealdb.com/images/category/${name.toLowerCase()}.png`,
  description: `${name} dishes from around the world.`,
}));

export const CUISINES: string[] = Array.from(new Set(RECIPES.map((r) => r.cuisine))).sort();

function toSummary(r: Recipe, withCategory: boolean, withCuisine: boolean): RecipeSummary {
  return {
    id: r.id,
    name: r.name,
    thumbnail: r.thumbnail,
    ...(withCategory ? { category: r.category } : {}),
    ...(withCuisine ? { cuisine: r.cuisine } : {}),
  };
}

// Mirrors the backend: case-insensitive filters, paging after filtering, and
// category/cuisine on summaries only when the backend would know them.
function search(url: URL): { status: number; body: unknown } {
  const param = (key: string) => (url.searchParams.get(key) ?? '').trim().toLowerCase();
  const q = param('q');
  const category = param('category');
  const cuisine = param('cuisine');
  const ingredient = param('ingredient');
  if (!q && !category && !cuisine && !ingredient) {
    return { status: 400, body: { error: 'provide at least one of q, category, cuisine or ingredient' } };
  }
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);
  const limit = Math.min(Number(url.searchParams.get('limit') ?? '24') || 24, 50);
  const matches = RECIPES.filter(
    (r) =>
      (!q || r.name.toLowerCase().includes(q)) &&
      (!category || r.category.toLowerCase() === category) &&
      (!cuisine || r.cuisine.toLowerCase() === cuisine) &&
      (!ingredient || r.ingredients.some((i) => i.name.toLowerCase() === ingredient)),
  );
  const recipes = matches
    .slice((page - 1) * limit, page * limit)
    .map((r) => toSummary(r, Boolean(q || category), Boolean(q || cuisine)));
  return { status: 200, body: { recipes, total: matches.length, page, totalPages: Math.ceil(matches.length / limit) } };
}

function respond(url: URL): { status: number; body: unknown } {
  const path = url.pathname;
  if (path === '/api/recipes/categories') return { status: 200, body: CATEGORIES };
  if (path === '/api/recipes/cuisines') return { status: 200, body: CUISINES };
  if (path === '/api/recipes') return search(url);
  const id = decodeURIComponent(path.slice('/api/recipes/'.length));
  if (!/^[1-9]\d*$/.test(id)) return { status: 400, body: { error: 'invalid recipe id' } };
  const found = RECIPES.find((r) => r.id === id);
  return found ? { status: 200, body: found } : { status: 404, body: { error: 'recipe not found' } };
}

export const isRecipesApi = (url: URL): boolean =>
  url.pathname === '/api/recipes' || url.pathname.startsWith('/api/recipes/');

export interface RecipesApiMock {
  /** `pathname + search` of every GET the fixtures answered, in order. */
  requests: string[];
}

/** Answers every /api/recipes* call from the fixtures and every TheMealDB image with a pixel. */
export async function mockRecipesApi(page: Page): Promise<RecipesApiMock> {
  const mock: RecipesApiMock = { requests: [] };
  await page.route('https://www.themealdb.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'image/png', body: PIXEL_PNG }),
  );
  await page.route(isRecipesApi, async (route) => {
    if (isPreflight(route)) return fulfillPreflight(route);
    const url = new URL(route.request().url());
    mock.requests.push(url.pathname + url.search);
    const { status, body } = respond(url);
    await fulfillJson(route, status, body);
  });
  return mock;
}

/**
 * Handles matching /api/recipes* requests before the fixtures (routes run in
 * reverse registration order). Call `route.fallback()` to hand one on to them.
 */
export async function overrideRecipesApi(
  page: Page,
  match: (url: URL) => boolean,
  handler: (route: Route) => Promise<void>,
): Promise<void> {
  await page.route(
    (url) => isRecipesApi(url) && match(url),
    async (route) => {
      if (isPreflight(route)) return route.fallback();
      await handler(route);
    },
  );
}

export interface Outage {
  /** Pass to overrideRecipesApi. */
  handler: (route: Route) => Promise<void>;
  /** Ends the outage: later calls fall back to the fixtures. */
  end: () => void;
}

/**
 * An outage for overrideRecipesApi: every matching call fails with `status`
 * (503 by default) until `end()` is called. This does not depend on how many
 * requests were made; React.StrictMode runs mount effects twice in dev, so
 * "fail the first N calls" would be flaky.
 */
export function outage(status = 503): Outage {
  let active = true;
  return {
    handler: async (route) => {
      if (active) {
        const error = status === 503 ? RECIPES_UNAVAILABLE_ERROR : 'request failed';
        return fulfillJson(route, status, { error });
      }
      await route.fallback();
    },
    end: () => {
      active = false;
    },
  };
}
