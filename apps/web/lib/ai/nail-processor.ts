/**
 * Nail Processing Engine
 * Applies nail polish colors using MediaPipe hand tracking + enhanced geometric detection
 */

import { detectHands } from './mediapipe';
import { calculateNailBed, applyPerspectiveCorrection, NailBedSmoother } from './enhanced-nail-detection';

export interface NailColor {
  r: number;
  g: number;
  b: number;
}

export interface NailSettings {
  color: NailColor;
  opacity: number;
  glossiness: number; // 0-1
  pattern?: 'solid' | 'french' | 'glitter' | 'ombre';
}

/**
 * Finger tip indices in MediaPipe hand landmarks
 * 0-20 landmarks per hand, tips are: 4, 8, 12, 16, 20
 */
const FINGER_TIP_INDICES = [4, 8, 12, 16, 20];

// Global smoother for temporal consistency
const nailSmoother = new NailBedSmoother();

/**
 * Parse hex color to RGB
 */
export function hexToRgbNail(hex: string): NailColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 236, g: 72, b: 153 }; // Default pink
}

/**
 * Draw a professional nail on canvas at specific landmark position
 */
function drawNail(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  settings: NailSettings,
  rotation: number = 0
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  // Enhanced nail shape with realistic curvature
  const radius = width * 0.45;

  ctx.beginPath();
  // Top edge (rounded)
  ctx.moveTo(-width / 2 + radius, -height / 2);
  ctx.lineTo(width / 2 - radius, -height / 2);
  ctx.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + radius);

  // Right edge
  ctx.lineTo(width / 2, height / 2 - radius);
  ctx.quadraticCurveTo(width / 2, height / 2, width / 2 - radius, height / 2);

  // Bottom edge (more rounded for nail tip)
  ctx.lineTo(-width / 2 + radius, height / 2);
  ctx.quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - radius);

  // Left edge
  ctx.lineTo(-width / 2, -height / 2 + radius);
  ctx.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + radius, -height / 2);
  ctx.closePath();

  // Shadow/depth effect
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;

  // Base color with smooth gradient
  const { r, g, b } = settings.color;
  const baseGradient = ctx.createLinearGradient(-width / 2, 0, width / 2, 0);
  baseGradient.addColorStop(0, `rgba(${r * 0.9}, ${g * 0.9}, ${b * 0.9}, ${settings.opacity})`);
  baseGradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${settings.opacity})`);
  baseGradient.addColorStop(1, `rgba(${r * 0.9}, ${g * 0.9}, ${b * 0.9}, ${settings.opacity})`);
  ctx.fillStyle = baseGradient;
  ctx.fill();

  // Reset shadow for overlays
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Professional glossiness effect
  if (settings.glossiness > 0) {
    ctx.beginPath();
    ctx.ellipse(0, -height / 4, width * 0.35, height * 0.2, 0, 0, Math.PI * 2);
    const gloss = ctx.createRadialGradient(0, -height / 4, 0, 0, -height / 4, width * 0.4);
    gloss.addColorStop(0, `rgba(255, 255, 255, ${settings.glossiness * 0.6})`);
    gloss.addColorStop(0.6, `rgba(255, 255, 255, ${settings.glossiness * 0.2})`);
    gloss.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gloss;
    ctx.fill();
  }

  // Pattern overlays
  if (settings.pattern === 'french') {
    // Professional French manicure tip
    ctx.beginPath();
    ctx.arc(0, -height / 3, width * 0.65, 0, Math.PI, true);
    ctx.lineTo(-width * 0.65, -height / 3);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fill();

    // Subtle tip highlight
    ctx.beginPath();
    ctx.arc(0, -height / 3, width * 0.5, 0, Math.PI, true);
    const tipGloss = ctx.createLinearGradient(0, -height / 2, 0, -height / 3);
    tipGloss.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    tipGloss.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = tipGloss;
    ctx.fill();
  } else if (settings.pattern === 'glitter') {
    // Enhanced glitter effect with varied sizes
    const glitterCount = 15;
    for (let i = 0; i < glitterCount; i++) {
      const gx = (Math.random() - 0.5) * width * 0.7;
      const gy = (Math.random() - 0.5) * height * 0.7;
      const size = Math.random() * 2.5 + 0.5;

      ctx.beginPath();
      ctx.arc(gx, gy, size, 0, Math.PI * 2);
      const brightness = Math.random() * 0.5 + 0.5;
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
      ctx.fill();
    }
  } else if (settings.pattern === 'ombre') {
    // Sophisticated ombre gradient
    const ombre = ctx.createLinearGradient(0, -height / 2, 0, height / 2);
    ombre.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${settings.opacity * 0.9})`);
    ombre.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${settings.opacity})`);
    ombre.addColorStop(0.7, `rgba(${Math.min(r + 40, 255)}, ${Math.min(g + 40, 255)}, ${Math.min(b + 40, 255)}, ${settings.opacity})`);
    ombre.addColorStop(1, `rgba(255, 255, 255, ${settings.opacity * 0.5})`);

    // Redraw with ombre
    ctx.beginPath();
    ctx.moveTo(-width / 2 + radius, -height / 2);
    ctx.lineTo(width / 2 - radius, -height / 2);
    ctx.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + radius);
    ctx.lineTo(width / 2, height / 2 - radius);
    ctx.quadraticCurveTo(width / 2, height / 2, width / 2 - radius, height / 2);
    ctx.lineTo(-width / 2 + radius, height / 2);
    ctx.quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - radius);
    ctx.lineTo(-width / 2, -height / 2 + radius);
    ctx.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + radius, -height / 2);
    ctx.closePath();

    ctx.fillStyle = ombre;
    ctx.fill();
  }

  // Professional border for definition
  ctx.strokeStyle = `rgba(0, 0, 0, 0.25)`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}

/**
 * Calculate distance between two landmarks
 */
function getLandmarkDistance(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  width: number,
  height: number
): number {
  const dx = (p1.x - p2.x) * width;
  const dy = (p1.y - p2.y) * height;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate rotation angle between two points
 */
function getRotationAngle(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

/**
 * Custom error class for detection failures
 */
export class NoHandsDetectedError extends Error {
  constructor() {
    super('No hands detected');
    this.name = 'NoHandsDetectedError';
  }
}

/**
 * Process nail overlay on video frame with PROFESSIONAL PIXEL-PERFECT accuracy
 * Uses enhanced geometric analysis and temporal smoothing
 * @throws {NoHandsDetectedError} When no hands are detected in the frame
 */
export async function processNails(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  settings: NailSettings,
  timestamp: number
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  try {
    // Detect hands with MediaPipe
    const handResults = await detectHands(video, timestamp);

    if (!handResults || !handResults.landmarks || handResults.landmarks.length === 0) {
      // No hands detected - clear smoother history and throw error
      nailSmoother.clear();
      throw new NoHandsDetectedError();
    }

    // Process each detected hand
    for (let handIndex = 0; handIndex < handResults.landmarks.length; handIndex++) {
      const handLandmarks = handResults.landmarks[handIndex];
      const handedness = handResults.handednesses?.[handIndex]?.[0]?.categoryName || 'Right';

      // Process all 5 fingers with enhanced detection
      for (let fingerIndex = 0; fingerIndex < 5; fingerIndex++) {
        // Calculate precise nail bed geometry
        let nailBed = calculateNailBed(
          handLandmarks,
          fingerIndex,
          canvas.width,
          canvas.height
        );

        // Apply perspective correction based on hand orientation
        nailBed = applyPerspectiveCorrection(nailBed, handLandmarks);

        // Apply temporal smoothing to reduce jitter
        const fingerKey = `${handedness}_${fingerIndex}`;
        nailBed = nailSmoother.smooth(fingerKey, nailBed);

        // Only draw if confidence is high enough
        if (nailBed.confidence > 0.3) {
          // Draw professional nail with enhanced rendering
          drawNail(
            ctx,
            nailBed.center.x,
            nailBed.center.y,
            nailBed.width,
            nailBed.height,
            settings,
            nailBed.rotation
          );
        }
      }
    }
  } catch (error) {
    // Clear smoother on any error
    nailSmoother.clear();

    // Re-throw detection errors so UI can handle them
    if (error instanceof NoHandsDetectedError) {
      throw error;
    }

    // Log and re-throw other errors
    console.error('Error processing nails:', error);
    throw error;
  }
}

/**
 * Default nail settings
 */
export const defaultNailSettings: NailSettings = {
  color: { r: 236, g: 72, b: 153 }, // Pink default
  opacity: 0.85,
  glossiness: 0.7,
  pattern: 'solid',
};

/**
 * Popular nail color presets
 */
export const NAIL_PRESETS = [
  { name: 'Classic Red', hex: '#DC143C' },
  { name: 'Soft Pink', hex: '#FFB6C1' },
  { name: 'Nude Beige', hex: '#E8D4C1' },
  { name: 'Black Matte', hex: '#000000' },
  { name: 'White French', hex: '#FFFFFF' },
  { name: 'Rose Gold', hex: '#E0BFB8' },
  { name: 'Navy Blue', hex: '#000080' },
  { name: 'Mint Green', hex: '#98FF98' },
  { name: 'Purple', hex: '#8B5CF6' },
  { name: 'Coral', hex: '#FF6B6B' },
];
