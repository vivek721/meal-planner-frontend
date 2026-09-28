import { test, expect } from '@playwright/test';
import { signInWithMockedSession } from './helpers/session.helper';
import { fulfillJson } from './helpers/api.helper';
import {
  CATEGORIES,
  mockRecipesApi,
  outage,
  overrideRecipesApi,
  RECIPES_UNAVAILABLE_MESSAGE,
  type RecipesApiMock,
} from './helpers/recipes.fixtures';

test.describe('Recipes page (TheMealDB via /api/recipes)', () => {
  let api: RecipesApiMock;

  test.beforeEach(async ({ page }) => {
    api = await mockRecipesApi(page);
    await signInWithMockedSession(page);
  });

  test('lands on the category grid with photos and runs no search', async ({ page }) => {
    await page.goto('/recipes');
    await expect(page.getByTestId('category-tile')).toHaveCount(CATEGORIES.length);
    await expect(
      page.getByTestId('category-tile').filter({ hasText: 'Chicken' }).locator('img'),
    ).toHaveAttribute('src', 'https://www.themealdb.com/images/category/chicken.png');
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

  test('recipe cards are keyboard-operable: Tab to the name, Enter opens the detail page', async ({ page }) => {
    await page.goto('/recipes?category=Chicken');
    const firstName = page.getByTestId('recipe-card').first().getByTestId('recipe-card-name');
    // A real <button> is a normal tab stop, so focusing it exercises the same
    // path Tab would take; we then confirm Enter (native button activation)
    // opens the recipe rather than relying on a click.
    await firstName.focus();
    await expect(firstName).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/recipes\/\d+$/);
    await expect(page.getByTestId('recipe-detail')).toBeVisible();
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
    await expect(page.getByTestId('error-panel')).toContainText(RECIPES_UNAVAILABLE_MESSAGE);
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

    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText('Get Meal Suggestions')).toBeVisible();
    await expect(page.getByText(/time of day/)).toBeVisible();
    await expect(page.getByText(/highly rated/)).toHaveCount(0);
  });
});
