'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { Sparkline } from './sparkline';
import { relativeTime, formatPredq, cn } from '@/lib/utils';
import type { MarketInfo } from '@/hooks/use-markets';

/**
 * Premium market card — feels like a mini financial asset.
 * Sparkline + big probability + momentum + glassmorphic surface.
 */
export function MarketCard({
  market,
  index = 0,
  compact = false,
}: {
  market: MarketInfo;
  index?: number;
  compact?: boolean;
}) {
  const isOpen = market.status === 0;
  const isUp = market.yesPrice > 50;
  const resolveLabel = relativeTime(market.resolveAt);
  const pool = formatPredq(market.totalDeposited, { compact: true });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link
        href={`/markets/${market.marketAddress}`}
        className={cn(
          'group relative block rounded-2xl overflow-hidden',
          'bg-canvas-elevated border border-line',
          'shadow-card transition-all duration-300 ease-out',
          'hover:shadow-card-hover hover:border-line-strong hover:-translate-y-0.5',
          'ring-focus',
        )}
      >
        {/* Top accent line — volt for open, dim for closed */}
        <div className={cn(
          'absolute top-0 inset-x-0 h-[1px]',
          isOpen ? 'bg-gradient-to-r from-transparent via-volt/50 to-transparent' : 'bg-transparent',
        )} />

        <div className={cn('relative', compact ? 'p-4' : 'p-5')}>
          {/* Row 1: Status + Sparkline + Big % */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {isOpen ? (
                  <span className="inline-flex items-center gap-1.5 label text-up">
                    <span className="dot-live" />
                    live
                  </span>
                ) : (
                  <span className="label text-ink-ghost">
                    {market.outcome ? 'yes won' : 'no won'}
                  </span>
                )}
                <span className="label text-ink-ghost">·</span>
                <span className="label flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {resolveLabel}
                </span>
              </div>
              <h3 className={cn(
                'font-sans font-medium leading-snug text-ink',
                'group-hover:text-volt transition-colors duration-300',
                compact ? 'text-sm' : 'text-[15px]',
              )}>
                {market.question}
              </h3>
            </div>

            {/* Big probability + sparkline */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <div className={cn(
                'font-mono tabular font-semibold tracking-tight',
                compact ? 'text-2xl' : 'text-3xl',
                isUp ? 'text-up' : 'text-down',
              )}>
                {market.yesPrice}%
              </div>
              <Sparkline
                seed={market.marketAddress}
                currentValue={market.yesPrice}
                width={compact ? 56 : 72}
                height={compact ? 20 : 24}
              />
            </div>
          </div>

          {/* Probability bar */}
          <div className="prob-track mb-3">
            <div className="prob-fill-yes" style={{ width: `${market.yesPrice}%` }} />
          </div>

          {/* Row 2: Meta stats */}
          <div className="flex items-center gap-3 text-ink-muted">
            <span className="label flex items-center gap-1">
              <Users className="h-3 w-3" />
              {market.totalBettors}
            </span>
            <span className="label">·</span>
            <span className="label">{pool} predq</span>
            {!compact && (
              <>
                <span className="label">·</span>
                <span className={cn(
                  'label flex items-center gap-0.5',
                  isUp ? 'text-up' : 'text-down',
                )}>
                  {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {isUp ? 'yes leads' : 'no leads'}
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
