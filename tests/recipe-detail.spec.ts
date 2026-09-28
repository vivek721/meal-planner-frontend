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
