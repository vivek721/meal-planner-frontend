import { User, LoginAttempts } from '../types/auth.types';
import { hashPassword, verifyPassword } from '../utils/passwordUtils';

const STORAGE_KEYS = {
  USERS: 'meal_planner_users',
  AUTH_TOKEN: 'meal_planner_auth_token',
  CURRENT_USER: 'meal_planner_current_user',
  REMEMBER_ME: 'meal_planner_remember_me',
};

const LOCK_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_LOGIN_ATTEMPTS = 3;
const REMEMBER_ME_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

class AuthService {
  private getUsers(): User[] {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  private generateToken(): string {
    return `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async register(email: string, password: string, name?: string): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = this.getUsers();

    // Check if user already exists
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email already exists');
    }

    const newUser: User = {
      id: this.generateId(),
      email: email.toLowerCase(),
      name,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
      hasCompletedOnboarding: false,
    };

    users.push(newUser);
    this.saveUsers(users);

    // Auto-login
    const token = this.generateToken();
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));

    return newUser;
  }

  async login(email: string, password: string, rememberMe: boolean = false): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if account is locked
    if (user.loginAttempts?.lockedUntil) {
      const lockedUntil = new Date(user.loginAttempts.lockedUntil);
      if (lockedUntil > new Date()) {
        const remainingMinutes = Math.ceil((lockedUntil.getTime() - Date.now()) / 60000);
        throw new Error(`Account is locked. Please try again in ${remainingMinutes} minute(s)`);
      } else {
        // Lock expired, reset attempts
        user.loginAttempts = { count: 0, lastAttempt: new Date().toISOString() };
      }
    }

    // Verify password
    if (!verifyPassword(password, user.passwordHash)) {
      // Increment failed attempts
      const attempts: LoginAttempts = user.loginAttempts || { count: 0, lastAttempt: new Date().toISOString() };
      attempts.count++;
      attempts.lastAttempt = new Date().toISOString();

      if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
        attempts.lockedUntil = new Date(Date.now() + LOCK_DURATION).toISOString();
        user.loginAttempts = attempts;
        this.saveUsers(users);
        throw new Error('Too many failed attempts. Account locked for 5 minutes');
      }

      user.loginAttempts = attempts;
      this.saveUsers(users);
      throw new Error('Invalid email or password');
    }

    // Successful login - reset attempts
    user.loginAttempts = { count: 0, lastAttempt: new Date().toISOString() };
    this.saveUsers(users);

    const token = this.generateToken();
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));

    if (rememberMe) {
      const expiryDate = new Date(Date.now() + REMEMBER_ME_DURATION).toISOString();
      localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, expiryDate);
    }

    return user;
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
  }

  checkAuth(): boolean {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    const rememberMe = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME);

    if (!token || !user) {
      return false;
    }

    // Check if remember me has expired
    if (rememberMe) {
      const expiryDate = new Date(rememberMe);
      if (expiryDate < new Date()) {
        this.logout();
        return false;
      }
    }

    return true;
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  updateUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));

    // Also update in users array
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      this.saveUsers(users);
    }
  }

  completeOnboarding(): void {
    const user = this.getUser();
    if (user) {
      user.hasCompletedOnboarding = true;
      this.updateUser(user);
    }
  }
}

export default new AuthService();
