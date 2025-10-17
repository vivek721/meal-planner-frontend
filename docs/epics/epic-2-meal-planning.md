# Epic 2: Meal Planning

**Epic ID**: E2
**Priority**: Critical
**Phase**: Week 3
**Story Points**: 21

---

## Description
Core feature allowing users to plan meals for the week using a calendar interface with drag-and-drop functionality.

## Goal
Enable users to create, manage, and modify weekly meal plans effortlessly.

## Success Metrics
- 80% of users plan at least 5 meals per week
- Average session: 10 minutes to plan full week
- Drag-and-drop success rate: 95%

---

## User Stories

### US-2.1: View Weekly Calendar

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

### US-2.2: Add Recipe to Meal Slot

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

### US-2.3: AI Meal Suggestions

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

### US-2.4: Copy Day's Meals

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

### US-2.5: Clear Meal Plan

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

## Epic 2 Technical Implementation Notes

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
