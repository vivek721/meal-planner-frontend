import { Page } from '@playwright/test';

export class MealPlanHelper {
  constructor(private page: Page) {}

  async navigateToMealPlan() {
    await this.page.goto('/meal-plan');
    await this.page.waitForLoadState('networkidle');
  }

  async removeMealFromSlot(dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks') {
    const dayColumns = await this.page.locator('[class*="Day"]').all();
    const dayColumn = dayColumns[dayIndex];

    // Hover over the meal slot to reveal remove button
    const mealSlot = dayColumn.locator(`text=${mealType}`).locator('..').locator('[class*="group"]');
    await mealSlot.hover();

    // Click remove button
    await mealSlot.locator('button[aria-label="Remove meal"]').click();
  }

  async copyDay(sourceDayIndex: number, targetDayIndices: number[], replaceExisting: boolean = false) {
    // Click copy button on source day
    const dayColumns = await this.page.locator('[class*="Day"]').all();
    const sourceDayColumn = dayColumns[sourceDayIndex];

    await sourceDayColumn.locator('button[title="Copy day"]').click();

    // Wait for copy modal
    await this.page.waitForSelector('text=Copy Day', { timeout: 5000 });

    // Select target days
    for (const targetIndex of targetDayIndices) {
      const checkboxes = await this.page.locator('input[type="checkbox"]').all();
      await checkboxes[targetIndex].check();
    }

    // Set replace option
    if (replaceExisting) {
      const replaceCheckbox = await this.page.locator('text=Replace existing meals').locator('..').locator('input[type="checkbox"]');
      await replaceCheckbox.check();
    }

    // Click copy button
    await this.page.click('button:has-text("Copy to")');

    // Wait for modal to close
    await this.page.waitForSelector('text=Copy Day', { state: 'hidden', timeout: 5000 });
  }

  async clearPlan(options: {
    clearAll?: boolean;
    specificDays?: number[];
    mealTypes?: string[];
  } = { clearAll: true }) {
    // Click clear plan button
    await this.page.click('button:has-text("Clear Plan")');

    // Wait for clear modal
    await this.page.waitForSelector('text=Clear Meal Plan', { timeout: 5000 });

    if (!options.clearAll && options.specificDays) {
      // Select "Clear specific days" radio
      await this.page.click('input[value="specific"]');

      // Select specific days
      for (const dayIndex of options.specificDays) {
        const checkboxes = await this.page.locator('input[type="checkbox"]').all();
        await checkboxes[dayIndex].check();
      }
    }

    if (options.mealTypes && options.mealTypes.length > 0) {
      // Select meal types
      for (const mealType of options.mealTypes) {
        await this.page.check(`text=${mealType}`);
      }
    }

    // Click clear button
    await this.page.click('button:has-text("Clear")');

    // Confirm if needed
    const confirmButton = this.page.locator('button:has-text("Confirm")');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    // Wait for modal to close
    await this.page.waitForSelector('text=Clear Meal Plan', { state: 'hidden', timeout: 5000 });
  }

  async navigateToNextWeek() {
    await this.page.click('button[aria-label="Next week"]');
    await this.page.waitForTimeout(300);
  }

  async navigateToPreviousWeek() {
    await this.page.click('button[aria-label="Previous week"]');
    await this.page.waitForTimeout(300);
  }

  async navigateToThisWeek() {
    await this.page.getByRole('button', { name: 'This week' }).click();
    await this.page.waitForTimeout(300);
  }

  async searchRecipes(query: string) {
    await this.page.fill('input[placeholder*="Search"]', query);
    await this.page.waitForTimeout(500);
  }

  async filterRecipesByCategory(category: string) {
    await this.page.selectOption('select:near(text="Category")', category);
    await this.page.waitForTimeout(500);
  }

  async verifyMealSlotHasRecipe(dayIndex: number, mealType: string): Promise<boolean> {
    const dayColumns = await this.page.locator('[class*="Day"]').all();
    const dayColumn = dayColumns[dayIndex];

    const mealSlot = dayColumn.locator(`text=${mealType}`).locator('..').locator('[class*="group"]');
    const hasImage = await mealSlot.locator('img').count() > 0;

    return hasImage;
  }

  async getMealCount(): Promise<number> {
    const mealSlots = await this.page.locator('img[alt]:not([alt=""])').count();
    return mealSlots;
  }
}
