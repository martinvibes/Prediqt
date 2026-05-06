'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Users } from 'lucide-react';
import { ProbabilityBar } from './probability-bar';
import { relativeTime, formatPredq } from '@/lib/utils';
import type { MarketInfo } from '@/hooks/use-markets';

export function MarketCard({
  market,
  index = 0,
}: {
  market: MarketInfo;
  index?: number;
}) {
  const isOpen = market.status === 0;
  const resolveLabel = relativeTime(market.resolveAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.04,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link
        href={`/markets/${market.marketAddress}`}
        className="group relative block rounded-2xl border border-line bg-canvas-raised p-6 transition-all duration-300 hover:border-volt/40 hover:bg-canvas-raised/80 ring-focus"
      >
        <div
          aria-hidden
          className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at top right, rgba(217,255,60,0.06) 0%, transparent 70%)',
          }}
        />

        <div className="relative space-y-4">
          <div className="flex items-center justify-between">
            <span className={`label-micro ${isOpen ? 'text-volt' : 'text-ink-muted'}`}>
              {isOpen ? 'open' : market.outcome ? 'resolved · YES' : 'resolved · NO'}
            </span>
            <span className="flex items-center gap-1 label-micro text-ink-muted">
              <Clock className="h-3 w-3" />
              {resolveLabel}
            </span>
          </div>

          <h3 className="font-display text-2xl tracking-crunch leading-tight group-hover:text-volt transition-colors duration-300">
            {market.question}
          </h3>

          <ProbabilityBar yesPercent={market.yesPrice} size="sm" showLabels />

          <div className="flex items-center justify-between text-xs font-mono tabular text-ink-muted pt-2 border-t border-line">
            <span className="flex items-center gap-1.5">
              <Users className="h-3 w-3" />
              {market.totalBettors} {market.totalBettors === 1 ? 'bettor' : 'bettors'}
            </span>
            <span>
              {formatPredq(market.totalDeposited, { compact: true })} PREDQ pool
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
