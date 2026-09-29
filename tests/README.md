# End-to-End Testing with Playwright

This directory contains the E2E tests for the Meal Planner application using Playwright, plus the Vitest unit tests for the pure data-layer logic live under `src/`.

## Test Structure

```
tests/
├── helpers/
│   ├── api.helper.ts           # CORS-aware JSON responses for route interception
│   ├── auth.helper.ts          # Authentication helper methods (real backend)
│   ├── mealplan.helper.ts      # Meal planning helper methods
│   ├── recipes.fixtures.ts     # Fixture recipes; intercepts /api/recipes* and TheMealDB images
│   └── session.helper.ts       # Mocked signed-in session (no backend needed)
├── epic1-authentication.spec.ts # Epic 1: Authentication & Onboarding (needs the backend)
├── epic2-meal-planning.spec.ts  # Epic 2: Meal Planning (hermetic)
├── recipes.spec.ts              # Recipes page (hermetic)
├── recipe-detail.spec.ts        # Recipe detail (hermetic)
├── favorites.spec.ts            # Favourites (hermetic)
├── meal-plan-recipes.spec.ts    # Meal-plan picker and slots (hermetic)
├── suggestions.spec.ts          # Meal suggestions (hermetic)
└── README.md                    # This file
```

Hermetic specs fake the session and answer every `/api/recipes*` request from `helpers/recipes.fixtures.ts`, so they never call the backend or TheMealDB. Use `overrideRecipesApi(page, match, handler)` to change one endpoint in a test, for example `outage()` for a 503 or `route.abort('failed')` for a network error.

## CI honesty

- **`epic1-authentication.spec.ts` needs a real backend, and runs in CI against one.** `playwright.config.ts` only excludes it (`testIgnore`) when `CI` is set *and* `E2E_BACKEND` is not; the `chromium`/`firefox`/`webkit`/mobile jobs in `.github/workflows/playwright.yml` run without `E2E_BACKEND`, so they skip it. The dedicated `test-epic1` job checks out `vivek721/meal-planner-backend`, brings it up with `docker compose`, waits for `/health`, then runs `tests/epic1-authentication.spec.ts` with `E2E_BACKEND=1` against it (frontend's `VITE_API_URL` already defaults to the backend's `:3001`), and tears the backend down afterwards. Run it the same way locally with `E2E_BACKEND=1 npm run test:epic1` against a running backend, or plain `npm run test:epic1` outside of CI.
- All `epic2-meal-planning.spec.ts` tests pass (no `test.fixme()`s). The five that used to be skipped were rewritten to use roles, accessible names and `data-testid`s (`meal-plan-day` on `DayColumn`, `meal-slot` on `MealSlot`) instead of the stale class-name/text selectors that caused strict-mode violations or matched nothing.

## Test Coverage

Counts below are per spec file with `--project=chromium` (`npx playwright test --project=chromium --list`); `playwright.config.ts` also runs the suite against Firefox, WebKit, Pixel 5 and iPhone 12.

| Spec | Tests | Needs |
| --- | --- | --- |
| `epic1-authentication.spec.ts` | 18 | real backend (registration, login, onboarding, full auth flow); runs in CI's `test-epic1` job against a live backend, see "CI honesty" above |
| `epic2-meal-planning.spec.ts` | 32 | hermetic (calendar, picker, copy day, clear plan, full planning flow) |
| `recipes.spec.ts` | 12 | hermetic (category grid, search/filters/paging, states, onboarding copy, keyboard operability) |
| `recipe-detail.spec.ts` | 7 | hermetic (detail fields, similar recipes, states) |
| `favorites.spec.ts` | 6 | hermetic (search, filter, sort, old-id migration, states) |
| `meal-plan-recipes.spec.ts` | 5 | hermetic (picker, self-contained slots, old-slot fallback, keyboard operability) |
| `suggestions.spec.ts` | 5 | hermetic (time-of-day category, variety, exclusion, states) |
| **Total** | **85** | |

`npm run test:unit` (Vitest, `src/**/*.test.ts`) additionally runs 72 tests across 7 files, covering the recipe API client's parameter cleaning and error mapping, the per-session cache, favourites storage (including dropping old ids), the meal-slot shape and `MealPlanService`, the suggestion rules, and the password rule/strength/error-mapping utilities in `src/utils/passwordUtils.ts` (the same rule RegisterForm's Zod schema uses directly, including parity with the backend's Unicode letter/number/punctuation/symbol categories).

## Running Tests

### Prerequisites

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Install Playwright browsers** (if not already installed):
   ```bash
   npx playwright install
   ```

### Run All Tests

```bash
npm test
```

### Run Specific Test Suites

**Epic 1 only**:
```bash
npm run test:epic1
```

**Epic 2 only**:
```bash
npm run test:epic2
```

### Development Mode

**Interactive UI mode** (recommended for development):
```bash
npm run test:ui
```

**Headed mode** (see browser):
```bash
npm run test:headed
```

**Debug mode** (step through tests):
```bash
npm run test:debug
```

### View Test Report

After running tests:
```bash
npm run test:report
```

## Test Configuration

Tests are configured in `playwright.config.ts`:

- **Base URL**: http://localhost:3000 (the Vite dev server; the backend runs on 3001)
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Retries**: 2 (in CI), 0 (local)
- **Screenshots**: On failure
- **Trace**: On first retry
- **Web Server**: Auto-starts dev server if not running

## Writing New Tests

### 1. Use Helper Classes

```typescript
import { AuthHelper } from './helpers/auth.helper';
import { MealPlanHelper } from './helpers/mealplan.helper';

test('my test', async ({ page }) => {
  const authHelper = new AuthHelper(page);
  const mealPlanHelper = new MealPlanHelper(page);

  await authHelper.register('test@example.com', 'Test123!@#');
  await mealPlanHelper.navigateToMealPlan();
});
```

### 2. Follow Test Structure

```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
  });

  test('should do something', async ({ page }) => {
    // Arrange
    // Act
    // Assert
  });
});
```

### 3. Use Descriptive Test Names

- Start with "should"
- Be specific about what is being tested
- Example: "should display password strength indicator"

### 4. Use Page Object Methods

Don't:
```typescript
await page.click('button');
```

Do:
```typescript
await authHelper.login(email, password);
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Tests Failing Locally

1. **Clear localStorage**:
   ```javascript
   await page.evaluate(() => localStorage.clear());
   ```

2. **Check dev server is running**:
   ```bash
   npm run dev
   ```

3. **Update snapshots** (if visual regression):
   ```bash
   npx playwright test --update-snapshots
   ```

### Debugging Tips

1. **Use test.only()** to run single test:
   ```typescript
   test.only('my test', async ({ page }) => {
     // ...
   });
   ```

2. **Add breakpoints** in --debug mode

3. **Screenshot on specific step**:
   ```typescript
   await page.screenshot({ path: 'debug.png' });
   ```

4. **Slow down execution**:
   ```typescript
   await page.waitForTimeout(1000); // Add delays
   ```

## Best Practices

1. **Isolate tests**: Each test should be independent
2. **Use unique test data**: Generate unique emails with timestamps
3. **Wait for elements**: Use `waitForSelector` instead of `waitForTimeout`
4. **Clean up**: Clear localStorage in beforeEach
5. **Test user flows**: Test complete scenarios, not just UI elements
6. **Use helpers**: Reuse common operations via helper classes
7. **Assert expectations**: Always verify outcomes with `expect()`
8. **Handle async**: Always await promises

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [API Reference](https://playwright.dev/docs/api/class-playwright)

## Next Steps

As new epics are implemented:

1. Create new test files: `epic3-recipe-discovery.spec.ts`
2. Add helper methods: `recipe.helper.ts`
3. Update this README with test coverage
4. Run full test suite before deployment
