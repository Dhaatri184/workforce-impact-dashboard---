import { CacheEntry } from '../types';
import { API_CONFIG } from '../utils/constants';

export class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize = API_CONFIG.cache.maxSize, defaultTTL = API_CONFIG.cache.defaultTTL) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    
    // Clean up expired entries periodically
    setInterval(() => this.cleanup(), 60000); // Every minute
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }
    
    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: Array<{ key: string; age: number; expiresIn: number }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      expiresIn: entry.expiresAt - now
    }));

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate(),
      entries
    };
  }

  // Generate cache key for complex objects
  generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${JSON.stringify(params[key])}`)
      .join('|');
    
    return `${prefix}:${sortedParams}`;
  }

  // Get or set pattern - common caching pattern
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    // Not in cache, fetch and store
    try {
      const data = await factory();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      // Don't cache errors, just throw
      throw error;
    }
  }

  // Invalidate cache entries by pattern
  invalidatePattern(pattern: string): number {
    let count = 0;
    const regex = new RegExp(pattern);
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    return count;
  }

  // Refresh cache entry if it's close to expiring
  async refreshIfNeeded<T>(
    key: string,
    factory: () => Promise<T>,
    refreshThreshold = 0.8, // Refresh when 80% of TTL has passed
    ttl?: number
  ): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    const now = Date.now();
    const age = now - entry.timestamp;
    const totalTTL = entry.expiresAt - entry.timestamp;
    const ageRatio = age / totalTTL;
    
    // If entry is close to expiring, refresh it in background
    if (ageRatio >= refreshThreshold) {
      // Return current data immediately
      const currentData = entry.data as T;
      
      // Refresh in background (don't await)
      factory()
        .then(newData => {
          this.set(key, newData, ttl);
        })
        .catch(error => {
          console.warn(`Background refresh failed for key ${key}:`, error);
        });
      
      return currentData;
    }
    
    return entry.data as T;
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => this.cache.delete(key));
    
    if (expiredKeys.length > 0) {
      console.log(`Cache cleanup: removed ${expiredKeys.length} expired entries`);
    }
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private hitCount = 0;
  private missCount = 0;

  private calculateHitRate(): number {
    const total = this.hitCount + this.missCount;
    return total === 0 ? 0 : this.hitCount / total;
  }

  // Track cache hits/misses (call these in get method for accurate stats)
  private recordHit(): void {
    this.hitCount++;
  }

  private recordMiss(): void {
    this.missCount++;
  }

  // Batch operations
  setMany<T>(entries: Array<{ key: string; data: T; ttl?: number }>): void {
    entries.forEach(({ key, data, ttl }) => {
      this.set(key, data, ttl);
    });
  }

  getMany<T>(keys: string[]): Array<{ key: string; data: T | null }> {
    return keys.map(key => ({
      key,
      data: this.get<T>(key)
    }));
  }

  deleteMany(keys: string[]): number {
    let count = 0;
    keys.forEach(key => {
      if (this.cache.delete(key)) {
        count++;
      }
    });
    return count;
  }

  // Export/import for persistence (optional feature)
  export(): string {
    const exportData = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      ...entry
    }));
    
    return JSON.stringify({
      version: '1.0',
      timestamp: Date.now(),
      entries: exportData
    });
  }

  import(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.version !== '1.0') {
        console.warn('Unsupported cache export version');
        return false;
      }
      
      this.cache.clear();
      
      parsed.entries.forEach((entry: any) => {
        // Only import non-expired entries
        if (Date.now() < entry.expiresAt) {
          this.cache.set(entry.key, {
            data: entry.data,
            timestamp: entry.timestamp,
            expiresAt: entry.expiresAt
          });
        }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to import cache data:', error);
      return false;
    }
  }
}

// Singleton instance for global use
export const cacheService = new CacheService();