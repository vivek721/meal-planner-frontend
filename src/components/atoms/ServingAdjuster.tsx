import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface ServingAdjusterProps {
  servings: number;
  onServingsChange: (servings: number) => void;
  minServings?: number;
  maxServings?: number;
  className?: string;
}

export const ServingAdjuster: React.FC<ServingAdjusterProps> = ({
  servings,
  onServingsChange,
  minServings = 1,
  maxServings = 20,
  className = '',
}) => {
  const handleDecrease = () => {
    if (servings > minServings) {
      onServingsChange(servings - 1);
    }
  };

  const handleIncrease = () => {
    if (servings < maxServings) {
      onServingsChange(servings + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= minServings && value <= maxServings) {
      onServingsChange(value);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleDecrease}
        disabled={servings <= minServings}
        className="
          w-8 h-8 rounded-full border-2 border-primary-500
          flex items-center justify-center
          text-primary-600 hover:bg-primary-50
          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
          transition-colors
        "
        aria-label="Decrease servings"
      >
        <Minus className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2">
        <input
          type="number"
          value={servings}
          onChange={handleInputChange}
          min={minServings}
          max={maxServings}
          className="
            w-12 text-center font-semibold text-lg
            border-b-2 border-gray-300 focus:border-primary-500
            outline-none transition-colors
            bg-transparent
          "
          aria-label="Number of servings"
        />
        <span className="text-sm text-gray-600 font-medium">servings</span>
      </div>

      <button
        onClick={handleIncrease}
        disabled={servings >= maxServings}
        className="
          w-8 h-8 rounded-full border-2 border-primary-500
          flex items-center justify-center
          text-primary-600 hover:bg-primary-50
          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
          transition-colors
        "
        aria-label="Increase servings"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
