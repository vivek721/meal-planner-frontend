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
      await expect(page.getByText('Weak', { exact: true })).toBeVisible();

      // Meets every rule but is under 12 characters (see calculatePasswordStrength)
      await passwordInput.fill('Test123!@#');
      await expect(page.getByText('Medium', { exact: true })).toBeVisible();

      // 12+ characters with upper, lower, digit and symbol
      await passwordInput.fill('Test123!@#abc');
      await expect(page.getByText('Strong', { exact: true })).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('/register');

      await page.fill('input[name="email"]', 'invalid-email');
      await page.fill('input[name="password"]', 'Test123!@#');
      await page.fill('input[name="confirmPassword"]', 'Test123!@#');
      await page.click('button[type="submit"]');

      // Should show the form's validation error (message from the Zod schema in RegisterForm)
      await expect(page.getByText('Please enter a valid email address')).toBeVisible();
      await expect(page).toHaveURL(/\/register/);
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
    // Unique per test (not just per file) so re-running this file against the same
    // (unreset) database never collides with a previous test's or run's registration.
    let testEmail: string;
    const testPassword = 'Test123!@#';

    test.beforeEach(async () => {
      testEmail = `login-test-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
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

    test('should remember user when "Remember me" is checked', async ({ page }) => {
      await authHelper.login(testEmail, testPassword, true);
      // Against a real backend the login request is genuinely async; wait for it to
      // resolve (redirect to dashboard) before checking storage.
      await expect(page).toHaveURL(/\/dashboard/);

      // The JWT is kept in localStorage (key used by src/services/AuthService.ts)
      const authToken = await page.evaluate(() => localStorage.getItem('meal_planner_auth_token'));
      expect(authToken).toBeTruthy();
    });

    test('should lock account after 3 failed login attempts', async ({ page }) => {
      await page.goto('/login');

      // Try 3 times with wrong password. MaxLoginAttempts is 3 (internal/services/
      // auth_service.go), so the 3rd attempt is the one that crosses the threshold and
      // locks the account in the same request - it responds 403 with the sentinel
      // ErrAccountLocked's text, "account is locked due to too many failed login
      // attempts". A later attempt against an already-locked account instead hits the
      // early IsAccountLocked() check and gets AccountLockedError's text, "account is
      // locked. Please try again in N minute(s)". Either way the copy contains "locked".
      // Wait for each attempt's response to render before submitting the next one,
      // instead of a fixed sleep.
      for (let i = 0; i < 3; i++) {
        await page.fill('input[name="email"]', testEmail);
        await page.fill('input[name="password"]', 'WrongPassword');
        await page.click('button[type="submit"]');
        await expect(page.getByText(/invalid email or password|locked/i)).toBeVisible();
      }

      // Should show lock message. Two elements match /locked/i once locked (the message
      // and the "temporarily locked" follow-up LoginForm renders alongside it), so assert
      // on the first.
      await expect(page.getByText(/locked/i).first()).toBeVisible();
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
      await expect(page.getByRole('heading', { name: /Shopping Lists/i })).toBeVisible();

      await page.click('button:has-text("Next")');
      await expect(page.locator('text=Get Meal Suggestions')).toBeVisible();
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
      await expect(page.getByRole('progressbar')).toBeVisible();
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

    test('should show the register form immediately after logout (no bounce back to dashboard)', async ({ page }) => {
      const testEmail = `logout-race-${Date.now()}@example.com`;
      const testPassword = 'Test123!@#';

      await authHelper.register(testEmail, testPassword, 'Logout Race Test');
      await authHelper.completeOnboarding();
      await expect(page).toHaveURL(/\/dashboard/);

      // Dashboard.tsx's handleLogout must await logout() before navigating; otherwise the
      // token is still in localStorage when PublicRoute checks it on /register and bounces
      // straight back to /dashboard.
      await authHelper.logout();
      await page.goto('/register');
      await expect(page).toHaveURL(/\/register/);
      await expect(page.locator('input[name="email"]')).toBeVisible();
    });
  });
});
