import type { Page } from '@playwright/test';
import type { User } from '../../src/types/auth.types';
import { fulfillJson, fulfillPreflight, isPreflight } from './api.helper';

/** The user every hermetic spec signs in as. */
export const TEST_USER: User = {
  id: 'user-e2e',
  email: 'e2e@example.test',
  name: 'E2E Tester',
  createdAt: '2026-01-01T00:00:00.000Z',
  hasCompletedOnboarding: true,
};

/**
 * Signs in without the backend: answers GET /api/auth/me and seeds the stored
 * session (same keys as AuthService). `storage` adds more localStorage entries
 * (favourites, meal plans) before the app next loads. Navigate afterwards.
 */
export async function signInWithMockedSession(page: Page, storage: Record<string, string> = {}): Promise<void> {
  await page.route((url) => url.pathname === '/api/auth/me', async (route) => {
    if (isPreflight(route)) return fulfillPreflight(route);
    await fulfillJson(route, 200, { user: TEST_USER });
  });

  await page.goto('/login');
  await page.evaluate(
    ({ user, entries }) => {
      localStorage.setItem('meal_planner_auth_token', 'e2e-token');
      localStorage.setItem('meal_planner_current_user', JSON.stringify(user));
      for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, value);
    },
    { user: TEST_USER, entries: storage },
  );
}
