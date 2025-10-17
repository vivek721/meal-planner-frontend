# Epic 5: User Preferences & Profile

**Epic ID**: E5
**Priority**: Medium
**Phase**: Week 6
**Story Points**: 13

---

## Description
Allow users to customize their experience through dietary preferences, allergy management, and profile settings.

## Goal
Personalize recipe recommendations and filtering based on user's dietary needs and preferences.

## Success Metrics
- 60% of users complete dietary preferences
- 40% of users set at least one allergy
- Recipe filtering accuracy: 95%+

---

## User Stories

### US-5.1: Set Dietary Preferences

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

### US-5.2: Specify Allergies

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

### US-5.3: Set Household Size

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

### US-5.4: Manage Account

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

## Epic 5 Technical Implementation Notes

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
