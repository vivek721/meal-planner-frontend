import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/useAuth';
import { RecipeProvider } from './contexts/RecipeContext';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/organisms/ToastContainer';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { MealPlan } from './pages/MealPlan';
import { Recipes } from './pages/Recipes';
import { RecipeDetail } from './pages/RecipeDetail';
import { Favorites } from './pages/Favorites';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // `initializing`, not `loading`: gating on the per-action `loading` flag would unmount
  // (and remount) this route's children on every login/logout, which is unrelated to
  // ProtectedRoute but shares the same context value.
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // `initializing`, not `loading`: a failed login/register sets `loading` true for the
  // duration of the request. Gating on it here would unmount LoginForm/RegisterForm (and
  // remount a fresh instance once `loading` clears), silently discarding the error message
  // the form had just set in its local state.
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" />;
};

// Root redirect component
const RootRedirect: React.FC = () => {
  const { isAuthenticated, user, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If authenticated but hasn't completed onboarding, redirect to onboarding
  if (user && !user.hasCompletedOnboarding) {
    return <Navigate to="/onboarding" />;
  }

  return <Navigate to="/dashboard" />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/meal-plan"
        element={
          <ProtectedRoute>
            <MealPlan />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recipes"
        element={
          <ProtectedRoute>
            <Recipes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recipes/:id"
        element={
          <ProtectedRoute>
            <RecipeDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to root */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <RecipeProvider>
            <AppRoutes />
            <ToastContainer />
          </RecipeProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
