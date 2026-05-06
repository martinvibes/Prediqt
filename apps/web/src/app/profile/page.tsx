'use client';

import { motion } from 'framer-motion';
import { Copy, Droplet, Wallet, Activity, Bot } from 'lucide-react';

import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { AuthGate } from '@/components/auth-gate';
import { Button } from '@/components/ui/button';
import { EncryptedReveal } from '@/components/encrypted-reveal';
import { QMark } from '@/components/q-mark';
import { useAuth } from '@/hooks/use-auth';
import { useCredit } from '@/hooks/use-credit';
import { useMyRooms } from '@/hooks/use-rooms';
import { formatPredq, shortAddr } from '@/lib/utils';
import { toast } from '@/components/ui/toaster';

export default function ProfilePage() {
  return (
    <main className="relative min-h-screen flex flex-col">
      <Nav />
      <AuthGate>
        <ProfileContent />
      </AuthGate>
      <Footer />
    </main>
  );
}

function ProfileContent() {
  const { address } = useAuth();
  const { balance, status, claimFaucet, busy, hasClaimed } = useCredit();
  const myRooms = useMyRooms();

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    toast({ title: 'Address copied', description: address });
  };

  return (
    <section className="flex-1 px-6 pt-16 pb-24">
      <div className="mx-auto max-w-[1280px]">
        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-line bg-canvas-raised p-8 md:p-12 mb-12"
        >
          <div
            aria-hidden
            className="absolute -top-32 -right-20 opacity-[0.06] pointer-events-none"
          >
            <QMark size={400} />
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-12 gap-10 items-end">
            <div className="md:col-span-7 space-y-5">
              <div className="label-micro flex items-center gap-2">
                <span className="q-dot" />
                Profile
              </div>
              <h1 className="heading-display text-mega leading-none">
                <span className="italic text-volt">Forecaster</span>
                <br />
                <span className="font-mono text-3xl tabular text-ink-dim">
                  {shortAddr(address ?? '', 6, 6)}
                </span>
              </h1>

              <div className="flex items-center gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={copyAddress}>
                  <Copy className="h-3 w-3" />
                  Copy address
                </Button>
                {hasClaimed && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={claimFaucet}
                    loading={busy}
                  >
                    <Droplet className="h-3 w-3" />
                    Faucet · +100 PREDQ
                  </Button>
                )}
              </div>
            </div>

            {/* Balance */}
            <div className="md:col-span-5 md:pl-6 md:border-l md:border-line">
              <div className="label-micro mb-3 flex items-center gap-2">
                <Wallet className="h-3 w-3" />
                Balance · encrypted on-chain
              </div>
              <div className="font-mono text-5xl md:text-6xl tabular leading-none">
                {status === 'decrypted' && balance !== null ? (
                  <>
                    <EncryptedReveal
                      value={formatPredq(balance, { compact: false })}
                      className="text-volt"
                      duration={1100}
                    />
                  </>
                ) : status === 'loading' ? (
                  <span className="text-ink-dim">decrypting…</span>
                ) : (
                  <span className="text-ink-dim">●●●●●</span>
                )}
                <span className="text-ink-dim text-2xl ml-3">PREDQ</span>
              </div>
              <p className="label-micro mt-3">
                Only you can decrypt this. Refresh from the topbar pill.
              </p>
            </div>
          </div>
        </motion.div>

        {/* 3-column sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ProfileSection
            icon={<Activity className="h-3.5 w-3.5" />}
            title="Active bets"
            unlock="Week 2"
            description="When markets ship, your encrypted positions land here."
          />
          <ProfileSection
            icon={<Bot className="h-3.5 w-3.5" />}
            title="AI agents"
            unlock="Week 4"
            description="Deploy agents with encrypted strategies. Even you won't see their prompts."
          />
          <ProfileSection
            icon={<span className="q-dot" />}
            title="My rooms"
            count={myRooms.rooms.length}
            description={
              myRooms.rooms.length === 0
                ? "You're a member of no private rooms yet."
                : 'You belong to these spaces.'
            }
          />
        </div>
      </div>
    </section>
  );
}

function ProfileSection({
  icon,
  title,
  unlock,
  count,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  unlock?: string;
  count?: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-canvas-raised p-6 min-h-[200px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="label-micro flex items-center gap-2">
          {icon}
          {title}
        </div>
        {unlock && <span className="label-micro text-volt/60">unlocks {unlock}</span>}
        {count !== undefined && (
          <span className="font-mono text-xs tabular text-ink-dim">{count}</span>
        )}
      </div>
      <p className="text-ink-dim text-sm leading-relaxed flex-1">{description}</p>
    </div>
  );
}
