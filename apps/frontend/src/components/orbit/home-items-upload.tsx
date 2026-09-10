'use client';

import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { Camera, Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { createPortal } from 'react-dom';

import type { HomeItemUpload } from '@/components/orbit/types';
import { DeleteIconButton } from '@/components/ui/delete-icon-button';

const demoTitles = ['Stove', 'TV', 'Phone', 'Laptop'];

interface HomeItemsUploadProps {
  items: HomeItemUpload[];
  onChange: (items: HomeItemUpload[]) => void;
}

export function HomeItemsUpload({ items, onChange }: HomeItemsUploadProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const dragControls = useDragControls();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const overlayRoot = typeof document === 'undefined' ? null : document.getElementById('orbit-app-overlay-root');

  const addItem = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setOpen(false);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        window.setTimeout(() => {
          const item: HomeItemUpload = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            title: demoTitles[items.length % demoTitles.length],
            image: reader.result as string,
          };
          onChange([...items, item]);
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

  const removeItem = (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    window.setTimeout(() => {
      onChange(items.filter((item) => item.id !== id));
      setDeletingId(null);
    }, 280);
  };

  return (
    <>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" aria-label="Take home item photo" onChange={addItem} />
      <input ref={galleryRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" aria-label="Upload home item photo" onChange={addItem} />
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <div className="rounded-xl bg-blue-50 px-3 py-2.5 text-[10px] leading-4 text-slate-600"><span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1769ff] text-[8px] font-black text-white">AI</span><b className="text-slate-800">Let’s round up your valuables</b> — TVs, laptops, jewellery, anything you’d like to cover.</div>
        <div className="mt-3 grid max-h-[310px] grid-cols-2 gap-3 overflow-x-hidden overflow-y-scroll pr-1 [scrollbar-color:#9fc4ff_transparent] [scrollbar-width:thin]">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div key={item.id} initial={{ opacity: 0, scale: .75, y: 12 }} animate={deletingId === item.id ? { opacity: 0, scale: .55, x: 20, rotate: 8 } : { opacity: 1, scale: 1, y: 0, x: 0, rotate: 0 }} exit={{ opacity: 0, scale: .55 }} transition={{ duration: .28, ease: 'easeInOut' }} className="relative overflow-visible rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                <div className="h-24 overflow-hidden rounded-lg bg-slate-100"><img src={item.image} alt={item.title} className="h-full w-full object-contain" /></div>
                <p className="mt-2 truncate text-[10px] font-extrabold text-slate-800">{item.title}</p>
                <span className="absolute -right-1.5 -top-1.5 z-10"><DeleteIconButton label={`Remove ${item.title}`} onClick={() => removeItem(item.id)} /></span>
              </motion.div>
            ))}
          </AnimatePresence>
          <button type="button" disabled={uploading} onClick={() => setOpen(true)} className="flex min-h-[126px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-200 bg-white text-[#1769ff] transition hover:border-[#1769ff] disabled:cursor-wait">
            {uploading ? <><span className="h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-[#1769ff] motion-reduce:animate-none" /><span className="mt-2 text-[9px] font-bold">Adding item…</span></> : <><span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50"><Plus className="h-5 w-5" /></span><span className="mt-2 text-[10px] font-bold">Add item</span></>}
          </button>
        </div>
        {!items.length && !uploading ? <p className="mt-3 text-[9px] leading-4 text-slate-500"><b className="text-slate-700">No items added yet.</b><br />Add as many as you like — you can always add more later in the app.</p> : null}
      </div>
      {overlayRoot ? createPortal(
        <AnimatePresence>
          {open ? (
            <motion.div className="pointer-events-auto absolute inset-0 flex items-end bg-slate-950/45" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .2 }} onClick={() => setOpen(false)}>
              <motion.div className="w-full rounded-t-3xl bg-white px-4 pb-5 pt-3 shadow-2xl" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 320, damping: 32 }} drag="y" dragListener={false} dragControls={dragControls} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: .75 }} dragMomentum={false} onDragEnd={(_, info) => { if (info.offset.y > 85 || info.velocity.y > 500) setOpen(false); }} onClick={(event) => event.stopPropagation()}>
                <button type="button" aria-label="Drag upload options" className="mx-auto mb-4 flex h-6 w-20 cursor-grab touch-none items-center justify-center active:cursor-grabbing" onPointerDown={(event) => dragControls.start(event)}><span className="h-1.5 w-14 rounded-full bg-slate-300 transition-colors hover:bg-slate-400" /></button>
                <p className="text-sm font-bold text-slate-900">Add an item to cover</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="flex flex-col items-center gap-2"><span className="flex h-20 items-center justify-center"><img src="/3d%20camera.png" alt="Camera" className="h-[72px] w-[72px] object-contain" /></span><button type="button" onClick={() => cameraRef.current?.click()} className="w-full rounded-xl bg-[#1769ff] px-3 py-3 text-[18px] font-bold text-white">Camera</button></div>
                  <div className="flex flex-col items-center gap-2"><span className="flex h-20 items-center justify-center"><img src="/3d%20upload.png" alt="Upload" className="h-20 w-20 object-contain" /></span><button type="button" onClick={() => galleryRef.current?.click()} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-[18px] font-bold text-slate-800">Upload</button></div>
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
