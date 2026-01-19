/**
 * Image Generation Cache
 * Reduces costs by caching identical generations
 */

import { createClient } from '@/lib/supabase/client';
import type { AIModelType, QualityPreset } from '../replicate-client';

export class ImageCache {
  private cachePrefix = 'ai-gen';
  private ttl = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  /**
   * Generate a cache key from generation parameters
   */
  private getCacheKey(
    prompt: string,
    modelType: AIModelType,
    quality: QualityPreset,
    width: number,
    height: number
  ): string {
    const normalized = `${modelType}:${quality}:${width}x${height}:${prompt
      .toLowerCase()
      .trim()}`;

    // Create a simple hash
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    return `${this.cachePrefix}:${Math.abs(hash).toString(36)}`;
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

      const cacheKey = this.getCacheKey(prompt, modelType, quality, width, height);

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

      const cacheKey = this.getCacheKey(prompt, modelType, quality, width, height);

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
