'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { DeleteIconButton } from '@/components/ui/delete-icon-button';
import { cn } from '@/lib/utils';

export interface ImageChoice {
  src: string;
  alt: string;
  value: string;
  label?: string;
}

interface ImageChoiceCardProps {
  images: ImageChoice[];
  selected?: string;
  uploadedImage?: string | null;
  onRemoveUploadedImage?: () => void;
  onSelect: (value: string) => void;
  className?: string;
}

export function ImageChoiceCard({ images, selected, uploadedImage, onRemoveUploadedImage, onSelect, className }: ImageChoiceCardProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  return (
    <div className={cn('group relative h-52 w-full', className)}>
      <div className="absolute inset-0 origin-center -rotate-90">
        {images.map((image, index) => {
          const showUploadedImage = selected === image.value && Boolean(uploadedImage);
          return (
          <motion.div
            key={image.value}
            role="button"
            tabIndex={0}
            aria-label={image.alt}
            onClick={() => onSelect(image.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(image.value);
              }
            }}
            className={cn(
              'absolute left-0 top-4 h-44 translate-x-[var(--initial)] cursor-pointer select-none overflow-hidden rounded-xl border-2 border-white bg-white shadow-md transition-all duration-300 ease-in-out',
              'group-hover:translate-x-[var(--tx)] group-hover:rotate-[var(--r)] group-focus-within:translate-x-[var(--tx)] group-focus-within:rotate-[var(--r)]',
              uploadedImage && 'translate-x-[var(--tx)] rotate-[var(--r)]',
              index === 0 ? 'w-[44%]' : 'w-[48%]',
              selected === image.value && 'ring-2 ring-[#1769ff] ring-offset-2'
            )}
            style={{
              ['--initial' as string]: `${index * 32}px`,
              ['--tx' as string]: `${index * 78}px`,
              ['--r' as string]: `${index * 5 - 5}deg`,
              zIndex: images.length - index,
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {showUploadedImage ? (
                <motion.span key={uploadedImage} initial={{ opacity: 0, scale: 0.72 }} animate={isDeleting ? { opacity: 0, scale: 0.45, rotate: 8 } : { opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.28, ease: 'easeInOut' }} className="absolute inset-0">
                  <img src={uploadedImage ?? ''} alt={`Uploaded ${image.label ?? image.alt}`} className={cn('absolute left-1/2 top-1/2 w-[176px] -translate-x-1/2 -translate-y-1/2 rotate-90 object-contain', index === 0 ? 'h-[123px]' : 'h-[134px]')} />
                </motion.span>
              ) : (
                <motion.img key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={image.src} alt={image.alt} className="h-full w-full object-cover" />
              )}
            </AnimatePresence>
            {showUploadedImage ? (
              <span className="absolute right-2 top-2 z-20 rotate-90">
                <motion.span className="block origin-center" animate={isDeleting ? { opacity: 0, scale: 0, rotate: 90 } : { opacity: 1, scale: 0.75, rotate: 0 }} transition={{ duration: 0.25 }}>
                  <DeleteIconButton label={`Remove ${image.label ?? image.alt} image`} onClick={() => {
                    if (isDeleting) return;
                    setIsDeleting(true);
                    window.setTimeout(() => {
                      onRemoveUploadedImage?.();
                      setIsDeleting(false);
                    }, 280);
                  }} />
                </motion.span>
              </span>
            ) : null}
          </motion.div>
        )})}
      </div>
      {images.map((image, index) => (
        <span
          key={`${image.value}-label`}
          className={cn('pointer-events-none absolute -left-[63px] w-[92px] -translate-x-2 whitespace-nowrap text-right text-[13px] font-bold text-slate-700 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100', uploadedImage && 'translate-x-0 opacity-100')}
          style={{ top: `${[196, 88, 0][index] ?? 0}px`, left: index === 0 ? '-68px' : index === 1 ? '-78px' : undefined }}
        >
          {image.label ?? image.alt}
        </span>
      ))}
    </div>
  );
}
