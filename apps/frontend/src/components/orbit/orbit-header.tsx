import { ArrowLeft } from 'lucide-react';

interface OrbitHeaderProps {
  step: number;
  total: number;
  canGoBack: boolean;
  onBack: () => void;
}

export function OrbitHeader({ step, total, canGoBack, onBack }: OrbitHeaderProps) {
  return (
    <header className="relative z-10 shrink-0 bg-transparent px-5 pb-3 pt-10">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {canGoBack ? (
            <button type="button" onClick={onBack} aria-label="Previous step" className="-ml-1 rounded-md p-1 text-slate-500 hover:bg-slate-100">
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : (
            <span className="h-2.5 w-2.5 rounded-full border-[3px] border-[#1769ff] border-r-[#8dc0ff]" />
          )}
          <span className="text-sm font-extrabold tracking-tight text-[#0f172a]">Orbit</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-[10px] font-medium text-slate-500">Step {step}/{total}</span>
          <div className="h-1 w-12 overflow-hidden rounded-full bg-slate-300/80">
            <div className="h-full rounded-full bg-[#1769ff] transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${Math.max(8, (step / total) * 100)}%` }} />
          </div>
        </div>
      </div>
    </header>
  );
}
