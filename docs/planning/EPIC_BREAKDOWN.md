# Epic Breakdown & User Stories
## AI-Powered Meal Planner

---

**Version:** 1.0
**Last Updated:** 2025-10-12
**Total Epics:** 7
**Total User Stories:** 28

---

## Table of Contents

1. [Epic Overview](#epic-overview)
2. [Epic Dependencies](#epic-dependencies)
3. [Epic 1: User Authentication & Onboarding](#epic-1-user-authentication--onboarding)
4. [Epic 2: Meal Planning](#epic-2-meal-planning)
5. [Epic 3: Recipe Discovery & Management](#epic-3-recipe-discovery--management)
6. [Epic 4: Shopping List Generation](#epic-4-shopping-list-generation)
7. [Epic 5: User Preferences & Profile](#epic-5-user-preferences--profile)
8. [Epic 6: AI-Powered Features](#epic-6-ai-powered-features)
9. [Epic 7: Dashboard & Overview](#epic-7-dashboard--overview)
10. [Priority Matrix](#priority-matrix)

---

## Epic Overview

| Epic ID | Epic Name | Priority | User Stories | Story Points | Phase |
|---------|-----------|----------|--------------|--------------|-------|
| **E1** | User Authentication & Onboarding | High | 3 | 13 | Week 2 |
| **E2** | Meal Planning | Critical | 5 | 21 | Week 3 |
| **E3** | Recipe Discovery & Management | Critical | 5 | 21 | Week 4 |
| **E4** | Shopping List Generation | High | 6 | 18 | Week 5 |
| **E5** | User Preferences & Profile | Medium | 4 | 13 | Week 6 |
| **E6** | AI-Powered Features | Medium | 3 | 13 | Week 7 |
| **E7** | Dashboard & Overview | Medium | 3 | 10 | Week 7 |

**Total Story Points**: 109

---

## Epic Dependencies

```
E1 (Auth) → E2 (Meal Planning)
             ↓
           E3 (Recipes) ← E5 (Preferences)
             ↓             ↓
           E4 (Shopping) ← E6 (AI Features)
             ↓
           E7 (Dashboard)
```

**Critical Path**: E1 → E2 → E3 → E4

**Dependencies Explained**:
- **E1 must complete first**: Authentication is required for all user-specific features
- **E2 depends on E1**: Meal planning requires user accounts to save plans
- **E3 depends on E2**: Recipes are added to meal plans
- **E4 depends on E2 & E3**: Shopping lists are generated from meal plans with recipes
- **E5 influences E3 & E6**: User preferences filter recipes and AI suggestions
- **E6 depends on E3 & E5**: AI suggestions need recipes and preferences
- **E7 depends on E2, E3, E4**: Dashboard aggregates data from other features

---

## Epic 1: User Authentication & Onboarding

**Epic ID**: E1
**Priority**: High
**Phase**: Week 2
**Story Points**: 13

### Description
Enable users to create accounts, log in, and understand the application through a guided onboarding experience.

### Goal
Provide secure authentication and a smooth first-time user experience that leads to high activation rates.

### Success Metrics
- 90% of new users complete registration
- 70% of new users complete onboarding tutorial
- Less than 5% authentication errors

---

### User Stories

#### US-1.1: User Registration

**As a** new user
**I want to** create an account with email and password
**So that** I can save my meal plans and preferences

**Priority**: High | **Story Points**: 5

**Acceptance Criteria**:
1. ✓ Registration form displays with fields:
   - Email (with validation)
   - Password (with strength indicator)
   - Confirm Password
   - Name (optional)
2. ✓ Email validation checks for proper format
3. ✓ Password requirements enforced:
   - Minimum 8 characters
   - At least 1 uppercase letter
   - At least 1 number
   - At least 1 special character (optional but recommended)
4. ✓ Password strength indicator shows: Weak, Medium, Strong
5. ✓ "Confirm Password" must match password
6. ✓ Error messages are clear and specific:
   - "Email already exists"
   - "Password too weak"
   - "Passwords don't match"
7. ✓ Success message displayed: "Account created! Redirecting..."
8. ✓ User automatically logged in after registration
9. ✓ User redirected to onboarding flow after registration
10. ✓ Data persisted to localStorage with hashed password

**Technical Notes**:
- Use React Hook Form for form management
- Implement password hashing (mock) before storage
- Use Zod for validation schema
- Store JWT token (mocked) in localStorage

**UI Components Needed**:
- Input (email, password)
- Button (submit)
- Password strength indicator
- Form validation messages
- Success toast

---

#### US-1.2: User Login

**As a** returning user
**I want to** log in with my credentials
**So that** I can access my saved meal plans and data

**Priority**: High | **Story Points**: 3

**Acceptance Criteria**:
1. ✓ Login form displays with fields:
   - Email
   - Password
2. ✓ "Remember me" checkbox available
3. ✓ "Forgot password?" link present (future enhancement - shows message)
4. ✓ Successful login redirects to Dashboard
5. ✓ Failed login shows error: "Invalid email or password"
6. ✓ After 3 failed attempts, show temporary lock message (5 minutes)
7. ✓ "Remember me" stores auth token for 30 days
8. ✓ Loading state shown during authentication
9. ✓ User session persists across browser refreshes
10. ✓ Link to registration page: "Don't have an account? Sign up"

**Technical Notes**:
- Check credentials against localStorage users
- Generate and store JWT token (mocked)
- Use Context API for auth state

**UI Components Needed**:
- Input (email, password)
- Checkbox (remember me)
- Button (submit)
- Link (forgot password, sign up)
- Loading spinner

---

#### US-1.3: Onboarding Tutorial

**As a** new user
**I want** a guided walkthrough of key features
**So that** I understand how to use the app effectively

**Priority**: Medium | **Story Points**: 5

**Acceptance Criteria**:
1. ✓ Onboarding starts automatically after registration
2. ✓ Tutorial has 4-5 screens:
   - Welcome screen (introduction)
   - Plan your meals (calendar overview)
   - Discover recipes (browse & search)
   - Generate shopping lists (automation benefit)
   - Get AI suggestions (smart features)
3. ✓ Each screen has:
   - Illustration or screenshot
   - Title and description (2-3 sentences)
   - Progress indicator (dots or steps)
4. ✓ Navigation controls:
   - "Next" button
   - "Back" button (disabled on first screen)
   - "Skip" button (available on all screens)
   - "Get Started" button (final screen)
5. ✓ "Skip" redirects to Dashboard
6. ✓ "Get Started" redirects to Dashboard
7. ✓ Onboarding completion flag saved to user profile
8. ✓ Option in Settings to replay tutorial: "View Tutorial Again"
9. ✓ Responsive design (works on mobile and desktop)
10. ✓ Keyboard navigation supported (arrow keys, Enter, Escape)

**Technical Notes**:
- Use modal/overlay component
- Track completion in user preferences
- Consider using a library like react-joyride or build custom

**UI Components Needed**:
- Modal/Overlay
- Progress indicator
- Buttons (Next, Back, Skip, Get Started)
- Illustration placeholders

---

### Epic 1 Technical Implementation Notes

**Services**:
- `AuthService`: register(), login(), logout(), checkAuth(), getUser()

**Context**:
- `AuthContext`: Provides authentication state globally

**Routes**:
- `/register`
- `/login`
- `/onboarding`

**LocalStorage Keys**:
- `users`: Array of user objects
- `authToken`: Current user's JWT token (mocked)
- `currentUser`: Logged-in user object

---

## Epic 2: Meal Planning

**Epic ID**: E2
**Priority**: Critical
**Phase**: Week 3
**Story Points**: 21

### Description
Core feature allowing users to plan meals for the week using a calendar interface with drag-and-drop functionality.

### Goal
Enable users to create, manage, and modify weekly meal plans effortlessly.

### Success Metrics
- 80% of users plan at least 5 meals per week
- Average session: 10 minutes to plan full week
- Drag-and-drop success rate: 95%

---

### User Stories

#### US-2.1: View Weekly Calendar

**As a** user
**I want to** view a weekly calendar layout
**So that** I can see and plan meals for each day

**Priority**: Critical | **Story Points**: 5

**Acceptance Criteria**:
1. ✓ Calendar displays 7 days (Sunday through Saturday)
2. ✓ Current week shown by default
3. ✓ Each day shows:
   - Day name (e.g., "Sunday")
   - Date (e.g., "Oct 12")
   - Meal slots: Breakfast, Lunch, Dinner, Snacks
4. ✓ Current day highlighted with distinct color (e.g., border or background)
5. ✓ Empty meal slots show placeholder: "Add meal"
6. ✓ Filled meal slots show:
   - Recipe thumbnail
   - Recipe name (truncated if long)
   - Prep time
7. ✓ Week navigation controls:
   - Previous week button (left arrow)
   - Next week button (right arrow)
   - "This Week" button to jump to current week
8. ✓ Week range displayed: "Week of Oct 12 - Oct 18, 2025"
9. ✓ Responsive layout:
   - Desktop: 7-column grid
   - Tablet: 3-4 columns, stacked days
   - Mobile: Single column, swipe to navigate days
10. ✓ Loading state while fetching meal plan

**Technical Notes**:
- Use date-fns for date manipulation
- Store meal plans keyed by week start date
- Implement virtual scrolling if performance issues

**UI Components Needed**:
- Calendar grid
- Meal slot cards
- Navigation buttons
- Date display
- Loading skeleton

---

#### US-2.2: Add Recipe to Meal Slot

**As a** user
**I want to** add recipes to specific meal slots
**So that** I can build my weekly meal plan

**Priority**: Critical | **Story Points**: 5

**Acceptance Criteria**:
1. ✓ Clicking empty meal slot opens "Add Recipe" modal
2. ✓ Modal displays:
   - Search bar
   - Recipe grid (from catalog)
   - Category filters
3. ✓ Recipes show thumbnail, name, prep time
4. ✓ Clicking a recipe:
   - Shows recipe preview (ingredients, instructions summary)
   - "Add to [Day] [Meal]" button
5. ✓ Confirming adds recipe to slot and closes modal
6. ✓ Meal slot updates immediately with recipe details
7. ✓ Success toast: "Recipe added to [Day] [Meal]"
8. ✓ Changes persisted to localStorage immediately
9. ✓ If slot already filled, show confirmation: "Replace existing meal?"
10. ✓ Modal closeable via:
    - X button
    - Click outside
    - Escape key

**Alternative Flow: Drag-and-Drop**:
1. ✓ User can drag recipe card from:
   - Recipe browser page
   - Favorites list
   - AI suggestions
2. ✓ Drag source shows visual feedback (ghost image)
3. ✓ Meal slots highlight as valid drop targets
4. ✓ Dropping recipe adds it to slot
5. ✓ Invalid drop targets show "not allowed" cursor

**Technical Notes**:
- Use react-dnd or react-beautiful-dnd for drag-and-drop
- Implement optimistic UI updates

**UI Components Needed**:
- Modal (recipe browser)
- Recipe grid
- Search bar
- Drag-and-drop overlay

---

#### US-2.3: AI Meal Suggestions

**As a** user
**I want to** see AI-suggested meals based on my preferences
**So that** I don't have to search manually

**Priority**: High | **Story Points**: 5

**Acceptance Criteria**:
1. ✓ "Suggestions" section visible on Meal Plan page (sidebar or bottom)
2. ✓ Shows 5-8 recipe recommendations
3. ✓ Suggestions based on:
   - User's dietary preferences (Vegan, Keto, etc.)
   - Favorited recipes (similar cuisines)
   - Time of day (breakfast suggestions in AM, etc.)
   - Recipes not recently planned
4. ✓ Each suggestion shows:
   - Recipe thumbnail
   - Recipe name
   - Quick info (prep time, category)
   - "Why this?" tooltip: "Based on your Keto preference"
5. ✓ One-click add: "+ Add to Plan" button
6. ✓ Clicking "+ Add to Plan" opens meal slot selector:
   - Choose day (dropdown)
   - Choose meal type (dropdown)
   - "Add" button
7. ✓ "Refresh Suggestions" button loads new recommendations
8. ✓ Suggestions update when preferences change
9. ✓ Loading state shown while generating suggestions
10. ✓ If no preferences set, show diverse recommendations

**Technical Notes**:
- Mock AI algorithm using weighted scoring
- Factors: dietary tags match, recent favorites, time of day, variety
- Store suggestion logic in `MockAIService`

**UI Components Needed**:
- Suggestion cards (compact recipe cards)
- Refresh button
- Dropdown selectors (day, meal)
- Tooltip

---

#### US-2.4: Copy Day's Meals

**As a** user
**I want to** copy an entire day's meals to another day
**So that** I can easily repeat favorite meal combinations

**Priority**: Medium | **Story Points**: 3

**Acceptance Criteria**:
1. ✓ Each calendar day has "Copy Day" button (icon or menu)
2. ✓ Clicking "Copy Day" opens modal: "Copy [Day]'s meals to..."
3. ✓ Modal shows:
   - Checkboxes for each day of the week (excluding source day)
   - Option: "Replace existing meals" or "Skip if meals exist"
   - "Copy" and "Cancel" buttons
4. ✓ User can select multiple target days
5. ✓ Clicking "Copy":
   - Copies all meals (Breakfast, Lunch, Dinner, Snacks) to selected days
   - Shows confirmation: "Copied meals to 3 days"
   - Updates calendar immediately
6. ✓ If "Replace existing meals" checked:
   - Overwrites meals in target days
   - Shows warning if target days have meals: "This will replace X existing meals"
7. ✓ If "Skip if meals exist" checked:
   - Only copies to empty slots
8. ✓ Changes persisted to localStorage
9. ✓ Undo option available (5-second window)
10. ✓ Keyboard shortcuts: Ctrl/Cmd + D to copy selected day

**Technical Notes**:
- Deep clone meal data to avoid reference issues
- Implement undo stack (simple array of previous states)

**UI Components Needed**:
- Modal (copy day selector)
- Checkboxes (day selection)
- Radio buttons (replace vs. skip)
- Undo toast notification

---

#### US-2.5: Clear Meal Plan

**As a** user
**I want to** clear my meal plan (partially or fully)
**So that** I can start fresh when needed

**Priority**: Low | **Story Points**: 3

**Acceptance Criteria**:
1. ✓ "Clear Plan" button available (top-right of calendar or menu)
2. ✓ Clicking opens confirmation modal: "Clear Meal Plan"
3. ✓ Modal options:
   - "Clear entire week" (radio button, default)
   - "Clear specific days" (radio button)
   - If "specific days" selected, show day checkboxes
   - "Clear only [meal type]" (optional filter: Breakfast, Lunch, Dinner, Snacks)
4. ✓ Warning message: "This action cannot be undone. Are you sure?"
5. ✓ "Clear" and "Cancel" buttons
6. ✓ Clicking "Clear":
   - Removes selected meals from calendar
   - Shows success toast: "Meal plan cleared"
   - Updates calendar immediately
7. ✓ If shopping list exists for this week:
   - Show additional warning: "A shopping list exists for this week. Clear anyway?"
   - Option: "Also delete shopping list"
8. ✓ Changes persisted to localStorage
9. ✓ Undo functionality (5-second window)
10. ✓ Empty state message shown after clearing: "No meals planned. Start adding meals!"

**Technical Notes**:
- Store backup of plan for undo
- Check for associated shopping lists before clearing

**UI Components Needed**:
- Modal (clear confirmation)
- Radio buttons (clear options)
- Checkboxes (day selection, meal types)
- Warning alert
- Undo toast

---

### Epic 2 Technical Implementation Notes

**Services**:
- `MealPlanService`: getMealPlan(), saveMealPlan(), addMeal(), removeMeal(), copyDay(), clearPlan()

**Components**:
- `MealPlanCalendar` (organism)
- `MealSlot` (molecule)
- `RecipeBrowserModal` (organism)
- `MealSuggestions` (molecule)

**State Management**:
- Local state for calendar display
- Context for meal plan data (or fetch on mount)

**LocalStorage Keys**:
- `mealPlans`: Object keyed by `${userId}_${weekStartDate}`

---

## Epic 3: Recipe Discovery & Management

**Epic ID**: E3
**Priority**: Critical
**Phase**: Week 4
**Story Points**: 21

### Description
Enable users to browse, search, filter, and favorite recipes from a comprehensive catalog.

### Goal
Provide an intuitive recipe discovery experience that helps users find meals matching their preferences.

### Success Metrics
- 80% of users browse recipes at least once per week
- Average 8+ recipe views per session
- 50% of users add at least 3 favorites

---

### User Stories

#### US-3.1: Browse Recipes by Category

**As a** user
**I want to** browse recipes by category and filter by dietary restrictions
**So that** I can find recipes that match my needs

**Priority**: Critical | **Story Points**: 5

**Acceptance Criteria**:
1. ✓ Recipe catalog page displays grid of recipe cards
2. ✓ Category tabs/pills at top:
   - All Recipes (default)
   - Breakfast
   - Lunch
   - Dinner
   - Snacks
   - Desserts
3. ✓ Clicking category filters recipes to show only that category
4. ✓ Active category highlighted
5. ✓ Dietary filter dropdown/checkboxes:
   - Vegetarian
   - Vegan
   - Gluten-Free
   - Dairy-Free
   - Keto
   - Paleo
   - Low-Carb
   - Nut-Free
6. ✓ Multiple dietary filters can be applied (AND logic)
7. ✓ Filter badge shows active filters: "Vegan • Gluten-Free (2 filters)"
8. ✓ "Clear Filters" button to reset
9. ✓ Recipe count displayed: "Showing 24 of 97 recipes"
10. ✓ Sort dropdown:
    - Popular (default)
    - Quick (shortest prep time first)
    - Newest
    - Highest Rated
11. ✓ Recipes displayed in responsive grid:
    - Mobile: 1 column
    - Tablet: 2 columns
    - Desktop: 3-4 columns
12. ✓ Pagination or infinite scroll (20 recipes per page/load)
13. ✓ Loading skeleton while fetching recipes
14. ✓ Empty state if no recipes match filters: "No recipes found. Try different filters."

**Technical Notes**:
- Mock data: 50-100 recipes with diverse tags
- Use memoization for filter performance
- Implement debounced filtering

**UI Components Needed**:
- Recipe grid
- Category tabs
- Filter panel
- Sort dropdown
- Pagination
- Empty state

---

#### US-3.2: Search Recipes

**As a** user
**I want to** search recipes by name, ingredient, or cuisine
**So that** I can quickly find specific dishes

**Priority**: High | **Story Points**: 3

**Acceptance Criteria**:
1. ✓ Search bar prominently displayed at top of recipe catalog
2. ✓ Placeholder text: "Search by recipe name, ingredient, or cuisine..."
3. ✓ Search icon visible in input
4. ✓ Real-time results as user types (debounced 300ms)
5. ✓ Search matches:
   - Recipe name (case-insensitive)
   - Ingredients (e.g., "chicken" finds all chicken recipes)
   - Cuisine type (e.g., "Italian", "Mexican")
6. ✓ Autocomplete suggestions dropdown (optional, nice-to-have):
   - Shows top 5 matches
   - Clickable to select
7. ✓ Search results update recipe grid
8. ✓ Result count displayed: "12 results for 'chicken'"
9. ✓ "Clear Search" X button appears when query entered
10. ✓ Search works in combination with category and dietary filters
11. ✓ Empty state if no results: "No recipes found for 'xyz'. Try different keywords."
12. ✓ Recent searches saved (optional): Show last 3-5 searches as suggestions

**Technical Notes**:
- Use fuzzy matching for better results (e.g., Fuse.js)
- Index recipes for faster search
- Store recent searches in localStorage (per user)

**UI Components Needed**:
- Search bar (with icon)
- Autocomplete dropdown (optional)
- Clear button
- Empty state

---

#### US-3.3: View Recipe Details

**As a** user
**I want to** view full recipe information
**So that** I know ingredients, instructions, and nutrition before cooking

**Priority**: Critical | **Story Points**: 5

**Acceptance Criteria**:
1. ✓ Clicking recipe card opens detailed recipe page (new route)
2. ✓ Recipe page displays:
   - Large hero image
   - Recipe name (H1)
   - Description (2-3 sentences)
   - Rating (stars) and review count
   - Prep time
   - Cook time
   - Total time (auto-calculated)
   - Servings
   - Difficulty level (Easy, Medium, Hard)
   - Category and dietary tags
3. ✓ Ingredients section:
   - Listed with quantities
   - Servings adjuster (dropdown: 1-12 servings)
   - Quantities auto-recalculate when servings changed
4. ✓ Instructions section:
   - Numbered steps (1, 2, 3...)
   - Clear, concise directions
5. ✓ Nutrition information (per serving):
   - Calories
   - Protein (g)
   - Carbohydrates (g)
   - Fat (g)
   - Fiber (g) (optional)
6. ✓ Action buttons:
   - "Add to Meal Plan" (opens day/meal selector)
   - "Add to Favorites" (heart icon, toggles on/off)
   - "Generate Shopping List" (optional, for single recipe)
   - "Share" (future enhancement - shows placeholder message)
7. ✓ Breadcrumb navigation: Home > Recipes > [Recipe Name]
8. ✓ "Back to Recipes" link or browser back button
9. ✓ Related recipes section (bottom): "You might also like..." (3-4 similar recipes)
10. ✓ Responsive layout (stacks on mobile)

**Technical Notes**:
- Route: `/recipes/:recipeId`
- Fetch recipe by ID from mock data
- Implement serving size calculator utility

**UI Components Needed**:
- Recipe detail template
- Breadcrumbs
- Serving adjuster
- Action buttons
- Related recipes carousel

---

#### US-3.4: Favorite Recipes

**As a** user
**I want to** save recipes to my favorites
**So that** I can quickly access recipes I love

**Priority**: High | **Story Points**: 3

**Acceptance Criteria**:
1. ✓ Heart/star icon on every recipe card (catalog and detail page)
2. ✓ Icon states:
   - Outlined/empty: Not favorited
   - Filled/solid: Favorited
3. ✓ Clicking icon toggles favorite status
4. ✓ Visual feedback: Icon animates (scale up slightly) on click
5. ✓ Toast notification:
   - "Added to favorites" (when adding)
   - "Removed from favorites" (when removing)
6. ✓ "My Favorites" page accessible from:
   - Main navigation
   - Profile menu
7. ✓ Favorites page displays:
   - Grid of favorited recipes
   - Same layout as recipe catalog
   - Filter/sort options
8. ✓ Recipe count: "You have 12 favorite recipes"
9. ✓ Empty state if no favorites: "No favorites yet. Start adding recipes you love!"
10. ✓ Quick add from favorites to meal plan:
    - "+ Add to Plan" button on each card
    - Opens day/meal selector
11. ✓ Changes persisted to localStorage (user's favorites array)
12. ✓ Favorites sync across sessions

**Technical Notes**:
- Store favorites as array of recipe IDs in user object
- Check favorited status on page load

**UI Components Needed**:
- Favorite icon (heart, toggleable)
- Favorites page (reuse recipe grid)
- Empty state
- Toast notifications

---

#### US-3.5: Adjust Recipe Servings

**As a** user
**I want to** adjust recipe servings
**So that** I can cook the right amount for my household

**Priority**: Medium | **Story Points**: 5

**Acceptance Criteria**:
1. ✓ Servings adjuster visible on recipe detail page
2. ✓ UI options:
   - Dropdown: Select 1, 2, 4, 6, 8, 10, 12 servings
   - OR +/- buttons with number input (1-12 range)
3. ✓ Default servings: Original recipe servings (e.g., 4)
4. ✓ When servings changed:
   - All ingredient quantities recalculate proportionally
   - Example: 2 cups milk (4 servings) → 1 cup milk (2 servings)
5. ✓ Fractional amounts handled:
   - Display as fractions when appropriate: "1/2 cup" not "0.5 cup"
   - Use common fractions: 1/4, 1/3, 1/2, 2/3, 3/4
6. ✓ Nutrition information recalculates per new serving size
7. ✓ Changes reflect immediately (no page reload)
8. ✓ Ingredient unit conversions (if needed):
   - Example: 16 tbsp → 1 cup
9. ✓ "Reset to Original" button to restore default servings
10. ✓ Adjusted servings persist if user adds recipe to meal plan from detail page
11. ✓ Servings selector disabled while loading

**Technical Notes**:
- Create utility function: `recalculateIngredients(ingredients, originalServings, newServings)`
- Handle edge cases: very small quantities (<0.1), whole items (e.g., "2 eggs" → "1 egg")
- Store unit conversion map (tbsp to cup, etc.)

**UI Components Needed**:
- Servings dropdown or +/- controls
- Reset button
- Fraction display utility

---

### Epic 3 Technical Implementation Notes

**Services**:
- `RecipeService`: getRecipes(), getRecipeById(), searchRecipes(), filterRecipes(), toggleFavorite()

**Mock Data**:
- 50-100 recipes with:
  - Full ingredient lists
  - Step-by-step instructions
  - Nutrition info
  - Multiple dietary tags
  - High-quality placeholder images

**Routes**:
- `/recipes`
- `/recipes/:id`
- `/favorites`

**LocalStorage Keys**:
- `recipes`: Array of recipe objects (or fetch from static JSON)
- `favorites`: Array of recipe IDs (per user)

---

## Epic 4: Shopping List Generation

**Epic ID**: E4
**Priority**: High
**Phase**: Week 5
**Story Points**: 18

### Description
Automatically generate and manage shopping lists based on meal plans, with ingredient consolidation and categorization.

### Goal
Simplify grocery shopping by automating list creation and organizing items by store section.

### Success Metrics
- 70% of users with meal plans generate shopping lists
- 90% ingredient consolidation accuracy
- Average list completion time: under 5 minutes to check off items

---

### User Stories

#### US-4.1: Generate Shopping List

**As a** user
**I want to** automatically generate a shopping list from my meal plan
**So that** I don't have to manually list ingredients

**Priority**: Critical | **Story Points**: 5

**Acceptance Criteria**:
1. ✓ "Generate Shopping List" button visible on Meal Plan page
2. ✓ Button enabled only when at least 1 meal is planned
3. ✓ Clicking button:
   - Analyzes all recipes in current week's meal plan
   - Extracts all ingredients
   - Consolidates duplicate ingredients (same item, different recipes)
     - Example: Recipe 1 needs "2 cups milk", Recipe 2 needs "1 cup milk" → List shows "3 cups milk"
   - Categorizes ingredients by store section
4. ✓ Progress indicator shown: "Generating shopping list..."
5. ✓ Success message: "Shopping list created with 25 items"
6. ✓ User redirected to Shopping List page
7. ✓ If shopping list already exists for this week:
   - Show confirmation: "A shopping list already exists. Replace or merge?"
   - "Replace" deletes old list and creates new
   - "Merge" adds new items to existing (no duplicates)
8. ✓ Generated list includes:
   - Item name
   - Quantity
   - Unit (cups, lbs, oz, etc.)
   - Category
   - Source recipe(s) (optional metadata)
9. ✓ List persisted to localStorage
10. ✓ Unchecked items count shown: "25 items to buy"

**Technical Notes**:
- Ingredient consolidation logic:
  - Normalize units (e.g., 3 tbsp + 1 tbsp = 1/4 cup)
  - Handle whole items (e.g., "2 eggs" + "3 eggs" = "5 eggs")
- Categorization based on ingredient type (produce, dairy, meat, etc.)
- Use `ShoppingListService.generateFromMealPlan()`

**UI Components Needed**:
- Generate button
- Progress modal/overlay
- Confirmation modal (replace/merge)
- Success toast

---

#### US-4.2: Organize by Category

**As a** user
**I want** my shopping list organized by store category
**So that** I can shop efficiently aisle by aisle

**Priority**: High | **Story Points**: 3

**Acceptance Criteria**:
1. ✓ Shopping list displays items grouped by category:
   - Produce (fruits, vegetables)
   - Dairy (milk, cheese, yogurt)
   - Meat & Seafood
   - Pantry (canned goods, grains, spices)
   - Frozen
   - Bakery (bread, tortillas)
   - Other/Miscellaneous
2. ✓ Each category section shows:
   - Category name
   - Category icon
   - Item count badge: "Produce (8 items)"
   - Checked item count: "3/8 checked"
3. ✓ Categories collapsible:
   - Click header to expand/collapse
   - Collapsed shows summary only
   - Expanded shows full item list
4. ✓ Default state: All categories expanded
5. ✓ Categories sorted by typical store layout (customizable in future)
6. ✓ Empty categories hidden (no items in that category)
7. ✓ Items within category sorted alphabetically
8. ✓ Visual progress: Category fully checked changes color (green tint or checkmark icon)
9. ✓ Responsive design: Stacks nicely on mobile
10. ✓ "Expand All" / "Collapse All" toggle button (optional)

**Technical Notes**:
- Categorization mapping stored in constant
- Use accordion component for collapse/expand

**UI Components Needed**:
- Category accordion
- Category header with icon and count
- Progress indicators

---

#### US-4.3: Check Off Items

**As a** user
**I want to** check off items as I shop
**So that** I can track what I've purchased

**Priority**: Critical | **Story Points**: 2

**Acceptance Criteria**:
1. ✓ Each item has checkbox at left
2. ✓ Clicking checkbox toggles checked state
3. ✓ Checked items show:
   - Strikethrough text
   - Slightly faded color
   - Checkmark in checkbox
4. ✓ Checked items move to bottom of category (optional) OR stay in place
5. ✓ Progress bar updates:
   - Total progress: "12/25 items checked (48%)"
   - Category progress: "3/8 checked"
6. ✓ Changes persist immediately to localStorage
7. ✓ Undo functionality:
   - Unchecking item restores to unchecked state
   - Item moves back to original position
8. ✓ "Uncheck All" button:
   - Confirmation modal: "Uncheck all items?"
   - Resets all checkboxes
9. ✓ Completed list (100% checked):
   - Success message: "Shopping complete! 🎉"
   - Option to "Clear List" or "Keep for Reference"
10. ✓ Keyboard accessible: Space bar toggles checkbox

**Technical Notes**:
- Update localStorage on each check/uncheck
- Calculate progress percentage

**UI Components Needed**:
- Checkbox (custom styled)
- Progress bar
- Success modal
- Uncheck all button

---

#### US-4.4: Manually Add Items

**As a** user
**I want to** manually add items to my shopping list
**So that** I can include non-recipe items (e.g., paper towels)

**Priority**: High | **Story Points**: 3

**Acceptance Criteria**:
1. ✓ "Add Item" button visible at top or bottom of shopping list
2. ✓ Clicking opens "Add Item" form/modal:
   - Item name (text input, required)
   - Quantity (text input, optional) - e.g., "2"
   - Unit (dropdown, optional) - e.g., "lbs", "bottles", "boxes"
   - Category (dropdown, required) - all categories available
   - Notes (text input, optional) - e.g., "Brand: Organic"
3. ✓ Form validation:
   - Item name required
   - Category required
   - Error messages shown clearly
4. ✓ "Add" and "Cancel" buttons
5. ✓ Clicking "Add":
   - Adds item to selected category
   - Item appears unchecked
   - Success toast: "Item added to [Category]"
   - Form resets for adding another item (optional)
6. ✓ Quick add option (optional):
   - Just item name input at top
   - Defaults to "Other" category
   - Press Enter to add
7. ✓ Duplicate detection:
   - Warning if similar item exists: "Milk is already on your list. Add anyway?"
8. ✓ Changes persist to localStorage
9. ✓ Keyboard shortcuts: Ctrl/Cmd + A opens add form

**Technical Notes**:
- Use form validation (React Hook Form + Zod)
- Check for duplicates (case-insensitive, fuzzy matching)

**UI Components Needed**:
- Add item form/modal
- Input fields
- Category dropdown
- Success toast
- Duplicate warning modal

---

#### US-4.5: Edit/Remove Items

**As a** user
**I want to** edit or remove items from my shopping list
**So that** I can adjust for items I already have or mistakes

**Priority**: Medium | **Story Points**: 3

**Acceptance Criteria**:
1. ✓ Each item has action icons (hover or always visible):
   - Edit icon (pencil)
   - Delete icon (trash)
2. ✓ Clicking Edit icon:
   - Opens edit form with pre-filled data
   - Same fields as Add Item form
   - "Save" and "Cancel" buttons
3. ✓ Saving edits:
   - Updates item in list
   - Item moves to new category if changed
   - Success toast: "Item updated"
4. ✓ Clicking Delete icon:
   - Confirmation modal: "Remove [item] from list?"
   - "Remove" and "Cancel" buttons
5. ✓ Confirming delete:
   - Item removed immediately
   - Undo toast shown (5-second window): "Item removed. Undo?"
   - Clicking Undo restores item
6. ✓ Bulk delete option:
   - Checkboxes for selecting multiple items
   - "Delete Selected" button
   - Confirmation: "Remove 5 items?"
7. ✓ Swipe to delete on mobile (optional):
   - Swipe left on item reveals delete button
8. ✓ Changes persist to localStorage
9. ✓ Keyboard shortcuts: Delete key removes focused item

**Technical Notes**:
- Implement undo stack for delete actions
- Use optimistic UI updates

**UI Components Needed**:
- Edit form/modal (reuse Add Item form)
- Delete confirmation modal
- Action icons
- Undo toast

---

#### US-4.6: Share Shopping List

**As a** user
**I want to** share my shopping list
**So that** my partner or family member can shop for me

**Priority**: Low | **Story Points**: 2

**Acceptance Criteria**:
1. ✓ "Share" button visible on Shopping List page
2. ✓ Clicking opens "Share List" modal with options:
   - Copy Link
   - Email (future - shows placeholder)
   - Text/SMS (future - shows placeholder)
3. ✓ "Copy Link" generates shareable URL:
   - Example: `https://app.mealplanner.com/shared/abc123`
   - URL copied to clipboard
   - Success toast: "Link copied to clipboard"
4. ✓ Shareable link opens read-only view:
   - Shows shopping list with all items and categories
   - Checkboxes visible but not editable
   - Message at top: "This is a shared shopping list. View only."
   - No edit/delete buttons
5. ✓ Optional: Allow editor permission (future enhancement - out of scope)
   - Toggle: "Allow editing"
   - If enabled, recipient can check off items (syncs in real-time)
6. ✓ Shared link expires after 7 days (optional)
7. ✓ "Revoke Link" option to disable shared access
8. ✓ Share history (optional): List of who list was shared with

**Note**: For prototype, implement basic link generation and read-only view. Real-time sync and email/SMS are future enhancements.

**Technical Notes**:
- Generate unique ID for shared list
- Store shared lists in localStorage (keyed by ID)
- Route: `/shared/:listId`

**UI Components Needed**:
- Share modal
- Copy link button
- Read-only shopping list view
- Share options (placeholders for email/SMS)

---

### Epic 4 Technical Implementation Notes

**Services**:
- `ShoppingListService`: generateFromMealPlan(), addItem(), editItem(), removeItem(), checkItem(), shareList()

**Components**:
- `ShoppingList` (organism)
- `CategorySection` (molecule)
- `ShoppingListItem` (molecule)
- `AddItemModal` (organism)

**Utilities**:
- `ingredientConsolidator`: Combines duplicate ingredients
- `ingredientCategorizer`: Maps ingredients to categories
- `unitConverter`: Normalizes units (tbsp to cup, etc.)

**Routes**:
- `/shopping-list`
- `/shared/:listId`

**LocalStorage Keys**:
- `shoppingLists`: Object keyed by `${userId}_${weekStartDate}`
- `sharedLists`: Object keyed by `shareId`

---

## Epic 5: User Preferences & Profile

**Epic ID**: E5
**Priority**: Medium
**Phase**: Week 6
**Story Points**: 13

### Description
Allow users to customize their experience through dietary preferences, allergy management, and profile settings.

### Goal
Personalize recipe recommendations and filtering based on user's dietary needs and preferences.

### Success Metrics
- 60% of users complete dietary preferences
- 40% of users set at least one allergy
- Recipe filtering accuracy: 95%+

---

### User Stories

#### US-5.1: Set Dietary Preferences

**As a** user
**I want to** set my dietary preferences
**So that** I only see recipes that match my diet

**Priority**: High | **Story Points**: 3

**Acceptance Criteria**:
1. ✓ "Preferences" page accessible from:
   - Settings menu
   - Profile dropdown
   - Onboarding flow
2. ✓ Preferences page shows "Dietary Preferences" section
3. ✓ Checkboxes for:
   - Vegetarian
   - Vegan
   - Gluten-Free
   - Dairy-Free
   - Keto
   - Paleo
   - Low-Carb
   - Pescatarian
   - Nut-Free
4. ✓ Multiple preferences can be selected
5. ✓ Help text explains each diet (optional tooltip)
6. ✓ "Save Preferences" button
7. ✓ Clicking "Save":
   - Stores preferences in user profile
   - Success toast: "Preferences saved"
   - Redirects to dashboard or previous page
8. ✓ Preferences apply immediately to:
   - Recipe catalog filtering
   - AI meal suggestions
   - Search results
9. ✓ Recipes without matching tags are hidden (hard filter)
10. ✓ Filter badge on recipe page shows active preferences: "Showing: Vegan, Gluten-Free"
11. ✓ "Clear All" button to reset preferences
12. ✓ Changes persist to localStorage (user object)

**Technical Notes**:
- Store preferences array in user profile
- Apply filters in recipe service

**UI Components Needed**:
- Checkboxes
- Save button
- Success toast
- Help tooltips (optional)

---

#### US-5.2: Specify Allergies

**As a** user
**I want to** specify my allergies
**So that** I never see recipes with those ingredients

**Priority**: High | **Story Points**: 3

**Acceptance Criteria**:
1. ✓ "Allergies" section on Preferences page
2. ✓ Multi-select input or checkboxes:
   - Peanuts
   - Tree Nuts
   - Shellfish
   - Fish
   - Eggs
   - Dairy
   - Soy
   - Wheat/Gluten
   - Sesame
   - Other (custom input)
3. ✓ Selected allergies shown as removable tags/chips
4. ✓ "Add Allergy" button for custom allergies:
   - Opens input field
   - User types allergen name
   - Press Enter or click Add
5. ✓ "Save" button persists allergies to profile
6. ✓ Recipes containing allergens:
   - Completely excluded from all views (hard filter)
   - Never shown in search, browse, or AI suggestions
7. ✓ Warning if user tries to add recipe with allergen to meal plan:
   - Modal: "This recipe contains [Allergen]. Add anyway?"
   - "Cancel" (recommended) or "Add Anyway"
8. ✓ Allergy warning icon on recipes (if somehow visible):
   - Red exclamation icon
   - Tooltip: "Contains: Peanuts, Dairy"
9. ✓ "Clear All Allergies" button
10. ✓ Changes persist to localStorage

**Technical Notes**:
- Allergen matching should be comprehensive (check all ingredients)
- Case-insensitive matching
- Consider partial matches (e.g., "peanut butter" matches "peanuts")

**UI Components Needed**:
- Multi-select or checkbox list
- Tag/chip component (removable)
- Custom allergy input
- Warning modal
- Alert icon

---

#### US-5.3: Set Household Size

**As a** user
**I want to** set my household size
**So that** recipes default to appropriate servings

**Priority**: Medium | **Story Points**: 2

**Acceptance Criteria**:
1. ✓ "Household Size" section on Preferences page
2. ✓ Number input or dropdown: 1-10 people
3. ✓ Label: "How many people do you usually cook for?"
4. ✓ Help text: "Recipes will default to this serving size"
5. ✓ "Save" button persists setting
6. ✓ When viewing recipes:
   - Serving adjuster defaults to household size
   - Example: User sets household size to 6 → Recipe detail page defaults to 6 servings
7. ✓ User can override per recipe (serving adjuster still editable)
8. ✓ When adding recipe to meal plan:
   - Recipe added with household size servings
9. ✓ Shopping list generation uses household size for quantities
10. ✓ Changes persist to localStorage
11. ✓ Profile displays: "Cooking for: 4 people"

**Technical Notes**:
- Store as `householdSize` in user profile
- Pass to recipe component as default serving size

**UI Components Needed**:
- Number input or dropdown
- Save button
- Profile summary display

---

#### US-5.4: Manage Account

**As a** user
**I want to** manage my account information
**So that** I can update email, password, or delete my account

**Priority**: Medium | **Story Points**: 5

**Acceptance Criteria**:
1. ✓ "Account Settings" page accessible from Settings or Profile
2. ✓ **Profile Information Section**:
   - Name (editable text input)
   - Email (editable text input)
   - "Save Changes" button
   - Changes require current password confirmation
3. ✓ **Change Password Section**:
   - Current password (input)
   - New password (input with strength indicator)
   - Confirm new password (input)
   - "Update Password" button
   - Validation: Current password must be correct
   - Success: "Password updated successfully"
4. ✓ **Preferences Summary**:
   - Dietary preferences (read-only, link to edit)
   - Allergies (read-only, link to edit)
   - Household size (read-only, link to edit)
5. ✓ **Data Management**:
   - "Export My Data" button:
     - Downloads JSON file with user data, meal plans, favorites, shopping lists
   - "Import Data" button (optional, future):
     - Upload JSON to restore data
6. ✓ **Delete Account Section**:
   - Warning text: "This action is permanent and cannot be undone"
   - "Delete Account" button (red/danger style)
   - Clicking opens confirmation modal:
     - "Are you sure you want to delete your account?"
     - "All your data will be permanently deleted"
     - Input field: "Type DELETE to confirm"
     - "Cancel" and "Delete Forever" buttons
   - Confirming:
     - Clears all user data from localStorage
     - Logs user out
     - Redirects to homepage or login
     - Success message: "Account deleted"
7. ✓ All changes persist to localStorage
8. ✓ Form validation for all inputs
9. ✓ Success/error toasts for each action

**Technical Notes**:
- Validate email format and uniqueness
- Hash new password before storing
- Export data as JSON file download
- Delete removes all keys related to user from localStorage

**UI Components Needed**:
- Text inputs
- Password inputs with strength indicator
- Save/Update buttons
- Delete account modal with confirmation input
- Export button
- Success/error toasts

---

### Epic 5 Technical Implementation Notes

**Services**:
- `UserService`: updateProfile(), updatePreferences(), updatePassword(), exportData(), deleteAccount()

**Routes**:
- `/settings`
- `/settings/preferences`
- `/settings/account`

**LocalStorage Keys**:
- User object updated in `users` array
- Preferences stored in `user.preferences`

---

## Epic 6: AI-Powered Features

**Epic ID**: E6
**Priority**: Medium
**Phase**: Week 7
**Story Points**: 13

### Description
Implement mock AI features including personalized suggestions, nutrition balance analysis, and ingredient substitutions.

### Goal
Demonstrate intelligent, personalized features that would leverage real AI in production.

### Success Metrics
- 50% of suggested meals accepted by users
- Nutrition balance score shown for 80% of meal plans
- 30% of users try ingredient substitutions

---

### User Stories

#### US-6.1: AI Meal Suggestions

**As a** user
**I want** AI-suggested meals based on my preferences
**So that** I discover new recipes tailored to my tastes

**Priority**: High | **Story Points**: 5

**Acceptance Criteria**:
1. ✓ "Smart Suggestions" widget/section on:
   - Dashboard
   - Meal Plan page (sidebar)
   - Recipe browser page
2. ✓ Displays 5-8 personalized recipe recommendations
3. ✓ Each suggestion shows:
   - Recipe thumbnail
   - Recipe name
   - Quick info (prep time, category)
   - "Why this?" explanation tag
     - Examples: "Based on your Keto preference", "Similar to your favorites", "Quick meal for busy weeknight"
4. ✓ Mock AI algorithm considers:
   - **Dietary preferences**: Match tags (Vegan, Keto, etc.)
   - **Favorited recipes**: Suggest similar cuisines/ingredients
   - **Recent meal plans**: Avoid recently planned meals, promote variety
   - **Time of day**: Breakfast suggestions in morning, dinner in evening
   - **Meal plan gaps**: Suggest meals for unfilled slots
5. ✓ Scoring system (mock):
   - Dietary match: +10 points
   - Similar to favorites: +5 points
   - Not recently planned: +3 points
   - Time-appropriate: +2 points
   - Top 8 scores shown
6. ✓ "Refresh Suggestions" button:
   - Generates new set of recommendations
   - Shows loading spinner briefly
7. ✓ One-click add: "+ Add to Plan" button on each suggestion
   - Opens day/meal selector modal
8. ✓ Suggestions update when:
   - User updates dietary preferences
   - User favorites a recipe
   - User completes meal plan
9. ✓ Empty state if no preferences set: "Set your dietary preferences to get personalized suggestions"
10. ✓ Suggestions persist across sessions (but can refresh)

**Technical Notes**:
- Create `MockAIService.generateSuggestions(user, mealPlan, recipes)`
- Use weighted scoring algorithm
- Add small random factor for variety

**UI Components Needed**:
- Suggestion cards (compact recipe cards)
- Refresh button
- "Why this?" tooltip
- Day/meal selector modal

---

#### US-6.2: Nutrition Balance Score

**As a** user
**I want** AI to analyze my weekly nutrition
**So that** I can ensure I'm eating a balanced diet

**Priority**: Medium | **Story Points**: 5

**Acceptance Criteria**:
1. ✓ "Nutrition Summary" widget on:
   - Dashboard
   - Meal Plan page (expandable section)
2. ✓ Displays per-day breakdown:
   - Monday: 2000 cal | 150g protein | 200g carbs | 70g fat
   - Tuesday: ...
   - (Repeat for all 7 days)
3. ✓ Weekly totals and averages:
   - Avg calories/day
   - Avg macros (protein, carbs, fat) per day
4. ✓ "Balance Score" (0-100):
   - Mock algorithm evaluates:
     - Calorie consistency (not too high/low variation)
     - Macro balance (reasonable protein/carbs/fat ratios)
     - Variety (different meal types across week)
   - Score displayed with color:
     - 80-100: Green (Excellent)
     - 60-79: Yellow (Good)
     - 40-59: Orange (Fair)
     - 0-39: Red (Poor)
5. ✓ Visual chart (optional but nice):
   - Bar chart showing calories per day
   - Line chart showing macro trends
6. ✓ Actionable insights:
   - "Great job! Your meals are well-balanced this week."
   - "Consider adding more vegetables on Thursday."
   - "You're a bit low on protein. Try these high-protein recipes..."
7. ✓ Insights clickable (link to relevant recipes or filters)
8. ✓ "View Detailed Nutrition" link opens full page with:
   - Per-meal nutrition
   - Micronutrients (vitamins, minerals) - optional
   - Comparison to recommended daily values
9. ✓ Updates in real-time as meals added/removed
10. ✓ Empty state if no meals planned: "Add meals to see your nutrition summary"

**Technical Notes**:
- Calculate nutrition by summing recipes in meal plan
- Balance score formula:
  - Consistency: StdDev of daily calories
  - Macro balance: Distance from ideal ratios (e.g., 30% protein, 40% carbs, 30% fat)
  - Variety: Number of unique meal types
- Store nutrition data in recipes

**UI Components Needed**:
- Nutrition summary widget
- Balance score badge
- Charts (bar/line - use library like Recharts)
- Insight cards
- Detailed nutrition page

---

#### US-6.3: Ingredient Substitutions

**As a** user
**I want** smart ingredient substitution suggestions
**So that** I can work around missing ingredients

**Priority**: Low | **Story Points**: 3

**Acceptance Criteria**:
1. ✓ "Suggest Substitution" button next to each ingredient on recipe page
2. ✓ Clicking opens "Substitution Suggestions" popover/modal:
   - Shows 2-3 alternative ingredients
   - Example: "Greek Yogurt" → "Sour Cream", "Cottage Cheese", "Buttermilk"
3. ✓ Each substitution shows:
   - Substitute name
   - Conversion ratio: "Use 1:1 ratio" or "Use 2x amount"
   - Impact note: "May slightly alter flavor" or "Nutritionally similar"
4. ✓ Substitutions based on:
   - Ingredient type (dairy, protein, grain, etc.)
   - Recipe context (baking vs. cooking)
   - Common culinary substitutions
5. ✓ Pre-defined substitution map:
   - Stored in constants or JSON
   - Example map:
     ```
     "milk": ["almond milk", "soy milk", "oat milk"],
     "butter": ["coconut oil", "olive oil", "margarine"],
     "eggs": ["flax eggs", "chia eggs", "applesauce"]
     ```
6. ✓ If substitution changes nutrition significantly:
   - Warning: "May increase calories by ~20%"
7. ✓ "Use Substitution" button:
   - Replaces ingredient in recipe view
   - Shows badge: "Modified: Using Sour Cream instead of Greek Yogurt"
   - Changes temporary (not saved to original recipe)
8. ✓ If no substitutions available:
   - Message: "No common substitutions found for this ingredient"
9. ✓ Dietary-aware substitutions:
   - If user is Vegan, don't suggest dairy substitutions
10. ✓ Substitutions reflected in shopping list if recipe already added to plan

**Technical Notes**:
- Create substitution mapping object
- Check user dietary preferences before suggesting
- Calculate nutrition impact if substitution changes macros

**UI Components Needed**:
- Substitution button
- Popover/modal with substitution options
- Substitution badge on ingredient
- Warning message (nutrition impact)

---

### Epic 6 Technical Implementation Notes

**Services**:
- `MockAIService`: generateSuggestions(), calculateBalanceScore(), getSubstitutions()

**Mock Algorithms**:
- Suggestion scoring: Weighted sum of preference match, favorites similarity, variety
- Balance score: Combination of calorie consistency, macro ratios, meal variety
- Substitutions: Pre-defined mapping with conversion ratios

**Components**:
- `SmartSuggestions` (organism)
- `NutritionSummary` (organism)
- `SubstitutionPopover` (molecule)

**Data**:
- Substitution map (static JSON or constant)
- Nutrition data in recipes

---

## Epic 7: Dashboard & Overview

**Epic ID**: E7
**Priority**: Medium
**Phase**: Week 7
**Story Points**: 10

### Description
Provide users with a centralized dashboard showing upcoming meals, favorites, and recent activity at a glance.

### Goal
Create an engaging home page that drives users to key actions and shows personalized content.

### Success Metrics
- 90% of users land on dashboard after login
- 60% of users interact with dashboard widgets (click through)
- Average 3+ actions per dashboard visit

---

### User Stories

#### US-7.1: View Upcoming Meals

**As a** user
**I want to** see my upcoming meals on the dashboard
**So that** I know what I'm eating today and tomorrow

**Priority**: High | **Story Points**: 3

**Acceptance Criteria**:
1. ✓ Dashboard displays "Today's Meals" widget prominently
2. ✓ Shows meals for current day:
   - Breakfast
   - Lunch
   - Dinner
   - Snacks (if planned)
3. ✓ Each meal slot shows:
   - Meal type label (Breakfast, Lunch, etc.)
   - Recipe thumbnail
   - Recipe name
   - Prep time
4. ✓ Empty slots show: "No meal planned" with "+ Add Meal" button
5. ✓ Clicking meal opens recipe detail page
6. ✓ Clicking "+ Add Meal" opens recipe browser modal
7. ✓ "Tomorrow's Meals" widget below or beside today's:
   - Same layout as today
   - Expandable/collapsible (optional)
8. ✓ Quick actions on each meal:
   - "View Recipe" link
   - "Remove" icon (X)
9. ✓ If no meals planned for today or tomorrow:
   - Empty state: "No meals planned. Let's plan your week!"
   - CTA button: "Go to Meal Plan"
10. ✓ Data updates in real-time if meals added/removed elsewhere

**Technical Notes**:
- Fetch current week's meal plan
- Filter to today and tomorrow
- Use date-fns to determine current day

**UI Components Needed**:
- Meal widget cards
- Empty state
- Quick action buttons
- Recipe browser modal

---

#### US-7.2: Favorites Widget

**As a** user
**I want to** see my saved recipes on the dashboard
**So that** I can quickly access and add them to my plan

**Priority**: Medium | **Story Points**: 3

**Acceptance Criteria**:
1. ✓ "My Favorites" widget on dashboard
2. ✓ Displays 3-4 most recently favorited recipes:
   - Recipe thumbnail
   - Recipe name
   - Quick info (prep time)
3. ✓ "View All Favorites" link at bottom (redirects to favorites page)
4. ✓ Each favorite has quick action button:
   - "+ Add to Plan" (opens day/meal selector)
5. ✓ Clicking recipe thumbnail/name opens recipe detail page
6. ✓ Horizontal scrollable carousel on mobile (if more than screen width)
7. ✓ Empty state if no favorites:
   - Message: "No favorites yet. Start saving recipes you love!"
   - CTA button: "Browse Recipes"
8. ✓ Hover effect: Recipe card slightly elevates
9. ✓ Favorites count badge: "You have 12 favorites"
10. ✓ Updates when user adds/removes favorites

**Technical Notes**:
- Fetch user's favorited recipe IDs
- Retrieve recipe details for display
- Sort by most recently added

**UI Components Needed**:
- Favorites carousel/grid
- Recipe cards (compact version)
- Empty state
- CTA button

---

#### US-7.3: Recent Activity Feed

**As a** user
**I want to** see my recent activity
**So that** I can track what I've done in the app

**Priority**: Low | **Story Points**: 4

**Acceptance Criteria**:
1. ✓ "Recent Activity" widget on dashboard (sidebar or bottom section)
2. ✓ Displays last 10 activities:
   - Added recipe to meal plan
   - Favorited recipe
   - Generated shopping list
   - Completed shopping list
   - Updated preferences
   - Removed meal from plan
3. ✓ Each activity shows:
   - Activity description: "Added Chicken Caesar Salad to Monday Dinner"
   - Timestamp: Relative time ("2 hours ago", "Yesterday", "3 days ago")
   - Icon representing action type
4. ✓ Clickable activities (where applicable):
   - Recipe names link to recipe detail
   - "Monday Dinner" links to meal plan
5. ✓ Activities sorted by most recent first
6. ✓ "View All Activity" link (optional - opens full activity history page)
7. ✓ Empty state if no activity:
   - Message: "No recent activity. Start planning meals!"
8. ✓ Activities persist across sessions (stored in localStorage)
9. ✓ Activity feed scrollable if more than 10 items visible
10. ✓ Real-time updates: New activities appear at top as user interacts

**Technical Notes**:
- Store activities in localStorage array (per user)
- Limit to last 50-100 activities (performance)
- Use date-fns for relative time formatting
- Create utility to log activities: `logActivity(userId, action, details)`

**UI Components Needed**:
- Activity feed list
- Activity item (icon + text + timestamp)
- Empty state
- Scrollable container

---

### Epic 7 Technical Implementation Notes

**Services**:
- `DashboardService`: getDashboardData(), getUpcomingMeals(), getRecentFavorites(), getActivityFeed()
- `ActivityService`: logActivity(), getActivities()

**Components**:
- `Dashboard` (page)
- `UpcomingMealsWidget` (organism)
- `FavoritesWidget` (organism)
- `ActivityFeed` (organism)

**LocalStorage Keys**:
- `activities`: Array of activity objects (per user)

**Activity Object Schema**:
```typescript
{
  id: string;
  userId: string;
  action: 'add_meal' | 'favorite_recipe' | 'generate_list' | 'complete_list' | 'update_preferences' | 'remove_meal';
  details: string; // Human-readable description
  timestamp: Date;
  relatedId?: string; // Recipe ID, meal plan ID, etc.
}
```

---

## Priority Matrix

### MoSCoW Prioritization

#### Must Have (Critical)
- ✅ E1: User Authentication & Onboarding (US-1.1, US-1.2)
- ✅ E2: Meal Planning (US-2.1, US-2.2)
- ✅ E3: Recipe Discovery & Management (US-3.1, US-3.3)
- ✅ E4: Shopping List Generation (US-4.1, US-4.3)

#### Should Have (High Priority)
- E2: AI Meal Suggestions (US-2.3)
- E3: Search & Favorites (US-3.2, US-3.4)
- E4: Organize by Category, Manual Add (US-4.2, US-4.4)
- E5: Dietary Preferences, Allergies (US-5.1, US-5.2)
- E6: AI Meal Suggestions (US-6.1)
- E7: Upcoming Meals (US-7.1)

#### Could Have (Medium Priority)
- E1: Onboarding Tutorial (US-1.3)
- E2: Copy Day (US-2.4)
- E3: Adjust Servings (US-3.5)
- E4: Edit/Remove Items (US-4.5)
- E5: Household Size, Manage Account (US-5.3, US-5.4)
- E6: Nutrition Balance, Substitutions (US-6.2, US-6.3)
- E7: Favorites Widget, Activity Feed (US-7.2, US-7.3)

#### Won't Have (This Phase)
- E2: Clear Meal Plan (US-2.5) - Defer to polish phase
- E4: Share Shopping List (US-4.6) - Nice-to-have, not essential

---

## Epic Completion Checklist

### Epic 1: Authentication & Onboarding
- [ ] US-1.1: User Registration
- [ ] US-1.2: User Login
- [ ] US-1.3: Onboarding Tutorial

### Epic 2: Meal Planning
- [ ] US-2.1: View Weekly Calendar
- [ ] US-2.2: Add Recipe to Meal Slot
- [ ] US-2.3: AI Meal Suggestions
- [ ] US-2.4: Copy Day's Meals
- [ ] US-2.5: Clear Meal Plan

### Epic 3: Recipe Discovery
- [ ] US-3.1: Browse Recipes by Category
- [ ] US-3.2: Search Recipes
- [ ] US-3.3: View Recipe Details
- [ ] US-3.4: Favorite Recipes
- [ ] US-3.5: Adjust Recipe Servings

### Epic 4: Shopping Lists
- [ ] US-4.1: Generate Shopping List
- [ ] US-4.2: Organize by Category
- [ ] US-4.3: Check Off Items
- [ ] US-4.4: Manually Add Items
- [ ] US-4.5: Edit/Remove Items
- [ ] US-4.6: Share Shopping List

### Epic 5: Preferences & Profile
- [ ] US-5.1: Set Dietary Preferences
- [ ] US-5.2: Specify Allergies
- [ ] US-5.3: Set Household Size
- [ ] US-5.4: Manage Account

### Epic 6: AI Features
- [ ] US-6.1: AI Meal Suggestions
- [ ] US-6.2: Nutrition Balance Score
- [ ] US-6.3: Ingredient Substitutions

### Epic 7: Dashboard
- [ ] US-7.1: View Upcoming Meals
- [ ] US-7.2: Favorites Widget
- [ ] US-7.3: Recent Activity Feed

---

**End of Epic Breakdown Document**

For task-level breakdown and week-by-week planning, see [TASK_BREAKDOWN.md](./TASK_BREAKDOWN.md).
