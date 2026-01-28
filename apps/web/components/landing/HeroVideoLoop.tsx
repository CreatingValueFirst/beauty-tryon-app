'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Volume2, VolumeX } from 'lucide-react';

interface HeroVideoLoopProps {
  className?: string;
}

// Placeholder video URLs - replace with real AR try-on demo videos
const DEMO_VIDEOS = [
  '/videos/demo-hair.mp4',
  '/videos/demo-nails.mp4',
  '/videos/demo-makeup.mp4',
];

export function HeroVideoLoop({ className }: HeroVideoLoopProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentVideo, setCurrentVideo] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      setCurrentVideo((prev) => (prev + 1) % DEMO_VIDEOS.length);
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Video Background */}
      <div className="absolute inset-0">
        {/* Fallback gradient for when video isn't available */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-purple-800" />

        {/* Video element - commented out until real videos are available */}
        {/*
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted={isMuted}
          playsInline
          loop
          onLoadedData={() => setIsLoaded(true)}
        >
          <source src={DEMO_VIDEOS[currentVideo]} type="video/mp4" />
        </video>
        */}

        {/* Animated gradient overlay for visual interest */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'linear-gradient(45deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))',
              'linear-gradient(90deg, rgba(236, 72, 153, 0.3), rgba(139, 92, 246, 0.3))',
              'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))',
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />

        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Floating beauty elements animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: Math.random() * 100 + '%',
              y: '100%',
              scale: 0.5 + Math.random() * 0.5,
              opacity: 0.3 + Math.random() * 0.4,
            }}
            animate={{
              y: '-20%',
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: i * 2,
              ease: 'linear',
            }}
          >
            <span className="text-4xl md:text-6xl filter blur-[1px]">
              {['💄', '💅', '💇‍♀️', '✨', '💜', '🌸'][i % 6]}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Mute toggle button */}
      {false && ( // Hidden until real video is added
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={toggleMute}
          className="absolute bottom-4 right-4 z-20 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-white" />
          ) : (
            <Volume2 className="w-5 h-5 text-white" />
          )}
        </motion.button>
      )}
    </div>
  );
}
