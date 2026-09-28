import { test, expect, type Page } from '@playwright/test';
import { signInWithMockedSession, TEST_USER } from './helpers/session.helper';
import {
  mockRecipesApi,
  outage,
  overrideRecipesApi,
  RECIPES_UNAVAILABLE_MESSAGE,
  type RecipesApiMock,
} from './helpers/recipes.fixtures';

const MORNING = new Date('2026-09-30T08:00:00');
const AFTERNOON = new Date('2026-09-30T14:00:00');
const WEEK_KEY = `mealPlans_${TEST_USER.id}_2026-09-27`;
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
    await expect(panel(page).getByTestId('error-panel')).toContainText(RECIPES_UNAVAILABLE_MESSAGE);
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
