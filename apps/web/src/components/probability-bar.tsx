'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Dual-tone probability bar.
 * Volt fill grows from the left (YES), coral fill is implied on the right.
 * Animates in smoothly on first paint.
 */
export function ProbabilityBar({
  yesPercent,
  delta,
  size = 'md',
  showLabels = true,
  className,
}: {
  /** 0–100 */
  yesPercent: number;
  /** Optional delta vs. yesterday in percentage points */
  delta?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, yesPercent));
  const noPercent = 100 - clamped;

  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3.5' } as const;
  const labelSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' } as const;

  return (
    <div className={cn('w-full space-y-2', className)}>
      <div
        className={cn(
          'relative w-full rounded-full bg-line/50 overflow-hidden',
          heights[size],
        )}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: 'linear-gradient(90deg, #D9FF3C 0%, #A6CC1F 100%)',
            boxShadow: '0 0 18px -4px rgba(217, 255, 60, 0.5)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.div
          className="absolute inset-y-0 right-0 rounded-full opacity-90"
          style={{
            background: 'linear-gradient(270deg, #FF5C5C 0%, #D43A3A 100%)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${noPercent}%` }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        />
      </div>
      {showLabels && (
        <div className={cn('flex justify-between font-mono tabular', labelSizes[size])}>
          <span className="text-volt">
            {clamped.toFixed(0)}% <span className="text-ink-dim">yes</span>
          </span>
          {delta !== undefined && (
            <span
              className={cn(
                'text-ink-dim text-xs',
                delta > 0 && 'text-volt',
                delta < 0 && 'text-coral',
              )}
            >
              {delta > 0 ? '↑' : delta < 0 ? '↓' : '·'} {Math.abs(delta).toFixed(1)}%
            </span>
          )}
          <span className="text-coral">
            <span className="text-ink-dim">no</span> {noPercent.toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  );
}
