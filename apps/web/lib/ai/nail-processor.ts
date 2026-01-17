/**
 * Nail Processing Engine
 * Applies nail polish colors using MediaPipe hand tracking
 */

import { detectHands } from './mediapipe';

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
 * Draw a nail on canvas at specific landmark position
 */
function drawNail(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  settings: NailSettings
) {
  ctx.save();

  // Create nail shape (rounded rectangle)
  const radius = width * 0.4;
  ctx.beginPath();
  ctx.moveTo(x - width / 2 + radius, y - height / 2);
  ctx.lineTo(x + width / 2 - radius, y - height / 2);
  ctx.quadraticCurveTo(x + width / 2, y - height / 2, x + width / 2, y - height / 2 + radius);
  ctx.lineTo(x + width / 2, y + height / 2 - radius);
  ctx.quadraticCurveTo(x + width / 2, y + height / 2, x + width / 2 - radius, y + height / 2);
  ctx.lineTo(x - width / 2 + radius, y + height / 2);
  ctx.quadraticCurveTo(x - width / 2, y + height / 2, x - width / 2, y + height / 2 - radius);
  ctx.lineTo(x - width / 2, y - height / 2 + radius);
  ctx.quadraticCurveTo(x - width / 2, y - height / 2, x - width / 2 + radius, y - height / 2);
  ctx.closePath();

  // Base color
  const { r, g, b } = settings.color;
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${settings.opacity})`;
  ctx.fill();

  // Add glossiness effect
  if (settings.glossiness > 0) {
    const gradient = ctx.createLinearGradient(x - width / 2, y - height / 2, x + width / 2, y + height / 2);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${settings.glossiness * 0.4})`);
    gradient.addColorStop(0.5, `rgba(255, 255, 255, 0)`);
    gradient.addColorStop(1, `rgba(0, 0, 0, ${settings.glossiness * 0.2})`);
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  // Pattern overlays
  if (settings.pattern === 'french') {
    // French manicure tip
    ctx.beginPath();
    ctx.arc(x, y - height / 3, width * 0.6, 0, Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();
  } else if (settings.pattern === 'glitter') {
    // Glitter effect
    for (let i = 0; i < 10; i++) {
      const gx = x + (Math.random() - 0.5) * width * 0.8;
      const gy = y + (Math.random() - 0.5) * height * 0.8;
      const size = Math.random() * 2 + 1;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(gx, gy, size, size);
    }
  } else if (settings.pattern === 'ombre') {
    // Ombre gradient
    const ombre = ctx.createLinearGradient(x, y - height / 2, x, y + height / 2);
    ombre.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${settings.opacity})`);
    ombre.addColorStop(1, `rgba(255, 255, 255, ${settings.opacity * 0.3})`);
    ctx.fillStyle = ombre;
    ctx.fill();
  }

  // Subtle border for definition
  ctx.strokeStyle = `rgba(0, 0, 0, 0.2)`;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

/**
 * Process nail overlay on video frame
 */
export async function processNails(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  settings: NailSettings,
  timestamp: number
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  try {
    // Detect hands
    const handResults = await detectHands(video, timestamp);

    if (!handResults || !handResults.landmarks || handResults.landmarks.length === 0) {
      return;
    }

    // Process each detected hand
    for (const handLandmarks of handResults.landmarks) {
      // Draw nails on each fingertip
      for (const tipIndex of FINGER_TIP_INDICES) {
        const landmark = handLandmarks[tipIndex];

        // Convert normalized coordinates to canvas coordinates
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;

        // Estimate nail size based on hand size and depth
        // Larger z value means closer to camera
        const baseSize = 20;
        const depthFactor = 1 + (landmark.z || 0) * 0.5;
        const nailWidth = baseSize * depthFactor;
        const nailHeight = nailWidth * 1.4; // Nails are typically longer than wide

        // Draw the nail
        drawNail(ctx, x, y, nailWidth, nailHeight, settings);
      }
    }
  } catch (error) {
    console.error('Error processing nails:', error);
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
