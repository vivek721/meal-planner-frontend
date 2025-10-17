# Epic 4: Shopping List Generation

**Epic ID**: E4
**Priority**: High
**Phase**: Week 5
**Story Points**: 18

---

## Description
Automatically generate and manage shopping lists based on meal plans, with ingredient consolidation and categorization.

## Goal
Simplify grocery shopping by automating list creation and organizing items by store section.

## Success Metrics
- 70% of users with meal plans generate shopping lists
- 90% ingredient consolidation accuracy
- Average list completion time: under 5 minutes to check off items

---

## User Stories

### US-4.1: Generate Shopping List

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

### US-4.2: Organize by Category

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

### US-4.3: Check Off Items

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

### US-4.4: Manually Add Items

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

### US-4.5: Edit/Remove Items

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

### US-4.6: Share Shopping List

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

## Epic 4 Technical Implementation Notes

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
