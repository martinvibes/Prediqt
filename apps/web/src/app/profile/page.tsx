'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Copy, Droplet, Wallet, Activity, Bot, Users } from 'lucide-react';

import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { AuthGate } from '@/components/auth-gate';
import { Button } from '@/components/ui/button';
import { EncryptedReveal } from '@/components/encrypted-reveal';
import { MarketCard } from '@/components/market-card';
import { QMark } from '@/components/q-mark';
import { useAuth } from '@/hooks/use-auth';
import { useCredit } from '@/hooks/use-credit';
import { useMyRooms } from '@/hooks/use-rooms';
import { useAllMarkets, type MarketInfo } from '@/hooks/use-markets';
import { formatPredq, shortAddr } from '@/lib/utils';
import { toast } from '@/components/ui/toaster';

export default function ProfilePage() {
  return (
    <main className="relative min-h-screen flex flex-col">
      <Nav />
      <AuthGate><ProfileContent /></AuthGate>
      <Footer />
    </main>
  );
}

function ProfileContent() {
  const { address } = useAuth();
  const { balance, status, claimFaucet, busy, hasClaimed } = useCredit();
  const myRooms = useMyRooms();
  const { markets: allMarkets } = useAllMarkets();

  // Filter markets where user has bet (creator is a proxy for now — TODO: on-chain check)
  const myBets = allMarkets.filter((m) =>
    address && m.creator.toLowerCase() === address.toLowerCase()
  );

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    toast({ title: 'Address copied', description: address });
  };

  return (
    <section className="flex-1 px-6 pt-16 pb-24">
      <div className="mx-auto max-w-[1280px]">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-line bg-canvas-raised p-8 md:p-12 mb-12"
        >
          <div aria-hidden className="absolute -top-32 -right-20 opacity-[0.06] pointer-events-none">
            <QMark size={400} />
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-12 gap-10 items-end">
            <div className="md:col-span-7 space-y-5">
              <div className="label-micro flex items-center gap-2"><span className="q-dot" />Profile</div>
              <h1 className="heading-display text-mega leading-none">
                <span className="italic text-volt">Forecaster</span><br />
                <span className="font-mono text-3xl tabular text-ink-dim">{shortAddr(address ?? '', 6, 6)}</span>
              </h1>
              <div className="flex items-center gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={copyAddress}>
                  <Copy className="h-3 w-3" />Copy address
                </Button>
                {hasClaimed && (
                  <Button variant="ghost" size="sm" onClick={claimFaucet} loading={busy}>
                    <Droplet className="h-3 w-3" />Faucet · +100 PREDQ
                  </Button>
                )}
              </div>
            </div>
            <div className="md:col-span-5 md:pl-6 md:border-l md:border-line">
              <div className="label-micro mb-3 flex items-center gap-2">
                <Wallet className="h-3 w-3" />Balance
              </div>
              <div className="font-mono text-5xl md:text-6xl tabular leading-none">
                {status === 'decrypted' && balance !== null ? (
                  <EncryptedReveal value={formatPredq(balance, { compact: false })} className="text-volt" duration={1100} />
                ) : status === 'loading' ? (
                  <span className="text-ink-dim">loading…</span>
                ) : (
                  <span className="text-ink-dim">—</span>
                )}
                <span className="text-ink-dim text-2xl ml-3">PREDQ</span>
              </div>
              <p className="label-micro mt-3">Updates after each bet and faucet claim.</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Active bets / created markets */}
          <div className="lg:col-span-8 space-y-5">
            <div className="label-micro flex items-center gap-2">
              <Activity className="h-3.5 w-3.5" />
              Your markets
            </div>
            {myBets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line p-12 text-center space-y-4">
                <QMark size={40} className="mx-auto opacity-40" />
                <p className="text-ink-dim text-sm">
                  Markets you create will appear here. Go to a room and post a question.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myBets.map((m, i) => (
                  <MarketCard key={m.id.toString()} market={m} index={i} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-line bg-canvas-raised p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="label-micro flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" />My rooms
                </div>
                <span className="font-mono text-xs tabular text-ink-dim">{myRooms.rooms.length}</span>
              </div>
              {myRooms.rooms.length === 0 ? (
                <p className="text-ink-dim text-sm">Join a public room or create a private one.</p>
              ) : (
                <div className="space-y-2">
                  {myRooms.rooms.map((r) => (
                    <Link
                      key={r.id.toString()}
                      href={`/rooms/${r.id.toString()}`}
                      className="flex items-center justify-between rounded-lg border border-line bg-canvas p-3 hover:border-volt/40 transition-colors"
                    >
                      <span className="font-display text-lg tracking-crunch">{r.name}</span>
                      <span className="label-micro">{r.memberCount.toString()}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-line bg-canvas-raised p-6">
              <div className="label-micro flex items-center gap-2 mb-3">
                <Bot className="h-3.5 w-3.5" />AI agents
              </div>
              <p className="text-ink-dim text-sm">
                Deploy agents with encrypted strategies. Coming in Week 4.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
