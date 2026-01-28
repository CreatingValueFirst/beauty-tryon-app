'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WelcomeCarousel } from '@/components/onboarding/WelcomeCarousel';

const ONBOARDING_COMPLETE_KEY = 'beautytryon_onboarding_complete';

export default function OnboardingPage() {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    // Check if user has already completed onboarding
    const hasCompleted = localStorage.getItem(ONBOARDING_COMPLETE_KEY);
    if (hasCompleted === 'true') {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    router.push('/dashboard');
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    router.push('/dashboard');
  };

  if (!showOnboarding) {
    return null;
  }

  return (
    <WelcomeCarousel
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
}
