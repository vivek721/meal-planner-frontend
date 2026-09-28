import { test, expect, type Page } from '@playwright/test';
import { signInWithMockedSession, TEST_USER } from './helpers/session.helper';
import {
  mockRecipesApi,
  outage,
  overrideRecipesApi,
  RECIPES_UNAVAILABLE_MESSAGE,
  type RecipesApiMock,
} from './helpers/recipes.fixtures';

// Wednesday 30 Sept 2026 at noon: the week starts on Sunday 27 Sept, and
// suggestions (not Breakfast after 11:00) never touch the picker's category
const NOW = new Date('2026-09-30T12:00:00');
const WEEK_KEY = `mealPlans_${TEST_USER.id}_2026-09-27`;

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

  test('keyboard-selects a recipe in the picker: Tab to the name, Enter shows the footer', async ({ page }) => {
    await signInWithMockedSession(page);
    await page.goto('/meal-plan');
    await openPicker(page);
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByTestId('recipe-card')).toHaveCount(5);

    // Before a selection, the footer "Add to <meal type>" button is not rendered at all
    // (every recipe card also has an "Add to favorites" button, so exclude that).
    await expect(dialog.getByRole('button', { name: /^Add to (?!favorites)/i })).toHaveCount(0);

    const firstName = dialog.getByTestId('recipe-card').first().getByTestId('recipe-card-name');
    await firstName.focus();
    await expect(firstName).toBeFocused();
    await page.keyboard.press('Enter');

    const addButton = dialog.getByRole('button', { name: 'Add to breakfast' });
    await expect(addButton).toBeVisible();
    await expect(addButton).toBeEnabled();
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
    await expect(dialog.getByTestId('error-panel')).toContainText(RECIPES_UNAVAILABLE_MESSAGE);
    down.end();
    await dialog.getByRole('button', { name: 'Retry' }).click();
    await expect(dialog.getByTestId('recipe-card')).toHaveCount(5);
  });
});
