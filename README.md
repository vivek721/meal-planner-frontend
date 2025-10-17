# AI-Powered Meal Planner - Epic 1: Authentication & Onboarding

This project implements Epic 1 of the AI-Powered Meal Planner application, featuring complete user authentication and onboarding functionality.

## Features Implemented

### User Registration (US-1.1)
- Email and password registration with optional name field
- Email format validation
- Password strength requirements (8+ chars, uppercase, number)
- Real-time password strength indicator (Weak/Medium/Strong)
- Confirm password matching validation
- Clear error messages
- Success notification with auto-redirect
- Auto-login after registration
- Data persisted to localStorage

### User Login (US-1.2)
- Email and password authentication
- "Remember me" functionality (30-day session)
- "Forgot password?" link (placeholder for future enhancement)
- Failed login attempt tracking (locks after 3 attempts for 5 minutes)
- Loading states during authentication
- Session persistence across browser refreshes
- Link to registration page

### Onboarding Tutorial (US-1.3)
- 5-screen interactive tutorial
- Progress indicator
- Navigation controls (Next, Back, Skip, Get Started)
- Keyboard navigation support (Arrow keys, Enter, Escape)
- Completion flag saved to user profile
- Replay option available in Dashboard settings
- Fully responsive design

## Tech Stack

- **React 18** with TypeScript
- **Vite** - Build tool
- **Tailwind CSS 3.x** - Styling
- **React Router v6** - Routing
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Context API** - State management
- **localStorage** - Mock backend
- **Lucide React** - Icons
- **Inter font** - Typography (Google Fonts)

## Project Structure

```
src/
├── components/
│   ├── atoms/              # Basic UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Checkbox.tsx
│   ├── molecules/          # Composite components
│   │   ├── PasswordStrengthIndicator.tsx
│   │   └── FormField.tsx
│   └── organisms/          # Complex components
│       ├── RegisterForm.tsx
│       ├── LoginForm.tsx
│       └── OnboardingModal.tsx
├── contexts/
│   └── AuthContext.tsx     # Authentication state management
├── services/
│   └── AuthService.ts      # Authentication business logic
├── pages/
│   ├── Register.tsx
│   ├── Login.tsx
│   ├── Onboarding.tsx
│   └── Dashboard.tsx
├── types/
│   └── auth.types.ts       # TypeScript interfaces
├── utils/
│   └── passwordUtils.ts    # Password validation utilities
├── App.tsx                 # Main app with routing
├── main.tsx                # Entry point
└── index.css               # Global styles
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will open at http://localhost:3000

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

1. **Register**: Create a new account at `/register`
   - Enter email, password (with strength validation), and optional name
   - Account is created and stored in localStorage
   - Automatically redirects to onboarding

2. **Onboarding**: Complete the 5-screen tutorial
   - Learn about app features
   - Use keyboard shortcuts or buttons to navigate
   - Skip anytime or complete to reach dashboard

3. **Dashboard**: Access main application
   - View placeholder for future features
   - Replay tutorial anytime from settings
   - Logout when done

4. **Login**: Return to your account at `/login`
   - Enter credentials
   - Use "Remember me" for 30-day session
   - Account locks for 5 minutes after 3 failed attempts

## Design System

### Colors
- **Primary (Teal)**: #14b8a6 - Main brand color
- **Secondary (Orange)**: #f97316 - Accent color

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

### Components
All components follow atomic design principles with consistent Tailwind styling.

## LocalStorage Structure

```typescript
// Keys used
meal_planner_users          // Array of User objects
meal_planner_auth_token     // Current session token
meal_planner_current_user   // Current user object
meal_planner_remember_me    // Expiry date for remember me feature
```

## Security Notes

**Important**: This implementation uses localStorage and a simple hash function for demo purposes only. For production:
- Use a proper backend API
- Implement bcrypt or similar for password hashing
- Use JWT tokens with proper expiration
- Implement HTTPS
- Add CSRF protection
- Use secure cookie storage instead of localStorage

## Future Enhancements

- Password reset functionality
- OAuth integration (Google, Facebook)
- Two-factor authentication
- Email verification
- Profile management
- Password change feature

## Documentation

For detailed specifications, see:
- `/docs/epics/epic-1-authentication-onboarding.md`
- `/docs/design/DESIGN_SYSTEM.md`
- `/docs/PRD.md`
