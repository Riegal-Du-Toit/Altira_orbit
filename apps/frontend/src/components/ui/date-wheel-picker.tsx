'use client';

import * as React from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import type { MotionValue, PanInfo } from 'framer-motion';

import { cn } from '@/lib/utils';

export interface DateWheelPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: Date;
  onChange: (date: Date) => void;
  minYear?: number;
  maxYear?: number;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  locale?: string;
}

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;
const PERSPECTIVE_ORIGIN = ITEM_HEIGHT * 2;

function getMonthNames(locale?: string): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { month: 'long' });
  return Array.from({ length: 12 }, (_, index) => formatter.format(new Date(2000, index, 1)));
}

const sizeConfig = {
  sm: { itemHeight: ITEM_HEIGHT * 0.6, fontSize: 'text-sm', gap: 'gap-2' },
  md: { itemHeight: ITEM_HEIGHT, fontSize: 'text-base', gap: 'gap-4' },
  lg: { itemHeight: ITEM_HEIGHT * 1.2, fontSize: 'text-lg', gap: 'gap-6' },
};

interface WheelItemProps {
  item: string | number;
  index: number;
  y: MotionValue<number>;
  itemHeight: number;
  visibleItems: number;
  centerOffset: number;
  isSelected: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function WheelItem({ item, index, y, itemHeight, visibleItems, centerOffset, isSelected, disabled, onClick }: WheelItemProps) {
  const itemY = useTransform(y, (latest) => index * itemHeight + latest + centerOffset);
  const rotateX = useTransform(itemY, [0, centerOffset, itemHeight * visibleItems], [45, 0, -45]);
  const scale = useTransform(itemY, [0, centerOffset, itemHeight * visibleItems], [0.8, 1, 0.8]);
  return (
    <motion.div
      className="flex select-none items-center justify-center"
      style={{ height: itemHeight, rotateX, scale, transformStyle: 'preserve-3d', transformOrigin: `center center -${PERSPECTIVE_ORIGIN}px` }}
      onClick={() => !disabled && onClick()}
    >
      <span className={cn('font-medium transition-colors', isSelected ? 'font-bold text-[#1769ff]' : 'text-[#1769ff]/40')}>{item}</span>
    </motion.div>
  );
}

interface WheelColumnProps {
  items: (string | number)[];
  value: number;
  onChange: (index: number) => void;
  itemHeight: number;
  visibleItems: number;
  disabled?: boolean;
  className?: string;
  ariaLabel: string;
}

function WheelColumn({ items, value, onChange, itemHeight, visibleItems, disabled, className, ariaLabel }: WheelColumnProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const y = useMotionValue(-value * itemHeight);
  const centerOffset = Math.floor(visibleItems / 2) * itemHeight;
  const valueRef = React.useRef(value);
  const onChangeRef = React.useRef(onChange);
  const itemsLengthRef = React.useRef(items.length);

  React.useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
    itemsLengthRef.current = items.length;
  });

  React.useEffect(() => {
    animate(y, -value * itemHeight, { type: 'spring', stiffness: 300, damping: 30 });
  }, [value, itemHeight, y]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;
    const projectedY = y.get() + info.velocity.y * 0.2;
    const newIndex = Math.max(0, Math.min(items.length - 1, Math.round(-projectedY / itemHeight)));
    onChange(newIndex);
  };

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const direction = event.deltaY > 0 ? 1 : -1;
      const newIndex = Math.max(0, Math.min(itemsLengthRef.current - 1, valueRef.current + direction));
      if (newIndex !== valueRef.current) onChangeRef.current(newIndex);
    };
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [disabled]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    const maxIndex = items.length - 1;
    let newIndex = value;
    if (event.key === 'ArrowUp') newIndex = Math.max(0, value - 1);
    else if (event.key === 'ArrowDown') newIndex = Math.min(maxIndex, value + 1);
    else if (event.key === 'Home') newIndex = 0;
    else if (event.key === 'End') newIndex = maxIndex;
    else if (event.key === 'PageUp') newIndex = Math.max(0, value - 5);
    else if (event.key === 'PageDown') newIndex = Math.min(maxIndex, value + 5);
    else return;
    event.preventDefault();
    if (newIndex !== value) onChange(newIndex);
  };

  const dragConstraints = React.useMemo(() => ({ top: -(items.length - 1) * itemHeight, bottom: 0 }), [items.length, itemHeight]);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', disabled && 'pointer-events-none opacity-50', className)}
      style={{ height: itemHeight * visibleItems }}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      role="spinbutton"
      aria-label={ariaLabel}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={items.length - 1}
      aria-valuetext={String(items[value])}
      aria-disabled={disabled}
    >
      <div className="pointer-events-none absolute inset-x-0 z-[5] border-y border-border bg-muted/30" style={{ top: centerOffset - 4, height: itemHeight + 8 }} aria-hidden="true" />
      <motion.div className="cursor-grab active:cursor-grabbing" style={{ y, paddingTop: centerOffset, paddingBottom: centerOffset }} drag="y" dragConstraints={dragConstraints} dragElastic={0.1} onDragEnd={handleDragEnd}>
        {items.map((item, index) => (
          <WheelItem key={`${item}-${index}`} item={item} index={index} y={y} itemHeight={itemHeight} visibleItems={visibleItems} centerOffset={centerOffset} isSelected={index === value} disabled={disabled} onClick={() => onChange(index)} />
        ))}
      </motion.div>
    </div>
  );
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

const DateWheelPicker = React.forwardRef<HTMLDivElement, DateWheelPickerProps>(({ value, onChange, minYear = 1920, maxYear = new Date().getFullYear(), size = 'md', disabled = false, locale, className, ...props }, ref) => {
  const config = sizeConfig[size];
  const months = React.useMemo(() => getMonthNames(locale), [locale]);
  const years = React.useMemo(() => {
    const values: number[] = [];
    for (let year = maxYear; year >= minYear; year--) values.push(year);
    return values;
  }, [minYear, maxYear]);
  const [dateState, setDateState] = React.useState(() => {
    const currentDate = value || new Date();
    return { day: currentDate.getDate(), month: currentDate.getMonth(), year: currentDate.getFullYear() };
  });
  const isInternalChange = React.useRef(false);
  const days = React.useMemo(() => Array.from({ length: getDaysInMonth(dateState.year, dateState.month) }, (_, index) => index + 1), [dateState.month, dateState.year]);

  const handleDayChange = React.useCallback((dayIndex: number) => {
    isInternalChange.current = true;
    setDateState((previous) => ({ ...previous, day: dayIndex + 1 }));
  }, []);
  const handleMonthChange = React.useCallback((monthIndex: number) => {
    isInternalChange.current = true;
    setDateState((previous) => ({ ...previous, month: monthIndex, day: Math.min(previous.day, getDaysInMonth(previous.year, monthIndex)) }));
  }, []);
  const handleYearChange = React.useCallback((yearIndex: number) => {
    isInternalChange.current = true;
    setDateState((previous) => ({ ...previous, year: years[yearIndex], day: Math.min(previous.day, getDaysInMonth(years[yearIndex], previous.month)) }));
  }, [years]);

  React.useEffect(() => {
    if (!isInternalChange.current) return;
    onChange(new Date(dateState.year, dateState.month, dateState.day));
    isInternalChange.current = false;
  }, [dateState, onChange]);

  React.useEffect(() => {
    if (!value || isInternalChange.current) return;
    if (value.getDate() !== dateState.day || value.getMonth() !== dateState.month || value.getFullYear() !== dateState.year) {
      setDateState({ day: value.getDate(), month: value.getMonth(), year: value.getFullYear() });
    }
  }, [value, dateState.day, dateState.month, dateState.year]);

  const yearIndex = years.indexOf(dateState.year);

  return (
    <div ref={ref} className={cn('flex items-center justify-center', config.gap, config.fontSize, disabled && 'pointer-events-none opacity-50', className)} style={{ perspective: '1000px' }} role="group" aria-label="Date picker" {...props}>
      <WheelColumn items={days} value={dateState.day - 1} onChange={handleDayChange} itemHeight={config.itemHeight} visibleItems={VISIBLE_ITEMS} disabled={disabled} className="w-16" ariaLabel="Select day" />
      <WheelColumn items={months} value={dateState.month} onChange={handleMonthChange} itemHeight={config.itemHeight} visibleItems={VISIBLE_ITEMS} disabled={disabled} className="w-28" ariaLabel="Select month" />
      <WheelColumn items={years} value={yearIndex >= 0 ? yearIndex : 0} onChange={handleYearChange} itemHeight={config.itemHeight} visibleItems={VISIBLE_ITEMS} disabled={disabled} className="w-20" ariaLabel="Select year" />
    </div>
  );
});

DateWheelPicker.displayName = 'DateWheelPicker';

export { DateWheelPicker };
