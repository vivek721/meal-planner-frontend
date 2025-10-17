# Epic 1: User Authentication & Onboarding

**Epic ID**: E1
**Priority**: High
**Phase**: Week 2
**Story Points**: 13

---

## Description
Enable users to create accounts, log in, and understand the application through a guided onboarding experience.

## Goal
Provide secure authentication and a smooth first-time user experience that leads to high activation rates.

## Success Metrics
- 90% of new users complete registration
- 70% of new users complete onboarding tutorial
- Less than 5% authentication errors

---

## User Stories

### US-1.1: User Registration

**As a** new user
**I want to** create an account with email and password
**So that** I can save my meal plans and preferences

**Priority**: High | **Story Points**: 5

**Acceptance Criteria**:
1. ✓ Registration form displays with fields:
   - Email (with validation)
   - Password (with strength indicator)
   - Confirm Password
   - Name (optional)
2. ✓ Email validation checks for proper format
3. ✓ Password requirements enforced:
   - Minimum 8 characters
   - At least 1 uppercase letter
   - At least 1 number
   - At least 1 special character (optional but recommended)
4. ✓ Password strength indicator shows: Weak, Medium, Strong
5. ✓ "Confirm Password" must match password
6. ✓ Error messages are clear and specific:
   - "Email already exists"
   - "Password too weak"
   - "Passwords don't match"
7. ✓ Success message displayed: "Account created! Redirecting..."
8. ✓ User automatically logged in after registration
9. ✓ User redirected to onboarding flow after registration
10. ✓ Data persisted to localStorage with hashed password

**Technical Notes**:
- Use React Hook Form for form management
- Implement password hashing (mock) before storage
- Use Zod for validation schema
- Store JWT token (mocked) in localStorage

**UI Components Needed**:
- Input (email, password)
- Button (submit)
- Password strength indicator
- Form validation messages
- Success toast

---

### US-1.2: User Login

**As a** returning user
**I want to** log in with my credentials
**So that** I can access my saved meal plans and data

**Priority**: High | **Story Points**: 3

**Acceptance Criteria**:
1. ✓ Login form displays with fields:
   - Email
   - Password
2. ✓ "Remember me" checkbox available
3. ✓ "Forgot password?" link present (future enhancement - shows message)
4. ✓ Successful login redirects to Dashboard
5. ✓ Failed login shows error: "Invalid email or password"
6. ✓ After 3 failed attempts, show temporary lock message (5 minutes)
7. ✓ "Remember me" stores auth token for 30 days
8. ✓ Loading state shown during authentication
9. ✓ User session persists across browser refreshes
10. ✓ Link to registration page: "Don't have an account? Sign up"

**Technical Notes**:
- Check credentials against localStorage users
- Generate and store JWT token (mocked)
- Use Context API for auth state

**UI Components Needed**:
- Input (email, password)
- Checkbox (remember me)
- Button (submit)
- Link (forgot password, sign up)
- Loading spinner

---

### US-1.3: Onboarding Tutorial

**As a** new user
**I want** a guided walkthrough of key features
**So that** I understand how to use the app effectively

**Priority**: Medium | **Story Points**: 5

**Acceptance Criteria**:
1. ✓ Onboarding starts automatically after registration
2. ✓ Tutorial has 4-5 screens:
   - Welcome screen (introduction)
   - Plan your meals (calendar overview)
   - Discover recipes (browse & search)
   - Generate shopping lists (automation benefit)
   - Get AI suggestions (smart features)
3. ✓ Each screen has:
   - Illustration or screenshot
   - Title and description (2-3 sentences)
   - Progress indicator (dots or steps)
4. ✓ Navigation controls:
   - "Next" button
   - "Back" button (disabled on first screen)
   - "Skip" button (available on all screens)
   - "Get Started" button (final screen)
5. ✓ "Skip" redirects to Dashboard
6. ✓ "Get Started" redirects to Dashboard
7. ✓ Onboarding completion flag saved to user profile
8. ✓ Option in Settings to replay tutorial: "View Tutorial Again"
9. ✓ Responsive design (works on mobile and desktop)
10. ✓ Keyboard navigation supported (arrow keys, Enter, Escape)

**Technical Notes**:
- Use modal/overlay component
- Track completion in user preferences
- Consider using a library like react-joyride or build custom

**UI Components Needed**:
- Modal/Overlay
- Progress indicator
- Buttons (Next, Back, Skip, Get Started)
- Illustration placeholders

---

## Epic 1 Technical Implementation Notes

**Services**:
- `AuthService`: register(), login(), logout(), checkAuth(), getUser()

**Context**:
- `AuthContext`: Provides authentication state globally

**Routes**:
- `/register`
- `/login`
- `/onboarding`

**LocalStorage Keys**:
- `users`: Array of user objects
- `authToken`: Current user's JWT token (mocked)
- `currentUser`: Logged-in user object

---
