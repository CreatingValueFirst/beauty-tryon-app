/**
 * MediaPipe Integration for Face, Hair, and Hand Detection
 * Uses @mediapipe/tasks-vision for real-time AR capabilities
 */

import {
  FaceDetector,
  FaceLandmarker,
  FilesetResolver,
  HandLandmarker,
  ImageSegmenter,
} from '@mediapipe/tasks-vision';

// Singleton instances
let faceDetectorInstance: FaceDetector | null = null;
let faceLandmarkerInstance: FaceLandmarker | null = null;
let handLandmarkerInstance: HandLandmarker | null = null;
let hairSegmenterInstance: ImageSegmenter | null = null;

/**
 * Initialize MediaPipe wasm runtime
 */
export async function initializeMediaPipe() {
  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );
    return vision;
  } catch (error) {
    console.error('Failed to initialize MediaPipe:', error);
    throw error;
  }
}

/**
 * Create Face Detector for basic face detection
 */
export async function createFaceDetector() {
  if (faceDetectorInstance) return faceDetectorInstance;

  try {
    const vision = await initializeMediaPipe();
    faceDetectorInstance = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
    });
    return faceDetectorInstance;
  } catch (error) {
    console.error('Failed to create face detector:', error);
    throw error;
  }
}

/**
 * Create Face Landmarker for detailed face mesh (468 landmarks)
 */
export async function createFaceLandmarker() {
  if (faceLandmarkerInstance) return faceLandmarkerInstance;

  try {
    const vision = await initializeMediaPipe();
    faceLandmarkerInstance = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numFaces: 1,
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
    });
    return faceLandmarkerInstance;
  } catch (error) {
    console.error('Failed to create face landmarker:', error);
    throw error;
  }
}

/**
 * Create Hand Landmarker for nail try-on (21 landmarks per hand)
 */
export async function createHandLandmarker() {
  if (handLandmarkerInstance) return handLandmarkerInstance;

  try {
    const vision = await initializeMediaPipe();
    handLandmarkerInstance = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numHands: 2,
    });
    return handLandmarkerInstance;
  } catch (error) {
    console.error('Failed to create hand landmarker:', error);
    throw error;
  }
}

/**
 * Create Image Segmenter for hair segmentation
 */
export async function createHairSegmenter() {
  if (hairSegmenterInstance) return hairSegmenterInstance;

  try {
    const vision = await initializeMediaPipe();
    hairSegmenterInstance = await ImageSegmenter.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float16/latest/selfie_multiclass_256x256.tflite',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      outputCategoryMask: true,
      outputConfidenceMasks: false,
    });
    return hairSegmenterInstance;
  } catch (error) {
    console.error('Failed to create hair segmenter:', error);
    // Fallback: return null and use simpler color overlay
    return null;
  }
}

/**
 * Detect faces in video frame
 */
export async function detectFaces(video: HTMLVideoElement, timestamp: number) {
  const detector = await createFaceDetector();
  return detector.detectForVideo(video, timestamp);
}

/**
 * Get face landmarks in video frame
 */
export async function getFaceLandmarks(video: HTMLVideoElement, timestamp: number) {
  const landmarker = await createFaceLandmarker();
  return landmarker.detectForVideo(video, timestamp);
}

/**
 * Detect hands in video frame
 */
export async function detectHands(video: HTMLVideoElement, timestamp: number) {
  const landmarker = await createHandLandmarker();
  return landmarker.detectForVideo(video, timestamp);
}

/**
 * Segment hair from image
 */
export async function segmentHair(video: HTMLVideoElement, timestamp: number) {
  const segmenter = await createHairSegmenter();
  if (!segmenter) return null;
  return segmenter.segmentForVideo(video, timestamp);
}

/**
 * Extract hair region mask from segmentation result
 * Returns ImageData with hair pixels
 */
export function extractHairMask(
  segmentationResult: any,
  width: number,
  height: number
): ImageData | null {
  if (!segmentationResult || !segmentationResult.categoryMask) return null;

  const mask = segmentationResult.categoryMask;
  const imageData = new ImageData(width, height);

  // Category 1 is hair in the selfie_multiclass model
  // 0: background, 1: hair, 2: body-skin, 3: face-skin, 4: clothes, 5: others
  for (let i = 0; i < mask.width * mask.height; i++) {
    const category = mask.getAsFloat32Array()[i];
    const isHair = Math.round(category) === 1;

    imageData.data[i * 4] = isHair ? 255 : 0; // R
    imageData.data[i * 4 + 1] = isHair ? 255 : 0; // G
    imageData.data[i * 4 + 2] = isHair ? 255 : 0; // B
    imageData.data[i * 4 + 3] = isHair ? 255 : 0; // A
  }

  return imageData;
}

/**
 * Cleanup resources
 */
export function cleanup() {
  faceDetectorInstance?.close();
  faceLandmarkerInstance?.close();
  handLandmarkerInstance?.close();
  hairSegmenterInstance?.close();

  faceDetectorInstance = null;
  faceLandmarkerInstance = null;
  handLandmarkerInstance = null;
  hairSegmenterInstance = null;
}
