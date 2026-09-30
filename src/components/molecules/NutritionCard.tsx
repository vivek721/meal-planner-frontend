import React, { useCallback, useMemo } from 'react';
import { AlertTriangle, Flame } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { getNutrition } from '../../services/recipes/recipeData';
import { toNutritionView, type NutritionView } from '../../services/recipes/nutritionView';
import { ErrorPanel } from './ErrorPanel';

interface NutritionCardProps {
  recipeId: string;
  className?: string;
}

const USDA_FDC_URL = 'https://fdc.nal.usda.gov/';

const Skeleton: React.FC = () => (
  <div data-testid="nutrition-loading" aria-busy="true" aria-label="Loading nutrition" className="animate-pulse space-y-3">
    <div className="h-8 w-32 rounded bg-gray-200" />
    <div className="grid grid-cols-2 gap-2">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="h-10 rounded bg-gray-100" />
      ))}
    </div>
    <div className="h-4 w-40 rounded bg-gray-100" />
  </div>
);

const Breakdown: React.FC<{ lines: NutritionView['lines'] }> = ({ lines }) => (
  <details data-testid="nutrition-breakdown" className="group border-t border-gray-100 pt-3">
    <summary className="cursor-pointer text-sm font-medium text-primary-600 hover:text-primary-700">
      Ingredient breakdown
    </summary>
    <ul className="mt-3 space-y-2">
      {lines.map((line, index) => (
        <li key={`${index}-${line.name}`} data-testid="nutrition-line" className="text-sm">
          <span className="font-medium text-gray-900">{line.name}</span>
          {line.measure && <span className="text-gray-500"> ({line.measure})</span>}
          <span className={`block ${line.counted ? 'text-gray-600' : 'text-gray-400 italic'}`}>{line.detail}</span>
        </li>
      ))}
    </ul>
  </details>
);

const Ready: React.FC<{ view: NutritionView }> = ({ view }) => (
  <div className="space-y-4">
    {view.none ? (
      <p data-testid="nutrition-none" className="text-sm text-gray-600">
        None of this recipe’s ingredients could be measured, so there is no estimate.
      </p>
    ) : (
      <>
        <p data-testid="nutrition-calories" className="text-3xl font-bold text-gray-900">
          {view.calories}
        </p>
        <dl className="grid grid-cols-2 gap-2">
          {view.nutrients.map((nutrient) => (
            <div key={nutrient.key} data-testid="nutrient" className="rounded-lg bg-gray-50 px-3 py-2">
              <dt className="text-xs uppercase tracking-wide text-gray-500">{nutrient.label}</dt>
              <dd className="font-semibold text-gray-900">{nutrient.value}</dd>
            </div>
          ))}
        </dl>
        <p data-testid="nutrition-coverage" className="text-sm text-gray-600">
          {view.coverage}
        </p>
        {view.partial && (
          <p
            data-testid="nutrition-partial"
            className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            Partial estimate: most ingredients could not be measured
          </p>
        )}
      </>
    )}
    <Breakdown lines={view.lines} />
  </div>
);

/**
 * Whole-recipe nutrition estimated by the backend from USDA FoodData Central.
 * It only formats the API's figures; a failure here never affects the rest of
 * the recipe page.
 */
export const NutritionCard: React.FC<NutritionCardProps> = ({ recipeId, className = '' }) => {
  const load = useCallback(() => getNutrition(recipeId), [recipeId]);
  const { data, error, loading, retry } = useAsync(load);
  const view = useMemo(() => (data ? toNutritionView(data) : null), [data]);

  return (
    <section data-testid="nutrition-card" className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-900">
          Nutrition (estimate) <span className="font-normal text-gray-500">· whole recipe</span>
        </h3>
      </div>

      {loading && <Skeleton />}
      {error && <ErrorPanel message={error.message} onRetry={retry} compact />}
      {view && <Ready view={view} />}

      <p className="mt-4 text-xs text-gray-500">
        <a href={USDA_FDC_URL} target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 underline">
          Data: USDA FoodData Central
        </a>
      </p>
    </section>
  );
};
