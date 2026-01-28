/**
 * Image Upload Utilities
 * Provides functions for uploading images to Supabase Storage
 */

export interface UploadResult {
  success: boolean;
  url?: string;
  fileName?: string;
  error?: string;
}

/**
 * Convert a base64 data URL to a File object
 */
export function base64ToFile(base64: string, filename: string): File {
  // Extract the mime type and base64 data from the data URL
  const match = base64.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid base64 data URL');
  }

  const mimeType = match[1];
  const base64Data = match[2];

  // Decode base64 to binary
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Create and return File object
  return new File([bytes], filename, { type: mimeType });
}

/**
 * Upload an image file to Supabase Storage via API
 * @param file - The file to upload
 * @param type - The type of image (e.g., 'hair', 'nails', 'makeup', 'person', 'garment')
 * @returns Upload result with URL or error
 */
export async function uploadImage(file: File, type: string): Promise<UploadResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || 'Upload failed',
      };
    }

    const data = await response.json();
    return {
      success: true,
      url: data.url,
      fileName: data.fileName,
    };
  } catch (error) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Upload a base64 data URL image to Supabase Storage
 * @param base64 - The base64 data URL of the image
 * @param type - The type of image (e.g., 'hair', 'nails', 'makeup')
 * @returns Upload result with URL or error
 */
export async function uploadBase64Image(base64: string, type: string): Promise<UploadResult> {
  try {
    // Generate a filename with timestamp
    const extension = base64.startsWith('data:image/png') ? 'png' : 'jpg';
    const filename = `${type}-${Date.now()}.${extension}`;

    // Convert base64 to File
    const file = base64ToFile(base64, filename);

    // Upload via API
    return uploadImage(file, type);
  } catch (error) {
    console.error('Base64 upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Check if a string is a base64 data URL
 */
export function isBase64DataUrl(str: string): boolean {
  return str.startsWith('data:image/');
}
