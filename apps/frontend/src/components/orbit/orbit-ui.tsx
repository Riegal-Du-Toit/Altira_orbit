import * as React from 'react';
import { Check, ChevronRight, Upload } from 'lucide-react';

import { cn } from '@/lib/utils';
import { AnimatedSplashButton } from '@/components/ui/animated-splash-button';

export function ScreenIntro({ eyebrow, title, copy, eyebrowClassName, titleClassName, copyClassName }: { eyebrow?: string; title: React.ReactNode; copy?: React.ReactNode; eyebrowClassName?: string; titleClassName?: string; copyClassName?: string }) {
  return (
    <div>
      {eyebrow ? <p className={cn('mb-2 text-[10px] font-extrabold uppercase tracking-wide text-[#1769ff]', eyebrowClassName)}>{eyebrow}</p> : null}
      <h1 className={cn('text-[26px] font-black leading-[1.05] tracking-[-0.035em] text-[#0f172a]', titleClassName)}>{title}</h1>
      {copy ? <div className={cn('mt-2 text-[12px] leading-[1.45] text-slate-500', copyClassName)}>{copy}</div> : null}
    </div>
  );
}

export function SelectCard({ selected, icon, title, description, onClick }: { selected: boolean; icon: React.ReactNode; title: string; description?: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn('flex w-full items-center gap-3 rounded-xl border bg-white p-3.5 text-left shadow-sm transition motion-reduce:transition-none', selected ? 'border-[#1769ff] bg-[#eff6ff] ring-1 ring-[#1769ff]' : 'border-slate-200 hover:border-blue-300')}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eff6ff] text-[#1769ff]">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-bold text-slate-900">{title}</span>
        {description ? <span className="mt-0.5 block text-[10px] leading-4 text-slate-500">{description}</span> : null}
      </span>
      {selected ? <Check className="h-4 w-4 text-[#1769ff]" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
    </button>
  );
}

export function UploadCard({ label, uploaded, onClick, compact = false, shape = 'default' }: { label: string; uploaded: boolean; onClick: () => void; compact?: boolean; shape?: 'default' | 'circle' | 'banner' }) {
  return (
    <button type="button" onClick={onClick} className={cn('flex w-full items-center gap-3 rounded-xl border p-3 text-left transition motion-reduce:transition-none', uploaded ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-blue-300', compact ? 'min-h-16' : 'min-h-20')}>
      <span className={cn(
        'flex shrink-0 items-center justify-center',
        shape === 'circle' && 'h-12 w-12 rounded-full',
        shape === 'banner' && 'h-10 w-16 rounded-md',
        shape === 'default' && 'h-9 w-9 rounded-full',
        uploaded ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-[#1769ff]'
      )}>
        {uploaded ? <Check className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
      </span>
      <span className="flex-1 text-[12px] font-bold text-slate-900">{uploaded ? `${label} uploaded` : label}</span>
      <ChevronRight className="h-4 w-4 text-slate-400" />
    </button>
  );
}

export function PrimaryButton({ children, disabled, onClick, className }: { children: React.ReactNode; disabled?: boolean; onClick: () => void; className?: string }) {
  const label = React.Children.toArray(children).map((child) => typeof child === 'string' || typeof child === 'number' ? String(child) : '').join('');
  return <div className={cn('flex min-h-14 w-full justify-center', className)}><AnimatedSplashButton label={label} disabled={disabled} onComplete={onClick} /></div>;
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-500">{children}</label>;
}
