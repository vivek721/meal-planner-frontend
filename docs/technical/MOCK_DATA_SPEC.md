# Mock Data Specification
## AI-Powered Meal Planner

---

**Version:** 1.0
**Last Updated:** 2025-10-12
**Purpose:** Define data structures, mock data generation, and storage strategy

---

## Table of Contents

1. [Overview](#overview)
2. [Data Storage Strategy](#data-storage-strategy)
3. [TypeScript Type Definitions](#typescript-type-definitions)
4. [Mock Data Structures](#mock-data-structures)
5. [Mock Data Generation](#mock-data-generation)
6. [LocalStorage Schema](#localstorage-schema)
7. [Data Relationships](#data-relationships)
8. [Example Mock Data](#example-mock-data)

---

## Overview

This document defines all data structures, TypeScript interfaces, and mock data specifications for the AI-Powered Meal Planner prototype. The app uses **localStorage** to simulate backend persistence, with a service layer that makes swapping to real APIs straightforward.

### Key Principles

1. **Type Safety**: All data structures use TypeScript interfaces
2. **Realistic Data**: Mock data resembles production quality
3. **Service Abstraction**: Data access through service interfaces
4. **Easy Migration**: localStorage keys and structures map cleanly to API endpoints

---

## Data Storage Strategy

### localStorage Architecture

```typescript
// Top-level localStorage keys
{
  "users": User[],                    // All registered users
  "recipes": Recipe[],                // All available recipes
  "mealPlans": { [key: string]: MealPlan },  // Keyed by userId_weekStart
  "shoppingLists": { [key: string]: ShoppingList },  // Keyed by userId_mealPlanId
  "activities": { [userId: string]: Activity[] },    // Per-user activity logs
  "authToken": string | null,         // Current user's JWT (mocked)
  "currentUserId": string | null      // Logged-in user ID
}
```

### Storage Limits

- localStorage quota: ~5-10MB (browser-dependent)
- Per-user data estimate: ~500KB
- Support ~10-20 test users comfortably
- Implement quota warning at 80% capacity

### Data Persistence Rules

1. **Immediate Persistence**: All user actions save immediately
2. **Optimistic Updates**: UI updates before localStorage write
3. **Validation**: Data validated before storage
4. **Error Handling**: Graceful degradation if quota exceeded

---

## TypeScript Type Definitions

### User Types

```typescript
// src/types/user.types.ts

export interface User {
  id: string;                      // UUID v4
  email: string;                   // Unique, validated
  name: string;                    // Display name
  hashedPassword: string;          // Mock-hashed password
  preferences: UserPreferences;
  favorites: string[];             // Array of Recipe IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  dietary: DietaryPreference[];    // e.g., ['Vegan', 'Gluten-Free']
  allergies: string[];             // e.g., ['Peanuts', 'Shellfish']
  householdSize: number;           // 1-10
  onboardingCompleted: boolean;
  theme?: 'light' | 'dark';        // Future enhancement
}

export type DietaryPreference =
  | 'Vegetarian'
  | 'Vegan'
  | 'Gluten-Free'
  | 'Dairy-Free'
  | 'Keto'
  | 'Paleo'
  | 'Low-Carb'
  | 'Pescatarian'
  | 'Nut-Free';

export interface AuthToken {
  token: string;                   // Mock JWT
  userId: string;
  expiresAt: Date;
}
```

---

### Recipe Types

```typescript
// src/types/recipe.types.ts

export interface Recipe {
  id: string;                      // UUID v4
  name: string;
  description: string;             // 2-3 sentences
  image: string;                   // URL to image
  category: RecipeCategory;
  prepTime: number;                // Minutes
  cookTime: number;                // Minutes
  totalTime: number;               // Auto-calculated
  servings: number;                // Default servings
  difficulty: RecipeDifficulty;
  ingredients: Ingredient[];
  instructions: string[];          // Step-by-step array
  nutrition: NutritionInfo;
  tags: string[];                  // Dietary tags, cuisine, etc.
  rating: number;                  // 0-5 (mocked)
  reviewCount: number;             // Mocked
  createdAt: Date;
  author?: string;                 // Optional (future)
}

export type RecipeCategory =
  | 'Breakfast'
  | 'Lunch'
  | 'Dinner'
  | 'Snacks'
  | 'Desserts';

export type RecipeDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface Ingredient {
  name: string;                    // "Chicken breast"
  quantity: number;                // 2
  unit: string;                    // "lbs", "cups", "tbsp", etc.
  notes?: string;                  // "boneless, skinless"
  category?: IngredientCategory;   // For shopping list categorization
}

export type IngredientCategory =
  | 'Produce'
  | 'Dairy'
  | 'Meat & Seafood'
  | 'Pantry'
  | 'Frozen'
  | 'Bakery'
  | 'Other';

export interface NutritionInfo {
  calories: number;                // Per serving
  protein: number;                 // Grams
  carbohydrates: number;           // Grams
  fat: number;                     // Grams
  fiber?: number;                  // Grams (optional)
  sugar?: number;                  // Grams (optional)
  sodium?: number;                 // Milligrams (optional)
}
```

---

### Meal Plan Types

```typescript
// src/types/mealPlan.types.ts

export interface MealPlan {
  id: string;                      // UUID v4
  userId: string;                  // Owner
  weekStart: Date;                 // Sunday of the week
  meals: WeeklyMeals;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeeklyMeals {
  sunday: DayMeals;
  monday: DayMeals;
  tuesday: DayMeals;
  wednesday: DayMeals;
  thursday: DayMeals;
  friday: DayMeals;
  saturday: DayMeals;
}

export interface DayMeals {
  breakfast?: string;              // Recipe ID
  lunch?: string;                  // Recipe ID
  dinner?: string;                 // Recipe ID
  snacks?: string[];               // Array of Recipe IDs
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';
export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
```

---

### Shopping List Types

```typescript
// src/types/shoppingList.types.ts

export interface ShoppingList {
  id: string;                      // UUID v4
  userId: string;
  mealPlanId: string;              // Source meal plan
  weekStart: Date;                 // For reference
  items: ShoppingListItem[];
  createdAt: Date;
  updatedAt: Date;
  checkedCount: number;            // Cached for performance
  totalCount: number;              // Cached for performance
}

export interface ShoppingListItem {
  id: string;                      // UUID v4
  name: string;                    // "Milk"
  quantity: string;                // "2" or "2.5"
  unit: string;                    // "cups", "lbs", "oz"
  category: IngredientCategory;
  checked: boolean;
  recipeIds?: string[];            // Source recipes (for reference)
  notes?: string;
  addedManually: boolean;          // true if user-added, false if generated
}
```

---

### Activity Types

```typescript
// src/types/activity.types.ts

export interface Activity {
  id: string;                      // UUID v4
  userId: string;
  action: ActivityAction;
  details: string;                 // Human-readable description
  timestamp: Date;
  relatedId?: string;              // Recipe ID, MealPlan ID, etc.
  metadata?: Record<string, any>;  // Additional context
}

export type ActivityAction =
  | 'add_meal'
  | 'remove_meal'
  | 'favorite_recipe'
  | 'unfavorite_recipe'
  | 'generate_shopping_list'
  | 'complete_shopping_list'
  | 'update_preferences'
  | 'copy_day'
  | 'clear_plan';
```

---

### AI Suggestion Types

```typescript
// src/types/ai.types.ts

export interface SuggestionResult {
  recipe: Recipe;
  score: number;                   // 0-100
  reason: string;                  // "Based on your Keto preference"
  factors: SuggestionFactor[];     // Breakdown of score
}

export interface SuggestionFactor {
  name: string;                    // "Dietary Match"
  points: number;                  // 10
  description: string;             // "Matches Keto diet"
}

export interface NutritionBalance {
  dailyBreakdown: DailyNutrition[];
  weeklyAverage: NutritionInfo;
  balanceScore: number;            // 0-100
  insights: string[];              // Actionable recommendations
}

export interface DailyNutrition {
  date: Date;
  dayName: string;                 // "Monday"
  nutrition: NutritionInfo;
  mealCount: number;
}
```

---

## Mock Data Structures

### Mock Data Requirements

| Entity | Quantity | Notes |
|--------|----------|-------|
| **Users** | 3-5 | Test accounts with varied preferences |
| **Recipes** | 50-100 | Diverse categories, diets, cuisines |
| **Meal Plans** | 2-3 per user | Pre-populated for testing |
| **Shopping Lists** | 1-2 per user | Generated from meal plans |
| **Activities** | 10-20 per user | Recent user actions |

---

### Sample User Data

```typescript
const mockUsers: User[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: 'sarah@example.com',
    name: 'Sarah Johnson',
    hashedPassword: 'hashed_password_123',  // Mock hash
    preferences: {
      dietary: ['Vegetarian'],
      allergies: [],
      householdSize: 2,
      onboardingCompleted: true,
    },
    favorites: ['recipe-001', 'recipe-012', 'recipe-045'],
    createdAt: new Date('2025-09-15'),
    updatedAt: new Date('2025-10-10'),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    email: 'michael@example.com',
    name: 'Michael Chen',
    hashedPassword: 'hashed_password_456',
    preferences: {
      dietary: ['Keto', 'Dairy-Free'],
      allergies: ['Peanuts'],
      householdSize: 4,
      onboardingCompleted: true,
    },
    favorites: ['recipe-003', 'recipe-018', 'recipe-029', 'recipe-051'],
    createdAt: new Date('2025-09-20'),
    updatedAt: new Date('2025-10-11'),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    email: 'emma@example.com',
    name: 'Emma Davis',
    hashedPassword: 'hashed_password_789',
    preferences: {
      dietary: [],
      allergies: ['Shellfish'],
      householdSize: 3,
      onboardingCompleted: true,
    },
    favorites: ['recipe-007', 'recipe-022'],
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-10-11'),
  },
];
```

---

### Sample Recipe Data

```typescript
const sampleRecipe: Recipe = {
  id: 'recipe-001',
  name: 'Grilled Chicken Caesar Salad',
  description: 'Fresh romaine lettuce with grilled chicken, parmesan cheese, croutons, and homemade Caesar dressing. A classic favorite that\'s healthy and delicious.',
  image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
  category: 'Lunch',
  prepTime: 15,
  cookTime: 15,
  totalTime: 30,
  servings: 4,
  difficulty: 'Easy',
  ingredients: [
    { name: 'Chicken breast', quantity: 2, unit: 'lbs', category: 'Meat & Seafood' },
    { name: 'Romaine lettuce', quantity: 2, unit: 'heads', category: 'Produce' },
    { name: 'Parmesan cheese', quantity: 0.5, unit: 'cup', category: 'Dairy', notes: 'grated' },
    { name: 'Croutons', quantity: 1, unit: 'cup', category: 'Pantry' },
    { name: 'Caesar dressing', quantity: 0.75, unit: 'cup', category: 'Pantry' },
    { name: 'Olive oil', quantity: 2, unit: 'tbsp', category: 'Pantry' },
    { name: 'Garlic powder', quantity: 1, unit: 'tsp', category: 'Pantry' },
    { name: 'Salt', quantity: 1, unit: 'tsp', category: 'Pantry' },
    { name: 'Black pepper', quantity: 0.5, unit: 'tsp', category: 'Pantry' },
  ],
  instructions: [
    'Season chicken breasts with salt, pepper, and garlic powder.',
    'Heat olive oil in a grill pan over medium-high heat.',
    'Grill chicken for 6-7 minutes per side until cooked through (internal temp 165°F).',
    'Let chicken rest for 5 minutes, then slice into strips.',
    'Chop romaine lettuce and place in large salad bowl.',
    'Add croutons, parmesan cheese, and Caesar dressing. Toss well.',
    'Top with sliced grilled chicken and serve immediately.',
  ],
  nutrition: {
    calories: 420,
    protein: 32,
    carbohydrates: 18,
    fat: 24,
    fiber: 4,
    sugar: 3,
    sodium: 680,
  },
  tags: ['High Protein', 'Keto-Friendly', 'Lunch', 'Salad', 'Quick'],
  rating: 4.5,
  reviewCount: 128,
  createdAt: new Date('2025-08-01'),
};
```

---

## Mock Data Generation

### Recipe Generator Utility

```typescript
// src/mock/generateRecipes.ts

import { Recipe, RecipeCategory, RecipeDifficulty } from '../types/recipe.types';

/**
 * Generates a diverse set of mock recipes
 */
export function generateMockRecipes(count: number = 50): Recipe[] {
  const recipes: Recipe[] = [];

  const categories: RecipeCategory[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts'];
  const difficulties: RecipeDifficulty[] = ['Easy', 'Medium', 'Hard'];

  const recipeTemplates = [
    // Breakfast
    { name: 'Fluffy Pancakes', category: 'Breakfast', tags: ['Vegetarian', 'Quick'] },
    { name: 'Avocado Toast', category: 'Breakfast', tags: ['Vegan', 'Quick', 'Healthy'] },
    { name: 'Greek Yogurt Parfait', category: 'Breakfast', tags: ['Vegetarian', 'High Protein'] },
    // Lunch
    { name: 'Grilled Chicken Caesar Salad', category: 'Lunch', tags: ['High Protein', 'Keto'] },
    { name: 'Quinoa Buddha Bowl', category: 'Lunch', tags: ['Vegan', 'Gluten-Free'] },
    // Dinner
    { name: 'Spaghetti Bolognese', category: 'Dinner', tags: ['Italian', 'Comfort Food'] },
    { name: 'Grilled Salmon with Asparagus', category: 'Dinner', tags: ['Keto', 'High Protein'] },
    // ... (50+ recipe templates)
  ];

  recipeTemplates.forEach((template, index) => {
    recipes.push({
      id: `recipe-${String(index + 1).padStart(3, '0')}`,
      name: template.name,
      description: generateDescription(template.name),
      image: getStockImageUrl(template.category),
      category: template.category,
      prepTime: randomInt(5, 30),
      cookTime: randomInt(10, 60),
      totalTime: 0,  // Calculate below
      servings: randomInt(2, 8),
      difficulty: randomChoice(difficulties),
      ingredients: generateIngredients(template.category),
      instructions: generateInstructions(template.category),
      nutrition: generateNutrition(),
      tags: template.tags,
      rating: randomFloat(3.5, 5.0, 1),
      reviewCount: randomInt(10, 500),
      createdAt: randomDate(new Date('2025-01-01'), new Date()),
    });
  });

  // Calculate total time
  recipes.forEach(recipe => {
    recipe.totalTime = recipe.prepTime + recipe.cookTime;
  });

  return recipes;
}

// Helper functions
function generateDescription(recipeName: string): string {
  const templates = [
    `Delicious ${recipeName} that's perfect for any occasion.`,
    `A healthy and tasty ${recipeName} recipe.`,
    `Easy-to-make ${recipeName} that the whole family will love.`,
  ];
  return randomChoice(templates);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
```

---

### Data Initialization

```typescript
// src/mock/initializeData.ts

import { generateMockRecipes } from './generateRecipes';
import { StorageService } from '../services/storage.service';

/**
 * Initializes mock data on first app load
 */
export function initializeMockData(): void {
  const storage = StorageService.getInstance();

  // Check if data already exists
  if (storage.getItem('recipes')) {
    console.log('Mock data already initialized');
    return;
  }

  console.log('Initializing mock data...');

  // Generate recipes
  const recipes = generateMockRecipes(50);
  storage.setItem('recipes', recipes);

  // Initialize users (empty - users register themselves)
  storage.setItem('users', []);

  // Initialize empty meal plans and shopping lists
  storage.setItem('mealPlans', {});
  storage.setItem('shoppingLists', {});
  storage.setItem('activities', {});

  // Clear auth
  storage.setItem('authToken', null);
  storage.setItem('currentUserId', null);

  console.log('Mock data initialized successfully');
}

// Call on app mount
initializeMockData();
```

---

## LocalStorage Schema

### Key Naming Conventions

```
users                              → All users (array)
recipes                            → All recipes (array)
mealPlans                          → { "[userId]_[weekStart]": MealPlan }
shoppingLists                      → { "[userId]_[mealPlanId]": ShoppingList }
activities                         → { "[userId]": Activity[] }
authToken                          → Current auth token (string | null)
currentUserId                      → Logged-in user ID (string | null)
```

### Example localStorage State

```json
{
  "users": [
    {
      "id": "user-001",
      "email": "sarah@example.com",
      "name": "Sarah Johnson",
      "hashedPassword": "...",
      "preferences": { ... },
      "favorites": ["recipe-001", "recipe-012"],
      "createdAt": "2025-09-15T10:00:00Z",
      "updatedAt": "2025-10-10T15:30:00Z"
    }
  ],
  "recipes": [ /* 50+ recipes */ ],
  "mealPlans": {
    "user-001_2025-10-13": {
      "id": "mealplan-001",
      "userId": "user-001",
      "weekStart": "2025-10-13T00:00:00Z",
      "meals": {
        "monday": {
          "breakfast": "recipe-001",
          "lunch": "recipe-012",
          "dinner": "recipe-045"
        },
        "tuesday": { ... }
      },
      "createdAt": "2025-10-12T08:00:00Z",
      "updatedAt": "2025-10-12T14:20:00Z"
    }
  },
  "shoppingLists": {
    "user-001_mealplan-001": {
      "id": "shoppinglist-001",
      "userId": "user-001",
      "mealPlanId": "mealplan-001",
      "weekStart": "2025-10-13T00:00:00Z",
      "items": [ ... ],
      "checkedCount": 5,
      "totalCount": 25,
      "createdAt": "2025-10-12T14:30:00Z",
      "updatedAt": "2025-10-12T18:45:00Z"
    }
  },
  "activities": {
    "user-001": [
      {
        "id": "activity-001",
        "userId": "user-001",
        "action": "add_meal",
        "details": "Added Grilled Chicken Caesar to Monday Lunch",
        "timestamp": "2025-10-12T14:15:00Z",
        "relatedId": "recipe-001"
      }
    ]
  },
  "authToken": "mock-jwt-token-abc123",
  "currentUserId": "user-001"
}
```

---

## Data Relationships

### Entity Relationship Diagram

```
User
  ├─→ MealPlan (1:many) - userId
  ├─→ ShoppingList (1:many) - userId
  ├─→ Activity (1:many) - userId
  └─→ Recipe (many:many via favorites array)

MealPlan
  ├─→ Recipe (many:many via meal slots)
  └─→ ShoppingList (1:1) - mealPlanId

ShoppingList
  └─→ ShoppingListItem (1:many) - nested

Recipe
  └─→ Ingredient (1:many) - nested
```

### Data Access Patterns

**Get user's current week meal plan:**
```typescript
const weekStart = getWeekStartDate(new Date());
const key = `${userId}_${weekStart.toISOString().split('T')[0]}`;
const mealPlan = mealPlans[key];
```

**Get user's shopping list for meal plan:**
```typescript
const key = `${userId}_${mealPlanId}`;
const shoppingList = shoppingLists[key];
```

**Get user's favorited recipes:**
```typescript
const user = users.find(u => u.id === userId);
const favoriteRecipes = recipes.filter(r => user.favorites.includes(r.id));
```

---

## Example Mock Data

### Complete Example: Week of Meals

```typescript
const exampleMealPlan: MealPlan = {
  id: 'mealplan-001',
  userId: 'user-001',
  weekStart: new Date('2025-10-13'),  // Sunday
  meals: {
    sunday: {
      breakfast: 'recipe-005',  // Fluffy Pancakes
      lunch: 'recipe-001',      // Grilled Chicken Caesar Salad
      dinner: 'recipe-020',     // Spaghetti Bolognese
    },
    monday: {
      breakfast: 'recipe-008',  // Greek Yogurt Parfait
      lunch: 'recipe-012',      // Quinoa Buddha Bowl
      dinner: 'recipe-025',     // Grilled Salmon with Asparagus
    },
    tuesday: {
      breakfast: 'recipe-005',  // Fluffy Pancakes (repeated)
      lunch: 'recipe-030',      // Chicken Wrap
      dinner: 'recipe-035',     // Beef Stir-Fry
    },
    wednesday: {
      breakfast: 'recipe-010',  // Avocado Toast
      lunch: 'recipe-001',      // Caesar Salad (repeated)
      dinner: 'recipe-040',     // Vegetarian Curry
      snacks: ['recipe-050', 'recipe-051'],  // Fruit salad, Trail mix
    },
    thursday: {
      breakfast: 'recipe-008',  // Greek Yogurt (repeated)
      lunch: 'recipe-045',      // Turkey Sandwich
      dinner: 'recipe-025',     // Salmon (repeated)
    },
    friday: {
      // Pizza night - eating out, no meals planned
    },
    saturday: {
      breakfast: 'recipe-015',  // Egg Scramble
      lunch: 'recipe-048',      // Soup & Salad
      dinner: 'recipe-052',     // BBQ Chicken
    },
  },
  createdAt: new Date('2025-10-12T08:00:00Z'),
  updatedAt: new Date('2025-10-12T14:20:00Z'),
};
```

### Complete Example: Shopping List

```typescript
const exampleShoppingList: ShoppingList = {
  id: 'shoppinglist-001',
  userId: 'user-001',
  mealPlanId: 'mealplan-001',
  weekStart: new Date('2025-10-13'),
  items: [
    // Produce
    {
      id: 'item-001',
      name: 'Romaine lettuce',
      quantity: '2',
      unit: 'heads',
      category: 'Produce',
      checked: false,
      recipeIds: ['recipe-001'],
      addedManually: false,
    },
    {
      id: 'item-002',
      name: 'Avocado',
      quantity: '4',
      unit: 'whole',
      category: 'Produce',
      checked: true,
      recipeIds: ['recipe-010'],
      addedManually: false,
    },
    // Dairy
    {
      id: 'item-003',
      name: 'Parmesan cheese',
      quantity: '0.5',
      unit: 'cup',
      category: 'Dairy',
      checked: false,
      recipeIds: ['recipe-001', 'recipe-020'],
      addedManually: false,
    },
    // Meat
    {
      id: 'item-004',
      name: 'Chicken breast',
      quantity: '4',
      unit: 'lbs',
      category: 'Meat & Seafood',
      checked: false,
      recipeIds: ['recipe-001', 'recipe-030'],
      addedManually: false,
    },
    {
      id: 'item-005',
      name: 'Salmon fillets',
      quantity: '2',
      unit: 'lbs',
      category: 'Meat & Seafood',
      checked: false,
      recipeIds: ['recipe-025'],
      addedManually: false,
    },
    // Pantry (manually added)
    {
      id: 'item-006',
      name: 'Paper towels',
      quantity: '1',
      unit: 'pack',
      category: 'Other',
      checked: false,
      addedManually: true,
    },
    // ... (total 25 items)
  ],
  checkedCount: 1,
  totalCount: 25,
  createdAt: new Date('2025-10-12T14:30:00Z'),
  updatedAt: new Date('2025-10-12T18:45:00Z'),
};
```

---

## Implementation Notes

### Service Layer Integration

All data access should go through service methods, never directly to localStorage:

```typescript
// ❌ Bad: Direct access
const users = JSON.parse(localStorage.getItem('users') || '[]');

// ✅ Good: Through service
const users = UserService.getAllUsers();
```

### Data Validation

Validate data before storing:

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  hashedPassword: z.string(),
  preferences: z.object({
    dietary: z.array(z.string()),
    allergies: z.array(z.string()),
    householdSize: z.number().min(1).max(10),
    onboardingCompleted: z.boolean(),
  }),
  favorites: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Validate before storing
try {
  UserSchema.parse(newUser);
  StorageService.setItem('users', updatedUsers);
} catch (error) {
  console.error('Invalid user data:', error);
}
```

### Migration to Real API

When swapping localStorage for real API:

1. **Update service implementations** (keep interfaces identical)
2. **Change storage calls to HTTP requests**
3. **Update data keys to API endpoints**

```typescript
// Before (localStorage)
class MockMealPlanService implements IMealPlanService {
  async getMealPlan(userId: string, weekStart: Date): Promise<MealPlan> {
    const key = `${userId}_${formatDate(weekStart)}`;
    const mealPlans = StorageService.getItem('mealPlans') || {};
    return mealPlans[key];
  }
}

// After (API)
class ApiMealPlanService implements IMealPlanService {
  async getMealPlan(userId: string, weekStart: Date): Promise<MealPlan> {
    const response = await fetch(`/api/users/${userId}/meal-plans?week=${formatDate(weekStart)}`);
    return response.json();
  }
}
```

---

**End of Mock Data Specification**

For service interface definitions, see [API_CONTRACT.md](./API_CONTRACT.md).
