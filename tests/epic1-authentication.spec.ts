import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth.helper';

test.describe('Epic 1: Authentication & Onboarding', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.clearAuthStorage();
  });

  test.describe('US-1.1: User Registration', () => {
    test('should register a new user with valid credentials', async ({ page }) => {
      const testEmail = `test-${Date.now()}@example.com`;

      await authHelper.register(testEmail, 'Test123!@#', 'Test User');

      // Should redirect to onboarding
      await expect(page).toHaveURL(/\/onboarding/);
      await expect(page.locator('text=Welcome')).toBeVisible({ timeout: 5000 });
    });

    test('should show password strength indicator', async ({ page }) => {
      await page.goto('/register');

      const passwordInput = page.locator('input[name="password"]');
      await passwordInput.fill('weak');

      // Should show weak indicator
      await expect(page.locator('text=Weak')).toBeVisible();

      await passwordInput.fill('Test123!@#');

      // Should show strong indicator
      await expect(page.locator('text=Strong')).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('/register');

      await page.fill('input[name="email"]', 'invalid-email');
      await page.fill('input[name="password"]', 'Test123!@#');
      await page.fill('input[name="confirmPassword"]', 'Test123!@#');
      await page.click('button[type="submit"]');

      // Should show validation error
      await expect(page.locator('text=Invalid email')).toBeVisible();
    });

    test('should validate password confirmation match', async ({ page }) => {
      await page.goto('/register');

      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'Test123!@#');
      await page.fill('input[name="confirmPassword"]', 'DifferentPassword');
      await page.click('button[type="submit"]');

      // Should show validation error
      await expect(page.locator('text=Passwords don\'t match')).toBeVisible();
    });

    test('should show error for existing email', async ({ page }) => {
      const testEmail = `existing-${Date.now()}@example.com`;

      // Register first time
      await authHelper.register(testEmail, 'Test123!@#', 'Test User');
      await authHelper.skipOnboarding();
      await authHelper.logout();

      // Try to register again with same email
      await page.goto('/register');
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', 'Test123!@#');
      await page.fill('input[name="confirmPassword"]', 'Test123!@#');
      await page.click('button[type="submit"]');

      // Should show error
      await expect(page.locator('text=Email already exists')).toBeVisible();
    });
  });

  test.describe('US-1.2: User Login', () => {
    const testEmail = 'login-test@example.com';
    const testPassword = 'Test123!@#';

    test.beforeEach(async ({ page }) => {
      // Create a test user
      await authHelper.register(testEmail, testPassword, 'Login Test');
      await authHelper.skipOnboarding();
      await authHelper.logout();
    });

    test('should login with valid credentials', async ({ page }) => {
      await authHelper.login(testEmail, testPassword);

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.locator('text=Welcome')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');

      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', 'WrongPassword');
      await page.click('button[type="submit"]');

      // Should show error
      await expect(page.locator('text=Invalid email or password')).toBeVisible();
    });

    test('should remember user when "Remember me" is checked', async ({ page, context }) => {
      await authHelper.login(testEmail, testPassword, true);

      // Get cookies
      const cookies = await context.cookies();
      const authCookie = cookies.find(c => c.name === 'authToken' || c.name.includes('auth'));

      // Cookie should exist (or localStorage should persist)
      const authToken = await page.evaluate(() => localStorage.getItem('authToken'));
      expect(authToken).toBeTruthy();
    });

    test('should lock account after 3 failed login attempts', async ({ page }) => {
      await page.goto('/login');

      // Try 3 times with wrong password
      for (let i = 0; i < 3; i++) {
        await page.fill('input[name="email"]', testEmail);
        await page.fill('input[name="password"]', 'WrongPassword');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(500);
      }

      // Should show lock message
      await expect(page.locator('text=Account locked').or(page.locator('text=too many attempts'))).toBeVisible();
    });

    test('should maintain session across page refreshes', async ({ page }) => {
      await authHelper.login(testEmail, testPassword);

      // Verify dashboard loaded
      await expect(page).toHaveURL(/\/dashboard/);

      // Refresh page
      await page.reload();

      // Should still be on dashboard (not redirected to login)
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.locator('text=Welcome')).toBeVisible();
    });
  });

  test.describe('US-1.3: Onboarding Tutorial', () => {
    test('should display all 5 onboarding screens', async ({ page }) => {
      const testEmail = `onboarding-${Date.now()}@example.com`;
      await authHelper.register(testEmail, 'Test123!@#', 'Onboarding Test');

      // Should show first screen
      await expect(page.locator('text=Welcome')).toBeVisible();

      // Navigate through screens
      await page.click('button:has-text("Next")');
      await expect(page.locator('text=Plan your meals').or(page.locator('text=Plan Your Meals'))).toBeVisible();

      await page.click('button:has-text("Next")');
      await expect(page.locator('text=Discover recipes').or(page.locator('text=Discover Recipes'))).toBeVisible();

      await page.click('button:has-text("Next")');
      await expect(page.locator('text=Generate shopping lists').or(page.locator('text=Shopping'))).toBeVisible();

      await page.click('button:has-text("Next")');
      await expect(page.locator('text=AI suggestions').or(page.locator('text=Get AI'))).toBeVisible();
    });

    test('should navigate back through screens', async ({ page }) => {
      const testEmail = `onboarding-back-${Date.now()}@example.com`;
      await authHelper.register(testEmail, 'Test123!@#', 'Back Test');

      // Go to second screen
      await page.click('button:has-text("Next")');

      // Go back
      await page.click('button:has-text("Back")');

      // Should be on first screen again
      await expect(page.locator('text=Welcome')).toBeVisible();
    });

    test('should skip onboarding', async ({ page }) => {
      const testEmail = `onboarding-skip-${Date.now()}@example.com`;
      await authHelper.register(testEmail, 'Test123!@#', 'Skip Test');

      // Click skip
      await page.click('button:has-text("Skip")');

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should complete onboarding and redirect to dashboard', async ({ page }) => {
      const testEmail = `onboarding-complete-${Date.now()}@example.com`;
      await authHelper.register(testEmail, 'Test123!@#', 'Complete Test');

      await authHelper.completeOnboarding();

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.locator('text=Welcome')).toBeVisible();
    });

    test('should show progress indicator', async ({ page }) => {
      const testEmail = `onboarding-progress-${Date.now()}@example.com`;
      await authHelper.register(testEmail, 'Test123!@#', 'Progress Test');

      // Progress indicator should be visible
      await expect(page.locator('[class*="progress"]').or(page.locator('[role="progressbar"]'))).toBeVisible();
    });

    test('should support keyboard navigation', async ({ page }) => {
      const testEmail = `onboarding-keyboard-${Date.now()}@example.com`;
      await authHelper.register(testEmail, 'Test123!@#', 'Keyboard Test');

      // Press Escape to skip
      await page.keyboard.press('Escape');

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    });
  });

  test.describe('Integration: Full Authentication Flow', () => {
    test('should complete full registration, onboarding, logout, and login flow', async ({ page }) => {
      const testEmail = `full-flow-${Date.now()}@example.com`;
      const testPassword = 'Test123!@#';

      // Step 1: Register
      await authHelper.register(testEmail, testPassword, 'Full Flow Test');

      // Step 2: Complete onboarding
      await authHelper.completeOnboarding();

      // Step 3: Verify dashboard
      await expect(page).toHaveURL(/\/dashboard/);

      // Step 4: Logout
      await authHelper.logout();

      // Step 5: Login again
      await authHelper.login(testEmail, testPassword);

      // Step 6: Verify dashboard (no onboarding this time)
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.locator('text=Welcome')).toBeVisible();
    });
  });
});
