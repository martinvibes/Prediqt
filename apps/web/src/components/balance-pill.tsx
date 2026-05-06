'use client';

import { useCredit } from '@/hooks/use-credit';
import { EncryptedReveal } from './encrypted-reveal';
import { formatPredq } from '@/lib/utils';

export function BalancePill() {
  const { balance, status, refresh } = useCredit();

  return (
    <button
      onClick={refresh}
      className="hidden sm:flex items-center gap-2 px-3 h-8 rounded-lg border border-volt/30 bg-volt/5 hover:bg-volt/10 transition-colors group"
      title="Click to refresh encrypted balance"
    >
      <span className="block w-1 h-1 rounded-full bg-volt animate-q-pulse" />
      <span className="font-mono text-xs tabular tracking-wider">
        {status === 'loading' ? (
          <span className="text-ink-dim">decrypting…</span>
        ) : status === 'decrypted' && balance !== null ? (
          <>
            <EncryptedReveal
              value={formatPredq(balance, { compact: true })}
              duration={500}
              className="text-volt"
            />
            <span className="text-ink-dim ml-1">PREDQ</span>
          </>
        ) : status === 'encrypted' ? (
          <span className="text-ink-dim">●●●●● PREDQ</span>
        ) : (
          <span className="text-ink-dim">— PREDQ</span>
        )}
      </span>
    </button>
  );
}
