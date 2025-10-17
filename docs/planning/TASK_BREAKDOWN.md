# Task Breakdown - Detailed Implementation Plan
## AI-Powered Meal Planner

---

**Version:** 1.0
**Last Updated:** 2025-10-12
**Total Tasks:** 77
**Total Estimated Hours:** 320 hours (8 weeks @ 40 hours/week)

---

## Table of Contents

1. [Overview](#overview)
2. [Task Status Legend](#task-status-legend)
3. [Week 1: Foundation & Design System](#week-1-foundation--design-system)
4. [Week 2: Authentication & Navigation](#week-2-authentication--navigation)
5. [Week 3: Meal Planning Core](#week-3-meal-planning-core)
6. [Week 4: Recipe Discovery](#week-4-recipe-discovery)
7. [Week 5: Shopping Lists](#week-5-shopping-lists)
8. [Week 6: User Preferences](#week-6-user-preferences)
9. [Week 7: AI Features & Dashboard](#week-7-ai-features--dashboard)
10. [Week 8: Polish, Testing & Launch Prep](#week-8-polish-testing--launch-prep)
11. [Task Dependencies](#task-dependencies)
12. [Critical Path](#critical-path)

---

## Overview

This document breaks down all 28 user stories from the Epic Breakdown into 77 granular, actionable tasks. Each task is designed to be completed in 1-4 hours by a single developer.

### Task Structure

Each task includes:
- **Task ID**: Unique identifier (T-XXX)
- **Title**: Clear, actionable description
- **Description**: What needs to be done
- **Epic/Story**: Parent user story reference
- **Effort**: Small (1-2h), Medium (2-4h), Large (4-8h)
- **Dependencies**: Tasks that must complete first
- **Acceptance Criteria**: Specific, testable requirements
- **Technical Notes**: Implementation hints

### Estimation Methodology

- **Small (S)**: 1-2 hours - Simple component, utility function, or service method
- **Medium (M)**: 2-4 hours - Complex component with state management, multiple interactions
- **Large (L)**: 4-8 hours - Page layout, integration of multiple components, complex logic

**Total Capacity**: 40 hours/week × 8 weeks = 320 hours

---

## Task Status Legend

- ⬜ **Not Started**: Task not yet begun
- 🟡 **In Progress**: Currently being worked on
- ✅ **Completed**: Task finished and tested
- 🚫 **Blocked**: Waiting on dependencies

---

## Week 1: Foundation & Design System

**Goal**: Set up project infrastructure and implement complete design system

**Deliverable**: Functional project with 30+ reusable components documented

**Hours**: 40 hours

---

### T-001: Project Setup & Configuration
**Epic**: Foundation
**Effort**: Medium (3h)
**Dependencies**: None
**Status**: ⬜

**Description**:
Initialize React project with Vite, configure TypeScript, and set up essential tooling.

**Acceptance Criteria**:
1. ✓ Create new Vite + React + TypeScript project
2. ✓ Configure tsconfig.json with strict mode
3. ✓ Install and configure ESLint (Airbnb rules)
4. ✓ Install and configure Prettier
5. ✓ Set up Husky for pre-commit hooks
6. ✓ Install core dependencies:
   - react-router-dom
   - date-fns
   - lucide-react (icons)
   - tailwindcss
   - clsx
7. ✓ Create folder structure (see PRD)
8. ✓ Configure Tailwind CSS with custom theme
9. ✓ Create .env files for environment variables
10. ✓ Verify dev server runs without errors

**Technical Notes**:
```bash
npm create vite@latest myApp -- --template react-ts
cd myApp
npm install
npm install -D tailwindcss postcss autoprefixer eslint prettier husky
npx tailwindcss init -p
```

---

### T-002: Tailwind Configuration & Design Tokens
**Epic**: Foundation
**Effort**: Small (2h)
**Dependencies**: T-001
**Status**: ⬜

**Description**:
Configure Tailwind with custom colors, spacing, typography matching design system.

**Acceptance Criteria**:
1. ✓ Extend Tailwind theme with custom colors:
   - Primary (teal scale)
   - Secondary (orange scale)
   - Success, warning, error, info
2. ✓ Configure custom spacing scale
3. ✓ Add Inter font family
4. ✓ Configure responsive breakpoints
5. ✓ Add custom utilities if needed
6. ✓ Create globals.css with base styles
7. ✓ Test color contrast meets WCAG AA

**Technical Notes**:
See DESIGN_SYSTEM.md for exact color codes.

---

### T-003: Create Atomic Components - Buttons
**Epic**: Design System
**Effort**: Medium (3h)
**Dependencies**: T-002
**Status**: ⬜

**Description**:
Implement all button variants (Primary, Secondary, Ghost, Danger, Icon).

**Acceptance Criteria**:
1. ✓ Button component with variants:
   - primary, secondary, ghost, danger
2. ✓ Size props: sm, md, lg
3. ✓ Disabled state
4. ✓ Loading state (with spinner)
5. ✓ Icon button variant
6. ✓ Hover, focus, active states
7. ✓ TypeScript props properly typed
8. ✓ Accessibility: focus visible, aria-disabled
9. ✓ Storybook stories (optional)
10. ✓ Test in sample page

**Component Path**: `src/components/atoms/Button/Button.tsx`

---

### T-004: Create Atomic Components - Form Inputs
**Epic**: Design System
**Effort**: Large (4h)
**Dependencies**: T-002
**Status**: ⬜

**Description**:
Implement text input, select, checkbox, radio, toggle components.

**Acceptance Criteria**:
1. ✓ Input component:
   - Text, email, password, number types
   - Label, helper text, error message
   - Error state styling
   - Disabled state
2. ✓ Select component (dropdown)
3. ✓ Checkbox component
4. ✓ Radio component
5. ✓ Toggle/Switch component
6. ✓ All components accessible (labels, aria attributes)
7. ✓ Form validation styling hooks
8. ✓ TypeScript types for all props
9. ✓ Test all states

**Component Paths**:
- `src/components/atoms/Input/Input.tsx`
- `src/components/atoms/Select/Select.tsx`
- `src/components/atoms/Checkbox/Checkbox.tsx`
- `src/components/atoms/Radio/Radio.tsx`
- `src/components/atoms/Toggle/Toggle.tsx`

---

### T-005: Create Atomic Components - Badges, Tags, Avatars
**Epic**: Design System
**Effort**: Small (2h)
**Dependencies**: T-002
**Status**: ⬜

**Description**:
Implement small UI elements: badges, tags/chips, avatars, icons.

**Acceptance Criteria**:
1. ✓ Badge component (status badges, count badges)
2. ✓ Tag/Chip component (removable chips)
3. ✓ Avatar component (image, initials fallback)
4. ✓ Icon wrapper component (Lucide React)
5. ✓ Spinner/Loader component
6. ✓ Divider component
7. ✓ All components styled per design system
8. ✓ TypeScript props
9. ✓ Test rendering

---

### T-006: Create Atomic Components - Progress & Feedback
**Epic**: Design System
**Effort**: Small (2h)
**Dependencies**: T-002
**Status**: ⬜

**Description**:
Implement progress bar, tooltip, and link components.

**Acceptance Criteria**:
1. ✓ Progress bar component (with percentage)
2. ✓ Tooltip component (hover, focus)
3. ✓ Link component (styled variants)
4. ✓ Skeleton loader (for loading states)
5. ✓ All accessible
6. ✓ TypeScript types

---

### T-007: Create Molecule Components - Search Bar
**Epic**: Design System
**Effort**: Small (2h)
**Dependencies**: T-004, T-005
**Status**: ⬜

**Description**:
Build search bar with icon and clear button.

**Acceptance Criteria**:
1. ✓ Search input with icon
2. ✓ Clear button (X) appears when text entered
3. ✓ Placeholder text
4. ✓ OnChange handler
5. ✓ Debounce support (optional prop)
6. ✓ Loading state indicator
7. ✓ TypeScript props

**Component Path**: `src/components/molecules/SearchBar/SearchBar.tsx`

---

### T-008: Create Molecule Components - Alert & Toast
**Epic**: Design System
**Effort**: Medium (3h)
**Dependencies**: T-003, T-005
**Status**: ⬜

**Description**:
Build alert notifications and toast system.

**Acceptance Criteria**:
1. ✓ Alert component (success, error, warning, info variants)
2. ✓ Alert with icon, title, description, close button
3. ✓ Toast notification system
4. ✓ Toast auto-dismiss (configurable timeout)
5. ✓ Toast positioning (top-right, bottom-right, etc.)
6. ✓ Toast queue (multiple toasts)
7. ✓ useToast custom hook
8. ✓ TypeScript types

**Component Paths**:
- `src/components/molecules/Alert/Alert.tsx`
- `src/components/molecules/Toast/Toast.tsx`
- `src/hooks/useToast.ts`

---

### T-009: Create Molecule Components - Cards
**Epic**: Design System
**Effort**: Medium (3h)
**Dependencies**: T-003, T-005
**Status**: ⬜

**Description**:
Build recipe card, stat card, and generic card components.

**Acceptance Criteria**:
1. ✓ RecipeCard component:
   - Image, title, description
   - Metadata (prep time, servings, rating)
   - Tags
   - Favorite button
   - Hover effects
2. ✓ StatCard component (dashboard stats)
3. ✓ Generic Card component (reusable container)
4. ✓ Responsive design
5. ✓ TypeScript props

**Component Paths**:
- `src/components/molecules/RecipeCard/RecipeCard.tsx`
- `src/components/molecules/StatCard/StatCard.tsx`
- `src/components/molecules/Card/Card.tsx`

---

### T-010: Create Molecule Components - Meal Slot & Shopping Item
**Epic**: Design System
**Effort**: Medium (3h)
**Dependencies**: T-003, T-004, T-005
**Status**: ⬜

**Description**:
Build meal slot component (for calendar) and shopping list item.

**Acceptance Criteria**:
1. ✓ MealSlot component:
   - Empty state (+ Add meal)
   - Filled state (recipe thumbnail, name, time)
   - Remove button
   - Click handlers
   - Drag-and-drop support (data attributes)
2. ✓ ShoppingListItem component:
   - Checkbox
   - Item name, quantity, category
   - Edit/delete buttons
   - Checked state (strikethrough)
3. ✓ TypeScript props

**Component Paths**:
- `src/components/molecules/MealSlot/MealSlot.tsx`
- `src/components/molecules/ShoppingListItem/ShoppingListItem.tsx`

---

### T-011: Create Organism Components - Modals & Dialogs
**Epic**: Design System
**Effort**: Medium (3h)
**Dependencies**: T-003, T-005
**Status**: ⬜

**Description**:
Build modal/dialog system with overlay, focus trap, and accessibility.

**Acceptance Criteria**:
1. ✓ Modal component:
   - Overlay (backdrop)
   - Modal container (centered)
   - Header, body, footer sections
   - Close button (X)
   - Close on overlay click
   - Close on Escape key
2. ✓ Focus trap (focus stays in modal)
3. ✓ Restore focus on close
4. ✓ Prevent body scroll when open
5. ✓ useModal custom hook
6. ✓ Accessible (role="dialog", aria-labelledby, aria-describedby)
7. ✓ TypeScript props

**Component Path**: `src/components/organisms/Modal/Modal.tsx`

---

### T-012: Create Organism Components - Pagination & Empty States
**Epic**: Design System
**Effort**: Small (2h)
**Dependencies**: T-003
**Status**: ⬜

**Description**:
Build pagination controls and empty state component.

**Acceptance Criteria**:
1. ✓ Pagination component:
   - Previous/Next buttons
   - Page numbers
   - Current page highlighted
   - Ellipsis for skipped pages
   - Info text: "Showing X-Y of Z"
2. ✓ EmptyState component:
   - Icon, title, description
   - CTA button
   - Flexible (different use cases)
3. ✓ TypeScript props

---

### T-013: Create Template Components - Layouts
**Epic**: Design System
**Effort**: Medium (3h)
**Dependencies**: T-003, T-005
**Status**: ⬜

**Description**:
Build page layout templates (Dashboard, Auth, Full-Width).

**Acceptance Criteria**:
1. ✓ DashboardLayout:
   - Header
   - Sidebar (desktop)
   - Main content area
   - Bottom nav (mobile)
   - Responsive
2. ✓ AuthLayout:
   - Centered card
   - Background gradient
   - Logo
3. ✓ FullWidthLayout:
   - Header
   - Full-width content
   - Footer (optional)
4. ✓ TypeScript props (children, etc.)

**Component Paths**:
- `src/components/templates/DashboardLayout/DashboardLayout.tsx`
- `src/components/templates/AuthLayout/AuthLayout.tsx`
- `src/components/templates/FullWidthLayout/FullWidthLayout.tsx`

---

### T-014: Create Utility Functions & Helpers
**Epic**: Foundation
**Effort**: Medium (3h)
**Dependencies**: T-001
**Status**: ⬜

**Description**:
Implement utility functions for date handling, formatting, validation, etc.

**Acceptance Criteria**:
1. ✓ Date utilities:
   - getCurrentWeekDates()
   - formatDate()
   - getWeekStartDate()
   - getRelativeTime() (e.g., "2 hours ago")
2. ✓ String utilities:
   - truncate()
   - slugify()
3. ✓ Number utilities:
   - formatNumber()
   - roundToDecimal()
4. ✓ Validation utilities:
   - isValidEmail()
   - isStrongPassword()
5. ✓ Unit tests for all utilities
6. ✓ TypeScript types

**File Path**: `src/utils/`

---

### T-015: Set Up Routing Structure
**Epic**: Foundation
**Effort**: Small (2h)
**Dependencies**: T-001, T-013
**Status**: ⬜

**Description**:
Configure React Router with all application routes.

**Acceptance Criteria**:
1. ✓ Install react-router-dom
2. ✓ Create route configuration
3. ✓ Define all routes:
   - / (redirect to /dashboard)
   - /login
   - /register
   - /onboarding
   - /dashboard
   - /meal-plan
   - /recipes
   - /recipes/:id
   - /favorites
   - /shopping-list
   - /settings
   - /settings/preferences
   - /settings/account
4. ✓ Protected routes (require auth)
5. ✓ 404 Not Found page
6. ✓ Route guard component
7. ✓ TypeScript route types

**File Path**: `src/App.tsx`, `src/routes/index.tsx`

---

**Week 1 Summary**:
- ✅ 15 tasks completed
- ✅ Design system with 30+ components
- ✅ Project infrastructure ready
- ✅ Ready to build features in Week 2

---

## Week 2: Authentication & Navigation

**Goal**: Implement user authentication and core navigation

**Deliverable**: Users can register, log in, and navigate the app

**Hours**: 40 hours

---

### T-016: Create Mock Data Structure & LocalStorage Service
**Epic**: E1 (Authentication)
**Effort**: Medium (3h)
**Dependencies**: T-001
**Status**: ⬜

**Description**:
Set up localStorage service layer and mock data structure for users.

**Acceptance Criteria**:
1. ✓ Create StorageService utility:
   - getItem(key)
   - setItem(key, value)
   - removeItem(key)
   - clear()
2. ✓ Handles JSON serialization/deserialization
3. ✓ Error handling (quota exceeded, etc.)
4. ✓ TypeScript types
5. ✓ Initialize default data structure on first load
6. ✓ Users array structure defined
7. ✓ Seed 2-3 test users

**File Paths**:
- `src/services/storage.service.ts`
- `src/mock/mockData.ts`

---

### T-017: Implement AuthService
**Epic**: E1 (Authentication)
**Effort**: Medium (4h)
**Dependencies**: T-016
**Status**: ⬜

**Description**:
Create authentication service with register, login, logout functionality.

**Acceptance Criteria**:
1. ✓ AuthService class/module with methods:
   - register(email, password, name)
   - login(email, password)
   - logout()
   - getCurrentUser()
   - isAuthenticated()
   - updateUser(user)
2. ✓ Password hashing (mock - use simple hash for prototype)
3. ✓ JWT token generation (mock)
4. ✓ Token storage in localStorage
5. ✓ Email uniqueness check
6. ✓ Password strength validation
7. ✓ Error handling (user not found, wrong password, etc.)
8. ✓ TypeScript types (User, AuthResponse, etc.)
9. ✓ Unit tests

**File Path**: `src/services/auth.service.ts`

---

### T-018: Create AuthContext & useAuth Hook
**Epic**: E1 (Authentication)
**Effort**: Medium (3h)
**Dependencies**: T-017
**Status**: ⬜

**Description**:
Implement React Context for global auth state.

**Acceptance Criteria**:
1. ✓ AuthContext with state:
   - user (current user object or null)
   - isAuthenticated (boolean)
   - isLoading (boolean)
2. ✓ AuthProvider component wraps app
3. ✓ useAuth hook:
   - login(email, password)
   - register(email, password, name)
   - logout()
   - Access to user and isAuthenticated
4. ✓ Initialize auth state on mount (check localStorage)
5. ✓ Auto-logout on token expiry (future enhancement - skip for now)
6. ✓ TypeScript types

**File Paths**:
- `src/context/AuthContext.tsx`
- `src/hooks/useAuth.ts`

---

### T-019: Build Registration Page (US-1.1)
**Epic**: E1 (Authentication)
**Story**: US-1.1
**Effort**: Large (4h)
**Dependencies**: T-004, T-018
**Status**: ⬜

**Description**:
Create registration page with form validation and password strength indicator.

**Acceptance Criteria**:
1. ✓ Registration form with:
   - Name input (optional)
   - Email input
   - Password input
   - Confirm password input
2. ✓ Form validation using React Hook Form + Zod:
   - Email format
   - Password strength (min 8 chars, 1 uppercase, 1 number)
   - Passwords match
3. ✓ Password strength indicator (Weak/Medium/Strong)
4. ✓ Show/hide password toggle
5. ✓ Submit button (disabled if invalid)
6. ✓ Error messages displayed clearly
7. ✓ Loading state during registration
8. ✓ Success: redirect to onboarding
9. ✓ Link to login: "Already have an account?"
10. ✓ Responsive design
11. ✓ Accessible (labels, aria attributes)

**File Path**: `src/components/pages/Register/Register.tsx`

---

### T-020: Build Login Page (US-1.2)
**Epic**: E1 (Authentication)
**Story**: US-1.2
**Effort**: Medium (3h)
**Dependencies**: T-004, T-018
**Status**: ⬜

**Description**:
Create login page with email/password form.

**Acceptance Criteria**:
1. ✓ Login form with:
   - Email input
   - Password input
   - "Remember me" checkbox
2. ✓ Form validation (email format, required fields)
3. ✓ Submit button
4. ✓ Error message for invalid credentials
5. ✓ Loading state during login
6. ✓ Success: redirect to dashboard
7. ✓ "Forgot password?" link (placeholder - future enhancement)
8. ✓ Link to register: "Don't have an account?"
9. ✓ Responsive design
10. ✓ Accessible

**File Path**: `src/components/pages/Login/Login.tsx`

---

### T-021: Build Onboarding Tutorial (US-1.3)
**Epic**: E1 (Authentication)
**Story**: US-1.3
**Effort**: Large (4h)
**Dependencies**: T-011, T-018
**Status**: ⬜

**Description**:
Create multi-step onboarding tutorial modal.

**Acceptance Criteria**:
1. ✓ Onboarding modal with 4-5 screens:
   - Welcome
   - Plan your meals
   - Discover recipes
   - Generate shopping lists
   - Get AI suggestions
2. ✓ Each screen has:
   - Illustration (placeholder image)
   - Title
   - Description
   - Progress dots
3. ✓ Navigation:
   - Next button
   - Back button (disabled on first screen)
   - Skip button (all screens)
   - "Get Started" button (final screen)
4. ✓ Keyboard navigation (arrow keys, Enter, Escape)
5. ✓ Completion flag saved to user profile
6. ✓ Redirect to dashboard after completion
7. ✓ Option to replay from settings
8. ✓ Responsive
9. ✓ Accessible

**File Path**: `src/components/pages/Onboarding/Onboarding.tsx`

---

### T-022: Create Header Navigation (Organism)
**Epic**: Navigation
**Effort**: Medium (3h)
**Dependencies**: T-003, T-005, T-018
**Status**: ⬜

**Description**:
Build top header with logo, nav links, user menu.

**Acceptance Criteria**:
1. ✓ Header component with:
   - Logo (icon + text)
   - Navigation links (Dashboard, Meal Plan, Recipes, Shopping List)
   - User avatar dropdown
   - Notification icon (optional)
2. ✓ Active link highlighted
3. ✓ User dropdown menu:
   - Profile
   - Settings
   - Logout
4. ✓ Responsive: Hide nav links on mobile (hamburger menu)
5. ✓ Sticky header (stays at top on scroll)
6. ✓ Logout functionality
7. ✓ TypeScript props

**File Path**: `src/components/organisms/Header/Header.tsx`

---

### T-023: Create Sidebar Navigation (Organism)
**Epic**: Navigation
**Effort**: Medium (3h)
**Dependencies**: T-003, T-005, T-018
**Status**: ⬜

**Description**:
Build sidebar navigation for desktop.

**Acceptance Criteria**:
1. ✓ Sidebar component with:
   - Logo at top
   - Navigation links with icons
   - Active link highlighted
   - Logout button at bottom
2. ✓ Links:
   - Dashboard
   - Meal Plan
   - Recipes
   - Shopping List
   - Favorites
   - Settings
3. ✓ Fixed position (left side)
4. ✓ Hidden on mobile/tablet
5. ✓ TypeScript props

**File Path**: `src/components/organisms/Sidebar/Sidebar.tsx`

---

### T-024: Create Bottom Navigation (Mobile - Organism)
**Epic**: Navigation
**Effort**: Small (2h)
**Dependencies**: T-003, T-005
**Status**: ⬜

**Description**:
Build bottom navigation bar for mobile devices.

**Acceptance Criteria**:
1. ✓ Bottom nav with 5 links:
   - Home (Dashboard)
   - Plan (Meal Plan)
   - Recipes
   - List (Shopping List)
   - Profile
2. ✓ Icons + labels
3. ✓ Active link highlighted
4. ✓ Fixed at bottom
5. ✓ Only visible on mobile/tablet (<1024px)
6. ✓ TypeScript props

**File Path**: `src/components/organisms/BottomNav/BottomNav.tsx`

---

### T-025: Implement Protected Route Guard
**Epic**: Navigation
**Effort**: Small (2h)
**Dependencies**: T-018
**Status**: ⬜

**Description**:
Create route guard component to protect authenticated routes.

**Acceptance Criteria**:
1. ✓ ProtectedRoute component
2. ✓ Checks if user is authenticated
3. ✓ If authenticated: render children
4. ✓ If not authenticated: redirect to /login
5. ✓ Loading state while checking auth
6. ✓ TypeScript types

**File Path**: `src/components/ProtectedRoute.tsx`

---

### T-026: Create Dashboard Page (Placeholder)
**Epic**: Navigation
**Effort**: Small (2h)
**Dependencies**: T-013, T-022, T-023, T-024, T-025
**Status**: ⬜

**Description**:
Create basic dashboard page structure (full implementation in Week 7).

**Acceptance Criteria**:
1. ✓ Dashboard page component
2. ✓ Uses DashboardLayout
3. ✓ Shows heading: "Dashboard"
4. ✓ Placeholder content: "Welcome, [User Name]!"
5. ✓ Quick stats placeholder (3-4 stat cards)
6. ✓ Protected route
7. ✓ Responsive

**File Path**: `src/components/pages/Dashboard/Dashboard.tsx`

---

### T-027: Create Placeholder Pages (Meal Plan, Recipes, Shopping List)
**Epic**: Navigation
**Effort**: Small (2h)
**Dependencies**: T-013, T-025
**Status**: ⬜

**Description**:
Create placeholder pages for main features (implement fully in later weeks).

**Acceptance Criteria**:
1. ✓ MealPlan page (placeholder)
2. ✓ Recipes page (placeholder)
3. ✓ ShoppingList page (placeholder)
4. ✓ All use DashboardLayout
5. ✓ All protected routes
6. ✓ Show page title
7. ✓ Show "Coming soon" message

**File Paths**:
- `src/components/pages/MealPlan/MealPlan.tsx`
- `src/components/pages/Recipes/Recipes.tsx`
- `src/components/pages/ShoppingList/ShoppingList.tsx`

---

### T-028: Test End-to-End Auth Flow
**Epic**: E1 (Authentication)
**Effort**: Small (2h)
**Dependencies**: T-019, T-020, T-021, T-025
**Status**: ⬜

**Description**:
Manually test complete authentication flow.

**Acceptance Criteria**:
1. ✓ Test registration:
   - Valid data → Success → Redirects to onboarding
   - Invalid email → Error shown
   - Weak password → Error shown
   - Passwords don't match → Error shown
   - Email already exists → Error shown
2. ✓ Test onboarding:
   - Can navigate through all screens
   - Skip button works
   - Get Started redirects to dashboard
3. ✓ Test login:
   - Valid credentials → Success → Redirects to dashboard
   - Invalid credentials → Error shown
   - "Remember me" persists session
4. ✓ Test logout:
   - Clears session
   - Redirects to login
5. ✓ Test protected routes:
   - Unauthenticated user redirected to login
6. ✓ Test session persistence:
   - Refresh page → User still logged in

---

**Week 2 Summary**:
- ✅ 13 tasks completed
- ✅ Authentication system functional
- ✅ Navigation structure in place
- ✅ Users can register, log in, navigate app
- ✅ Ready to build meal planning in Week 3

---

## Week 3: Meal Planning Core

**Goal**: Implement weekly meal planning calendar with add/remove meals

**Deliverable**: Users can plan full week of meals

**Hours**: 40 hours

---

### T-029: Create Mock Recipe Data
**Epic**: E2 (Meal Planning)
**Effort**: Medium (3h)
**Dependencies**: T-016
**Status**: ⬜

**Description**:
Generate comprehensive mock recipe dataset (50-100 recipes).

**Acceptance Criteria**:
1. ✓ Create 50+ recipes with:
   - ID, name, description
   - Image URLs (placeholder or free stock photos)
   - Category (Breakfast, Lunch, Dinner, Snacks, Desserts)
   - Prep time, cook time, servings
   - Difficulty level
   - Ingredients array (name, quantity, unit)
   - Instructions array (steps)
   - Nutrition info (calories, protein, carbs, fat)
   - Tags (Vegan, Keto, Gluten-Free, etc.)
   - Rating (0-5)
2. ✓ Diverse recipes (various cuisines, diets)
3. ✓ TypeScript Recipe type
4. ✓ Store in `src/mock/mockRecipes.ts`
5. ✓ Load into localStorage on app init

**File Path**: `src/mock/mockRecipes.ts`

---

### T-030: Implement MealPlanService
**Epic**: E2 (Meal Planning)
**Effort**: Medium (4h)
**Dependencies**: T-016, T-029
**Status**: ⬜

**Description**:
Create service for meal plan CRUD operations.

**Acceptance Criteria**:
1. ✓ MealPlanService with methods:
   - getMealPlan(userId, weekStartDate)
   - saveMealPlan(mealPlan)
   - addMealToSlot(userId, date, mealType, recipeId)
   - removeMealFromSlot(userId, date, mealType)
   - copyDay(userId, sourceDate, targetDates)
   - clearPlan(userId, options)
2. ✓ Data structure: MealPlan type
   - id, userId, weekStart
   - meals: { [dayOfWeek]: { breakfast, lunch, dinner, snacks } }
3. ✓ localStorage persistence (keyed by user + week)
4. ✓ Error handling
5. ✓ TypeScript types
6. ✓ Unit tests

**File Path**: `src/services/mealPlan.service.ts`

---

### T-031: Create MealPlanCalendar Component (US-2.1)
**Epic**: E2 (Meal Planning)
**Story**: US-2.1
**Effort**: Large (5h)
**Dependencies**: T-010, T-030
**Status**: ⬜

**Description**:
Build weekly calendar view with 7 days and meal slots.

**Acceptance Criteria**:
1. ✓ Calendar displays 7 days (Sunday-Saturday)
2. ✓ Current week by default
3. ✓ Week navigation (prev/next arrows, "This Week" button)
4. ✓ Week range displayed: "Week of Oct 12 - Oct 18"
5. ✓ Each day shows:
   - Day name + date
   - Current day highlighted
   - Meal slots: Breakfast, Lunch, Dinner, Snacks
6. ✓ Uses MealSlot component
7. ✓ Fetch meal plan data on mount and week change
8. ✓ Loading state
9. ✓ Responsive layout (grid on desktop, stack on mobile)
10. ✓ TypeScript props

**File Path**: `src/components/organisms/MealPlanCalendar/MealPlanCalendar.tsx`

---

### T-032: Create Recipe Browser Modal (US-2.2 Part 1)
**Epic**: E2 (Meal Planning)
**Story**: US-2.2
**Effort**: Large (4h)
**Dependencies**: T-009, T-011, T-029
**Status**: ⬜

**Description**:
Build modal for browsing and selecting recipes to add to meal plan.

**Acceptance Criteria**:
1. ✓ Modal with:
   - Header: "Add Recipe to [Day] [Meal]"
   - Search bar
   - Category filters (tabs)
   - Recipe grid (uses RecipeCard components)
   - Pagination or infinite scroll
2. ✓ Search functionality (real-time, debounced)
3. ✓ Category filtering
4. ✓ Recipe click: Shows preview or immediately adds
5. ✓ "Add" button confirms selection
6. ✓ Close modal after adding
7. ✓ Loading state
8. ✓ TypeScript props (day, mealType, onAdd, onClose)

**File Path**: `src/components/organisms/RecipeBrowserModal/RecipeBrowserModal.tsx`

---

### T-033: Implement Add Meal to Slot (US-2.2 Part 2)
**Epic**: E2 (Meal Planning)
**Story**: US-2.2
**Effort**: Medium (3h)
**Dependencies**: T-031, T-032
**Status**: ⬜

**Description**:
Connect MealSlot clicks to RecipeBrowserModal and handle adding meals.

**Acceptance Criteria**:
1. ✓ Clicking empty MealSlot opens RecipeBrowserModal
2. ✓ Pass day and mealType to modal
3. ✓ User selects recipe → Calls MealPlanService.addMealToSlot()
4. ✓ Optimistic UI update (show meal immediately)
5. ✓ Success toast: "Recipe added to [Day] [Meal]"
6. ✓ If slot already filled:
   - Confirmation modal: "Replace existing meal?"
   - Replace or cancel
7. ✓ Error handling (show error toast)
8. ✓ Calendar re-renders with new meal

---

### T-034: Implement Remove Meal from Slot
**Epic**: E2 (Meal Planning)
**Effort**: Small (2h)
**Dependencies**: T-031
**Status**: ⬜

**Description**:
Add remove functionality to meal slots.

**Acceptance Criteria**:
1. ✓ Filled MealSlot shows remove button (X icon)
2. ✓ Clicking X:
   - Confirmation modal: "Remove [Recipe] from [Day] [Meal]?"
   - Confirm or cancel
3. ✓ Confirming calls MealPlanService.removeMealFromSlot()
4. ✓ Optimistic UI update
5. ✓ Success toast: "Meal removed"
6. ✓ Undo option (5-second window)
7. ✓ Error handling

---

### T-035: Implement Drag-and-Drop for Recipes (US-2.2 Part 3 - Optional)
**Epic**: E2 (Meal Planning)
**Story**: US-2.2
**Effort**: Large (5h)
**Dependencies**: T-031, T-032
**Status**: ⬜

**Description**:
Add drag-and-drop functionality to add recipes to meal slots.

**Acceptance Criteria**:
1. ✓ Install and configure react-beautiful-dnd or react-dnd
2. ✓ Make RecipeCards draggable (from browser modal, favorites, suggestions)
3. ✓ Make MealSlots droppable
4. ✓ Visual feedback during drag (ghost image, highlight drop zones)
5. ✓ Drop adds recipe to slot
6. ✓ Same logic as click-to-add (replace confirmation if filled)
7. ✓ Works on desktop only (disable on mobile - use click)
8. ✓ Accessible (keyboard drag with Space/Enter)

**Note**: This task is optional for prototype. If time-constrained, skip and rely on click-to-add only.

---

### T-036: Create Mock AI Suggestion Algorithm (US-2.3 Part 1)
**Epic**: E2 (Meal Planning)
**Story**: US-2.3
**Effort**: Medium (3h)
**Dependencies**: T-029
**Status**: ⬜

**Description**:
Implement mock AI algorithm for personalized recipe suggestions.

**Acceptance Criteria**:
1. ✓ MockAIService.generateSuggestions(user, mealPlan, recipes)
2. ✓ Scoring algorithm considers:
   - Dietary preference match: +10 points
   - Similar to favorites (cuisine/ingredients): +5 points
   - Not recently planned: +3 points
   - Time-appropriate (breakfast in AM): +2 points
   - Random factor for variety: +0 to 2 points
3. ✓ Returns top 8 recipes sorted by score
4. ✓ Each suggestion includes "why" explanation:
   - "Based on your Keto preference"
   - "Similar to your favorites"
   - "Quick weeknight meal"
5. ✓ TypeScript types (SuggestionResult)
6. ✓ Unit tests

**File Path**: `src/services/mockAI.service.ts`

---

### T-037: Build Meal Suggestions Widget (US-2.3 Part 2)
**Epic**: E2 (Meal Planning)
**Story**: US-2.3
**Effort**: Medium (3h)
**Dependencies**: T-009, T-036
**Status**: ⬜

**Description**:
Create suggestions widget showing AI-recommended recipes.

**Acceptance Criteria**:
1. ✓ MealSuggestions component
2. ✓ Displays 5-8 recipe cards (compact)
3. ✓ Each card shows:
   - Recipe thumbnail, name, prep time
   - "Why this?" tooltip with explanation
   - "+ Add to Plan" button
4. ✓ "Refresh Suggestions" button
5. ✓ Clicking "+ Add to Plan" opens day/meal selector modal
6. ✓ Adding meal updates calendar
7. ✓ Suggestions update when:
   - User clicks refresh
   - Preferences change
   - Meal plan changes (optional - may be heavy)
8. ✓ Loading state
9. ✓ TypeScript props

**File Path**: `src/components/molecules/MealSuggestions/MealSuggestions.tsx`

---

### T-038: Integrate Suggestions into Meal Plan Page (US-2.3 Part 3)
**Epic**: E2 (Meal Planning)
**Story**: US-2.3
**Effort**: Small (2h)
**Dependencies**: T-031, T-037
**Status**: ⬜

**Description**:
Add suggestions widget to Meal Plan page sidebar or bottom.

**Acceptance Criteria**:
1. ✓ Suggestions widget visible on Meal Plan page
2. ✓ Position: Sidebar (desktop) or below calendar (mobile)
3. ✓ Fetches suggestions on page load
4. ✓ Updates when user refreshes
5. ✓ Integrates with meal plan (add meal functionality)
6. ✓ Responsive layout

---

### T-039: Implement Copy Day Functionality (US-2.4)
**Epic**: E2 (Meal Planning)
**Story**: US-2.4
**Effort**: Medium (3h)
**Dependencies**: T-031
**Status**: ⬜

**Description**:
Allow users to copy an entire day's meals to other days.

**Acceptance Criteria**:
1. ✓ Each calendar day has "Copy Day" button (icon or menu)
2. ✓ Clicking opens "Copy Day" modal:
   - Title: "Copy [Day]'s meals to..."
   - Checkboxes for all other days
   - Radio buttons: "Replace existing" or "Skip if exists"
   - "Copy" and "Cancel" buttons
3. ✓ User selects target days
4. ✓ Clicking "Copy" calls MealPlanService.copyDay()
5. ✓ If "Replace" selected:
   - Warning if target days have meals: "This will replace X meals"
6. ✓ Optimistic UI update
7. ✓ Success toast: "Meals copied to 3 days"
8. ✓ Undo option (5 seconds)
9. ✓ Error handling

---

### T-040: Test Meal Planning End-to-End
**Epic**: E2 (Meal Planning)
**Effort**: Small (2h)
**Dependencies**: T-031 to T-039
**Status**: ⬜

**Description**:
Manually test complete meal planning workflow.

**Acceptance Criteria**:
1. ✓ Test adding meals to all slots for full week
2. ✓ Test removing meals
3. ✓ Test drag-and-drop (if implemented)
4. ✓ Test meal suggestions (add suggested recipe)
5. ✓ Test copy day (various scenarios)
6. ✓ Test week navigation
7. ✓ Test data persistence (refresh page, meal plan still there)
8. ✓ Test responsive design (mobile, tablet, desktop)
9. ✓ Test accessibility (keyboard navigation, screen reader)
10. ✓ Fix any bugs found

---

**Week 3 Summary**:
- ✅ 12 tasks completed
- ✅ Meal planning core functional
- ✅ Users can plan full week of meals
- ✅ AI suggestions working
- ✅ Ready to build recipe discovery in Week 4

---

## Week 4: Recipe Discovery

**Goal**: Build recipe catalog with search, filters, favorites, and detail pages

**Deliverable**: Users can browse, search, and save recipes

**Hours**: 40 hours

---

### T-041: Implement RecipeService
**Epic**: E3 (Recipe Discovery)
**Effort**: Medium (3h)
**Dependencies**: T-016, T-029
**Status**: ⬜

**Description**:
Create service for recipe operations (fetch, search, filter, favorite).

**Acceptance Criteria**:
1. ✓ RecipeService with methods:
   - getRecipes(filters, sort, pagination)
   - getRecipeById(id)
   - searchRecipes(query, filters)
   - filterRecipes(criteria)
   - toggleFavorite(userId, recipeId)
   - getFavorites(userId)
2. ✓ Search logic (fuzzy matching on name, ingredients, cuisine)
3. ✓ Filter logic (category, dietary tags, prep time)
4. ✓ Sort logic (popular, quick, newest, highest rated)
5. ✓ Favorites stored in user object
6. ✓ TypeScript types
7. ✓ Unit tests

**File Path**: `src/services/recipe.service.ts`

---

### T-042: Create Recipe Catalog Page Layout (US-3.1 Part 1)
**Epic**: E3 (Recipe Discovery)
**Story**: US-3.1
**Effort**: Medium (3h)
**Dependencies**: T-013, T-041
**Status**: ⬜

**Description**:
Build recipe catalog page with grid layout and filter sidebar.

**Acceptance Criteria**:
1. ✓ RecipeCatalog page component
2. ✓ Layout:
   - Filter sidebar (left, collapsible on mobile)
   - Main content area (recipe grid)
3. ✓ Header with:
   - Page title: "Browse Recipes"
   - Result count: "Showing 24 of 97 recipes"
   - Sort dropdown
4. ✓ Recipe grid (uses RecipeCard components)
5. ✓ Responsive: 1 column (mobile), 2 (tablet), 3-4 (desktop)
6. ✓ Loading state (skeleton cards)
7. ✓ Empty state: "No recipes found"
8. ✓ Pagination or infinite scroll
9. ✓ TypeScript

**File Path**: `src/components/pages/RecipeCatalog/RecipeCatalog.tsx`

---

### T-043: Implement Category Filtering (US-3.1 Part 2)
**Epic**: E3 (Recipe Discovery)
**Story**: US-3.1
**Effort**: Medium (3h)
**Dependencies**: T-042
**Status**: ⬜

**Description**:
Add category tabs and dietary filters to recipe catalog.

**Acceptance Criteria**:
1. ✓ Category tabs at top:
   - All, Breakfast, Lunch, Dinner, Snacks, Desserts
2. ✓ Clicking category filters recipes
3. ✓ Active category highlighted
4. ✓ Dietary filter panel (sidebar) with checkboxes:
   - Vegetarian, Vegan, Gluten-Free, Dairy-Free, Keto, etc.
5. ✓ Multiple filters can be applied (AND logic)
6. ✓ Filter badge: "Vegan • Gluten-Free (2 filters)"
7. ✓ "Clear Filters" button
8. ✓ Filters update URL query params (shareable URLs)
9. ✓ Results update in real-time
10. ✓ Mobile: Filter panel in modal/drawer

---

### T-044: Implement Recipe Search (US-3.2)
**Epic**: E3 (Recipe Discovery)
**Story**: US-3.2
**Effort**: Medium (3h)
**Dependencies**: T-007, T-041, T-042
**Status**: ⬜

**Description**:
Add search bar with autocomplete to recipe catalog.

**Acceptance Criteria**:
1. ✓ Search bar at top of catalog page
2. ✓ Placeholder: "Search by recipe name, ingredient, or cuisine..."
3. ✓ Real-time search (debounced 300ms)
4. ✓ Matches: recipe name, ingredients, cuisine
5. ✓ Autocomplete dropdown (optional - shows top 5 suggestions)
6. ✓ Search works with category/dietary filters
7. ✓ Result count updates: "12 results for 'chicken'"
8. ✓ Clear search button (X)
9. ✓ Empty state if no results
10. ✓ URL query param for search term

---

### T-045: Implement Sort Functionality (US-3.1 Part 3)
**Epic**: E3 (Recipe Discovery)
**Story**: US-3.1
**Effort**: Small (2h)
**Dependencies**: T-041, T-042
**Status**: ⬜

**Description**:
Add sort dropdown to recipe catalog.

**Acceptance Criteria**:
1. ✓ Sort dropdown with options:
   - Popular (default)
   - Quick (shortest prep time)
   - Newest
   - Highest Rated
2. ✓ Selecting option re-sorts recipes
3. ✓ Results update immediately
4. ✓ Sort persists in URL query param
5. ✓ TypeScript

---

### T-046: Create Recipe Detail Page (US-3.3 Part 1)
**Epic**: E3 (Recipe Discovery)
**Story**: US-3.3
**Effort**: Large (5h)
**Dependencies**: T-003, T-005, T-041
**Status**: ⬜

**Description**:
Build detailed recipe page with ingredients, instructions, and nutrition.

**Acceptance Criteria**:
1. ✓ RecipeDetail page (route: `/recipes/:id`)
2. ✓ Fetch recipe by ID from RecipeService
3. ✓ Layout:
   - Hero image (full-width)
   - Recipe header (name, description, rating)
   - Meta info (prep time, cook time, servings, difficulty)
   - Tags (dietary, cuisine)
   - Action buttons (Add to Plan, Favorite, Share)
4. ✓ Ingredients section (2-column on desktop):
   - List with checkboxes (optional - for cooking mode)
   - Serving adjuster (dropdown)
5. ✓ Instructions section:
   - Numbered steps
6. ✓ Nutrition info (per serving):
   - Calories, protein, carbs, fat
7. ✓ Breadcrumbs: Home > Recipes > [Recipe Name]
8. ✓ Loading state
9. ✓ 404 if recipe not found
10. ✓ Responsive design

**File Path**: `src/components/pages/RecipeDetail/RecipeDetail.tsx`

---

### T-047: Implement Serving Size Adjustment (US-3.5)
**Epic**: E3 (Recipe Discovery)
**Story**: US-3.5
**Effort**: Medium (4h)
**Dependencies**: T-046
**Status**: ⬜

**Description**:
Add serving adjuster that recalculates ingredient quantities.

**Acceptance Criteria**:
1. ✓ Serving adjuster on recipe detail page:
   - Dropdown (1-12 servings) OR +/- buttons
2. ✓ Default: Original recipe servings (or user's household size)
3. ✓ Changing servings:
   - Recalculates all ingredient quantities proportionally
   - Example: 2 cups → 1 cup (for half servings)
4. ✓ Handle fractions:
   - Display as common fractions (1/4, 1/2, 3/4)
   - Use fraction utility function
5. ✓ Nutrition info recalculates per serving
6. ✓ "Reset to Original" button
7. ✓ Changes apply immediately (no page reload)
8. ✓ Unit conversions (optional - e.g., 16 tbsp → 1 cup)
9. ✓ TypeScript

**Technical Notes**:
- Create `recalculateIngredients` utility
- Handle whole items (e.g., "2 eggs" → "1 egg")

---

### T-048: Implement Favorite Recipes (US-3.4)
**Epic**: E3 (Recipe Discovery)
**Story**: US-3.4
**Effort**: Medium (3h)
**Dependencies**: T-009, T-041
**Status**: ⬜

**Description**:
Add favorite/unfavorite functionality to recipe cards and detail page.

**Acceptance Criteria**:
1. ✓ Heart icon on RecipeCard and RecipeDetail page
2. ✓ Icon states:
   - Outlined (not favorited)
   - Filled (favorited)
3. ✓ Clicking toggles favorite
4. ✓ Calls RecipeService.toggleFavorite()
5. ✓ Optimistic UI update
6. ✓ Toast notification:
   - "Added to favorites"
   - "Removed from favorites"
7. ✓ Icon animation on click (scale up)
8. ✓ Favorites persist in localStorage (user profile)
9. ✓ TypeScript

---

### T-049: Create Favorites Page
**Epic**: E3 (Recipe Discovery)
**Story**: US-3.4
**Effort**: Small (2h)
**Dependencies**: T-042, T-048
**Status**: ⬜

**Description**:
Build favorites page showing user's saved recipes.

**Acceptance Criteria**:
1. ✓ Favorites page (route: `/favorites`)
2. ✓ Layout similar to recipe catalog:
   - Recipe grid
   - Filters and sort (reuse components)
3. ✓ Fetch favorited recipes from RecipeService
4. ✓ Recipe count: "You have 12 favorites"
5. ✓ Empty state: "No favorites yet. Start adding!"
6. ✓ Quick add to meal plan from favorites
7. ✓ Remove from favorites (heart icon toggle)
8. ✓ Responsive
9. ✓ TypeScript

**File Path**: `src/components/pages/Favorites/Favorites.tsx`

---

### T-050: Add Related Recipes Section (US-3.3 Part 2)
**Epic**: E3 (Recipe Discovery)
**Story**: US-3.3
**Effort**: Small (2h)
**Dependencies**: T-046
**Status**: ⬜

**Description**:
Show related recipes at bottom of recipe detail page.

**Acceptance Criteria**:
1. ✓ "You might also like..." section at bottom
2. ✓ Shows 3-4 similar recipes
3. ✓ Similarity based on:
   - Same category
   - Similar tags
   - Same cuisine
4. ✓ Horizontal scroll on mobile
5. ✓ Clicking recipe navigates to detail page
6. ✓ TypeScript

---

### T-051: Integrate Recipes with Meal Plan (Add to Plan Button)
**Epic**: E3 (Recipe Discovery)
**Effort**: Medium (3h)
**Dependencies**: T-046, T-048, T-030
**Status**: ⬜

**Description**:
Add "Add to Plan" button on recipe detail and catalog pages.

**Acceptance Criteria**:
1. ✓ "Add to Meal Plan" button on:
   - Recipe detail page
   - Recipe card hover/menu (optional)
   - Favorites page
2. ✓ Clicking opens day/meal selector modal
3. ✓ User selects day and meal type
4. ✓ Adds recipe to meal plan
5. ✓ Success toast: "Added to [Day] [Meal]"
6. ✓ Meal plan updates (if meal plan page open)
7. ✓ Error handling
8. ✓ TypeScript

---

### T-052: Test Recipe Discovery End-to-End
**Epic**: E3 (Recipe Discovery)
**Effort**: Small (2h)
**Dependencies**: T-041 to T-051
**Status**: ⬜

**Description**:
Manually test complete recipe discovery workflow.

**Acceptance Criteria**:
1. ✓ Test browsing recipes (all categories)
2. ✓ Test filtering by dietary restrictions
3. ✓ Test search (various queries)
4. ✓ Test sorting (all options)
5. ✓ Test recipe detail page (all sections render)
6. ✓ Test serving adjustment (quantities update)
7. ✓ Test favoriting/unfavoriting
8. ✓ Test favorites page
9. ✓ Test adding recipe to meal plan from detail/catalog
10. ✓ Test responsive design (mobile, tablet, desktop)
11. ✓ Test accessibility
12. ✓ Fix any bugs found

---

**Week 4 Summary**:
- ✅ 12 tasks completed
- ✅ Recipe discovery fully functional
- ✅ Users can browse, search, filter, favorite recipes
- ✅ Ready to build shopping lists in Week 5

---

## Week 5: Shopping Lists

**Goal**: Implement shopping list generation with categorization and check-off

**Deliverable**: Users can generate and manage shopping lists

**Hours**: 40 hours

---

### T-053: Implement ShoppingListService
**Epic**: E4 (Shopping Lists)
**Effort**: Large (5h)
**Dependencies**: T-016, T-030
**Status**: ⬜

**Description**:
Create service for shopping list operations including ingredient consolidation.

**Acceptance Criteria**:
1. ✓ ShoppingListService with methods:
   - generateFromMealPlan(mealPlan)
   - getShoppingList(userId, mealPlanId)
   - addItem(listId, item)
   - updateItem(listId, itemId, updates)
   - removeItem(listId, itemId)
   - checkItem(listId, itemId, checked)
   - categorizeIngredients(ingredients)
   - consolidateIngredients(ingredients)
2. ✓ Consolidation logic:
   - Combines duplicate ingredients
   - Handles different units (cups, tbsp, etc.)
   - Sums quantities
3. ✓ Categorization logic:
   - Maps ingredients to categories (Produce, Dairy, Meat, etc.)
   - Uses ingredient name matching
4. ✓ TypeScript types (ShoppingList, ShoppingListItem)
5. ✓ Unit tests

**File Path**: `src/services/shoppingList.service.ts`

---

### T-054: Create Utility: Ingredient Consolidator
**Epic**: E4 (Shopping Lists)
**Effort**: Medium (4h)
**Dependencies**: None
**Status**: ⬜

**Description**:
Build utility function to consolidate duplicate ingredients with unit conversion.

**Acceptance Criteria**:
1. ✓ consolidateIngredients(ingredients[]) function
2. ✓ Groups ingredients by name (case-insensitive)
3. ✓ Sums quantities:
   - "2 cups milk" + "1 cup milk" = "3 cups milk"
   - "1 lb chicken" + "0.5 lb chicken" = "1.5 lb chicken"
4. ✓ Handles unit conversions (optional but nice):
   - "3 tbsp" + "1 tbsp" = "1/4 cup" (or "4 tbsp")
5. ✓ Handles whole items:
   - "2 eggs" + "3 eggs" = "5 eggs"
6. ✓ Handles items without quantities:
   - "salt" + "salt" = "salt"
7. ✓ Returns consolidated list
8. ✓ TypeScript types
9. ✓ Unit tests

**File Path**: `src/utils/ingredientConsolidator.ts`

---

### T-055: Create Utility: Ingredient Categorizer
**Epic**: E4 (Shopping Lists)
**Effort**: Medium (3h)
**Dependencies**: None
**Status**: ⬜

**Description**:
Build utility to categorize ingredients by store section.

**Acceptance Criteria**:
1. ✓ categorizeIngredient(ingredientName) function
2. ✓ Categories:
   - Produce
   - Dairy
   - Meat & Seafood
   - Pantry
   - Frozen
   - Bakery
   - Other
3. ✓ Matching logic:
   - Keyword matching (e.g., "chicken" → Meat)
   - Use category mapping object
4. ✓ Default to "Other" if no match
5. ✓ TypeScript types
6. ✓ Unit tests

**File Path**: `src/utils/ingredientCategorizer.ts`

---

### T-056: Create ShoppingList Page Layout (US-4.2 Part 1)
**Epic**: E4 (Shopping Lists)
**Story**: US-4.2
**Effort**: Medium (3h)
**Dependencies**: T-013
**Status**: ⬜

**Description**:
Build shopping list page with category sections and progress bar.

**Acceptance Criteria**:
1. ✓ ShoppingList page component
2. ✓ Layout:
   - Header with title, progress bar, action buttons
   - Category sections (collapsible accordions)
   - Add item button
3. ✓ Progress bar: "12/25 items checked (48%)"
4. ✓ Action buttons:
   - "Generate New List"
   - "Uncheck All"
   - "Share" (future - placeholder)
5. ✓ Empty state: "No shopping list. Generate from meal plan"
6. ✓ Loading state
7. ✓ Responsive
8. ✓ TypeScript

**File Path**: `src/components/pages/ShoppingList/ShoppingList.tsx`

---

### T-057: Create Category Section Component (US-4.2 Part 2)
**Epic**: E4 (Shopping Lists)
**Story**: US-4.2
**Effort**: Medium (3h)
**Dependencies**: T-010, T-056
**Status**: ⬜

**Description**:
Build collapsible category section showing shopping items.

**Acceptance Criteria**:
1. ✓ CategorySection component
2. ✓ Header with:
   - Category icon
   - Category name
   - Item count badge: "Produce (8 items)"
   - Checked count: "3/8 checked"
   - Expand/collapse icon
3. ✓ Clicking header toggles expand/collapse
4. ✓ Collapsed: Shows summary only
5. ✓ Expanded: Shows list of ShoppingListItem components
6. ✓ Visual indicator when all items checked (green highlight)
7. ✓ TypeScript props

**File Path**: `src/components/molecules/CategorySection/CategorySection.tsx`

---

### T-058: Implement Generate Shopping List (US-4.1)
**Epic**: E4 (Shopping Lists)
**Story**: US-4.1
**Effort**: Medium (4h)
**Dependencies**: T-053, T-054, T-055, T-056
**Status**: ⬜

**Description**:
Add "Generate Shopping List" functionality from meal plan.

**Acceptance Criteria**:
1. ✓ "Generate Shopping List" button on Meal Plan page
2. ✓ Enabled only if meal plan has at least 1 meal
3. ✓ Clicking:
   - Shows progress modal: "Generating shopping list..."
   - Calls ShoppingListService.generateFromMealPlan()
   - Consolidates ingredients
   - Categorizes items
   - Creates shopping list
4. ✓ If list already exists:
   - Confirmation modal: "Replace or merge?"
   - Replace: Deletes old, creates new
   - Merge: Adds new items to existing
5. ✓ Success: Redirects to shopping list page
6. ✓ Success toast: "Shopping list created with 25 items"
7. ✓ Error handling
8. ✓ TypeScript

---

### T-059: Implement Check Off Items (US-4.3)
**Epic**: E4 (Shopping Lists)
**Story**: US-4.3
**Effort**: Small (2h)
**Dependencies**: T-010, T-053
**Status**: ⬜

**Description**:
Add check-off functionality to shopping list items.

**Acceptance Criteria**:
1. ✓ Checkbox on each item
2. ✓ Clicking toggles checked state
3. ✓ Checked items:
   - Strikethrough text
   - Faded color
   - Checkmark icon
4. ✓ Checked items stay in place OR move to bottom (design choice)
5. ✓ Calls ShoppingListService.checkItem()
6. ✓ Optimistic UI update
7. ✓ Progress bar updates
8. ✓ Category progress updates
9. ✓ Changes persist to localStorage
10. ✓ Keyboard: Space bar toggles focused checkbox

---

### T-060: Implement Manually Add Items (US-4.4)
**Epic**: E4 (Shopping Lists)
**Story**: US-4.4
**Effort**: Medium (3h)
**Dependencies**: T-004, T-011, T-053
**Status**: ⬜

**Description**:
Add form to manually add items to shopping list.

**Acceptance Criteria**:
1. ✓ "Add Item" button at top of shopping list
2. ✓ Clicking opens "Add Item" modal/form:
   - Item name (required)
   - Quantity (optional)
   - Unit (dropdown - optional)
   - Category (dropdown - required)
   - Notes (optional)
3. ✓ Form validation (name and category required)
4. ✓ "Add" and "Cancel" buttons
5. ✓ Clicking "Add":
   - Calls ShoppingListService.addItem()
   - Item appears in correct category
   - Success toast
6. ✓ Duplicate detection (optional):
   - Warning if similar item exists
7. ✓ Form resets after adding (optional - for quick add)
8. ✓ TypeScript

---

### T-061: Implement Edit/Remove Items (US-4.5)
**Epic**: E4 (Shopping Lists)
**Story**: US-4.5
**Effort**: Medium (3h)
**Dependencies**: T-010, T-053, T-060
**Status**: ⬜

**Description**:
Add edit and delete functionality to shopping items.

**Acceptance Criteria**:
1. ✓ Each item has action icons (edit, delete)
2. ✓ Clicking Edit:
   - Opens edit form (same as Add Item form, pre-filled)
   - "Save" and "Cancel" buttons
3. ✓ Saving updates item
4. ✓ Item moves to new category if changed
5. ✓ Success toast: "Item updated"
6. ✓ Clicking Delete:
   - Confirmation modal: "Remove [item]?"
   - "Remove" and "Cancel" buttons
7. ✓ Confirming removes item
8. ✓ Undo toast (5 seconds): "Item removed. Undo?"
9. ✓ Undo restores item
10. ✓ TypeScript

---

### T-062: Implement Uncheck All & Bulk Actions
**Epic**: E4 (Shopping Lists)
**Effort**: Small (2h)
**Dependencies**: T-053, T-056
**Status**: ⬜

**Description**:
Add "Uncheck All" button and bulk delete functionality.

**Acceptance Criteria**:
1. ✓ "Uncheck All" button in header
2. ✓ Clicking:
   - Confirmation modal: "Uncheck all items?"
   - Unchecks all items
   - Success toast
3. ✓ Bulk select mode (optional):
   - Checkboxes to select multiple items
   - "Delete Selected" button
   - Confirmation before deleting
4. ✓ TypeScript

---

### T-063: Implement Share Shopping List (US-4.6 - Optional)
**Epic**: E4 (Shopping Lists)
**Story**: US-4.6
**Effort**: Medium (3h)
**Dependencies**: T-053, T-056
**Status**: ⬜

**Description**:
Add share functionality with read-only link.

**Acceptance Criteria**:
1. ✓ "Share" button in header
2. ✓ Clicking opens "Share List" modal:
   - "Copy Link" button
   - Email/SMS options (placeholders - future)
3. ✓ "Copy Link" generates unique URL
4. ✓ URL copied to clipboard
5. ✓ Success toast: "Link copied"
6. ✓ Shareable route: `/shared/:listId`
7. ✓ Shared view:
   - Read-only (no edit/delete)
   - Shows all items and categories
   - Message: "This is a shared list (view only)"
8. ✓ TypeScript

**Note**: This is optional for prototype. Skip if time-constrained.

---

### T-064: Test Shopping List End-to-End
**Epic**: E4 (Shopping Lists)
**Effort**: Small (2h)
**Dependencies**: T-053 to T-063
**Status**: ⬜

**Description**:
Manually test complete shopping list workflow.

**Acceptance Criteria**:
1. ✓ Test generating list from meal plan (full week)
2. ✓ Verify ingredient consolidation works correctly
3. ✓ Verify categorization is accurate
4. ✓ Test checking off items (progress updates)
5. ✓ Test manually adding items
6. ✓ Test editing items
7. ✓ Test deleting items (with undo)
8. ✓ Test uncheck all
9. ✓ Test replace vs merge when regenerating
10. ✓ Test share functionality (if implemented)
11. ✓ Test responsive design
12. ✓ Test accessibility
13. ✓ Fix any bugs found

---

**Week 5 Summary**:
- ✅ 12 tasks completed
- ✅ Shopping list fully functional
- ✅ Users can generate, manage, check off items
- ✅ Ready to build preferences in Week 6

---

## Week 6: User Preferences

**Goal**: Implement user preferences, allergies, and account management

**Deliverable**: Users can customize app to their dietary needs

**Hours**: 40 hours

---

### T-065: Create UserService
**Epic**: E5 (User Preferences)
**Effort**: Small (2h)
**Dependencies**: T-016
**Status**: ⬜

**Description**:
Create service for user profile and preferences operations.

**Acceptance Criteria**:
1. ✓ UserService with methods:
   - getUser(userId)
   - updateUser(userId, updates)
   - updatePreferences(userId, preferences)
   - updatePassword(userId, currentPassword, newPassword)
   - deleteAccount(userId)
   - exportData(userId)
2. ✓ TypeScript types (UserPreferences, etc.)
3. ✓ Unit tests

**File Path**: `src/services/user.service.ts`

---

### T-066: Create Settings Page Layout
**Epic**: E5 (User Preferences)
**Effort**: Small (2h)
**Dependencies**: T-013, T-065
**Status**: ⬜

**Description**:
Build settings page with navigation tabs/sections.

**Acceptance Criteria**:
1. ✓ Settings page with sections:
   - Dietary Preferences
   - Allergies
   - Household Size
   - Account Information
2. ✓ Tab navigation or single-page with sections
3. ✓ Responsive design
4. ✓ TypeScript

**File Path**: `src/components/pages/Settings/Settings.tsx`

---

### T-067: Build Dietary Preferences Section (US-5.1)
**Epic**: E5 (User Preferences)
**Story**: US-5.1
**Effort**: Medium (3h)
**Dependencies**: T-004, T-065, T-066
**Status**: ⬜

**Description**:
Create dietary preferences form with checkboxes.

**Acceptance Criteria**:
1. ✓ "Dietary Preferences" section
2. ✓ Checkboxes for:
   - Vegetarian, Vegan, Gluten-Free, Dairy-Free, Keto, Paleo, Low-Carb, Pescatarian, Nut-Free
3. ✓ Multiple selections allowed
4. ✓ Help text for each diet (optional tooltips)
5. ✓ "Save Preferences" button
6. ✓ Clicking "Save":
   - Calls UserService.updatePreferences()
   - Success toast
7. ✓ "Clear All" button
8. ✓ Preferences apply to recipe filtering immediately
9. ✓ Changes persist to localStorage
10. ✓ TypeScript

---

### T-068: Build Allergies Section (US-5.2)
**Epic**: E5 (User Preferences)
**Story**: US-5.2
**Effort**: Medium (3h)
**Dependencies**: T-004, T-005, T-065, T-066
**Status**: ⬜

**Description**:
Create allergies form with multi-select and custom input.

**Acceptance Criteria**:
1. ✓ "Allergies" section
2. ✓ Checkboxes or multi-select for common allergens:
   - Peanuts, Tree Nuts, Shellfish, Fish, Eggs, Dairy, Soy, Wheat/Gluten, Sesame
3. ✓ "Add Custom Allergy" input:
   - Text input
   - "Add" button
4. ✓ Selected allergies shown as removable chips
5. ✓ "Save" button
6. ✓ Saving updates user profile
7. ✓ Success toast
8. ✓ Recipes with allergens:
   - Excluded from all views (hard filter)
   - Warning if user tries to add to meal plan
9. ✓ "Clear All" button
10. ✓ TypeScript

---

### T-069: Build Household Size Section (US-5.3)
**Epic**: E5 (User Preferences)
**Story**: US-5.3
**Effort**: Small (2h)
**Dependencies**: T-004, T-065, T-066
**Status**: ⬜

**Description**:
Create household size setting.

**Acceptance Criteria**:
1. ✓ "Household Size" section
2. ✓ Number input or dropdown (1-10 people)
3. ✓ Label: "How many people do you usually cook for?"
4. ✓ Help text: "Recipes will default to this serving size"
5. ✓ "Save" button
6. ✓ Saving updates user profile
7. ✓ Success toast
8. ✓ Recipe detail pages default to this serving size
9. ✓ TypeScript

---

### T-070: Build Account Management Section (US-5.4 Part 1)
**Epic**: E5 (User Preferences)
**Story**: US-5.4
**Effort**: Medium (4h)
**Dependencies**: T-004, T-065, T-066
**Status**: ⬜

**Description**:
Create account info form (name, email, password).

**Acceptance Criteria**:
1. ✓ "Account Information" section
2. ✓ Profile form:
   - Name (editable)
   - Email (editable)
   - "Save Changes" button
3. ✓ Form validation (email format)
4. ✓ Changes require current password confirmation (modal)
5. ✓ Success toast: "Profile updated"
6. ✓ "Change Password" section:
   - Current password
   - New password (with strength indicator)
   - Confirm new password
   - "Update Password" button
7. ✓ Password validation:
   - Current password correct
   - New password meets requirements
   - Passwords match
8. ✓ Success toast: "Password updated"
9. ✓ Error handling
10. ✓ TypeScript

---

### T-071: Implement Export Data & Delete Account (US-5.4 Part 2)
**Epic**: E5 (User Preferences)
**Story**: US-5.4
**Effort**: Medium (3h)
**Dependencies**: T-065, T-066
**Status**: ⬜

**Description**:
Add data export and account deletion functionality.

**Acceptance Criteria**:
1. ✓ "Data Management" section
2. ✓ "Export My Data" button:
   - Calls UserService.exportData()
   - Downloads JSON file with all user data
   - Filename: `mealplanner-data-[date].json`
3. ✓ "Delete Account" section:
   - Warning: "This action is permanent and cannot be undone"
   - "Delete Account" button (danger style)
4. ✓ Clicking "Delete Account":
   - Confirmation modal: "Are you sure?"
   - Input field: "Type DELETE to confirm"
   - "Cancel" and "Delete Forever" buttons
5. ✓ Confirming:
   - Calls UserService.deleteAccount()
   - Clears all localStorage data
   - Logs out user
   - Redirects to homepage
   - Success message: "Account deleted"
6. ✓ TypeScript

---

### T-072: Apply Preferences to Recipe Filtering
**Epic**: E5 (User Preferences)
**Effort**: Medium (3h)
**Dependencies**: T-041, T-067, T-068
**Status**: ⬜

**Description**:
Integrate user preferences into recipe filtering logic.

**Acceptance Criteria**:
1. ✓ RecipeService uses user preferences when fetching recipes
2. ✓ Dietary preferences filter:
   - Only show recipes matching selected diets
   - Example: If Vegan selected, hide non-vegan recipes
3. ✓ Allergy filter:
   - Exclude recipes containing allergens (hard filter)
   - Check all ingredients for allergen matches
4. ✓ Filters apply to:
   - Recipe catalog
   - Search results
   - AI suggestions
   - Recipe browser modal (meal planning)
5. ✓ Filter badge on catalog: "Showing: Vegan, Gluten-Free"
6. ✓ "Clear Filters" option to temporarily bypass preferences
7. ✓ TypeScript

---

### T-073: Add Warning for Allergen Recipes
**Epic**: E5 (User Preferences)
**Effort**: Small (2h)
**Dependencies**: T-068, T-072
**Status**: ⬜

**Description**:
Show warning if user tries to add recipe with allergen to meal plan.

**Acceptance Criteria**:
1. ✓ When user tries to add recipe with allergen:
   - Check recipe ingredients against user allergies
   - If match found, show warning modal
2. ✓ Warning modal:
   - Title: "Allergen Warning"
   - Message: "This recipe contains [Allergen]. Are you sure you want to add it?"
   - List of detected allergens
   - "Cancel" (recommended) and "Add Anyway" buttons
3. ✓ Clicking "Cancel" aborts action
4. ✓ Clicking "Add Anyway" adds recipe with flag
5. ✓ TypeScript

---

### T-074: Test Preferences End-to-End
**Epic**: E5 (User Preferences)
**Effort**: Small (2h)
**Dependencies**: T-065 to T-073
**Status**: ⬜

**Description**:
Manually test complete preferences workflow.

**Acceptance Criteria**:
1. ✓ Test setting dietary preferences (save, clear)
2. ✓ Test adding allergies (common and custom)
3. ✓ Test setting household size
4. ✓ Verify preferences apply to recipe filtering
5. ✓ Verify allergen exclusion works
6. ✓ Test allergen warning when adding to meal plan
7. ✓ Test updating account info (name, email)
8. ✓ Test changing password
9. ✓ Test exporting data (JSON downloaded)
10. ✓ Test deleting account (all data cleared)
11. ✓ Test responsive design
12. ✓ Test accessibility
13. ✓ Fix any bugs found

---

**Week 6 Summary**:
- ✅ 10 tasks completed
- ✅ User preferences fully functional
- ✅ Recipe filtering based on diet and allergies
- ✅ Account management working
- ✅ Ready to build AI features & dashboard in Week 7

---

## Week 7: AI Features & Dashboard

**Goal**: Implement mock AI features and complete dashboard

**Deliverable**: Full app experience with smart suggestions and overview

**Hours**: 40 hours

---

### T-075: Enhance Mock AI Suggestion Algorithm (US-6.1)
**Epic**: E6 (AI Features)
**Story**: US-6.1
**Effort**: Medium (3h)
**Dependencies**: T-036, T-072
**Status**: ⬜

**Description**:
Improve mock AI algorithm with more factors and better scoring.

**Acceptance Criteria**:
1. ✓ Enhance MockAIService.generateSuggestions()
2. ✓ Additional factors:
   - Recipe variety (don't suggest same cuisine repeatedly)
   - Seasonal ingredients (optional - mock)
   - Meal plan gaps (prioritize meals for empty slots)
   - Cooking difficulty (match user skill level - optional)
3. ✓ Weighted scoring:
   - Dietary match: 10 points
   - Favorites similarity: 5 points
   - Not recently planned: 3 points
   - Time-appropriate: 2 points
   - Variety bonus: 2 points
   - Random factor: 0-2 points
4. ✓ Better explanations:
   - "Great for meal prep"
   - "Light and healthy"
   - "Comfort food favorite"
5. ✓ TypeScript
6. ✓ Unit tests

---

### T-076: Implement Nutrition Balance Score (US-6.2)
**Epic**: E6 (AI Features)
**Story**: US-6.2
**Effort**: Large (5h)
**Dependencies**: T-030, T-041
**Status**: ⬜

**Description**:
Build nutrition summary widget with weekly balance score.

**Acceptance Criteria**:
1. ✓ NutritionSummary component
2. ✓ Fetches all recipes in current meal plan
3. ✓ Calculates per-day nutrition:
   - Sum calories, protein, carbs, fat for each day
4. ✓ Displays per-day breakdown (table or list)
5. ✓ Weekly averages:
   - Avg calories/day
   - Avg macros/day
6. ✓ Balance score (0-100):
   - Consistency: StdDev of daily calories (lower is better)
   - Macro balance: Distance from ideal ratios (30/40/30)
   - Variety: Number of unique meal types
7. ✓ Score color-coded:
   - 80-100: Green (Excellent)
   - 60-79: Yellow (Good)
   - 40-59: Orange (Fair)
   - 0-39: Red (Poor)
8. ✓ Actionable insights:
   - "Add more vegetables on Thursday"
   - "Great balance this week!"
9. ✓ Optional: Visual chart (bar or line)
10. ✓ TypeScript

**File Path**: `src/components/organisms/NutritionSummary/NutritionSummary.tsx`

---

### T-077: Implement Ingredient Substitutions (US-6.3)
**Epic**: E6 (AI Features)
**Story**: US-6.3
**Effort**: Medium (4h)
**Dependencies**: T-046
**Status**: ⬜

**Description**:
Add ingredient substitution suggestions on recipe detail page.

**Acceptance Criteria**:
1. ✓ "Suggest Substitution" button next to each ingredient
2. ✓ Clicking opens substitution popover/modal:
   - Shows 2-3 alternatives
   - Example: "Greek Yogurt" → "Sour Cream", "Cottage Cheese"
3. ✓ Each substitution shows:
   - Name
   - Conversion ratio: "Use 1:1" or "Use 2x amount"
   - Impact note: "May alter flavor slightly"
4. ✓ Pre-defined substitution map:
   - Store in `src/mock/substitutions.ts`
   - Common substitutions (milk, butter, eggs, etc.)
5. ✓ Dietary-aware:
   - Don't suggest dairy if user is dairy-free/vegan
6. ✓ "Use Substitution" button:
   - Replaces ingredient temporarily (not saved to recipe)
   - Shows badge: "Modified: Using Sour Cream"
7. ✓ If no substitutions: "No common substitutions found"
8. ✓ TypeScript

**File Paths**:
- `src/components/molecules/SubstitutionPopover/SubstitutionPopover.tsx`
- `src/mock/substitutions.ts`

---

### T-078: Create Dashboard Widgets (US-7.1, US-7.2)
**Epic**: E7 (Dashboard)
**Stories**: US-7.1, US-7.2
**Effort**: Large (5h)
**Dependencies**: T-009, T-030, T-041
**Status**: ⬜

**Description**:
Build dashboard widgets for upcoming meals and favorites.

**Acceptance Criteria**:
1. ✓ UpcomingMealsWidget:
   - Shows today's meals (all meal types)
   - Shows tomorrow's meals (collapsible)
   - Empty slots: "No meal planned" + "Add Meal" button
   - Filled slots: Recipe thumbnail, name, prep time
   - Click meal → Opens recipe detail
   - Click "Add Meal" → Opens recipe browser
2. ✓ FavoritesWidget:
   - Shows 3-4 most recent favorites
   - Recipe cards (compact)
   - "View All Favorites" link
   - Quick add to plan: "+ Add to Plan" button
   - Empty state: "No favorites yet"
3. ✓ Both widgets responsive
4. ✓ TypeScript

**File Paths**:
- `src/components/organisms/UpcomingMealsWidget/UpcomingMealsWidget.tsx`
- `src/components/organisms/FavoritesWidget/FavoritesWidget.tsx`

---

### T-079: Implement Activity Feed (US-7.3)
**Epic**: E7 (Dashboard)
**Story**: US-7.3
**Effort**: Medium (4h)
**Dependencies**: None
**Status**: ⬜

**Description**:
Build activity logging system and feed widget for dashboard.

**Acceptance Criteria**:
1. ✓ ActivityService with methods:
   - logActivity(userId, action, details)
   - getActivities(userId, limit)
2. ✓ Activity types:
   - add_meal, remove_meal, favorite_recipe, generate_list, complete_list, update_preferences
3. ✓ Activities stored in localStorage (per user)
4. ✓ Limit to last 50-100 activities
5. ✓ ActivityFeed component:
   - Shows last 10 activities
   - Each activity: Icon, description, timestamp (relative)
   - Example: "Added Chicken Caesar to Monday Dinner • 2 hours ago"
6. ✓ Clickable activities (link to recipe/meal plan)
7. ✓ "View All Activity" link (optional)
8. ✓ Empty state: "No recent activity"
9. ✓ TypeScript

**File Paths**:
- `src/services/activity.service.ts`
- `src/components/organisms/ActivityFeed/ActivityFeed.tsx`

---

### T-080: Complete Dashboard Page
**Epic**: E7 (Dashboard)
**Effort**: Medium (3h)
**Dependencies**: T-026, T-037, T-076, T-078, T-079
**Status**: ⬜

**Description**:
Finalize dashboard with all widgets and layout.

**Acceptance Criteria**:
1. ✓ Dashboard page displays:
   - Welcome message: "Welcome back, [User]!"
   - Quick stats (3-4 StatCards):
     - Meals planned this week
     - Favorite recipes count
     - Shopping list items (if any)
     - Nutrition balance score
   - UpcomingMealsWidget
   - MealSuggestions widget (from Week 3)
   - FavoritesWidget
   - NutritionSummary widget (optional - may be on meal plan page)
   - ActivityFeed widget
2. ✓ Responsive layout:
   - Desktop: Multi-column grid
   - Mobile: Stacked widgets
3. ✓ Loading states for all widgets
4. ✓ Quick action buttons:
   - "Plan This Week"
   - "Browse Recipes"
   - "View Shopping List"
5. ✓ TypeScript

---

### T-081: Integrate AI Features Across App
**Epic**: E6 (AI Features)
**Effort**: Medium (3h)
**Dependencies**: T-037, T-075, T-076, T-077
**Status**: ⬜

**Description**:
Ensure all AI features are integrated and working across relevant pages.

**Acceptance Criteria**:
1. ✓ Meal suggestions visible on:
   - Dashboard
   - Meal Plan page
2. ✓ Nutrition summary visible on:
   - Dashboard (summary)
   - Meal Plan page (detailed)
3. ✓ Ingredient substitutions available on:
   - Recipe detail pages
4. ✓ All features use latest user data (preferences, meal plan, favorites)
5. ✓ Features update in real-time when data changes
6. ✓ TypeScript

---

### T-082: Polish & Visual Refinement
**Epic**: Polish
**Effort**: Medium (4h)
**Dependencies**: All previous tasks
**Status**: ⬜

**Description**:
Visual polish pass across entire app.

**Acceptance Criteria**:
1. ✓ Consistent spacing and alignment
2. ✓ All colors match design system
3. ✓ Typography consistent (font sizes, weights, line heights)
4. ✓ Icons consistent (same library, same sizes)
5. ✓ Hover states on all interactive elements
6. ✓ Smooth transitions and animations
7. ✓ Loading states everywhere (no janky loading)
8. ✓ Error states friendly and helpful
9. ✓ Empty states engaging with clear CTAs
10. ✓ Placeholder images replaced with quality assets (or good placeholders)
11. ✓ Mobile: Touch targets 44x44px minimum
12. ✓ Fix any visual bugs or inconsistencies

---

### T-083: Test All Features Integration
**Epic**: Integration Testing
**Effort**: Medium (4h)
**Dependencies**: T-075 to T-082
**Status**: ⬜

**Description**:
End-to-end testing of complete user flow.

**Acceptance Criteria**:
1. ✓ Test complete user journey:
   - Register → Onboarding → Dashboard
   - Browse recipes → Favorite
   - Plan week of meals
   - Generate shopping list → Check off items
   - Update preferences → Verify filtering
   - View AI suggestions → Add to plan
   - Check nutrition summary
2. ✓ Test data persistence (refresh page at each step)
3. ✓ Test all navigation paths
4. ✓ Test responsive design (mobile, tablet, desktop)
5. ✓ Test accessibility (keyboard nav, screen reader)
6. ✓ Test performance (page load times, smooth interactions)
7. ✓ Test error scenarios (network errors, validation, etc.)
8. ✓ Create bug list
9. ✓ Fix critical bugs

---

**Week 7 Summary**:
- ✅ 9 tasks completed
- ✅ AI features implemented
- ✅ Dashboard complete
- ✅ Full app functional
- ✅ Ready for final polish in Week 8

---

## Week 8: Polish, Testing & Launch Prep

**Goal**: Final refinements, accessibility, performance, and demo prep

**Deliverable**: Production-ready prototype for stakeholder demo

**Hours**: 40 hours

---

**(Tasks continue with final polish, testing, documentation, and demo preparation...)**

[Tasks T-084 through T-094 would cover Week 8, including accessibility audit, performance optimization, cross-browser testing, documentation, demo preparation, bug fixes, and final QA]

---

## Task Dependencies

### Dependency Graph

```
T-001 (Setup)
  ├─→ T-002 (Tailwind)
  │    ├─→ T-003 (Buttons)
  │    ├─→ T-004 (Inputs)
  │    ├─→ T-005 (Badges)
  │    ├─→ T-006 (Progress)
  │    └─→ T-013 (Layouts)
  ├─→ T-014 (Utilities)
  ├─→ T-015 (Routing)
  └─→ T-016 (LocalStorage)

Week 1 → Week 2 (Auth & Nav)
Week 2 → Week 3 (Meal Planning)
Week 3 → Week 4 (Recipes)
Week 4 → Week 5 (Shopping)
Week 5 → Week 6 (Preferences)
Week 6 → Week 7 (AI & Dashboard)
Week 7 → Week 8 (Polish)
```

### Critical Path

**Must complete in order** (blocking dependencies):

1. T-001 → T-002 → T-003/T-004 (Foundation)
2. T-016 → T-017 → T-018 (Auth System)
3. T-029 → T-030 → T-031 (Meal Planning Core)
4. T-041 → T-042 → T-046 (Recipe System)
5. T-053 → T-054 → T-056 → T-058 (Shopping Lists)

**Parallel work opportunities**:
- Design system components (T-003 to T-013) can be built in parallel
- Pages can be built in parallel once templates ready
- Services can be developed independently
- Testing tasks can be done incrementally

---

## Critical Path

**Longest sequence of dependent tasks:**

T-001 → T-002 → T-004 → T-016 → T-017 → T-018 → T-019 → T-029 → T-030 → T-031 → T-041 → T-042 → T-046 → T-053 → T-058

**Estimated Critical Path Duration**: ~160 hours (4 weeks at 40h/week)

**Buffer**: 160 hours (4 weeks) for parallel work, polish, testing

---

## Appendix: Task Summary by Week

| Week | Tasks | Est. Hours | Focus Area |
|------|-------|------------|------------|
| **1** | T-001 to T-015 | 40 | Foundation & Design System |
| **2** | T-016 to T-028 | 40 | Authentication & Navigation |
| **3** | T-029 to T-040 | 40 | Meal Planning Core |
| **4** | T-041 to T-052 | 40 | Recipe Discovery |
| **5** | T-053 to T-064 | 40 | Shopping Lists |
| **6** | T-065 to T-074 | 40 | User Preferences |
| **7** | T-075 to T-083 | 40 | AI Features & Dashboard |
| **8** | T-084 to T-094 | 40 | Polish, Testing, Launch |

**Total**: 77 tasks, 320 hours, 8 weeks

---

**End of Task Breakdown Document**

For epic-level view, see [EPIC_BREAKDOWN.md](./EPIC_BREAKDOWN.md).

For technical specifications, see [PRD.md](./PRD.md), [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md), [MOCK_DATA_SPEC.md](./MOCK_DATA_SPEC.md), and [API_CONTRACT.md](./API_CONTRACT.md).
