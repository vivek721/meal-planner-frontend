import React from 'react';
import { useAuth } from '../contexts/useAuth';
import { Button } from '../components/atoms/Button';
import { LogOut, User, Calendar, BookOpen, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    // AuthService.logout() clears the stored token in a `finally`; navigating before it
    // resolves can leave the token in localStorage long enough for PublicRoute to see a
    // still-authenticated user and bounce a subsequent /register visit back to /dashboard.
    await logout();
    navigate('/login');
  };

  const handleReplayTutorial = () => {
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary-500 text-white p-2 rounded-lg">
                <Calendar size={24} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Meal Planner</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <User size={20} />
                <span className="font-medium">{user?.name || user?.email}</span>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                loading={loading}
                className="flex items-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">
            Welcome{user?.name ? `, ${user.name}` : ''}!
          </h2>
          <p className="text-primary-100 text-lg">
            Ready to start planning your meals for the week?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            onClick={() => navigate('/meal-plan')}
            className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="bg-blue-100 text-blue-600 p-3 rounded-lg w-fit mb-4">
              <Calendar size={24} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">My Meal Plan</h3>
            <p className="text-gray-600">View and manage your weekly meal schedule</p>
          </div>

          <div
            onClick={() => navigate('/recipes')}
            className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="bg-purple-100 text-purple-600 p-3 rounded-lg w-fit mb-4">
              <BookOpen size={24} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Browse Recipes</h3>
            <p className="text-gray-600">Discover new recipes and add them to your plan</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 opacity-60">
            <div className="bg-green-100 text-green-600 p-3 rounded-lg w-fit mb-4">
              <ShoppingCart size={24} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Shopping List</h3>
            <p className="text-gray-600">Generate your grocery list automatically</p>
            <span className="text-xs text-gray-500 mt-2 block">Coming soon</span>
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Settings & Help</h3>
          <div className="space-y-3">
            <Button variant="outline" onClick={handleReplayTutorial} fullWidth>
              Replay Tutorial
            </Button>
            <p className="text-sm text-gray-500 text-center">
              Need help getting started? Replay the onboarding tutorial anytime.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
