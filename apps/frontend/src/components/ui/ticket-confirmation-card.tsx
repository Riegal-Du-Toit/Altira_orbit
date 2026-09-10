'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const MastercardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="24">
    <circle cx="8" cy="12" r="7" fill="#EA001B" />
    <circle cx="16" cy="12" r="7" fill="#F79E1B" fillOpacity="0.8" />
  </svg>
);

const DashedLine = () => <div className="w-full border-t-2 border-dashed border-border" aria-hidden="true" />;

const Barcode = ({ value }: { value: string }) => {
  const hashCode = (text: string) => text.split('').reduce((total, character) => ((total << 5) - total) + character.charCodeAt(0) & total, 0);
  const seed = hashCode(value);
  const random = (input: number) => {
    const result = Math.sin(input) * 10000;
    return result - Math.floor(result);
  };
  const bars = Array.from({ length: 60 }, (_, index) => ({ width: random(seed + index) > 0.7 ? 2.5 : 1.5 }));
  const spacing = 1.5;
  const totalWidth = bars.reduce((total, bar) => total + bar.width + spacing, 0) - spacing;
  let currentX = (250 - totalWidth) / 2;

  return (
    <div className="flex flex-col items-center py-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="250" height="54" viewBox="0 0 250 54" aria-label={`Barcode for value ${value}`} className="max-w-full fill-current text-foreground">
        {bars.map((bar, index) => {
          const x = currentX;
          currentX += bar.width + spacing;
          return <rect key={index} x={x} y="5" width={bar.width} height="42" />;
        })}
      </svg>
      <p className="mt-1 text-[9px] tracking-[0.28em] text-muted-foreground">{value}</p>
    </div>
  );
};

const ConfettiExplosion = () => {
  const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#8b5cf6', '#f97316'];
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 34 }, (_, index) => {
        const left = (index * 37) % 100;
        const delay = (index % 8) * 0.12;
        const duration = 2.5 + (index % 5) * 0.3;
        return <i key={index} className="absolute -top-5 h-3 w-1.5 motion-safe:animate-[confetti-fall_var(--duration)_var(--delay)_linear_forwards] motion-reduce:hidden" style={{ left: `${left}%`, backgroundColor: colors[index % colors.length], ['--duration' as string]: `${duration}s`, ['--delay' as string]: `${delay}s`, transform: `rotate(${index * 29}deg)` }} />;
      })}
    </div>
  );
};

export interface TicketProps extends React.HTMLAttributes<HTMLDivElement> {
  ticketId: string;
  amount: number;
  date: Date;
  cardHolder: string;
  last4Digits: string;
  barcodeValue: string;
  icon?: React.ReactNode;
}

const AnimatedTicket = React.forwardRef<HTMLDivElement, TicketProps>(({ className, ticketId, amount, date, cardHolder, last4Digits, barcodeValue, icon, ...props }, ref) => {
  const [showConfetti, setShowConfetti] = React.useState(false);

  React.useEffect(() => {
    const mountTimer = window.setTimeout(() => setShowConfetti(true), 100);
    const unmountTimer = window.setTimeout(() => setShowConfetti(false), 4200);
    return () => { window.clearTimeout(mountTimer); window.clearTimeout(unmountTimer); };
  }, []);

  const formattedAmount = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(amount);
  const formattedDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(date).replace(',', ' ·');

  return (
    <>
      {showConfetti ? <ConfettiExplosion /> : null}
      <div ref={ref} className={cn('relative z-10 w-full rounded-2xl bg-card text-card-foreground shadow-lg animate-in fade-in-0 zoom-in-95 duration-500', className)} {...props}>
        <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-background" />
        <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-background" />
        <div className="flex flex-col items-center p-5 text-center">
          <div className="rounded-full bg-primary/10 p-3">{icon ?? <CheckCircleIcon className="h-9 w-9 text-primary" />}</div>
          <h1 className="mt-3 text-xl font-semibold">Thank you!</h1>
          <p className="mt-1 text-[11px] text-muted-foreground">Your policy has been issued successfully</p>
        </div>
        <div className="space-y-4 px-5 pb-5">
          <DashedLine />
          <div className="grid grid-cols-2 gap-3 text-left">
            <div><p className="text-[9px] uppercase text-muted-foreground">Policy ID</p><p className="font-mono text-[11px] font-medium">{ticketId}</p></div>
            <div className="text-right"><p className="text-[9px] uppercase text-muted-foreground">Premium</p><p className="text-sm font-semibold">{formattedAmount}</p></div>
          </div>
          <div><p className="text-[9px] uppercase text-muted-foreground">Date &amp; Time</p><p className="text-[11px] font-medium">{formattedDate}</p></div>
          <div className="flex items-center space-x-3 rounded-lg bg-muted/50 p-3"><MastercardIcon /><div><p className="text-[11px] font-semibold">{cardHolder}</p><p className="font-mono text-[10px] tracking-wider text-muted-foreground">•••• {last4Digits}</p></div></div>
          <DashedLine />
          <Barcode value={barcodeValue} />
        </div>
      </div>
    </>
  );
});

AnimatedTicket.displayName = 'AnimatedTicket';

export { AnimatedTicket };
