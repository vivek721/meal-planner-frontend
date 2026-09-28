# TheMealDB Frontend Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 70 bundled mock recipes with real TheMealDB recipes from the Go backend's `/api/recipes` endpoints on every recipe screen (browse, detail, favourites, meal-plan picker, suggestions), and remove the fields TheMealDB does not have.

**Architecture:** A typed `recipesApi` on the shared axios `apiClient` turns HTTP failures into a `RecipeApiError` (a 503 becomes the "temporarily unavailable" message). A small data layer adds an in-memory per-session cache (recipe details, categories, cuisines), favourites storage that drops old mock ids, and pure helpers. Screens load data through one `useAsync` hook that ignores stale responses, and they show a shared `ErrorPanel` with Retry. Meal-plan slots store the chosen summary and render without API calls. `SuggestionService` replaces `MockAIService`. The old types are parked in `legacyRecipe.types.ts` so screens migrate one at a time, and the mock data and the synchronous search/sort/scaling code are deleted last. The app builds after every task.

**Tech Stack:** React 18.3, TypeScript 5.6, Vite 5.4, Tailwind 3.4, React Router 6.30, axios 1.20, lucide-react 0.446, Playwright 1.56. One new dev dependency: Vitest 3.2, used for pure-logic unit tests only (see Global Constraints).

**Spec:** `D:/ProjectsWS/meal-planner/meal-planner-backend/docs/superpowers/specs/2026-09-28-themealdb-integration-design.md` (read it first). This plan covers spec §4, the frontend half of §5, and §6 step 2 up to the push. The controller pushes and opens the PR after the final review; that is not a task here. The backend half is merged and live on backend `main`.

**Branch:** `feat/themealdb-recipes` in `D:/ProjectsWS/meal-planner/meal-planner-frontend`. It was created from `main` and is clean.

## Global Constraints

- **API contract.** This is what the backend really does (`internal/handlers/recipe_handler.go`, `internal/services/recipe_service.go`, `recipe_search.go`):
  - Every `/api/recipes*` route needs `Authorization: Bearer <token>`, which `apiClient`'s interceptor adds. On a 401, `apiClient` clears the stored session and dispatches `unauthorized`. `AuthContext` then sets `user` to `null`, and `ProtectedRoute` redirects to `/login`.
  - `GET /api/recipes?q=&category=&cuisine=&ingredient=&page=&limit=` returns `{ recipes: RecipeSummary[], total, page, totalPages }`. It returns 400 if none of `q`/`category`/`cuisine`/`ingredient` is given, if any of them is over **100 characters**, or if `page`/`limit` is not a positive integer. `limit` defaults to **24** and is capped at **50**. A page past the end returns `"recipes": []` with the real `total`.
  - `GET /api/recipes/:id` returns a `Recipe`. It returns 400 for a non-numeric id and 404 for an unknown one.
  - `GET /api/recipes/categories` returns `[{ name, thumbnail, description }]`. `GET /api/recipes/cuisines` returns a sorted `string[]`.
  - `RecipeSummary` is `{ id, name, thumbnail, category?, cuisine? }`. `Recipe` is `{ id, name, thumbnail, category, cuisine, ingredients: [{ name, measure }], instructions: string[], tags: string[], youtubeUrl?, sourceUrl? }`. The backend always sends the arrays, never `null`. Errors are `{ "error": "..." }`. A 503 means TheMealDB is down and nothing is cached.
- **The client never sends input the backend would reject.** Search text inputs have `maxLength={100}`. `buildSearchParams` trims values, drops blank ones, refuses an empty search or a value over 100 characters, and caps `limit` at 50.
- **Exact UI strings:**
  - For a 503: `Recipes are temporarily unavailable, please try again shortly`
  - For an old or unknown recipe: `This recipe is no longer available`
  - Nutrition panel: `Nutrition information coming soon`
  - YouTube link: `Watch on YouTube`
  - Suggestion reasons: `Breakfast idea`, `Something different this week`, or `<Category> idea`
- **Suggestion rules:**
  - Before 11:00 local time the category is `Breakfast`. Otherwise it is one of `Chicken, Beef, Pasta, Seafood, Vegetarian, Lamb, Pork`, preferring categories not yet planned this week.
  - Recipes already planned this week are excluded.
  - One category fetch (`limit=50`), then 4 recipes picked at random.
- **Categories.** TheMealDB's categories are Beef, Breakfast, Chicken, Dessert, Goat, Lamb, Miscellaneous, Pasta, Pork, Seafood, Side, Starter, Vegan and Vegetarian. `category` is typed `string`, because the list comes from `/categories`. It is not a union.
- **Images.**
  - Lists, cards, meal slots and the picker use TheMealDB's small preview (`<thumbnail>/preview`) through `previewImage()`. The detail page uses the full image.
  - `previewImage` only rewrites `https://www.themealdb.com/images/media/meals/<file>.jpg|png`. It never touches data URIs (old slots) or category images.
- **Removed everywhere:** `prepTime`, `cookTime`, `servings`, `nutrition`, `rating`, `reviewCount`, `description`, `dietaryTags`, the serving adjuster, and the time, rating and popularity sorts.
- **localStorage keys do not change:**
  - Favourites: `user_favorites_<userId>`, a JSON array of ids
  - Meal plans: `mealPlans_<userId>_<yyyy-MM-dd of the Sunday>`
  - Auth: `meal_planner_auth_token` and `meal_planner_current_user`
- **Tests:**
  - **Vitest** (`npm run test:unit`) covers pure data-layer logic only. It runs in the Node environment with no DOM and no React Testing Library. Test files are `src/**/*.test.ts`.
    - *Why add it:* the spec only requires typecheck, lint, build and Playwright. But the API error mapping, the cache, the favourites migration, the meal-slot shape and the suggestion rules are branchy logic. Playwright can only reach them slowly and indirectly, and the suggestion randomness and time of day need injecting. Vitest gives those tasks a sub-second red/green cycle for one dev dependency, and it reuses Vite's toolchain.
  - **Playwright** specs that touch recipes are hermetic, so they need neither the backend nor TheMealDB:
    - `tests/helpers/recipes.fixtures.ts` intercepts every `/api/recipes*` request with fixture data, and every `https://www.themealdb.com/**` image with a 1×1 PNG.
    - `tests/helpers/session.helper.ts` fakes a signed-in session by seeding the stored session and intercepting `GET /api/auth/me`.
    - `epic1-authentication.spec.ts` is unchanged and still needs the real backend.
  - The app renders inside `React.StrictMode` (`src/main.tsx`), so in dev every mount runs its effects twice, and an uncached load (a search) can be requested twice. Tests must not count search requests or rely on "fail the first N calls". Use `outage()` from the fixtures, which fails until the test calls `end()`, then click Retry. Cached loads (details, categories, cuisines) share one in-flight request, so counting those is safe.
  - Run Playwright per task with `--project=chromium` to save memory.
  - `epic2-meal-planning.spec.ts` has failures from before this work; for example, its `[class*="Day"]` selectors match nothing. Task 3 records a baseline of them, and later tasks must not add new ones. **Epic2 regression check** (the output must be empty):
    ```bash
    cd D:/ProjectsWS/meal-planner/meal-planner-frontend
    BROWSER=none PLAYWRIGHT_JSON_OUTPUT_FILE=D:/ProjectsWS/meal-planner/.e2e/epic2-current.json npx playwright test tests/epic2-meal-planning.spec.ts --project=chromium --reporter=json || true
    node ../.e2e/e2e-failures.cjs ../.e2e/epic2-current.json ../.e2e/epic2-baseline.txt
    ```
- **Environment:**
  - Windows 11 with Git Bash: use Unix syntax and forward slashes. Tool calls reset the working directory, so start each command with `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && ...`.
  - `core.autocrlf=true`: the working tree is CRLF and commits are LF. That is expected, not a diff to fix.
  - Node v20.16 locally (CI uses 18.x and 20.x) with npm. The Vite 5 dev server runs on port 3000 with `--strictPort`, and the backend on 3001.
  - Prefix Playwright commands with `BROWSER=none` so Vite's `open: true` does not open a browser window.
  - Memory on this machine is tight. Stop anything you start (dev servers, the Docker stack) as soon as the step that needs it is done.
- **Verify commands for every task:** `npx tsc --noEmit`, `npm run lint` (zero warnings allowed), `npm run build`, `npm run test:unit`, and that task's Playwright spec.
- Every commit message ends with:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_014u1dJTmEC1ARhmephG3Zfk
  ```
- **No push and no PR in this plan.**

## Review Focus

The spec implies each of these, but tasks could easily miss them. Each one has a test in the task noted.
1. **A 401 in the middle of a session.** An expired token on any recipe call must sign the user out and land on `/login`, with no error-panel loop and no retry storm. See Task 4 (`an expired session (401) signs the user out`).
2. **A 503 or network failure on every screen.** Browse, detail, favourites, the picker and suggestions each show the shared error panel with Retry, and Retry recovers. The panel shows the exact 503 text, or the connection message when no response arrives. A failed request is never cached. See Task 2 (failures are not cached), Task 4 (503 and network), Task 5 (detail 503), Task 6 (favourites 503), Task 7 (picker 503) and Task 8 (suggestions 503).
3. **Empty and partial results are not errors.**
   - A search with no matches shows an empty state, not the error panel.
   - A favourite that TheMealDB no longer has (404) is skipped; it does not fail the page.
   - When most candidates are already planned, suggestions show fewer, or none.

   See Task 4 (empty search), Task 6 (404 favourite skipped) and Task 8 (planned recipes excluded; unit and e2e).
4. **Old localStorage data.**
   - Favourites can hold `recipe-001`-style ids, duplicates or corrupt JSON. Old ids are dropped, and the stored list is rewritten, on first load.
   - Meal-plan slots can have `prepTime`, a data-URI thumbnail and no `category`. They still render from storage.
   - Opening an old slot, or a bookmarked `/recipes/recipe-001` URL, shows "This recipe is no longer available" without calling the API.

   See Task 2 (migration unit tests), Task 5 (old id, no request), Task 6 (dropped and rewritten) and Task 7 (old slot, unit and e2e).
5. **Stale responses when input changes quickly.** A slow response for an older search must not overwrite newer results, and concurrent requests for the same recipe share one fetch. See Task 2 (a concurrent `get` shares one request) and Task 4 (`ignores a slow response for an older search`).

---

## File Structure

| File | Responsibility |
|---|---|
| `package.json`, `package-lock.json` (modify) | `vitest` dev dependency and the `test:unit` script |
| `vitest.config.ts` (create) | Unit tests are `src/**/*.test.ts` and run in the Node environment |
| `.github/workflows/ci.yml` (modify) | Run the unit tests in CI |
| `src/types/recipe.types.ts` (modify) | The §3 contract types (`Recipe`, `RecipeSummary`, `RecipePage`, `RecipeCategory`, `RecipeQuery`, `Ingredient`). `MealSlot` loses `prepTime` and gains an optional `category` (Task 7) |
| `src/types/legacyRecipe.types.ts` (create in Task 1, delete in Task 9) | The old mock types, parked so screens can migrate one at a time |
| `src/services/api/recipesApi.ts` + `.test.ts` (create) | Typed calls on `apiClient`, parameter cleaning, `RecipeApiError` mapping |
| `src/services/recipes/asyncCache.ts` + `.test.ts` (create) | Per-session memoisation: shares in-flight requests and never caches failures |
| `src/services/recipes/recipeData.ts` (create) | Cached `getRecipe`, `loadCategories` and `loadCuisines` |
| `src/services/recipes/recipeUtils.ts` + `.test.ts` (create) | `isRecipeId`, `previewImage`, `pickSimilar`, `filterOptions` |
| `src/services/recipes/favorites.ts` + `.test.ts` (create) | Favourite ids in localStorage, the old-id migration, and loading their details |
| `src/test/memoryStorage.ts` (create) | An in-memory `localStorage` for unit tests |
| `src/hooks/useAsync.ts` (create) | Loads data, ignores stale responses and exposes `retry` |
| `src/components/molecules/ErrorPanel.tsx`, `Pagination.tsx`, `CategoryGrid.tsx` (create) | The shared error state with Retry, paging, and the category tiles |
| `src/components/atoms/Dropdown.tsx` (modify) | New `ariaLabel` prop |
| `src/components/molecules/RecipeCard.tsx` (modify) | Renders a `RecipeSummary` with the preview image |
| `src/pages/Recipes.tsx` (rewrite) | Category landing, search, filters, paging and states |
| `src/pages/RecipeDetail.tsx` (rewrite) | Recipe detail, "no longer available", and similar recipes |
| `src/components/molecules/NutritionCard.tsx` (rewrite), `RecipeActions.tsx` (modify) | "Nutrition information coming soon"; actions take a `RecipeSummary` |
| `src/contexts/RecipeContext.tsx`, `src/contexts/useRecipes.ts` (rewrite) | Favourites only |
| `src/pages/Favorites.tsx` (rewrite) | Favourites from the cache, name search and category filter |
| `src/services/MealPlanService.ts` + `.test.ts` (modify, create test) | `addMeal` takes a summary |
| `src/components/molecules/MealSlot.tsx` (rewrite) | Renders the stored slot and links to the recipe |
| `src/components/organisms/MealPlanCalendar.tsx`, `src/pages/MealPlan.tsx` (modify) | Summary types; the picker is mounted only while it is open |
| `src/components/organisms/RecipeBrowserModal.tsx` (rewrite) | The API picker: search, category, cuisine and paging |
| `src/services/SuggestionService.ts` + `.test.ts` (create) | The time-of-day and variety heuristic over one category fetch |
| `src/components/organisms/MealSuggestions.tsx`, `src/components/molecules/SuggestionCard.tsx` (rewrite) | The suggestions UI on the new service |
| Deleted | `src/data/mockRecipes.ts`, `src/utils/recipeThumbnail.ts`, `src/services/RecipeService.ts`, `src/services/MockAIService.ts`, `src/components/atoms/ServingAdjuster.tsx`, `src/components/molecules/RecipeSearchBar.tsx` (already unused), `src/types/legacyRecipe.types.ts` |
| `src/components/organisms/OnboardingModal.tsx`, `README.md`, `tests/README.md` (modify) | Copy |
| `tests/helpers/api.helper.ts`, `session.helper.ts`, `recipes.fixtures.ts` (create) | The hermetic Playwright harness |
| `tests/recipes.spec.ts`, `recipe-detail.spec.ts`, `favorites.spec.ts`, `meal-plan-recipes.spec.ts`, `suggestions.spec.ts` (create) | End-to-end tests for each screen |
| `tests/epic2-meal-planning.spec.ts`, `tests/helpers/mealplan.helper.ts` (modify) | Hermetic session, recipe interception and stable selectors |
| `D:/ProjectsWS/meal-planner/.e2e/` (outside the repo, never committed) | `e2e-failures.cjs` and the epic2 baseline |

---

### Task 1: Vitest, contract types and `recipesApi`

**Files:**
- Create: `vitest.config.ts`, `src/types/legacyRecipe.types.ts`, `src/services/api/recipesApi.ts`
- Test: `src/services/api/recipesApi.test.ts`
- Modify: `package.json`, `package-lock.json`, `.github/workflows/ci.yml`, `src/types/recipe.types.ts`, and the type imports in 17 files (listed in Step 3)

**Interfaces:**
- Consumes: `apiClient` (default export of `src/services/api/apiClient.ts`; `get<T>(url, config?)`).
- Produces (used by every later task):

```ts
// src/types/recipe.types.ts
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';
export interface Ingredient { name: string; measure: string }
export interface RecipeSummary { id: string; name: string; thumbnail: string; category?: string; cuisine?: string }
export interface Recipe { id: string; name: string; thumbnail: string; category: string; cuisine: string;
  ingredients: Ingredient[]; instructions: string[]; tags: string[]; youtubeUrl?: string; sourceUrl?: string }
export interface RecipePage { recipes: RecipeSummary[]; total: number; page: number; totalPages: number }
export interface RecipeCategory { name: string; thumbnail: string; description: string }
export interface RecipeQuery { q?: string; category?: string; cuisine?: string; ingredient?: string; page?: number; limit?: number }
// MealSlot, DayMeals, MealPlan: unchanged until Task 7

// src/services/api/recipesApi.ts
export const RECIPES_UNAVAILABLE_MESSAGE: string;  // 'Recipes are temporarily unavailable, please try again shortly'
export const RECIPE_NOT_AVAILABLE_MESSAGE: string; // 'This recipe is no longer available'
export const NETWORK_ERROR_MESSAGE: string, SESSION_EXPIRED_MESSAGE: string, GENERIC_ERROR_MESSAGE: string,
  NO_CRITERIA_MESSAGE: string, TOO_LONG_MESSAGE: string;
export const MAX_SEARCH_LENGTH = 100, DEFAULT_PAGE_SIZE = 24, MAX_PAGE_SIZE = 50;
export type RecipeErrorKind = 'unavailable' | 'notFound' | 'badRequest' | 'unauthorized' | 'network' | 'unknown';
export class RecipeApiError extends Error { readonly kind: RecipeErrorKind; readonly status?: number }
export function toRecipeApiError(error: unknown): RecipeApiError;
export function buildSearchParams(query: RecipeQuery): RecipeQuery; // throws RecipeApiError('badRequest')
declare const recipesApi: {                       // default export; every method rejects with RecipeApiError
  searchRecipes(query: RecipeQuery): Promise<RecipePage>;
  getRecipe(id: string): Promise<Recipe>;
  getCategories(): Promise<RecipeCategory[]>;
  getCuisines(): Promise<string[]>;
};
export default recipesApi;
```

- [ ] **Step 1: Add Vitest.** Run:

```bash
cd D:/ProjectsWS/meal-planner/meal-planner-frontend && npm install --save-dev vitest@^3.2.4
```

In `package.json` `scripts`, add this line after `"test": "playwright test",`:

```json
    "test:unit": "vitest run",
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

// Unit tests cover pure data-layer logic only (no DOM); Playwright covers the UI.
// Restricted to src/ so Vitest never picks up the Playwright specs in tests/.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
```

In `.github/workflows/ci.yml`, after the `Type check` step (`run: npx tsc --noEmit`), add:

```yaml
      - name: Unit tests
        run: npm run test:unit
```

- [ ] **Step 2: Park the old types and add the contract types.** Create `src/types/legacyRecipe.types.ts`:

```ts
// Types for the bundled mock catalogue (src/data/mockRecipes.ts). Screens move
// to the API types in recipe.types.ts one at a time; this file is deleted with
// the mock data once nothing imports it.
export type MealCategory = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Dessert';

export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber?: number; // grams
  sugar?: number; // grams
}

export interface Recipe {
  id: string;
  name: string;
  category: MealCategory;
  cuisine: string;
  thumbnail: string;
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  dietaryTags: string[];
  nutrition: NutritionInfo;
  description?: string;
  rating?: number;
  reviewCount?: number;
}

export interface RecipeFilter {
  category?: MealCategory[];
  dietaryTags?: string[];
  maxPrepTime?: number;
  searchQuery?: string;
  cuisine?: string[];
}
```

Replace the whole of `src/types/recipe.types.ts` with:

```ts
// Recipe types follow the backend's /api/recipes contract (TheMealDB data).
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

/** One ingredient line. `measure` is TheMealDB's free text, e.g. "3/4 cup". */
export interface Ingredient {
  name: string;
  measure: string;
}

/**
 * A search result. `category` and `cuisine` are present only when the API
 * knows them (the request filtered on them, or it was a name search).
 */
export interface RecipeSummary {
  id: string;
  name: string;
  thumbnail: string;
  category?: string;
  cuisine?: string;
}

/** A full recipe from GET /api/recipes/:id. */
export interface Recipe {
  id: string;
  name: string;
  thumbnail: string;
  category: string;
  cuisine: string;
  ingredients: Ingredient[];
  instructions: string[];
  tags: string[];
  youtubeUrl?: string;
  sourceUrl?: string;
}

/** One page of GET /api/recipes results. */
export interface RecipePage {
  recipes: RecipeSummary[];
  total: number;
  page: number;
  totalPages: number;
}

/** An entry from GET /api/recipes/categories. */
export interface RecipeCategory {
  name: string;
  thumbnail: string;
  description: string;
}

/** Query for GET /api/recipes; at least one of q/category/cuisine/ingredient is required. */
export interface RecipeQuery {
  q?: string;
  category?: string;
  cuisine?: string;
  ingredient?: string;
  page?: number;
  limit?: number;
}

export interface MealSlot {
  recipeId: string;
  recipeName: string;
  thumbnail: string;
  prepTime: number;
  addedAt: string; // ISO timestamp
}

export interface DayMeals {
  breakfast?: MealSlot;
  lunch?: MealSlot;
  dinner?: MealSlot;
  snacks?: MealSlot;
}

export interface MealPlan {
  userId: string;
  weekStartDate: string; // ISO date (e.g., "2025-10-12")
  days: {
    [dayKey: string]: DayMeals; // dayKey format: "2025-10-12"
  };
}
```

- [ ] **Step 3: Point the old code at the parked types.** Change exactly these import lines. No other lines change.

| File | Replace | With |
|---|---|---|
| `src/components/molecules/NutritionCard.tsx` | `import { NutritionInfo } from '../../types/recipe.types';` | `import { NutritionInfo } from '../../types/legacyRecipe.types';` |
| `src/components/molecules/RecipeActions.tsx` | `import type { Recipe } from '../../types/recipe.types';` | `import type { Recipe } from '../../types/legacyRecipe.types';` |
| `src/components/molecules/RecipeCard.tsx` | `import type { Recipe } from '../../types/recipe.types';` | `import type { Recipe } from '../../types/legacyRecipe.types';` |
| `src/components/molecules/SuggestionCard.tsx` | `import type { Recipe } from '../../types/recipe.types';` | `import type { Recipe } from '../../types/legacyRecipe.types';` |
| `src/components/organisms/MealPlanCalendar.tsx` | `import type { MealPlan, MealType, Recipe } from '../../types/recipe.types';` | `import type { MealPlan, MealType } from '../../types/recipe.types';` + new line `import type { Recipe } from '../../types/legacyRecipe.types';` |
| `src/components/organisms/MealSuggestions.tsx` | `import type { MealType, Recipe } from '../../types/recipe.types';` | `import type { MealType } from '../../types/recipe.types';` + new line `import type { Recipe } from '../../types/legacyRecipe.types';` |
| `src/components/organisms/RecipeBrowserModal.tsx` | `import type { MealCategory, Recipe, RecipeFilter } from '../../types/recipe.types';` | `import type { MealCategory, Recipe, RecipeFilter } from '../../types/legacyRecipe.types';` |
| `src/contexts/RecipeContext.tsx` | `import { Recipe, RecipeFilter } from '../types/recipe.types';` | `import { Recipe, RecipeFilter } from '../types/legacyRecipe.types';` |
| `src/contexts/useRecipes.ts` | `import type { Recipe, RecipeFilter } from '../types/recipe.types';` | `import type { Recipe, RecipeFilter } from '../types/legacyRecipe.types';` |
| `src/data/mockRecipes.ts` | `import { Recipe } from '../types/recipe.types';` | `import { Recipe } from '../types/legacyRecipe.types';` |
| `src/pages/Favorites.tsx` | `import type { Recipe, MealCategory } from '../types/recipe.types';` | `import type { Recipe, MealCategory } from '../types/legacyRecipe.types';` |
| `src/pages/MealPlan.tsx` | `import type { MealPlan as MealPlanData, MealType, Recipe } from '../types/recipe.types';` | `import type { MealPlan as MealPlanData, MealType } from '../types/recipe.types';` + new line `import type { Recipe } from '../types/legacyRecipe.types';` |
| `src/pages/RecipeDetail.tsx` | `import type { Recipe } from '../types/recipe.types';` | `import type { Recipe } from '../types/legacyRecipe.types';` |
| `src/pages/Recipes.tsx` | `import type { Recipe, RecipeFilter, MealCategory } from '../types/recipe.types';` | `import type { Recipe, RecipeFilter, MealCategory } from '../types/legacyRecipe.types';` |
| `src/services/MockAIService.ts` | `import { Recipe } from '../types/recipe.types';` | `import { Recipe } from '../types/legacyRecipe.types';` |
| `src/services/RecipeService.ts` | `import { Recipe, RecipeFilter, MealCategory } from '../types/recipe.types';` | `import { Recipe, RecipeFilter, MealCategory } from '../types/legacyRecipe.types';` |
| `src/utils/recipeThumbnail.ts` | `import type { MealCategory } from '../types/recipe.types';` | `import type { MealCategory } from '../types/legacyRecipe.types';` |

Run: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && npx tsc --noEmit`
Expected: no output. If tsc names a file not in the table, it imports one of the moved names; point that import at `legacyRecipe.types` in the same way.

- [ ] **Step 4: Write the failing test.** Create `src/services/api/recipesApi.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

vi.mock('./apiClient', () => ({ default: { get: vi.fn() } }));

import apiClient from './apiClient';
import recipesApi, {
  buildSearchParams,
  toRecipeApiError,
  RecipeApiError,
  RECIPES_UNAVAILABLE_MESSAGE,
  RECIPE_NOT_AVAILABLE_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  SESSION_EXPIRED_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  NO_CRITERIA_MESSAGE,
  TOO_LONG_MESSAGE,
} from './recipesApi';

const get = vi.mocked(apiClient.get);

const requestConfig = (): InternalAxiosRequestConfig =>
  ({ headers: new AxiosHeaders() }) as InternalAxiosRequestConfig;

function ok<T>(data: T): AxiosResponse<T> {
  return { data } as AxiosResponse<T>;
}

function httpError(status: number, data: unknown = {}): AxiosError {
  const config = requestConfig();
  const response = { status, statusText: '', data, headers: {}, config } as AxiosResponse;
  return new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_RESPONSE', config, {}, response);
}

function networkError(): AxiosError {
  return new AxiosError('Network Error', 'ERR_NETWORK', requestConfig(), {});
}

async function rejectionOf(promise: Promise<unknown>): Promise<RecipeApiError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof RecipeApiError) return error;
    throw error;
  }
  throw new Error('expected the promise to reject');
}

beforeEach(() => {
  get.mockReset();
});

describe('buildSearchParams', () => {
  it('trims values and drops blank ones', () => {
    expect(buildSearchParams({ q: '  chicken ', category: '', cuisine: '   ', page: 2, limit: 24 })).toEqual({
      q: 'chicken',
      page: 2,
      limit: 24,
    });
  });

  it('caps limit at 50', () => {
    expect(buildSearchParams({ category: 'Beef', limit: 500 })).toEqual({ category: 'Beef', limit: 50 });
  });

  it('ignores a page or limit that is not a positive integer', () => {
    expect(buildSearchParams({ cuisine: 'Thai', page: 0, limit: -1 })).toEqual({ cuisine: 'Thai' });
    expect(buildSearchParams({ cuisine: 'Thai', page: 1.5 })).toEqual({ cuisine: 'Thai' });
  });

  it('refuses a search with no criteria', () => {
    expect(() => buildSearchParams({ q: '  ', page: 1 })).toThrow(NO_CRITERIA_MESSAGE);
  });

  it('accepts 100 characters and refuses 101, counting characters rather than UTF-16 units', () => {
    expect(buildSearchParams({ q: 'a'.repeat(100) }).q).toHaveLength(100);
    expect(buildSearchParams({ q: '🍜'.repeat(100) }).q).toBe('🍜'.repeat(100));
    expect(() => buildSearchParams({ ingredient: 'a'.repeat(101) })).toThrow(TOO_LONG_MESSAGE);
  });
});

describe('toRecipeApiError', () => {
  it('maps 503 to the exact unavailable message', () => {
    const error = toRecipeApiError(httpError(503, { error: 'recipes are temporarily unavailable, please try again shortly' }));
    expect(error).toMatchObject({ kind: 'unavailable', status: 503 });
    expect(error.message).toBe('Recipes are temporarily unavailable, please try again shortly');
    expect(RECIPES_UNAVAILABLE_MESSAGE).toBe('Recipes are temporarily unavailable, please try again shortly');
  });

  it('maps 404 to "no longer available"', () => {
    expect(toRecipeApiError(httpError(404))).toMatchObject({ kind: 'notFound', message: RECIPE_NOT_AVAILABLE_MESSAGE });
    expect(RECIPE_NOT_AVAILABLE_MESSAGE).toBe('This recipe is no longer available');
  });

  it('maps 401 to unauthorized', () => {
    expect(toRecipeApiError(httpError(401))).toMatchObject({ kind: 'unauthorized', message: SESSION_EXPIRED_MESSAGE });
  });

  it('keeps the server message for 400', () => {
    expect(toRecipeApiError(httpError(400, { error: 'invalid recipe id' }))).toMatchObject({
      kind: 'badRequest',
      message: 'invalid recipe id',
    });
  });

  it('maps other statuses to unknown', () => {
    expect(toRecipeApiError(httpError(500))).toMatchObject({ kind: 'unknown', status: 500, message: GENERIC_ERROR_MESSAGE });
  });

  it('maps a request with no response to network', () => {
    expect(toRecipeApiError(networkError())).toMatchObject({ kind: 'network', message: NETWORK_ERROR_MESSAGE });
  });

  it('wraps other errors and passes a RecipeApiError through unchanged', () => {
    expect(toRecipeApiError(new Error('boom'))).toMatchObject({ kind: 'unknown', message: GENERIC_ERROR_MESSAGE });
    const original = new RecipeApiError('notFound', 'gone', 404);
    expect(toRecipeApiError(original)).toBe(original);
  });
});

describe('recipesApi', () => {
  it('searchRecipes sends the cleaned params and returns the page', async () => {
    const page = {
      recipes: [{ id: '52772', name: 'Teriyaki Chicken Casserole', thumbnail: 't.jpg', category: 'Chicken' }],
      total: 1,
      page: 1,
      totalPages: 1,
    };
    get.mockResolvedValueOnce(ok(page));
    await expect(recipesApi.searchRecipes({ q: ' teriyaki ', limit: 24 })).resolves.toEqual(page);
    expect(get).toHaveBeenCalledWith('/api/recipes', { params: { q: 'teriyaki', limit: 24 } });
  });

  it('searchRecipes rejects an empty search without calling the API', async () => {
    const error = await rejectionOf(recipesApi.searchRecipes({ q: '' }));
    expect(error.kind).toBe('badRequest');
    expect(get).not.toHaveBeenCalled();
  });

  it('getRecipe requests the id and maps a 404', async () => {
    get.mockRejectedValueOnce(httpError(404, { error: 'recipe not found' }));
    const error = await rejectionOf(recipesApi.getRecipe('52772'));
    expect(get).toHaveBeenCalledWith('/api/recipes/52772');
    expect(error.kind).toBe('notFound');
  });

  it('getCategories and getCuisines use their endpoints', async () => {
    get.mockResolvedValueOnce(ok([{ name: 'Beef', thumbnail: 'b.png', description: 'Beef dishes' }]));
    get.mockResolvedValueOnce(ok(['British', 'Italian']));
    await expect(recipesApi.getCategories()).resolves.toHaveLength(1);
    await expect(recipesApi.getCuisines()).resolves.toEqual(['British', 'Italian']);
    expect(get).toHaveBeenNthCalledWith(1, '/api/recipes/categories');
    expect(get).toHaveBeenNthCalledWith(2, '/api/recipes/cuisines');
  });

  it('maps a 503 from any call', async () => {
    get.mockRejectedValueOnce(httpError(503));
    expect((await rejectionOf(recipesApi.getCuisines())).kind).toBe('unavailable');
  });
});
```

- [ ] **Step 5: Run the test to verify it fails.**
Run: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && npm run test:unit`
Expected: FAIL, because `./recipesApi` can't be resolved (`Failed to resolve import "./recipesApi"` or `Cannot find module`).

- [ ] **Step 6: Implement.** Create `src/services/api/recipesApi.ts`:

```ts
import axios from 'axios';
import apiClient from './apiClient';
import type { Recipe, RecipeCategory, RecipePage, RecipeQuery } from '../../types/recipe.types';

export const RECIPES_UNAVAILABLE_MESSAGE = 'Recipes are temporarily unavailable, please try again shortly';
export const RECIPE_NOT_AVAILABLE_MESSAGE = 'This recipe is no longer available';
export const NETWORK_ERROR_MESSAGE = 'Could not reach the server. Check your connection and try again.';
export const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please sign in again.';
export const GENERIC_ERROR_MESSAGE = 'Something went wrong while loading recipes.';
export const NO_CRITERIA_MESSAGE = 'Enter a recipe name or choose a category, cuisine or ingredient.';
export const TOO_LONG_MESSAGE = 'Search terms must be at most 100 characters.';

/** Backend limits (see the API contract in the TheMealDB integration spec). */
export const MAX_SEARCH_LENGTH = 100;
export const DEFAULT_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 50;

export type RecipeErrorKind = 'unavailable' | 'notFound' | 'badRequest' | 'unauthorized' | 'network' | 'unknown';

/** The only error the recipe API rejects with; `message` is ready to show. */
export class RecipeApiError extends Error {
  readonly kind: RecipeErrorKind;
  readonly status?: number;

  constructor(kind: RecipeErrorKind, message: string, status?: number) {
    super(message);
    this.name = 'RecipeApiError';
    this.kind = kind;
    this.status = status;
  }
}

/** Converts anything thrown by a recipe request into a RecipeApiError. */
export function toRecipeApiError(error: unknown): RecipeApiError {
  if (error instanceof RecipeApiError) return error;
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === undefined) return new RecipeApiError('network', NETWORK_ERROR_MESSAGE);
    switch (status) {
      case 503:
        return new RecipeApiError('unavailable', RECIPES_UNAVAILABLE_MESSAGE, status);
      case 404:
        return new RecipeApiError('notFound', RECIPE_NOT_AVAILABLE_MESSAGE, status);
      case 401:
        return new RecipeApiError('unauthorized', SESSION_EXPIRED_MESSAGE, status);
      case 400: {
        const data = error.response?.data as { error?: unknown } | undefined;
        const message = typeof data?.error === 'string' && data.error ? data.error : GENERIC_ERROR_MESSAGE;
        return new RecipeApiError('badRequest', message, status);
      }
      default:
        return new RecipeApiError('unknown', GENERIC_ERROR_MESSAGE, status);
    }
  }
  return new RecipeApiError('unknown', GENERIC_ERROR_MESSAGE);
}

const TEXT_FIELDS = ['q', 'category', 'cuisine', 'ingredient'] as const;

const isPositiveInteger = (value: number | undefined): value is number =>
  value !== undefined && Number.isInteger(value) && value > 0;

/**
 * Cleans a query so the backend never rejects it: trims text, drops blanks,
 * refuses an empty search or a value over 100 characters, and caps limit at 50.
 */
export function buildSearchParams(query: RecipeQuery): RecipeQuery {
  const params: RecipeQuery = {};
  for (const field of TEXT_FIELDS) {
    const value = query[field]?.trim();
    if (!value) continue;
    if (Array.from(value).length > MAX_SEARCH_LENGTH) {
      throw new RecipeApiError('badRequest', TOO_LONG_MESSAGE);
    }
    params[field] = value;
  }
  if (Object.keys(params).length === 0) {
    throw new RecipeApiError('badRequest', NO_CRITERIA_MESSAGE);
  }
  if (isPositiveInteger(query.page)) params.page = query.page;
  if (isPositiveInteger(query.limit)) params.limit = Math.min(query.limit, MAX_PAGE_SIZE);
  return params;
}

// Recipe API service (TheMealDB data, cached by the backend)
class RecipesApi {
  /**
   * Search recipes
   * GET /api/recipes
   */
  async searchRecipes(query: RecipeQuery): Promise<RecipePage> {
    const params = buildSearchParams(query);
    try {
      const response = await apiClient.get<RecipePage>('/api/recipes', { params });
      return response.data;
    } catch (error) {
      throw toRecipeApiError(error);
    }
  }

  /**
   * Get one recipe
   * GET /api/recipes/:id
   */
  async getRecipe(id: string): Promise<Recipe> {
    try {
      const response = await apiClient.get<Recipe>(`/api/recipes/${encodeURIComponent(id)}`);
      return response.data;
    } catch (error) {
      throw toRecipeApiError(error);
    }
  }

  /**
   * List categories
   * GET /api/recipes/categories
   */
  async getCategories(): Promise<RecipeCategory[]> {
    try {
      const response = await apiClient.get<RecipeCategory[]>('/api/recipes/categories');
      return response.data;
    } catch (error) {
      throw toRecipeApiError(error);
    }
  }

  /**
   * List cuisines (sorted)
   * GET /api/recipes/cuisines
   */
  async getCuisines(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>('/api/recipes/cuisines');
      return response.data;
    } catch (error) {
      throw toRecipeApiError(error);
    }
  }
}

export default new RecipesApi();
```

- [ ] **Step 7: Run the tests to verify they pass.**
Run: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && npm run test:unit`
Expected: PASS, with 17 tests in `recipesApi.test.ts`.

- [ ] **Step 8: Verify.**
Run: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && npx tsc --noEmit && npm run lint && npm run build`
Expected: no tsc output, no lint output, and a build that ends `✓ built in …`. The app behaves exactly as before, because no screen uses the new code yet.

- [ ] **Step 9: Commit.**

```bash
cd D:/ProjectsWS/meal-planner/meal-planner-frontend
git add package.json package-lock.json vitest.config.ts .github/workflows/ci.yml src/types src/services/api src/components src/contexts src/data src/pages src/services/MockAIService.ts src/services/RecipeService.ts src/utils/recipeThumbnail.ts
git commit -m "feat(recipes): add the recipe API client, contract types and Vitest" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014u1dJTmEC1ARhmephG3Zfk"
```

---

### Task 2: Recipe data layer — session cache, favourites migration, helpers

**Files:**
- Create: `src/services/recipes/asyncCache.ts`, `src/services/recipes/recipeData.ts`, `src/services/recipes/recipeUtils.ts`, `src/services/recipes/favorites.ts`, `src/test/memoryStorage.ts`
- Test: `src/services/recipes/asyncCache.test.ts`, `src/services/recipes/recipeUtils.test.ts`, `src/services/recipes/favorites.test.ts`

**Interfaces:**
- Consumes (Task 1): `recipesApi`, `RecipeApiError`, `Recipe`, `RecipeCategory`.
- Produces:

```ts
// asyncCache.ts
export interface AsyncCache<K, V> { get(key: K): Promise<V> }
export function createAsyncCache<K, V>(load: (key: K) => Promise<V>): AsyncCache<K, V>;
// recipeData.ts (the per-session cache)
export const getRecipe: (id: string) => Promise<Recipe>;
export const loadCategories: () => Promise<RecipeCategory[]>;
export const loadCuisines: () => Promise<string[]>;
// recipeUtils.ts
export const isRecipeId: (id: unknown) => id is string;             // /^[1-9]\d*$/
export const previewImage: (url: string) => string;                 // TheMealDB meal image + '/preview'
export function pickSimilar<T extends { id: string }>(recipes: T[], currentId: string, count?: number): T[];
export interface FilterOption { value: string; label: string }
export function filterOptions(allLabel: string, values: string[], current: string): FilterOption[];
// favorites.ts
export const favoritesKey: (userId: string) => string;              // 'user_favorites_<userId>'
export function migrateFavoriteIds(raw: unknown): string[];
export function readFavoriteIds(userId: string): string[];          // migrates and rewrites storage
export function writeFavoriteIds(userId: string, ids: string[]): void;
export function toggleFavoriteId(ids: string[], id: string): string[];
export function loadFavoriteRecipes(ids: string[], getRecipe: (id: string) => Promise<Recipe>): Promise<Recipe[]>;
// src/test/memoryStorage.ts
export class MemoryStorage { getItem; setItem; removeItem; clear; key; length }
```

- [ ] **Step 1: Write the failing tests.** Create `src/test/memoryStorage.ts`:

```ts
/** A minimal in-memory localStorage for unit tests running in Node. */
export class MemoryStorage {
  private items = new Map<string, string>();

  get length(): number {
    return this.items.size;
  }

  clear(): void {
    this.items.clear();
  }

  getItem(key: string): string | null {
    return this.items.has(key) ? (this.items.get(key) as string) : null;
  }

  key(index: number): string | null {
    return Array.from(this.items.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.items.delete(key);
  }

  setItem(key: string, value: string): void {
    this.items.set(key, String(value));
  }
}
```

Create `src/services/recipes/asyncCache.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { createAsyncCache } from './asyncCache';

describe('createAsyncCache', () => {
  it('loads each key once and then serves it from memory', async () => {
    const load = vi.fn(async (id: string) => `recipe ${id}`);
    const cache = createAsyncCache(load);
    await expect(cache.get('52772')).resolves.toBe('recipe 52772');
    await expect(cache.get('52772')).resolves.toBe('recipe 52772');
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('shares one request between concurrent calls for the same key', async () => {
    let finish: (value: string) => void = () => {};
    const load = vi.fn(() => new Promise<string>((resolve) => { finish = resolve; }));
    const cache = createAsyncCache(load);
    const first = cache.get('52772');
    const second = cache.get('52772');
    finish('Teriyaki Chicken Casserole');
    await expect(Promise.all([first, second])).resolves.toEqual(['Teriyaki Chicken Casserole', 'Teriyaki Chicken Casserole']);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('does not cache failures, so a later call retries', async () => {
    const load = vi.fn()
      .mockRejectedValueOnce(new Error('503'))
      .mockResolvedValueOnce('recovered');
    const cache = createAsyncCache(load as (id: string) => Promise<string>);
    await expect(cache.get('52772')).rejects.toThrow('503');
    await expect(cache.get('52772')).resolves.toBe('recovered');
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('turns a synchronous throw into a rejection', async () => {
    const cache = createAsyncCache((): Promise<string> => { throw new Error('bad'); });
    await expect(cache.get('x')).rejects.toThrow('bad');
  });

  it('keeps keys separate', async () => {
    const load = vi.fn(async (id: string) => id);
    const cache = createAsyncCache(load);
    await cache.get('1');
    await cache.get('2');
    expect(load).toHaveBeenCalledTimes(2);
  });
});
```

Create `src/services/recipes/recipeUtils.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { filterOptions, isRecipeId, pickSimilar, previewImage } from './recipeUtils';

describe('isRecipeId', () => {
  it('accepts TheMealDB ids only', () => {
    expect(isRecipeId('52772')).toBe(true);
    for (const id of ['recipe-001', '', '0', '052772', '52772x', ' 52772', 52772, null]) {
      expect(isRecipeId(id)).toBe(false);
    }
  });
});

describe('previewImage', () => {
  it('adds /preview to TheMealDB meal images', () => {
    expect(previewImage('https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg')).toBe(
      'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg/preview',
    );
  });

  it('leaves other images alone', () => {
    const untouched = [
      'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg/preview',
      'https://www.themealdb.com/images/category/beef.png',
      'data:image/svg+xml;charset=utf-8,%3Csvg%2F%3E',
      '',
    ];
    for (const url of untouched) expect(previewImage(url)).toBe(url);
  });
});

describe('pickSimilar', () => {
  const list = ['1', '2', '3', '4', '5', '6'].map((id) => ({ id }));

  it('returns up to 4 in order, excluding the current recipe', () => {
    expect(pickSimilar(list, '2').map((r) => r.id)).toEqual(['1', '3', '4', '5']);
  });

  it('returns fewer when the category is small', () => {
    expect(pickSimilar([{ id: '1' }, { id: '2' }], '1').map((r) => r.id)).toEqual(['2']);
  });
});

describe('filterOptions', () => {
  it('puts the "all" option first', () => {
    expect(filterOptions('All cuisines', ['British', 'Thai'], '')).toEqual([
      { value: '', label: 'All cuisines' },
      { value: 'British', label: 'British' },
      { value: 'Thai', label: 'Thai' },
    ]);
  });

  it('keeps a current value that is not (yet) in the list', () => {
    expect(filterOptions('All categories', ['Beef'], 'Goat').map((o) => o.value)).toEqual(['', 'Beef', 'Goat']);
  });
});
```

Create `src/services/recipes/favorites.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryStorage } from '../../test/memoryStorage';
import { RecipeApiError } from '../api/recipesApi';
import type { Recipe } from '../../types/recipe.types';
import {
  favoritesKey,
  loadFavoriteRecipes,
  migrateFavoriteIds,
  readFavoriteIds,
  toggleFavoriteId,
  writeFavoriteIds,
} from './favorites';

const KEY = favoritesKey('user-1');

const recipe = (id: string): Recipe => ({
  id,
  name: `Recipe ${id}`,
  thumbnail: `${id}.jpg`,
  category: 'Beef',
  cuisine: 'British',
  ingredients: [],
  instructions: [],
  tags: [],
});

beforeEach(() => {
  vi.stubGlobal('localStorage', new MemoryStorage());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('migrateFavoriteIds', () => {
  it('keeps TheMealDB ids in order and drops old mock ids, duplicates and junk', () => {
    expect(migrateFavoriteIds(['recipe-001', '52772', '52772', 52874, null, '52874', ''])).toEqual(['52772', '52874']);
  });

  it('treats anything that is not an array as empty', () => {
    expect(migrateFavoriteIds({ ids: ['52772'] })).toEqual([]);
    expect(migrateFavoriteIds('52772')).toEqual([]);
    expect(migrateFavoriteIds(null)).toEqual([]);
  });
});

describe('readFavoriteIds', () => {
  it('uses the existing key', () => {
    expect(KEY).toBe('user_favorites_user-1');
  });

  it('drops old ids and rewrites storage on first load', () => {
    localStorage.setItem(KEY, JSON.stringify(['recipe-001', '52772', 'recipe-002']));
    expect(readFavoriteIds('user-1')).toEqual(['52772']);
    expect(localStorage.getItem(KEY)).toBe('["52772"]');
  });

  it('survives corrupt JSON', () => {
    localStorage.setItem(KEY, '{not json');
    expect(readFavoriteIds('user-1')).toEqual([]);
    expect(localStorage.getItem(KEY)).toBe('[]');
  });

  it('returns [] without writing when nothing is stored', () => {
    expect(readFavoriteIds('user-1')).toEqual([]);
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('round-trips with writeFavoriteIds', () => {
    writeFavoriteIds('user-1', ['52772', '52874']);
    expect(readFavoriteIds('user-1')).toEqual(['52772', '52874']);
  });
});

describe('toggleFavoriteId', () => {
  it('adds to the end and removes in place', () => {
    expect(toggleFavoriteId(['1', '2'], '3')).toEqual(['1', '2', '3']);
    expect(toggleFavoriteId(['1', '2', '3'], '2')).toEqual(['1', '3']);
  });
});

describe('loadFavoriteRecipes', () => {
  it('loads details in saved order and skips recipes TheMealDB no longer has', async () => {
    const get = vi.fn(async (id: string) => {
      if (id === '99999') throw new RecipeApiError('notFound', 'gone', 404);
      return recipe(id);
    });
    const recipes = await loadFavoriteRecipes(['52874', '99999', '52772'], get);
    expect(recipes.map((r) => r.id)).toEqual(['52874', '52772']);
  });

  it('rejects on any other failure', async () => {
    const get = vi.fn(async () => {
      throw new RecipeApiError('unavailable', 'down', 503);
    });
    await expect(loadFavoriteRecipes(['52772'], get)).rejects.toMatchObject({ kind: 'unavailable' });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail.**
Run: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && npm run test:unit`
Expected: FAIL. The three new files can't resolve `./asyncCache`, `./recipeUtils` and `./favorites`, while the Task 1 tests still pass.

- [ ] **Step 3: Implement.** Create `src/services/recipes/asyncCache.ts`:

```ts
/** A per-key memo of an async loader. */
export interface AsyncCache<K, V> {
  get(key: K): Promise<V>;
}

/**
 * Memoises `load` per key for the lifetime of the page (one browser session).
 * Concurrent calls for a key share one request. Failures are not cached, so
 * the next call (e.g. Retry) loads again.
 */
export function createAsyncCache<K, V>(load: (key: K) => Promise<V>): AsyncCache<K, V> {
  const values = new Map<K, V>();
  const pending = new Map<K, Promise<V>>();

  return {
    get(key: K): Promise<V> {
      if (values.has(key)) return Promise.resolve(values.get(key) as V);
      const inFlight = pending.get(key);
      if (inFlight) return inFlight;

      // new Promise turns a synchronous throw in `load` into a rejection
      const request = new Promise<V>((resolve) => resolve(load(key))).then(
        (value) => {
          values.set(key, value);
          pending.delete(key);
          return value;
        },
        (error: unknown) => {
          pending.delete(key);
          throw error;
        },
      );
      pending.set(key, request);
      return request;
    },
  };
}
```

Create `src/services/recipes/recipeData.ts`:

```ts
import recipesApi from '../api/recipesApi';
import type { Recipe, RecipeCategory } from '../../types/recipe.types';
import { createAsyncCache } from './asyncCache';

// In-memory, per-session caches: each recipe (and the category and cuisine
// lists) is fetched at most once until the page is reloaded.
const details = createAsyncCache((id: string) => recipesApi.getRecipe(id));
const categories = createAsyncCache((_key: 'all') => recipesApi.getCategories());
const cuisines = createAsyncCache((_key: 'all') => recipesApi.getCuisines());

/** Recipe detail by TheMealDB id, cached for the session. */
export const getRecipe = (id: string): Promise<Recipe> => details.get(id);

/** All categories, cached for the session. */
export const loadCategories = (): Promise<RecipeCategory[]> => categories.get('all');

/** All cuisines (sorted), cached for the session. */
export const loadCuisines = (): Promise<string[]> => cuisines.get('all');
```

Create `src/services/recipes/recipeUtils.ts`:

```ts
const RECIPE_ID = /^[1-9]\d*$/;

/** True for a TheMealDB id ("52772"); false for old mock ids ("recipe-001"). */
export const isRecipeId = (id: unknown): id is string => typeof id === 'string' && RECIPE_ID.test(id);

const MEAL_IMAGE = /^https?:\/\/www\.themealdb\.com\/images\/media\/meals\/[^/]+\.(?:jpe?g|png)$/i;

/**
 * TheMealDB's small preview of a meal photo, for lists and cards. Anything
 * else (a preview already, category images, old data-URI thumbnails) is
 * returned unchanged.
 */
export const previewImage = (url: string): string => (MEAL_IMAGE.test(url) ? `${url}/preview` : url);

/** Up to `count` recipes from the list, in order, excluding the current one. */
export function pickSimilar<T extends { id: string }>(recipes: T[], currentId: string, count = 4): T[] {
  return recipes.filter((recipe) => recipe.id !== currentId).slice(0, count);
}

export interface FilterOption {
  value: string;
  label: string;
}

/**
 * Dropdown options with an "all" entry (value '') first. A current value
 * missing from the list (e.g. while the list loads) is kept so the select
 * still shows it.
 */
export function filterOptions(allLabel: string, values: string[], current: string): FilterOption[] {
  const list = current && !values.includes(current) ? [...values, current] : values;
  return [{ value: '', label: allLabel }, ...list.map((value) => ({ value, label: value }))];
}
```

Create `src/services/recipes/favorites.ts`:

```ts
import type { Recipe } from '../../types/recipe.types';
import { RecipeApiError } from '../api/recipesApi';
import { isRecipeId } from './recipeUtils';

const KEY_PREFIX = 'user_favorites';

/** localStorage key for a user's favourite ids (unchanged from the mock era). */
export const favoritesKey = (userId: string): string => `${KEY_PREFIX}_${userId}`;

/**
 * Keeps TheMealDB ids in saved order and drops everything else: old mock ids
 * ("recipe-001"), duplicates, and anything that is not a string.
 */
export function migrateFavoriteIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const ids: string[] = [];
  for (const value of raw) {
    if (isRecipeId(value) && !ids.includes(value)) ids.push(value);
  }
  return ids;
}

/**
 * Reads a user's favourite ids. Old or corrupt data is cleaned up and written
 * back the first time favourites load.
 */
export function readFavoriteIds(userId: string): string[] {
  const key = favoritesKey(userId);
  const stored = localStorage.getItem(key);
  if (stored === null) return [];

  let parsed: unknown = null;
  try {
    parsed = JSON.parse(stored);
  } catch {
    parsed = null;
  }
  const ids = migrateFavoriteIds(parsed);
  const normalized = JSON.stringify(ids);
  if (normalized !== stored) localStorage.setItem(key, normalized);
  return ids;
}

export function writeFavoriteIds(userId: string, ids: string[]): void {
  localStorage.setItem(favoritesKey(userId), JSON.stringify(ids));
}

/** Adds the id at the end, or removes it if present. */
export function toggleFavoriteId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((existing) => existing !== id) : [...ids, id];
}

/**
 * Loads each favourite's details, in saved order. A recipe TheMealDB no longer
 * has (404) is skipped; any other failure rejects so the page can offer Retry.
 */
export async function loadFavoriteRecipes(
  ids: string[],
  getRecipe: (id: string) => Promise<Recipe>,
): Promise<Recipe[]> {
  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        return await getRecipe(id);
      } catch (error) {
        if (error instanceof RecipeApiError && error.kind === 'notFound') return null;
        throw error;
      }
    }),
  );
  return results.filter((recipe): recipe is Recipe => recipe !== null);
}
```

- [ ] **Step 4: Run the tests to verify they pass.**
Run: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && npm run test:unit`
Expected: PASS for all four test files (Task 1's 17 tests plus 5 + 7 + 10 new ones).

- [ ] **Step 5: Verify.**
Run: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && npx tsc --noEmit && npm run lint && npm run build`
Expected: all three pass. Nothing uses the new modules yet.

- [ ] **Step 6: Commit.**

```bash
cd D:/ProjectsWS/meal-planner/meal-planner-frontend
git add src/services/recipes src/test
git commit -m "feat(recipes): add the session cache, favourites migration and recipe helpers" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014u1dJTmEC1ARhmephG3Zfk"
```

---

### Task 3: Hermetic Playwright harness (mocked session and recipe API)

**Files:**
- Create: `tests/helpers/api.helper.ts`, `tests/helpers/session.helper.ts`, `tests/helpers/recipes.fixtures.ts`
- Modify: `tests/epic2-meal-planning.spec.ts` (imports and `beforeEach` only)
- Create outside the repo (never committed): `D:/ProjectsWS/meal-planner/.e2e/e2e-failures.cjs`, `D:/ProjectsWS/meal-planner/.e2e/epic2-baseline.txt`

**Interfaces:**
- Consumes: the `Recipe`, `RecipeCategory` and `RecipeSummary` types (Task 1) and `User` (`src/types/auth.types.ts`), as type-only imports.
- Produces (used by every later spec):

```ts
// tests/helpers/api.helper.ts
export const CORS_HEADERS: Record<string, string>;
export const isPreflight: (route: Route) => boolean;
export function fulfillPreflight(route: Route): Promise<void>;
export function fulfillJson(route: Route, status: number, body: unknown): Promise<void>;
// tests/helpers/session.helper.ts
export const TEST_USER: User; // id 'user-e2e', hasCompletedOnboarding: true
export function signInWithMockedSession(page: Page, storage?: Record<string, string>): Promise<void>;
// tests/helpers/recipes.fixtures.ts
export const RECIPES: Recipe[]; export const CATEGORIES: RecipeCategory[]; export const CUISINES: string[];
export const isRecipesApi: (url: URL) => boolean;
export interface RecipesApiMock { requests: string[] } // pathname + search of each GET answered by the fixtures
export function mockRecipesApi(page: Page): Promise<RecipesApiMock>;
export function overrideRecipesApi(page: Page, match: (url: URL) => boolean,
  handler: (route: Route) => Promise<void>): Promise<void>; // registered later, so it runs first; route.fallback() passes to the fixtures
export interface Outage { handler: (route: Route) => Promise<void>; end: () => void }
export function outage(status?: number): Outage; // fails every matching call until end(), then falls back to the fixtures
```

Fixture facts the later specs rely on:
- Chicken has 3 recipes: `52772` Teriyaki Chicken Casserole (Japanese; YouTube link; ingredient `soy sauce` / `3/4 cup`; 3 steps; tags `Meat`, `Casserole`), `52795` Chicken Handi (Indian; no YouTube) and `52940` Brown Stew Chicken (Jamaican).
- Breakfast has 5: `52965` Breakfast Potatoes, `52895` English Breakfast, `52896` Full English Breakfast, `52957` Fruit and Cream Cheese Breakfast Pastries and `53000` Smoked Haddock Kedgeree.
- Every other main category has exactly one recipe. `52854` Pancakes is a Dessert.
- Miscellaneous has 30 recipes, `60001` to `60030`, named `Misc Dish 1` to `Misc Dish 30`: two pages of 24.
- The search fake mirrors the backend. Summaries carry `category` only when `q` or `category` was given, and `cuisine` only when `q` or `cuisine` was given. A search with no criteria is a 400, an unknown numeric id a 404, and a non-numeric id a 400.

- [ ] **Step 1: Confirm the current epic2 spec needs the backend (the red step).** Make sure nothing is listening on port 3001: if the backend stack is up, run `cd D:/ProjectsWS/meal-planner/meal-planner-backend && docker compose stop`. Then run:

```bash
cd D:/ProjectsWS/meal-planner/meal-planner-frontend && BROWSER=none npx playwright test tests/epic2-meal-planning.spec.ts --project=chromium -g "placeholder in empty slots"
```

Expected: FAIL. `beforeEach` registers a real user, the API is unreachable, and `skipOnboarding` times out waiting for `text=Welcome`.

- [ ] **Step 2: Create the helpers.** Create `tests/helpers/api.helper.ts`:

```ts
import type { Route } from '@playwright/test';

/** Lets the app on :3000 read responses that are fulfilled "from" the API on :3001. */
export const CORS_HEADERS: Record<string, string> = {
  'access-control-allow-origin': 'http://localhost:3000',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'Authorization, Content-Type',
};

export const isPreflight = (route: Route): boolean => route.request().method() === 'OPTIONS';

export async function fulfillPreflight(route: Route): Promise<void> {
  await route.fulfill({ status: 204, headers: CORS_HEADERS });
}

export async function fulfillJson(route: Route, status: number, body: unknown): Promise<void> {
  await route.fulfill({
    status,
    headers: CORS_HEADERS,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}
```

Create `tests/helpers/session.helper.ts`:

```ts
import type { Page } from '@playwright/test';
import type { User } from '../../src/types/auth.types';
import { fulfillJson, fulfillPreflight, isPreflight } from './api.helper';

/** The user every hermetic spec signs in as. */
export const TEST_USER: User = {
  id: 'user-e2e',
  email: 'e2e@example.test',
  name: 'E2E Tester',
  createdAt: '2026-01-01T00:00:00.000Z',
  hasCompletedOnboarding: true,
};

/**
 * Signs in without the backend: answers GET /api/auth/me and seeds the stored
 * session (same keys as AuthService). `storage` adds more localStorage entries
 * (favourites, meal plans) before the app next loads. Navigate afterwards.
 */
export async function signInWithMockedSession(page: Page, storage: Record<string, string> = {}): Promise<void> {
  await page.route((url) => url.pathname === '/api/auth/me', async (route) => {
    if (isPreflight(route)) return fulfillPreflight(route);
    await fulfillJson(route, 200, { user: TEST_USER });
  });

  await page.goto('/login');
  await page.evaluate(
    ({ user, entries }) => {
      localStorage.setItem('meal_planner_auth_token', 'e2e-token');
      localStorage.setItem('meal_planner_current_user', JSON.stringify(user));
      for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, value);
    },
    { user: TEST_USER, entries: storage },
  );
}
```

Create `tests/helpers/recipes.fixtures.ts`:

```ts
import type { Page, Route } from '@playwright/test';
import type { Recipe, RecipeCategory, RecipeSummary } from '../../src/types/recipe.types';
import { fulfillJson, fulfillPreflight, isPreflight } from './api.helper';

const MEAL_IMAGES = 'https://www.themealdb.com/images/media/meals';

/** 1×1 transparent PNG served for every TheMealDB image, so tests never reach TheMealDB. */
const PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

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
        const error = status === 503 ? 'recipes are temporarily unavailable, please try again shortly' : 'request failed';
        return fulfillJson(route, status, { error });
      }
      await route.fallback();
    },
    end: () => {
      active = false;
    },
  };
}
```

- [ ] **Step 3: Make epic2 hermetic.** In `tests/epic2-meal-planning.spec.ts`, replace everything from the first line down to the end of the `test.beforeEach(...)` block (the line `  });` after `await authHelper.skipOnboarding();`) with:

```ts
import { test, expect } from '@playwright/test';
import { MealPlanHelper } from './helpers/mealplan.helper';
import { mockRecipesApi } from './helpers/recipes.fixtures';
import { signInWithMockedSession } from './helpers/session.helper';

test.describe('Epic 2: Meal Planning', () => {
  let mealPlanHelper: MealPlanHelper;

  test.beforeEach(async ({ page }) => {
    mealPlanHelper = new MealPlanHelper(page);

    // Hermetic: a mocked session and fixture recipes, so neither the backend
    // nor TheMealDB is needed (see helpers/session.helper.ts, recipes.fixtures.ts)
    await mockRecipesApi(page);
    await signInWithMockedSession(page);
  });
```

- [ ] **Step 4: Run the same test to verify it now passes without the backend.**
Run: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && BROWSER=none npx playwright test tests/epic2-meal-planning.spec.ts --project=chromium -g "placeholder in empty slots"`
Expected: `1 passed`.

- [ ] **Step 5: Record the epic2 baseline.** Run `mkdir -p D:/ProjectsWS/meal-planner/.e2e`, then create `D:/ProjectsWS/meal-planner/.e2e/e2e-failures.cjs`. It sits outside the repo on purpose and is never committed.

```js
// Usage: node e2e-failures.cjs <playwright-report.json> [baseline.txt]
// Prints the titles of tests that did not pass. With a baseline file, prints
// only failures that are not in it, so empty output means "no new failures".
const fs = require('fs');
const path = require('path');

const report = JSON.parse(fs.readFileSync(path.resolve(process.argv[2]), 'utf8'));
if ((report.errors || []).length > 0) {
  console.error('Report has global errors:', report.errors.map((e) => e.message).join('\n'));
  process.exit(1);
}
const stats = report.stats || {};
if ((stats.expected || 0) + (stats.unexpected || 0) + (stats.flaky || 0) === 0) {
  console.error('No tests ran');
  process.exit(1);
}

const failed = new Set();
const walk = (suite, trail) => {
  const here = suite.title ? [...trail, suite.title] : trail;
  for (const spec of suite.specs || []) {
    for (const test of spec.tests || []) {
      if (test.status === 'unexpected' || test.status === 'flaky') failed.add([...here, spec.title].join(' > '));
    }
  }
  for (const child of suite.suites || []) walk(child, here);
};
for (const suite of report.suites || []) walk(suite, []);

const baseline = process.argv[3]
  ? new Set(fs.readFileSync(path.resolve(process.argv[3]), 'utf8').split(/\r?\n/).filter(Boolean))
  : new Set();
console.log([...failed].filter((title) => !baseline.has(title)).sort().join('\n'));
```

Then run:

```bash
cd D:/ProjectsWS/meal-planner/meal-planner-frontend
BROWSER=none PLAYWRIGHT_JSON_OUTPUT_FILE=D:/ProjectsWS/meal-planner/.e2e/epic2-baseline.json npx playwright test tests/epic2-meal-planning.spec.ts --project=chromium --reporter=json || true
node ../.e2e/e2e-failures.cjs ../.e2e/epic2-baseline.json > ../.e2e/epic2-baseline.txt
cat ../.e2e/epic2-baseline.txt
```

Expected: the script exits 0 and the baseline lists the failures that were already there. Nothing recipe-related has changed yet, so these are the old selector problems, such as the `[class*="Day"]` tests. Include the list in your task report. From now on, the **Epic2 regression check** in Global Constraints must print nothing.

- [ ] **Step 6: Verify and commit.**
Run: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && npx tsc --noEmit && npm run lint && npm run build && npm run test:unit`
Expected: all pass. Lint covers the new helper files.

```bash
cd D:/ProjectsWS/meal-planner/meal-planner-frontend
git add tests/helpers/api.helper.ts tests/helpers/session.helper.ts tests/helpers/recipes.fixtures.ts tests/epic2-meal-planning.spec.ts
git commit -m "test(e2e): mock the session and recipe API so specs run without the backend" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014u1dJTmEC1ARhmephG3Zfk"
```

---

### Task 4: Recipes page on the API (category landing, search, filters, paging, states)

**Files:**
- Create: `src/hooks/useAsync.ts`, `src/components/molecules/ErrorPanel.tsx`, `src/components/molecules/Pagination.tsx`, `src/components/molecules/CategoryGrid.tsx`
- Modify: `src/components/atoms/Dropdown.tsx`, `src/components/molecules/RecipeCard.tsx` (rewrite), `src/pages/Recipes.tsx` (rewrite), `tests/epic2-meal-planning.spec.ts` (US-2.2 and Integration blocks), `tests/helpers/mealplan.helper.ts` (one selector)
- Test: `tests/recipes.spec.ts`

**Interfaces:**
- Consumes: `recipesApi.searchRecipes`, `DEFAULT_PAGE_SIZE`, `MAX_SEARCH_LENGTH`, `RecipeApiError` and `toRecipeApiError` (Task 1); `loadCategories`, `loadCuisines`, `previewImage` and `filterOptions` (Task 2); `useRecipes().isFavorite/toggleFavorite`, which keep their current signatures.
- Produces (used by Tasks 5–8):

```ts
// src/hooks/useAsync.ts
export interface AsyncState<T> { data: T | null; error: RecipeApiError | null; loading: boolean; retry: () => void }
export function useAsync<T>(loader: (() => Promise<T>) | null): AsyncState<T>; // pass a memoised loader; null = idle
// components
export const ErrorPanel: React.FC<{ message: string; onRetry: () => void; compact?: boolean }>; // data-testid="error-panel"
export const Pagination: React.FC<{ page: number; totalPages: number; onPageChange: (page: number) => void }>;
export const CategoryGrid: React.FC<{ categories: RecipeCategory[]; onSelect: (name: string) => void }>; // tiles: data-testid="category-tile"
export const RecipeCard: React.FC<{ recipe: RecipeSummary; onClick?: () => void; variant?: 'compact' | 'full';
  isDraggable?: boolean; showFavorite?: boolean }>; // root: data-testid="recipe-card"
// Dropdown gains: ariaLabel?: string
```

- [ ] **Step 1: Write the failing spec.** Create `tests/recipes.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { signInWithMockedSession } from './helpers/session.helper';
import { fulfillJson } from './helpers/api.helper';
import {
  CATEGORIES,
  mockRecipesApi,
  outage,
  overrideRecipesApi,
  type RecipesApiMock,
} from './helpers/recipes.fixtures';

const UNAVAILABLE = 'Recipes are temporarily unavailable, please try again shortly';

test.describe('Recipes page (TheMealDB via /api/recipes)', () => {
  let api: RecipesApiMock;

  test.beforeEach(async ({ page }) => {
    api = await mockRecipesApi(page);
    await signInWithMockedSession(page);
  });

  test('lands on the category grid with photos and runs no search', async ({ page }) => {
    await page.goto('/recipes');
    await expect(page.getByTestId('category-tile')).toHaveCount(CATEGORIES.length);
    await expect(page.getByRole('img', { name: 'Chicken', exact: true })).toHaveAttribute(
      'src',
      'https://www.themealdb.com/images/category/chicken.png',
    );
    expect(api.requests.some((r) => r.startsWith('/api/recipes?'))).toBe(false);
  });

  test('clicking a category shows its recipes with preview thumbnails', async ({ page }) => {
    await page.goto('/recipes');
    await page.getByTestId('category-tile').filter({ hasText: 'Chicken' }).click();
    await expect(page).toHaveURL(/category=Chicken/);
    const cards = page.getByTestId('recipe-card');
    await expect(cards).toHaveCount(3);
    await expect(page.getByText('3 recipes')).toBeVisible();
    for (const img of await cards.locator('img').all()) {
      await expect(img).toHaveAttribute('src', /\/preview$/);
    }
  });

  test('searches by name and filters by cuisine and main ingredient', async ({ page }) => {
    await page.goto('/recipes');
    const cards = page.getByTestId('recipe-card');
    await page.getByLabel('Search recipes by name', { exact: true }).fill('chicken');
    await expect(cards).toHaveCount(3);

    await page.getByLabel('Cuisine', { exact: true }).selectOption('Japanese');
    await expect(cards).toHaveCount(1);
    await expect(cards).toContainText('Teriyaki Chicken Casserole');

    await page.getByLabel('Search recipes by name', { exact: true }).fill('');
    await page.getByLabel('Cuisine', { exact: true }).selectOption('');
    await page.getByLabel('Main ingredient', { exact: true }).fill('soy sauce');
    await expect(cards).toHaveCount(1);
    await expect(cards).toContainText('Teriyaki Chicken Casserole');
    expect(api.requests.some((r) => r.includes('ingredient=soy+sauce'))).toBe(true);
  });

  test('pages through results', async ({ page }) => {
    await page.goto('/recipes?category=Miscellaneous');
    const cards = page.getByTestId('recipe-card');
    await expect(cards).toHaveCount(24);
    await expect(page.getByText('Page 1 of 2')).toBeVisible();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(cards).toHaveCount(6);
    await expect(page.getByText('Page 2 of 2')).toBeVisible();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  test('has no time, rating or popularity sorting', async ({ page }) => {
    await page.goto('/recipes?category=Chicken');
    await expect(page.getByTestId('recipe-card')).toHaveCount(3);
    await expect(page.getByText(/Most Popular|Highest Rated|Quickest First/)).toHaveCount(0);
    await expect(page.getByText(/\bmin\b|servings|★/)).toHaveCount(0);
  });

  test('shows an empty state (not an error) when nothing matches', async ({ page }) => {
    await page.goto('/recipes?q=zzzz');
    await expect(page.getByText('No recipes found')).toBeVisible();
    await expect(page.getByTestId('error-panel')).toHaveCount(0);
    await page.getByRole('button', { name: 'Back to categories' }).click();
    await expect(page.getByTestId('category-tile').first()).toBeVisible();
  });

  test('shows the 503 message with a working Retry', async ({ page }) => {
    const down = outage();
    await overrideRecipesApi(page, (url) => url.pathname === '/api/recipes', down.handler);
    await page.goto('/recipes?category=Chicken');
    await expect(page.getByTestId('error-panel')).toContainText(UNAVAILABLE);
    down.end();
    await page.getByRole('button', { name: 'Retry' }).click();
    await expect(page.getByTestId('recipe-card')).toHaveCount(3);
  });

  test('shows a connection error when the API cannot be reached', async ({ page }) => {
    await overrideRecipesApi(page, (url) => url.pathname === '/api/recipes/categories', (route) => route.abort('failed'));
    await page.goto('/recipes');
    await expect(page.getByTestId('error-panel')).toContainText('Could not reach the server');
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  });

  test('an expired session (401) signs the user out', async ({ page }) => {
    let calls = 0;
    await overrideRecipesApi(page, (url) => url.pathname === '/api/recipes/categories', async (route) => {
      calls += 1;
      await fulfillJson(route, 401, { error: 'invalid or expired token' });
    });
    await page.goto('/recipes');
    await expect(page).toHaveURL(/\/login$/);
    expect(await page.evaluate(() => localStorage.getItem('meal_planner_auth_token'))).toBeNull();
    expect(calls).toBe(1); // no retry storm
  });

  test('ignores a slow response for an older search', async ({ page }) => {
    await overrideRecipesApi(
      page,
      (url) => url.pathname === '/api/recipes' && url.searchParams.get('q') === 'chicken',
      async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await route.fallback();
      },
    );
    await page.goto('/recipes');
    const search = page.getByLabel('Search recipes by name', { exact: true });
    const slowRequest = page.waitForRequest((req) => req.method() === 'GET' && req.url().includes('q=chicken'));
    await search.fill('chicken');
    await slowRequest;
    await search.fill('beef');

    const cards = page.getByTestId('recipe-card');
    await expect(cards).toHaveCount(1);
    await expect(cards).toContainText('Beef and Mustard Pie');
    await page.waitForTimeout(2000); // the slow "chicken" response arrives now
    await expect(cards).toHaveCount(1);
    await expect(cards).toContainText('Beef and Mustard Pie');
  });
});
```

- [ ] **Step 2: Run the spec to verify it fails.**
Run: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && BROWSER=none npx playwright test tests/recipes.spec.ts --project=chromium`
Expected: FAIL. Most tests time out on `getByTestId('category-tile')`, `getByTestId('recipe-card')` or `getByLabel('Search recipes by name')`, because the page still renders the mock catalogue.

- [ ] **Step 3: Add the shared hook and components.** Create `src/hooks/useAsync.ts`:

```ts
import { useCallback, useEffect, useState } from 'react';
import { RecipeApiError, toRecipeApiError } from '../services/api/recipesApi';

export interface AsyncState<T> {
  data: T | null;
  error: RecipeApiError | null;
  loading: boolean;
  /** Runs the loader again (the Retry button). */
  retry: () => void;
}

interface Settled<T> {
  loader: () => Promise<T>;
  attempt: number;
  data: T | null;
  error: RecipeApiError | null;
}

/**
 * Runs `loader` whenever it changes: pass a memoised function, or null when
 * there is nothing to load. Only the result for the current loader and attempt
 * is ever shown, so a slow response for an older query (or one that arrives
 * after unmount) is ignored.
 */
export function useAsync<T>(loader: (() => Promise<T>) | null): AsyncState<T> {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);

  useEffect(() => {
    if (!loader) return;
    let current = true;
    loader().then(
      (data) => {
        if (current) setSettled({ loader, attempt, data, error: null });
      },
      (error: unknown) => {
        if (current) setSettled({ loader, attempt, data: null, error: toRecipeApiError(error) });
      },
    );
    return () => {
      current = false;
    };
  }, [loader, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const isCurrent = loader !== null && settled !== null && settled.loader === loader && settled.attempt === attempt;
  return {
    data: isCurrent ? settled.data : null,
    error: isCurrent ? settled.error : null,
    loading: loader !== null && !isCurrent,
    retry,
  };
}
```

Create `src/components/molecules/ErrorPanel.tsx`:

```tsx
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../atoms/Button';

interface ErrorPanelProps {
  message: string;
  onRetry: () => void;
  /** Smaller padding, for panels inside a card or modal */
  compact?: boolean;
}

/** Shared error state for recipe screens: the message and a Retry button. */
export const ErrorPanel: React.FC<ErrorPanelProps> = ({ message, onRetry, compact = false }) => (
  <div
    role="alert"
    data-testid="error-panel"
    className={`bg-white rounded-xl border border-red-200 text-center ${compact ? 'p-6' : 'p-12 shadow-sm'}`}
  >
    <AlertTriangle className={`${compact ? 'w-10 h-10' : 'w-16 h-16'} text-red-400 mx-auto mb-4`} />
    <p className="text-gray-800 mb-6">{message}</p>
    <div className="flex justify-center">
      <Button variant="outline" onClick={onRetry}>
        <RefreshCw className="w-4 h-4" />
        Retry
      </Button>
    </div>
  </div>
);
```

Create `src/components/molecules/Pagination.tsx`:

```tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../atoms/Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Previous/next paging; hidden when everything fits on one page. */
export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-4 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(page - 1, totalPages))}
        disabled={page <= 1}
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>
      <span className="text-sm text-gray-600">
        Page {page} of {totalPages}
      </span>
      <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
        Next
        <ChevronRight className="w-4 h-4" />
      </Button>
    </nav>
  );
};
```

Create `src/components/molecules/CategoryGrid.tsx`:

```tsx
import React from 'react';
import type { RecipeCategory } from '../../types/recipe.types';

interface CategoryGridProps {
  categories: RecipeCategory[];
  onSelect: (name: string) => void;
}

/** TheMealDB categories as photo tiles (the Recipes landing view). */
export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, onSelect }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
    {categories.map((category) => (
      <button
        key={category.name}
        type="button"
        data-testid="category-tile"
        onClick={() => onSelect(category.name)}
        className="group bg-white rounded-xl border border-gray-200 overflow-hidden text-left hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <div className="h-32 bg-gray-50 flex items-center justify-center overflow-hidden">
          <img
            src={category.thumbnail}
            alt={category.name}
            loading="lazy"
            className="h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900">{category.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{category.description}</p>
        </div>
      </button>
    ))}
  </div>
);
```

In `src/components/atoms/Dropdown.tsx`:
- Add `ariaLabel?: string;` to `DropdownProps`, after `id?: string;`.
- Add `ariaLabel,` to the destructured props, after `id,`.
- Add `aria-label={ariaLabel}` to the `<select>`, after `id={id}`.

Replace the whole of `src/components/molecules/RecipeCard.tsx` with:

```tsx
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Heart } from 'lucide-react';
import type { RecipeSummary } from '../../types/recipe.types';
import { Badge } from '../atoms/Badge';
import { useRecipes } from '../../contexts/useRecipes';
import { previewImage } from '../../services/recipes/recipeUtils';

interface RecipeCardProps {
  recipe: RecipeSummary;
  onClick?: () => void;
  variant?: 'compact' | 'full';
  isDraggable?: boolean;
  showFavorite?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onClick,
  variant = 'full',
  isDraggable = false,
  showFavorite = true,
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: recipe.id,
    data: { recipe },
    disabled: !isDraggable,
  });

  const { isFavorite, toggleFavorite } = useRecipes();
  const favorited = isFavorite(recipe.id);
  const image = previewImage(recipe.thumbnail);
  const meta = [recipe.category, recipe.cuisine].filter(Boolean).join(' • ');

  const handleClick = () => {
    if (onClick && !isDragging) {
      onClick();
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    toggleFavorite(recipe.id);
  };

  if (variant === 'compact') {
    return (
      <div
        data-testid="recipe-card"
        ref={isDraggable ? setNodeRef : undefined}
        {...(isDraggable ? listeners : {})}
        {...(isDraggable ? attributes : {})}
        onClick={handleClick}
        className={`
          flex gap-3 p-3 bg-white rounded-lg border border-gray-200
          hover:shadow-md transition-all cursor-pointer relative
          ${isDragging ? 'opacity-50' : ''}
          ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}
        `}
      >
        <img src={image} alt={recipe.name} loading="lazy" className="w-16 h-16 rounded-md object-cover flex-shrink-0" />
        <div className="flex-1 min-w-0 pr-6">
          <h4 className="font-medium text-sm text-gray-900 truncate mb-1">{recipe.name}</h4>
          {meta && <p className="text-xs text-gray-500 truncate">{meta}</p>}
        </div>
        {showFavorite && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white transition-colors"
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`w-4 h-4 ${
                favorited ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'
              } transition-colors`}
            />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      data-testid="recipe-card"
      ref={isDraggable ? setNodeRef : undefined}
      {...(isDraggable ? listeners : {})}
      {...(isDraggable ? attributes : {})}
      onClick={handleClick}
      className={`
        bg-white rounded-lg border border-gray-200 overflow-hidden
        hover:shadow-lg transition-all cursor-pointer relative group
        ${isDragging ? 'opacity-50 shadow-2xl' : ''}
        ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}
      `}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={recipe.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {recipe.category && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" size="sm">
              {recipe.category}
            </Badge>
          </div>
        )}
        {showFavorite && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white transition-all shadow-md hover:scale-110"
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`w-5 h-5 ${
                favorited ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
              } transition-colors`}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">{recipe.name}</h3>
        {recipe.cuisine && <p className="text-sm text-gray-500">{recipe.cuisine}</p>}
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Rewrite the Recipes page.** Replace the whole of `src/pages/Recipes.tsx` with:

```tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { filterOptions } from '../services/recipes/recipeUtils';

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
    body = <ErrorPanel message={results.error.message} onRetry={results.retry} />;
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
```

- [ ] **Step 5: Update epic2's recipe selectors.** `[class*="Recipe"]` matches nothing with Tailwind classes, so it is replaced by the card's test id.
  - In `tests/helpers/mealplan.helper.ts`, change `const recipeCards = await this.page.locator('[class*="RecipeCard"]').all();` to `const recipeCards = await this.page.getByTestId('recipe-card').all();`.
  - In `tests/epic2-meal-planning.spec.ts`, change the first line to `import { test, expect, type Page } from '@playwright/test';`.
  - Replace the whole `test.describe('US-2.2: Add Recipe to Meal Slot', () => { ... });` block (it ends at the `});` just before `test.describe('US-2.3: Meal Suggestions'`) with:

```ts
  test.describe('US-2.2: Add Recipe to Meal Slot', () => {
    const openPicker = async (page: Page) => {
      await mealPlanHelper.navigateToMealPlan();
      await page.locator('button:has-text("Add meal")').first().click();
      await expect(page.locator('text=Add Recipe')).toBeVisible({ timeout: 5000 });
    };

    const addFirstRecipe = async (page: Page) => {
      await page.getByTestId('recipe-card').first().click();
      await page.locator('button:has-text("Add to")').click();
      await expect(page.locator('text=Add Recipe')).toBeHidden({ timeout: 5000 });
    };

    test('should open recipe browser modal when clicking empty slot', async ({ page }) => {
      await openPicker(page);
    });

    test('should display search bar in recipe browser', async ({ page }) => {
      await openPicker(page);
      await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
    });

    test('should filter recipes by search query', async ({ page }) => {
      await openPicker(page);
      await mealPlanHelper.searchRecipes('pancake');
      await expect(page.getByTestId('recipe-card').filter({ hasText: /pancake/i }).first()).toBeVisible();
    });

    test('should filter recipes by category', async ({ page }) => {
      await openPicker(page);
      await page.getByRole('dialog').locator('select').first().selectOption('Breakfast');
      await expect(page.getByTestId('recipe-card').first()).toBeVisible();
    });

    test('should add recipe to meal slot', async ({ page }) => {
      await openPicker(page);
      await addFirstRecipe(page);
      await expect(page.getByRole('button', { name: 'Remove meal' })).toHaveCount(1);
    });

    test('should close modal with X button', async ({ page }) => {
      await openPicker(page);
      await page.getByRole('button', { name: 'Close modal' }).click();
      await expect(page.locator('text=Add Recipe')).toBeHidden({ timeout: 5000 });
    });

    test('should close modal with Escape key', async ({ page }) => {
      await openPicker(page);
      await page.keyboard.press('Escape');
      await expect(page.locator('text=Add Recipe')).toBeHidden({ timeout: 5000 });
    });

    test('should show confirmation when replacing existing meal', async ({ page }) => {
      await openPicker(page);
      await addFirstRecipe(page);
      // The filled slot no longer offers "Add meal"; it has a remove button instead
      await expect(page.getByRole('button', { name: 'Remove meal' })).toHaveCount(1);
    });

    test('should persist changes to localStorage', async ({ page }) => {
      await openPicker(page);
      await addFirstRecipe(page);
      await page.reload();
      await expect(page.getByRole('button', { name: 'Remove meal' })).toHaveCount(1, { timeout: 5000 });
    });
  });
```

Then replace everything from `  test.describe('Integration: Complete Meal Planning Flow', () => {` to the end of the file with:

```ts
  test.describe('Integration: Complete Meal Planning Flow', () => {
    test('should complete full meal planning workflow', async ({ page }) => {
      await mealPlanHelper.navigateToMealPlan();

      // 1. Add meals to three slots
      for (let i = 0; i < 3; i++) {
        await page.locator('button:has-text("Add meal")').first().click();
        await expect(page.locator('text=Add Recipe')).toBeVisible({ timeout: 5000 });
        await page.getByTestId('recipe-card').first().click();
        await page.locator('button:has-text("Add to")').click();
        await expect(page.locator('text=Add Recipe')).toBeHidden({ timeout: 5000 });
      }

      // 2. Verify meals were added
      await expect(page.getByRole('button', { name: 'Remove meal' })).toHaveCount(3);

      // 3. Navigate to next week (empty), then back
      await mealPlanHelper.navigateToNextWeek();
      await expect(page.getByRole('button', { name: 'Remove meal' })).toHaveCount(0);
      await mealPlanHelper.navigateToThisWeek();

      // 4. Verify meals are still there
      await expect(page.getByRole('button', { name: 'Remove meal' })).toHaveCount(3);
    });
  });
});
```

- [ ] **Step 6: Run the specs to verify they pass.**
Run: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && BROWSER=none npx playwright test tests/recipes.spec.ts --project=chromium`
Expected: `10 passed`.
Then run the **Epic2 regression check** from Global Constraints.
Expected: no output. Some baseline failures may now pass, which is fine.

- [ ] **Step 7: Verify.**
Run: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && npx tsc --noEmit && npm run lint && npm run build && npm run test:unit`
Expected: all pass. Favourites, detail and the meal plan still pass old mock recipes to `RecipeCard`; that type-checks because a mock `Recipe` has every `RecipeSummary` field.

- [ ] **Step 8: Commit.**

```bash
cd D:/ProjectsWS/meal-planner/meal-planner-frontend
git add src/hooks src/components/molecules/ErrorPanel.tsx src/components/molecules/Pagination.tsx src/components/molecules/CategoryGrid.tsx src/components/atoms/Dropdown.tsx src/components/molecules/RecipeCard.tsx src/pages/Recipes.tsx tests/recipes.spec.ts tests/epic2-meal-planning.spec.ts tests/helpers/mealplan.helper.ts
git commit -m "feat(recipes): browse TheMealDB recipes by category, name, cuisine and ingredient" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014u1dJTmEC1ARhmephG3Zfk"
```

---

### Task 5: Recipe detail on the API

**Files:**
- Modify: `src/pages/RecipeDetail.tsx` (rewrite), `src/components/molecules/NutritionCard.tsx` (rewrite), `src/components/molecules/RecipeActions.tsx` (type only)
- Delete: `src/components/atoms/ServingAdjuster.tsx`
- Test: `tests/recipe-detail.spec.ts`

**Interfaces:**
- Consumes: `getRecipe` (Task 2, cached), `recipesApi.searchRecipes`, `MAX_PAGE_SIZE` and `RECIPE_NOT_AVAILABLE_MESSAGE` (Task 1), `isRecipeId` and `pickSimilar` (Task 2), `useAsync`, `ErrorPanel` and `RecipeCard` (Task 4).
- Produces: `RecipeActions` takes `recipe: RecipeSummary`, and `NutritionCard` takes `{ className?: string }` only. The page has these test ids: `recipe-detail` (root), `recipe-hero`, `ingredient`, `instruction`, `similar-recipes` and `recipe-not-available`.

- [ ] **Step 1: Write the failing spec.** Create `tests/recipe-detail.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { signInWithMockedSession } from './helpers/session.helper';
import { mockRecipesApi, outage, overrideRecipesApi, type RecipesApiMock } from './helpers/recipes.fixtures';

const UNAVAILABLE = 'Recipes are temporarily unavailable, please try again shortly';
const NOT_AVAILABLE = 'This recipe is no longer available';

test.describe('Recipe detail (TheMealDB via /api/recipes/:id)', () => {
  let api: RecipesApiMock;

  test.beforeEach(async ({ page }) => {
    api = await mockRecipesApi(page);
    await signInWithMockedSession(page);
  });

  test('shows photo, category, cuisine, tags, ingredients with measures, steps and YouTube link', async ({ page }) => {
    await page.goto('/recipes/52772');
    await expect(page.getByRole('heading', { level: 1, name: 'Teriyaki Chicken Casserole' })).toBeVisible();
    // Full-size image on the detail page (lists use /preview)
    await expect(page.getByRole('img', { name: 'Teriyaki Chicken Casserole', exact: true }).first()).toHaveAttribute(
      'src',
      'https://www.themealdb.com/images/media/meals/52772.jpg',
    );
    const hero = page.getByTestId('recipe-hero');
    await expect(hero.getByText('Chicken', { exact: true })).toBeVisible();
    await expect(hero.getByText('Japanese', { exact: true })).toBeVisible();
    await expect(hero.getByText('Casserole', { exact: true })).toBeVisible();
    await expect(page.getByTestId('ingredient').first()).toContainText('3/4 cup');
    await expect(page.getByTestId('ingredient').first()).toContainText('soy sauce');
    await expect(page.getByTestId('instruction')).toHaveCount(3);
    await expect(page.getByRole('link', { name: 'Watch on YouTube' })).toHaveAttribute(
      'href',
      'https://www.youtube.com/watch?v=4aZr5hZXP_s',
    );
    await expect(page.getByText('Nutrition information coming soon')).toBeVisible();
    await expect(page.getByText(/servings|Prep Time|Cook Time|Total Time/)).toHaveCount(0);
  });

  test('has no YouTube link when the recipe has none', async ({ page }) => {
    await page.goto('/recipes/52795');
    await expect(page.getByRole('heading', { level: 1, name: 'Chicken Handi' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Watch on YouTube' })).toHaveCount(0);
  });

  test('shows up to 4 similar recipes from the same category, excluding this one', async ({ page }) => {
    await page.goto('/recipes/60001');
    const similar = page.getByTestId('similar-recipes').getByTestId('recipe-card');
    await expect(similar.locator('h4')).toHaveText(['Misc Dish 2', 'Misc Dish 3', 'Misc Dish 4', 'Misc Dish 5']);
    expect(api.requests).toContain('/api/recipes?category=Miscellaneous&limit=50');

    await page.goto('/recipes/52772');
    await expect(page.getByTestId('similar-recipes').getByTestId('recipe-card').locator('h4')).toHaveText([
      'Chicken Handi',
      'Brown Stew Chicken',
    ]);
  });

  test('an old mock recipe id says "no longer available" without calling the API', async ({ page }) => {
    await page.goto('/recipes/recipe-001');
    await expect(page.getByTestId('recipe-not-available')).toContainText(NOT_AVAILABLE);
    expect(api.requests.filter((r) => r.startsWith('/api/recipes/recipe'))).toHaveLength(0);
  });

  test('an unknown id (404) says "no longer available"', async ({ page }) => {
    await page.goto('/recipes/99999');
    await expect(page.getByTestId('recipe-not-available')).toContainText(NOT_AVAILABLE);
  });

  test('shows the 503 message with a working Retry', async ({ page }) => {
    const down = outage();
    await overrideRecipesApi(page, (url) => url.pathname === '/api/recipes/52772', down.handler);
    await page.goto('/recipes/52772');
    await expect(page.getByTestId('error-panel')).toContainText(UNAVAILABLE);
    down.end();
    await page.getByRole('button', { name: 'Retry' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Teriyaki Chicken Casserole' })).toBeVisible();
  });

  test('fetches each recipe at most once per session', async ({ page }) => {
    const heading = page.getByRole('heading', { level: 1, name: 'Teriyaki Chicken Casserole' });
    await page.goto('/recipes?category=Chicken');
    await page.getByTestId('recipe-card').filter({ hasText: 'Teriyaki' }).click();
    await expect(heading).toBeVisible();
    await page.goBack();
    await page.getByTestId('recipe-card').filter({ hasText: 'Teriyaki' }).click();
    await expect(heading).toBeVisible();
    expect(api.requests.filter((r) => r === '/api/recipes/52772')).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run the spec to verify it fails.**
Run: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && BROWSER=none npx playwright test tests/recipe-detail.spec.ts --project=chromium`
Expected: FAIL. The page still reads the mock catalogue, so `/recipes/52772` redirects with "Recipe not found" and the headings and test ids never appear.

- [ ] **Step 3: Implement.** Replace the whole of `src/components/molecules/NutritionCard.tsx` with:

```tsx
import React from 'react';
import { Flame } from 'lucide-react';

interface NutritionCardProps {
  className?: string;
}

/**
 * TheMealDB has no nutrition data, so none is shown or estimated. Nutrition
 * from USDA FoodData Central is planned (part 2 of the TheMealDB work).
 */
export const NutritionCard: React.FC<NutritionCardProps> = ({ className = '' }) => (
  <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
    <div className="flex items-center gap-2 mb-2">
      <Flame className="w-5 h-5 text-orange-500" />
      <h3 className="text-lg font-semibold text-gray-900">Nutrition</h3>
    </div>
    <p className="text-sm text-gray-600">Nutrition information coming soon</p>
  </div>
);
```

In `src/components/molecules/RecipeActions.tsx`:
- Replace `import type { Recipe } from '../../types/legacyRecipe.types';` with `import type { RecipeSummary } from '../../types/recipe.types';`.
- Replace `  recipe: Recipe;` in `RecipeActionsProps` with `  recipe: RecipeSummary;`. The component only reads `id` and `name`.

Delete the serving adjuster: `git rm src/components/atoms/ServingAdjuster.tsx`.

Replace the whole of `src/pages/RecipeDetail.tsx` with:

```tsx
import React, { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import recipesApi, { MAX_PAGE_SIZE, RECIPE_NOT_AVAILABLE_MESSAGE } from '../services/api/recipesApi';
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
    () => (category ? () => recipesApi.searchRecipes({ category, limit: MAX_PAGE_SIZE }) : null),
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
            <NutritionCard />

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
```

- [ ] **Step 4: Run the spec to verify it passes.**
Run: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && BROWSER=none npx playwright test tests/recipe-detail.spec.ts tests/recipes.spec.ts --project=chromium`
Expected: `17 passed`.

- [ ] **Step 5: Verify.**
Run: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && npx tsc --noEmit && npm run lint && npm run build && npm run test:unit`
Expected: all pass. `RecipeContext` still offers `setCurrentRecipe`, `adjustedServings` and the rest, now unused; Task 6 removes them.

- [ ] **Step 6: Commit.**

```bash
cd D:/ProjectsWS/meal-planner/meal-planner-frontend
git add src/pages/RecipeDetail.tsx src/components/molecules/NutritionCard.tsx src/components/molecules/RecipeActions.tsx tests/recipe-detail.spec.ts
# ServingAdjuster.tsx is already staged as deleted by `git rm` in Step 3
git commit -m "feat(recipes): recipe detail from the API with similar recipes and no serving adjuster" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014u1dJTmEC1ARhmephG3Zfk"
```

---

### Task 6: Favourites on the API (and dropping old ids)

**Files:**
- Modify: `src/contexts/RecipeContext.tsx` (rewrite), `src/contexts/useRecipes.ts` (rewrite), `src/pages/Favorites.tsx` (rewrite)
- Test: `tests/favorites.spec.ts`

**Interfaces:**
- Consumes: `readFavoriteIds`, `writeFavoriteIds`, `toggleFavoriteId`, `loadFavoriteRecipes`, `getRecipe` and `filterOptions` (Task 2); `useAsync`, `ErrorPanel`, `RecipeCard` and `Dropdown.ariaLabel` (Task 4); `useAuth().user`.
- Produces (the context now holds favourites only; `RecipeCard` and `RecipeActions` keep working unchanged):

```ts
export interface RecipeContextType {
  favoriteIds: string[];                       // TheMealDB ids, oldest first
  isFavorite: (recipeId: string) => boolean;
  toggleFavorite: (recipeId: string) => boolean; // true when now a favourite
}
```

- [ ] **Step 1: Write the failing spec.** Create `tests/favorites.spec.ts`:

```ts
import { test, expect, type Page } from '@playwright/test';
import { signInWithMockedSession, TEST_USER } from './helpers/session.helper';
import { mockRecipesApi, outage, overrideRecipesApi, type RecipesApiMock } from './helpers/recipes.fixtures';

const FAVORITES_KEY = `user_favorites_${TEST_USER.id}`;
const UNAVAILABLE = 'Recipes are temporarily unavailable, please try again shortly';

const favoritesStorage = (value: unknown): Record<string, string> => ({
  [FAVORITES_KEY]: typeof value === 'string' ? value : JSON.stringify(value),
});

const storedFavorites = (page: Page) => page.evaluate((key) => localStorage.getItem(key), FAVORITES_KEY);

test.describe('Favourites (TheMealDB via /api/recipes)', () => {
  let api: RecipesApiMock;

  test.beforeEach(async ({ page }) => {
    api = await mockRecipesApi(page);
  });

  test('drops old non-numeric ids on first load and shows the rest', async ({ page }) => {
    await signInWithMockedSession(page, favoritesStorage(['recipe-001', '52772', 'recipe-002', '52874']));
    await page.goto('/favorites');
    await expect(page.getByTestId('recipe-card')).toHaveCount(2);
    expect(await storedFavorites(page)).toBe('["52772","52874"]');
    expect(api.requests.filter((r) => r.startsWith('/api/recipes/recipe'))).toHaveLength(0);
  });

  test('a recipe saved on the Recipes page appears in Favourites', async ({ page }) => {
    await signInWithMockedSession(page);
    await page.goto('/recipes?category=Chicken');
    await page
      .getByTestId('recipe-card')
      .filter({ hasText: 'Teriyaki Chicken Casserole' })
      .getByRole('button', { name: 'Add to favorites' })
      .click();
    await page.goto('/favorites');
    await expect(page.getByTestId('recipe-card')).toHaveCount(1);
    await expect(page.getByTestId('recipe-card')).toContainText('Teriyaki Chicken Casserole');
  });

  test('searches by name and filters by category; only recent and name sorts remain', async ({ page }) => {
    await signInWithMockedSession(page, favoritesStorage(['52772', '52874', '52795']));
    await page.goto('/favorites');
    const cards = page.getByTestId('recipe-card');
    await expect(cards).toHaveCount(3);

    await page.getByLabel('Search favorites', { exact: true }).fill('handi');
    await expect(cards).toHaveCount(1);
    await expect(cards).toContainText('Chicken Handi');

    await page.getByLabel('Search favorites', { exact: true }).fill('');
    await page.getByLabel('Category', { exact: true }).selectOption('Beef');
    await expect(cards).toHaveCount(1);
    await expect(cards).toContainText('Beef and Mustard Pie');

    await expect(page.getByLabel('Sort by', { exact: true }).locator('option')).toHaveText([
      'Recently Added',
      'Name (A-Z)',
    ]);
  });

  test('skips a favourite that TheMealDB no longer has (404)', async ({ page }) => {
    await signInWithMockedSession(page, favoritesStorage(['52772', '99999']));
    await page.goto('/favorites');
    await expect(page.getByTestId('recipe-card')).toHaveCount(1);
    await expect(page.getByTestId('error-panel')).toHaveCount(0);
  });

  test('shows the 503 message with a working Retry', async ({ page }) => {
    const down = outage();
    await overrideRecipesApi(page, (url) => url.pathname === '/api/recipes/52772', down.handler);
    await signInWithMockedSession(page, favoritesStorage(['52772']));
    await page.goto('/favorites');
    await expect(page.getByTestId('error-panel')).toContainText(UNAVAILABLE);
    down.end();
    await page.getByRole('button', { name: 'Retry' }).click();
    await expect(page.getByTestId('recipe-card')).toHaveCount(1);
  });

  test('shows the empty state for corrupt storage and cleans it up', async ({ page }) => {
    await signInWithMockedSession(page, favoritesStorage('{not json'));
    await page.goto('/favorites');
    await expect(page.getByText('No favorites yet')).toBeVisible();
    expect(await storedFavorites(page)).toBe('[]');
  });
});
```

- [ ] **Step 2: Run the spec to verify it fails.**
Run: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && BROWSER=none npx playwright test tests/favorites.spec.ts --project=chromium`
Expected: FAIL. Favourites are still matched against the mock catalogue, so numeric ids show no cards, old ids are not removed from storage, and there is no `Search favorites` label.

- [ ] **Step 3: Implement.** Replace the whole of `src/contexts/useRecipes.ts` with:

```ts
import { createContext, useContext } from 'react';

export interface RecipeContextType {
  /** The signed-in user's favourite TheMealDB ids, oldest first. */
  favoriteIds: string[];
  isFavorite: (recipeId: string) => boolean;
  /** Adds or removes a favourite; returns true when it is now a favourite. */
  toggleFavorite: (recipeId: string) => boolean;
}

// Kept apart from RecipeProvider so RecipeContext.tsx only exports components
// (required for React Fast Refresh).
export const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipes must be used within a RecipeProvider');
  }
  return context;
};
```

Replace the whole of `src/contexts/RecipeContext.tsx` with:

```tsx
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';
import { RecipeContext, RecipeContextType } from './useRecipes';
import { readFavoriteIds, toggleFavoriteId, writeFavoriteIds } from '../services/recipes/favorites';

interface RecipeProviderProps {
  children: ReactNode;
}

/** Holds the signed-in user's favourites (ids in localStorage). */
export const RecipeProvider: React.FC<RecipeProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // Load favourites on sign-in; old mock ids are dropped here the first time
  useEffect(() => {
    setFavoriteIds(userId ? readFavoriteIds(userId) : []);
  }, [userId]);

  const isFavorite = useCallback((recipeId: string) => favoriteIds.includes(recipeId), [favoriteIds]);

  const toggleFavorite = useCallback(
    (recipeId: string): boolean => {
      if (!userId) return false;
      const next = toggleFavoriteId(readFavoriteIds(userId), recipeId);
      writeFavoriteIds(userId, next);
      setFavoriteIds(next);
      return next.includes(recipeId);
    },
    [userId],
  );

  const value = useMemo<RecipeContextType>(
    () => ({ favoriteIds, isFavorite, toggleFavorite }),
    [favoriteIds, isFavorite, toggleFavorite],
  );

  return <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>;
};
```

Replace the whole of `src/pages/Favorites.tsx` with:

```tsx
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
```

- [ ] **Step 4: Run the specs to verify they pass.**
Run: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && BROWSER=none npx playwright test tests/favorites.spec.ts tests/recipe-detail.spec.ts tests/recipes.spec.ts --project=chromium`
Expected: `23 passed`.

- [ ] **Step 5: Verify.**
Run: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && npx tsc --noEmit && npm run lint && npm run build && npm run test:unit`
Expected: all pass. The context no longer imports `RecipeService`, and `grep -n "RecipeService" src/contexts/*` prints nothing.

- [ ] **Step 6: Commit.**

```bash
cd D:/ProjectsWS/meal-planner/meal-planner-frontend
git add src/contexts/RecipeContext.tsx src/contexts/useRecipes.ts src/pages/Favorites.tsx tests/favorites.spec.ts
git commit -m "feat(favourites): load favourites from the API and drop old mock ids" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014u1dJTmEC1ARhmephG3Zfk"
```

---

### Task 7: Meal plan — self-contained slots and the API recipe picker

**Files:**
- Modify: `src/types/recipe.types.ts` (`MealSlot`), `src/services/MealPlanService.ts`, `src/components/organisms/MealPlanCalendar.tsx`, `src/pages/MealPlan.tsx`
- Rewrite: `src/components/molecules/MealSlot.tsx`, `src/components/organisms/RecipeBrowserModal.tsx`
- Test: `src/services/MealPlanService.test.ts`, `tests/meal-plan-recipes.spec.ts`

**Interfaces:**
- Consumes: `RecipeSummary` (Task 1); `recipesApi.searchRecipes`, `DEFAULT_PAGE_SIZE` and `MAX_SEARCH_LENGTH` (Task 1); `loadCategories`, `loadCuisines`, `previewImage`, `filterOptions` and `MemoryStorage` (Task 2); `useAsync`, `ErrorPanel`, `Pagination`, `RecipeCard` and `Dropdown.ariaLabel` (Task 4).
- Produces (used by Task 8):

```ts
// recipe.types.ts
export interface MealSlot { recipeId: string; recipeName: string; thumbnail: string; category?: string; addedAt: string }
// MealPlanService
addMeal(userId: string, dayDate: string, mealType: MealType, recipe: RecipeSummary): MealPlan | null;
// RecipeBrowserModal props
{ isOpen: boolean; onClose: () => void; onSelectRecipe: (recipe: RecipeSummary) => void; dayName?: string; mealType?: MealType }
// MealPlanCalendar: onDropRecipe: (recipe: RecipeSummary, dayDate: string, mealType: MealType) => void
// MealSlot: the filled slot is a link to /recipes/:recipeId with data-testid="planned-meal"
```

- [ ] **Step 1: Write the failing unit test.** Create `src/services/MealPlanService.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryStorage } from '../test/memoryStorage';
import MealPlanService from './MealPlanService';
import type { MealPlan } from '../types/recipe.types';

const USER = 'user-1';
const WEEK_KEY = `mealPlans_${USER}_2026-09-27`; // the Sunday that starts the week of 30 Sept 2026

const TERIYAKI = {
  id: '52772',
  name: 'Teriyaki Chicken Casserole',
  thumbnail: 'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg',
  category: 'Chicken',
  cuisine: 'Japanese',
};

const LEGACY_PLAN = {
  userId: USER,
  weekStartDate: '2026-09-27',
  days: {
    '2026-09-28': {
      breakfast: {
        recipeId: 'recipe-001',
        recipeName: 'Classic Avocado Toast',
        thumbnail: 'data:image/svg+xml;charset=utf-8,%3Csvg%2F%3E',
        prepTime: 10,
        addedAt: '2026-09-28T08:00:00.000Z',
      },
    },
  },
};

beforeEach(() => {
  vi.stubGlobal('localStorage', new MemoryStorage());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('MealPlanService.addMeal', () => {
  it('stores the summary fields on the slot, with no lookup and no time', () => {
    const plan = MealPlanService.addMeal(USER, '2026-09-30', 'dinner', TERIYAKI);
    expect(plan?.days['2026-09-30'].dinner).toEqual({
      recipeId: '52772',
      recipeName: 'Teriyaki Chicken Casserole',
      thumbnail: TERIYAKI.thumbnail,
      category: 'Chicken',
      addedAt: expect.any(String),
    });
    const stored = JSON.parse(localStorage.getItem(WEEK_KEY) ?? 'null') as MealPlan;
    expect(stored.days['2026-09-30'].dinner?.recipeId).toBe('52772');
  });

  it('leaves category out when the summary has none', () => {
    const plan = MealPlanService.addMeal(USER, '2026-09-30', 'lunch', {
      id: '52795',
      name: 'Chicken Handi',
      thumbnail: 'https://www.themealdb.com/images/media/meals/wyxwsp1486979827.jpg',
    });
    expect(plan?.days['2026-09-30'].lunch).not.toHaveProperty('category');
    expect(plan?.days['2026-09-30'].lunch?.recipeName).toBe('Chicken Handi');
  });
});

describe('slots saved before TheMealDB', () => {
  it('are read back unchanged', () => {
    localStorage.setItem(WEEK_KEY, JSON.stringify(LEGACY_PLAN));
    const plan = MealPlanService.getMealPlan(USER, new Date(2026, 8, 30));
    expect(plan?.days['2026-09-28'].breakfast).toMatchObject({
      recipeId: 'recipe-001',
      recipeName: 'Classic Avocado Toast',
    });
  });

  it('can still be copied to other days', () => {
    localStorage.setItem(WEEK_KEY, JSON.stringify(LEGACY_PLAN));
    const plan = MealPlanService.copyDay(USER, '2026-09-28', ['2026-09-29']);
    expect(plan?.days['2026-09-29'].breakfast).toMatchObject({
      recipeId: 'recipe-001',
      recipeName: 'Classic Avocado Toast',
    });
  });
});
```

- [ ] **Step 2: Write the failing e2e spec.** Create `tests/meal-plan-recipes.spec.ts`:

```ts
import { test, expect, type Page } from '@playwright/test';
import { signInWithMockedSession, TEST_USER } from './helpers/session.helper';
import { mockRecipesApi, outage, overrideRecipesApi, type RecipesApiMock } from './helpers/recipes.fixtures';

// Wednesday 30 Sept 2026 at noon: the week starts on Sunday 27 Sept, and
// suggestions (not Breakfast after 11:00) never touch the picker's category
const NOW = new Date('2026-09-30T12:00:00');
const WEEK_KEY = `mealPlans_${TEST_USER.id}_2026-09-27`;
const UNAVAILABLE = 'Recipes are temporarily unavailable, please try again shortly';

// A slot saved while the app used the bundled mock recipes
const LEGACY_PLAN = {
  userId: TEST_USER.id,
  weekStartDate: '2026-09-27',
  days: {
    '2026-09-30': {
      lunch: {
        recipeId: 'recipe-001',
        recipeName: 'Classic Avocado Toast',
        thumbnail:
          'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2240%22%20height%3D%2230%22%2F%3E',
        prepTime: 10,
        addedAt: '2026-09-28T08:00:00.000Z',
      },
    },
  },
};

const storedPlan = (page: Page) =>
  page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? 'null'), WEEK_KEY);

async function openPicker(page: Page) {
  // The first "Add meal" is Sunday's breakfast
  await page.locator('button:has-text("Add meal")').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

test.describe('Meal plan recipes (picker and slots)', () => {
  let api: RecipesApiMock;

  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(NOW);
    api = await mockRecipesApi(page);
  });

  test('picks a recipe through the API and stores its summary on the slot', async ({ page }) => {
    await signInWithMockedSession(page);
    await page.goto('/meal-plan');
    await openPicker(page);
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByLabel('Category', { exact: true })).toHaveValue('Breakfast');
    await expect(dialog.getByTestId('recipe-card')).toHaveCount(5);

    await dialog.getByLabel('Search recipes by name', { exact: true }).fill('english');
    await expect(dialog.getByTestId('recipe-card')).toHaveCount(2);
    await dialog.getByTestId('recipe-card').filter({ hasText: 'Full English Breakfast' }).click();
    await dialog.getByRole('button', { name: 'Add to breakfast' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();

    const planned = page.getByTestId('planned-meal');
    await expect(planned).toHaveCount(1);
    await expect(planned).toContainText('Full English Breakfast');
    await expect(planned.locator('img')).toHaveAttribute('src', /\/preview$/);
    await expect(planned).not.toContainText(/\bmin\b/);

    const slot = (await storedPlan(page)).days['2026-09-27'].breakfast;
    expect(Object.keys(slot).sort()).toEqual(['addedAt', 'category', 'recipeId', 'recipeName', 'thumbnail']);
    expect(slot).toMatchObject({
      recipeId: '52896',
      recipeName: 'Full English Breakfast',
      category: 'Breakfast',
      thumbnail: 'https://www.themealdb.com/images/media/meals/52896.jpg',
    });
  });

  test('filters the picker by category and cuisine', async ({ page }) => {
    await signInWithMockedSession(page);
    await page.goto('/meal-plan');
    await openPicker(page);
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Category', { exact: true }).selectOption('Chicken');
    await expect(dialog.getByTestId('recipe-card')).toHaveCount(3);
    await dialog.getByLabel('Cuisine', { exact: true }).selectOption('Indian');
    await expect(dialog.getByTestId('recipe-card')).toHaveCount(1);
    await expect(dialog.getByTestId('recipe-card')).toContainText('Chicken Handi');
  });

  test('renders an old slot from storage, with no API call, and opens "no longer available"', async ({ page }) => {
    await signInWithMockedSession(page, { [WEEK_KEY]: JSON.stringify(LEGACY_PLAN) });
    await page.goto('/meal-plan');
    const planned = page.getByTestId('planned-meal');
    await expect(planned).toHaveCount(1);
    await expect(planned).toContainText('Classic Avocado Toast');
    await expect(planned.locator('img')).toHaveAttribute('src', /^data:image\/svg\+xml/);
    await expect(planned).not.toContainText(/\bmin\b/);
    // The calendar never looks recipes up (suggestions only search)
    expect(api.requests.filter((r) => /^\/api\/recipes\/(?!categories|cuisines)/.test(r))).toHaveLength(0);

    await planned.click();
    await expect(page).toHaveURL(/\/recipes\/recipe-001$/);
    await expect(page.getByText('This recipe is no longer available')).toBeVisible();
  });

  test('shows the 503 message in the picker with a working Retry', async ({ page }) => {
    const down = outage();
    await overrideRecipesApi(
      page,
      (url) => url.pathname === '/api/recipes' && url.searchParams.get('category') === 'Breakfast',
      down.handler,
    );
    await signInWithMockedSession(page);
    await page.goto('/meal-plan');
    await openPicker(page);
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByTestId('error-panel')).toContainText(UNAVAILABLE);
    down.end();
    await dialog.getByRole('button', { name: 'Retry' }).click();
    await expect(dialog.getByTestId('recipe-card')).toHaveCount(5);
  });
});
```

- [ ] **Step 3: Run both to verify they fail.**
Run: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && npm run test:unit`
Expected: FAIL in `MealPlanService.test.ts`, `addMeal` block. `addMeal` still looks the argument up in the mock catalogue and returns `null` (`expected undefined to deeply equal {…}`). The legacy-slot tests pass.
Run: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && BROWSER=none npx playwright test tests/meal-plan-recipes.spec.ts --project=chromium`
Expected: FAIL. The picker has no `Category` label (it still uses mock data), and there is no `planned-meal` test id.

- [ ] **Step 4: Implement the data side.** In `src/types/recipe.types.ts`, replace the `MealSlot` interface with:

```ts
/**
 * A planned meal. The calendar renders it from these stored fields alone (no
 * API call). Slots saved before TheMealDB carry an old "recipe-001" id, a
 * placeholder image, a leftover cooking-time field and no category; they
 * still render.
 */
export interface MealSlot {
  recipeId: string;
  recipeName: string;
  thumbnail: string;
  /** TheMealDB category when known; suggestions use it for variety. */
  category?: string;
  addedAt: string; // ISO timestamp
}
```

In `src/services/MealPlanService.ts`, replace the two import lines

```ts
import { MealPlan, MealSlot, MealType, DayMeals } from '../types/recipe.types';
import RecipeService from './RecipeService';
```

with

```ts
import { MealPlan, MealSlot, MealType, DayMeals, RecipeSummary } from '../types/recipe.types';
```

Then replace the whole `addMeal` method, from its `/**` comment ("Add a recipe to a specific day and meal type.") to its closing `}` just before the `removeMeal` comment, with:

```ts
  /**
   * Add a recipe to a specific day and meal type.
   * The week is derived from `dayDate` ("yyyy-MM-dd"). The slot stores the
   * summary the picker already has, so nothing is looked up.
   */
  addMeal(
    userId: string,
    dayDate: string,
    mealType: MealType,
    recipe: RecipeSummary
  ): MealPlan | null {
    const mealPlan = this.getMealPlan(userId, this.parseDayKey(dayDate));
    if (!mealPlan) return null;

    const mealSlot: MealSlot = {
      recipeId: recipe.id,
      recipeName: recipe.name,
      thumbnail: recipe.thumbnail,
      ...(recipe.category ? { category: recipe.category } : {}),
      addedAt: new Date().toISOString(),
    };

    // Initialize day if it doesn't exist
    if (!mealPlan.days[dayDate]) {
      mealPlan.days[dayDate] = {};
    }

    // Add meal to the specified slot
    mealPlan.days[dayDate][mealType] = mealSlot;

    // Save the updated meal plan
    this.saveMealPlan(mealPlan);

    return mealPlan;
  }
```

Run: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && npm run test:unit`
Expected: PASS for every file, including the 4 tests in `MealPlanService.test.ts`.

- [ ] **Step 5: Implement the UI side.** Replace the whole of `src/components/molecules/MealSlot.tsx` with:

```tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useDroppable } from '@dnd-kit/core';
import { Plus, X } from 'lucide-react';
import type { MealSlot as MealSlotType, MealType } from '../../types/recipe.types';
import { previewImage } from '../../services/recipes/recipeUtils';

interface MealSlotProps {
  dayDate: string;
  mealType: MealType;
  meal?: MealSlotType;
  onAdd: () => void;
  onRemove: () => void;
  isCurrentDay?: boolean;
}

export const MealSlot: React.FC<MealSlotProps> = ({
  dayDate,
  mealType,
  meal,
  onAdd,
  onRemove,
  isCurrentDay = false,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${dayDate}-${mealType}`,
    data: { dayDate, mealType },
  });

  const isEmpty = !meal;

  return (
    <div
      ref={setNodeRef}
      className={`
        relative rounded-lg border-2 transition-all duration-200 min-h-[80px]
        ${isEmpty ? 'border-dashed border-gray-300' : 'border-gray-200'}
        ${isOver ? 'border-primary-500 bg-primary-50' : ''}
        ${isCurrentDay && !isEmpty ? 'shadow-md' : ''}
        hover:shadow-sm
      `}
    >
      {isEmpty ? (
        <button
          onClick={onAdd}
          className="w-full h-full min-h-[80px] flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-primary-500 hover:bg-gray-50 rounded-lg transition-colors p-3"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">Add meal</span>
        </button>
      ) : (
        <div className="relative p-3 group">
          {/* Remove button */}
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 z-10"
            aria-label="Remove meal"
          >
            <X className="w-4 h-4 text-red-500" />
          </button>

          {/* Rendered from the stored slot only (no API call); old slots keep working */}
          <Link
            to={`/recipes/${meal.recipeId}`}
            data-testid="planned-meal"
            className="flex gap-3 items-center rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <img
              src={previewImage(meal.thumbnail)}
              alt={meal.recipeName}
              loading="lazy"
              className="w-16 h-16 rounded-md object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-gray-900 truncate mb-1">{meal.recipeName}</h4>
              {meal.category && <p className="text-xs text-gray-500 truncate">{meal.category}</p>}
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};
```

In `src/components/organisms/MealPlanCalendar.tsx`:
- Replace the two type-import lines (`import type { MealPlan, MealType } from '../../types/recipe.types';` and `import type { Recipe } from '../../types/legacyRecipe.types';`) with `import type { MealPlan, MealType, RecipeSummary } from '../../types/recipe.types';`.
- Replace each of the four type uses of `Recipe` with `RecipeSummary`: `onDropRecipe: (recipe: Recipe, ...)` in the props interface, `useState<Recipe | null>(null)`, and both `as Recipe | undefined`.

In `src/pages/MealPlan.tsx`:
- Replace the two type-import lines (`import type { MealPlan as MealPlanData, MealType } from '../types/recipe.types';` and `import type { Recipe } from '../types/legacyRecipe.types';`) with `import type { MealPlan as MealPlanData, MealType, RecipeSummary } from '../types/recipe.types';`.
- Change `const addRecipeToSlot = (recipe: Recipe, dayDate: string, mealType: MealType) => {` to `const addRecipeToSlot = (recipe: RecipeSummary, dayDate: string, mealType: MealType) => {`.
- In that function, change `MealPlanService.addMeal(userId, dayDate, mealType, recipe.id)` to `MealPlanService.addMeal(userId, dayDate, mealType, recipe)`.
- Change `const handleRecipeSelect = (recipe: Recipe) => {` to `const handleRecipeSelect = (recipe: RecipeSummary) => {`.
- Replace the `{/* Recipe Browser Modal */}` JSX block (the whole `<RecipeBrowserModal ... />` element) with the block below. Mounting the picker only while it is open means it fetches nothing until it is used, and it starts fresh for each slot.

```tsx
        {/* Recipe Browser Modal (mounted only while open) */}
        {isRecipeBrowserOpen && (
          <RecipeBrowserModal
            isOpen={isRecipeBrowserOpen}
            onClose={() => {
              setIsRecipeBrowserOpen(false);
              setSelectedSlot(null);
            }}
            onSelectRecipe={handleRecipeSelect}
            dayName={
              selectedSlot ? format(parseISO(selectedSlot.dayDate), 'EEEE, MMM d') : undefined
            }
            mealType={selectedSlot?.mealType}
          />
        )}
```

Replace the whole of `src/components/organisms/RecipeBrowserModal.tsx` with:

```tsx
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
```

- [ ] **Step 6: Run the specs to verify they pass.**
Run: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && BROWSER=none npx playwright test tests/meal-plan-recipes.spec.ts --project=chromium`
Expected: `4 passed`.
Then run the **Epic2 regression check**.
Expected: no output. The US-2.2 picker tests now run against the fixture API; for example, `pancake` finds the `Pancakes` fixture.

- [ ] **Step 7: Verify.**
Run: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && npx tsc --noEmit && npm run lint && npm run build && npm run test:unit`
Expected: all pass. The suggestions panel still uses `MockAIService` and passes old mock recipes to `addRecipeToSlot`. That type-checks because a mock `Recipe` has every `RecipeSummary` field; Task 8 replaces it.

- [ ] **Step 8: Commit.**

```bash
cd D:/ProjectsWS/meal-planner/meal-planner-frontend
git add src/types/recipe.types.ts src/services/MealPlanService.ts src/services/MealPlanService.test.ts src/components/molecules/MealSlot.tsx src/components/organisms/MealPlanCalendar.tsx src/components/organisms/RecipeBrowserModal.tsx src/pages/MealPlan.tsx tests/meal-plan-recipes.spec.ts
git commit -m "feat(meal-plan): pick recipes from the API and store self-contained slots" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014u1dJTmEC1ARhmephG3Zfk"
```

---

### Task 8: SuggestionService replaces MockAIService

**Files:**
- Create: `src/services/SuggestionService.ts`
- Test: `src/services/SuggestionService.test.ts`, `tests/suggestions.spec.ts`
- Rewrite: `src/components/organisms/MealSuggestions.tsx`, `src/components/molecules/SuggestionCard.tsx`
- Modify: `tests/epic2-meal-planning.spec.ts` (US-2.3 block)
- Delete: `src/services/MockAIService.ts`

**Interfaces:**
- Consumes: `recipesApi.searchRecipes`, `MAX_PAGE_SIZE` and `RecipeApiError` (Task 1); `MealPlan`, `RecipePage`, `RecipeQuery` and `RecipeSummary` (Tasks 1 and 7); `MealPlanService.getMealPlan`; `previewImage` (Task 2); `useAsync` and `ErrorPanel` (Task 4).
- Produces:

```ts
export const BREAKFAST_CATEGORY = 'Breakfast';
export const MAIN_CATEGORIES: readonly ['Chicken', 'Beef', 'Pasta', 'Seafood', 'Vegetarian', 'Lamb', 'Pork'];
export const BREAKFAST_CUTOFF_HOUR = 11, SUGGESTION_COUNT = 4;
export const BREAKFAST_REASON = 'Breakfast idea', VARIETY_REASON = 'Something different this week';
export type RandomSource = () => number;
export interface Suggestion { recipe: RecipeSummary; reason: string }
export interface PlannedMeals { ids: Set<string>; categories: Set<string> }
export function plannedMeals(plan: MealPlan | null): PlannedMeals;
export function chooseCategory(hour: number, planned: PlannedMeals, random: RandomSource): { category: string; reason: string };
export function pickRandom<T>(items: T[], count: number, random: RandomSource): T[];
export class SuggestionService {
  constructor(search: (query: RecipeQuery) => Promise<RecipePage>);
  getSuggestions(plan: MealPlan | null, now?: Date, random?: RandomSource): Promise<Suggestion[]>;
}
export default new SuggestionService((query) => recipesApi.searchRecipes(query));
// MealSuggestions props: { userId: string; onAddToPlan: (recipe: RecipeSummary, dayDate: string, mealType: MealType) => void; weekDays: Date[] }
// test ids: meal-suggestions (panel root), suggestion-card
```

- [ ] **Step 1: Write the failing unit test.** Create `src/services/SuggestionService.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { RecipeApiError } from './api/recipesApi';
import {
  BREAKFAST_REASON,
  MAIN_CATEGORIES,
  SuggestionService,
  VARIETY_REASON,
  chooseCategory,
  pickRandom,
  plannedMeals,
} from './SuggestionService';
import type { MealPlan, RecipePage, RecipeQuery, RecipeSummary } from '../types/recipe.types';

const WEEK = ['2026-09-27', '2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03'];
const nothingPlanned = { ids: new Set<string>(), categories: new Set<string>() };
const first = () => 0;
const last = () => 0.999999;

function planWith(slots: Array<{ id: string; category?: string }>): MealPlan {
  const days: MealPlan['days'] = {};
  slots.forEach((slot, i) => {
    days[WEEK[i]] = {
      dinner: {
        recipeId: slot.id,
        recipeName: `Recipe ${slot.id}`,
        thumbnail: `${slot.id}.jpg`,
        ...(slot.category ? { category: slot.category } : {}),
        addedAt: '2026-09-27T12:00:00.000Z',
      },
    };
  });
  return { userId: 'user-1', weekStartDate: '2026-09-27', days };
}

const summaries = (ids: string[]): RecipeSummary[] =>
  ids.map((id) => ({ id, name: `Recipe ${id}`, thumbnail: `${id}.jpg` }));

function serviceReturning(recipes: RecipeSummary[]) {
  const queries: RecipeQuery[] = [];
  const service = new SuggestionService(async (query) => {
    queries.push(query);
    const page: RecipePage = { recipes, total: recipes.length, page: 1, totalPages: 1 };
    return page;
  });
  return { service, queries };
}

describe('chooseCategory', () => {
  it('suggests breakfast before 11:00', () => {
    expect(chooseCategory(10, nothingPlanned, last)).toEqual({ category: 'Breakfast', reason: BREAKFAST_REASON });
    expect(BREAKFAST_REASON).toBe('Breakfast idea');
  });

  it('picks one of the main categories from 11:00', () => {
    expect(MAIN_CATEGORIES).toEqual(['Chicken', 'Beef', 'Pasta', 'Seafood', 'Vegetarian', 'Lamb', 'Pork']);
    expect(chooseCategory(11, nothingPlanned, first)).toEqual({ category: 'Chicken', reason: 'Chicken idea' });
    expect(chooseCategory(23, nothingPlanned, last)).toEqual({ category: 'Pork', reason: 'Pork idea' });
  });

  it('prefers categories not planned this week', () => {
    const planned = { ids: new Set<string>(), categories: new Set(['Chicken', 'Beef']) };
    expect(chooseCategory(14, planned, first)).toEqual({ category: 'Pasta', reason: VARIETY_REASON });
    expect(VARIETY_REASON).toBe('Something different this week');
  });

  it('falls back to any main category when all are planned', () => {
    const planned = { ids: new Set<string>(), categories: new Set<string>(MAIN_CATEGORIES) };
    expect(chooseCategory(14, planned, first)).toEqual({ category: 'Chicken', reason: 'Chicken idea' });
  });

  it('never indexes past the end, even if random() returns 1', () => {
    expect(chooseCategory(14, nothingPlanned, () => 1).category).toBe('Pork');
  });
});

describe('plannedMeals', () => {
  it('collects ids and known categories (old slots have no category)', () => {
    const planned = plannedMeals(planWith([{ id: '52772', category: 'Chicken' }, { id: 'recipe-001' }]));
    expect([...planned.ids].sort()).toEqual(['52772', 'recipe-001']);
    expect([...planned.categories]).toEqual(['Chicken']);
  });

  it('treats a missing plan as empty', () => {
    expect(plannedMeals(null)).toEqual(nothingPlanned);
  });
});

describe('pickRandom', () => {
  it('returns distinct items, at most `count`', () => {
    expect(pickRandom([1, 2, 3, 4, 5, 6], 4, first)).toEqual([1, 2, 3, 4]);
    expect(pickRandom([1, 2, 3, 4, 5, 6], 4, last)).toEqual([6, 5, 4, 3]);
    expect(pickRandom([1, 2], 4, first)).toEqual([1, 2]);
  });
});

describe('SuggestionService.getSuggestions', () => {
  it('fetches one category (limit 50) and returns 4 unplanned recipes with a reason', async () => {
    const { service, queries } = serviceReturning(summaries(['1', '2', '3', '4', '5', '6']));
    const plan = planWith([{ id: '1', category: 'Chicken' }]);
    const result = await service.getSuggestions(plan, new Date(2026, 8, 30, 14, 0), first);
    expect(queries).toEqual([{ category: 'Beef', limit: 50 }]);
    expect(result.map((s) => s.recipe.id)).toEqual(['2', '3', '4', '5']);
    expect(result.every((s) => s.reason === VARIETY_REASON && s.recipe.category === 'Beef')).toBe(true);
  });

  it('returns fewer when most of the category is already planned', async () => {
    const { service } = serviceReturning(summaries(['1', '2']));
    const result = await service.getSuggestions(
      planWith([{ id: '1', category: 'Breakfast' }]),
      new Date(2026, 8, 30, 8, 0),
      first,
    );
    expect(result).toEqual([
      { recipe: { id: '2', name: 'Recipe 2', thumbnail: '2.jpg', category: 'Breakfast' }, reason: BREAKFAST_REASON },
    ]);
  });

  it('passes API errors through', async () => {
    const service = new SuggestionService(async () => {
      throw new RecipeApiError('unavailable', 'down', 503);
    });
    await expect(service.getSuggestions(null, new Date(2026, 8, 30, 8, 0), first)).rejects.toMatchObject({
      kind: 'unavailable',
    });
  });
});
```

- [ ] **Step 2: Write the failing e2e spec.** Create `tests/suggestions.spec.ts`:

```ts
import { test, expect, type Page } from '@playwright/test';
import { signInWithMockedSession, TEST_USER } from './helpers/session.helper';
import { mockRecipesApi, outage, overrideRecipesApi, type RecipesApiMock } from './helpers/recipes.fixtures';

const MORNING = new Date('2026-09-30T08:00:00');
const AFTERNOON = new Date('2026-09-30T14:00:00');
const WEEK_KEY = `mealPlans_${TEST_USER.id}_2026-09-27`;
const UNAVAILABLE = 'Recipes are temporarily unavailable, please try again shortly';
const MAIN = ['Chicken', 'Beef', 'Pasta', 'Seafood', 'Vegetarian', 'Lamb', 'Pork'];

type Meal = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

function planWith(slots: Array<{ day: string; meal: Meal; id: string; name: string; category: string }>): string {
  const days: Record<string, Record<string, unknown>> = {};
  for (const s of slots) {
    days[s.day] = {
      ...(days[s.day] ?? {}),
      [s.meal]: {
        recipeId: s.id,
        recipeName: s.name,
        thumbnail: `https://www.themealdb.com/images/media/meals/${s.id}.jpg`,
        category: s.category,
        addedAt: '2026-09-28T08:00:00.000Z',
      },
    };
  }
  return JSON.stringify({ userId: TEST_USER.id, weekStartDate: '2026-09-27', days });
}

const panel = (page: Page) => page.getByTestId('meal-suggestions');

test.describe('Meal suggestions (SuggestionService)', () => {
  let api: RecipesApiMock;

  test.beforeEach(async ({ page }) => {
    api = await mockRecipesApi(page);
  });

  test('before 11:00 suggests four breakfast recipes', async ({ page }) => {
    await page.clock.setFixedTime(MORNING);
    await signInWithMockedSession(page);
    await page.goto('/meal-plan');
    const cards = panel(page).getByTestId('suggestion-card');
    await expect(cards).toHaveCount(4);
    await expect(cards.filter({ hasText: 'Breakfast idea' })).toHaveCount(4);
    await expect(cards.first().locator('img')).toHaveAttribute('src', /\/preview$/);
    expect(api.requests).toContain('/api/recipes?category=Breakfast&limit=50');
  });

  test('excludes recipes already planned this week', async ({ page }) => {
    await page.clock.setFixedTime(MORNING);
    await signInWithMockedSession(page, {
      [WEEK_KEY]: planWith([
        { day: '2026-09-27', meal: 'breakfast', id: '52965', name: 'Breakfast Potatoes', category: 'Breakfast' },
        { day: '2026-09-28', meal: 'breakfast', id: '52895', name: 'English Breakfast', category: 'Breakfast' },
        { day: '2026-09-29', meal: 'breakfast', id: '52896', name: 'Full English Breakfast', category: 'Breakfast' },
        {
          day: '2026-09-30',
          meal: 'breakfast',
          id: '52957',
          name: 'Fruit and Cream Cheese Breakfast Pastries',
          category: 'Breakfast',
        },
      ]),
    });
    await page.goto('/meal-plan');
    const cards = panel(page).getByTestId('suggestion-card');
    await expect(cards).toHaveCount(1);
    await expect(cards).toContainText('Smoked Haddock Kedgeree');
  });

  test('after 11:00 prefers a main category not planned this week', async ({ page }) => {
    await page.clock.setFixedTime(AFTERNOON);
    await signInWithMockedSession(page, {
      [WEEK_KEY]: planWith([
        { day: '2026-09-28', meal: 'dinner', id: '52772', name: 'Teriyaki Chicken Casserole', category: 'Chicken' },
      ]),
    });
    const request = page.waitForRequest(
      (req) => req.method() === 'GET' && new URL(req.url()).pathname === '/api/recipes',
    );
    await page.goto('/meal-plan');
    const category = new URL((await request).url()).searchParams.get('category');
    expect(MAIN.filter((c) => c !== 'Chicken')).toContain(category);
    await expect(panel(page).getByTestId('suggestion-card').first()).toContainText('Something different this week');
  });

  test('shows the 503 message with a working Retry', async ({ page }) => {
    await page.clock.setFixedTime(MORNING);
    const down = outage();
    await overrideRecipesApi(
      page,
      (url) => url.pathname === '/api/recipes' && url.searchParams.get('category') === 'Breakfast',
      down.handler,
    );
    await signInWithMockedSession(page);
    await page.goto('/meal-plan');
    await expect(panel(page).getByTestId('error-panel')).toContainText(UNAVAILABLE);
    down.end();
    await panel(page).getByRole('button', { name: 'Retry' }).click();
    await expect(panel(page).getByTestId('suggestion-card')).toHaveCount(4);
  });

  test('adds a suggestion to the plan with its category', async ({ page }) => {
    await page.clock.setFixedTime(MORNING);
    await signInWithMockedSession(page);
    await page.goto('/meal-plan');
    const first = panel(page).getByTestId('suggestion-card').first();
    const name = ((await first.locator('h4').textContent()) ?? '').trim();
    await first.getByRole('button', { name: 'Add to Plan' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Add to Meal Plan');
    await dialog.getByRole('button', { name: 'Add to Plan' }).click();

    await expect(page.getByTestId('planned-meal')).toContainText(name);
    const plan = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? 'null'), WEEK_KEY);
    expect(plan.days['2026-09-27'].breakfast).toMatchObject({ recipeName: name, category: 'Breakfast' });
  });
});
```

- [ ] **Step 3: Run both to verify they fail.**
Run: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && npm run test:unit`
Expected: FAIL. `./SuggestionService` can't be resolved.
Run: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && BROWSER=none npx playwright test tests/suggestions.spec.ts --project=chromium`
Expected: FAIL. There is no `meal-suggestions` or `suggestion-card` test id, and no `/api/recipes` request is made.

- [ ] **Step 4: Implement the service.** Create `src/services/SuggestionService.ts`:

```ts
import recipesApi, { MAX_PAGE_SIZE } from './api/recipesApi';
import type { MealPlan, RecipePage, RecipeQuery, RecipeSummary } from '../types/recipe.types';

// A simple heuristic (no AI): time of day picks the category, the week's plan
// adds variety, and one API call supplies the candidates.
export const BREAKFAST_CATEGORY = 'Breakfast';
export const MAIN_CATEGORIES = ['Chicken', 'Beef', 'Pasta', 'Seafood', 'Vegetarian', 'Lamb', 'Pork'] as const;
export const BREAKFAST_CUTOFF_HOUR = 11;
export const SUGGESTION_COUNT = 4;
export const BREAKFAST_REASON = 'Breakfast idea';
export const VARIETY_REASON = 'Something different this week';

/** Returns a number in [0, 1), like Math.random (injectable for tests). */
export type RandomSource = () => number;

export interface Suggestion {
  recipe: RecipeSummary;
  reason: string;
}

export interface PlannedMeals {
  ids: Set<string>;
  categories: Set<string>;
}

/** Recipe ids and known categories already in the week's plan. */
export function plannedMeals(plan: MealPlan | null): PlannedMeals {
  const ids = new Set<string>();
  const categories = new Set<string>();
  for (const day of Object.values(plan?.days ?? {})) {
    for (const slot of [day.breakfast, day.lunch, day.dinner, day.snacks]) {
      if (!slot) continue;
      ids.add(slot.recipeId);
      if (slot.category) categories.add(slot.category);
    }
  }
  return { ids, categories };
}

const randomIndex = (length: number, random: RandomSource): number =>
  Math.min(Math.floor(random() * length), length - 1);

/**
 * Before 11:00 → Breakfast. Otherwise a main category, preferring ones not yet
 * planned this week.
 */
export function chooseCategory(
  hour: number,
  planned: PlannedMeals,
  random: RandomSource,
): { category: string; reason: string } {
  if (hour < BREAKFAST_CUTOFF_HOUR) {
    return { category: BREAKFAST_CATEGORY, reason: BREAKFAST_REASON };
  }
  const fresh = MAIN_CATEGORIES.filter((c) => !planned.categories.has(c));
  const pool: readonly string[] = fresh.length > 0 ? fresh : MAIN_CATEGORIES;
  const category = pool[randomIndex(pool.length, random)];
  const weekHasMains = MAIN_CATEGORIES.some((c) => planned.categories.has(c));
  const reason = weekHasMains && fresh.length > 0 ? VARIETY_REASON : `${category} idea`;
  return { category, reason };
}

/** Up to `count` distinct items chosen at random. */
export function pickRandom<T>(items: T[], count: number, random: RandomSource): T[] {
  const pool = [...items];
  const picked: T[] = [];
  while (picked.length < count && pool.length > 0) {
    picked.push(pool.splice(randomIndex(pool.length, random), 1)[0]);
  }
  return picked;
}

export class SuggestionService {
  constructor(private readonly search: (query: RecipeQuery) => Promise<RecipePage>) {}

  /** Four suggestions for the week's plan; rejects with RecipeApiError if the API fails. */
  async getSuggestions(
    plan: MealPlan | null,
    now: Date = new Date(),
    random: RandomSource = Math.random,
  ): Promise<Suggestion[]> {
    const planned = plannedMeals(plan);
    const { category, reason } = chooseCategory(now.getHours(), planned, random);
    const page = await this.search({ category, limit: MAX_PAGE_SIZE });
    const candidates = page.recipes.filter((recipe) => !planned.ids.has(recipe.id));
    return pickRandom(candidates, SUGGESTION_COUNT, random).map((recipe) => ({
      recipe: { ...recipe, category: recipe.category ?? category },
      reason,
    }));
  }
}

export default new SuggestionService((query) => recipesApi.searchRecipes(query));
```

Run: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && npm run test:unit`
Expected: PASS, including the 11 tests in `SuggestionService.test.ts`.

- [ ] **Step 5: Implement the UI.** Replace the whole of `src/components/molecules/SuggestionCard.tsx` with:

```tsx
import React from 'react';
import { Info, Plus } from 'lucide-react';
import type { RecipeSummary } from '../../types/recipe.types';
import { Badge } from '../atoms/Badge';
import { previewImage } from '../../services/recipes/recipeUtils';

interface SuggestionCardProps {
  recipe: RecipeSummary;
  reason: string;
  onAddToPlan: () => void;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ recipe, reason, onAddToPlan }) => (
  <div
    data-testid="suggestion-card"
    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
  >
    {/* Image */}
    <div className="relative h-32 overflow-hidden">
      <img src={previewImage(recipe.thumbnail)} alt={recipe.name} loading="lazy" className="w-full h-full object-cover" />
      {recipe.category && (
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" size="sm">
            {recipe.category}
          </Badge>
        </div>
      )}
    </div>

    {/* Content */}
    <div className="p-3">
      <h4 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2">{recipe.name}</h4>

      {/* Reason */}
      <div className="flex items-start gap-2 mb-3 p-2 bg-primary-50 rounded-md">
        <Info className="w-3 h-3 text-primary-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-primary-700">{reason}</p>
      </div>

      {/* Add to plan button */}
      <button
        type="button"
        onClick={onAddToPlan}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary-500 text-white text-sm font-medium rounded-md hover:bg-primary-600 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add to Plan
      </button>
    </div>
  </div>
);
```

Replace the whole of `src/components/organisms/MealSuggestions.tsx` with:

```tsx
import React, { useCallback, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Dropdown } from '../atoms/Dropdown';
import { Modal } from '../atoms/Modal';
import { ErrorPanel } from '../molecules/ErrorPanel';
import { SuggestionCard } from '../molecules/SuggestionCard';
import { useAsync } from '../../hooks/useAsync';
import MealPlanService from '../../services/MealPlanService';
import SuggestionService from '../../services/SuggestionService';
import { previewImage } from '../../services/recipes/recipeUtils';
import type { MealType, RecipeSummary } from '../../types/recipe.types';

interface MealSuggestionsProps {
  userId: string;
  onAddToPlan: (recipe: RecipeSummary, dayDate: string, mealType: MealType) => void;
  /** The seven days of the week being shown, Sunday first */
  weekDays: Date[];
}

const mealTypeOptions: Array<{ value: MealType; label: string }> = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snacks', label: 'Snacks' },
];

export const MealSuggestions: React.FC<MealSuggestionsProps> = ({ userId, onAddToPlan, weekDays }) => {
  const weekKey = format(weekDays[0], 'yyyy-MM-dd');

  // The plan is read when suggestions load, so adding a meal does not
  // reshuffle them; Refresh or another week loads a new set.
  const loadSuggestions = useCallback(
    () =>
      SuggestionService.getSuggestions(userId ? MealPlanService.getMealPlan(userId, parseISO(weekKey)) : null),
    [userId, weekKey],
  );
  const { data, error, loading, retry } = useAsync(loadSuggestions);
  const suggestions = data ?? [];

  const [selectedRecipe, setSelectedRecipe] = useState<RecipeSummary | null>(null);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');

  const handleAddToPlan = (recipe: RecipeSummary) => {
    setSelectedRecipe(recipe);
    setSelectedDay(weekKey);
    setSelectedMealType(recipe.category === 'Breakfast' ? 'breakfast' : 'dinner');
  };

  const closeModal = () => setSelectedRecipe(null);

  const handleConfirmAdd = () => {
    if (!selectedRecipe || !selectedDay) return;
    onAddToPlan(selectedRecipe, selectedDay, selectedMealType);
    setSelectedRecipe(null);
  };

  const dayOptions = weekDays.map((day) => ({
    value: format(day, 'yyyy-MM-dd'),
    label: format(day, 'EEEE, MMM d'),
  }));

  let content: React.ReactNode;
  if (loading) {
    content = (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  } else if (error) {
    content = <ErrorPanel compact message={error.message} onRetry={retry} />;
  } else if (suggestions.length === 0) {
    content = (
      <div className="text-center py-8">
        <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">No suggestions right now</p>
        <p className="text-sm text-gray-500 mt-1">Try refreshing in a moment</p>
      </div>
    );
  } else {
    content = (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {suggestions.map(({ recipe, reason }) => (
          <SuggestionCard
            key={recipe.id}
            recipe={recipe}
            reason={reason}
            onAddToPlan={() => handleAddToPlan(recipe)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6" data-testid="meal-suggestions">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-gray-900">Suggested for You</h3>
        </div>
        <Button variant="outline" size="sm" onClick={retry} disabled={loading} aria-label="Refresh suggestions">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {content}

      {/* Add to plan modal */}
      <Modal isOpen={selectedRecipe !== null} onClose={closeModal} title="Add to Meal Plan" size="sm">
        <div className="space-y-6">
          {selectedRecipe && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <img
                src={previewImage(selectedRecipe.thumbnail)}
                alt={selectedRecipe.name}
                className="w-12 h-12 rounded-md object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{selectedRecipe.name}</p>
                {selectedRecipe.category && <p className="text-sm text-gray-600">{selectedRecipe.category}</p>}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="suggestion-day" className="block text-sm font-medium text-gray-700 mb-2">
                Choose Day
              </label>
              <Dropdown id="suggestion-day" value={selectedDay} onChange={setSelectedDay} options={dayOptions} />
            </div>

            <div>
              <label htmlFor="suggestion-meal-type" className="block text-sm font-medium text-gray-700 mb-2">
                Choose Meal Type
              </label>
              <Dropdown
                id="suggestion-meal-type"
                value={selectedMealType}
                onChange={(value) => setSelectedMealType(value as MealType)}
                options={mealTypeOptions}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={closeModal} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleConfirmAdd} className="flex-1">
              Add to Plan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
```

Delete the old service: `git rm src/services/MockAIService.ts`.

In `tests/epic2-meal-planning.spec.ts`, replace the whole `test.describe('US-2.3: Meal Suggestions', () => { ... });` block (it ends at the `});` just before `test.describe('US-2.4: Copy Day\'s Meals'`) with:

```ts
  test.describe('US-2.3: Meal Suggestions', () => {
    // Morning, so suggestions are the (four or more) Breakfast fixtures
    test.beforeEach(async ({ page }) => {
      await page.clock.setFixedTime(new Date('2026-09-30T08:00:00'));
    });

    test('should display AI suggestions section', async ({ page }) => {
      await mealPlanHelper.navigateToMealPlan();
      await expect(page.locator('text=Suggested for You')).toBeVisible();
    });

    test('should show multiple recipe suggestions', async ({ page }) => {
      await mealPlanHelper.navigateToMealPlan();
      await expect(page.getByTestId('suggestion-card')).toHaveCount(4);
    });

    test('should show "Why this?" reason for suggestions', async ({ page }) => {
      await mealPlanHelper.navigateToMealPlan();
      await expect(page.getByTestId('suggestion-card').first()).toContainText('Breakfast idea', { timeout: 10000 });
    });

    test('should refresh suggestions', async ({ page }) => {
      await mealPlanHelper.navigateToMealPlan();
      await expect(page.getByTestId('suggestion-card').first()).toBeVisible();
      await page.getByRole('button', { name: 'Refresh suggestions' }).click();
      await expect(page.getByTestId('suggestion-card')).toHaveCount(4);
    });

    test('should open day/meal selector when adding suggestion to plan', async ({ page }) => {
      await mealPlanHelper.navigateToMealPlan();
      await page.getByTestId('suggestion-card').first().getByRole('button', { name: 'Add to Plan' }).click();
      await expect(page.getByRole('dialog')).toContainText('Add to Meal Plan');
    });
  });
```

- [ ] **Step 6: Run the specs to verify they pass.**
Run: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && BROWSER=none npx playwright test tests/suggestions.spec.ts tests/meal-plan-recipes.spec.ts --project=chromium`
Expected: `9 passed`.
Then run the **Epic2 regression check**.
Expected: no output.

- [ ] **Step 7: Verify.**
Run: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && npx tsc --noEmit && npm run lint && npm run build && npm run test:unit`
Expected: all pass. `grep -rn "MockAIService" src` prints nothing.

- [ ] **Step 8: Commit.**

```bash
cd D:/ProjectsWS/meal-planner/meal-planner-frontend
git add src/services/SuggestionService.ts src/services/SuggestionService.test.ts src/components/organisms/MealSuggestions.tsx src/components/molecules/SuggestionCard.tsx tests/suggestions.spec.ts tests/epic2-meal-planning.spec.ts
# MockAIService.ts is already staged as deleted by `git rm` in Step 5
git commit -m "feat(suggestions): replace MockAIService with SuggestionService on the recipe API" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014u1dJTmEC1ARhmephG3Zfk"
```

---

### Task 9: Delete the mock catalogue and the synchronous recipe code

**Files:**
- Delete: `src/data/mockRecipes.ts`, `src/utils/recipeThumbnail.ts`, `src/services/RecipeService.ts`, `src/components/molecules/RecipeSearchBar.tsx` (no importers since Task 1; it only called `RecipeService.getSearchSuggestions`), `src/types/legacyRecipe.types.ts`

**Interfaces:**
- Consumes: nothing new. After Tasks 4–8, only the files being deleted import `RecipeService`, `mockRecipes`, `recipeThumbnail` or `legacyRecipe.types`.
- Produces: no mock recipe code remains. The synchronous search, sort and scaling code (`searchRecipes`, `sortRecipes`, `adjustServingSize`, `scaleIngredientAmount`, `getSimilarRecipes` and the rest) goes with `RecipeService.ts`.

- [ ] **Step 1: Show what is left (the red step).**
Run:

```bash
cd D:/ProjectsWS/meal-planner/meal-planner-frontend && grep -rlE "mockRecipes|recipeThumbnail|RecipeService|legacyRecipe|RecipeSearchBar|adjustServingSize|prepTime|cookTime|reviewCount|dietaryTags|NutritionInfo|MealCategory|RecipeFilter" src --include=*.ts --include=*.tsx | grep -v "\.test\.ts$"
```

Expected: exactly these five files, in any order:
- `src/components/molecules/RecipeSearchBar.tsx`
- `src/data/mockRecipes.ts`
- `src/services/RecipeService.ts`
- `src/types/legacyRecipe.types.ts`
- `src/utils/recipeThumbnail.ts`

If any other file is listed, a screen still uses mock code. Stop and report which file; don't delete anything yet.

- [ ] **Step 2: Delete them.**

```bash
cd D:/ProjectsWS/meal-planner/meal-planner-frontend
git rm src/data/mockRecipes.ts src/utils/recipeThumbnail.ts src/services/RecipeService.ts src/components/molecules/RecipeSearchBar.tsx src/types/legacyRecipe.types.ts
```

- [ ] **Step 3: Run the same grep to verify nothing is left.**
Run the Step 1 command again.
Expected: no output. Then run `ls src/data` and expect `No such file or directory`, because git removes the now-empty folder from the working tree.

- [ ] **Step 4: Verify everything.**
Run:

```bash
cd D:/ProjectsWS/meal-planner/meal-planner-frontend && npx tsc --noEmit && npm run lint && npm run build && npm run test:unit
BROWSER=none npx playwright test tests/recipes.spec.ts tests/recipe-detail.spec.ts tests/favorites.spec.ts tests/meal-plan-recipes.spec.ts tests/suggestions.spec.ts --project=chromium
```

Expected:
- tsc, lint and build pass, and the build output is smaller (the mock catalogue is gone).
- The unit tests pass.
- Playwright reports `32 passed`: recipes 10, recipe-detail 7, favorites 6, meal-plan-recipes 4 and suggestions 5.

Then run the **Epic2 regression check**. Expected: no output.

- [ ] **Step 5: Commit.**

```bash
cd D:/ProjectsWS/meal-planner/meal-planner-frontend
git commit -m "refactor(recipes): delete the mock catalogue and the synchronous recipe code" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014u1dJTmEC1ARhmephG3Zfk"
```

---

### Task 10: Copy, documentation, full verification and a check against the real stack

**Files:**
- Modify: `src/components/organisms/OnboardingModal.tsx` (one string), `README.md` (full replacement), `tests/README.md` (structure block), `tests/recipes.spec.ts` (one test added)

**Interfaces:**
- Consumes: everything above.
- Produces: user-facing copy and docs that match the spec's "Copy" section (§4), and a verified branch ready for the controller's final review and PR. **Do not push or open a PR.**

- [ ] **Step 1: Write the failing copy test.** Append this `describe` block to the end of `tests/recipes.spec.ts`, after the existing block's closing `});`:

```ts
test.describe('Onboarding copy', () => {
  test('the Discover Recipes slide describes TheMealDB, not 70 bundled recipes', async ({ page }) => {
    await mockRecipesApi(page);
    await signInWithMockedSession(page);
    await page.goto('/onboarding');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText('Discover Recipes')).toBeVisible();
    await expect(page.getByText(/TheMealDB/)).toBeVisible();
    await expect(page.getByText(/70 recipes/)).toHaveCount(0);
  });
});
```

Run: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && BROWSER=none npx playwright test tests/recipes.spec.ts --project=chromium -g "Onboarding copy"`
Expected: FAIL. `getByText(/TheMealDB/)` is not found, because the slide still says "Browse 70 recipes…".

- [ ] **Step 2: Update the onboarding slide.** In `src/components/organisms/OnboardingModal.tsx`, replace

```ts
    description: 'Browse 70 recipes. Search by name or ingredient, filter by cuisine and dietary needs, and save your favourites.',
```

with

```ts
    description: 'Browse real recipes with photos from TheMealDB. Pick a category, search by name, filter by cuisine or main ingredient, and save your favourites.',
```

Run the Step 1 command again. Expected: `1 passed`.

- [ ] **Step 3: Update the README.** Replace the whole of `README.md` with:

````markdown
# Meal Planner (Frontend)

A React + TypeScript single-page app for planning a week of meals. You can sign up, sign in, browse real recipes from [TheMealDB](https://www.themealdb.com) by category, name, cuisine or main ingredient, save favourites, and lay out breakfast, lunch, dinner and snacks for each day on a weekly calendar. Authentication and recipes come from a Go REST API: the backend fetches TheMealDB and caches it in Postgres. Favourites and meal plans live in `localStorage` for now.

**Backend:** [vivek721/meal-planner-backend](https://github.com/vivek721/meal-planner-backend) is a Go/Gin API with PostgreSQL, JWT auth and the TheMealDB recipe cache.

## Features

### Authentication and onboarding (backed by the Go API)
- **Registration:** optional name, email and password. The form is validated with Zod (8+ characters, one uppercase letter, one number, matching confirmation) and shows a live password-strength meter.
- **Login and logout:** these call `POST /api/auth/login` and `POST /api/auth/logout`. The JWT is stored in `localStorage`, and an Axios interceptor adds it to every request as a `Bearer` token.
- **Session restore:** on page load the app checks the stored token with `GET /api/auth/me`. Any `401` response clears the session and sends the user back to login.
- **Route guards:** protected routes redirect to `/login`. Signed-in users are sent away from the login and register pages. New users are sent to onboarding first.
- **Onboarding tutorial:** five slides with a progress indicator. You can move through them with Next/Back/Skip or with the keyboard (arrow keys, Enter, Escape). Finishing is saved through `POST /api/auth/onboarding/complete`, and the dashboard has a button to replay it.

### Recipes (TheMealDB, through the Go API)
- Recipes and photos come from TheMealDB through the backend's `/api/recipes` endpoints (`src/services/api/recipesApi.ts`). The app never calls TheMealDB's API itself. Lists use TheMealDB's small `/preview` images, and the detail page uses the full photo.
- **Browse (`/recipes`):** opens on a grid of categories with photos. You can search by name and filter by category, cuisine and main ingredient. Results are paged (24 per page), and the filters are kept in the URL, so Back returns to the same results. The page has loading, empty and error states; errors come with a Retry button.
- **Recipe detail (`/recipes/:id`):** the photo, category, cuisine and tags, ingredients with their measures, and step-by-step instructions. It links to "Watch on YouTube" and the original recipe when TheMealDB has them, and shows up to four similar recipes from the same category. There are share (Web Share API, falling back to the clipboard), print and favourite buttons.
- **Favourites (`/favorites`):** saved per user in `localStorage` as TheMealDB ids. You can search by name, filter by category, and sort by recently added or by name.
- Each recipe's details are fetched at most once per browser session (an in-memory cache in `src/services/recipes/recipeData.ts`).

### Weekly meal planning (`/meal-plan`, client-side)
- A Sunday-to-Saturday calendar with four meal slots per day, previous/next/this-week navigation and a highlight on today.
- A modal recipe picker fills a slot: search by name plus category and cuisine filters, served by the API. A slot stores the recipe's id, name, photo and category, so the calendar draws without any API calls. Added meals are saved per user and per week and are still there after a reload. Clicking a planned meal opens its recipe.
- Remove a meal from a slot.
- Copy one day's meals to other days, with an option to fill only empty slots or replace what is there.
- Clear the whole week, chosen days, or particular meal types.
- A **suggestions panel** (`src/services/SuggestionService.ts`) uses a simple heuristic, not an AI model:
  - Before 11:00 it suggests breakfasts. Later it picks one of chicken, beef, pasta, seafood, vegetarian, lamb or pork, preferring a category you haven't planned this week, and skips recipes already in the week.
  - It picks four at random from one API call and gives a short reason for each ("Breakfast idea", "Something different this week").
  - Any suggestion can be added to a day and meal of the week you are viewing.

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | React 18, TypeScript 5 |
| Build / dev server | Vite 5 |
| Styling | Tailwind CSS 3 (custom teal/orange palette, Inter font) |
| Routing | React Router 6 |
| Forms and validation | React Hook Form + Zod |
| HTTP | Axios (shared client with auth and error interceptors) |
| State | React Context (`AuthContext`, `RecipeContext` for favourites, `ToastContext`) |
| Drag and drop | `@dnd-kit/core` |
| Dates | `date-fns` 4 |
| Icons | `lucide-react` |
| Unit tests | Vitest (pure data-layer logic) |
| End-to-end tests | Playwright |
| CI | GitHub Actions (lint, type-check, unit tests, build, Playwright, CodeQL, dependency review) |

## Project structure

```
src/
├── components/
│   ├── atoms/          # Button, Input, Modal, Dropdown, Toast, ...
│   ├── molecules/      # RecipeCard, CategoryGrid, ErrorPanel, Pagination, MealSlot, DayColumn, ...
│   └── organisms/      # LoginForm, RegisterForm, OnboardingModal, MealPlanCalendar,
│                       # RecipeBrowserModal, MealSuggestions, CopyDayModal, ClearPlanModal
├── contexts/           # Auth, Recipe (favourites) and Toast providers (*Context.tsx) and their hooks (use*.ts)
├── hooks/              # useAsync (loading/error/retry, ignores stale responses)
├── pages/              # Login, Register, Onboarding, Dashboard, MealPlan, Recipes,
│                       # RecipeDetail, Favorites
├── services/
│   ├── api/            # apiClient.ts (Axios instance), authApi.ts, recipesApi.ts
│   ├── recipes/        # per-session cache, favourites storage, image/id helpers
│   ├── AuthService.ts  # token/session handling on top of authApi
│   ├── MealPlanService.ts    # weekly plans persisted to localStorage
│   └── SuggestionService.ts  # heuristic meal suggestions
├── types/              # auth and recipe type definitions (recipe types follow the API contract)
└── utils/              # password strength/validation helpers
tests/                  # Playwright specs, page helpers and API fixtures
docs/                   # PRD, design system, API contract and planning notes
```

Components follow an atomic-design layout (atoms, then molecules, then organisms, then pages).

## Getting started

### Prerequisites
- Node.js 18 or later (CI uses 18.x and 20.x) and npm
- A running copy of [meal-planner-backend](https://github.com/vivek721/meal-planner-backend) to register, log in and load recipes. It listens on port `3001` by default and accepts CORS requests from `http://localhost:3000`.

### Install and run

```bash
git clone https://github.com/vivek721/meal-planner-frontend.git
cd meal-planner-frontend
npm install
npm run dev          # http://localhost:3000 (opens the browser automatically)
```

### Pointing the app at the backend

The API base URL comes from `VITE_API_URL` (documented in `.env.example`). The committed `.env` file contains only that variable, set to the backend's default:

```bash
VITE_API_URL=http://localhost:3001
```

If `VITE_API_URL` is unset, the code falls back to that same value. To point at another backend, copy `.env.example` to `.env.local` (git-ignored), set your own `VITE_API_URL` and restart `npm run dev`.

### npm scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server on port 3000 |
| `npm run build` | Type-check with `tsc`, then produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint (flat config with typescript-eslint and the React Hooks rules; zero warnings allowed) |
| `npm run test:unit` | Run the Vitest unit tests (`src/**/*.test.ts`) |
| `npm test` | Run all Playwright tests |
| `npm run test:ui` / `test:headed` / `test:debug` | Run Playwright in UI, headed or debug mode |
| `npm run test:epic1` | Run only the authentication and onboarding spec |
| `npm run test:epic2` | Run only the meal-planning spec |
| `npm run test:report` | Open the last Playwright HTML report |

## Tests

**Unit tests** (Vitest, `npm run test:unit`) cover the pure data layer:
- the recipe API client's parameter cleaning and error mapping;
- the per-session cache;
- favourites storage, including dropping old ids;
- the meal-slot shape;
- the suggestion rules.

**End-to-end tests** (Playwright, `tests/`):

- `recipes.spec.ts`, `recipe-detail.spec.ts`, `favorites.spec.ts`, `meal-plan-recipes.spec.ts` and `suggestions.spec.ts` cover each recipe screen, including loading, empty, error (503 and network), expired-session and old-data cases.
- `epic2-meal-planning.spec.ts` covers the weekly calendar, the recipe picker, suggestions, copy day, clear plan and a full planning flow.
- `epic1-authentication.spec.ts` covers registration, login, onboarding and an end-to-end auth flow.

The recipe and meal-planning specs are hermetic. `tests/helpers/recipes.fixtures.ts` answers every `/api/recipes*` request from fixture data and every TheMealDB image with a placeholder, and `tests/helpers/session.helper.ts` fakes a signed-in session. They need neither the backend nor TheMealDB. Only `epic1-authentication.spec.ts` needs the backend running on port `3001`, because it registers and logs in real users.

`playwright.config.ts` runs the specs in Chromium, Firefox, WebKit, Pixel 5 and iPhone 12 profiles against `http://localhost:3000`, and starts the dev server itself (or reuses one already running there). Install the browsers once with `npx playwright install`.

## Project status and known issues

This is an active work in progress. Known gaps:

- **Fields TheMealDB does not provide are not shown.** These were removed: cooking times, ratings and review counts, servings (and the serving adjuster), dietary labels and the dietary filter, and the time, rating and popularity sorts. The detail page's nutrition panel says "Nutrition information coming soon"; nutrition from USDA data is planned.
- **Data saved before the switch to TheMealDB:**
  - Favourites saved with the old sample-recipe ids are dropped the first time favourites load.
  - Old meal-plan slots still show their saved name and picture, but opening one says "This recipe is no longer available".
- **Recipes need the backend,** and TheMealDB for anything the backend has not cached yet. If TheMealDB is down and nothing is cached, recipe screens say "Recipes are temporarily unavailable, please try again shortly" and offer Retry.
- **Drag and drop is only half built.** The calendar's meal slots are `@dnd-kit` drop targets, but nothing on the page is draggable yet, so meals are added through the recipe picker or the suggestions panel.
- "Remember me" on the login form is not wired up, "Forgot password?" is a placeholder, and the meal-plan **Export** button does nothing.
- Nothing links to `/favorites` yet, so that page is reached by URL.

## Roadmap (not yet built)

- Nutrition facts from USDA FoodData Central
- Save meal plans and favourites to the backend instead of `localStorage`
- Shopping lists generated from the week's plan
- A user preferences and profile page (the backend already has profile, password and preference endpoints)
- Password reset and persistent "remember me" sessions

## Credits

Recipe data and images from [TheMealDB](https://www.themealdb.com). The public API key the backend uses is for development and educational use.
````

- [ ] **Step 4: Update `tests/README.md`.** Replace its `## Test Structure` code block (the fenced block listing `helpers/`, the two specs and `README.md`) with:

````markdown
```
tests/
├── helpers/
│   ├── api.helper.ts           # CORS-aware JSON responses for route interception
│   ├── auth.helper.ts          # Authentication helper methods (real backend)
│   ├── mealplan.helper.ts      # Meal planning helper methods
│   ├── recipes.fixtures.ts     # Fixture recipes; intercepts /api/recipes* and TheMealDB images
│   └── session.helper.ts       # Mocked signed-in session (no backend needed)
├── epic1-authentication.spec.ts # Epic 1: Authentication & Onboarding (needs the backend)
├── epic2-meal-planning.spec.ts  # Epic 2: Meal Planning (hermetic)
├── recipes.spec.ts              # Recipes page (hermetic)
├── recipe-detail.spec.ts        # Recipe detail (hermetic)
├── favorites.spec.ts            # Favourites (hermetic)
├── meal-plan-recipes.spec.ts    # Meal-plan picker and slots (hermetic)
├── suggestions.spec.ts          # Meal suggestions (hermetic)
└── README.md                    # This file
```

Hermetic specs fake the session and answer every `/api/recipes*` request from `helpers/recipes.fixtures.ts`, so they never call the backend or TheMealDB. Use `overrideRecipesApi(page, match, handler)` to change one endpoint in a test, for example `outage()` for a 503 or `route.abort('failed')` for a network error.
````

- [ ] **Step 5: Full verification.**
Run:

```bash
cd D:/ProjectsWS/meal-planner/meal-planner-frontend && npx tsc --noEmit && npm run lint && npm run build && npm run test:unit
BROWSER=none npx playwright test tests/recipes.spec.ts tests/recipe-detail.spec.ts tests/favorites.spec.ts tests/meal-plan-recipes.spec.ts tests/suggestions.spec.ts --project=chromium
grep -rn "70 recipes\|70 bundled\|mockRecipes\|MockAIService" README.md src || echo "no stale references"
```

Expected:
- All four checks pass.
- Playwright reports `33 passed` (Task 9's 32 plus the onboarding copy test).
- The grep prints `no stale references`.

Then run the **Epic2 regression check**. Expected: no output.

- [ ] **Step 6: Check against the real local stack (TheMealDB through the backend).** Memory is tight, so start only what is needed and stop it at the end of this step.

```bash
cd D:/ProjectsWS/meal-planner/meal-planner-backend && git status -sb | head -1   # expect "## main...origin/main"
docker compose up -d --build
until curl -sf localhost:3001/health >/dev/null; do sleep 2; done; echo backend up
```

Start the frontend with `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && npm run dev` as a background task. Then click through in Chrome at `http://localhost:3000` and note each result in your report:
1. Register a new user. The onboarding "Discover Recipes" slide mentions TheMealDB, not 70 recipes. Skip to the dashboard.
2. `/recipes` shows the category grid with real photos. Click **Seafood**: real results, with "N recipes" and paging when there are more than 24 (Dessert has several pages). Search `chicken`, then add the cuisine `Indian`, and results narrow. Clear both, then type the main ingredient `salmon`. In DevTools → Network, list images end in `/preview`.
3. Open `Teriyaki Chicken Casserole` (`/recipes/52772`). It shows the full photo, category, cuisine, tags, ingredients with measures, numbered steps and a working "Watch on YouTube" link. The nutrition panel says "Nutrition information coming soon", and there is no servings or time information. Up to 4 similar Chicken recipes are shown; opening one and pressing Back works.
4. Favourite two recipes. `/favorites` shows them; search by name and filter by category both work. In DevTools → Application → Local Storage, set `user_favorites_<your user id>` to `["recipe-001","52772"]` and reload `/favorites`. One card shows, and the value becomes `["52772"]`.
5. `/meal-plan`: add a recipe to a slot through the picker. The slot shows the photo and name, with no time label. Clicking it opens the recipe. Suggestions show 4 cards with a reason; one can be added through "Add to Plan". Add a slot `{"recipeId":"recipe-001","recipeName":"Classic Avocado Toast","thumbnail":"","prepTime":10,"addedAt":"2026-09-28T08:00:00.000Z"}` to the current week's `mealPlans_…` entry in Local Storage and reload. It renders, and clicking it shows "This recipe is no longer available".
6. The 503 path: `cd D:/ProjectsWS/meal-planner/meal-planner-backend && MEALDB_BASE_URL=http://127.0.0.1:9/api docker compose up -d backend`, then search `/recipes` for a name you have not searched before (e.g. `moussaka`). The error panel says exactly "Recipes are temporarily unavailable, please try again shortly", and Retry keeps failing cleanly. Restore the backend with `cd D:/ProjectsWS/meal-planner/meal-planner-backend && docker compose up -d backend`, and Retry now succeeds.
7. Optional, while the stack is up: `cd D:/ProjectsWS/meal-planner/meal-planner-frontend && BROWSER=none npx playwright test tests/epic1-authentication.spec.ts --project=chromium`. Report the result. This spec is unchanged, and the slide title it checks is unchanged too. Don't fix failures that also happen on `main`.

**Stop everything:** end the background `npm run dev` task, then run `cd D:/ProjectsWS/meal-planner/meal-planner-backend && docker compose down`, and confirm with `docker ps` that no `meal-planner-*` containers are left.

If any check fails, fix it in the owning component, add a test that reproduces it to that task's spec, re-run Step 5, and commit the fix separately before continuing.

- [ ] **Step 7: Commit the copy and docs.**

```bash
cd D:/ProjectsWS/meal-planner/meal-planner-frontend
git add src/components/organisms/OnboardingModal.tsx README.md tests/README.md tests/recipes.spec.ts
git commit -m "docs: describe TheMealDB recipes, removed fields and hermetic tests" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014u1dJTmEC1ARhmephG3Zfk"
git log --oneline main..HEAD
```

Expected: 10 commits on the branch, one per task, plus any fix commits from Step 6. **Stop here.** The controller runs the final review, pushes, and opens the PR.
