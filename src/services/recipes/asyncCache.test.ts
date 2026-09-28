import { describe, expect, it, vi } from 'vitest';
import { createAsyncCache } from './asyncCache';

describe('createAsyncCache', () => {
  it('loads each key once and then serves it from memory', async () => {
    const load = vi.fn(async (id: string) => `recipe ${id}`);
    const cache = createAsyncCache(load);
    await expect(cache.get('52772')).resolves.toBe('recipe 52772');
    await expect(cache.get('52772')).resolves.toBe('recipe 52772');
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('shares one request between concurrent calls for the same key', async () => {
    let finish: (value: string) => void = () => {};
    const load = vi.fn(() => new Promise<string>((resolve) => { finish = resolve; }));
    const cache = createAsyncCache(load);
    const first = cache.get('52772');
    const second = cache.get('52772');
    finish('Teriyaki Chicken Casserole');
    await expect(Promise.all([first, second])).resolves.toEqual(['Teriyaki Chicken Casserole', 'Teriyaki Chicken Casserole']);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('does not cache failures, so a later call retries', async () => {
    const load = vi.fn()
      .mockRejectedValueOnce(new Error('503'))
      .mockResolvedValueOnce('recovered');
    const cache = createAsyncCache(load as (id: string) => Promise<string>);
    await expect(cache.get('52772')).rejects.toThrow('503');
    await expect(cache.get('52772')).resolves.toBe('recovered');
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('turns a synchronous throw into a rejection', async () => {
    const cache = createAsyncCache((): Promise<string> => { throw new Error('bad'); });
    await expect(cache.get('x')).rejects.toThrow('bad');
  });

  it('keeps keys separate', async () => {
    const load = vi.fn(async (id: string) => id);
    const cache = createAsyncCache(load);
    await cache.get('1');
    await cache.get('2');
    expect(load).toHaveBeenCalledTimes(2);
  });
});
