import React, { useState } from 'react';
import { Heart, Calendar, Share2, Printer } from 'lucide-react';
import { Button } from '../atoms/Button';
import { useRecipes } from '../../contexts/RecipeContext';
import { useToast } from '../../contexts/ToastContext';
import type { Recipe } from '../../types/recipe.types';

interface RecipeActionsProps {
  recipe: Recipe;
  onAddToPlan?: () => void;
  className?: string;
}

export const RecipeActions: React.FC<RecipeActionsProps> = ({
  recipe,
  onAddToPlan,
  className = '',
}) => {
  const { isFavorite, toggleFavorite } = useRecipes();
  const { showSuccess, showInfo } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  const favorited = isFavorite(recipe.id);

  const handleFavoriteClick = () => {
    const newFavoriteState = toggleFavorite(recipe.id);
    if (newFavoriteState) {
      showSuccess(`${recipe.name} added to favorites!`);
    } else {
      showInfo(`${recipe.name} removed from favorites`);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);

    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.name,
          text: `Check out this recipe: ${recipe.name}`,
          url: window.location.href,
        });
        showSuccess('Recipe shared successfully!');
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          handleFallbackShare();
        }
      }
    } else {
      handleFallbackShare();
    }

    setIsSharing(false);
  };

  const handleFallbackShare = () => {
    // Fallback: copy to clipboard
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(
      () => {
        showSuccess('Recipe link copied to clipboard!');
      },
      () => {
        showInfo('Unable to share recipe');
      }
    );
  };

  const handlePrint = () => {
    window.print();
    showInfo('Print dialog opened');
  };

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <Button
        variant={favorited ? 'primary' : 'outline'}
        onClick={handleFavoriteClick}
        className="flex-1 sm:flex-none"
        aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart
          className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`}
        />
        <span>{favorited ? 'Favorited' : 'Save'}</span>
      </Button>

      {onAddToPlan && (
        <Button
          variant="primary"
          onClick={onAddToPlan}
          className="flex-1 sm:flex-none"
        >
          <Calendar className="w-5 h-5" />
          <span>Add to Plan</span>
        </Button>
      )}

      <Button
        variant="outline"
        onClick={handleShare}
        loading={isSharing}
        className="flex-1 sm:flex-none"
      >
        <Share2 className="w-5 h-5" />
        <span>Share</span>
      </Button>

      <Button
        variant="ghost"
        onClick={handlePrint}
        className="hidden sm:flex"
        aria-label="Print recipe"
      >
        <Printer className="w-5 h-5" />
      </Button>
    </div>
  );
};
