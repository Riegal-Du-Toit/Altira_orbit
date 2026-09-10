'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { DeleteIconButton } from '@/components/ui/delete-icon-button';

const cardVariants = cva(
  'group relative flex w-full cursor-pointer select-none caret-transparent flex-col justify-between overflow-hidden rounded-xl p-4 text-left shadow-sm transition-shadow duration-300 ease-in-out hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769ff] focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        car: 'bg-[#1769ff] text-white',
        home: 'bg-[#94DCF1] text-white',
        both: 'bg-[#79D7FE] text-white',
      },
    },
    defaultVariants: { variant: 'car' },
  }
);

export interface ServiceCardProps
  extends Omit<React.ComponentPropsWithoutRef<typeof motion.div>, 'title'>,
    VariantProps<typeof cardVariants> {
  title: string;
  imgSrc?: string;
  imgAlt?: string;
  media?: React.ReactNode;
  imageClassName?: string;
  titleClassName?: string;
  actionClassName?: string;
  actionLabel?: string;
  uploadedImage?: string | null;
  isUploading?: boolean;
  attentionPulse?: boolean;
  radioSelected?: boolean;
  radioClassName?: string;
  onRemoveImage?: () => void;
}

const ServiceCard = React.forwardRef<HTMLDivElement, ServiceCardProps>(({ className, variant, title, imgSrc, imgAlt = '', media, imageClassName, titleClassName, actionClassName, actionLabel = 'SELECT', uploadedImage, isUploading = false, attentionPulse = false, radioSelected, radioClassName, onRemoveImage, onKeyDown, ...props }, ref) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const cardAnimation = {
    idle: { scale: 1 },
    hover: { scale: 1.02, transition: { duration: 0.3 } },
    attention: { scale: [1, 1.045, 1], transition: { duration: 0.55, ease: 'easeInOut' as const, repeat: 1 } },
  };
  const imageAnimation = {
    idle: { scale: 1, rotate: 0, x: 0 },
    hover: { scale: 1.1, rotate: 3, x: 10, transition: { duration: 0.4, ease: 'easeInOut' as const } },
    attention: { scale: [1, 1.1, 1], rotate: [0, 3, 0], x: [0, 10, 0], transition: { duration: 0.55, ease: 'easeInOut' as const, repeat: 1 } },
  };
  const arrowAnimation = { hover: { x: 5, transition: { duration: 0.3, ease: 'easeInOut' as const, repeat: Infinity, repeatType: 'reverse' as const } } };

  return (
    <motion.div ref={ref} role="button" tabIndex={0} className={cn(cardVariants({ variant, className }), (uploadedImage || isUploading) && 'min-h-[145px]')} variants={cardAnimation} animate={attentionPulse ? 'attention' : 'idle'} whileHover="hover" onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.currentTarget.click(); } onKeyDown?.(event); }} {...props}>
      <div className="relative z-10 flex h-full flex-col">
        <h3 className={cn('max-w-[65%] text-[21px] font-bold tracking-tight', titleClassName)}>{title}</h3>
      </div>
      <span className="absolute bottom-3 left-4 z-10 flex items-center gap-3">
        <AnimatePresence mode="wait" initial={false}>
        {isUploading ? (
          <motion.span key="uploading" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex h-16 items-center gap-2 text-[12px] font-semibold">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" />
            Uploading...
          </motion.span>
        ) : uploadedImage ? (
          <motion.span key={uploadedImage} initial={{ opacity: 0, scale: 0.75, y: 8 }} animate={isDeleting ? { opacity: 0, scale: 0.55, x: 24, rotate: 8 } : { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }} transition={{ duration: 0.28, ease: 'easeInOut' }} className="h-16 w-24">
            <img src={uploadedImage} alt={`${title} selected preview`} className="h-full w-full rounded-md object-contain" />
          </motion.span>
        ) : (
          <motion.span key="action" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn('flex items-center text-[13.5px] font-semibold group-hover:underline', actionClassName)}>
            {actionLabel}
            {radioSelected !== undefined ? (
              <span className={cn('ml-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-white/20', radioClassName)} aria-hidden="true">
                {radioSelected ? <span className="h-2.5 w-2.5 rounded-full bg-white" /> : null}
              </span>
            ) : (
              <motion.span variants={arrowAnimation}><ArrowRight className="ml-2 h-4 w-4" /></motion.span>
            )}
          </motion.span>
        )}
        </AnimatePresence>
      </span>
      <AnimatePresence>
        {uploadedImage && !isUploading ? (
          <motion.span initial={{ opacity: 0, scale: 0.5 }} animate={isDeleting ? { opacity: 0, scale: 0, rotate: 90 } : { opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0 }} transition={{ duration: 0.25 }} className="absolute right-3 top-3 z-20">
            <DeleteIconButton label={`Remove ${title} image`} onClick={() => {
              if (isDeleting) return;
              setIsDeleting(true);
              window.setTimeout(() => {
                onRemoveImage?.();
                setIsDeleting(false);
              }, 280);
            }} />
          </motion.span>
        ) : null}
      </AnimatePresence>
      {media ? (
        <motion.span className={cn('absolute bottom-4 right-5 flex h-16 w-16 items-center justify-center opacity-90 group-hover:opacity-100', imageClassName)} variants={imageAnimation}>{media}</motion.span>
      ) : imgSrc ? (
        <motion.img src={imgSrc} alt={imgAlt} className={cn('absolute -bottom-5 -right-4 h-28 w-28 object-contain opacity-90 group-hover:opacity-100', imageClassName)} variants={imageAnimation} />
      ) : null}
    </motion.div>
  );
});

ServiceCard.displayName = 'ServiceCard';

export { ServiceCard };
