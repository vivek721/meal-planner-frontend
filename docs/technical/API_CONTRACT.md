# API Contract - Service Interface Definitions
## AI-Powered Meal Planner

---

**Version:** 1.0
**Last Updated:** 2025-10-12
**Purpose:** Define all service interfaces for easy backend integration

---

## Table of Contents

1. [Overview](#overview)
2. [Service Layer Architecture](#service-layer-architecture)
3. [Authentication Service](#authentication-service)
4. [User Service](#user-service)
5. [Recipe Service](#recipe-service)
6. [Meal Plan Service](#meal-plan-service)
7. [Shopping List Service](#shopping-list-service)
8. [Activity Service](#activity-service)
9. [Mock AI Service](#mock-ai-service)
10. [Storage Service](#storage-service)
11. [Migration Guide](#migration-guide)

---

## Overview

This document defines the **service layer contracts** for the AI-Powered Meal Planner. All services follow the **Interface Segregation Principle**, making it trivial to swap mock implementations for real API calls.

### Key Principles

1. **Interface-Driven**: All services implement TypeScript interfaces
2. **Async by Default**: All methods return Promises (future-proof for API calls)
3. **Type-Safe**: Full TypeScript typing for requests and responses
4. **Error Handling**: Consistent error patterns across services
5. **Mock & Real Implementations**: Easy to swap implementations

---

## Service Layer Architecture

### Dependency Injection Pattern

```typescript
// Service configuration
const config = {
  useMockServices: true,  // Toggle for real API
};

// Service factory
export class ServiceFactory {
  static getAuthService(): IAuthService {
    return config.useMockServices
      ? new MockAuthService()
      : new ApiAuthService();
  }

  static getMealPlanService(): IMealPlanService {
    return config.useMockServices
      ? new MockMealPlanService()
      : new ApiMealPlanService();
  }

  // ... other services
}
```

### Service Usage in Components

```typescript
// In React components
const authService = ServiceFactory.getAuthService();
const user = await authService.getCurrentUser();
```

---

## Authentication Service

### Interface Definition

```typescript
// src/services/interfaces/IAuthService.ts

export interface IAuthService {
  /**
   * Register a new user
   */
  register(email: string, password: string, name: string): Promise<AuthResponse>;

  /**
   * Log in an existing user
   */
  login(email: string, password: string): Promise<AuthResponse>;

  /**
   * Log out current user
   */
  logout(): Promise<void>;

  /**
   * Get currently authenticated user
   */
  getCurrentUser(): Promise<User | null>;

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): Promise<boolean>;

  /**
   * Refresh auth token
   */
  refreshToken(): Promise<AuthResponse>;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: Date;
}
```

### Mock Implementation

```typescript
// src/services/mock/MockAuthService.ts

import { IAuthService, AuthResponse } from '../interfaces/IAuthService';
import { User } from '../../types/user.types';
import { StorageService } from '../storage.service';
import bcrypt from 'bcryptjs';  // For password hashing (mock)
import { v4 as uuidv4 } from 'uuid';

export class MockAuthService implements IAuthService {
  private storage = StorageService.getInstance();

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const users: User[] = this.storage.getItem('users') || [];

    // Check if email exists
    if (users.some(u => u.email === email)) {
      throw new Error('Email already exists');
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);  // Mock hash
    const newUser: User = {
      id: uuidv4(),
      email,
      name,
      hashedPassword,
      preferences: {
        dietary: [],
        allergies: [],
        householdSize: 2,
        onboardingCompleted: false,
      },
      favorites: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.push(newUser);
    this.storage.setItem('users', users);

    // Generate token
    const token = this.generateToken(newUser.id);
    this.storage.setItem('authToken', token);
    this.storage.setItem('currentUserId', newUser.id);

    return {
      user: newUser,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),  // 7 days
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const users: User[] = this.storage.getItem('users') || [];
    const user = users.find(u => u.email === email);

    if (!user) {
      throw new Error('User not found');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isValid) {
      throw new Error('Invalid password');
    }

    // Generate token
    const token = this.generateToken(user.id);
    this.storage.setItem('authToken', token);
    this.storage.setItem('currentUserId', user.id);

    return {
      user,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
  }

  async logout(): Promise<void> {
    this.storage.removeItem('authToken');
    this.storage.removeItem('currentUserId');
  }

  async getCurrentUser(): Promise<User | null> {
    const userId = this.storage.getItem('currentUserId');
    if (!userId) return null;

    const users: User[] = this.storage.getItem('users') || [];
    return users.find(u => u.id === userId) || null;
  }

  async isAuthenticated(): Promise<boolean> {
    const token = this.storage.getItem('authToken');
    return !!token;
  }

  async refreshToken(): Promise<AuthResponse> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const token = this.generateToken(user.id);
    this.storage.setItem('authToken', token);

    return {
      user,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
  }

  private generateToken(userId: string): string {
    // Mock JWT token
    return `mock-jwt-${userId}-${Date.now()}`;
  }
}
```

### Real API Implementation (Future)

```typescript
// src/services/api/ApiAuthService.ts

export class ApiAuthService implements IAuthService {
  private baseUrl = process.env.VITE_API_URL || 'https://api.mealplanner.com';

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const data = await response.json();
    return {
      user: data.user,
      token: data.token,
      expiresAt: new Date(data.expiresAt),
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('authToken', data.token);

    return {
      user: data.user,
      token: data.token,
      expiresAt: new Date(data.expiresAt),
    };
  }

  async logout(): Promise<void> {
    const token = localStorage.getItem('authToken');
    await fetch(`${this.baseUrl}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    localStorage.removeItem('authToken');
  }

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    const response = await fetch(`${this.baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.user;
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  }

  async refreshToken(): Promise<AuthResponse> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Token refresh failed');

    const data = await response.json();
    localStorage.setItem('authToken', data.token);

    return {
      user: data.user,
      token: data.token,
      expiresAt: new Date(data.expiresAt),
    };
  }
}
```

---

## User Service

### Interface Definition

```typescript
// src/services/interfaces/IUserService.ts

export interface IUserService {
  /**
   * Get user by ID
   */
  getUser(userId: string): Promise<User>;

  /**
   * Update user profile
   */
  updateUser(userId: string, updates: Partial<User>): Promise<User>;

  /**
   * Update user preferences
   */
  updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<User>;

  /**
   * Update user password
   */
  updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;

  /**
   * Delete user account
   */
  deleteAccount(userId: string, password: string): Promise<void>;

  /**
   * Export user data (GDPR compliance)
   */
  exportData(userId: string): Promise<UserDataExport>;
}

export interface UserDataExport {
  user: User;
  mealPlans: MealPlan[];
  shoppingLists: ShoppingList[];
  activities: Activity[];
  exportDate: Date;
}
```

### Request/Response Examples

**Update Preferences Request:**
```typescript
{
  "dietary": ["Vegan", "Gluten-Free"],
  "allergies": ["Peanuts"],
  "householdSize": 4
}
```

**Update Preferences Response:**
```typescript
{
  "id": "user-001",
  "email": "sarah@example.com",
  "name": "Sarah Johnson",
  "preferences": {
    "dietary": ["Vegan", "Gluten-Free"],
    "allergies": ["Peanuts"],
    "householdSize": 4,
    "onboardingCompleted": true
  },
  "favorites": ["recipe-001", "recipe-012"],
  "createdAt": "2025-09-15T10:00:00Z",
  "updatedAt": "2025-10-12T14:30:00Z"
}
```

---

## Recipe Service

### Interface Definition

```typescript
// src/services/interfaces/IRecipeService.ts

export interface IRecipeService {
  /**
   * Get all recipes with optional filters
   */
  getRecipes(filters?: RecipeFilters, pagination?: Pagination): Promise<RecipeListResponse>;

  /**
   * Get recipe by ID
   */
  getRecipeById(recipeId: string): Promise<Recipe>;

  /**
   * Search recipes by query
   */
  searchRecipes(query: string, filters?: RecipeFilters): Promise<RecipeListResponse>;

  /**
   * Get user's favorited recipes
   */
  getFavorites(userId: string): Promise<Recipe[]>;

  /**
   * Toggle recipe favorite
   */
  toggleFavorite(userId: string, recipeId: string): Promise<{ favorited: boolean }>;

  /**
   * Get related recipes
   */
  getRelatedRecipes(recipeId: string, limit?: number): Promise<Recipe[]>;
}

export interface RecipeFilters {
  category?: RecipeCategory;
  dietary?: string[];         // e.g., ['Vegan', 'Keto']
  excludeAllergens?: string[];
  maxPrepTime?: number;       // Minutes
  difficulty?: RecipeDifficulty;
  tags?: string[];
}

export interface Pagination {
  page: number;
  limit: number;
}

export interface RecipeListResponse {
  recipes: Recipe[];
  total: number;
  page: number;
  totalPages: number;
}
```

### Request/Response Examples

**Get Recipes Request:**
```
GET /api/recipes?category=Dinner&dietary=Vegan&maxPrepTime=30&page=1&limit=20
```

**Get Recipes Response:**
```typescript
{
  "recipes": [
    {
      "id": "recipe-001",
      "name": "Vegan Tacos",
      "description": "...",
      "image": "https://...",
      "category": "Dinner",
      "prepTime": 20,
      "cookTime": 10,
      "totalTime": 30,
      "servings": 4,
      "difficulty": "Easy",
      "ingredients": [...],
      "instructions": [...],
      "nutrition": {...},
      "tags": ["Vegan", "Mexican", "Quick"],
      "rating": 4.5,
      "reviewCount": 89
    },
    // ... more recipes
  ],
  "total": 45,
  "page": 1,
  "totalPages": 3
}
```

**Search Recipes Request:**
```
GET /api/recipes/search?q=chicken&dietary=Keto
```

**Toggle Favorite Request:**
```
POST /api/users/:userId/favorites/:recipeId
```

**Toggle Favorite Response:**
```typescript
{
  "favorited": true
}
```

---

## Meal Plan Service

### Interface Definition

```typescript
// src/services/interfaces/IMealPlanService.ts

export interface IMealPlanService {
  /**
   * Get meal plan for a specific week
   */
  getMealPlan(userId: string, weekStart: Date): Promise<MealPlan | null>;

  /**
   * Create or update meal plan
   */
  saveMealPlan(mealPlan: MealPlan): Promise<MealPlan>;

  /**
   * Add meal to specific slot
   */
  addMealToSlot(
    userId: string,
    date: Date,
    mealType: MealType,
    recipeId: string
  ): Promise<MealPlan>;

  /**
   * Remove meal from slot
   */
  removeMealFromSlot(
    userId: string,
    date: Date,
    mealType: MealType
  ): Promise<MealPlan>;

  /**
   * Copy meals from one day to another
   */
  copyDay(
    userId: string,
    sourceDate: Date,
    targetDates: Date[],
    replaceExisting: boolean
  ): Promise<MealPlan>;

  /**
   * Clear meal plan (full or partial)
   */
  clearPlan(
    userId: string,
    weekStart: Date,
    options?: ClearPlanOptions
  ): Promise<MealPlan>;
}

export interface ClearPlanOptions {
  days?: DayOfWeek[];        // Specific days to clear
  mealTypes?: MealType[];    // Specific meal types to clear
}
```

### Request/Response Examples

**Get Meal Plan Request:**
```
GET /api/users/:userId/meal-plans?weekStart=2025-10-13
```

**Get Meal Plan Response:**
```typescript
{
  "id": "mealplan-001",
  "userId": "user-001",
  "weekStart": "2025-10-13T00:00:00Z",
  "meals": {
    "sunday": {
      "breakfast": "recipe-005",
      "lunch": "recipe-001",
      "dinner": "recipe-020"
    },
    "monday": {
      "breakfast": "recipe-008",
      "lunch": "recipe-012",
      "dinner": "recipe-025"
    },
    // ... rest of week
  },
  "createdAt": "2025-10-12T08:00:00Z",
  "updatedAt": "2025-10-12T14:20:00Z"
}
```

**Add Meal to Slot Request:**
```
POST /api/users/:userId/meal-plans/add-meal
{
  "date": "2025-10-14",
  "mealType": "dinner",
  "recipeId": "recipe-045"
}
```

**Copy Day Request:**
```
POST /api/users/:userId/meal-plans/copy-day
{
  "sourceDate": "2025-10-13",
  "targetDates": ["2025-10-20", "2025-10-27"],
  "replaceExisting": true
}
```

---

## Shopping List Service

### Interface Definition

```typescript
// src/services/interfaces/IShoppingListService.ts

export interface IShoppingListService {
  /**
   * Generate shopping list from meal plan
   */
  generateFromMealPlan(mealPlan: MealPlan): Promise<ShoppingList>;

  /**
   * Get shopping list by ID
   */
  getShoppingList(userId: string, listId: string): Promise<ShoppingList | null>;

  /**
   * Add item manually
   */
  addItem(listId: string, item: Omit<ShoppingListItem, 'id'>): Promise<ShoppingList>;

  /**
   * Update item
   */
  updateItem(
    listId: string,
    itemId: string,
    updates: Partial<ShoppingListItem>
  ): Promise<ShoppingList>;

  /**
   * Remove item
   */
  removeItem(listId: string, itemId: string): Promise<ShoppingList>;

  /**
   * Check/uncheck item
   */
  checkItem(listId: string, itemId: string, checked: boolean): Promise<ShoppingList>;

  /**
   * Uncheck all items
   */
  uncheckAll(listId: string): Promise<ShoppingList>;

  /**
   * Generate shareable link
   */
  shareList(listId: string): Promise<{ shareUrl: string; shareId: string }>;
}
```

### Request/Response Examples

**Generate Shopping List Request:**
```
POST /api/shopping-lists/generate
{
  "mealPlanId": "mealplan-001"
}
```

**Generate Shopping List Response:**
```typescript
{
  "id": "shoppinglist-001",
  "userId": "user-001",
  "mealPlanId": "mealplan-001",
  "weekStart": "2025-10-13T00:00:00Z",
  "items": [
    {
      "id": "item-001",
      "name": "Chicken breast",
      "quantity": "4",
      "unit": "lbs",
      "category": "Meat & Seafood",
      "checked": false,
      "recipeIds": ["recipe-001", "recipe-030"],
      "addedManually": false
    },
    // ... more items
  ],
  "checkedCount": 0,
  "totalCount": 25,
  "createdAt": "2025-10-12T14:30:00Z",
  "updatedAt": "2025-10-12T14:30:00Z"
}
```

**Add Item Request:**
```
POST /api/shopping-lists/:listId/items
{
  "name": "Paper towels",
  "quantity": "1",
  "unit": "pack",
  "category": "Other",
  "addedManually": true
}
```

**Check Item Request:**
```
PATCH /api/shopping-lists/:listId/items/:itemId
{
  "checked": true
}
```

**Share List Request:**
```
POST /api/shopping-lists/:listId/share
```

**Share List Response:**
```typescript
{
  "shareUrl": "https://app.mealplanner.com/shared/abc123xyz",
  "shareId": "abc123xyz"
}
```

---

## Activity Service

### Interface Definition

```typescript
// src/services/interfaces/IActivityService.ts

export interface IActivityService {
  /**
   * Log a user activity
   */
  logActivity(
    userId: string,
    action: ActivityAction,
    details: string,
    relatedId?: string
  ): Promise<Activity>;

  /**
   * Get user's activity feed
   */
  getActivities(userId: string, limit?: number): Promise<Activity[]>;

  /**
   * Clear old activities (keep last N)
   */
  pruneActivities(userId: string, keepLast: number): Promise<void>;
}
```

### Request/Response Examples

**Log Activity Request:**
```
POST /api/users/:userId/activities
{
  "action": "add_meal",
  "details": "Added Grilled Chicken Caesar to Monday Lunch",
  "relatedId": "recipe-001"
}
```

**Get Activities Request:**
```
GET /api/users/:userId/activities?limit=10
```

**Get Activities Response:**
```typescript
[
  {
    "id": "activity-001",
    "userId": "user-001",
    "action": "add_meal",
    "details": "Added Grilled Chicken Caesar to Monday Lunch",
    "timestamp": "2025-10-12T14:15:00Z",
    "relatedId": "recipe-001"
  },
  {
    "id": "activity-002",
    "userId": "user-001",
    "action": "favorite_recipe",
    "details": "Favorited Quinoa Buddha Bowl",
    "timestamp": "2025-10-12T13:45:00Z",
    "relatedId": "recipe-012"
  },
  // ... more activities
]
```

---

## Mock AI Service

### Interface Definition

```typescript
// src/services/interfaces/IMockAIService.ts

export interface IMockAIService {
  /**
   * Generate personalized meal suggestions
   */
  generateSuggestions(
    user: User,
    mealPlan: MealPlan | null,
    recipes: Recipe[],
    count?: number
  ): Promise<SuggestionResult[]>;

  /**
   * Calculate nutrition balance score
   */
  calculateBalanceScore(mealPlan: MealPlan, recipes: Recipe[]): Promise<NutritionBalance>;

  /**
   * Get ingredient substitutions
   */
  getSubstitutions(
    ingredientName: string,
    userPreferences: UserPreferences
  ): Promise<IngredientSubstitution[]>;
}

export interface IngredientSubstitution {
  substitute: string;
  conversionRatio: string;        // e.g., "1:1" or "Use 2x amount"
  impact: string;                 // e.g., "May alter flavor slightly"
  dietaryCompatible: boolean;
}
```

### Request/Response Examples

**Generate Suggestions Request:**
```
POST /api/ai/suggestions
{
  "userId": "user-001",
  "mealPlanId": "mealplan-001",
  "count": 8
}
```

**Generate Suggestions Response:**
```typescript
[
  {
    "recipe": { /* Full recipe object */ },
    "score": 85,
    "reason": "Based on your Keto preference",
    "factors": [
      {
        "name": "Dietary Match",
        "points": 10,
        "description": "Matches Keto diet"
      },
      {
        "name": "Favorites Similarity",
        "points": 5,
        "description": "Similar to your favorite recipes"
      }
    ]
  },
  // ... more suggestions
]
```

**Calculate Balance Score Request:**
```
POST /api/ai/nutrition-balance
{
  "mealPlanId": "mealplan-001"
}
```

**Calculate Balance Score Response:**
```typescript
{
  "dailyBreakdown": [
    {
      "date": "2025-10-13T00:00:00Z",
      "dayName": "Sunday",
      "nutrition": {
        "calories": 2100,
        "protein": 150,
        "carbohydrates": 200,
        "fat": 80
      },
      "mealCount": 3
    },
    // ... rest of week
  ],
  "weeklyAverage": {
    "calories": 2000,
    "protein": 145,
    "carbohydrates": 190,
    "fat": 75
  },
  "balanceScore": 82,
  "insights": [
    "Great job! Your meals are well-balanced this week.",
    "Consider adding more vegetables on Thursday."
  ]
}
```

**Get Substitutions Request:**
```
POST /api/ai/substitutions
{
  "ingredientName": "Greek yogurt",
  "userPreferences": {
    "dietary": ["Vegan"],
    "allergies": []
  }
}
```

**Get Substitutions Response:**
```typescript
[
  {
    "substitute": "Coconut yogurt",
    "conversionRatio": "1:1",
    "impact": "Slightly different flavor profile",
    "dietaryCompatible": true
  },
  {
    "substitute": "Almond yogurt",
    "conversionRatio": "1:1",
    "impact": "Nutty flavor, similar texture",
    "dietaryCompatible": true
  }
]
```

---

## Storage Service

### Interface Definition

```typescript
// src/services/interfaces/IStorageService.ts

export interface IStorageService {
  /**
   * Get item from storage
   */
  getItem<T>(key: string): T | null;

  /**
   * Set item in storage
   */
  setItem<T>(key: string, value: T): void;

  /**
   * Remove item from storage
   */
  removeItem(key: string): void;

  /**
   * Clear all storage
   */
  clear(): void;

  /**
   * Get all keys
   */
  keys(): string[];

  /**
   * Check if key exists
   */
  hasItem(key: string): boolean;

  /**
   * Get storage size (bytes)
   */
  getSize(): number;

  /**
   * Check if quota exceeded
   */
  isQuotaExceeded(): boolean;
}
```

### Implementation Notes

**Mock (localStorage):**
```typescript
export class LocalStorageService implements IStorageService {
  getItem<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded');
        throw new Error('Storage quota exceeded. Please clear some data.');
      }
      throw error;
    }
  }

  // ... other methods
}
```

---

## Migration Guide

### Step 1: Create API Service Implementations

For each service interface, create an API implementation:

```typescript
// src/services/api/ApiMealPlanService.ts
export class ApiMealPlanService implements IMealPlanService {
  private baseUrl = process.env.VITE_API_URL;

  async getMealPlan(userId: string, weekStart: Date): Promise<MealPlan | null> {
    const response = await fetch(
      `${this.baseUrl}/users/${userId}/meal-plans?weekStart=${weekStart.toISOString()}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Failed to fetch meal plan');

    return response.json();
  }

  // ... implement other methods
}
```

### Step 2: Update Service Factory

```typescript
// src/services/ServiceFactory.ts
const USE_MOCK_SERVICES = import.meta.env.VITE_USE_MOCK_SERVICES === 'true';

export class ServiceFactory {
  static getMealPlanService(): IMealPlanService {
    return USE_MOCK_SERVICES
      ? new MockMealPlanService()
      : new ApiMealPlanService();
  }

  // ... other factories
}
```

### Step 3: Configure Environment

```bash
# .env.development (local dev with mocks)
VITE_USE_MOCK_SERVICES=true

# .env.production (production with real API)
VITE_USE_MOCK_SERVICES=false
VITE_API_URL=https://api.mealplanner.com
```

### Step 4: Update Components (No Changes Needed!)

Components don't need changes because they use the service interfaces:

```typescript
// This works with both mock and real implementations
const mealPlanService = ServiceFactory.getMealPlanService();
const mealPlan = await mealPlanService.getMealPlan(userId, weekStart);
```

### Backend API Expectations

Your backend API should implement these endpoints:

```
Authentication:
POST   /auth/register
POST   /auth/login
POST   /auth/logout
GET    /auth/me
POST   /auth/refresh

Users:
GET    /users/:userId
PATCH  /users/:userId
DELETE /users/:userId
PATCH  /users/:userId/preferences
PATCH  /users/:userId/password
GET    /users/:userId/export

Recipes:
GET    /recipes
GET    /recipes/:recipeId
GET    /recipes/search
GET    /users/:userId/favorites
POST   /users/:userId/favorites/:recipeId
DELETE /users/:userId/favorites/:recipeId

Meal Plans:
GET    /users/:userId/meal-plans
POST   /users/:userId/meal-plans
PATCH  /users/:userId/meal-plans/:planId
DELETE /users/:userId/meal-plans/:planId
POST   /users/:userId/meal-plans/add-meal
POST   /users/:userId/meal-plans/copy-day

Shopping Lists:
POST   /shopping-lists/generate
GET    /shopping-lists/:listId
POST   /shopping-lists/:listId/items
PATCH  /shopping-lists/:listId/items/:itemId
DELETE /shopping-lists/:listId/items/:itemId
POST   /shopping-lists/:listId/share

Activities:
GET    /users/:userId/activities
POST   /users/:userId/activities

AI Features:
POST   /ai/suggestions
POST   /ai/nutrition-balance
POST   /ai/substitutions
```

---

## Error Handling

### Standard Error Response Format

All API errors should follow this format:

```typescript
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Meal plan not found",
    "details": {
      "userId": "user-001",
      "weekStart": "2025-10-13"
    }
  }
}
```

### Error Codes

```typescript
export enum ErrorCode {
  // Authentication
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // Resources
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Server
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}
```

### Error Handling in Services

```typescript
async getMealPlan(userId: string, weekStart: Date): Promise<MealPlan | null> {
  try {
    const response = await fetch(`${this.baseUrl}/users/${userId}/meal-plans?weekStart=${weekStart.toISOString()}`);

    if (response.status === 404) {
      return null;  // Not found is expected, return null
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch meal plan');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching meal plan:', error);
    throw error;  // Re-throw for component to handle
  }
}
```

---

**End of API Contract Document**

This contract serves as the single source of truth for all service interfaces. When implementing real backend APIs, ensure they match these contracts for seamless integration.

For data structure details, see [MOCK_DATA_SPEC.md](./MOCK_DATA_SPEC.md).
