/**
 * Hair Processing Engine
 * Applies hair color and style overlays using TensorFlow.js BodyPix (best-in-class)
 * Fallback to MediaPipe segmentation if needed
 */

import { segmentPerson, extractPreciseHairMask, getHairMaskWithFeathering } from './bodypix-segmentation';
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
 * Custom error class for detection failures
 */
export class NoFaceDetectedError extends Error {
  constructor() {
    super('No face detected');
    this.name = 'NoFaceDetectedError';
  }
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
 * Apply hair color overlay to canvas using face landmarks (simplified method)
 * This method works reliably when MediaPipe segmentation is unavailable
 * @throws {NoFaceDetectedError} When no face is detected in the frame
 */
export async function applyHairColorSimple(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  settings: HairSettings,
  timestamp: number
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  // Get face landmarks
  const landmarks = await getFaceLandmarks(video, timestamp);

  if (!landmarks || !landmarks.faceLandmarks || landmarks.faceLandmarks.length === 0) {
    // No face detected - throw error so UI can handle it
    throw new NoFaceDetectedError();
  }

  try {

    const faceLandmarks = landmarks.faceLandmarks[0];

    // Calculate face boundaries
    const xs = faceLandmarks.map((l) => l.x * canvas.width);
    const ys = faceLandmarks.map((l) => l.y * canvas.height);

    const faceTop = Math.min(...ys);
    const faceBottom = Math.max(...ys);
    const faceLeft = Math.min(...xs);
    const faceRight = Math.max(...xs);

    const faceWidth = faceRight - faceLeft;
    const faceHeight = faceBottom - faceTop;
    const faceCenterX = (faceLeft + faceRight) / 2;

    // Estimate hair region (above and around face top)
    const hairTop = Math.max(0, faceTop - faceHeight * 0.8);
    const hairBottom = faceTop + faceHeight * 0.1; // Slightly into forehead
    const hairLeft = faceLeft - faceWidth * 0.25;
    const hairRight = faceRight + faceWidth * 0.25;
    const hairWidth = hairRight - hairLeft;
    const hairHeight = hairBottom - hairTop;

    // Save current state
    ctx.save();

    // Set blend mode for natural hair coloring
    ctx.globalCompositeOperation = settings.blendMode;

    // Create a more natural gradient with multiple stops
    const gradient = ctx.createLinearGradient(faceCenterX, hairTop, faceCenterX, hairBottom);
    gradient.addColorStop(0, `rgba(${settings.color.r}, ${settings.color.g}, ${settings.color.b}, ${settings.opacity * 0.9})`);
    gradient.addColorStop(0.3, `rgba(${settings.color.r}, ${settings.color.g}, ${settings.color.b}, ${settings.opacity})`);
    gradient.addColorStop(0.7, `rgba(${settings.color.r}, ${settings.color.g}, ${settings.color.b}, ${settings.opacity * 0.7})`);
    gradient.addColorStop(1, `rgba(${settings.color.r}, ${settings.color.g}, ${settings.color.b}, ${settings.opacity * 0.3})`);

    // Create a rounded rectangle for more natural hair shape
    ctx.beginPath();
    ctx.ellipse(
      faceCenterX,
      hairTop + hairHeight * 0.4,
      hairWidth * 0.6,
      hairHeight * 0.8,
      0,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = gradient;
    ctx.fill();

    // Add side hair regions
    const sideGradientLeft = ctx.createRadialGradient(
      hairLeft + hairWidth * 0.15,
      faceTop,
      hairWidth * 0.05,
      hairLeft + hairWidth * 0.15,
      faceTop,
      hairWidth * 0.25
    );
    sideGradientLeft.addColorStop(0, `rgba(${settings.color.r}, ${settings.color.g}, ${settings.color.b}, ${settings.opacity * 0.8})`);
    sideGradientLeft.addColorStop(1, `rgba(${settings.color.r}, ${settings.color.g}, ${settings.color.b}, 0)`);

    ctx.beginPath();
    ctx.ellipse(hairLeft + hairWidth * 0.15, faceTop, hairWidth * 0.2, faceHeight * 0.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = sideGradientLeft;
    ctx.fill();

    const sideGradientRight = ctx.createRadialGradient(
      hairRight - hairWidth * 0.15,
      faceTop,
      hairWidth * 0.05,
      hairRight - hairWidth * 0.15,
      faceTop,
      hairWidth * 0.25
    );
    sideGradientRight.addColorStop(0, `rgba(${settings.color.r}, ${settings.color.g}, ${settings.color.b}, ${settings.opacity * 0.8})`);
    sideGradientRight.addColorStop(1, `rgba(${settings.color.r}, ${settings.color.g}, ${settings.color.b}, 0)`);

    ctx.beginPath();
    ctx.ellipse(hairRight - hairWidth * 0.15, faceTop, hairWidth * 0.2, faceHeight * 0.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = sideGradientRight;
    ctx.fill();

    // Restore previous state
    ctx.restore();
  } catch (error) {
    console.error('Error applying simple hair color:', error);
    throw error;
  }
}

/**
 * Apply hair color using MediaPipe segmentation (advanced, pixel-perfect)
 */
export async function applyHairColorAdvanced(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  settings: HairSettings,
  timestamp: number
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.warn('No canvas context available');
    return applyHairColorSimple(video, canvas, settings, timestamp);
  }

  try {
    // Get hair segmentation
    const segmentation = await segmentHair(video, timestamp);
    if (!segmentation || !segmentation.categoryMask) {
      // Segmentation failed - use simple method
      return applyHairColorSimple(video, canvas, settings, timestamp);
    }

    // Extract hair mask
    const mask = segmentation.categoryMask;
    const maskWidth = mask.width;
    const maskHeight = mask.height;
    const maskArray = mask.getAsFloat32Array();

    // Get the current canvas image data (should already have video frame drawn)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Process each pixel
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        // Map canvas coordinates to mask coordinates
        const maskX = Math.floor((x / canvas.width) * maskWidth);
        const maskY = Math.floor((y / canvas.height) * maskHeight);
        const maskIdx = maskY * maskWidth + maskX;

        // Check if this pixel is categorized as hair (category 1)
        const category = Math.round(maskArray[maskIdx]);

        if (category === 1) {
          // This is a hair pixel
          const pixelIdx = (y * canvas.width + x) * 4;

          // Get original pixel color
          const origR = data[pixelIdx];
          const origG = data[pixelIdx + 1];
          const origB = data[pixelIdx + 2];

          // Calculate luminance to preserve lighting/shadows
          const luminance = 0.299 * origR + 0.587 * origG + 0.114 * origB;
          const luminanceFactor = luminance / 255;

          // Apply new color while preserving luminance
          let newR = settings.color.r * luminanceFactor * settings.brightness;
          let newG = settings.color.g * luminanceFactor * settings.brightness;
          let newB = settings.color.b * luminanceFactor * settings.brightness;

          // Apply saturation adjustment
          if (settings.saturation !== 1) {
            const gray = (newR + newG + newB) / 3;
            newR = gray + (newR - gray) * settings.saturation;
            newG = gray + (newG - gray) * settings.saturation;
            newB = gray + (newB - gray) * settings.saturation;
          }

          // Clamp values
          newR = Math.max(0, Math.min(255, newR));
          newG = Math.max(0, Math.min(255, newG));
          newB = Math.max(0, Math.min(255, newB));

          // Blend with original based on opacity
          data[pixelIdx] = origR * (1 - settings.opacity) + newR * settings.opacity;
          data[pixelIdx + 1] = origG * (1 - settings.opacity) + newG * settings.opacity;
          data[pixelIdx + 2] = origB * (1 - settings.opacity) + newB * settings.opacity;
        }
      }
    }

    // Put the modified image data back to canvas
    ctx.putImageData(imageData, 0, 0);
  } catch (error) {
    console.error('Error in advanced hair processing:', error);
    // Fallback to simple method on error
    return applyHairColorSimple(video, canvas, settings, timestamp);
  }
}

/**
 * Apply hair color using TensorFlow.js BodyPix (BEST METHOD - highest accuracy)
 */
export async function applyHairColorBodyPix(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  settings: HairSettings,
  timestamp: number
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  try {
    // Get precise hair segmentation from BodyPix
    const segmentation = await segmentPerson(video);
    if (!segmentation) return false;

    // Extract hair mask with feathering for natural edges
    const hairMask = extractPreciseHairMask(segmentation, canvas.width, canvas.height);
    if (!hairMask) return false;

    // Get current canvas image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const maskData = hairMask.data;

    // Apply sophisticated hair coloring pixel by pixel
    for (let i = 0; i < data.length; i += 4) {
      const maskAlpha = maskData[i + 3];

      if (maskAlpha > 10) { // Hair pixel detected
        const alpha = maskAlpha / 255;

        // Get original pixel color
        const origR = data[i];
        const origG = data[i + 1];
        const origB = data[i + 2];

        // Calculate luminance to preserve depth and shadows
        const luminance = 0.299 * origR + 0.587 * origG + 0.114 * origB;
        const luminanceFactor = luminance / 255;

        // Apply new color while preserving natural lighting
        let newR = settings.color.r * luminanceFactor * settings.brightness;
        let newG = settings.color.g * luminanceFactor * settings.brightness;
        let newB = settings.color.b * luminanceFactor * settings.brightness;

        // Apply saturation adjustment
        if (settings.saturation !== 1) {
          const gray = (newR + newG + newB) / 3;
          newR = gray + (newR - gray) * settings.saturation;
          newG = gray + (newG - gray) * settings.saturation;
          newB = gray + (newB - gray) * settings.saturation;
        }

        // Clamp values
        newR = Math.max(0, Math.min(255, newR));
        newG = Math.max(0, Math.min(255, newG));
        newB = Math.max(0, Math.min(255, newB));

        // Blend with original based on opacity and mask alpha
        const blendFactor = settings.opacity * alpha;
        data[i] = origR * (1 - blendFactor) + newR * blendFactor;
        data[i + 1] = origG * (1 - blendFactor) + newG * blendFactor;
        data[i + 2] = origB * (1 - blendFactor) + newB * blendFactor;
      }
    }

    // Put modified image back
    ctx.putImageData(imageData, 0, 0);
    return true;
  } catch (error) {
    console.error('BodyPix hair processing error:', error);
    return false;
  }
}

/**
 * Main hair processing function
 * Uses best-in-class technology with intelligent fallbacks
 * Priority: BodyPix > MediaPipe > Face Landmarks
 * @throws {NoFaceDetectedError} When no face is detected after trying all methods
 */
export async function processHair(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  settings: HairSettings,
  timestamp: number
): Promise<void> {
  try {
    // Method 1: Try TensorFlow.js BodyPix (BEST - most accurate)
    const bodyPixSuccess = await applyHairColorBodyPix(video, canvas, settings, timestamp);
    if (bodyPixSuccess) return;

    // Method 2: Try MediaPipe segmentation (GOOD - fast and accurate)
    await applyHairColorAdvanced(video, canvas, settings, timestamp);
  } catch (error) {
    // If it's a face detection error, try fallback before re-throwing
    if (!(error instanceof NoFaceDetectedError)) {
      console.warn('Advanced hair processing failed, using fallback:', error);
    }

    // Method 3: Fallback to landmark-based method (BASIC - always works)
    // This will throw NoFaceDetectedError if no face is found
    await applyHairColorSimple(video, canvas, settings, timestamp);
  }
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
