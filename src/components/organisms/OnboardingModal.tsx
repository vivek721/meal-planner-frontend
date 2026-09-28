import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, Search, ShoppingCart, Sparkles, X } from 'lucide-react';
import { Button } from '../atoms/Button';
import AuthService from '../../services/AuthService';

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBgColor: string;
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Welcome to Meal Planner',
    description: 'Plan a week of meals in a few minutes. Pick recipes, fill in your calendar, and stop wondering what to cook.',
    icon: <Sparkles size={48} />,
    iconBgColor: 'bg-primary-100 text-primary-600',
  },
  {
    id: 2,
    title: 'Plan Your Meals',
    description: 'Add breakfast, lunch, dinner and snacks to each day of the week. Copy a day to other days, or clear the plan and start fresh.',
    icon: <Calendar size={48} />,
    iconBgColor: 'bg-blue-100 text-blue-600',
  },
  {
    id: 3,
    title: 'Discover Recipes',
    description: 'Browse real recipes with photos from TheMealDB. Pick a category, search by name, filter by cuisine or main ingredient, and save your favourites.',
    icon: <Search size={48} />,
    iconBgColor: 'bg-purple-100 text-purple-600',
  },
  {
    id: 4,
    title: 'Shopping Lists (Coming Soon)',
    description: 'Soon you\'ll be able to turn your meal plan into a shopping list, with ingredients grouped so shopping is quick.',
    icon: <ShoppingCart size={48} />,
    iconBgColor: 'bg-green-100 text-green-600',
  },
  {
    id: 5,
    title: 'Get Meal Suggestions',
    description: 'Not sure what to cook? The meal plan suggests recipes based on the time of day, favouring categories you have not planned yet this week for variety.',
    icon: <Sparkles size={48} />,
    iconBgColor: 'bg-secondary-100 text-secondary-600',
  },
];

export const OnboardingModal: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Skipping and finishing both mark onboarding complete and go to the dashboard
  const finishOnboarding = useCallback(() => {
    AuthService.completeOnboarding();
    navigate('/dashboard');
  }, [navigate]);

  const handleSkip = finishOnboarding;
  const handleComplete = finishOnboarding;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentSlide > 0) {
        setCurrentSlide(currentSlide - 1);
      } else if (e.key === 'ArrowRight' && currentSlide < slides.length - 1) {
        setCurrentSlide(currentSlide + 1);
      } else if (e.key === 'Enter' && currentSlide === slides.length - 1) {
        handleComplete();
      } else if (e.key === 'Escape') {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, handleComplete, handleSkip]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide];
  const progress = ((currentSlide + 1) / slides.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header with Skip/Close */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="text-sm text-gray-500">
            {currentSlide + 1} of {slides.length}
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Skip tutorial"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 md:p-12">
          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <div className={`${slide.iconBgColor} rounded-full p-6 mb-6`}>
              {slide.icon}
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {slide.title}
            </h2>

            {/* Description */}
            <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
              {slide.description}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-8 mb-6">
          <div
            className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={currentSlide + 1}
            aria-valuemin={1}
            aria-valuemax={slides.length}
            aria-label="Onboarding progress"
          >
            <div
              className="h-full bg-primary-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 bg-gray-50 border-t">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentSlide === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft size={20} />
            Back
          </Button>

          <div className="flex gap-2">
            {currentSlide < slides.length - 1 ? (
              <>
                <Button variant="outline" onClick={handleSkip}>
                  Skip
                </Button>
                <Button onClick={handleNext} className="flex items-center gap-2">
                  Next
                  <ChevronRight size={20} />
                </Button>
              </>
            ) : (
              <Button onClick={handleComplete} size="lg">
                Get Started
              </Button>
            )}
          </div>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="px-6 pb-4 text-center">
          <p className="text-xs text-gray-400">
            Use arrow keys to navigate • Press Escape to skip • Press Enter to start
          </p>
        </div>
      </div>
    </div>
  );
};
