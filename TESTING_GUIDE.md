# Epic 1 Testing Guide

This guide provides comprehensive testing instructions for all features in Epic 1: User Authentication & Onboarding.

## Prerequisites

1. Start the development server:
```bash
npm run dev
```

2. Open http://localhost:3000 in your browser
3. Open browser DevTools (F12) to inspect localStorage

## Test Cases

### US-1.1: User Registration

#### Test Case 1.1.1: Successful Registration
**Steps:**
1. Navigate to http://localhost:3000/register
2. Fill in the form:
   - Email: test@example.com
   - Name: Test User (optional)
   - Password: Test123!@#
   - Confirm Password: Test123!@#
3. Click "Create Account"

**Expected Results:**
- Password strength indicator shows "Strong"
- Success message: "Account created! Redirecting..."
- Auto-redirect to /onboarding after ~1.5 seconds
- User data stored in localStorage (check DevTools > Application > Local Storage)

#### Test Case 1.1.2: Email Validation
**Steps:**
1. Try these invalid emails:
   - "notanemail" - Error: "Please enter a valid email address"
   - "test@" - Error: "Please enter a valid email address"
   - "@example.com" - Error: "Please enter a valid email address"

**Expected Results:**
- Error messages display immediately under the email field
- Form cannot be submitted

#### Test Case 1.1.3: Password Strength Indicator
**Steps:**
1. Type these passwords and observe the strength indicator:
   - "abc" - Weak (red)
   - "abcdefgh" - Weak (red)
   - "Abcdefgh" - Medium (yellow)
   - "Abcdefgh1" - Medium (yellow)
   - "Abcdefgh1!" - Strong (green)

**Expected Results:**
- Indicator appears below password field
- Color and width change based on strength
- Label shows: Weak/Medium/Strong

#### Test Case 1.1.4: Password Requirements
**Steps:**
1. Try submitting with weak passwords:
   - "short" - Error: "Password must be at least 8 characters"
   - "alllowercase123" - Error: "Password must contain at least one uppercase letter"
   - "Uppercase" - Error: "Password must contain at least one number"

**Expected Results:**
- Specific error messages display
- Form submission blocked

#### Test Case 1.1.5: Password Confirmation
**Steps:**
1. Enter password: Test123!@#
2. Enter confirm password: Different123!@#
3. Click "Create Account"

**Expected Results:**
- Error message: "Passwords don't match"
- Form submission blocked

#### Test Case 1.1.6: Duplicate Email
**Steps:**
1. Register with: test@example.com
2. Logout
3. Try to register again with: test@example.com

**Expected Results:**
- Error message: "Email already exists"
- Registration fails

#### Test Case 1.1.7: Password Visibility Toggle
**Steps:**
1. Enter password
2. Click the eye icon on password field
3. Click the eye icon on confirm password field

**Expected Results:**
- Password text becomes visible/hidden
- Icon changes between Eye and EyeOff

---

### US-1.2: User Login

#### Test Case 1.2.1: Successful Login
**Steps:**
1. Navigate to http://localhost:3000/login
2. Enter credentials (registered user):
   - Email: test@example.com
   - Password: Test123!@#
3. Click "Sign In"

**Expected Results:**
- Loading spinner appears briefly
- Redirect to /dashboard
- User name/email displayed in header

#### Test Case 1.2.2: Invalid Credentials
**Steps:**
1. Try login with:
   - Email: test@example.com
   - Password: WrongPassword123

**Expected Results:**
- Error message: "Invalid email or password"
- No redirect
- Error displayed in red alert box

#### Test Case 1.2.3: Failed Login Attempts & Account Lock
**Steps:**
1. Try login with wrong password 3 times consecutively
2. Observe the error message after 3rd attempt

**Expected Results:**
- First 2 attempts: "Invalid email or password"
- 3rd attempt: "Too many failed attempts. Account locked for 5 minutes"
- Additional message: "For security, your account has been temporarily locked."
- Cannot login even with correct password for 5 minutes

**Verification:**
- Check localStorage > meal_planner_users > find your user
- Should have loginAttempts object with count: 3 and lockedUntil timestamp

#### Test Case 1.2.4: Remember Me Functionality
**Steps:**
1. Login with "Remember me" checked
2. Close browser tab
3. Reopen http://localhost:3000

**Expected Results:**
- User automatically logged in
- Redirected to dashboard
- Check localStorage: meal_planner_remember_me has date 30 days in future

**Without Remember Me:**
1. Login without checking "Remember me"
2. Close browser and reopen

**Expected Results:**
- Still logged in (session persists across refreshes)
- But no remember_me key in localStorage

#### Test Case 1.2.5: Forgot Password Link
**Steps:**
1. Click "Forgot password?" link

**Expected Results:**
- Alert message: "Forgot password functionality is coming in a future release!"

#### Test Case 1.2.6: Navigation to Register
**Steps:**
1. Click "Sign up" link

**Expected Results:**
- Navigate to /register page

#### Test Case 1.2.7: Password Visibility Toggle
**Steps:**
1. Enter password
2. Click eye icon

**Expected Results:**
- Password becomes visible
- Icon changes to EyeOff

---

### US-1.3: Onboarding Tutorial

#### Test Case 1.3.1: Auto-Start After Registration
**Steps:**
1. Complete a new user registration

**Expected Results:**
- Immediately redirected to /onboarding
- Onboarding modal appears over page
- First screen shows "Welcome to Meal Planner"

#### Test Case 1.3.2: Tutorial Screens Content
**Steps:**
1. Navigate through all 5 screens using "Next" button
2. Verify each screen contains:

**Screen 1: Welcome**
- Icon: Sparkles (teal background)
- Title: "Welcome to Meal Planner"
- Description: About planning meals and AI features

**Screen 2: Plan Your Meals**
- Icon: Calendar (blue background)
- Title: "Plan Your Meals"
- Description: About calendar functionality

**Screen 3: Discover Recipes**
- Icon: Search (purple background)
- Title: "Discover Recipes"
- Description: About browsing and AI suggestions

**Screen 4: Generate Shopping Lists**
- Icon: ShoppingCart (green background)
- Title: "Generate Shopping Lists"
- Description: About automatic list generation

**Screen 5: Get AI Suggestions**
- Icon: Sparkles (orange background)
- Title: "Get AI Suggestions"
- Description: About personalization

**Expected Results:**
- All screens display correctly
- Icons have colored backgrounds
- Text is readable and centered

#### Test Case 1.3.3: Progress Indicator
**Steps:**
1. Observe the progress bar at bottom as you navigate

**Expected Results:**
- Progress bar starts at 20% (screen 1/5)
- Increases by 20% each screen
- Reaches 100% at final screen
- Smooth transition animation

#### Test Case 1.3.4: Navigation Buttons
**Steps:**
1. First screen: Check "Back" button state
2. Middle screens: Use "Next" and "Back"
3. Last screen: Check for "Get Started" button

**Expected Results:**
- First screen: "Back" button is disabled (grayed out)
- Middle screens: Both "Next" and "Back" work
- Middle screens: "Skip" button visible
- Last screen: "Get Started" button replaces "Next"
- Last screen: "Skip" button is replaced by "Get Started"

#### Test Case 1.3.5: Skip Functionality
**Steps:**
1. Start onboarding
2. From any screen (except last), click "Skip"

**Expected Results:**
- Immediately redirected to /dashboard
- User's hasCompletedOnboarding flag set to true (check localStorage)
- Can navigate app normally

#### Test Case 1.3.6: Complete Onboarding
**Steps:**
1. Navigate through all 5 screens
2. On final screen, click "Get Started"

**Expected Results:**
- Redirected to /dashboard
- User's hasCompletedOnboarding flag set to true
- Welcome message on dashboard

#### Test Case 1.3.7: Keyboard Navigation - Arrow Keys
**Steps:**
1. Start onboarding
2. Press Right Arrow key
3. Press Left Arrow key

**Expected Results:**
- Right Arrow: Advances to next screen
- Left Arrow: Goes to previous screen
- Works on all screens (Left Arrow disabled on first screen)

#### Test Case 1.3.8: Keyboard Navigation - Enter
**Steps:**
1. Navigate to final screen (5/5)
2. Press Enter key

**Expected Results:**
- Same as clicking "Get Started"
- Completes onboarding
- Redirects to dashboard

#### Test Case 1.3.9: Keyboard Navigation - Escape
**Steps:**
1. Start onboarding
2. Press Escape key

**Expected Results:**
- Same as clicking "Skip"
- Completes onboarding
- Redirects to dashboard

#### Test Case 1.3.10: Replay Tutorial
**Steps:**
1. Complete onboarding and reach dashboard
2. Click "Replay Tutorial" button in Settings section

**Expected Results:**
- Redirected to /onboarding
- Tutorial starts from beginning
- Can complete again

#### Test Case 1.3.11: Close Button (X)
**Steps:**
1. Start onboarding
2. Click X button in top-right corner

**Expected Results:**
- Same as "Skip" - redirects to dashboard
- Onboarding marked complete

#### Test Case 1.3.12: Responsive Design
**Steps:**
1. Resize browser window to mobile size (375px)
2. Navigate through tutorial

**Expected Results:**
- Modal adjusts to screen size
- Text remains readable
- Buttons accessible
- No horizontal scrolling

---

### Integration Tests

#### Test Case INT-1: Complete User Journey
**Steps:**
1. Open app (http://localhost:3000)
2. Click "Sign up" from login page
3. Register new account
4. Complete onboarding tutorial
5. Logout from dashboard
6. Login again with "Remember me"
7. Verify dashboard access

**Expected Results:**
- Smooth flow through entire journey
- No errors or broken links
- Data persists correctly

#### Test Case INT-2: Session Persistence
**Steps:**
1. Login with valid credentials
2. Navigate to dashboard
3. Refresh the page (F5)
4. Navigate to /login manually in URL

**Expected Results:**
- After refresh: Still logged in, still on dashboard
- When navigating to /login: Auto-redirected to dashboard
- Session maintains throughout

#### Test Case INT-3: Auth Guards
**Steps:**
1. Logout completely
2. Try to access /dashboard directly
3. Try to access /onboarding directly
4. Login
5. Try to access /login
6. Try to access /register

**Expected Results:**
- When logged out: /dashboard and /onboarding redirect to /login
- When logged in: /login and /register redirect to /dashboard
- Auth guards work correctly

---

### Browser Compatibility Testing

Test the following browsers:
- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (if on Mac)

**Test Cases:**
- Registration flow
- Login flow
- Onboarding tutorial
- Keyboard navigation
- LocalStorage functionality

---

### Edge Cases & Error Handling

#### Test Case EDGE-1: Empty Form Submission
**Steps:**
1. Go to register/login
2. Submit form without filling anything

**Expected Results:**
- Validation errors for required fields
- Form doesn't submit

#### Test Case EDGE-2: Special Characters in Email
**Steps:**
1. Try emails with special characters:
   - test+tag@example.com (valid)
   - test..double@example.com (valid)

**Expected Results:**
- Valid email formats are accepted
- Can register and login

#### Test Case EDGE-3: Long Password
**Steps:**
1. Enter very long password (100+ characters)

**Expected Results:**
- Password accepted if meets requirements
- No visual overflow issues

#### Test Case EDGE-4: Multiple Browser Tabs
**Steps:**
1. Open app in two tabs
2. Login in Tab 1
3. Check Tab 2

**Expected Results:**
- Both tabs share authentication state (via localStorage)
- Logout in one tab affects the other

#### Test Case EDGE-5: Clear Browser Data
**Steps:**
1. Register and login
2. Clear all browser data (localStorage)
3. Refresh page

**Expected Results:**
- User logged out
- Redirected to login page
- Must login again

---

## Debugging Tips

### Check localStorage:
1. Open DevTools (F12)
2. Go to Application > Local Storage > http://localhost:3000
3. Look for keys:
   - meal_planner_users (all users)
   - meal_planner_current_user (logged in user)
   - meal_planner_auth_token (session token)
   - meal_planner_remember_me (remember me expiry)

### Clear All Data:
```javascript
// Run in browser console
localStorage.clear()
location.reload()
```

### Check Specific User:
```javascript
// Run in browser console
const users = JSON.parse(localStorage.getItem('meal_planner_users') || '[]')
console.log(users)
```

### Reset Failed Login Attempts:
```javascript
// Run in browser console
const users = JSON.parse(localStorage.getItem('meal_planner_users') || '[]')
const user = users.find(u => u.email === 'test@example.com')
if (user) {
  user.loginAttempts = { count: 0, lastAttempt: new Date().toISOString() }
  localStorage.setItem('meal_planner_users', JSON.stringify(users))
  console.log('Reset login attempts')
}
```

---

## Acceptance Criteria Checklist

### US-1.1: User Registration
- [x] Email validation (proper format)
- [x] Password requirements (8 chars, uppercase, number)
- [x] Password strength indicator (Weak/Medium/Strong)
- [x] Confirm password matching
- [x] Clear error messages
- [x] Success message with redirect
- [x] Auto-login after registration
- [x] Redirect to onboarding
- [x] Data persisted to localStorage
- [x] React Hook Form + Zod validation

### US-1.2: User Login
- [x] Login form with email/password
- [x] "Remember me" checkbox (30 days)
- [x] "Forgot password?" link
- [x] Successful login redirect to dashboard
- [x] Invalid credentials error
- [x] 3 failed attempts lock (5 minutes)
- [x] Loading state
- [x] Session persistence
- [x] Link to registration

### US-1.3: Onboarding Tutorial
- [x] Auto-starts after registration
- [x] 5 tutorial screens with content
- [x] Progress indicator
- [x] Next/Back navigation
- [x] Skip functionality
- [x] Get Started button (final screen)
- [x] Completion flag saved
- [x] Replay option in settings
- [x] Responsive design
- [x] Keyboard navigation (arrows, Enter, Escape)

---

## Known Issues / Limitations

1. **Security**: Uses simple hash function (demo only - not for production)
2. **Password Reset**: Not implemented (placeholder alert shown)
3. **Email Verification**: Not implemented
4. **Remember Me Cleanup**: Expired tokens not automatically cleaned
5. **Multi-device Sync**: Each browser/device has separate localStorage

---

## Performance Notes

- Build size: ~271KB (gzipped: ~82KB)
- Initial load: < 1s on broadband
- Form validation: Real-time (no delay)
- Authentication: ~500ms simulated delay
- Smooth animations throughout
