# Meal Planner (Frontend)

A React + TypeScript single-page app for planning a week of meals. You can sign up, sign in, browse real recipes from [TheMealDB](https://www.themealdb.com) by category, name, cuisine or main ingredient, save favourites, and lay out breakfast, lunch, dinner and snacks for each day on a weekly calendar. Authentication and recipes come from a Go REST API: the backend fetches TheMealDB and caches it in Postgres. Favourites and meal plans live in `localStorage` for now.

**Backend:** [vivek721/meal-planner-backend](https://github.com/vivek721/meal-planner-backend) is a Go/Gin API with PostgreSQL, JWT auth and the TheMealDB recipe cache.

## Features

### Authentication and onboarding (backed by the Go API)
- **Registration:** optional name, email and password. The form is validated with Zod (8+ characters, one uppercase letter, one number, matching confirmation) and shows a live password-strength meter.
- **Login and logout:** these call `POST /api/auth/login` and `POST /api/auth/logout`. The JWT is stored in `localStorage`, and an Axios interceptor adds it to every request as a `Bearer` token.
- **Session restore:** on page load the app checks the stored token with `GET /api/auth/me`. Any `401` response clears the session and sends the user back to login.
- **Route guards:** protected routes redirect to `/login`. Signed-in users are sent away from the login and register pages. New users are sent to onboarding first.
- **Onboarding tutorial:** five slides with a progress indicator. You can move through them with Next/Back/Skip or with the keyboard (arrow keys, Enter, Escape). Finishing is saved through `POST /api/auth/onboarding/complete`, and the dashboard has a button to replay it.

### Recipes (TheMealDB, through the Go API)
- Recipes and photos come from TheMealDB through the backend's `/api/recipes` endpoints (`src/services/api/recipesApi.ts`). The app never calls TheMealDB's API itself. Lists use TheMealDB's small `/preview` images, and the detail page uses the full photo.
- **Browse (`/recipes`):** opens on a grid of categories with photos. You can search by name and filter by category, cuisine and main ingredient. Results are paged (24 per page), and the filters are kept in the URL, so Back returns to the same results. The page has loading, empty and error states; errors come with a Retry button.
- **Recipe detail (`/recipes/:id`):** the photo, category, cuisine and tags, ingredients with their measures, and step-by-step instructions. It links to "Watch on YouTube" and the original recipe when TheMealDB has them, and shows up to four similar recipes from the same category. There are share (Web Share API, falling back to the clipboard), print and favourite buttons.
- **Favourites (`/favorites`):** saved per user in `localStorage` as TheMealDB ids. You can search by name, filter by category, and sort by recently added or by name.
- Each recipe's details are fetched at most once per browser session (an in-memory cache in `src/services/recipes/recipeData.ts`).

### Weekly meal planning (`/meal-plan`, client-side)
- A Sunday-to-Saturday calendar with four meal slots per day, previous/next/this-week navigation and a highlight on today.
- A modal recipe picker fills a slot: search by name plus category and cuisine filters, served by the API. A slot stores the recipe's id, name, photo and category, so the calendar draws without any API calls. Added meals are saved per user and per week and are still there after a reload. Clicking a planned meal opens its recipe.
- Remove a meal from a slot.
- Copy one day's meals to other days, with an option to fill only empty slots or replace what is there.
- Clear the whole week, chosen days, or particular meal types.
- A **suggestions panel** (`src/services/SuggestionService.ts`) uses a simple heuristic, not an AI model:
  - Before 11:00 it suggests breakfasts. Later it picks one of chicken, beef, pasta, seafood, vegetarian, lamb or pork, preferring a category you haven't planned this week, and skips recipes already in the week.
  - It picks four at random from one API call and gives a short reason for each ("Breakfast idea", "Something different this week").
  - Any suggestion can be added to a day and meal of the week you are viewing.

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | React 18, TypeScript 5 |
| Build / dev server | Vite 5 |
| Styling | Tailwind CSS 3 (custom teal/orange palette, Inter font) |
| Routing | React Router 6 |
| Forms and validation | React Hook Form + Zod |
| HTTP | Axios (shared client with auth and error interceptors) |
| State | React Context (`AuthContext`, `RecipeContext` for favourites, `ToastContext`) |
| Drag and drop | `@dnd-kit/core` |
| Dates | `date-fns` 4 |
| Icons | `lucide-react` |
| Unit tests | Vitest (pure data-layer logic) |
| End-to-end tests | Playwright |
| CI | GitHub Actions (lint, type-check, unit tests, build, Playwright, CodeQL, dependency review) |

## Project structure

```
src/
├── components/
│   ├── atoms/          # Button, Input, Modal, Dropdown, Toast, ...
│   ├── molecules/      # RecipeCard, CategoryGrid, ErrorPanel, Pagination, MealSlot, DayColumn, ...
│   └── organisms/      # LoginForm, RegisterForm, OnboardingModal, MealPlanCalendar,
│                       # RecipeBrowserModal, MealSuggestions, CopyDayModal, ClearPlanModal
├── contexts/           # Auth, Recipe (favourites) and Toast providers (*Context.tsx) and their hooks (use*.ts)
├── hooks/              # useAsync (loading/error/retry, ignores stale responses)
├── pages/              # Login, Register, Onboarding, Dashboard, MealPlan, Recipes,
│                       # RecipeDetail, Favorites
├── services/
│   ├── api/            # apiClient.ts (Axios instance), authApi.ts, recipesApi.ts
│   ├── recipes/        # per-session cache, favourites storage, image/id helpers
│   ├── AuthService.ts  # token/session handling on top of authApi
│   ├── MealPlanService.ts    # weekly plans persisted to localStorage
│   └── SuggestionService.ts  # heuristic meal suggestions
├── types/              # auth and recipe type definitions (recipe types follow the API contract)
└── utils/              # password strength/validation helpers
tests/                  # Playwright specs, page helpers and API fixtures
docs/                   # PRD, design system, API contract and planning notes
```

Components follow an atomic-design layout (atoms, then molecules, then organisms, then pages).

## Getting started

### Prerequisites
- Node.js 18 or later (CI uses 18.x and 20.x) and npm
- A running copy of [meal-planner-backend](https://github.com/vivek721/meal-planner-backend) to register, log in and load recipes. It listens on port `3001` by default and accepts CORS requests from `http://localhost:3000`.

### Install and run

```bash
git clone https://github.com/vivek721/meal-planner-frontend.git
cd meal-planner-frontend
npm install
npm run dev          # http://localhost:3000 (opens the browser automatically)
```

### Pointing the app at the backend

The API base URL comes from `VITE_API_URL` (documented in `.env.example`). The committed `.env` file contains only that variable, set to the backend's default:

```bash
VITE_API_URL=http://localhost:3001
```

If `VITE_API_URL` is unset, the code falls back to that same value. To point at another backend, copy `.env.example` to `.env.local` (git-ignored), set your own `VITE_API_URL` and restart `npm run dev`.

### npm scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server on port 3000 |
| `npm run build` | Type-check with `tsc`, then produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint (flat config with typescript-eslint and the React Hooks rules; zero warnings allowed) |
| `npm run test:unit` | Run the Vitest unit tests (`src/**/*.test.ts`) |
| `npm test` | Run all Playwright tests |
| `npm run test:ui` / `test:headed` / `test:debug` | Run Playwright in UI, headed or debug mode |
| `npm run test:epic1` | Run only the authentication and onboarding spec |
| `npm run test:epic2` | Run only the meal-planning spec |
| `npm run test:report` | Open the last Playwright HTML report |

## Tests

**Unit tests** (Vitest, `npm run test:unit`) cover the pure data layer:
- the recipe API client's parameter cleaning and error mapping;
- the per-session cache;
- favourites storage, including dropping old ids;
- the meal-slot shape;
- the suggestion rules.

**End-to-end tests** (Playwright, `tests/`):

- `recipes.spec.ts`, `recipe-detail.spec.ts`, `favorites.spec.ts`, `meal-plan-recipes.spec.ts` and `suggestions.spec.ts` cover each recipe screen, including loading, empty, error (503 and network), expired-session and old-data cases.
- `epic2-meal-planning.spec.ts` covers the weekly calendar, the recipe picker, suggestions, copy day, clear plan and a full planning flow.
- `epic1-authentication.spec.ts` covers registration, login, onboarding and an end-to-end auth flow.

The recipe and meal-planning specs are hermetic. `tests/helpers/recipes.fixtures.ts` answers every `/api/recipes*` request from fixture data and every TheMealDB image with a placeholder, and `tests/helpers/session.helper.ts` fakes a signed-in session. They need neither the backend nor TheMealDB. Only `epic1-authentication.spec.ts` needs the backend running on port `3001`, because it registers and logs in real users.

`playwright.config.ts` runs the specs in Chromium, Firefox, WebKit, Pixel 5 and iPhone 12 profiles against `http://localhost:3000`, and starts the dev server itself (or reuses one already running there). Install the browsers once with `npx playwright install`.

## Project status and known issues

This is an active work in progress. Known gaps:

- **Fields TheMealDB does not provide are not shown.** These were removed: cooking times, ratings and review counts, servings (and the serving adjuster), dietary labels and the dietary filter, and the time, rating and popularity sorts. The detail page's nutrition panel says "Nutrition information coming soon"; nutrition from USDA data is planned.
- **Data saved before the switch to TheMealDB:**
  - Favourites saved with the old sample-recipe ids are dropped the first time favourites load.
  - Old meal-plan slots still show their saved name and picture, but opening one says "This recipe is no longer available".
- **Recipes need the backend,** and TheMealDB for anything the backend has not cached yet. If TheMealDB is down and nothing is cached, recipe screens say "Recipes are temporarily unavailable, please try again shortly" and offer Retry.
- **Drag and drop is only half built.** The calendar's meal slots are `@dnd-kit` drop targets, but nothing on the page is draggable yet, so meals are added through the recipe picker or the suggestions panel.
- "Remember me" on the login form is not wired up, "Forgot password?" is a placeholder, and the meal-plan **Export** button does nothing.
- Nothing links to `/favorites` yet, so that page is reached by URL.

## Roadmap (not yet built)

- Nutrition facts from USDA FoodData Central
- Save meal plans and favourites to the backend instead of `localStorage`
- Shopping lists generated from the week's plan
- A user preferences and profile page (the backend already has profile, password and preference endpoints)
- Password reset and persistent "remember me" sessions

## Credits

Recipe data and images from [TheMealDB](https://www.themealdb.com). The public API key the backend uses is for development and educational use.
