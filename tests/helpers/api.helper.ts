import type { Route } from '@playwright/test';

/** Lets the app on :3000 read responses that are fulfilled "from" the API on :3001. */
export const CORS_HEADERS: Record<string, string> = {
  'access-control-allow-origin': 'http://localhost:3000',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'Authorization, Content-Type',
};

export const isPreflight = (route: Route): boolean => route.request().method() === 'OPTIONS';

export async function fulfillPreflight(route: Route): Promise<void> {
  await route.fulfill({ status: 204, headers: CORS_HEADERS });
}

export async function fulfillJson(route: Route, status: number, body: unknown): Promise<void> {
  await route.fulfill({
    status,
    headers: CORS_HEADERS,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}
