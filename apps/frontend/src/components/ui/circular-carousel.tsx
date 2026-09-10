'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface CarouselItem {
  id: string;
  title: string;
  description: string;
  image?: string;
}

interface CircularCarouselProps {
  items: CarouselItem[];
  activeIndex?: number;
  onActiveChange?: (index: number) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

const visibleCount = 3;

function positionFor(index: number, activeIndex: number, total: number) {
  let offset = index - activeIndex;
  const half = Math.floor(visibleCount / 2);
  if (offset > half) offset -= total;
  if (offset < -half) offset += total;
  if (Math.abs(offset) > half) return null;

  const distance = Math.abs(offset);
  const angle = (offset / visibleCount) * Math.PI;
  return {
    x: Math.sin(angle) * 126,
    y: distance ? 23 : 0,
    scale: distance ? 0.68 : 1,
    opacity: distance ? 0.28 : 1,
    zIndex: visibleCount - distance,
  };
}

export function CircularCarousel({
  items,
  activeIndex: controlledIndex,
  onActiveChange,
  autoPlay = false,
  autoPlayInterval = 4000,
  className,
}: CircularCarouselProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const activeIndex = controlledIndex ?? internalIndex;
  const total = items.length;

  const goTo = useCallback((index: number) => {
    if (!total) return;
    const next = ((index % total) + total) % total;
    if (controlledIndex === undefined) setInternalIndex(next);
    onActiveChange?.(next);
  }, [controlledIndex, onActiveChange, total]);

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const previous = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (!autoPlay || paused || total < 2) return;
    intervalRef.current = window.setInterval(next, autoPlayInterval);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [autoPlay, autoPlayInterval, next, paused, total]);

  if (!total) return null;

  return (
    <div className={cn('relative flex flex-col items-center outline-none', className)} role="region" aria-label="Your insured items" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="relative h-[238px] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-blue-50/70 to-transparent">
        <AnimatePresence initial={false}>
          {items.map((item, index) => {
            const position = positionFor(index, activeIndex, total);
            if (!position) return null;
            const active = index === activeIndex;
            return (
              <motion.button
                key={item.id}
                type="button"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={position}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => goTo(index)}
                aria-label={`Show ${item.title}`}
                aria-current={active}
                className={cn('absolute left-1/2 top-1/2 flex h-[194px] w-[156px] flex-col overflow-hidden rounded-2xl border bg-white p-0 text-left', active ? 'border-[#1769ff] shadow-[0_18px_38px_-14px_rgba(23,105,255,0.48)]' : 'border-blue-100 shadow-sm')}
                style={{ marginLeft: -78, marginTop: -97 }}
              >
                <div className="h-[146px] w-full bg-slate-50"><img src={item.image} alt="" className="h-full w-full object-cover object-top" /></div>
                <div className="px-2.5 pt-2">
                  <p className="truncate text-[11px] font-extrabold text-slate-900">{item.title}</p>
                  {active ? <p className="mt-0.5 text-[8px] font-medium text-[#1769ff]">Included in your cover</p> : null}
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
      <div className="mt-1 flex items-center gap-3">
        <button type="button" onClick={previous} aria-label="Previous item" className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-[#1769ff] hover:bg-blue-100"><ChevronLeft className="h-4 w-4" /></button>
        <div className="flex items-center gap-1.5" role="tablist">
          {items.map((item, index) => <button key={item.id} type="button" role="tab" aria-selected={index === activeIndex} aria-label={`Show ${item.title}`} onClick={() => goTo(index)} className={cn('h-1.5 rounded-full transition-all', index === activeIndex ? 'w-5 bg-[#1769ff]' : 'w-1.5 bg-blue-200')} />)}
        </div>
        <button type="button" onClick={next} aria-label="Next item" className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-[#1769ff] hover:bg-blue-100"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

export default CircularCarousel;
