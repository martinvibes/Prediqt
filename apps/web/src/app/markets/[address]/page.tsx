'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Users, TrendingUp, TrendingDown, Gavel, Gift, ArrowUpRight } from 'lucide-react';

import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { AuthGate } from '@/components/auth-gate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProbabilityBar } from '@/components/probability-bar';
import { Sparkline } from '@/components/sparkline';
import { EncryptedReveal } from '@/components/encrypted-reveal';
import { QMark } from '@/components/q-mark';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useMarket, usePlaceBet, useResolveMarket, useClaimPayout, type MarketInfo } from '@/hooks/use-markets';
import { useAuth } from '@/hooks/use-auth';
import { relativeTime, formatPredq, shortAddr, cn } from '@/lib/utils';

export default function MarketPage({ params }: { params: { address: string } }) {
  return (
    <main className="relative min-h-screen flex flex-col bg-canvas">
      <Nav />
      <AuthGate><MarketContent address={params.address} /></AuthGate>
      <Footer />
    </main>
  );
}

function MarketContent({ address }: { address: string }) {
  const { address: userAddr } = useAuth();
  const { market, userYes, userNo, loading, refresh } = useMarket(address);
  const { placeBet, busy: betBusy } = usePlaceBet();
  const { resolve, busy: resolveBusy } = useResolveMarket();
  const { claim, busy: claimBusy } = useClaimPayout();
  const [amount, setAmount] = useState('');
  const [side, setSide] = useState<'yes' | 'no' | null>(null);
  const [showResolve, setShowResolve] = useState(false);

  if (loading) return <div className="flex-1 px-5 pt-12"><div className="mx-auto max-w-[960px]"><div className="skeleton h-64 rounded-2xl" /></div></div>;
  if (!market) return <div className="flex-1 flex items-center justify-center"><QMark size={40} className="opacity-30" /></div>;

  const isOpen = market.status === 0;
  const isResolver = userAddr && userAddr.toLowerCase() === market.creator.toLowerCase();
  const amountPredq = parseFloat(amount) || 0;
  const amountRaw = BigInt(Math.floor(amountPredq * 1_000_000));
  const canBet = isOpen && side && amountPredq >= 1 && !betBusy;
  const hasPosition = userYes > 0n || userNo > 0n;
  const est = side && amountPredq >= 1 ? estimateReturn(market, side === 'yes', amountPredq) : null;
  const isUp = market.yesPrice >= 50;

  const handleBet = async () => {
    if (!canBet) return;
    try { await placeBet(address, side === 'yes', amountRaw); setAmount(''); setSide(null); refresh(); } catch {}
  };

  return (
    <section className="flex-1 px-5 pt-8 pb-20">
      <div className="mx-auto max-w-[960px]">
        <Link href={`/rooms/${market.roomId.toString()}`} className="inline-flex items-center gap-1.5 label hover:text-ink transition-colors mb-8">
          <ArrowLeft className="h-3 w-3" /> Back to room
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-2 label mb-3">
            {isOpen ? <><span className="dot-live" /> live</> : <span className="text-ink-ghost">{market.outcome ? 'yes won' : 'no won'}</span>}
            <span className="text-ink-ghost">·</span>
            <Clock className="h-3 w-3" /> {isOpen ? relativeTime(market.resolveAt) : 'settled'}
            {isResolver && isOpen && (
              <button onClick={() => setShowResolve(true)} className="ml-2 text-volt hover:underline flex items-center gap-1">
                <Gavel className="h-3 w-3" /> Resolve
              </button>
            )}
          </div>
          <h1 className="font-display text-stat tracking-crunch mb-5">{market.question}</h1>

          {/* Big probability + sparkline */}
          <div className="flex items-end justify-between gap-6 mb-4">
            <div className="flex items-baseline gap-3">
              <span className={cn('font-mono text-6xl tabular font-bold tracking-tightest', isUp ? 'text-up' : 'text-down')}>
                {market.yesPrice}%
              </span>
              <span className="label">yes</span>
            </div>
            <Sparkline seed={address} currentValue={market.yesPrice} width={140} height={48} />
          </div>
          <ProbabilityBar yesPercent={market.yesPrice} size="lg" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Bet Panel */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-7">
            {isOpen ? (
              <div className="surface p-6 space-y-5">
                <div className="label">Place your bet</div>

                <div className="grid grid-cols-2 gap-2">
                  {(['yes', 'no'] as const).map((s) => {
                    const active = side === s;
                    const isYes = s === 'yes';
                    return (
                      <button
                        key={s}
                        onClick={() => setSide(s)}
                        className={cn(
                          'flex flex-col items-center justify-center h-20 rounded-xl border-2 transition-all duration-200',
                          active
                            ? isYes ? 'border-up bg-up-dim' : 'border-down bg-down-dim'
                            : 'border-line hover:border-line-strong',
                        )}
                      >
                        {isYes ? <TrendingUp className={cn('h-5 w-5 mb-1', active ? 'text-up' : 'text-ink-ghost')} /> : <TrendingDown className={cn('h-5 w-5 mb-1', active ? 'text-down' : 'text-ink-ghost')} />}
                        <span className="font-mono text-sm uppercase tracking-[0.12em]">{s}</span>
                        <span className="font-mono text-[11px] tabular text-ink-ghost">{isYes ? market.yesPrice : 100 - market.yesPrice}%</span>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="label">Amount (PREDQ)</span>
                    <div className="flex gap-1">
                      {[10, 50, 100, 250].map((q) => (
                        <button key={q} onClick={() => setAmount(q.toString())}
                          className="px-2 py-0.5 rounded-md bg-canvas-raised border border-line label hover:border-volt/40 hover:text-volt transition-colors">
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Input type="number" placeholder="0" min="1" step="1" value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="font-mono text-2xl tabular h-14" />
                </div>

                {est && (
                  <div className="rounded-xl bg-up-dim border border-up/20 p-4 space-y-1">
                    <div className="label text-up flex items-center gap-1"><Gift className="h-3 w-3" /> If {side} wins</div>
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-2xl tabular text-up font-semibold">{est.payout.toFixed(1)} PREDQ</span>
                      <span className={cn('font-mono text-sm tabular', est.multiplier >= 2 ? 'text-up' : 'text-ink-muted')}>{est.multiplier.toFixed(2)}x</span>
                    </div>
                    <div className="label text-ink-ghost">+{est.profit.toFixed(1)} profit · {est.shares.toFixed(0)} shares</div>
                  </div>
                )}

                <Button size="xl" className="w-full" variant={side === 'no' ? 'danger' : 'primary'}
                  disabled={!canBet} loading={betBusy} onClick={handleBet}>
                  {side ? `Bet ${side.toUpperCase()} · ${amountPredq || 0} PREDQ` : 'Select YES or NO'}
                </Button>
              </div>
            ) : (
              <div className="surface p-8 text-center space-y-5">
                <div className={cn('inline-flex h-14 w-14 items-center justify-center rounded-full mx-auto', market.outcome ? 'bg-up-dim' : 'bg-down-dim')}>
                  {market.outcome ? <TrendingUp className="h-6 w-6 text-up" /> : <TrendingDown className="h-6 w-6 text-down" />}
                </div>
                <h3 className="font-display text-2xl tracking-crunch">
                  Resolved: <span className={market.outcome ? 'text-up' : 'text-down'}>{market.outcome ? 'YES' : 'NO'}</span>
                </h3>
                {hasPosition && <Button size="lg" onClick={() => claim(address).then(refresh)} loading={claimBusy}><Gift className="h-4 w-4" />Claim payout</Button>}
              </div>
            )}
          </motion.div>

          {/* Sidebar */}
          <aside className="lg:col-span-5 space-y-4">
            <div className="surface p-5 space-y-3">
              <div className="label">Stats</div>
              <div className="grid grid-cols-2 gap-2">
                <Stat label="Pool" value={`${formatPredq(market.totalDeposited, { compact: true })}`} />
                <Stat label="Bettors" value={market.totalBettors.toString()} />
                <Stat label="YES" value={`${market.yesPrice}%`} color="text-up" />
                <Stat label="NO" value={`${100 - market.yesPrice}%`} color="text-down" />
              </div>
            </div>

            {hasPosition && (
              <div className="surface border-volt/20 p-5 space-y-2">
                <div className="label text-volt">Your position</div>
                {userYes > 0n && <div className="flex justify-between"><span className="label">yes shares</span><span className="font-mono text-sm tabular text-up"><EncryptedReveal value={formatPredq(userYes, { compact: true })} duration={600} /></span></div>}
                {userNo > 0n && <div className="flex justify-between"><span className="label">no shares</span><span className="font-mono text-sm tabular text-down"><EncryptedReveal value={formatPredq(userNo, { compact: true })} duration={600} /></span></div>}
              </div>
            )}

            <div className="surface p-5 space-y-2">
              <div className="label">Contract</div>
              <a href={`https://sepolia.etherscan.io/address/${address}`} target="_blank" rel="noreferrer"
                className="font-mono text-[11px] tabular text-volt hover:underline flex items-center gap-1">
                {shortAddr(address, 8, 6)} <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </aside>
        </div>

        <Dialog open={showResolve} onOpenChange={(o) => !o && setShowResolve(false)}>
          <DialogContent className="max-w-sm">
            <DialogTitle>Resolve market</DialogTitle>
            <DialogDescription>Pick the outcome. This is final.</DialogDescription>
            <p className="text-ink-muted text-sm my-4">{market.question}</p>
            <div className="grid grid-cols-2 gap-2">
              <Button size="lg" onClick={() => resolve(address, true).then(() => { setShowResolve(false); refresh(); })} loading={resolveBusy}>
                <TrendingUp className="h-4 w-4" /> YES
              </Button>
              <Button size="lg" variant="danger" onClick={() => resolve(address, false).then(() => { setShowResolve(false); refresh(); })} loading={resolveBusy}>
                <TrendingDown className="h-4 w-4" /> NO
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg bg-canvas-raised border border-line p-3">
      <div className="label mb-1">{label}</div>
      <div className={cn('font-mono text-lg tabular font-medium', color)}>{value}</div>
    </div>
  );
}

const INITIAL_RESERVE = 10_000_000_000;
function estimateReturn(market: MarketInfo, betYes: boolean, amountPredq: number) {
  const amount = amountPredq * 1_000_000;
  const k = Number(market.yesReserve) * Number(market.noReserve);
  let sharesOut: number, winReserve: number;
  if (betYes) {
    const newNo = Number(market.noReserve) + amount;
    const newYes = k / newNo;
    sharesOut = Number(market.yesReserve) - newYes;
    winReserve = newYes;
  } else {
    const newYes = Number(market.yesReserve) + amount;
    const newNo = k / newYes;
    sharesOut = Number(market.noReserve) - newNo;
    winReserve = newNo;
  }
  const newTotal = Number(market.totalDeposited) + amount;
  const totalWinShares = INITIAL_RESERVE - winReserve;
  if (totalWinShares <= 0) return { payout: 0, profit: 0, multiplier: 0, shares: 0 };
  const payout = (sharesOut / totalWinShares) * newTotal / 1_000_000;
  return { payout, profit: payout - amountPredq, multiplier: payout / amountPredq, shares: sharesOut / 1_000_000 };
}
