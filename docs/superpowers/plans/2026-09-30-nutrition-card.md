# Nutrition Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the recipe page's "Nutrition information coming soon" text with a card that shows the backend's USDA estimate: calories, macros, coverage, an ingredient breakdown, and loading/error/partial/none states.

**Architecture:** `recipesApi.getNutrition` calls `GET /api/recipes/:id/nutrition` and maps errors through the existing `RecipeApiError`, using a nutrition-specific 503 message. `recipeData.getNutrition` caches results for the session, like recipe details. A pure `nutritionView.ts` module turns the API response into display text and is unit-tested with Vitest. `NutritionCard` takes a recipe id, loads with `useAsync` and only renders the view model. The Playwright fixtures answer `/nutrition` so every recipe-page spec stays hermetic.

**Tech Stack:** React 18, TypeScript 5, Tailwind 3, Axios, Vitest 4 (node, pure logic only), Playwright.

**Spec:** `meal-planner-backend/docs/superpowers/specs/2026-09-29-usda-nutrition-design.md` §3 (API contract, including the 2026-09-30 amendment on `grams`/`calories` presence) and §4 (frontend).

## Global Constraints

- The card never computes nutrition; it only formats what the API returns.
- Heading: "Nutrition (estimate) · whole recipe". Attribution: a "Data: USDA FoodData Central" link to https://fdc.nal.usda.gov/.
- An incomplete nutrient reads "at least N unit". With fewer than half the ingredients counted: "Partial estimate: most ingredients could not be measured". With none counted, the card says so instead of showing zeros.
- A nutrition failure never breaks the recipe page; the 503 message is "Nutrition is temporarily unavailable, please try again shortly", shown with Retry.
- Breakdown: a native `<details>` "Ingredient breakdown"; each line shows the matched food and calories, or "not counted" with a plain-English reason.
- Components follow the atomic layout; unit tests stay DOM-free (`vitest.config.ts` runs `src/**/*.test.ts` in node).
- `npm run lint` allows zero warnings; `npm run build` type-checks.

## Review Focus

1. A counted line with `calories: 0` (water) must show "0 kcal", not be treated as missing. → Task 2 test.
2. A counted line with no `calories` key (FDC reported no energy) must not show "0 kcal". → Task 2 test.
3. Recipe pages in existing specs must not receive a 400 for `/nutrition` from the fixtures. → Task 4 fixture change, verified by the full recipe spec run.
4. A 503 on nutrition must leave the rest of the recipe page rendered. → Task 5 Playwright test.
5. Exactly half counted (e.g. 2 of 4) is not "partial"; "partial" means fewer than half. → Task 2 test.

---

### Task 1: Types and API call

**Files:** Modify `src/types/recipe.types.ts`, `src/services/api/recipesApi.ts`, `src/services/recipes/recipeData.ts`; test `src/services/api/recipesApi.test.ts`.

**Produces:** `RecipeNutrition`, `NutritionTotals`, `NutritionIngredient`, `NutrientKey` types; `NUTRITION_UNAVAILABLE_MESSAGE`; `recipesApi.getNutrition(id): Promise<RecipeNutrition>`; `recipeData.getNutrition(id)` (session-cached).

- [ ] Failing Vitest: `getNutrition` requests `/api/recipes/52772/nutrition` and returns the body; a 503 rejects with kind `unavailable` and the nutrition message; a 404 maps to `notFound`.
- [ ] Implement; run `npm run test:unit`; commit.

### Task 2: View model (`src/services/recipes/nutritionView.ts`)

**Produces:** `toNutritionView(n: RecipeNutrition): NutritionView`, where `NutritionView = { calories: string; nutrients: { key, label, value }[]; coverage: string; partial: boolean; none: boolean; lines: { name, measure, counted, detail }[] }`.

- [ ] Failing Vitest cases:
  - calories get a thousands separator ("1,846 kcal")
  - grams have one decimal ("122.2 g") and sodium is an integer in mg ("10,908 mg")
  - an incomplete nutrient reads "at least 55.6 g"
  - coverage reads "Based on 9 of 9 ingredients"
  - partial: 3 of 7 is partial, 2 of 4 is not
  - none: counted 0 is none
  - counted line detail "Water, bottled, generic · 118.5 g · 0 kcal"
  - counted line with no calories key has no kcal part
  - each notCounted reason maps to its plain-English text
- [ ] Implement; run; commit.

### Task 3: NutritionCard component and page wiring

**Files:** Rewrite `src/components/molecules/NutritionCard.tsx`; modify `src/pages/RecipeDetail.tsx` (`<NutritionCard recipeId={recipe.id} />`).

- [ ] Implement the loading skeleton (`data-testid="nutrition-loading"`), error (`ErrorPanel compact` with Retry), none, and ready states from the view model; `data-testid="nutrition-card"`.
- [ ] `npm run lint && npm run build`; commit. (UI behaviour is covered by Task 5's Playwright specs; Tasks 4–5 land before this task's behaviour is asserted.)

### Task 4: Playwright fixtures answer `/nutrition`

**Files:** Modify `tests/helpers/recipes.fixtures.ts`.

- [ ] Add `NUTRITION` fixtures: 52772 (full, 0 kcal water line), 52940 (incomplete sugars), 52874 (partial: 3 of 7), 52795 (none: 0 of 3); other ids answer "none" for their own ingredients. `respond()` routes `/api/recipes/:id/nutrition` before the id parser.
- [ ] Update `recipe-detail.spec.ts`'s "coming soon" assertion to assert the card heading instead; run `npx playwright test recipe-detail --project=chromium`; commit.

### Task 5: Playwright nutrition spec

**Files:** Create `tests/nutrition.spec.ts`.

- [ ] Ready (52772): heading, "1,846 kcal"-style calories, macros, coverage, attribution link; breakdown opens and shows the water line with "0 kcal".
- [ ] Incomplete (52940): "at least" wording. Partial (52874): partial note. None (52795): no zeros, the none message.
- [ ] 503: the card shows the nutrition message and Retry; the recipe heading and ingredients still render; after the outage ends, Retry shows the estimate.
- [ ] Session cache: revisiting a recipe does not refetch `/nutrition`.
- [ ] Run chromium, then the full `npm test` matrix; `npm run lint`, `npm run build`, `npm run test:unit`; commit.
