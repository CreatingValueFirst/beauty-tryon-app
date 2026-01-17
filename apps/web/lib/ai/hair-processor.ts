/**
 * Hair Processing Engine
 * Applies hair color and style overlays using MediaPipe segmentation
 */

import { segmentHair, extractHairMask, getFaceLandmarks } from './mediapipe';

export interface HairColor {
  r: number;
  g: number;
  b: number;
}

export interface HairSettings {
  color: HairColor;
  opacity: number; // 0-1
  saturation: number; // 0-2 (1 is normal)
  brightness: number; // 0-2 (1 is normal)
  blendMode: 'source-over' | 'multiply' | 'screen' | 'overlay';
}

/**
 * Parse hex color to RGB
 */
export function hexToRgb(hex: string): HairColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Apply hair color overlay to canvas using simple method (fallback)
 * Uses face landmarks to estimate hair region
 */
export async function applyHairColorSimple(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  settings: HairSettings,
  timestamp: number
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  try {
    // Get face landmarks
    const landmarks = await getFaceLandmarks(video, timestamp);

    if (!landmarks || !landmarks.faceLandmarks || landmarks.faceLandmarks.length === 0) {
      return;
    }

    const faceLandmarks = landmarks.faceLandmarks[0];

    // Estimate hair region based on face landmarks
    // Top of head region (simplified approach)
    const faceTop = Math.min(...faceLandmarks.map((l) => l.y * canvas.height));
    const faceLeft = Math.min(...faceLandmarks.map((l) => l.x * canvas.width));
    const faceRight = Math.max(...faceLandmarks.map((l) => l.x * canvas.width));
    const faceWidth = faceRight - faceLeft;

    // Hair region (above face)
    const hairHeight = faceTop * 0.8; // Hair typically starts higher
    const hairLeft = faceLeft - faceWidth * 0.2;
    const hairWidth = faceWidth * 1.4;

    // Create gradient for natural hair effect
    const gradient = ctx.createLinearGradient(0, 0, 0, faceTop);
    gradient.addColorStop(0, `rgba(${settings.color.r}, ${settings.color.g}, ${settings.color.b}, ${settings.opacity})`);
    gradient.addColorStop(0.7, `rgba(${settings.color.r}, ${settings.color.g}, ${settings.color.b}, ${settings.opacity * 0.6})`);
    gradient.addColorStop(1, `rgba(${settings.color.r}, ${settings.color.g}, ${settings.color.b}, 0)`);

    // Set blend mode
    ctx.globalCompositeOperation = settings.blendMode;

    // Draw hair overlay
    ctx.fillStyle = gradient;
    ctx.fillRect(hairLeft, 0, hairWidth, faceTop);

    // Reset blend mode
    ctx.globalCompositeOperation = 'source-over';
  } catch (error) {
    console.error('Error applying hair color:', error);
  }
}

/**
 * Apply hair color using MediaPipe segmentation (advanced)
 */
export async function applyHairColorAdvanced(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  settings: HairSettings,
  timestamp: number
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  try {
    // Get hair segmentation
    const segmentation = await segmentHair(video, timestamp);
    if (!segmentation) {
      // Fallback to simple method
      return applyHairColorSimple(video, canvas, settings, timestamp);
    }

    // Extract hair mask
    const hairMask = extractHairMask(segmentation, canvas.width, canvas.height);
    if (!hairMask) return;

    // Get original image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const maskData = hairMask.data;

    // Apply color to hair pixels
    for (let i = 0; i < data.length; i += 4) {
      // Check if this pixel is hair
      if (maskData[i + 3] > 128) {
        // Get original color
        const origR = data[i];
        const origG = data[i + 1];
        const origB = data[i + 2];

        // Calculate luminance for preserving shadows/highlights
        const luminance = 0.299 * origR + 0.587 * origG + 0.114 * origB;
        const luminanceFactor = luminance / 255;

        // Apply new color with luminance preserved
        let newR = settings.color.r * luminanceFactor * settings.brightness;
        let newG = settings.color.g * luminanceFactor * settings.brightness;
        let newB = settings.color.b * luminanceFactor * settings.brightness;

        // Apply saturation
        if (settings.saturation !== 1) {
          const gray = (newR + newG + newB) / 3;
          newR = gray + (newR - gray) * settings.saturation;
          newG = gray + (newG - gray) * settings.saturation;
          newB = gray + (newB - gray) * settings.saturation;
        }

        // Blend with original based on opacity
        data[i] = origR * (1 - settings.opacity) + newR * settings.opacity;
        data[i + 1] = origG * (1 - settings.opacity) + newG * settings.opacity;
        data[i + 2] = origB * (1 - settings.opacity) + newB * settings.opacity;
      }
    }

    // Put modified image back
    ctx.putImageData(imageData, 0, 0);
  } catch (error) {
    console.error('Error in advanced hair processing:', error);
    // Fallback to simple method
    return applyHairColorSimple(video, canvas, settings, timestamp);
  }
}

/**
 * Main hair processing function
 * Automatically chooses best method based on availability
 */
export async function processHair(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  settings: HairSettings,
  timestamp: number
) {
  // Try advanced method first, will fallback to simple if needed
  await applyHairColorAdvanced(video, canvas, settings, timestamp);
}

/**
 * Default hair settings
 */
export const defaultHairSettings: HairSettings = {
  color: { r: 139, g: 92, b: 246 }, // Purple default
  opacity: 0.5,
  saturation: 1.0,
  brightness: 1.0,
  blendMode: 'multiply',
};
