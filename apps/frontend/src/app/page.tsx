'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const typewriterWords = ['Altira Orbit', 'excellence', 'precision', 'affordability'];

export default function Home() {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState(typewriterWords[0]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = typewriterWords[wordIndex];
    const isFullWord = displayText === currentWord;
    const isEmpty = displayText === '';

    const timeout = window.setTimeout(
      () => {
        if (!isDeleting && isFullWord) {
          setIsDeleting(true);
          return;
        }

        if (isDeleting && isEmpty) {
          setIsDeleting(false);
          setWordIndex((index) => (index + 1) % typewriterWords.length);
          return;
        }

        setDisplayText((text) =>
          isDeleting
            ? currentWord.slice(0, Math.max(text.length - 1, 0))
            : currentWord.slice(0, text.length + 1)
        );
      },
      isFullWord && !isDeleting ? 1500 : isDeleting ? 55 : 85
    );

    return () => window.clearTimeout(timeout);
  }, [displayText, isDeleting, wordIndex]);

  return (
    <main className="min-h-screen">
      <section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'linear-gradient(rgba(248, 250, 252, 0.68), rgba(248, 250, 252, 0.78)), url(/bg.png)',
        }}
      >
        <nav className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <img src="/logo1.png" alt="Altira Group" className="h-12 w-auto" />
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button className="bg-[#081b66] hover:bg-[#122985] text-white">Log-in</Button>
              </Link>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 text-center" style={{ paddingTop: '170px' }}>
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-semibold text-[#06164f] mb-6">
              Welcome to{' '}
              <span className="inline-block min-w-[10ch] text-left text-[#7c5cff]">
                {displayText}
                <span className="ml-1 inline-block h-[0.9em] w-[3px] translate-y-[0.1em] animate-pulse bg-[#7c5cff]" />
              </span>
            </h1>
            <p className="mx-auto inline-flex items-center rounded-md border border-white/70 bg-white/55 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#081b66] shadow-sm backdrop-blur-md">
              With you, at every turn.
            </p>

          </div>
        </div>
      </section>

      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-sm text-gray-600">&copy; 2026 Altira Orbit. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
