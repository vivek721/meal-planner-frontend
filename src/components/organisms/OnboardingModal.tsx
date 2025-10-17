import React, { useState, useEffect } from 'react';
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
    description: 'Plan your weekly meals effortlessly with our AI-powered platform. Save time, reduce food waste, and discover new recipes tailored to your preferences.',
    icon: <Sparkles size={48} />,
    iconBgColor: 'bg-primary-100 text-primary-600',
  },
  {
    id: 2,
    title: 'Plan Your Meals',
    description: 'Use our intuitive calendar to organize your meals for the week. Drag and drop recipes, schedule cooking times, and never wonder "what\'s for dinner?" again.',
    icon: <Calendar size={48} />,
    iconBgColor: 'bg-blue-100 text-blue-600',
  },
  {
    id: 3,
    title: 'Discover Recipes',
    description: 'Browse thousands of delicious recipes or let AI suggest meals based on your dietary preferences, available ingredients, and cooking time.',
    icon: <Search size={48} />,
    iconBgColor: 'bg-purple-100 text-purple-600',
  },
  {
    id: 4,
    title: 'Generate Shopping Lists',
    description: 'Automatically create shopping lists from your meal plan. We organize ingredients by category and even check what you already have at home.',
    icon: <ShoppingCart size={48} />,
    iconBgColor: 'bg-green-100 text-green-600',
  },
  {
    id: 5,
    title: 'Get AI Suggestions',
    description: 'Our smart AI learns your preferences over time and suggests personalized meal combinations, substitutions, and cooking tips to make meal planning even easier.',
    icon: <Sparkles size={48} />,
    iconBgColor: 'bg-secondary-100 text-secondary-600',
  },
];

export const OnboardingModal: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

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
  }, [currentSlide]);

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

  const handleSkip = () => {
    AuthService.completeOnboarding();
    navigate('/dashboard');
  };

  const handleComplete = () => {
    AuthService.completeOnboarding();
    navigate('/dashboard');
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
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
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
