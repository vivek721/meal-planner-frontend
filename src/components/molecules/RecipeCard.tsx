import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Clock, Users, Heart } from 'lucide-react';
import type { Recipe } from '../../types/recipe.types';
import { Badge } from '../atoms/Badge';
import { useRecipes } from '../../contexts/RecipeContext';

interface RecipeCardProps {
  recipe: Recipe;
  onClick?: () => void;
  variant?: 'compact' | 'full';
  isDraggable?: boolean;
  showFavorite?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onClick,
  variant = 'full',
  isDraggable = false,
  showFavorite = true,
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: recipe.id,
    data: { recipe },
    disabled: !isDraggable,
  });

  const { isFavorite, toggleFavorite } = useRecipes();
  const favorited = isFavorite(recipe.id);

  const handleClick = () => {
    if (onClick && !isDragging) {
      onClick();
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    toggleFavorite(recipe.id);
  };

  if (variant === 'compact') {
    return (
      <div
        ref={isDraggable ? setNodeRef : undefined}
        {...(isDraggable ? listeners : {})}
        {...(isDraggable ? attributes : {})}
        onClick={handleClick}
        className={`
          flex gap-3 p-3 bg-white rounded-lg border border-gray-200
          hover:shadow-md transition-all cursor-pointer relative
          ${isDragging ? 'opacity-50' : ''}
          ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}
        `}
      >
        <img
          src={recipe.thumbnail}
          alt={recipe.name}
          className="w-16 h-16 rounded-md object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-gray-900 truncate mb-1">
            {recipe.name}
          </h4>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{recipe.prepTime + recipe.cookTime} min</span>
            </div>
            <span>•</span>
            <span className="capitalize">{recipe.category}</span>
          </div>
        </div>
        {showFavorite && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white transition-colors"
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`w-4 h-4 ${
                favorited
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-400 hover:text-red-500'
              } transition-colors`}
            />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      ref={isDraggable ? setNodeRef : undefined}
      {...(isDraggable ? listeners : {})}
      {...(isDraggable ? attributes : {})}
      onClick={handleClick}
      className={`
        bg-white rounded-lg border border-gray-200 overflow-hidden
        hover:shadow-lg transition-all cursor-pointer relative group
        ${isDragging ? 'opacity-50 shadow-2xl' : ''}
        ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}
      `}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={recipe.thumbnail}
          alt={recipe.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {recipe.dietaryTags.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[calc(100%-5rem)]">
            {recipe.dietaryTags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {showFavorite && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white transition-all shadow-md hover:scale-110"
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`w-5 h-5 ${
                favorited
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-600 hover:text-red-500'
              } transition-colors`}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
          {recipe.name}
        </h3>

        {recipe.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {recipe.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{recipe.prepTime + recipe.cookTime} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{recipe.servings} servings</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 capitalize">{recipe.cuisine}</span>
          <div className="flex items-center gap-2">
            {recipe.rating && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span className="text-sm font-medium">{recipe.rating.toFixed(1)}</span>
                {recipe.reviewCount && (
                  <span className="text-xs text-gray-500">({recipe.reviewCount})</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
