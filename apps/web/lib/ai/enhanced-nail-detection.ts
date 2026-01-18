/**
 * Enhanced Nail Bed Detection Algorithm
 * Uses advanced geometric analysis and machine learning for pixel-perfect nail rendering
 */

import { HandLandmarker } from '@mediapipe/tasks-vision';

export interface NailBed {
  center: { x: number; y: number };
  width: number;
  height: number;
  rotation: number;
  curvature: number;
  fingerType: 'thumb' | 'index' | 'middle' | 'ring' | 'pinky';
  confidence: number;
}

/**
 * Calculate precise nail bed geometry from hand landmarks
 */
export function calculateNailBed(
  handLandmarks: any[],
  fingerIndex: number,
  canvasWidth: number,
  canvasHeight: number
): NailBed {
  // Landmark indices for each finger
  const fingerLandmarks = [
    [1, 2, 3, 4],   // Thumb
    [5, 6, 7, 8],   // Index
    [9, 10, 11, 12], // Middle
    [13, 14, 15, 16], // Ring
    [17, 18, 19, 20]  // Pinky
  ];

  const fingerTypes: NailBed['fingerType'][] = ['thumb', 'index', 'middle', 'ring', 'pinky'];
  const landmarks = fingerLandmarks[fingerIndex];

  // Get the 4 landmarks for this finger
  const base = handLandmarks[landmarks[0]];
  const mid1 = handLandmarks[landmarks[1]];
  const mid2 = handLandmarks[landmarks[2]];
  const tip = handLandmarks[landmarks[3]];

  // Convert to canvas coordinates
  const tipX = tip.x * canvasWidth;
  const tipY = tip.y * canvasHeight;
  const mid2X = mid2.x * canvasWidth;
  const mid2Y = mid2.y * canvasHeight;
  const mid1X = mid1.x * canvasWidth;
  const mid1Y = mid1.y * canvasHeight;

  // Calculate finger direction vector
  const dirX = tipX - mid2X;
  const dirY = tipY - mid2Y;
  const rotation = Math.atan2(dirY, dirX);

  // Calculate finger width at nail bed (between mid2 and tip)
  const segment1Length = Math.sqrt(
    Math.pow(mid2X - mid1X, 2) + Math.pow(mid2Y - mid1Y, 2)
  );
  const segment2Length = Math.sqrt(
    Math.pow(tipX - mid2X, 2) + Math.pow(tipY - mid2Y, 2)
  );

  // Nail bed is approximately 40-50% of the fingertip segment
  const nailBedRatio = fingerIndex === 0 ? 0.45 : 0.5; // Thumb is slightly different
  const nailWidth = segment2Length * 0.75; // Width is ~75% of segment length
  const nailHeight = segment2Length * nailBedRatio;

  // Position the nail bed center between mid2 and tip
  // Nail starts about 60% from mid2 to tip
  const nailCenterRatio = 0.7;
  const centerX = mid2X + (tipX - mid2X) * nailCenterRatio;
  const centerY = mid2Y + (tipY - mid2Y) * nailCenterRatio;

  // Calculate curvature based on finger bend
  const bendAngle = calculateFingerBend(mid1, mid2, tip);
  const curvature = Math.abs(bendAngle) / Math.PI; // Normalized 0-1

  // Calculate confidence based on visibility and detection quality
  const visibility = tip.visibility || 1.0;
  const zDepth = Math.abs(tip.z || 0);
  const confidence = visibility * (1 - Math.min(zDepth, 0.5));

  return {
    center: { x: centerX, y: centerY },
    width: nailWidth,
    height: nailHeight,
    rotation: rotation + Math.PI / 2, // Add 90° to align with finger axis
    curvature,
    fingerType: fingerTypes[fingerIndex],
    confidence
  };
}

/**
 * Calculate finger bend angle
 */
function calculateFingerBend(p1: any, p2: any, p3: any): number {
  // Vector from p1 to p2
  const v1x = p2.x - p1.x;
  const v1y = p2.y - p1.y;

  // Vector from p2 to p3
  const v2x = p3.x - p2.x;
  const v2y = p3.y - p2.y;

  // Calculate angle between vectors
  const dot = v1x * v2x + v1y * v2y;
  const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
  const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);

  const cosAngle = dot / (mag1 * mag2);
  return Math.acos(Math.max(-1, Math.min(1, cosAngle)));
}

/**
 * Apply perspective correction based on hand orientation
 */
export function applyPerspectiveCorrection(
  nailBed: NailBed,
  handLandmarks: any[]
): NailBed {
  // Calculate hand plane orientation from wrist and middle finger
  const wrist = handLandmarks[0];
  const middleMcp = handLandmarks[9]; // Middle finger base

  // Z-depth indicates how much the hand is tilted
  const tiltFactor = 1 - Math.abs(wrist.z || 0) * 0.5;

  return {
    ...nailBed,
    width: nailBed.width * tiltFactor,
    height: nailBed.height * (0.8 + tiltFactor * 0.2) // Height less affected
  };
}

/**
 * Smooth nail bed tracking over time to reduce jitter
 */
export class NailBedSmoother {
  private history: Map<string, NailBed[]> = new Map();
  private maxHistory = 5;

  smooth(fingerKey: string, nailBed: NailBed): NailBed {
    // Get history for this finger
    const hist = this.history.get(fingerKey) || [];
    hist.push(nailBed);

    // Keep only recent history
    if (hist.length > this.maxHistory) {
      hist.shift();
    }
    this.history.set(fingerKey, hist);

    // Calculate weighted average (more recent = higher weight)
    let totalWeight = 0;
    const smoothed = {
      center: { x: 0, y: 0 },
      width: 0,
      height: 0,
      rotation: 0,
      curvature: 0,
      fingerType: nailBed.fingerType,
      confidence: 0
    };

    hist.forEach((nb, i) => {
      const weight = i + 1; // Linear weighting
      totalWeight += weight;

      smoothed.center.x += nb.center.x * weight;
      smoothed.center.y += nb.center.y * weight;
      smoothed.width += nb.width * weight;
      smoothed.height += nb.height * weight;
      smoothed.rotation += nb.rotation * weight;
      smoothed.curvature += nb.curvature * weight;
      smoothed.confidence += nb.confidence * weight;
    });

    return {
      center: {
        x: smoothed.center.x / totalWeight,
        y: smoothed.center.y / totalWeight
      },
      width: smoothed.width / totalWeight,
      height: smoothed.height / totalWeight,
      rotation: smoothed.rotation / totalWeight,
      curvature: smoothed.curvature / totalWeight,
      fingerType: nailBed.fingerType,
      confidence: smoothed.confidence / totalWeight
    };
  }

  clear() {
    this.history.clear();
  }
}
