'use client';

import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  accentColor: string;
  glowFrom: string;
  glowTo: string;
  valueClassName?: string;
  iconBackgroundClassName?: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export function DashboardMetricCard({
  title,
  value,
  subtitle,
  icon,
  accentColor,
  glowFrom,
  glowTo,
  valueClassName,
  iconBackgroundClassName,
  className,
  onClick,
}: DashboardMetricCardProps) {
  const style = {
    '--glow-color': accentColor,
    '--glow-color-via': glowFrom,
    '--glow-color-to': glowTo,
  } as CSSProperties;

  return (
    <Card
      className={`relative overflow-hidden rounded-lg border bg-gradient-to-t from-background to-muted transition-all duration-200 hover:shadow-lg group ${onClick ? 'cursor-pointer' : ''} ${className ?? ''}`.trim()}
      style={style}
      onClick={onClick}
    >
      <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-transparent from-40% via-[var(--glow-color-via)] to-[var(--glow-color-to)] via-70% z-10 pointer-events-none" />
      <div className="absolute left-0 bottom-0 h-[2px] w-full bg-[var(--glow-color)] rounded-b shadow-[0_-1px_8px_var(--glow-color)] group-hover:translate-y-full transition-transform duration-200 z-20" />
      <CardContent className="pt-6 relative z-30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className={`text-3xl font-bold mt-1 ${valueClassName ?? ''}`.trim()}>{value}</p>
            {subtitle ? <p className="text-xs text-gray-500 mt-1">{subtitle}</p> : null}
          </div>
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBackgroundClassName ?? 'bg-white/80'}`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
