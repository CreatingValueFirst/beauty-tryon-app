'use client';

/**
 * Hook for loading ML models with progress tracking
 * Preloads TensorFlow.js and MediaPipe models with status updates
 */

import { useState, useEffect, useCallback } from 'react';

export type ModelStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface ModelLoadingState {
  status: ModelStatus;
  progress: number; // 0-100
  currentModel: string;
  error: string | null;
}

interface UseModelLoaderOptions {
  mode: 'hair' | 'nails' | 'makeup';
  autoLoad?: boolean;
}

const MODEL_LOAD_STEPS = {
  hair: [
    { name: 'MediaPipe WASM', weight: 20 },
    { name: 'Face Landmarker', weight: 30 },
    { name: 'BodyPix (TensorFlow.js)', weight: 50 },
  ],
  nails: [
    { name: 'MediaPipe WASM', weight: 30 },
    { name: 'Hand Landmarker', weight: 70 },
  ],
  makeup: [
    { name: 'MediaPipe WASM', weight: 30 },
    { name: 'Face Landmarker', weight: 70 },
  ],
};

export function useModelLoader({ mode, autoLoad = true }: UseModelLoaderOptions) {
  const [state, setState] = useState<ModelLoadingState>({
    status: 'idle',
    progress: 0,
    currentModel: '',
    error: null,
  });

  const loadModels = useCallback(async () => {
    if (state.status === 'loading' || state.status === 'ready') return;

    setState({
      status: 'loading',
      progress: 0,
      currentModel: 'Initializing...',
      error: null,
    });

    const steps = MODEL_LOAD_STEPS[mode];
    let completedWeight = 0;

    try {
      for (const step of steps) {
        setState((prev) => ({
          ...prev,
          currentModel: step.name,
        }));

        // Import and load models dynamically
        if (step.name === 'MediaPipe WASM') {
          const { initializeMediaPipe } = await import('@/lib/ai/mediapipe');
          await initializeMediaPipe();
        } else if (step.name === 'Face Landmarker') {
          const { createFaceLandmarker } = await import('@/lib/ai/mediapipe');
          await createFaceLandmarker();
        } else if (step.name === 'Hand Landmarker') {
          const { createHandLandmarker } = await import('@/lib/ai/mediapipe');
          await createHandLandmarker();
        } else if (step.name === 'BodyPix (TensorFlow.js)') {
          const { loadBodyPixModel } = await import('@/lib/ai/bodypix-segmentation');
          await loadBodyPixModel();
        }

        completedWeight += step.weight;
        setState((prev) => ({
          ...prev,
          progress: completedWeight,
        }));
      }

      setState({
        status: 'ready',
        progress: 100,
        currentModel: 'All models loaded',
        error: null,
      });
    } catch (error) {
      console.error('Model loading error:', error);
      setState({
        status: 'error',
        progress: completedWeight,
        currentModel: '',
        error: error instanceof Error ? error.message : 'Failed to load ML models',
      });
    }
  }, [mode, state.status]);

  const retry = useCallback(() => {
    setState({
      status: 'idle',
      progress: 0,
      currentModel: '',
      error: null,
    });
  }, []);

  // Auto-load on mount if enabled
  useEffect(() => {
    if (autoLoad && state.status === 'idle') {
      loadModels();
    }
  }, [autoLoad, state.status, loadModels]);

  return {
    ...state,
    loadModels,
    retry,
    isLoading: state.status === 'loading',
    isReady: state.status === 'ready',
    isError: state.status === 'error',
  };
}
