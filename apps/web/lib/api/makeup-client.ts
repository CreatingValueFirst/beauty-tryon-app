/**
 * Makeup Try-On API Client
 * TypeScript client for the makeup API
 */

export interface MakeupConfig {
  apply_lipstick: boolean;
  lipstick_color: string;
  apply_blush: boolean;
  blush_color: string;
  blush_intensity: number; // 0-100
  apply_foundation: boolean;
  foundation_preset: string;
}

export interface MakeupColors {
  lipstick: string[];
  blush: string[];
  foundation: string[];
}

export interface ProcessResponse {
  success: boolean;
  image?: string; // Base64 encoded image
  status: string;
  processing_time_ms?: number;
}

export interface MakeupAPIError {
  error: string;
  details?: string;
}

/**
 * Makeup API Client Class
 */
export class MakeupClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/makeup') {
    this.baseUrl = baseUrl;
  }

  /**
   * Get available makeup colors and presets
   */
  async getColors(): Promise<MakeupColors> {
    const response = await fetch(`${this.baseUrl}/colors`);

    if (!response.ok) {
      const error: MakeupAPIError = await response.json();
      throw new Error(error.details || error.error || 'Failed to fetch colors');
    }

    return response.json();
  }

  /**
   * Apply makeup to an image file
   * @param file - Image file to process
   * @param config - Makeup configuration
   * @returns Processed image result
   */
  async applyMakeup(file: File, config: Partial<MakeupConfig> = {}): Promise<ProcessResponse> {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);

    // Add configuration parameters
    const fullConfig: MakeupConfig = {
      apply_lipstick: config.apply_lipstick ?? true,
      lipstick_color: config.lipstick_color ?? 'Red',
      apply_blush: config.apply_blush ?? true,
      blush_color: config.blush_color ?? 'Pink',
      blush_intensity: config.blush_intensity ?? 50,
      apply_foundation: config.apply_foundation ?? true,
      foundation_preset: config.foundation_preset ?? 'Medium',
    };

    Object.entries(fullConfig).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    // Make request
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error: MakeupAPIError = await response.json();
      throw new Error(error.details || error.error || 'Failed to process image');
    }

    return response.json();
  }

  /**
   * Apply makeup to a base64 encoded image
   * @param imageBase64 - Base64 encoded image string
   * @param config - Makeup configuration
   * @returns Processed image result
   */
  async applyMakeupBase64(imageBase64: string, config: Partial<MakeupConfig> = {}): Promise<ProcessResponse> {
    // Convert File to base64 if needed
    const fullConfig: MakeupConfig = {
      apply_lipstick: config.apply_lipstick ?? true,
      lipstick_color: config.lipstick_color ?? 'Red',
      apply_blush: config.apply_blush ?? true,
      blush_color: config.blush_color ?? 'Pink',
      blush_intensity: config.blush_intensity ?? 50,
      apply_foundation: config.apply_foundation ?? true,
      foundation_preset: config.foundation_preset ?? 'Medium',
    };

    const response = await fetch(`${this.baseUrl}/apply-base64`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config: fullConfig,
        image_base64: imageBase64,
      }),
    });

    if (!response.ok) {
      const error: MakeupAPIError = await response.json();
      throw new Error(error.details || error.error || 'Failed to process image');
    }

    return response.json();
  }

  /**
   * Check if the makeup API is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.status === 'healthy';
    } catch (error) {
      return false;
    }
  }
}

/**
 * Default makeup client instance
 */
export const makeupClient = new MakeupClient();

/**
 * Helper function to convert File to base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Helper function to download base64 image
 */
export function downloadBase64Image(base64: string, filename: string = 'makeup-result.png') {
  const link = document.createElement('a');
  link.href = base64;
  link.download = filename;
  link.click();
}

/**
 * Default makeup configuration
 */
export const DEFAULT_MAKEUP_CONFIG: MakeupConfig = {
  apply_lipstick: true,
  lipstick_color: 'Red',
  apply_blush: true,
  blush_color: 'Pink',
  blush_intensity: 50,
  apply_foundation: true,
  foundation_preset: 'Medium',
};
