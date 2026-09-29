import { test, expect, type Page } from '@playwright/test';
import { signInWithMockedSession, TEST_USER } from './helpers/session.helper';
import {
  mockRecipesApi,
  outage,
  overrideRecipesApi,
  RECIPES_UNAVAILABLE_MESSAGE,
  type RecipesApiMock,
} from './helpers/recipes.fixtures';

const FAVORITES_KEY = `user_favorites_${TEST_USER.id}`;

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

  test('removing a favourite keeps the other cards on screen (no loading flash)', async ({ page }) => {
    await signInWithMockedSession(page, favoritesStorage(['52772', '52874', '52795']));
    await page.goto('/favorites');
    const cards = page.getByTestId('recipe-card');
    await expect(cards).toHaveCount(3);

    // Record any loading skeleton that appears, however briefly
    await page.evaluate(() => {
      const w = window as unknown as { sawSkeleton: boolean };
      w.sawSkeleton = false;
      new MutationObserver(() => {
        if (document.querySelector('[data-testid="favorites-skeleton"]')) w.sawSkeleton = true;
      }).observe(document.body, { childList: true, subtree: true });
    });
    await cards
      .filter({ hasText: 'Chicken Handi' })
      .getByRole('button', { name: 'Remove from favorites' })
      .click();

    await expect(cards).toHaveCount(2);
    await expect(cards.filter({ hasText: 'Chicken Handi' })).toHaveCount(0);
    expect(await page.evaluate(() => (window as unknown as { sawSkeleton: boolean }).sawSkeleton)).toBe(false);
    await expect(page.getByText('Your collection of saved recipes - 2 recipes')).toBeVisible();
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
    await expect(page.getByTestId('error-panel')).toContainText(RECIPES_UNAVAILABLE_MESSAGE);
    down.end();
    await page.getByRole('button', { name: 'Retry' }).click();
    await expect(page.getByTestId('recipe-card')).toHaveCount(1);
  });

  test('shows the empty state for corrupt storage and cleans it up', async ({ page }) => {
    await signInWithMockedSession(page, favoritesStorage('{not json'));
    await page.goto('/favorites');
    await expect(page.getByText('No favorites yet')).toBeVisible();
    await expect.poll(() => storedFavorites(page)).toBe('[]');
  });
});
