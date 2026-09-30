import { describe, expect, it } from 'vitest';
import { filterOptions, isRecipeId, listedSpelling, pickSimilar, previewImage } from './recipeUtils';

describe('isRecipeId', () => {
  it('accepts TheMealDB ids only', () => {
    expect(isRecipeId('52772')).toBe(true);
    for (const id of ['recipe-001', '', '0', '052772', '52772x', ' 52772', 52772, null]) {
      expect(isRecipeId(id)).toBe(false);
    }
  });
});

describe('previewImage', () => {
  it('adds /preview to TheMealDB meal images', () => {
    expect(previewImage('https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg')).toBe(
      'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg/preview',
    );
  });

  it('leaves other images alone', () => {
    const untouched = [
      'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg/preview',
      'https://www.themealdb.com/images/category/beef.png',
      'data:image/svg+xml;charset=utf-8,%3Csvg%2F%3E',
      '',
    ];
    for (const url of untouched) expect(previewImage(url)).toBe(url);
  });
});

describe('pickSimilar', () => {
  const list = ['1', '2', '3', '4', '5', '6'].map((id) => ({ id }));

  it('returns up to 4 in order, excluding the current recipe', () => {
    expect(pickSimilar(list, '2').map((r) => r.id)).toEqual(['1', '3', '4', '5']);
  });

  it('returns fewer when the category is small', () => {
    expect(pickSimilar([{ id: '1' }, { id: '2' }], '1').map((r) => r.id)).toEqual(['2']);
  });
});

describe('filterOptions', () => {
  it('puts the "all" option first', () => {
    expect(filterOptions('All cuisines', ['British', 'Thai'], '')).toEqual([
      { value: '', label: 'All cuisines' },
      { value: 'British', label: 'British' },
      { value: 'Thai', label: 'Thai' },
    ]);
  });

  it('keeps a current value that is not (yet) in the list', () => {
    expect(filterOptions('All categories', ['Beef'], 'Goat').map((o) => o.value)).toEqual(['', 'Beef', 'Goat']);
  });
});

describe('listedSpelling', () => {
  const cuisines = ['American', 'New Zealand', 'Japanese'];

  it('finds the listed spelling ignoring case, spaces and "_"', () => {
    expect(listedSpelling(cuisines, 'japanese')).toBe('Japanese');
    expect(listedSpelling(cuisines, ' AMERICAN ')).toBe('American');
    expect(listedSpelling(cuisines, 'new_zealand')).toBe('New Zealand');
    expect(listedSpelling(cuisines, 'new   zealand')).toBe('New Zealand');
  });

  it('is undefined for an unlisted or blank value', () => {
    expect(listedSpelling(cuisines, 'Martian')).toBeUndefined();
    expect(listedSpelling(cuisines, '  ')).toBeUndefined();
  });
});
