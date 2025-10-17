# Quick Start Guide - Epic 1: Authentication & Onboarding

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The application will open automatically at: http://localhost:3000

### 3. Build for Production
```bash
npm run build
```

### 4. Preview Production Build
```bash
npm run preview
```

---

## Quick Testing Flow

### Test Registration:
1. Open http://localhost:3000/register
2. Register with:
   - Email: `test@example.com`
   - Name: `Test User`
   - Password: `Test123!@#`
   - Confirm Password: `Test123!@#`
3. Observe password strength indicator (should show "Strong")
4. Click "Create Account"
5. Auto-redirect to onboarding tutorial

### Test Onboarding:
1. Navigate through 5 screens using "Next" button
2. Try keyboard shortcuts:
   - Arrow keys for navigation
   - Escape to skip
   - Enter to complete (on last screen)
3. Click "Get Started" on final screen

### Test Dashboard:
1. View welcome message
2. Click "Replay Tutorial" to test replay functionality

### Test Login:
1. Logout from dashboard
2. Navigate to http://localhost:3000/login
3. Login with same credentials:
   - Email: `test@example.com`
   - Password: `Test123!@#`
4. Check "Remember me" checkbox
5. Click "Sign In"

### Test Failed Login Attempts:
1. Try logging in with wrong password 3 times
2. Observe account lock message
3. Wait 5 minutes OR reset via console:
```javascript
const users = JSON.parse(localStorage.getItem('meal_planner_users') || '[]')
const user = users.find(u => u.email === 'test@example.com')
if (user) {
  user.loginAttempts = { count: 0, lastAttempt: new Date().toISOString() }
  localStorage.setItem('meal_planner_users', JSON.stringify(users))
}
location.reload()
```

---

## Project Structure Overview

```
C:/Users/mishr/myApp/
├── docs/                          # Comprehensive documentation
│   ├── design/
│   │   └── DESIGN_SYSTEM.md      # Design tokens, colors, typography
│   ├── epics/                     # All epic specifications
│   │   └── epic-1-authentication-onboarding.md
│   ├── planning/                  # Project planning docs
│   ├── requirements/
│   │   └── PRD.md                # Product Requirements Document
│   └── technical/                 # Technical specifications
│
├── public/
│   └── vite.svg                   # App icon
│
├── src/
│   ├── components/
│   │   ├── atoms/                 # Basic UI components
│   │   │   ├── Button.tsx        # Reusable button with variants
│   │   │   ├── Input.tsx         # Form input with validation
│   │   │   └── Checkbox.tsx      # Checkbox with label
│   │   ├── molecules/             # Composite components
│   │   │   ├── PasswordStrengthIndicator.tsx
│   │   │   └── FormField.tsx     # Input field wrapper
│   │   └── organisms/             # Complex feature components
│   │       ├── RegisterForm.tsx   # Complete registration form
│   │       ├── LoginForm.tsx      # Complete login form
│   │       └── OnboardingModal.tsx # 5-screen tutorial
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx        # Authentication state management
│   │
│   ├── services/
│   │   └── AuthService.ts         # Authentication business logic
│   │
│   ├── pages/
│   │   ├── Register.tsx           # Registration page
│   │   ├── Login.tsx              # Login page
│   │   ├── Onboarding.tsx         # Onboarding page
│   │   └── Dashboard.tsx          # Main dashboard
│   │
│   ├── types/
│   │   └── auth.types.ts          # TypeScript interfaces
│   │
│   ├── utils/
│   │   └── passwordUtils.ts       # Password validation utilities
│   │
│   ├── App.tsx                    # Main app with routing
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles + Tailwind
│
├── index.html                     # HTML template
├── package.json                   # Dependencies & scripts
├── vite.config.ts                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
├── README.md                      # Project overview
├── TESTING_GUIDE.md              # Comprehensive testing instructions
└── QUICK_START.md                # This file
```

---

## Key Files to Explore

### Authentication Logic:
- **C:/Users/mishr/myApp/src/services/AuthService.ts** - Core auth functions (register, login, logout)
- **C:/Users/mishr/myApp/src/contexts/AuthContext.tsx** - React Context for auth state

### Form Components:
- **C:/Users/mishr/myApp/src/components/organisms/RegisterForm.tsx** - Full registration with validation
- **C:/Users/mishr/myApp/src/components/organisms/LoginForm.tsx** - Login with remember me & lock

### Onboarding:
- **C:/Users/mishr/myApp/src/components/organisms/OnboardingModal.tsx** - 5-screen tutorial with keyboard nav

### Routing:
- **C:/Users/mishr/myApp/src/App.tsx** - Route definitions & auth guards

### Design System:
- **C:/Users/mishr/myApp/tailwind.config.js** - Primary (teal) & Secondary (orange) colors
- **C:/Users/mishr/myApp/src/components/atoms/** - Reusable styled components

---

## Available NPM Scripts

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## Feature Highlights

### Registration Features:
- Email format validation
- Password strength indicator (Weak/Medium/Strong)
- Password requirements: 8+ chars, uppercase, number
- Password confirmation matching
- Duplicate email detection
- Auto-login after successful registration

### Login Features:
- Email/password authentication
- Remember me (30-day session)
- Failed login tracking (locks after 3 attempts for 5 minutes)
- Loading states
- Session persistence across refreshes
- Clear error messages

### Onboarding Features:
- 5 informative screens
- Progress indicator
- Multiple navigation methods:
  - Next/Back buttons
  - Arrow keys
  - Enter key (to complete)
  - Escape key (to skip)
  - Skip button
- Replay option in dashboard settings
- Responsive design

---

## Browser DevTools - Inspect Data

### View localStorage:
1. Press F12 to open DevTools
2. Go to Application tab > Local Storage > http://localhost:3000
3. Check these keys:
   - `meal_planner_users` - All registered users
   - `meal_planner_current_user` - Currently logged-in user
   - `meal_planner_auth_token` - Session token
   - `meal_planner_remember_me` - Remember me expiry date

### Clear All Data:
Open console (F12) and run:
```javascript
localStorage.clear()
location.reload()
```

---

## Troubleshooting

### Port 3000 already in use:
```bash
# Kill process on Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in vite.config.ts
```

### Dependencies not installing:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build errors:
```bash
# Clean build
rm -rf dist
npm run build
```

### Locked account during testing:
Run this in browser console:
```javascript
localStorage.clear()
location.reload()
```

---

## Next Steps

After verifying Epic 1 works correctly:

1. **Review Documentation**: Check C:/Users/mishr/myApp/docs/ for detailed specs
2. **Run Full Testing**: Follow C:/Users/mishr/myApp/TESTING_GUIDE.md
3. **Future Epics**: See docs/epics/ for upcoming features:
   - Epic 2: Meal Planning Calendar
   - Epic 3: Recipe Discovery & Management
   - Epic 4: Smart Shopping Lists
   - Epic 5: User Preferences & Settings
   - Epic 6: AI-Powered Suggestions
   - Epic 7: Dashboard & Analytics

---

## Support

For detailed testing instructions, see: **C:/Users/mishr/myApp/TESTING_GUIDE.md**

For architecture and design decisions, see: **C:/Users/mishr/myApp/docs/**
