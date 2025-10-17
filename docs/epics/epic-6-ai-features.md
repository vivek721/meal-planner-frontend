# Epic 6: AI-Powered Features

**Epic ID**: E6
**Priority**: Medium
**Phase**: Week 7
**Story Points**: 13

---

## Description
Implement mock AI features including personalized suggestions, nutrition balance analysis, and ingredient substitutions.

## Goal
Demonstrate intelligent, personalized features that would leverage real AI in production.

## Success Metrics
- 50% of suggested meals accepted by users
- Nutrition balance score shown for 80% of meal plans
- 30% of users try ingredient substitutions

---

## User Stories

### US-6.1: AI Meal Suggestions

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

### US-6.2: Nutrition Balance Score

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

### US-6.3: Ingredient Substitutions

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

## Epic 6 Technical Implementation Notes

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
