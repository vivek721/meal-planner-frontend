# End-to-End Testing with Playwright

This directory contains comprehensive E2E tests for the AI-Powered Meal Planner application using Playwright.

## Test Structure

```
tests/
├── helpers/
│   ├── auth.helper.ts          # Authentication helper methods
│   └── mealplan.helper.ts      # Meal planning helper methods
├── epic1-authentication.spec.ts # Epic 1: Authentication & Onboarding tests
├── epic2-meal-planning.spec.ts  # Epic 2: Meal Planning tests
└── README.md                    # This file
```

## Test Coverage

### Epic 1: Authentication & Onboarding (21 tests)

**US-1.1: User Registration** (5 tests)
- ✓ Register with valid credentials
- ✓ Password strength indicator
- ✓ Email format validation
- ✓ Password confirmation match
- ✓ Existing email error

**US-1.2: User Login** (5 tests)
- ✓ Login with valid credentials
- ✓ Invalid credentials error
- ✓ Remember me functionality
- ✓ Account lock after 3 failed attempts
- ✓ Session persistence across refreshes

**US-1.3: Onboarding Tutorial** (6 tests)
- ✓ Display all 5 screens
- ✓ Navigate back through screens
- ✓ Skip onboarding
- ✓ Complete onboarding
- ✓ Progress indicator
- ✓ Keyboard navigation

**Integration** (1 test)
- ✓ Full authentication flow

### Epic 2: Meal Planning (40+ tests)

**US-2.1: View Weekly Calendar** (10 tests)
- ✓ Display 7-day grid
- ✓ Show current week
- ✓ Highlight current day
- ✓ Show all 4 meal slots
- ✓ "Add meal" placeholders
- ✓ Navigate to next/previous week
- ✓ "This Week" button
- ✓ Loading state
- ✓ Mobile responsive

**US-2.2: Add Recipe to Meal Slot** (10 tests)
- ✓ Open recipe browser modal
- ✓ Display search bar
- ✓ Filter by search query
- ✓ Filter by category
- ✓ Add recipe to slot
- ✓ Close modal (X button, Escape)
- ✓ Replace confirmation
- ✓ Persist changes

**US-2.3: AI Meal Suggestions** (5 tests)
- ✓ Display suggestions section
- ✓ Show multiple suggestions
- ✓ Show "Why this?" reasons
- ✓ Refresh suggestions
- ✓ Day/meal selector

**US-2.4: Copy Day's Meals** (4 tests)
- ✓ Show copy buttons
- ✓ Open copy modal
- ✓ Target day checkboxes
- ✓ Replace option

**US-2.5: Clear Meal Plan** (4 tests)
- ✓ Show clear button
- ✓ Open clear modal
- ✓ Clear entire week option
- ✓ Warning message

**Integration** (1 test)
- ✓ Complete meal planning workflow

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

- **Base URL**: http://localhost:3001
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
