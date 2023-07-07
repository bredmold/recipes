import { TestBed } from '@angular/core/testing';

import { CacheService, TypedCache } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

describe('TypedCache', () => {
  let cache: TypedCache<string>;

  beforeEach(() => {
    cache = new TypedCache<string>();
  });

  it('should call through on a cache miss', async () => {
    let trigger = false;
    const result = await cache.makeCachedCall(
      () => {
        trigger = true;
        return Promise.resolve('cache miss');
      },
      { key: 'test', ttl: 1000 },
    );

    expect(result).toBe('cache miss');
    expect(trigger).toBeTrue();
  });

  it('should return the cached value on a cache hit', async () => {
    const missResult = await cache.makeCachedCall(() => Promise.resolve('test'), { key: 'test', ttl: 1000 });
    expect(missResult).toBe('test');

    let trigger = false;
    const hitResult = await cache.makeCachedCall(
      () => {
        trigger = true;
        return Promise.resolve('cache miss');
      },
      { key: 'test', ttl: 1000 },
    );

    expect(hitResult).toBe('test');
    expect(trigger).toBeFalse();
  });

  it('should make the call after invalidating the cache', async () => {
    const missResult = await cache.makeCachedCall(() => Promise.resolve('invalidate'), { key: 'test', ttl: 1000 });
    expect(missResult).toBe('invalidate');

    const hitResult = await cache.makeCachedCall(() => Promise.resolve('miss'), { key: 'test', ttl: 1000 });
    expect(hitResult).toBe('invalidate');

    cache.invalidate('test');

    let trigger = false;
    const invalidateResult = await cache.makeCachedCall(
      () => {
        trigger = true;
        return Promise.resolve('cache miss');
      },
      { key: 'test', ttl: 1000 },
    );

    expect(invalidateResult).toBe('cache miss');
    expect(trigger).toBeTrue();
  });

  it('should make the call for an expired cache entry', async () => {
    const missResult = await cache.makeCachedCall(() => Promise.resolve('expiration'), { key: 'test', ttl: 10 });
    expect(missResult).toBe('expiration');

    const hitResult = await cache.makeCachedCall(() => Promise.resolve('miss'), { key: 'test', ttl: 1000 });
    expect(hitResult).toBe('expiration');

    // Sleep for 100 milliseconds
    await new Promise((resolve) => setTimeout(resolve, 100));

    let trigger = false;
    const expiredResult = await cache.makeCachedCall(
      () => {
        trigger = true;
        return Promise.resolve('expired');
      },
      { key: 'test', ttl: 10 },
    );

    expect(expiredResult).toBe('expired');
    expect(trigger).toBeTrue();
  });
});
