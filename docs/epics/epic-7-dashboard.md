# Epic 7: Dashboard & Overview

**Epic ID**: E7
**Priority**: Medium
**Phase**: Week 7
**Story Points**: 10

---

## Description
Provide users with a centralized dashboard showing upcoming meals, favorites, and recent activity at a glance.

## Goal
Create an engaging home page that drives users to key actions and shows personalized content.

## Success Metrics
- 90% of users land on dashboard after login
- 60% of users interact with dashboard widgets (click through)
- Average 3+ actions per dashboard visit

---

## User Stories

### US-7.1: View Upcoming Meals

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

### US-7.2: Favorites Widget

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

### US-7.3: Recent Activity Feed

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

## Epic 7 Technical Implementation Notes

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
