# Meal Planner (Frontend)

A React + TypeScript single-page app for planning a week of meals. You can sign up, sign in, browse and filter a recipe catalogue, scale recipes to a different number of servings, save favourites, and lay out breakfast, lunch, dinner and snacks for each day on a weekly calendar. Authentication runs against a real Go REST API using JWTs. Recipes, favourites and meal plans live on the client for now (bundled mock data plus `localStorage`).

**Backend:** [vivek721/meal-planner-backend](https://github.com/vivek721/meal-planner-backend) is a Go/Gin API with PostgreSQL and JWT auth.

## Features

### Authentication and onboarding (backed by the Go API)
- **Registration:** optional name, email and password. The form is validated with Zod (8+ characters, one uppercase letter, one number, matching confirmation) and shows a live password-strength meter.
- **Login and logout:** these call `POST /api/auth/login` and `POST /api/auth/logout`. The JWT is stored in `localStorage`, and an Axios interceptor adds it to every request as a `Bearer` token.
- **Session restore:** on page load the app checks the stored token with `GET /api/auth/me`. Any `401` response clears the session and sends the user back to login.
- **Route guards:** protected routes redirect to `/login`. Signed-in users are sent away from the login and register pages. New users are sent to onboarding first.
- **Onboarding tutorial:** five slides with a progress indicator. You can move through them with Next/Back/Skip or with the keyboard (arrow keys, Enter, Escape). Finishing is saved through `POST /api/auth/onboarding/complete`, and the dashboard has a button to replay it.

### Recipes (client-side, 70 bundled sample recipes)
- Recipes have no photos; each shows a generated placeholder coloured by meal category (`src/utils/recipeThumbnail.ts`).
- **Browse (`/recipes`):** free-text search over name, description, cuisine, ingredients and dietary tags. You can filter by category, cuisine, dietary tag and maximum total time, and sort by popularity, quickest, newest, rating or name.
- **Recipe detail (`/recipes/:id`):** ingredients, step-by-step instructions and nutrition. A serving adjuster rescales ingredient amounts (fractions are handled, e.g. `1/2` becomes `3/4`) along with the nutrition figures. The page also shows similar recipes (scored by cuisine, category and dietary tags) and has buttons for share (Web Share API, falling back to the clipboard), print and favourite.
- **Favourites (`/favorites`):** saved per user in `localStorage`, with search, a category filter and sorting.

### Weekly meal planning (`/meal-plan`, client-side)
- A Sunday-to-Saturday calendar with four meal slots per day, previous/next/this-week navigation and a highlight on today.
- A modal recipe picker (search plus category, cuisine and dietary filters) for filling a slot. Added meals are saved per user and per week and are still there after a reload.
- Remove a meal from a slot.
- Copy one day's meals to other days, with an option to fill only empty slots or replace what is there.
- Clear the whole week, chosen days, or particular meal types.
- A **suggestions panel** that ranks recipes with a local heuristic (time of day, prep time, protein, rating, and dietary match once the profile stores dietary preferences) and gives a short reason for each pick. Any suggestion can be added to a day and meal of the week you are viewing. It runs in the browser and does not call an AI model.

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | React 18, TypeScript 5 |
| Build / dev server | Vite 5 |
| Styling | Tailwind CSS 3 (custom teal/orange palette, Inter font) |
| Routing | React Router 6 |
| Forms and validation | React Hook Form + Zod |
| HTTP | Axios (shared client with auth and error interceptors) |
| State | React Context (`AuthContext`, `RecipeContext`, `ToastContext`) |
| Drag and drop | `@dnd-kit/core` |
| Dates | `date-fns` 4 |
| Icons | `lucide-react` |
| End-to-end tests | Playwright |
| CI | GitHub Actions (lint, type-check, build, Playwright, CodeQL, dependency review) |

## Project structure

```
src/
├── components/
│   ├── atoms/          # Button, Input, Modal, Dropdown, Toast, ServingAdjuster, ...
│   ├── molecules/      # RecipeCard, MealSlot, DayColumn, WeekNavigation, NutritionCard, ...
│   └── organisms/      # LoginForm, RegisterForm, OnboardingModal, MealPlanCalendar,
│                       # RecipeBrowserModal, MealSuggestions, CopyDayModal, ClearPlanModal
├── contexts/           # Auth, Recipe and Toast providers (*Context.tsx) and their hooks (use*.ts)
├── data/               # mockRecipes.ts (sample recipe catalogue)
├── pages/              # Login, Register, Onboarding, Dashboard, MealPlan, Recipes,
│                       # RecipeDetail, Favorites
├── services/
│   ├── api/            # apiClient.ts (Axios instance), authApi.ts (auth endpoints)
│   ├── AuthService.ts  # token/session handling on top of authApi
│   ├── RecipeService.ts    # search, filter, sort, scaling, favourites
│   ├── MealPlanService.ts  # weekly plans persisted to localStorage
│   └── MockAIService.ts    # heuristic meal suggestions
├── types/              # auth and recipe type definitions
└── utils/              # password strength/validation helpers
tests/                  # Playwright specs and page helpers
docs/                   # PRD, design system, API contract and planning notes
```

Components follow an atomic-design layout (atoms, then molecules, then organisms, then pages).

## Getting started

### Prerequisites
- Node.js 18 or later (CI uses 18.x and 20.x) and npm
- A running copy of [meal-planner-backend](https://github.com/vivek721/meal-planner-backend) if you want to register or log in. It listens on port `3001` by default and accepts CORS requests from `http://localhost:3000`.

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
| `npm test` | Run all Playwright tests |
| `npm run test:ui` / `test:headed` / `test:debug` | Run Playwright in UI, headed or debug mode |
| `npm run test:epic1` | Run only the authentication and onboarding spec |
| `npm run test:epic2` | Run only the meal-planning spec |
| `npm run test:report` | Open the last Playwright HTML report |

## Tests

End-to-end tests use Playwright (`tests/`):

- `epic1-authentication.spec.ts`: registration, login, onboarding and an end-to-end auth flow (17 tests)
- `epic2-meal-planning.spec.ts`: weekly calendar, adding recipes to slots, suggestions, copy day, clear plan and a full planning flow (33 tests)

`playwright.config.ts` runs them in Chromium, Firefox, WebKit, Pixel 5 and iPhone 12 profiles against `http://localhost:3000`, and starts the dev server itself (or reuses one already running there). The backend has to be running on its default port `3001` because almost every test registers or logs in a real user; only the three registration-form validation tests (password strength, email format, password confirmation) run without it. Install the browsers once with `npx playwright install`.

There are no unit tests yet.

## Project status and known issues

This is an active work in progress. Known gaps:

- **Drag and drop is only half built.** The calendar's meal slots are `@dnd-kit` drop targets, but nothing on the page is draggable yet, so meals are added through the recipe picker or the suggestions panel.
- The user profile from the API has no dietary preferences, so the suggestions panel does not personalise by diet yet.
- "Remember me" on the login form is not wired up, "Forgot password?" is a placeholder, and the meal-plan **Export** button does nothing.
- Nothing links to `/favorites` yet, so that page is reached by URL.

## Roadmap (not yet built)

- Save meal plans, favourites and recipes to the backend instead of `localStorage` and mock data
- Shopping lists generated from the week's plan
- A user preferences and profile page (the backend already has profile, password and preference endpoints)
- Model-backed meal suggestions in place of the local heuristic
- Password reset and persistent "remember me" sessions
