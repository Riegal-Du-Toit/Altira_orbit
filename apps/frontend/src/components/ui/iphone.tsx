import * as React from 'react';

import { cn } from '@/lib/utils';

interface IPhoneProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function IPhone({ children, className, ...props }: IPhoneProps) {
  return (
    <div
      className={cn(
        'relative h-[min(780px,calc(100dvh-32px))] min-h-[600px] w-[min(390px,calc(100vw-24px))] rounded-[3rem] border-[7px] border-[#15171b] bg-[#15171b] p-[3px] shadow-[0_24px_65px_rgba(15,23,42,0.22)]',
        className
      )}
      {...props}
    >
      <span className="absolute -left-[10px] top-28 h-8 w-[6px] rounded-l-md bg-[#202329]" />
      <span className="absolute -left-[10px] top-40 h-14 w-[6px] rounded-l-md bg-[#202329]" />
      <span className="absolute -right-[10px] top-36 h-20 w-[6px] rounded-r-md bg-[#202329]" />
      <div className="relative h-full overflow-hidden rounded-[2.45rem] bg-white">
        <span className="absolute left-1/2 top-2 z-50 h-6 w-[106px] -translate-x-1/2 rounded-full bg-[#111318]" />
        <span className="absolute left-[calc(50%+32px)] top-[15px] z-[51] h-2 w-2 rounded-full bg-[#27344c] ring-1 ring-[#415574]" />
        {children}
      </div>
    </div>
  );
}
