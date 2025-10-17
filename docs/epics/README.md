# Epic Documentation

This folder contains detailed breakdowns for each epic in the AI-Powered Meal Planner project.

## Epic Overview

| Epic ID | Epic Name | Priority | Phase | Story Points |
|---------|-----------|----------|-------|--------------|
| **E1** | User Authentication & Onboarding | High | Week 2 | 13 |
| **E2** | Meal Planning | Critical | Week 3 | 21 |
| **E3** | Recipe Discovery & Management | Critical | Week 4 | 21 |
| **E4** | Shopping List Generation | High | Week 5 | 18 |
| **E5** | User Preferences & Profile | Medium | Week 6 | 13 |
| **E6** | AI-Powered Features | Medium | Week 7 | 13 |
| **E7** | Dashboard & Overview | Medium | Week 7 | 10 |

## Epic Files

- [Epic 1: User Authentication & Onboarding](./epic-1-authentication-onboarding.md)
- [Epic 2: Meal Planning](./epic-2-meal-planning.md)
- [Epic 3: Recipe Discovery & Management](./epic-3-recipe-discovery.md)
- [Epic 4: Shopping List Generation](./epic-4-shopping-lists.md)
- [Epic 5: User Preferences & Profile](./epic-5-user-preferences.md)
- [Epic 6: AI-Powered Features](./epic-6-ai-features.md)
- [Epic 7: Dashboard & Overview](./epic-7-dashboard.md)

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

For complete epic breakdown with all user stories, see [EPIC_BREAKDOWN.md](../planning/EPIC_BREAKDOWN.md)
