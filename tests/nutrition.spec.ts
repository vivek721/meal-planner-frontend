import { test, expect } from '@playwright/test';
import { signInWithMockedSession } from './helpers/session.helper';
import {
  mockRecipesApi,
  NUTRITION_UNAVAILABLE_MESSAGE,
  outage,
  overrideRecipesApi,
  type RecipesApiMock,
} from './helpers/recipes.fixtures';

const HEADING = 'Nutrition (estimate) · whole recipe';

test.describe('Nutrition card (USDA estimate via /api/recipes/:id/nutrition)', () => {
  let api: RecipesApiMock;

  test.beforeEach(async ({ page }) => {
    api = await mockRecipesApi(page);
    await signInWithMockedSession(page);
  });

  test('shows calories, nutrients, coverage and the USDA credit', async ({ page }) => {
    await page.goto('/recipes/52772');
    const card = page.getByTestId('nutrition-card');
    await expect(card.getByRole('heading', { name: HEADING })).toBeVisible();
    await expect(card.getByTestId('nutrition-calories')).toHaveText('731 kcal');
    await expect(card.getByTestId('nutrient')).toHaveText([
      'Protein94.9 g',
      'Carbs72.6 g',
      'Fat10.4 g',
      'Fibre1.5 g',
      'Sugars54.2 g',
      'Sodium10,908 mg',
    ]);
    await expect(card.getByTestId('nutrition-coverage')).toHaveText('Based on 4 of 4 ingredients');
    await expect(card.getByTestId('nutrition-partial')).toHaveCount(0);
    await expect(card.getByRole('link', { name: 'Data: USDA FoodData Central' })).toHaveAttribute(
      'href',
      'https://fdc.nal.usda.gov/',
    );
  });

  test('the ingredient breakdown opens and shows each matched food, with 0 kcal kept', async ({ page }) => {
    await page.goto('/recipes/52772');
    const breakdown = page.getByTestId('nutrition-breakdown');
    const lines = breakdown.getByTestId('nutrition-line');
    await expect(lines.first()).toBeHidden();
    await breakdown.getByText('Ingredient breakdown').click();
    await expect(lines).toHaveCount(4);
    await expect(lines.nth(1)).toContainText('water (1/2 cup)');
    await expect(lines.nth(1)).toContainText('Water, bottled, generic · 118.5 g · 0 kcal');
  });

  test('marks an incomplete nutrient as a lower bound', async ({ page }) => {
    await page.goto('/recipes/52940');
    const card = page.getByTestId('nutrition-card');
    await expect(card.getByTestId('nutrient').filter({ hasText: 'Sugars' })).toContainText('at least 39.7 g');
    await expect(card.getByTestId('nutrition-calories')).toHaveText('4,700 kcal');
  });

  test('warns when most ingredients could not be measured, and says why per line', async ({ page }) => {
    await page.goto('/recipes/52874');
    const card = page.getByTestId('nutrition-card');
    await expect(card.getByTestId('nutrition-coverage')).toHaveText('Based on 3 of 7 ingredients');
    await expect(card.getByTestId('nutrition-partial')).toHaveText(
      'Partial estimate: most ingredients could not be measured',
    );
    await card.getByText('Ingredient breakdown').click();
    const lines = card.getByTestId('nutrition-line');
    await expect(lines.filter({ hasText: 'Thyme' })).toContainText('Not counted: USDA data has no weight for this measure');
    await expect(lines.filter({ hasText: /^Salt/ })).toContainText('Not counted: the amount can’t be measured');
    await expect(lines.filter({ hasText: 'Unicorn Dust' })).toContainText('Not counted: no matching food in USDA data');
  });

  test('says so instead of showing zeros when nothing was counted', async ({ page }) => {
    await page.goto('/recipes/52795');
    const card = page.getByTestId('nutrition-card');
    await expect(card.getByTestId('nutrition-none')).toBeVisible();
    await expect(card.getByTestId('nutrition-calories')).toHaveCount(0);
    await expect(card.getByTestId('nutrient')).toHaveCount(0);
  });

  test('a nutrition outage shows Retry in the card while the recipe still renders', async ({ page }) => {
    const down = outage();
    await overrideRecipesApi(page, (url) => url.pathname === '/api/recipes/52772/nutrition', down.handler);
    await page.goto('/recipes/52772');

    const card = page.getByTestId('nutrition-card');
    await expect(card.getByTestId('error-panel')).toContainText(NUTRITION_UNAVAILABLE_MESSAGE);
    await expect(page.getByRole('heading', { level: 1, name: 'Teriyaki Chicken Casserole' })).toBeVisible();
    await expect(page.getByTestId('ingredient')).toHaveCount(4);

    down.end();
    await card.getByRole('button', { name: 'Retry' }).click();
    await expect(card.getByTestId('nutrition-calories')).toHaveText('731 kcal');
  });

  test('fetches each recipe’s nutrition at most once per session', async ({ page }) => {
    const calories = page.getByTestId('nutrition-calories');
    await page.goto('/recipes?category=Chicken');
    await page.getByTestId('recipe-card').filter({ hasText: 'Teriyaki' }).click();
    await expect(calories).toHaveText('731 kcal');
    await page.goBack();
    await page.getByTestId('recipe-card').filter({ hasText: 'Teriyaki' }).click();
    await expect(calories).toHaveText('731 kcal');
    expect(api.requests.filter((r) => r === '/api/recipes/52772/nutrition')).toHaveLength(1);
  });
});
