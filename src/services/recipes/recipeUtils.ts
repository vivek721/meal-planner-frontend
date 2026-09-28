const RECIPE_ID = /^[1-9]\d*$/;

/** True for a TheMealDB id ("52772"); false for old mock ids ("recipe-001"). */
export const isRecipeId = (id: unknown): id is string => typeof id === 'string' && RECIPE_ID.test(id);

const MEAL_IMAGE = /^https?:\/\/www\.themealdb\.com\/images\/media\/meals\/[^/]+\.(?:jpe?g|png)$/i;

/**
 * TheMealDB's small preview of a meal photo, for lists and cards. Anything
 * else (a preview already, category images, old data-URI thumbnails) is
 * returned unchanged.
 */
export const previewImage = (url: string): string => (MEAL_IMAGE.test(url) ? `${url}/preview` : url);

/** Up to `count` recipes from the list, in order, excluding the current one. */
export function pickSimilar<T extends { id: string }>(recipes: T[], currentId: string, count = 4): T[] {
  return recipes.filter((recipe) => recipe.id !== currentId).slice(0, count);
}

export interface FilterOption {
  value: string;
  label: string;
}

/**
 * Dropdown options with an "all" entry (value '') first. A current value
 * missing from the list (e.g. while the list loads) is kept so the select
 * still shows it.
 */
export function filterOptions(allLabel: string, values: string[], current: string): FilterOption[] {
  const list = current && !values.includes(current) ? [...values, current] : values;
  return [{ value: '', label: allLabel }, ...list.map((value) => ({ value, label: value }))];
}
