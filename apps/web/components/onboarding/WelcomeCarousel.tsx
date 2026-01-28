'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Camera, Sparkles, Share2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  image?: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: 'welcome',
    title: 'Try Before You Transform',
    description: 'See yourself in stunning hair colors, nail designs & makeup looks using AI-powered AR',
    icon: <Sparkles className="w-16 h-16" />,
    gradient: 'from-purple-600 via-pink-500 to-purple-600',
  },
  {
    id: 'camera',
    title: 'Real-Time AR Magic',
    description: 'Just open your camera and watch styles appear on you instantly. No uploads needed!',
    icon: <Camera className="w-16 h-16" />,
    gradient: 'from-blue-500 via-cyan-500 to-blue-500',
  },
  {
    id: 'share',
    title: 'Share Your Glow Up',
    description: 'Love a look? Share it to TikTok, Instagram, or save to your gallery in one tap',
    icon: <Share2 className="w-16 h-16" />,
    gradient: 'from-pink-500 via-orange-500 to-pink-500',
  },
];

interface WelcomeCarouselProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function WelcomeCarousel({ onComplete, onSkip }: WelcomeCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  }, [currentSlide]);

  const nextSlide = useCallback(() => {
    if (currentSlide < SLIDES.length - 1) {
      setDirection(1);
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  }, [currentSlide, onComplete]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(prev => prev - 1);
    }
  }, [currentSlide]);

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold) {
      nextSlide();
    } else if (info.offset.x > threshold) {
      prevSlide();
    }
  }, [nextSlide, prevSlide]);

  const slide = SLIDES[currentSlide];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Skip button */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          onClick={onSkip}
          className="text-gray-600 hover:text-gray-900"
        >
          Skip
        </Button>
      </div>

      {/* Slide content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={slide.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 flex flex-col items-center justify-center p-8 cursor-grab active:cursor-grabbing"
          >
            {/* Gradient background */}
            <div className={cn(
              'absolute inset-0 opacity-10 bg-gradient-to-br',
              slide.gradient
            )} />

            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className={cn(
                'w-32 h-32 rounded-3xl flex items-center justify-center mb-8',
                'bg-gradient-to-br text-white shadow-xl',
                slide.gradient
              )}
            >
              {slide.icon}
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center max-w-md relative z-10"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {slide.title}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                {slide.description}
              </p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <div className="p-6 pb-safe">
        {/* Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                currentSlide === index
                  ? 'w-8 bg-gradient-to-r from-purple-500 to-pink-500'
                  : 'bg-gray-300 hover:bg-gray-400'
              )}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {currentSlide > 0 && (
            <Button
              variant="outline"
              size="lg"
              onClick={prevSlide}
              className="flex-shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          <Button
            size="lg"
            onClick={nextSlide}
            className={cn(
              'flex-1 font-bold bg-gradient-to-r text-white',
              slide.gradient
            )}
          >
            {currentSlide === SLIDES.length - 1 ? (
              <>
                Get Started
                <Sparkles className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
