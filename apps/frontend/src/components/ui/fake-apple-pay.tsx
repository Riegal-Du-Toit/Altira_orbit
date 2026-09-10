'use client';

import { Apple, Check, LockKeyhole, ScanFace, ShieldCheck } from 'lucide-react';

import { SwipeConfirmButton } from '@/components/ui/swipe-confirm-button';

type FakeApplePayProps = {
  amount: string;
  onComplete: () => void;
};

export function FakeApplePay({ amount, onComplete }: FakeApplePayProps) {
  return (
    <div className="space-y-1">
      <div className="rounded-[26px] border border-slate-300 bg-gradient-to-b from-slate-200 to-slate-100 p-2 shadow-[0_18px_45px_-20px_rgba(15,23,42,0.65)]">
        <div className="overflow-hidden rounded-[20px] border border-white/80 bg-white shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
            <span className="flex items-center gap-1 text-[17px] font-extrabold tracking-tight text-black"><Apple className="h-5 w-5 fill-black" />Pay</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-extrabold uppercase tracking-wide text-emerald-700"><LockKeyhole className="h-3 w-3" />Secure demo</span>
          </div>

          <div className="space-y-3 p-3.5">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-800 to-[#1769ff] p-3.5 text-white shadow-lg">
              <div className="absolute -right-8 -top-12 h-28 w-28 rounded-full border-[14px] border-white/10" />
              <div className="relative flex items-start justify-between"><span className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/60">Orbit Wallet</span><span className="text-[11px] font-black italic">VISA</span></div>
              <div className="relative mt-5 flex items-end justify-between"><div><span className="block h-5 w-7 rounded bg-gradient-to-br from-amber-200 to-amber-500" /><p className="mt-2 text-[11px] font-bold tracking-[0.16em]">•••• 4242</p></div><Check className="h-5 w-5 rounded-full bg-emerald-400 p-1 text-white" /></div>
            </div>

            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50 px-3">
              <div className="flex items-center justify-between py-2.5"><span className="text-[9px] text-slate-500">Merchant</span><span className="text-[10px] font-bold text-slate-900">Altira Orbit</span></div>
              <div className="flex items-center justify-between py-2.5"><span className="text-[9px] text-slate-500">Monthly premium</span><span className="text-[13px] font-extrabold text-slate-900">{amount}</span></div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm"><ScanFace className="h-6 w-6 text-[#1769ff]" /></span>
              <div><p className="text-[10px] font-extrabold text-slate-900">Device authentication</p><p className="text-[8px] leading-3 text-slate-500">Protected with simulated Face ID verification.</p></div>
            </div>

            <div className="flex items-center justify-center gap-1.5 pb-1 text-[8px] font-semibold text-slate-400"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />Encrypted demo checkout · No real charge</div>
          </div>
        </div>
      </div>

      <SwipeConfirmButton onConfirm={onComplete} />
    </div>
  );
}
