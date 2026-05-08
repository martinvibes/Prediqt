'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { format, setHours, setMinutes, addHours, addDays, addMonths, subMonths } from 'date-fns';
import * as Popover from '@radix-ui/react-popover';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface DateTimePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  placeholder?: string;
  className?: string;
}

export function DateTimePicker({
  value,
  onChange,
  minDate,
  placeholder = 'Pick a date & time',
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [hours, setH] = React.useState(value ? value.getHours() : 18);
  const [mins, setM] = React.useState(value ? value.getMinutes() : 0);
  const [month, setMonth] = React.useState<Date>(value ?? new Date());

  React.useEffect(() => {
    if (value) setMonth(value);
  }, [value]);

  const handleDaySelect = (day: Date | undefined) => {
    if (!day) return;
    onChange(setMinutes(setHours(day, hours), mins));
  };

  const handleTimeChange = (h: number, m: number) => {
    setH(h);
    setM(m);
    if (value) onChange(setMinutes(setHours(value, h), m));
  };

  const handlePreset = (d: Date) => {
    setH(d.getHours());
    setM(0);
    onChange(d);
    setMonth(d);
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center gap-3 h-12 w-full rounded-xl px-4',
            'bg-[#1A1A20] border border-[rgba(255,255,255,0.08)]',
            'text-left transition-all duration-150',
            'hover:border-[rgba(255,255,255,0.14)] focus:border-volt/50 focus:outline-none',
            !value && 'text-[#555]',
            value && 'text-white',
            className,
          )}
        >
          <Calendar className="h-4 w-4 text-[#888] shrink-0" />
          <span className="flex-1 font-sans text-sm">
            {value ? format(value, 'EEE, MMM d, yyyy') : placeholder}
          </span>
          {value && (
            <span className="font-mono text-xs tabular text-volt">
              {format(value, 'HH:mm')}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          side="bottom"
          sideOffset={8}
          collisionPadding={16}
          avoidCollisions
          className={cn(
            'z-[70] rounded-2xl border border-[rgba(255,255,255,0.08)]',
            'bg-[#1E1E24] shadow-[0_24px_80px_-16px_rgba(0,0,0,0.9)]',
            'data-[state=open]:animate-fade-up',
            'w-[340px] overflow-hidden',
          )}
        >
          {/* Quick presets */}
          <div className="px-3 pt-3 pb-2.5 grid grid-cols-6 gap-1">
            {[
              { label: '1h', fn: () => addHours(new Date(), 1) },
              { label: '6h', fn: () => addHours(new Date(), 6) },
              { label: '24h', fn: () => addDays(new Date(), 1) },
              { label: '3d', fn: () => addDays(new Date(), 3) },
              { label: '1w', fn: () => addDays(new Date(), 7) },
              { label: '1mo', fn: () => addDays(new Date(), 30) },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handlePreset(p.fn())}
                className={cn(
                  'px-1 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-wider',
                  'bg-[#28282F] text-[#999] border border-transparent',
                  'hover:bg-volt/10 hover:text-volt hover:border-volt/20',
                  'transition-all duration-150',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Month header — prev | title | next on a single row */}
          <div className="px-3 pt-2 pb-1 flex items-center justify-between border-t border-[rgba(255,255,255,0.06)]">
            <button
              type="button"
              onClick={() => setMonth(subMonths(month, 1))}
              className="h-7 w-7 rounded-md flex items-center justify-center text-[#888] hover:text-white hover:bg-[#2a2a30] transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <div className="font-sans text-[13px] font-medium text-white">
              {format(month, 'MMMM yyyy')}
            </div>
            <button
              type="button"
              onClick={() => setMonth(addMonths(month, 1))}
              className="h-7 w-7 rounded-md flex items-center justify-center text-[#888] hover:text-white hover:bg-[#2a2a30] transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Calendar grid */}
          <div className="px-3 pb-2">
            <DayPicker
              mode="single"
              month={month}
              onMonthChange={setMonth}
              selected={value ?? undefined}
              onSelect={handleDaySelect}
              disabled={minDate ? { before: minDate } : undefined}
              hideNavigation
              classNames={{
                root: 'w-full',
                months: 'w-full',
                month: 'w-full',
                month_caption: 'hidden',
                month_grid: 'w-full table-fixed border-collapse',
                weekdays: '',
                weekday: 'text-center font-mono text-[10px] uppercase tracking-wider text-[#555] py-2 font-normal',
                weeks: '',
                week: '',
                day: 'p-0.5 text-center align-middle',
                day_button: cn(
                  'h-10 w-full rounded-lg font-mono text-[14px] tabular text-[#ccc]',
                  'inline-flex items-center justify-center',
                  'transition-all duration-150',
                  'hover:bg-volt/15 hover:text-volt',
                  'focus:outline-none',
                ),
                selected: '!bg-volt !text-[#09090B] font-bold !rounded-lg',
                today: 'ring-1 ring-inset ring-volt/40 text-volt rounded-lg',
                disabled: 'text-[#333] !cursor-not-allowed hover:!bg-transparent hover:!text-[#333]',
                outside: 'text-[#2a2a2a]',
              }}
            />
          </div>

          {/* Time + Done */}
          <div className="px-3 py-2.5 border-t border-[rgba(255,255,255,0.06)] bg-[#16161B] flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 bg-[#28282F] rounded-md p-0.5">
              <select
                value={hours}
                onChange={(e) => handleTimeChange(Number(e.target.value), mins)}
                className="bg-transparent rounded px-1.5 py-1 font-mono text-xs tabular text-white appearance-none cursor-pointer focus:outline-none hover:bg-[#2a2a30] transition-colors"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i} className="bg-[#18181C]">
                    {i.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
              <span className="text-[#555] font-mono text-xs">:</span>
              <select
                value={mins}
                onChange={(e) => handleTimeChange(hours, Number(e.target.value))}
                className="bg-transparent rounded px-1.5 py-1 font-mono text-xs tabular text-white appearance-none cursor-pointer focus:outline-none hover:bg-[#2a2a30] transition-colors"
              >
                {[0, 15, 30, 45].map((m) => (
                  <option key={m} value={m} className="bg-[#18181C]">
                    {m.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>

            <span className="flex-1 font-mono text-[10px] uppercase tracking-wider text-[#666] truncate text-right">
              {value ? format(value, 'EEE, MMM d') : 'pick a day'}
            </span>

            <Button
              type="button"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={!value}
            >
              Done
            </Button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
