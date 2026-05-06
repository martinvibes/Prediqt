'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Users, TrendingUp, TrendingDown } from 'lucide-react';

import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { AuthGate } from '@/components/auth-gate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProbabilityBar } from '@/components/probability-bar';
import { EncryptedReveal } from '@/components/encrypted-reveal';
import { QMark } from '@/components/q-mark';
import { useMarket, usePlaceBet } from '@/hooks/use-markets';
import { relativeTime, formatPredq, shortAddr, cn } from '@/lib/utils';

export default function MarketPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = use(params);

  return (
    <main className="relative min-h-screen flex flex-col">
      <Nav />
      <AuthGate>
        <MarketContent address={address} />
      </AuthGate>
      <Footer />
    </main>
  );
}

function MarketContent({ address }: { address: string }) {
  const { market, userYes, userNo, loading, refresh } = useMarket(address);
  const { placeBet, busy } = usePlaceBet();
  const [amount, setAmount] = useState('');
  const [side, setSide] = useState<'yes' | 'no' | null>(null);

  if (loading) {
    return (
      <section className="flex-1 px-6 pt-16">
        <div className="mx-auto max-w-[960px]">
          <div className="shimmer-overlay rounded-3xl border border-line bg-canvas-raised h-72" />
        </div>
      </section>
    );
  }

  if (!market) {
    return (
      <section className="flex-1 px-6 pt-32 text-center">
        <QMark size={48} className="mx-auto opacity-50 mb-6" />
        <h2 className="font-display text-3xl tracking-crunch">Market not found.</h2>
      </section>
    );
  }

  const isOpen = market.status === 0;
  const amountPredq = parseFloat(amount) || 0;
  const amountRaw = BigInt(Math.floor(amountPredq * 1_000_000));
  const canBet = isOpen && side && amountPredq >= 1 && !busy;

  const handleBet = async () => {
    if (!side || amountRaw < 1_000_000n) return;
    try {
      await placeBet(address, side === 'yes', amountRaw);
      setAmount('');
      setSide(null);
      refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <section className="flex-1 px-6 pt-16 pb-24">
      <div className="mx-auto max-w-[960px]">
        <Link
          href={`/rooms/${market.roomId.toString()}`}
          className="inline-flex items-center gap-2 label-micro hover:text-ink mb-10"
        >
          <ArrowLeft className="h-3 w-3" />
          back to room
        </Link>

        {/* Question header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 mb-12"
        >
          <div className="flex items-center gap-3 label-micro">
            <span className={isOpen ? 'text-volt' : 'text-ink-muted'}>
              {isOpen ? 'open' : `resolved · ${market.outcome ? 'YES' : 'NO'}`}
            </span>
            <span className="text-ink-ghost">/</span>
            <span className="flex items-center gap-1 text-ink-muted">
              <Clock className="h-3 w-3" />
              {isOpen ? `resolves ${relativeTime(market.resolveAt)}` : 'settled'}
            </span>
          </div>
          <h1 className="heading-display text-mega">{market.question}</h1>
          <ProbabilityBar yesPercent={market.yesPrice} size="lg" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Bet panel */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-7"
          >
            {isOpen ? (
              <div className="rounded-3xl border border-line bg-canvas-raised p-8 space-y-6">
                <div className="label-micro flex items-center gap-2">
                  <span className="q-dot" />
                  Place your bet
                </div>

                {/* YES / NO toggle */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSide('yes')}
                    className={cn(
                      'relative flex flex-col items-center justify-center h-24 rounded-2xl border-2 transition-all duration-200',
                      side === 'yes'
                        ? 'border-volt bg-volt/10 shadow-glow-volt'
                        : 'border-line hover:border-volt/40',
                    )}
                  >
                    <TrendingUp className={cn('h-5 w-5 mb-1', side === 'yes' ? 'text-volt' : 'text-ink-dim')} />
                    <span className="font-mono text-lg uppercase tracking-wider">Yes</span>
                    <span className="font-mono text-xs tabular text-ink-dim">{market.yesPrice}%</span>
                  </button>
                  <button
                    onClick={() => setSide('no')}
                    className={cn(
                      'relative flex flex-col items-center justify-center h-24 rounded-2xl border-2 transition-all duration-200',
                      side === 'no'
                        ? 'border-coral bg-coral/10 shadow-glow-coral'
                        : 'border-line hover:border-coral/40',
                    )}
                  >
                    <TrendingDown className={cn('h-5 w-5 mb-1', side === 'no' ? 'text-coral' : 'text-ink-dim')} />
                    <span className="font-mono text-lg uppercase tracking-wider">No</span>
                    <span className="font-mono text-xs tabular text-ink-dim">{100 - market.yesPrice}%</span>
                  </button>
                </div>

                {/* Amount input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="label-micro">Amount (PREDQ)</span>
                    <div className="flex gap-1">
                      {[10, 50, 100, 250].map((q) => (
                        <button
                          key={q}
                          onClick={() => setAmount(q.toString())}
                          className="px-2 py-0.5 rounded-md border border-line bg-canvas text-xs font-mono text-ink-dim hover:text-ink hover:border-volt transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Input
                    type="number"
                    placeholder="0"
                    min="1"
                    step="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="font-mono text-2xl tabular h-14"
                  />
                </div>

                {/* Potential return */}
                {side && amountPredq >= 1 && (
                  <div className="rounded-xl border border-line bg-canvas p-4 space-y-2">
                    <div className="label-micro">If {side === 'yes' ? 'YES' : 'NO'} wins</div>
                    <div className="font-mono text-xl tabular text-volt">
                      ~{estimateReturn(market, side === 'yes', amountPredq).toFixed(1)} PREDQ
                    </div>
                    <div className="label-micro text-ink-muted">
                      ~{(estimateReturn(market, side === 'yes', amountPredq) / amountPredq).toFixed(2)}x return
                    </div>
                  </div>
                )}

                <Button
                  size="xl"
                  className="w-full"
                  variant={side === 'no' ? 'danger' : 'primary'}
                  disabled={!canBet}
                  loading={busy}
                  onClick={handleBet}
                >
                  {side ? `Bet ${side.toUpperCase()} · ${amountPredq || 0} PREDQ` : 'Pick YES or NO'}
                </Button>
              </div>
            ) : (
              <div className="rounded-3xl border border-line bg-canvas-raised p-8 text-center space-y-4">
                <div className={cn(
                  'inline-flex h-16 w-16 items-center justify-center rounded-full',
                  market.outcome ? 'bg-volt/10 ring-1 ring-volt/40' : 'bg-coral/10 ring-1 ring-coral/40',
                )}>
                  {market.outcome
                    ? <TrendingUp className="h-7 w-7 text-volt" />
                    : <TrendingDown className="h-7 w-7 text-coral" />}
                </div>
                <h3 className="font-display text-3xl tracking-crunch">
                  Resolved: <span className={market.outcome ? 'text-volt' : 'text-coral'}>
                    {market.outcome ? 'YES' : 'NO'}
                  </span>
                </h3>
              </div>
            )}
          </motion.div>

          {/* Stats sidebar */}
          <aside className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-line bg-canvas-raised p-6 space-y-4">
              <div className="label-micro flex items-center gap-2">
                <span className="q-dot" />
                Market stats
              </div>
              <div className="grid grid-cols-2 gap-3">
                <StatBox label="Pool" value={`${formatPredq(market.totalDeposited, { compact: true })} PREDQ`} />
                <StatBox label="Bettors" value={market.totalBettors.toString()} />
                <StatBox label="YES price" value={`${market.yesPrice}%`} accent="volt" />
                <StatBox label="NO price" value={`${100 - market.yesPrice}%`} accent="coral" />
              </div>
            </div>

            {/* User position */}
            {(userYes > 0n || userNo > 0n) && (
              <div className="rounded-2xl border border-volt/30 bg-volt/5 p-6 space-y-3">
                <div className="label-micro flex items-center gap-2">
                  <span className="q-dot" />
                  Your position
                </div>
                {userYes > 0n && (
                  <div className="flex items-center justify-between">
                    <span className="label-micro">YES shares</span>
                    <span className="font-mono text-sm tabular text-volt">
                      <EncryptedReveal value={formatPredq(userYes, { compact: true })} duration={600} />
                    </span>
                  </div>
                )}
                {userNo > 0n && (
                  <div className="flex items-center justify-between">
                    <span className="label-micro">NO shares</span>
                    <span className="font-mono text-sm tabular text-coral">
                      <EncryptedReveal value={formatPredq(userNo, { compact: true })} duration={600} />
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-2xl border border-line bg-canvas-raised p-6 space-y-2">
              <div className="label-micro">Creator</div>
              <div className="font-mono text-xs tabular text-ink-dim">
                {shortAddr(market.creator, 8, 6)}
              </div>
              <div className="label-micro mt-3">Contract</div>
              <a
                href={`https://sepolia.etherscan.io/address/${address}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs tabular text-volt hover:underline"
              >
                {shortAddr(address, 8, 6)} ↗
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function StatBox({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'volt' | 'coral';
}) {
  return (
    <div className="rounded-xl border border-line bg-canvas p-3">
      <div className="label-micro mb-1">{label}</div>
      <div className={cn('font-mono text-lg tabular', accent === 'volt' && 'text-volt', accent === 'coral' && 'text-coral')}>
        {value}
      </div>
    </div>
  );
}

function estimateReturn(
  market: { yesReserve: bigint; noReserve: bigint; totalDeposited: bigint; yesPrice: number },
  betYes: boolean,
  amountPredq: number,
): number {
  const amount = amountPredq * 1_000_000;
  const k = Number(market.yesReserve) * Number(market.noReserve);
  let sharesOut: number;

  if (betYes) {
    const newNo = Number(market.noReserve) + amount;
    const newYes = k / newNo;
    sharesOut = Number(market.yesReserve) - newYes;
  } else {
    const newYes = Number(market.yesReserve) + amount;
    const newNo = k / newYes;
    sharesOut = Number(market.noReserve) - newNo;
  }

  // Estimate: if you win, your payout ~ shares * (totalPool + bet) / totalWinShares
  const newTotal = Number(market.totalDeposited) + amount;
  const winReserve = betYes ? (k / (Number(market.noReserve) + amount)) : (k / (Number(market.yesReserve) + amount));
  const totalWinShares = 10_000_000_000 - winReserve;
  if (totalWinShares <= 0) return 0;
  const payout = (sharesOut / totalWinShares) * newTotal;
  return payout / 1_000_000;
}
