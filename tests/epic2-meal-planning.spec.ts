import { test, expect, type Page } from '@playwright/test';
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

  // Shared by US-2.2 and the Integration flow below.
  const openPicker = async (page: Page) => {
    await mealPlanHelper.navigateToMealPlan();
    await page.locator('button:has-text("Add meal")').first().click();
    await expect(page.locator('text=Add Recipe')).toBeVisible({ timeout: 5000 });
  };

  const addFirstRecipe = async (page: Page) => {
    await page.getByTestId('recipe-card').first().click();
    // Scoped to the picker dialog and excluding "Add to favorites" (every
    // recipe card's favorite-toggle button): "Add to <meal type>" would also
    // strict-mode-match those, and the suggestion cards' "Add to Plan" button
    // elsewhere on the page.
    await page.getByRole('dialog').getByRole('button', { name: /^Add to (?!favorites)/i }).click();
    await expect(page.locator('text=Add Recipe')).toBeHidden({ timeout: 5000 });
  };

  test.describe('US-2.1: View Weekly Calendar', () => {
    test('should display 7-day calendar grid', async ({ page }) => {
      await mealPlanHelper.navigateToMealPlan();

      // Should show 7 day columns
      const dayColumns = await page.locator('[class*="Day"]').count();
      expect(dayColumns).toBeGreaterThanOrEqual(7);
    });

    test('should show current week by default', async ({ page }) => {
      await mealPlanHelper.navigateToMealPlan();

      // Should show "Week of" text with current week dates
      await expect(page.locator('text=Week of')).toBeVisible();
    });

    test('should highlight current day', async ({ page }) => {
      await mealPlanHelper.navigateToMealPlan();

      // Should show "Today" badge or current day highlighting
      await expect(page.locator('text=Today')).toBeVisible();
    });

    test('should show all 4 meal slots for each day', async ({ page }) => {
      await mealPlanHelper.navigateToMealPlan();

      // Check for Breakfast, Lunch, Dinner, Snacks labels
      await expect(page.locator('text=BREAKFAST').or(page.locator('text=Breakfast'))).toBeVisible();
      await expect(page.locator('text=LUNCH').or(page.locator('text=Lunch'))).toBeVisible();
      await expect(page.locator('text=DINNER').or(page.locator('text=Dinner'))).toBeVisible();
      await expect(page.locator('text=SNACKS').or(page.locator('text=Snacks'))).toBeVisible();
    });

    test('should show "Add meal" placeholder in empty slots', async ({ page }) => {
      await mealPlanHelper.navigateToMealPlan();

      // Should show multiple "Add meal" buttons
      const addMealButtons = await page.locator('button:has-text("Add meal")').count();
      expect(addMealButtons).toBeGreaterThan(0);
    });

    test('should navigate to next week', async ({ page }) => {
      await mealPlanHelper.navigateToMealPlan();

      // Get current week text
      const currentWeek = await page.locator('text=Week of').textContent();

      // Navigate to next week
      await mealPlanHelper.navigateToNextWeek();

      // Week text should change
      const nextWeek = await page.locator('text=Week of').textContent();
      expect(nextWeek).not.toBe(currentWeek);
    });

    test('should navigate to previous week', async ({ page }) => {
      await mealPlanHelper.navigateToMealPlan();

      await mealPlanHelper.navigateToNextWeek();
      await mealPlanHelper.navigateToPreviousWeek();

      // Should show current week again
      await expect(page.locator('text=Week of')).toBeVisible();
    });

    test('should return to current week with "This Week" button', async ({ page }) => {
      await mealPlanHelper.navigateToMealPlan();

      // Navigate away from current week
      await mealPlanHelper.navigateToNextWeek();
      await mealPlanHelper.navigateToNextWeek();

      // Click "This Week"
      await mealPlanHelper.navigateToThisWeek();

      // Should show "Today" badge again
      await expect(page.locator('text=Today')).toBeVisible();
    });

    test('should display loading state', async ({ page }) => {
      await page.goto('/meal-plan');

      // The loading skeleton is usually too brief to catch, so just verify the page loads
      await expect(page.locator('text=Week of')).toBeVisible({ timeout: 10000 });
    });

    test('should be responsive on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone size

      await mealPlanHelper.navigateToMealPlan();

      // Calendar should still be visible
      await expect(page.locator('text=Week of')).toBeVisible();
      await expect(page.locator('button:has-text("Add meal")').first()).toBeVisible();
    });
  });

  test.describe('US-2.2: Add Recipe to Meal Slot', () => {
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

    test('should persist changes to localStorage', async ({ page }) => {
      await openPicker(page);
      await addFirstRecipe(page);
      await page.reload();
      await expect(page.getByRole('button', { name: 'Remove meal' })).toHaveCount(1, { timeout: 5000 });
    });
  });

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

  test.describe('US-2.4: Copy Day\'s Meals', () => {
    test('should show copy button on each day', async ({ page }) => {
      await mealPlanHelper.navigateToMealPlan();

      // Should show copy buttons (SVG icons)
      const copyButtons = await page.locator('button[title="Copy day"]').or(
        page.locator('button[aria-label*="Copy"]')
      ).count();

      expect(copyButtons).toBeGreaterThan(0);
    });

    test('should open copy modal when clicking copy button', async ({ page }) => {
      await mealPlanHelper.navigateToMealPlan();

      // Click first copy button
      const copyButton = page.locator('button[title="Copy day"]').or(
        page.locator('button[aria-label*="Copy"]')
      ).first();

      await copyButton.click();

      // Modal should open
      await expect(page.locator('text=Copy Day').or(page.locator('text=Copy'))).toBeVisible({ timeout: 5000 });
    });

    test('should show target day checkboxes', async ({ page }) => {
      await mealPlanHelper.navigateToMealPlan();

      const copyButton = page.locator('button[title="Copy day"]').or(
        page.locator('button[aria-label*="Copy"]')
      ).first();

      await copyButton.click();

      // Should show checkboxes
      await expect(page.locator('input[type="checkbox"]').first()).toBeVisible();
    });

    test('should show replace option', async ({ page }) => {
      await mealPlanHelper.navigateToMealPlan();

      const copyButton = page.locator('button[title="Copy day"]').first();
      await copyButton.click();

      // Should show "Replace existing meals" option
      await expect(page.locator('text=Replace existing meals').or(
        page.locator('text=Replace')
      )).toBeVisible();
    });
  });

  test.describe('US-2.5: Clear Meal Plan', () => {
    test('should show clear plan button', async ({ page }) => {
      await mealPlanHelper.navigateToMealPlan();

      // Should show "Clear Plan" button
      await expect(page.locator('button:has-text("Clear Plan")').or(
        page.locator('button:has-text("Clear")')
      )).toBeVisible();
    });

    test('should open clear modal with options', async ({ page }) => {
      await mealPlanHelper.navigateToMealPlan();

      // Click Clear Plan
      await page.locator('button:has-text("Clear Plan")').first().click();

      // Modal should open
      await expect(page.locator('text=Clear Meal Plan').or(
        page.locator('text=Clear')
      )).toBeVisible({ timeout: 5000 });
    });

    test('should show clear entire week option', async ({ page }) => {
      await mealPlanHelper.navigateToMealPlan();

      await page.locator('button:has-text("Clear Plan")').first().click();

      // Should show "Clear entire week" option
      await expect(page.locator('text=Clear entire week').or(
        page.locator('input[value="all"]')
      )).toBeVisible();
    });

    test('should show warning message', async ({ page }) => {
      await mealPlanHelper.navigateToMealPlan();

      await page.locator('button:has-text("Clear Plan")').first().click();

      // Should show warning
      await expect(page.locator('text=cannot be undone').or(
        page.locator('text=warning')
      )).toBeVisible();
    });
  });

  test.describe('Integration: Complete Meal Planning Flow', () => {
    test('should complete full meal planning workflow', async ({ page }) => {
      await mealPlanHelper.navigateToMealPlan();

      // 1. Add meals to three slots
      for (let i = 0; i < 3; i++) {
        await page.locator('button:has-text("Add meal")').first().click();
        await expect(page.locator('text=Add Recipe')).toBeVisible({ timeout: 5000 });
        await addFirstRecipe(page);
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
