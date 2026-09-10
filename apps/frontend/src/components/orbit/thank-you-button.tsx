'use client';

import { useEffect, useState } from 'react';

import { AnimatedSplashButton } from '@/components/ui/animated-splash-button';

export function ThankYouButton({ onComplete }: { onComplete: () => void }) {
  const [isGreen, setIsGreen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsGreen(true), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-14 w-full justify-center">
      <AnimatedSplashButton label={isGreen ? 'Back to menu' : 'Done'} colorScheme={isGreen ? 'green' : 'blue'} onComplete={onComplete} />
    </div>
  );
}
