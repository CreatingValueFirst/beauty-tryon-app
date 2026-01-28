'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { ARCamera, ARCameraHandle } from './ARCamera';
import {
  X, Heart, Share2, Camera, ChevronUp, ChevronDown,
  Sparkles, Palette, Settings2, Download, RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface StyleOption {
  id: string;
  name: string;
  color?: string;
  thumbnail?: string;
}

interface ImmersiveARCameraProps {
  mode: 'hair' | 'nails' | 'makeup';
  styles: StyleOption[];
  colors: string[];
  currentStyleIndex: number;
  currentColorIndex: number;
  onStyleChange: (index: number) => void;
  onColorChange: (index: number) => void;
  onClose: () => void;
  onCapture: (blob: Blob) => void;
  onShare?: () => void;
  onFavorite?: () => void;
  onFrame?: (video: HTMLVideoElement, canvas: HTMLCanvasElement) => void;
  modelLoadingStatus?: {
    status: 'idle' | 'loading' | 'ready' | 'error';
    progress: number;
    currentModel: string;
    error: string | null;
  };
}

export function ImmersiveARCamera({
  mode,
  styles,
  colors,
  currentStyleIndex,
  currentColorIndex,
  onStyleChange,
  onColorChange,
  onClose,
  onCapture,
  onShare,
  onFavorite,
  onFrame,
  modelLoadingStatus,
}: ImmersiveARCameraProps) {
  const cameraRef = useRef<ARCameraHandle>(null);
  const [showControls, setShowControls] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showStyleRail, setShowStyleRail] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [doubleTapTimer, setDoubleTapTimer] = useState<NodeJS.Timeout | null>(null);

  // Gesture motion values
  const y = useMotionValue(0);
  const x = useMotionValue(0);

  // Transform for style indicator
  const styleIndicatorOpacity = useTransform(y, [-50, 0, 50], [1, 0.3, 1]);

  // Handle vertical swipe for style change
  const handleVerticalDragEnd = useCallback((_: any, info: PanInfo) => {
    const threshold = 50;

    if (info.offset.y < -threshold && currentStyleIndex < styles.length - 1) {
      // Swipe up - next style
      onStyleChange(currentStyleIndex + 1);
      hapticFeedback();
    } else if (info.offset.y > threshold && currentStyleIndex > 0) {
      // Swipe down - previous style
      onStyleChange(currentStyleIndex - 1);
      hapticFeedback();
    }
  }, [currentStyleIndex, styles.length, onStyleChange]);

  // Handle horizontal swipe for color change
  const handleHorizontalDragEnd = useCallback((_: any, info: PanInfo) => {
    const threshold = 50;

    if (info.offset.x < -threshold && currentColorIndex < colors.length - 1) {
      // Swipe left - next color
      onColorChange(currentColorIndex + 1);
      hapticFeedback();
    } else if (info.offset.x > threshold && currentColorIndex > 0) {
      // Swipe right - previous color
      onColorChange(currentColorIndex - 1);
      hapticFeedback();
    }
  }, [currentColorIndex, colors.length, onColorChange]);

  // Haptic feedback
  const hapticFeedback = (intensity: number = 10) => {
    if (navigator.vibrate) {
      navigator.vibrate(intensity);
    }
  };

  // Handle tap to toggle controls
  const handleTap = useCallback(() => {
    if (doubleTapTimer) {
      // Double tap - favorite
      clearTimeout(doubleTapTimer);
      setDoubleTapTimer(null);
      handleDoubleTap();
    } else {
      // Single tap - wait to see if double tap
      const timer = setTimeout(() => {
        setShowControls(prev => !prev);
        setDoubleTapTimer(null);
      }, 250);
      setDoubleTapTimer(timer);
    }
  }, [doubleTapTimer]);

  // Handle double tap to favorite
  const handleDoubleTap = useCallback(() => {
    setIsFavorited(true);
    hapticFeedback(20);
    onFavorite?.();

    // Show heart animation
    setTimeout(() => setIsFavorited(false), 1000);
  }, [onFavorite]);

  // Handle long press to record
  const handleLongPressStart = useCallback(() => {
    setIsRecording(true);
    hapticFeedback(30);
  }, []);

  const handleLongPressEnd = useCallback(() => {
    setIsRecording(false);
  }, []);

  // Capture photo
  const handleCapture = useCallback(async () => {
    if (!cameraRef.current?.isReady()) return;

    hapticFeedback(15);
    const blob = await cameraRef.current.capturePhoto();
    if (blob) {
      onCapture(blob);
    }
  }, [onCapture]);

  // Cleanup double tap timer
  useEffect(() => {
    return () => {
      if (doubleTapTimer) {
        clearTimeout(doubleTapTimer);
      }
    };
  }, [doubleTapTimer]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="immersive-fullscreen"
    >
      {/* Main gesture area */}
      <motion.div
        className="absolute inset-0"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleVerticalDragEnd}
        style={{ y }}
        onClick={handleTap}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleHorizontalDragEnd}
          style={{ x }}
          className="w-full h-full"
        >
          {/* AR Camera */}
          <ARCamera
            ref={cameraRef}
            mode={mode}
            onFrame={onFrame}
            className="w-full h-full"
            modelLoadingStatus={modelLoadingStatus}
          />
        </motion.div>
      </motion.div>

      {/* Double tap heart animation */}
      <AnimatePresence>
        {isFavorited && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <Heart className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-lg" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              <span className="text-sm font-medium">Recording</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 z-40 pt-safe"
          >
            <div className="flex items-center justify-between p-4">
              {/* Close button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>

              {/* Mode indicator */}
              <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-white text-sm font-medium">
                  {mode === 'hair' ? 'Hair' : mode === 'nails' ? 'Nails' : 'Makeup'} Try-On
                </span>
              </div>

              {/* Settings */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowStyleRail(!showStyleRail)}
                className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
              >
                <Settings2 className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Style indicator (center) */}
      <motion.div
        style={{ opacity: styleIndicatorOpacity }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
      >
        <div className="flex flex-col items-center gap-2">
          <ChevronUp className="w-6 h-6 text-white/50 animate-bounce" />
          <div className="bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
            <span className="text-white text-sm">
              {styles[currentStyleIndex]?.name || 'Style'}
            </span>
          </div>
          <ChevronDown className="w-6 h-6 text-white/50 animate-bounce" />
        </div>
      </motion.div>

      {/* Right side actions */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-4"
          >
            {/* Favorite */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setIsFavorited(true);
                hapticFeedback(20);
                onFavorite?.();
                setTimeout(() => setIsFavorited(false), 1000);
              }}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <Heart className={cn(
                  "w-6 h-6 transition-colors",
                  isFavorited ? "text-red-500 fill-red-500" : "text-white"
                )} />
              </div>
              <span className="text-white text-xs">Like</span>
            </motion.button>

            {/* Share */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onShare}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xs">Share</span>
            </motion.button>

            {/* Color picker */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowStyleRail(!showStyleRail)}
              className="flex flex-col items-center gap-1"
            >
              <div
                className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center"
                style={{ backgroundColor: colors[currentColorIndex] || '#8B5CF6' }}
              >
                <Palette className="w-5 h-5 text-white drop-shadow-md" />
              </div>
              <span className="text-white text-xs">Color</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 z-40 pb-safe"
          >
            <div className="flex items-center justify-center gap-8 p-6">
              {/* Download */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <Download className="w-5 h-5 text-white" />
              </motion.button>

              {/* Capture button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onTouchStart={handleLongPressStart}
                onTouchEnd={handleLongPressEnd}
                onMouseDown={handleLongPressStart}
                onMouseUp={handleLongPressEnd}
                onClick={handleCapture}
                className="relative"
              >
                {/* Outer ring */}
                <div className={cn(
                  "w-20 h-20 rounded-full border-4 border-white flex items-center justify-center",
                  isRecording && "border-red-500"
                )}>
                  {/* Inner button */}
                  <div className={cn(
                    "w-16 h-16 rounded-full bg-white transition-all",
                    isRecording && "bg-red-500 scale-75 rounded-lg"
                  )} />
                </div>

                {/* Recording progress ring */}
                {isRecording && (
                  <svg className="absolute inset-0 w-20 h-20 -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="38"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="4"
                      strokeDasharray="239"
                      strokeDashoffset="0"
                      className="animate-[recording-progress_15s_linear]"
                    />
                  </svg>
                )}
              </motion.button>

              {/* Flip camera */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <RotateCcw className="w-5 h-5 text-white" />
              </motion.button>
            </div>

            {/* Swipe hint */}
            <div className="text-center pb-4">
              <p className="text-white/60 text-xs">
                Swipe up/down for styles, left/right for colors
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Style rail (side panel) */}
      <AnimatePresence>
        {showStyleRail && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="absolute right-0 top-0 bottom-0 w-24 bg-black/80 backdrop-blur-xl z-50 pt-safe pb-safe"
          >
            <div className="flex flex-col h-full">
              <div className="p-3 border-b border-white/10">
                <button
                  onClick={() => setShowStyleRail(false)}
                  className="text-white/60 text-xs"
                >
                  Close
                </button>
              </div>

              {/* Styles list */}
              <div className="flex-1 overflow-y-auto py-2">
                <p className="text-white/40 text-[10px] px-2 mb-2">STYLES</p>
                {styles.map((style, index) => (
                  <motion.button
                    key={style.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      onStyleChange(index);
                      hapticFeedback();
                    }}
                    className={cn(
                      "w-full p-2 flex flex-col items-center gap-1 transition-colors",
                      currentStyleIndex === index && "bg-white/20"
                    )}
                  >
                    {style.thumbnail ? (
                      <img
                        src={style.thumbnail}
                        alt={style.name}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                    ) : (
                      <div
                        className="w-14 h-14 rounded-lg"
                        style={{ backgroundColor: style.color || '#8B5CF6' }}
                      />
                    )}
                    <span className="text-white text-[10px] truncate w-full text-center">
                      {style.name}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Colors list */}
              <div className="border-t border-white/10 py-2">
                <p className="text-white/40 text-[10px] px-2 mb-2">COLORS</p>
                <div className="flex flex-wrap gap-1 px-2">
                  {colors.map((color, index) => (
                    <motion.button
                      key={color}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        onColorChange(index);
                        hapticFeedback();
                      }}
                      className={cn(
                        "w-8 h-8 rounded-full transition-all",
                        currentColorIndex === index && "ring-2 ring-white ring-offset-2 ring-offset-black"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
