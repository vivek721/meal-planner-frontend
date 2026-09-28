/** A per-key memo of an async loader. */
export interface AsyncCache<K, V> {
  get(key: K): Promise<V>;
}

/**
 * Memoises `load` per key for the lifetime of the page (one browser session).
 * Concurrent calls for a key share one request. Failures are not cached, so
 * the next call (e.g. Retry) loads again.
 */
export function createAsyncCache<K, V>(load: (key: K) => Promise<V>): AsyncCache<K, V> {
  const values = new Map<K, V>();
  const pending = new Map<K, Promise<V>>();

  return {
    get(key: K): Promise<V> {
      if (values.has(key)) return Promise.resolve(values.get(key) as V);
      const inFlight = pending.get(key);
      if (inFlight) return inFlight;

      // new Promise turns a synchronous throw in `load` into a rejection
      const request = new Promise<V>((resolve) => resolve(load(key))).then(
        (value) => {
          values.set(key, value);
          pending.delete(key);
          return value;
        },
        (error: unknown) => {
          pending.delete(key);
          throw error;
        },
      );
      pending.set(key, request);
      return request;
    },
  };
}
