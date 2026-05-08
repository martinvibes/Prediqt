'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, TrendingUp, TrendingDown, Gavel, Gift, ArrowUpRight } from 'lucide-react';

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
import { ConfirmDialog } from '@/components/confirm-dialog';
import { useMarket, usePlaceBet, useResolveMarket, useClaimPayout, useOracleOwner, type MarketInfo } from '@/hooks/use-markets';
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
  const { market, userYes, userNo, hasClaimed, loading, refresh } = useMarket(address);
  const { placeBet, busy: betBusy } = usePlaceBet();
  const { resolve, busy: resolveBusy } = useResolveMarket();
  const { claim, busy: claimBusy } = useClaimPayout();
  const oracleOwner = useOracleOwner();
  const [amount, setAmount] = useState('');
  const [side, setSide] = useState<'yes' | 'no' | null>(null);
  const [showResolve, setShowResolve] = useState(false);
  const [showBetConfirm, setShowBetConfirm] = useState(false);
  const [showClaimConfirm, setShowClaimConfirm] = useState(false);

  if (loading) return <div className="flex-1 px-5 pt-12"><div className="mx-auto max-w-[960px]"><div className="skeleton h-64 rounded-2xl" /></div></div>;
  if (!market) return <div className="flex-1 flex items-center justify-center"><QMark size={40} className="opacity-30" /></div>;

  const isOpen = market.status === 0;
  const isResolver = !!(userAddr && oracleOwner && userAddr.toLowerCase() === oracleOwner.toLowerCase());
  const amountPredq = parseFloat(amount) || 0;
  const amountRaw = BigInt(Math.floor(amountPredq * 1_000_000));
  const canBet = isOpen && side && amountPredq >= 1 && !betBusy;
  const hasPosition = userYes > 0n || userNo > 0n;
  const winningShares = !isOpen ? (market.outcome ? userYes : userNo) : 0n;
  const losingShares = !isOpen ? (market.outcome ? userNo : userYes) : 0n;
  const won = winningShares > 0n;
  const lost = !won && losingShares > 0n;
  const est = side && amountPredq >= 1 ? estimateReturn(market, side === 'yes', amountPredq) : null;
  const isUp = market.yesPrice >= 50;

  const handleBet = async () => {
    if (!canBet) return;
    setShowBetConfirm(false);
    try { await placeBet(address, side === 'yes', amountRaw); setAmount(''); setSide(null); refresh(); } catch {}
  };

  const handleClaim = async () => {
    setShowClaimConfirm(false);
    try { await claim(address); refresh(); } catch {}
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
          <div className="flex items-end justify-between gap-6 mb-4">
            <div className="flex items-baseline gap-3">
              <span className={cn('font-mono text-6xl tabular font-bold tracking-tightest', isUp ? 'text-up' : 'text-down')}>
                {market.yesPrice.toFixed(1)}%
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
                      <button key={s} onClick={() => setSide(s)}
                        className={cn(
                          'flex flex-col items-center justify-center h-20 rounded-xl border-2 transition-all duration-200',
                          active ? isYes ? 'border-up bg-up-dim' : 'border-down bg-down-dim' : 'border-line hover:border-line-strong',
                        )}>
                        {isYes ? <TrendingUp className={cn('h-5 w-5 mb-1', active ? 'text-up' : 'text-ink-ghost')} /> : <TrendingDown className={cn('h-5 w-5 mb-1', active ? 'text-down' : 'text-ink-ghost')} />}
                        <span className="font-mono text-sm uppercase tracking-[0.12em]">{s}</span>
                        <span className="font-mono text-[11px] tabular text-ink-ghost">{(isYes ? market.yesPrice : 100 - market.yesPrice).toFixed(1)}%</span>
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
                  <div className={cn('rounded-xl p-4 space-y-1',
                    side === 'yes' ? 'bg-up-dim border border-up/20' : 'bg-down-dim border border-down/20',
                  )}>
                    <div className={cn('label flex items-center gap-1', side === 'yes' ? 'text-up' : 'text-down')}>
                      <Gift className="h-3 w-3" /> If {side} wins
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className={cn('font-mono text-2xl tabular font-semibold', side === 'yes' ? 'text-up' : 'text-down')}>
                        {est.payout.toFixed(1)} PREDQ
                      </span>
                      <span className={cn('font-mono text-sm tabular', est.multiplier >= 1.5 ? (side === 'yes' ? 'text-up' : 'text-down') : 'text-ink-muted')}>
                        {est.multiplier.toFixed(2)}x
                      </span>
                    </div>
                    <div className="label text-ink-ghost">
                      +{est.profit.toFixed(1)} profit · {est.shares.toFixed(1)} shares
                    </div>
                  </div>
                )}

                <Button size="xl" className="w-full" variant={side === 'no' ? 'danger' : 'primary'}
                  disabled={!canBet} onClick={() => setShowBetConfirm(true)}>
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

                {/* Winner — claim button (or already claimed) */}
                {won && !hasClaimed && (
                  <Button size="lg" onClick={() => setShowClaimConfirm(true)} loading={claimBusy}>
                    <Gift className="h-4 w-4" /> Claim payout
                  </Button>
                )}
                {won && hasClaimed && (
                  <div className="label text-up flex items-center justify-center gap-1.5">
                    <Gift className="h-3.5 w-3.5" /> payout claimed
                  </div>
                )}

                {/* Loser — no claim, just an honest message */}
                {lost && (
                  <div className="space-y-1.5 max-w-xs mx-auto">
                    <div className="font-mono text-sm tabular text-down">
                      You picked {market.outcome ? 'NO' : 'YES'}.
                    </div>
                    <div className="label text-ink-muted">
                      Bets are non-refundable. Better luck on the next one.
                    </div>
                  </div>
                )}

                {/* No position at all */}
                {!hasPosition && (
                  <div className="label text-ink-ghost">You did not bet on this market.</div>
                )}
              </div>
            )}
          </motion.div>

          {/* Sidebar */}
          <aside className="lg:col-span-5 space-y-4">
            <div className="surface p-5 space-y-3">
              <div className="label">Stats</div>
              <div className="grid grid-cols-2 gap-2">
                <StatCell label="Pool" value={`${formatPredq(market.totalDeposited, { compact: true })}`} />
                <StatCell label="Bettors" value={market.totalBettors.toString()} />
                <StatCell label="YES" value={`${market.yesPrice.toFixed(1)}%`} color="text-up" />
                <StatCell label="NO" value={`${(100 - market.yesPrice).toFixed(1)}%`} color="text-down" />
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

        {/* ── Resolve dialog ── */}
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

        {/* ── Bet confirmation ── */}
        <ConfirmDialog
          open={showBetConfirm}
          onClose={() => setShowBetConfirm(false)}
          onConfirm={handleBet}
          loading={betBusy}
          icon={side === 'yes' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          title={`Bet ${(side ?? '').toUpperCase()} on this market?`}
          description="This submits an on-chain transaction. Your PREDQ will be transferred to the market contract."
          details={[
            { label: 'Side', value: (side ?? '').toUpperCase(), accent: side === 'yes' ? 'up' : 'down' },
            { label: 'Amount', value: `${amountPredq} PREDQ`, accent: 'volt' },
            { label: 'Current price', value: `${side === 'yes' ? market.yesPrice : 100 - market.yesPrice}%` },
            ...(est ? [
              { label: 'Est. return', value: `${est.payout.toFixed(1)} PREDQ (${est.multiplier.toFixed(2)}x)`, accent: 'up' as const },
            ] : []),
          ]}
          confirmLabel={`Bet ${(side ?? '').toUpperCase()}`}
          confirmVariant={side === 'no' ? 'danger' : 'primary'}
        />

        {/* ── Claim confirmation ── */}
        <ConfirmDialog
          open={showClaimConfirm}
          onClose={() => setShowClaimConfirm(false)}
          onConfirm={handleClaim}
          loading={claimBusy}
          icon={<Gift className="h-5 w-5" />}
          title="Claim your payout?"
          description="Your winnings will be transferred to your wallet."
          details={[
            { label: 'Outcome', value: market.outcome ? 'YES won' : 'NO won', accent: market.outcome ? 'up' : 'down' },
            { label: 'Your YES shares', value: formatPredq(userYes, { compact: true }) },
            { label: 'Your NO shares', value: formatPredq(userNo, { compact: true }) },
          ]}
          confirmLabel="Claim"
        />
      </div>
    </section>
  );
}

function StatCell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg bg-canvas-raised border border-line p-3">
      <div className="label mb-1">{label}</div>
      <div className={cn('font-mono text-lg tabular font-medium', color)}>{value}</div>
    </div>
  );
}

// ── Return estimate ──
// Standard prediction market formula: at probability P, your return = amount / P.
// This is how Polymarket, Kalshi, and Manifold display estimated returns.
// The AMM handles pricing; this shows what you'd win at fair odds.
function estimateReturn(market: MarketInfo, betYes: boolean, amountPredq: number) {
  // Current probability of the chosen side
  const prob = betYes
    ? market.yesPrice / 100
    : (100 - market.yesPrice) / 100;

  if (prob <= 0 || prob >= 1) return { payout: 0, profit: 0, multiplier: 0, shares: 0 };

  // Theoretical return at current odds
  const payout = amountPredq / prob;
  const profit = payout - amountPredq;
  const multiplier = 1 / prob;

  // Shares from AMM (for display)
  const SCALE = 1_000_000;
  const yR = Number(market.yesReserve) / SCALE;
  const nR = Number(market.noReserve) / SCALE;
  const k = yR * nR;
  let shares: number;
  if (betYes) {
    shares = yR - k / (nR + amountPredq);
  } else {
    shares = nR - k / (yR + amountPredq);
  }

  return { payout, profit, multiplier, shares: Math.max(0, shares) };
}
