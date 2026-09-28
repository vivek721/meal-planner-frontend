import React from 'react';
import type { RecipeCategory } from '../../types/recipe.types';

interface CategoryGridProps {
  categories: RecipeCategory[];
  onSelect: (name: string) => void;
}

/** TheMealDB categories as photo tiles (the Recipes landing view). */
export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, onSelect }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
    {categories.map((category) => (
      <button
        key={category.name}
        type="button"
        data-testid="category-tile"
        onClick={() => onSelect(category.name)}
        className="group bg-white rounded-xl border border-gray-200 overflow-hidden text-left hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <div className="h-32 bg-gray-50 flex items-center justify-center overflow-hidden">
          <img
            src={category.thumbnail}
            alt={category.name}
            loading="lazy"
            className="h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900">{category.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{category.description}</p>
        </div>
      </button>
    ))}
  </div>
);
