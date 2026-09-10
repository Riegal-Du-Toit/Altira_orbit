'use client';

import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { createPortal } from 'react-dom';

import { ServiceCard } from '@/components/ui/service-card';

interface BankStatementUploadProps {
  uploadedImage: string | null;
  onUpload: (image: string) => void;
  onRemove: () => void;
}

export function BankStatementUpload({ uploadedImage, onUpload, onRemove }: BankStatementUploadProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const dragControls = useDragControls();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const overlayRoot = typeof document === 'undefined' ? null : document.getElementById('orbit-app-overlay-root');

  const addStatement = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setOpen(false);

    if (!file.type.startsWith('image/')) {
      window.setTimeout(() => {
        onUpload('/3d%20upload.png');
        setUploading(false);
      }, 650);
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        window.setTimeout(() => {
          onUpload(reader.result as string);
          setUploading(false);
        }, 650);
      } else {
        setUploading(false);
      }
    };
    reader.onerror = () => setUploading(false);
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" aria-label="Take bank statement photo" onChange={addStatement} />
      <input ref={galleryRef} type="file" accept="application/pdf,image/png,image/jpeg,image/jpg" className="hidden" aria-label="Upload bank statement" onChange={addStatement} />
      <ServiceCard
        className="min-h-[105px]"
        variant="home"
        title="Bank statement"
        actionLabel="Snap/Upload"
        imgSrc="/3d%20upload.png"
        imgAlt="Bank statement upload"
        uploadedImage={uploadedImage}
        isUploading={uploading}
        onRemoveImage={onRemove}
        onClick={() => { if (!uploading) setOpen(true); }}
      />
      {overlayRoot ? createPortal(
        <AnimatePresence>
          {open ? (
            <motion.div className="pointer-events-auto absolute inset-0 flex items-end bg-slate-950/45" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => setOpen(false)}>
              <motion.div
                className="w-full rounded-t-3xl bg-white px-4 pb-5 pt-3 shadow-2xl"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                drag="y"
                dragListener={false}
                dragControls={dragControls}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.75 }}
                dragMomentum={false}
                onDragEnd={(_, info) => { if (info.offset.y > 85 || info.velocity.y > 500) setOpen(false); }}
                onClick={(event) => event.stopPropagation()}
              >
                <button type="button" aria-label="Drag upload options" className="mx-auto mb-4 flex h-6 w-20 cursor-grab touch-none items-center justify-center active:cursor-grabbing" onPointerDown={(event) => dragControls.start(event)}>
                  <span className="h-1.5 w-14 rounded-full bg-slate-300 transition-colors hover:bg-slate-400" />
                </button>
                <p className="text-sm font-bold text-slate-900">Add bank statement</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="flex flex-col items-center gap-2">
                    <span className="flex h-20 items-center justify-center"><img src="/3d%20camera.png" alt="Camera" className="h-[72px] w-[72px] object-contain" /></span>
                    <button type="button" onClick={() => cameraRef.current?.click()} className="w-full rounded-xl bg-[#1769ff] px-3 py-3 text-[18px] font-bold text-white">Camera</button>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="flex h-20 items-center justify-center"><img src="/3d%20upload.png" alt="Upload" className="h-20 w-20 object-contain" /></span>
                    <button type="button" onClick={() => galleryRef.current?.click()} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-[18px] font-bold text-slate-800">Upload</button>
                  </div>
                </div>
                <button type="button" onClick={() => setOpen(false)} className="mt-3 w-full py-2 text-[10px] font-semibold text-slate-500">Cancel</button>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>,
        overlayRoot,
      ) : null}
    </>
  );
}
