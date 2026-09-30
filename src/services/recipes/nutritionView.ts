import type { NutrientKey, NutritionIngredient, RecipeNutrition } from '../../types/recipe.types';

export interface NutrientRow {
  key: NutrientKey;
  label: string;
  value: string;
}

export interface IngredientRow {
  name: string;
  measure: string;
  counted: boolean;
  detail: string;
}

/** Display text for the nutrition card; the card renders this and computes nothing. */
export interface NutritionView {
  calories: string;
  nutrients: NutrientRow[];
  coverage: string;
  /** Fewer than half the ingredients were counted. */
  partial: boolean;
  /** No ingredient was counted, so the totals mean nothing. */
  none: boolean;
  lines: IngredientRow[];
}

const NUTRIENTS: { key: Exclude<NutrientKey, 'calories'>; label: string; unit: 'g' | 'mg' }[] = [
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbohydrate', label: 'Carbs', unit: 'g' },
  { key: 'fat', label: 'Fat', unit: 'g' },
  { key: 'fiber', label: 'Fibre', unit: 'g' },
  { key: 'sugars', label: 'Sugars', unit: 'g' },
  { key: 'sodium', label: 'Sodium', unit: 'mg' },
];

const REASONS: Record<NonNullable<NutritionIngredient['reason']>, string> = {
  unmeasurable: 'the amount can’t be measured',
  noPortion: 'USDA data has no weight for this measure',
  noMatch: 'no matching food in USDA data',
};

const whole = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 0 });
const oneDecimal = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const upToOneDecimal = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 1 });

function describeLine(line: NutritionIngredient): IngredientRow {
  const counted = line.status === 'counted';
  let detail: string;
  if (counted) {
    const parts = [line.food?.description ?? line.name];
    if (line.grams !== undefined) parts.push(`${upToOneDecimal(line.grams)} g`);
    if (line.calories !== undefined) parts.push(`${whole(line.calories)} kcal`);
    detail = parts.join(' · ');
  } else {
    detail = line.reason ? `Not counted: ${REASONS[line.reason]}` : 'Not counted';
  }
  return { name: line.name, measure: line.measure, counted, detail };
}

export function toNutritionView(n: RecipeNutrition): NutritionView {
  const incomplete = new Set(n.incomplete ?? []);
  const atLeast = (key: NutrientKey, text: string) => (incomplete.has(key) ? `at least ${text}` : text);
  const { counted, total } = n.coverage;

  return {
    calories: atLeast('calories', `${whole(n.totals.calories)} kcal`),
    nutrients: NUTRIENTS.map(({ key, label, unit }) => ({
      key,
      label,
      value: atLeast(key, unit === 'mg' ? `${whole(n.totals[key])} mg` : `${oneDecimal(n.totals[key])} g`),
    })),
    coverage: `Based on ${counted} of ${total} ${total === 1 ? 'ingredient' : 'ingredients'}`,
    partial: counted > 0 && counted * 2 < total,
    none: counted === 0,
    lines: n.ingredients.map(describeLine),
  };
}
