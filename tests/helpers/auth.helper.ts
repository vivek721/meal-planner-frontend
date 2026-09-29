import { Page } from '@playwright/test';

export class AuthHelper {
  constructor(private page: Page) {}

  async register(email: string, password: string, name?: string) {
    await this.page.goto('/register');

    if (name) {
      await this.page.fill('input[name="name"]', name);
    }
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.fill('input[name="confirmPassword"]', password);

    await this.page.click('button[type="submit"]');
  }

  async login(email: string, password: string, rememberMe: boolean = false) {
    await this.page.goto('/login');

    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);

    if (rememberMe) {
      await this.page.check('input[type="checkbox"]');
    }

    await this.page.click('button[type="submit"]');
  }

  async logout() {
    await this.page.click('button:has-text("Logout")');
    // Dashboard's handleLogout awaits AuthService.logout() (which clears the stored
    // token in a `finally`) before navigating. Wait for that navigation to actually land
    // so a subsequent hard navigation (e.g. page.goto) in the caller can't tear down the
    // page mid-await and skip the token clear.
    await this.page.waitForURL(/\/login/, { timeout: 10000 });
  }

  async skipOnboarding() {
    // Wait for onboarding modal
    await this.page.waitForSelector('text=Welcome', { timeout: 5000 });

    // Click skip button
    await this.page.click('button:has-text("Skip")');
  }

  async completeOnboarding() {
    // Wait for onboarding modal
    await this.page.waitForSelector('text=Welcome', { timeout: 5000 });

    // Go through all screens
    for (let i = 0; i < 4; i++) {
      await this.page.click('button:has-text("Next")');
      await this.page.waitForTimeout(300);
    }

    // Click "Get Started" on final screen
    await this.page.click('button:has-text("Get Started")');
  }

  async clearAuthStorage() {
    // localStorage is not accessible on about:blank, so load the app first
    if (this.page.url() === 'about:blank') {
      await this.page.goto('/login');
    }
    await this.page.evaluate(() => {
      // Keys used by src/services/AuthService.ts
      localStorage.removeItem('meal_planner_auth_token');
      localStorage.removeItem('meal_planner_current_user');
    });
  }
}
