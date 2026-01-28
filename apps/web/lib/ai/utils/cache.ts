/**
 * Image Generation Cache
 * Reduces costs by caching identical generations
 * Uses SHA-256 for collision-resistant cache keys
 */

import { createClient } from '@/lib/supabase/client';
import type { AIModelType, QualityPreset } from '../replicate-client';

/**
 * Compute SHA-256 hash of a string using Web Crypto API
 * Falls back to a deterministic hash if Web Crypto is unavailable
 */
async function sha256(message: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    // Browser environment with Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } else if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
    // Node.js or edge runtime with Web Crypto
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback: Use a more robust hash than djb2 (FNV-1a variant with larger state)
    // This is still not cryptographic but much more collision-resistant
    let h1 = 0x811c9dc5;
    let h2 = 0x1000193;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      h1 ^= char;
      h1 = Math.imul(h1, 0x01000193);
      h2 ^= char;
      h2 = Math.imul(h2, 0x85ebca6b);
    }
    return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
  }
}

export class ImageCache {
  private cachePrefix = 'ai-gen';
  private ttl = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  /**
   * Generate a cache key from generation parameters using SHA-256
   */
  private async getCacheKey(
    prompt: string,
    modelType: AIModelType,
    quality: QualityPreset,
    width: number,
    height: number
  ): Promise<string> {
    const normalized = `${modelType}:${quality}:${width}x${height}:${prompt
      .toLowerCase()
      .trim()}`;

    // Use SHA-256 for collision-resistant hashing
    const hash = await sha256(normalized);

    // Use first 16 characters (64 bits) of the hash - still very collision-resistant
    return `${this.cachePrefix}:${hash.substring(0, 16)}`;
  }

  /**
   * Get cached image URL
   */
  async get(
    prompt: string,
    modelType: AIModelType,
    quality: QualityPreset,
    width: number = 1024,
    height: number = 1024
  ): Promise<string | null> {
    try {
      const supabase = createClient();
      if (!supabase) return null;

      const cacheKey = await this.getCacheKey(prompt, modelType, quality, width, height);

      const { data, error } = await supabase
        .from('image_cache')
        .select('image_url, created_at')
        .eq('cache_key', cacheKey)
        .maybeSingle();

      if (error || !data) return null;

      // Check if cache is expired
      const createdAt = new Date(data.created_at).getTime();
      const now = Date.now();

      if (now - createdAt > this.ttl) {
        // Cache expired, delete it
        await this.delete(cacheKey);
        return null;
      }

      console.log(`[ImageCache] Cache HIT for key: ${cacheKey}`);
      return data.image_url;
    } catch (error) {
      console.error('[ImageCache] Error getting from cache:', error);
      return null;
    }
  }

  /**
   * Store image URL in cache
   */
  async set(
    prompt: string,
    modelType: AIModelType,
    quality: QualityPreset,
    imageUrl: string,
    width: number = 1024,
    height: number = 1024
  ): Promise<void> {
    try {
      const supabase = createClient();
      if (!supabase) return;

      const cacheKey = await this.getCacheKey(prompt, modelType, quality, width, height);

      const { error } = await supabase.from('image_cache').upsert(
        {
          cache_key: cacheKey,
          prompt,
          model_type: modelType,
          quality,
          image_url: imageUrl,
          width,
          height,
          created_at: new Date().toISOString(),
        },
        {
          onConflict: 'cache_key',
        }
      );

      if (error) {
        console.error('[ImageCache] Error setting cache:', error);
      } else {
        console.log(`[ImageCache] Cache SET for key: ${cacheKey}`);
      }
    } catch (error) {
      console.error('[ImageCache] Error setting cache:', error);
    }
  }

  /**
   * Delete a cache entry
   */
  private async delete(cacheKey: string): Promise<void> {
    try {
      const supabase = createClient();
      if (!supabase) return;

      await supabase.from('image_cache').delete().eq('cache_key', cacheKey);

      console.log(`[ImageCache] Cache DELETED for key: ${cacheKey}`);
    } catch (error) {
      console.error('[ImageCache] Error deleting from cache:', error);
    }
  }

  /**
   * Clear expired entries (run periodically)
   */
  async clearExpired(): Promise<void> {
    try {
      const supabase = createClient();
      if (!supabase) return;

      const expiryDate = new Date(Date.now() - this.ttl).toISOString();

      const { error } = await supabase
        .from('image_cache')
        .delete()
        .lt('created_at', expiryDate);

      if (error) {
        console.error('[ImageCache] Error clearing expired cache:', error);
      } else {
        console.log('[ImageCache] Expired cache entries cleared');
      }
    } catch (error) {
      console.error('[ImageCache] Error clearing expired cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalEntries: number;
    cacheSize: number;
    oldestEntry: string | null;
  }> {
    try {
      const supabase = createClient();
      if (!supabase) {
        return { totalEntries: 0, cacheSize: 0, oldestEntry: null };
      }

      const { count } = await supabase
        .from('image_cache')
        .select('*', { count: 'exact', head: true });

      const { data: oldestData } = await supabase
        .from('image_cache')
        .select('created_at')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      return {
        totalEntries: count || 0,
        cacheSize: count || 0,
        oldestEntry: oldestData?.created_at || null,
      };
    } catch (error) {
      console.error('[ImageCache] Error getting stats:', error);
      return { totalEntries: 0, cacheSize: 0, oldestEntry: null };
    }
  }
}

// Export singleton instance
export const imageCache = new ImageCache();
