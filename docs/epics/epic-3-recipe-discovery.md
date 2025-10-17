# Epic 3: Recipe Discovery & Management

**Epic ID**: E3
**Priority**: Critical
**Phase**: Week 4
**Story Points**: 21

---

## Description
Enable users to browse, search, filter, and favorite recipes from a comprehensive catalog.

## Goal
Provide an intuitive recipe discovery experience that helps users find meals matching their preferences.

## Success Metrics
- 80% of users browse recipes at least once per week
- Average 8+ recipe views per session
- 50% of users add at least 3 favorites

---

## User Stories

### US-3.1: Browse Recipes by Category

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

### US-3.2: Search Recipes

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

### US-3.3: View Recipe Details

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

### US-3.4: Favorite Recipes

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

### US-3.5: Adjust Recipe Servings

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

## Epic 3 Technical Implementation Notes

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
