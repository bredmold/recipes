import { Injectable } from '@angular/core';

export interface CacheConfig {
  /** Cache key */
  key: string;

  /** Cache ttl in milliseconds */
  ttl: number;
}

class CacheEntry<R> {
  private readonly expiration: number;
  public readonly key: string;

  constructor(
    public readonly value: R,
    config: CacheConfig,
  ) {
    this.key = config.key;

    const now = new Date();
    this.expiration = now.getTime() + config.ttl;
  }

  expired(): boolean {
    const now = new Date().getTime();
    return now > this.expiration;
  }
}

export class TypedCache<R> {
  private readonly cache: { [key: string]: CacheEntry<R> } = {};

  invalidate(key: string) {
    const entry = this.cache[key];
    if (entry) {
      delete this.cache[key];
    }
  }

  async makeCachedCall(impl: () => Promise<R>, conf: CacheConfig): Promise<R> {
    const entry = this.cache[conf.key];
    const expired = entry && entry.expired();
    if (entry && !expired) {
      return entry.value;
    } else if (entry && expired) {
      delete this.cache[conf.key];
    }

    const value = await impl();
    const newEntry = new CacheEntry<R>(value, conf);
    this.cache[newEntry.key] = newEntry;

    return value;
  }
}

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  createTypedCache<R>(): TypedCache<R> {
    return new TypedCache<R>();
  }
}
