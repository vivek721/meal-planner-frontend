import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Heart } from 'lucide-react';
import type { RecipeSummary } from '../../types/recipe.types';
import { Badge } from '../atoms/Badge';
import { useRecipes } from '../../contexts/useRecipes';
import { previewImage } from '../../services/recipes/recipeUtils';

interface RecipeCardProps {
  recipe: RecipeSummary;
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
  const image = previewImage(recipe.thumbnail);
  const meta = [recipe.category, recipe.cuisine].filter(Boolean).join(' • ');

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
        data-testid="recipe-card"
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
        <img src={image} alt={recipe.name} loading="lazy" className="w-16 h-16 rounded-md object-cover flex-shrink-0" />
        <div className="flex-1 min-w-0 pr-6">
          <h4 className="font-medium text-sm text-gray-900 truncate mb-1">{recipe.name}</h4>
          {meta && <p className="text-xs text-gray-500 truncate">{meta}</p>}
        </div>
        {showFavorite && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white transition-colors"
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`w-4 h-4 ${
                favorited ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'
              } transition-colors`}
            />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      data-testid="recipe-card"
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
          src={image}
          alt={recipe.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {recipe.category && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" size="sm">
              {recipe.category}
            </Badge>
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
                favorited ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
              } transition-colors`}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">{recipe.name}</h3>
        {recipe.cuisine && <p className="text-sm text-gray-500">{recipe.cuisine}</p>}
      </div>
    </div>
  );
};
