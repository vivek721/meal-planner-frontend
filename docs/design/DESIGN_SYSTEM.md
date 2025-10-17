# Design System Documentation
## AI-Powered Meal Planner

---

**Version:** 1.0
**Last Updated:** 2025-10-12
**Status:** Active

---

## Table of Contents

1. [Introduction](#introduction)
2. [Design Principles](#design-principles)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing & Layout](#spacing--layout)
6. [Components Library](#components-library)
7. [Responsive Design](#responsive-design)
8. [Accessibility Guidelines](#accessibility-guidelines)
9. [Animation & Transitions](#animation--transitions)
10. [Usage Examples](#usage-examples)

---

## Introduction

This design system provides a comprehensive set of guidelines, components, and patterns for building the AI-Powered Meal Planner. It ensures consistency, accessibility, and maintainability across the entire application.

### Goals
- **Consistency**: Unified visual language across all pages
- **Efficiency**: Reusable components accelerate development
- **Accessibility**: WCAG 2.1 AA compliant by default
- **Scalability**: Easy to extend and maintain

### Technology Stack
- **Styling**: Tailwind CSS 3.x with custom configuration
- **Icons**: Lucide React (consistent, modern icon set)
- **Fonts**: Inter (Google Fonts)

---

## Design Principles

### 1. Clarity
Every element should have a clear purpose. Avoid unnecessary decoration that doesn't serve user goals.

### 2. Consistency
Use established patterns. Don't reinvent interactions—leverage familiar UI paradigms.

### 3. Feedback
Provide immediate visual feedback for user actions (loading states, success/error messages, hover effects).

### 4. Accessibility First
Design for all users, including those with disabilities. Color is never the only indicator.

### 5. Mobile-First
Design for small screens first, then enhance for larger viewports.

---

## Color System

### Primary Colors

```css
Primary (Teal)
--color-primary-50:  #f0fdfa
--color-primary-100: #ccfbf1
--color-primary-200: #99f6e4
--color-primary-300: #5eead4
--color-primary-400: #2dd4bf
--color-primary-500: #14b8a6  /* Main brand color */
--color-primary-600: #0d9488
--color-primary-700: #0f766e
--color-primary-800: #115e59
--color-primary-900: #134e4a
```

**Usage**: Primary CTAs, links, active states, brand elements

**Tailwind Classes**: `bg-primary-500`, `text-primary-600`, `border-primary-400`

### Secondary Colors

```css
Secondary (Orange)
--color-secondary-50:  #fff7ed
--color-secondary-100: #ffedd5
--color-secondary-200: #fed7aa
--color-secondary-300: #fdba74
--color-secondary-400: #fb923c
--color-secondary-500: #f97316  /* Accent color */
--color-secondary-600: #ea580c
--color-secondary-700: #c2410c
--color-secondary-800: #9a3412
--color-secondary-900: #7c2d12
```

**Usage**: Accent elements, notifications, highlights, secondary CTAs

**Tailwind Classes**: `bg-secondary-500`, `text-secondary-600`

### Semantic Colors

```css
Success (Green)
--color-success-50:  #f0fdf4
--color-success-100: #dcfce7
--color-success-500: #22c55e  /* Success actions */
--color-success-600: #16a34a
--color-success-700: #15803d

Warning (Yellow)
--color-warning-50:  #fefce8
--color-warning-100: #fef9c3
--color-warning-500: #eab308  /* Warning messages */
--color-warning-600: #ca8a04
--color-warning-700: #a16207

Error (Red)
--color-error-50:  #fef2f2
--color-error-100: #fee2e2
--color-error-500: #ef4444  /* Error states */
--color-error-600: #dc2626
--color-error-700: #b91c1c

Info (Blue)
--color-info-50:  #eff6ff
--color-info-100: #dbeafe
--color-info-500: #3b82f6  /* Informational messages */
--color-info-600: #2563eb
--color-info-700: #1d4ed8
```

**Usage**:
- Success: Completed actions, positive feedback
- Warning: Cautions, important notices
- Error: Validation errors, failed operations
- Info: Helpful tips, neutral information

### Neutral Colors (Grays)

```css
--color-gray-50:  #f9fafb
--color-gray-100: #f3f4f6
--color-gray-200: #e5e7eb
--color-gray-300: #d1d5db
--color-gray-400: #9ca3af
--color-gray-500: #6b7280
--color-gray-600: #4b5563
--color-gray-700: #374151
--color-gray-800: #1f2937
--color-gray-900: #111827
```

**Usage**: Text, backgrounds, borders, subtle dividers

**Common Combinations**:
- Body text: `text-gray-700` on `bg-white`
- Secondary text: `text-gray-500`
- Borders: `border-gray-200`
- Disabled state: `text-gray-400 bg-gray-100`

### Background Colors

```css
--color-bg-primary:   #ffffff  /* Main content background */
--color-bg-secondary: #f9fafb  /* Subtle backgrounds (cards, sidebars) */
--color-bg-tertiary:  #f3f4f6  /* Even more subtle (table rows, inputs) */
--color-bg-dark:      #1f2937  /* Dark mode primary (future) */
```

### Color Accessibility

All color combinations meet **WCAG 2.1 AA** contrast requirements:

| Foreground | Background | Contrast Ratio | Pass? |
|------------|------------|----------------|-------|
| `text-gray-700` | `bg-white` | 10.2:1 | ✅ AAA |
| `text-gray-600` | `bg-white` | 7.5:1 | ✅ AAA |
| `text-gray-500` | `bg-white` | 4.6:1 | ✅ AA |
| `text-primary-600` | `bg-white` | 4.7:1 | ✅ AA |
| `text-white` | `bg-primary-500` | 4.5:1 | ✅ AA |
| `text-white` | `bg-secondary-500` | 4.8:1 | ✅ AA |

**Rule**: Never use colors alone to convey information. Always pair with icons, text, or patterns.

---

## Typography

### Font Family

```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
                'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;

--font-mono: 'Courier New', Courier, monospace;
```

**Inter** is a modern, highly readable sans-serif optimized for screens.

**Import** (in HTML or CSS):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Type Scale

| Element | Size | Line Height | Weight | Tailwind Class |
|---------|------|-------------|--------|----------------|
| **H1** | 36px | 40px (1.11) | 700 | `text-4xl font-bold` |
| **H2** | 30px | 36px (1.2) | 700 | `text-3xl font-bold` |
| **H3** | 24px | 32px (1.33) | 600 | `text-2xl font-semibold` |
| **H4** | 20px | 28px (1.4) | 600 | `text-xl font-semibold` |
| **H5** | 18px | 28px (1.56) | 600 | `text-lg font-semibold` |
| **H6** | 16px | 24px (1.5) | 600 | `text-base font-semibold` |
| **Body Large** | 18px | 28px (1.56) | 400 | `text-lg` |
| **Body** | 16px | 24px (1.5) | 400 | `text-base` |
| **Body Small** | 14px | 20px (1.43) | 400 | `text-sm` |
| **Caption** | 12px | 16px (1.33) | 400 | `text-xs` |

### Font Weights

```css
--font-normal:    400  /* Body text */
--font-medium:    500  /* Emphasis */
--font-semibold:  600  /* Subheadings, buttons */
--font-bold:      700  /* Headings, strong emphasis */
```

**Tailwind Classes**: `font-normal`, `font-medium`, `font-semibold`, `font-bold`

### Text Colors

```css
--text-primary:   text-gray-900  /* Headings, primary content */
--text-secondary: text-gray-600  /* Body text, descriptions */
--text-tertiary:  text-gray-500  /* Captions, metadata */
--text-disabled:  text-gray-400  /* Disabled elements */
--text-inverse:   text-white     /* On dark backgrounds */
--text-link:      text-primary-600  /* Links */
--text-error:     text-error-600    /* Error messages */
```

### Typography Examples

```html
<!-- Page Title -->
<h1 class="text-4xl font-bold text-gray-900 mb-4">
  My Meal Plan
</h1>

<!-- Section Heading -->
<h2 class="text-2xl font-semibold text-gray-800 mb-3">
  This Week's Meals
</h2>

<!-- Body Text -->
<p class="text-base text-gray-600 leading-relaxed">
  Plan your meals for the week and generate a shopping list automatically.
</p>

<!-- Caption -->
<span class="text-xs text-gray-500">
  Last updated: 2 hours ago
</span>
```

---

## Spacing & Layout

### Spacing Scale

Based on **4px grid system** for consistency:

| Token | Value | Tailwind | Usage |
|-------|-------|----------|--------|
| `xs` | 4px | `space-1` | Icon padding, tight spacing |
| `sm` | 8px | `space-2` | Between related elements |
| `md` | 12px | `space-3` | Standard component padding |
| `base` | 16px | `space-4` | Default spacing |
| `lg` | 24px | `space-6` | Between sections |
| `xl` | 32px | `space-8` | Large gaps |
| `2xl` | 48px | `space-12` | Section breaks |
| `3xl` | 64px | `space-16` | Page sections |

**Margin & Padding Examples**:
```html
<div class="p-4">       <!-- Padding: 16px all sides -->
<div class="px-6 py-4"> <!-- Padding: 24px horizontal, 16px vertical -->
<div class="mb-6">      <!-- Margin bottom: 24px -->
<div class="space-y-4"> <!-- 16px vertical spacing between children -->
```

### Container & Max Width

```css
--container-sm:  640px   /* Small screens */
--container-md:  768px   /* Tablets */
--container-lg:  1024px  /* Desktop */
--container-xl:  1280px  /* Large desktop */
--container-2xl: 1536px  /* Extra large */
```

**Tailwind Usage**:
```html
<div class="container mx-auto px-4 max-w-7xl">
  <!-- Content constrained to max 1280px, centered -->
</div>
```

### Layout Grid

Use CSS Grid or Flexbox with Tailwind utilities:

```html
<!-- 3-column grid on desktop, 1 on mobile -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Flexbox for centering -->
<div class="flex items-center justify-center min-h-screen">
  <div>Centered Content</div>
</div>
```

---

## Components Library

### Component Categories

1. **Atoms** (15): Smallest building blocks
2. **Molecules** (12): Combinations of atoms
3. **Organisms** (8): Complex UI sections
4. **Templates** (3): Page layouts

**Total**: 38 components

---

### Atoms (15 components)

#### 1. Button

**Variants**: Primary, Secondary, Ghost, Danger, Icon

**Primary Button**:
```html
<button class="px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg
               hover:bg-primary-600 focus:outline-none focus:ring-2
               focus:ring-primary-500 focus:ring-offset-2
               transition-colors duration-200">
  Add to Plan
</button>
```

**Secondary Button**:
```html
<button class="px-6 py-3 bg-white text-primary-600 border-2 border-primary-500
               font-semibold rounded-lg hover:bg-primary-50
               focus:outline-none focus:ring-2 focus:ring-primary-500
               transition-colors duration-200">
  View Details
</button>
```

**Ghost Button**:
```html
<button class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg
               focus:outline-none focus:ring-2 focus:ring-gray-300
               transition-colors duration-200">
  Cancel
</button>
```

**Danger Button**:
```html
<button class="px-6 py-3 bg-error-500 text-white font-semibold rounded-lg
               hover:bg-error-600 focus:outline-none focus:ring-2
               focus:ring-error-500 transition-colors duration-200">
  Delete
</button>
```

**Icon Button**:
```html
<button class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg
               focus:outline-none focus:ring-2 focus:ring-gray-300">
  <HeartIcon class="w-5 h-5" />
</button>
```

**Sizes**: Small (`px-4 py-2 text-sm`), Medium (default), Large (`px-8 py-4 text-lg`)

**States**: Default, Hover, Focus, Active, Disabled (`opacity-50 cursor-not-allowed`)

#### 2. Input (Text)

```html
<div class="w-full">
  <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
    Email Address
  </label>
  <input
    type="text"
    id="email"
    class="w-full px-4 py-3 border border-gray-300 rounded-lg
           focus:outline-none focus:ring-2 focus:ring-primary-500
           focus:border-transparent
           placeholder:text-gray-400"
    placeholder="you@example.com"
  />
  <p class="mt-1 text-xs text-gray-500">
    We'll never share your email.
  </p>
</div>
```

**Error State**:
```html
<input class="w-full px-4 py-3 border-2 border-error-500 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-error-500" />
<p class="mt-1 text-sm text-error-600">Please enter a valid email address.</p>
```

**Disabled State**:
```html
<input class="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg
              text-gray-500 cursor-not-allowed" disabled />
```

#### 3. Select / Dropdown

```html
<div class="w-full">
  <label for="diet" class="block text-sm font-medium text-gray-700 mb-2">
    Dietary Preference
  </label>
  <select
    id="diet"
    class="w-full px-4 py-3 border border-gray-300 rounded-lg
           focus:outline-none focus:ring-2 focus:ring-primary-500
           bg-white"
  >
    <option>None</option>
    <option>Vegetarian</option>
    <option>Vegan</option>
    <option>Keto</option>
  </select>
</div>
```

#### 4. Checkbox

```html
<div class="flex items-center space-x-3">
  <input
    type="checkbox"
    id="remember"
    class="w-5 h-5 text-primary-500 border-gray-300 rounded
           focus:ring-2 focus:ring-primary-500"
  />
  <label for="remember" class="text-sm text-gray-700 select-none cursor-pointer">
    Remember me for 30 days
  </label>
</div>
```

#### 5. Radio Button

```html
<div class="space-y-3">
  <div class="flex items-center space-x-3">
    <input
      type="radio"
      name="servings"
      id="serving-2"
      class="w-5 h-5 text-primary-500 border-gray-300
             focus:ring-2 focus:ring-primary-500"
    />
    <label for="serving-2" class="text-sm text-gray-700 cursor-pointer">
      2 servings
    </label>
  </div>
  <div class="flex items-center space-x-3">
    <input type="radio" name="servings" id="serving-4" class="..." />
    <label for="serving-4" class="...">4 servings</label>
  </div>
</div>
```

#### 6. Toggle / Switch

```html
<div class="flex items-center justify-between">
  <span class="text-sm font-medium text-gray-700">Email Notifications</span>
  <button
    type="button"
    class="relative inline-flex h-6 w-11 items-center rounded-full
           bg-gray-300 transition-colors focus:outline-none
           focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    role="switch"
    aria-checked="false"
  >
    <span class="translate-x-1 inline-block h-4 w-4 transform rounded-full
                 bg-white transition-transform" />
  </button>
</div>

<!-- Active state: bg-primary-500, span: translate-x-6 -->
```

#### 7. Badge

```html
<!-- Status badges -->
<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
             bg-success-100 text-success-700">
  Active
</span>

<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
             bg-warning-100 text-warning-700">
  Pending
</span>

<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
             bg-error-100 text-error-700">
  Error
</span>

<!-- Count badge (e.g., notification count) -->
<span class="inline-flex items-center justify-center w-6 h-6 text-xs font-bold
             text-white bg-error-500 rounded-full">
  3
</span>
```

#### 8. Avatar

```html
<!-- With image -->
<img
  src="/user-avatar.jpg"
  alt="User Name"
  class="w-10 h-10 rounded-full object-cover"
/>

<!-- Initials fallback -->
<div class="w-10 h-10 rounded-full bg-primary-500 text-white
            flex items-center justify-center font-semibold text-sm">
  JD
</div>

<!-- Sizes: sm (w-8 h-8), md (w-10 h-10), lg (w-12 h-12), xl (w-16 h-16) -->
```

#### 9. Icon

Use **Lucide React** icons throughout:

```jsx
import { Heart, ShoppingCart, Calendar, Search } from 'lucide-react';

<Heart className="w-5 h-5 text-gray-600" />
<ShoppingCart className="w-6 h-6 text-primary-500" />
```

**Sizes**:
- Small: `w-4 h-4` (16px)
- Medium: `w-5 h-5` (20px)
- Large: `w-6 h-6` (24px)
- XL: `w-8 h-8` (32px)

#### 10. Divider

```html
<!-- Horizontal -->
<hr class="border-t border-gray-200 my-6" />

<!-- With text -->
<div class="relative my-6">
  <div class="absolute inset-0 flex items-center">
    <div class="w-full border-t border-gray-300"></div>
  </div>
  <div class="relative flex justify-center text-sm">
    <span class="px-2 bg-white text-gray-500">Or continue with</span>
  </div>
</div>
```

#### 11. Spinner / Loader

```html
<!-- Spinner -->
<svg
  class="animate-spin h-5 w-5 text-primary-500"
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 24 24"
>
  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
</svg>

<!-- Loading text -->
<div class="flex items-center space-x-2">
  <svg class="animate-spin h-4 w-4 text-primary-500" ...></svg>
  <span class="text-sm text-gray-600">Loading...</span>
</div>
```

#### 12. Tooltip

```html
<!-- Using title attribute (simple) -->
<button title="Add to favorites" class="...">
  <HeartIcon class="w-5 h-5" />
</button>

<!-- Custom tooltip (with library like Headless UI) -->
<div class="relative group">
  <button class="...">Hover me</button>
  <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
              px-3 py-2 bg-gray-900 text-white text-xs rounded-lg
              opacity-0 group-hover:opacity-100 transition-opacity
              pointer-events-none whitespace-nowrap">
    Helpful tooltip text
    <div class="absolute top-full left-1/2 transform -translate-x-1/2
                border-4 border-transparent border-t-gray-900"></div>
  </div>
</div>
```

#### 13. Tag / Chip

```html
<!-- Recipe tags -->
<div class="flex flex-wrap gap-2">
  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs
               bg-gray-100 text-gray-700">
    Vegan
  </span>
  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs
               bg-gray-100 text-gray-700">
    Quick (<30 min)
  </span>
  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs
               bg-gray-100 text-gray-700">
    Gluten-Free
  </span>
</div>

<!-- With remove button -->
<span class="inline-flex items-center px-3 py-1 rounded-full text-xs
             bg-primary-100 text-primary-700 space-x-2">
  <span>Keto</span>
  <button class="hover:text-primary-900">
    <XIcon class="w-3 h-3" />
  </button>
</span>
```

#### 14. Progress Bar

```html
<div class="w-full">
  <div class="flex justify-between text-xs text-gray-600 mb-1">
    <span>Shopping Progress</span>
    <span>12/25 items</span>
  </div>
  <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
    <div class="h-full bg-primary-500 transition-all duration-300"
         style="width: 48%"></div>
  </div>
</div>
```

#### 15. Link

```html
<!-- Standard link -->
<a href="#" class="text-primary-600 hover:text-primary-700 underline">
  Learn more
</a>

<!-- Button-styled link -->
<a href="#" class="inline-flex items-center px-4 py-2 bg-primary-500
                    text-white rounded-lg hover:bg-primary-600 transition-colors">
  Get Started
</a>
```

---

### Molecules (12 components)

#### 16. Search Bar

```html
<div class="relative w-full max-w-md">
  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    <SearchIcon class="h-5 w-5 text-gray-400" />
  </div>
  <input
    type="text"
    class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg
           focus:outline-none focus:ring-2 focus:ring-primary-500"
    placeholder="Search recipes..."
  />
</div>
```

#### 17. Recipe Card

```html
<div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg
            transition-shadow duration-200 cursor-pointer">
  <!-- Image -->
  <div class="relative h-48 bg-gray-200">
    <img
      src="/recipe-image.jpg"
      alt="Recipe Name"
      class="w-full h-full object-cover"
    />
    <!-- Favorite button overlay -->
    <button class="absolute top-2 right-2 p-2 bg-white rounded-full
                   shadow-md hover:bg-gray-50">
      <HeartIcon class="w-5 h-5 text-gray-600" />
    </button>
    <!-- Quick badge -->
    <span class="absolute bottom-2 left-2 px-3 py-1 bg-black bg-opacity-70
                 text-white text-xs rounded-full">
      30 min
    </span>
  </div>

  <!-- Content -->
  <div class="p-4">
    <h3 class="text-lg font-semibold text-gray-900 mb-2">
      Grilled Chicken Caesar Salad
    </h3>
    <p class="text-sm text-gray-600 mb-3 line-clamp-2">
      Fresh romaine lettuce with grilled chicken, parmesan, and homemade dressing.
    </p>

    <!-- Meta info -->
    <div class="flex items-center justify-between text-xs text-gray-500">
      <div class="flex items-center space-x-4">
        <span class="flex items-center">
          <ClockIcon class="w-4 h-4 mr-1" /> 30 min
        </span>
        <span class="flex items-center">
          <UsersIcon class="w-4 h-4 mr-1" /> 4 servings
        </span>
      </div>
      <div class="flex items-center">
        <StarIcon class="w-4 h-4 text-yellow-400 fill-current" />
        <span class="ml-1 font-medium">4.5</span>
      </div>
    </div>

    <!-- Tags -->
    <div class="flex flex-wrap gap-2 mt-3">
      <span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
        Keto
      </span>
      <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
        High Protein
      </span>
    </div>
  </div>
</div>
```

#### 18. Meal Slot

```html
<div class="border-2 border-dashed border-gray-300 rounded-lg p-4
            hover:border-primary-400 hover:bg-primary-50
            transition-colors cursor-pointer min-h-[100px]
            flex items-center justify-center">
  <!-- Empty state -->
  <div class="text-center text-gray-400">
    <PlusIcon class="w-6 h-6 mx-auto mb-2" />
    <span class="text-sm">Add meal</span>
  </div>
</div>

<!-- Filled state -->
<div class="border border-gray-200 rounded-lg p-4 bg-white
            hover:shadow-md transition-shadow cursor-pointer">
  <div class="flex items-start space-x-3">
    <img
      src="/meal-thumb.jpg"
      alt="Meal"
      class="w-16 h-16 rounded-lg object-cover"
    />
    <div class="flex-1 min-w-0">
      <h4 class="text-sm font-semibold text-gray-900 truncate">
        Grilled Chicken Caesar
      </h4>
      <p class="text-xs text-gray-500 mt-1">
        30 min • 4 servings
      </p>
    </div>
    <button class="p-1 text-gray-400 hover:text-error-500">
      <XIcon class="w-4 h-4" />
    </button>
  </div>
</div>
```

#### 19. Shopping List Item

```html
<div class="flex items-center space-x-3 py-3 border-b border-gray-100
            last:border-b-0">
  <!-- Checkbox -->
  <input
    type="checkbox"
    class="w-5 h-5 text-primary-500 rounded border-gray-300"
  />

  <!-- Item details -->
  <div class="flex-1 min-w-0">
    <p class="text-sm font-medium text-gray-900">
      2 cups Milk
    </p>
    <p class="text-xs text-gray-500">
      Dairy
    </p>
  </div>

  <!-- Actions -->
  <button class="p-1 text-gray-400 hover:text-gray-600">
    <EditIcon class="w-4 h-4" />
  </button>
  <button class="p-1 text-gray-400 hover:text-error-500">
    <TrashIcon class="w-4 h-4" />
  </button>
</div>
```

#### 20. Alert / Notification

```html
<!-- Success -->
<div class="flex items-start space-x-3 p-4 bg-success-50 border-l-4
            border-success-500 rounded-lg">
  <CheckCircleIcon class="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
  <div class="flex-1">
    <h4 class="text-sm font-semibold text-success-800">
      Meal plan saved successfully
    </h4>
    <p class="text-sm text-success-700 mt-1">
      Your changes have been saved to your profile.
    </p>
  </div>
  <button class="text-success-600 hover:text-success-700">
    <XIcon class="w-5 h-5" />
  </button>
</div>

<!-- Error -->
<div class="flex items-start space-x-3 p-4 bg-error-50 border-l-4
            border-error-500 rounded-lg">
  <AlertCircleIcon class="w-5 h-5 text-error-500 flex-shrink-0 mt-0.5" />
  <div class="flex-1">
    <h4 class="text-sm font-semibold text-error-800">
      Error saving meal plan
    </h4>
    <p class="text-sm text-error-700 mt-1">
      Please try again or contact support.
    </p>
  </div>
  <button class="text-error-600 hover:text-error-700">
    <XIcon class="w-5 h-5" />
  </button>
</div>

<!-- Info -->
<div class="flex items-start space-x-3 p-4 bg-info-50 border-l-4
            border-info-500 rounded-lg">
  <InfoIcon class="w-5 h-5 text-info-500 flex-shrink-0 mt-0.5" />
  <div class="flex-1">
    <h4 class="text-sm font-semibold text-info-800">
      New feature available
    </h4>
    <p class="text-sm text-info-700 mt-1">
      Try our AI-powered meal suggestions!
    </p>
  </div>
  <button class="text-info-600 hover:text-info-700">
    <XIcon class="w-5 h-5" />
  </button>
</div>

<!-- Warning -->
<div class="flex items-start space-x-3 p-4 bg-warning-50 border-l-4
            border-warning-500 rounded-lg">
  <AlertTriangleIcon class="w-5 h-5 text-warning-500 flex-shrink-0 mt-0.5" />
  <div class="flex-1">
    <h4 class="text-sm font-semibold text-warning-800">
      Storage almost full
    </h4>
    <p class="text-sm text-warning-700 mt-1">
      Consider deleting old meal plans.
    </p>
  </div>
  <button class="text-warning-600 hover:text-warning-700">
    <XIcon class="w-5 h-5" />
  </button>
</div>
```

#### 21. Toast Notification

```html
<!-- Positioned fixed bottom-right -->
<div class="fixed bottom-4 right-4 z-50 animate-slide-up">
  <div class="bg-white rounded-lg shadow-lg border border-gray-200 p-4
              flex items-start space-x-3 max-w-sm">
    <CheckCircleIcon class="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
    <div class="flex-1">
      <p class="text-sm font-medium text-gray-900">
        Recipe added to favorites
      </p>
    </div>
    <button class="text-gray-400 hover:text-gray-600">
      <XIcon class="w-4 h-4" />
    </button>
  </div>
</div>
```

#### 22. Pagination

```html
<div class="flex items-center justify-between px-4 py-3 border-t border-gray-200">
  <!-- Info -->
  <div class="text-sm text-gray-700">
    Showing <span class="font-medium">1</span> to <span class="font-medium">10</span> of{' '}
    <span class="font-medium">97</span> results
  </div>

  <!-- Page numbers -->
  <div class="flex items-center space-x-2">
    <button class="px-3 py-2 border border-gray-300 rounded-lg
                   hover:bg-gray-50 disabled:opacity-50" disabled>
      Previous
    </button>

    <button class="px-3 py-2 bg-primary-500 text-white rounded-lg">
      1
    </button>
    <button class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
      2
    </button>
    <button class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
      3
    </button>
    <span class="px-3 py-2 text-gray-500">...</span>
    <button class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
      10
    </button>

    <button class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
      Next
    </button>
  </div>
</div>
```

#### 23. Breadcrumbs

```html
<nav class="flex items-center space-x-2 text-sm text-gray-600">
  <a href="/" class="hover:text-primary-600">Home</a>
  <ChevronRightIcon class="w-4 h-4" />
  <a href="/recipes" class="hover:text-primary-600">Recipes</a>
  <ChevronRightIcon class="w-4 h-4" />
  <span class="text-gray-900 font-medium">Chicken Caesar Salad</span>
</nav>
```

#### 24. Empty State

```html
<div class="flex flex-col items-center justify-center py-12 px-4 text-center">
  <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
    <InboxIcon class="w-8 h-8 text-gray-400" />
  </div>
  <h3 class="text-lg font-semibold text-gray-900 mb-2">
    No meals planned yet
  </h3>
  <p class="text-sm text-gray-600 mb-6 max-w-sm">
    Start planning your week by adding meals to your calendar.
  </p>
  <button class="px-6 py-3 bg-primary-500 text-white rounded-lg
                 hover:bg-primary-600 transition-colors">
    Browse Recipes
  </button>
</div>
```

#### 25. Filter Panel

```html
<div class="bg-white border border-gray-200 rounded-lg p-4">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-semibold text-gray-900">Filters</h3>
    <button class="text-sm text-primary-600 hover:text-primary-700">
      Clear all
    </button>
  </div>

  <!-- Category filter -->
  <div class="mb-6">
    <h4 class="text-sm font-medium text-gray-700 mb-3">Category</h4>
    <div class="space-y-2">
      <label class="flex items-center">
        <input type="checkbox" class="w-4 h-4 text-primary-500 rounded" />
        <span class="ml-2 text-sm text-gray-700">Breakfast</span>
        <span class="ml-auto text-xs text-gray-500">(24)</span>
      </label>
      <label class="flex items-center">
        <input type="checkbox" class="w-4 h-4 text-primary-500 rounded" />
        <span class="ml-2 text-sm text-gray-700">Lunch</span>
        <span class="ml-auto text-xs text-gray-500">(38)</span>
      </label>
      <!-- More options... -->
    </div>
  </div>

  <!-- Dietary filter -->
  <div class="mb-6">
    <h4 class="text-sm font-medium text-gray-700 mb-3">Dietary</h4>
    <div class="space-y-2">
      <label class="flex items-center">
        <input type="checkbox" class="w-4 h-4 text-primary-500 rounded" />
        <span class="ml-2 text-sm text-gray-700">Vegan</span>
      </label>
      <label class="flex items-center">
        <input type="checkbox" class="w-4 h-4 text-primary-500 rounded" />
        <span class="ml-2 text-sm text-gray-700">Gluten-Free</span>
      </label>
      <!-- More options... -->
    </div>
  </div>

  <button class="w-full px-4 py-3 bg-primary-500 text-white rounded-lg
                 hover:bg-primary-600 transition-colors">
    Apply Filters
  </button>
</div>
```

#### 26. Stat Card

```html
<div class="bg-white border border-gray-200 rounded-lg p-6">
  <div class="flex items-center justify-between">
    <div>
      <p class="text-sm text-gray-600 mb-1">Meals Planned</p>
      <p class="text-3xl font-bold text-gray-900">18</p>
      <p class="text-xs text-success-600 mt-2 flex items-center">
        <ArrowUpIcon class="w-3 h-3 mr-1" />
        12% from last week
      </p>
    </div>
    <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
      <CalendarIcon class="w-6 h-6 text-primary-600" />
    </div>
  </div>
</div>
```

#### 27. Rating Display

```html
<div class="flex items-center space-x-2">
  <div class="flex items-center space-x-1">
    <StarIcon class="w-5 h-5 text-yellow-400 fill-current" />
    <StarIcon class="w-5 h-5 text-yellow-400 fill-current" />
    <StarIcon class="w-5 h-5 text-yellow-400 fill-current" />
    <StarIcon class="w-5 h-5 text-yellow-400 fill-current" />
    <StarIcon class="w-5 h-5 text-gray-300" />
  </div>
  <span class="text-sm font-medium text-gray-700">4.2</span>
  <span class="text-sm text-gray-500">(128 reviews)</span>
</div>
```

---

### Organisms (8 components)

#### 28. Header / Top Navigation

```html
<header class="bg-white border-b border-gray-200 sticky top-0 z-40">
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between h-16">
      <!-- Logo -->
      <div class="flex items-center space-x-2">
        <ChefHatIcon class="w-8 h-8 text-primary-500" />
        <span class="text-xl font-bold text-gray-900">MealPlanner</span>
      </div>

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex items-center space-x-8">
        <a href="/dashboard" class="text-sm font-medium text-gray-700 hover:text-primary-600">
          Dashboard
        </a>
        <a href="/meal-plan" class="text-sm font-medium text-primary-600">
          Meal Plan
        </a>
        <a href="/recipes" class="text-sm font-medium text-gray-700 hover:text-primary-600">
          Recipes
        </a>
        <a href="/shopping-list" class="text-sm font-medium text-gray-700 hover:text-primary-600">
          Shopping List
        </a>
      </nav>

      <!-- Right side -->
      <div class="flex items-center space-x-4">
        <button class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative">
          <BellIcon class="w-5 h-5" />
          <span class="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full"></span>
        </button>
        <button class="flex items-center space-x-2">
          <img src="/avatar.jpg" alt="User" class="w-8 h-8 rounded-full" />
          <ChevronDownIcon class="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <!-- Mobile menu button -->
      <button class="md:hidden p-2 text-gray-600">
        <MenuIcon class="w-6 h-6" />
      </button>
    </div>
  </div>
</header>
```

#### 29. Sidebar Navigation

```html
<aside class="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
  <!-- Logo -->
  <div class="flex items-center space-x-2 mb-8 px-2">
    <ChefHatIcon class="w-8 h-8 text-primary-500" />
    <span class="text-xl font-bold text-gray-900">MealPlanner</span>
  </div>

  <!-- Navigation -->
  <nav class="space-y-1">
    <a href="/dashboard" class="flex items-center space-x-3 px-3 py-2
                                 text-gray-700 hover:bg-gray-100 rounded-lg">
      <HomeIcon class="w-5 h-5" />
      <span class="font-medium">Dashboard</span>
    </a>
    <a href="/meal-plan" class="flex items-center space-x-3 px-3 py-2
                                  bg-primary-50 text-primary-600 rounded-lg">
      <CalendarIcon class="w-5 h-5" />
      <span class="font-medium">Meal Plan</span>
    </a>
    <a href="/recipes" class="flex items-center space-x-3 px-3 py-2
                               text-gray-700 hover:bg-gray-100 rounded-lg">
      <BookOpenIcon class="w-5 h-5" />
      <span class="font-medium">Recipes</span>
    </a>
    <a href="/shopping-list" class="flex items-center space-x-3 px-3 py-2
                                     text-gray-700 hover:bg-gray-100 rounded-lg">
      <ShoppingCartIcon class="w-5 h-5" />
      <span class="font-medium">Shopping List</span>
    </a>
    <a href="/favorites" class="flex items-center space-x-3 px-3 py-2
                                 text-gray-700 hover:bg-gray-100 rounded-lg">
      <HeartIcon class="w-5 h-5" />
      <span class="font-medium">Favorites</span>
    </a>
  </nav>

  <!-- Divider -->
  <hr class="my-6 border-gray-200" />

  <!-- Settings -->
  <nav class="space-y-1">
    <a href="/settings" class="flex items-center space-x-3 px-3 py-2
                                text-gray-700 hover:bg-gray-100 rounded-lg">
      <SettingsIcon class="w-5 h-5" />
      <span class="font-medium">Settings</span>
    </a>
    <button class="flex items-center space-x-3 px-3 py-2 w-full text-left
                   text-gray-700 hover:bg-gray-100 rounded-lg">
      <LogOutIcon class="w-5 h-5" />
      <span class="font-medium">Log out</span>
    </button>
  </nav>
</aside>
```

#### 30. Bottom Navigation (Mobile)

```html
<nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200
            md:hidden z-40">
  <div class="flex items-center justify-around px-2 py-3">
    <a href="/dashboard" class="flex flex-col items-center space-y-1
                                 text-gray-600">
      <HomeIcon class="w-6 h-6" />
      <span class="text-xs">Home</span>
    </a>
    <a href="/meal-plan" class="flex flex-col items-center space-y-1
                                 text-primary-600">
      <CalendarIcon class="w-6 h-6" />
      <span class="text-xs font-medium">Plan</span>
    </a>
    <a href="/recipes" class="flex flex-col items-center space-y-1
                               text-gray-600">
      <SearchIcon class="w-6 h-6" />
      <span class="text-xs">Recipes</span>
    </a>
    <a href="/shopping-list" class="flex flex-col items-center space-y-1
                                     text-gray-600">
      <ShoppingCartIcon class="w-6 h-6" />
      <span class="text-xs">List</span>
    </a>
    <a href="/profile" class="flex flex-col items-center space-y-1
                               text-gray-600">
      <UserIcon class="w-6 h-6" />
      <span class="text-xs">Profile</span>
    </a>
  </div>
</nav>
```

#### 31. Meal Plan Calendar

```html
<div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
  <!-- Week header -->
  <div class="border-b border-gray-200 p-4 flex items-center justify-between">
    <button class="p-2 hover:bg-gray-100 rounded-lg">
      <ChevronLeftIcon class="w-5 h-5" />
    </button>
    <h2 class="text-lg font-semibold text-gray-900">
      Week of Oct 12 - Oct 18, 2025
    </h2>
    <button class="p-2 hover:bg-gray-100 rounded-lg">
      <ChevronRightIcon class="w-5 h-5" />
    </button>
  </div>

  <!-- Calendar grid -->
  <div class="grid grid-cols-7 divide-x divide-gray-200">
    <!-- Day column -->
    <div class="min-h-[400px]">
      <!-- Day header -->
      <div class="p-3 border-b border-gray-200 bg-gray-50">
        <p class="text-xs font-semibold text-gray-600 uppercase">Sunday</p>
        <p class="text-2xl font-bold text-gray-900">12</p>
      </div>

      <!-- Meal slots -->
      <div class="p-2 space-y-2">
        <div class="text-xs font-medium text-gray-500 mb-1">Breakfast</div>
        <!-- Meal Slot component here -->

        <div class="text-xs font-medium text-gray-500 mb-1 mt-3">Lunch</div>
        <!-- Meal Slot component here -->

        <div class="text-xs font-medium text-gray-500 mb-1 mt-3">Dinner</div>
        <!-- Meal Slot component here -->
      </div>
    </div>

    <!-- Repeat for other days... -->
  </div>
</div>
```

#### 32. Recipe Grid

```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  <!-- Recipe Card components -->
  <div><!-- Recipe Card 1 --></div>
  <div><!-- Recipe Card 2 --></div>
  <div><!-- Recipe Card 3 --></div>
  <div><!-- Recipe Card 4 --></div>
  <!-- ... -->
</div>
```

#### 33. Modal / Dialog

```html
<!-- Overlay -->
<div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
  <!-- Modal -->
  <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh]
              overflow-y-auto">
    <!-- Header -->
    <div class="flex items-center justify-between p-6 border-b border-gray-200">
      <h2 class="text-2xl font-bold text-gray-900">Add Recipe to Plan</h2>
      <button class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
        <XIcon class="w-5 h-5" />
      </button>
    </div>

    <!-- Content -->
    <div class="p-6">
      <p class="text-gray-600 mb-4">
        Select a meal slot to add this recipe:
      </p>

      <!-- Day/Meal selector -->
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Day</label>
          <select class="w-full px-4 py-3 border border-gray-300 rounded-lg">
            <option>Monday</option>
            <option>Tuesday</option>
            <!-- ... -->
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Meal</label>
          <select class="w-full px-4 py-3 border border-gray-300 rounded-lg">
            <option>Breakfast</option>
            <option>Lunch</option>
            <option>Dinner</option>
            <option>Snacks</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
      <button class="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
        Cancel
      </button>
      <button class="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
        Add to Plan
      </button>
    </div>
  </div>
</div>
```

#### 34. Shopping List Section

```html
<div class="bg-white border border-gray-200 rounded-lg">
  <!-- Category header -->
  <div class="flex items-center justify-between p-4 border-b border-gray-200
              bg-gray-50 cursor-pointer hover:bg-gray-100">
    <div class="flex items-center space-x-3">
      <ChevronDownIcon class="w-5 h-5 text-gray-600" />
      <AppleIcon class="w-5 h-5 text-gray-600" />
      <h3 class="text-lg font-semibold text-gray-900">Produce</h3>
      <span class="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
        8 items
      </span>
    </div>
    <span class="text-sm text-gray-500">3/8 checked</span>
  </div>

  <!-- Items list -->
  <div class="divide-y divide-gray-100">
    <!-- Shopping List Item components -->
    <div><!-- Item 1 --></div>
    <div><!-- Item 2 --></div>
    <div><!-- Item 3 --></div>
    <!-- ... -->
  </div>
</div>
```

#### 35. User Profile Card

```html
<div class="bg-white border border-gray-200 rounded-lg p-6">
  <div class="flex items-center space-x-4 mb-6">
    <img src="/avatar.jpg" alt="User" class="w-16 h-16 rounded-full" />
    <div>
      <h3 class="text-lg font-semibold text-gray-900">John Doe</h3>
      <p class="text-sm text-gray-600">john.doe@example.com</p>
    </div>
  </div>

  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <span class="text-sm text-gray-600">Meals Planned</span>
      <span class="text-sm font-semibold text-gray-900">24 this month</span>
    </div>
    <div class="flex items-center justify-between">
      <span class="text-sm text-gray-600">Favorite Recipes</span>
      <span class="text-sm font-semibold text-gray-900">18</span>
    </div>
    <div class="flex items-center justify-between">
      <span class="text-sm text-gray-600">Dietary Preference</span>
      <span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
        Vegetarian
      </span>
    </div>
  </div>

  <button class="w-full mt-6 px-4 py-3 border border-gray-300 rounded-lg
                 text-gray-700 hover:bg-gray-50">
    Edit Profile
  </button>
</div>
```

---

### Templates (3 components)

#### 36. Dashboard Layout

```html
<div class="min-h-screen bg-gray-50">
  <!-- Header component -->
  <header>...</header>

  <div class="flex">
    <!-- Sidebar component (desktop) -->
    <aside class="hidden lg:block">...</aside>

    <!-- Main content -->
    <main class="flex-1 p-6 lg:p-8">
      <div class="max-w-7xl mx-auto">
        <!-- Page content -->
      </div>
    </main>
  </div>

  <!-- Bottom nav component (mobile) -->
  <nav class="lg:hidden">...</nav>
</div>
```

#### 37. Auth Layout

```html
<div class="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50
            flex items-center justify-center p-4">
  <div class="max-w-md w-full">
    <!-- Logo -->
    <div class="text-center mb-8">
      <ChefHatIcon class="w-16 h-16 text-primary-500 mx-auto mb-4" />
      <h1 class="text-3xl font-bold text-gray-900">MealPlanner</h1>
      <p class="text-gray-600 mt-2">Plan smarter, eat better</p>
    </div>

    <!-- Auth card -->
    <div class="bg-white rounded-lg shadow-xl p-8">
      <!-- Login/Register form content -->
    </div>

    <!-- Footer -->
    <p class="text-center text-sm text-gray-600 mt-6">
      By signing up, you agree to our{' '}
      <a href="#" class="text-primary-600 hover:underline">Terms</a> and{' '}
      <a href="#" class="text-primary-600 hover:underline">Privacy Policy</a>
    </p>
  </div>
</div>
```

#### 38. Full-Width Content Layout

```html
<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <header>...</header>

  <!-- Hero/Banner -->
  <div class="bg-white border-b border-gray-200 py-8">
    <div class="container mx-auto px-4">
      <h1 class="text-4xl font-bold text-gray-900 mb-2">Browse Recipes</h1>
      <p class="text-lg text-gray-600">Discover thousands of delicious recipes</p>
    </div>
  </div>

  <!-- Main content (no sidebar) -->
  <main class="container mx-auto px-4 py-8">
    <!-- Full-width content -->
  </main>

  <!-- Footer -->
  <footer class="bg-white border-t border-gray-200 py-8 mt-12">
    <div class="container mx-auto px-4 text-center text-sm text-gray-600">
      © 2025 MealPlanner. All rights reserved.
    </div>
  </footer>
</div>
```

---

## Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
/* Default styles: Mobile (320px - 767px) */

/* Tablet */
@media (min-width: 768px) { /* md: */ }

/* Desktop */
@media (min-width: 1024px) { /* lg: */ }

/* Large Desktop */
@media (min-width: 1280px) { /* xl: */ }

/* Extra Large */
@media (min-width: 1536px) { /* 2xl: */ }
```

**Tailwind Examples**:
```html
<!-- Hidden on mobile, visible on tablet+ -->
<div class="hidden md:block">Desktop Content</div>

<!-- Full width on mobile, 50% on tablet, 33% on desktop -->
<div class="w-full md:w-1/2 lg:w-1/3">Responsive Width</div>

<!-- Stacked on mobile, grid on desktop -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Mobile Optimizations

1. **Touch Targets**: Minimum 44x44px (Tailwind: `min-w-11 min-h-11` or `p-3`)
2. **Bottom Navigation**: Use fixed bottom nav instead of sidebar
3. **Simplified Headers**: Hamburger menu, essential actions only
4. **Larger Text**: Body text minimum 16px (prevents iOS auto-zoom)
5. **Thumb-Friendly**: Important actions in bottom 50% of screen
6. **Horizontal Scrolling**: Use for card carousels (overflow-x-auto)

### Responsive Patterns

**Responsive Images**:
```html
<img
  src="/image-mobile.jpg"
  srcset="/image-mobile.jpg 320w,
          /image-tablet.jpg 768w,
          /image-desktop.jpg 1024w"
  sizes="(max-width: 768px) 100vw,
         (max-width: 1024px) 50vw,
         33vw"
  alt="Description"
  class="w-full h-auto"
/>
```

**Responsive Typography**:
```html
<!-- Scales from text-2xl on mobile to text-4xl on desktop -->
<h1 class="text-2xl md:text-3xl lg:text-4xl font-bold">
  Responsive Heading
</h1>
```

**Responsive Spacing**:
```html
<!-- 16px padding on mobile, 24px on tablet, 32px on desktop -->
<div class="p-4 md:p-6 lg:p-8">
  Content
</div>
```

---

## Accessibility Guidelines

### WCAG 2.1 AA Compliance

#### 1. Color Contrast
- Normal text (16px): 4.5:1 minimum
- Large text (24px+): 3:1 minimum
- UI components: 3:1 minimum

**Test Tools**:
- Chrome DevTools Color Picker
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

#### 2. Keyboard Navigation
- All interactive elements must be keyboard accessible
- Visible focus indicators required
- Logical tab order (use `tabindex` sparingly)
- Skip links for main content

```html
<!-- Skip link -->
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute
                                focus:top-4 focus:left-4 focus:z-50
                                focus:px-4 focus:py-2 focus:bg-primary-500
                                focus:text-white focus:rounded-lg">
  Skip to main content
</a>

<main id="main-content">
  <!-- Content -->
</main>
```

#### 3. Screen Reader Support

**Semantic HTML**:
```html
<!-- Good: Semantic -->
<button>Click me</button>
<nav>...</nav>
<main>...</main>
<article>...</article>

<!-- Bad: Non-semantic -->
<div onclick="...">Click me</div>
```

**ARIA Labels**:
```html
<!-- Icon-only button -->
<button aria-label="Add to favorites">
  <HeartIcon class="w-5 h-5" />
</button>

<!-- Search input -->
<input
  type="search"
  aria-label="Search recipes"
  placeholder="Search..."
/>

<!-- Loading state -->
<div role="status" aria-live="polite">
  <span class="sr-only">Loading...</span>
  <Spinner />
</div>
```

**ARIA Live Regions**:
```html
<!-- Announcements -->
<div
  role="alert"
  aria-live="assertive"
  class="sr-only"
>
  Recipe added to meal plan!
</div>

<!-- Polite updates -->
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  Showing 10 of 97 results
</div>
```

#### 4. Form Accessibility

```html
<form>
  <!-- Proper label association -->
  <div class="mb-4">
    <label for="recipe-name" class="block text-sm font-medium text-gray-700 mb-2">
      Recipe Name *
    </label>
    <input
      type="text"
      id="recipe-name"
      name="recipe-name"
      required
      aria-required="true"
      aria-describedby="recipe-name-error"
      class="..."
    />
    <p id="recipe-name-error" class="mt-1 text-sm text-error-600" role="alert">
      Recipe name is required
    </p>
  </div>

  <!-- Fieldset for related inputs -->
  <fieldset>
    <legend class="text-sm font-medium text-gray-700 mb-3">
      Dietary Preferences
    </legend>
    <div class="space-y-2">
      <label class="flex items-center">
        <input type="checkbox" name="diet" value="vegan" />
        <span class="ml-2 text-sm">Vegan</span>
      </label>
      <!-- More options... -->
    </div>
  </fieldset>
</form>
```

#### 5. Focus Management

**Visible Focus Indicators**:
```css
/* Tailwind default: focus:ring-2 focus:ring-primary-500 */

/* Custom focus style */
.custom-focus:focus {
  outline: 2px solid #14b8a6;
  outline-offset: 2px;
}
```

**Focus Trap in Modals**:
```javascript
// When modal opens:
// 1. Save currently focused element
// 2. Move focus to modal
// 3. Trap focus within modal (Tab cycles only modal elements)
// 4. When modal closes, restore focus to saved element
```

#### 6. Image Accessibility

```html
<!-- Informative images -->
<img src="/salad.jpg" alt="Fresh Caesar salad with grilled chicken and parmesan" />

<!-- Decorative images -->
<img src="/decoration.jpg" alt="" role="presentation" />

<!-- Complex images (charts, diagrams) -->
<figure>
  <img src="/nutrition-chart.jpg" alt="Weekly nutrition breakdown" />
  <figcaption>
    This week's meals provide: 2000 calories/day, 150g protein, 200g carbs, 70g fat.
  </figcaption>
</figure>
```

#### 7. Screen Reader Only Text

```html
<span class="sr-only">
  Screen reader only text
</span>

<!-- Tailwind CSS utility (add to config if not default) -->
<style>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.focus\:not-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
</style>
```

---

## Animation & Transitions

### Principles
- **Purposeful**: Animations should communicate or guide, not distract
- **Fast**: Keep animations under 300ms for UI feedback
- **Subtle**: Avoid jarring or excessive motion
- **Respect Preferences**: Honor `prefers-reduced-motion`

### Common Transitions

**Hover Effects**:
```html
<button class="transition-colors duration-200 hover:bg-primary-600">
  Hover me
</button>

<div class="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
  Card
</div>
```

**Fade In**:
```html
<div class="animate-fade-in">
  <!-- Content -->
</div>

<style>
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-in-out;
}
</style>
```

**Slide Up** (Toasts):
```html
<div class="animate-slide-up">
  <!-- Toast notification -->
</div>

<style>
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
</style>
```

**Loading Spinner**:
```html
<svg class="animate-spin h-5 w-5" ...>
  <!-- SVG content -->
</svg>

<!-- Tailwind has built-in animate-spin -->
```

**Skeleton Loading**:
```html
<div class="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>

<style>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Usage Examples

### Example: Recipe Detail Page

```html
<div class="min-h-screen bg-gray-50">
  <header><!-- Top nav --></header>

  <main class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Breadcrumbs -->
    <nav class="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      <a href="/">Home</a>
      <ChevronRightIcon class="w-4 h-4" />
      <a href="/recipes">Recipes</a>
      <ChevronRightIcon class="w-4 h-4" />
      <span class="text-gray-900">Chicken Caesar Salad</span>
    </nav>

    <!-- Recipe Hero -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <img
        src="/recipe-hero.jpg"
        alt="Chicken Caesar Salad"
        class="w-full h-64 md:h-96 object-cover"
      />
    </div>

    <!-- Recipe Header -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            Grilled Chicken Caesar Salad
          </h1>
          <p class="text-gray-600">
            A classic Caesar salad with perfectly grilled chicken breast.
          </p>
        </div>
        <button class="p-3 text-gray-600 hover:bg-gray-100 rounded-lg">
          <HeartIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Meta info -->
      <div class="flex flex-wrap gap-6 text-sm">
        <div class="flex items-center text-gray-700">
          <ClockIcon class="w-5 h-5 mr-2 text-gray-500" />
          <span><strong>Prep:</strong> 15 min</span>
        </div>
        <div class="flex items-center text-gray-700">
          <FlameIcon class="w-5 h-5 mr-2 text-gray-500" />
          <span><strong>Cook:</strong> 15 min</span>
        </div>
        <div class="flex items-center text-gray-700">
          <UsersIcon class="w-5 h-5 mr-2 text-gray-500" />
          <span><strong>Servings:</strong> 4</span>
        </div>
        <div class="flex items-center">
          <StarIcon class="w-5 h-5 text-yellow-400 fill-current mr-1" />
          <span class="font-medium">4.5</span>
          <span class="text-gray-500 ml-1">(128)</span>
        </div>
      </div>

      <!-- Tags -->
      <div class="flex flex-wrap gap-2 mt-4">
        <span class="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
          Keto-Friendly
        </span>
        <span class="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
          High Protein
        </span>
        <span class="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
          Quick (<30 min)
        </span>
      </div>

      <!-- Action buttons -->
      <div class="flex flex-wrap gap-3 mt-6">
        <button class="flex-1 md:flex-none px-6 py-3 bg-primary-500 text-white
                       rounded-lg hover:bg-primary-600 transition-colors">
          Add to Meal Plan
        </button>
        <button class="px-6 py-3 border-2 border-primary-500 text-primary-600
                       rounded-lg hover:bg-primary-50 transition-colors">
          Generate Shopping List
        </button>
      </div>
    </div>

    <!-- Ingredients & Instructions (2-column on desktop) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Ingredients (1/3 width on desktop) -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Ingredients</h2>
          <select class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option>4 servings</option>
            <option>2 servings</option>
            <option>6 servings</option>
          </select>
        </div>

        <ul class="space-y-3">
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700">2 chicken breasts (about 1 lb)</span>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700">1 large head romaine lettuce</span>
          </li>
          <!-- More ingredients... -->
        </ul>
      </div>

      <!-- Instructions (2/3 width on desktop) -->
      <div class="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>

        <ol class="space-y-4">
          <li class="flex">
            <span class="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full
                         flex items-center justify-center font-semibold text-sm mr-4">
              1
            </span>
            <p class="text-gray-700 pt-1">
              Season chicken breasts with salt, pepper, and garlic powder.
              Grill over medium-high heat for 6-7 minutes per side until cooked through.
            </p>
          </li>
          <li class="flex">
            <span class="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full
                         flex items-center justify-center font-semibold text-sm mr-4">
              2
            </span>
            <p class="text-gray-700 pt-1">
              While chicken is cooking, chop romaine lettuce and place in large bowl.
            </p>
          </li>
          <!-- More steps... -->
        </ol>
      </div>
    </div>

    <!-- Nutrition (optional) -->
    <div class="bg-white rounded-lg shadow-md p-6 mt-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Nutrition (per serving)</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center">
          <p class="text-2xl font-bold text-gray-900">420</p>
          <p class="text-sm text-gray-600">Calories</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-gray-900">32g</p>
          <p class="text-sm text-gray-600">Protein</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-gray-900">12g</p>
          <p class="text-sm text-gray-600">Carbs</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-gray-900">28g</p>
          <p class="text-sm text-gray-600">Fat</p>
        </div>
      </div>
    </div>
  </main>
</div>
```

---

## Maintenance & Updates

### Versioning
- Major updates (breaking changes): Increment major version
- New components: Increment minor version
- Bug fixes/tweaks: Increment patch version

### Change Log
Document all changes in CHANGELOG.md:
- Added components
- Modified components
- Deprecated patterns
- Breaking changes

### Component Review Process
1. Designer creates component spec
2. Developer implements in code
3. Accessibility audit
4. Stakeholder approval
5. Documentation update
6. Add to Storybook (if applicable)

---

## Appendix

### Tailwind Config Customization

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdfa',
          // ... (full scale)
          500: '#14b8a6',
          // ...
        },
        secondary: {
          // ... (orange scale)
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        // Custom spacing if needed
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

### Design Tokens (JavaScript)

```javascript
// tokens.js
export const colors = {
  primary: {
    50: '#f0fdfa',
    // ...
    500: '#14b8a6',
    // ...
  },
  // ...
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  // ...
};

export const typography = {
  h1: { size: '36px', weight: 700, lineHeight: '40px' },
  // ...
};
```

---

**End of Design System Documentation**

For implementation questions or additions, please contact the design team.
