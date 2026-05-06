'use client';

import { use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Globe2, Users, Calendar, UserPlus } from 'lucide-react';

import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { AuthGate } from '@/components/auth-gate';
import { Button } from '@/components/ui/button';
import { QMark } from '@/components/q-mark';
import { useRoom } from '@/hooks/use-rooms';
import { useAuth } from '@/hooks/use-auth';
import { RoomType } from '@prediqt/shared';
import { shortAddr } from '@/lib/utils';

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const roomId = (() => {
    try {
      return BigInt(id);
    } catch {
      return null;
    }
  })();

  return (
    <main className="relative min-h-screen flex flex-col">
      <Nav />
      <AuthGate>
        {roomId === null ? (
          <InvalidId />
        ) : (
          <RoomContent roomId={roomId} />
        )}
      </AuthGate>
      <Footer />
    </main>
  );
}

function RoomContent({ roomId }: { roomId: bigint }) {
  const { address } = useAuth();
  const { room, members, loading } = useRoom(roomId);

  if (loading) {
    return (
      <section className="flex-1 px-6 pt-16">
        <div className="mx-auto max-w-[1280px]">
          <div className="shimmer-overlay rounded-3xl border border-line bg-canvas-raised h-72" />
        </div>
      </section>
    );
  }

  if (!room || !room.exists) {
    return (
      <section className="flex-1 px-6 pt-32 text-center">
        <QMark size={48} className="mx-auto opacity-50 mb-6" />
        <h2 className="font-display text-3xl tracking-crunch">Room not found.</h2>
        <Link href="/pulse" className="inline-block mt-6">
          <Button variant="outline">Back to Pulse</Button>
        </Link>
      </section>
    );
  }

  const isPrivate = room.roomType === RoomType.Private;
  const isCreator = address && address.toLowerCase() === room.creator.toLowerCase();
  const Icon = isPrivate ? Lock : Globe2;

  return (
    <section className="flex-1 px-6 pt-16 pb-24">
      <div className="mx-auto max-w-[1280px]">
        <Link
          href="/pulse"
          className="inline-flex items-center gap-2 label-micro hover:text-ink mb-10"
        >
          <ArrowLeft className="h-3 w-3" />
          back to pulse
        </Link>

        {/* Room header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-y-8 mb-16"
        >
          <div className="md:col-span-8 space-y-5">
            <div className="flex items-center gap-3 label-micro">
              <Icon className="h-3 w-3" />
              {isPrivate ? 'Private' : 'Public'} room
              <span className="text-ink-ghost">/</span>
              <span className="text-ink-muted font-mono">#{room.id.toString()}</span>
              {isCreator && (
                <>
                  <span className="text-ink-ghost">/</span>
                  <span className="text-volt">you&apos;re the creator</span>
                </>
              )}
            </div>
            <h1 className="heading-display text-mega">{room.name}</h1>
            {room.description && (
              <p className="text-ink-dim text-base md:text-lg leading-relaxed max-w-[680px]">
                {room.description}
              </p>
            )}
          </div>

          <div className="md:col-span-4 flex md:justify-end items-end">
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              <Stat label="Members" value={room.memberCount.toString()} />
              <Stat label="Markets" value="0" />
            </div>
          </div>
        </motion.div>

        {/* Two-column body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Markets column — Week 2 placeholder */}
          <div className="lg:col-span-8">
            <SectionLabel>Markets</SectionLabel>
            <div className="mt-5 rounded-3xl border border-dashed border-line p-12 md:p-16 text-center space-y-6">
              <QMark size={56} className="mx-auto opacity-40" />
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="font-display text-3xl tracking-crunch">
                  No markets <span className="italic text-ink-dim">yet.</span>
                </h3>
                <p className="text-ink-dim text-sm">
                  Posting markets unlocks in Week 2 — encrypted YES/NO bets on a
                  constant-product AMM.
                </p>
              </div>
              <Button variant="outline" disabled>
                Post a market — coming soon
              </Button>
            </div>
          </div>

          {/* Members column */}
          <aside className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <SectionLabel>Members</SectionLabel>
              {isCreator && isPrivate && (
                <Button size="sm" variant="ghost" disabled>
                  <UserPlus className="h-3 w-3" />
                  Invite
                </Button>
              )}
            </div>
            <div className="rounded-2xl border border-line bg-canvas-raised divide-y divide-line">
              {members.map((m, i) => (
                <motion.div
                  key={m}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar seed={m} />
                    <div>
                      <div className="font-mono text-xs tabular">
                        {shortAddr(m, 6, 4)}
                      </div>
                      {m.toLowerCase() === room.creator.toLowerCase() && (
                        <div className="label-micro text-volt mt-0.5">creator</div>
                      )}
                    </div>
                  </div>
                  {address && m.toLowerCase() === address.toLowerCase() && (
                    <span className="label-micro">you</span>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="rounded-2xl border border-line bg-canvas-raised p-5 space-y-2">
              <div className="label-micro flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                Created
              </div>
              <div className="font-mono text-sm tabular text-ink-dim">
                {new Date(Number(room.createdAt) * 1000).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-canvas-raised p-4">
      <div className="label-micro mb-2">{label}</div>
      <div className="font-mono text-2xl tabular">{value}</div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="label-micro flex items-center gap-2">
      <span className="q-dot" />
      {children}
    </div>
  );
}

function Avatar({ seed }: { seed: string }) {
  // Deterministic 2-color glyph derived from the address.
  const h1 = parseInt(seed.slice(2, 6) || '0', 16);
  const h2 = parseInt(seed.slice(6, 10) || '0', 16);
  const useVolt = h1 % 2 === 0;
  return (
    <div
      className="h-8 w-8 rounded-md grid place-items-center font-mono text-[10px]"
      style={{
        background: useVolt ? 'rgba(217,255,60,0.1)' : 'rgba(255,92,92,0.1)',
        border: `1px solid ${useVolt ? 'rgba(217,255,60,0.3)' : 'rgba(255,92,92,0.3)'}`,
        color: useVolt ? '#D9FF3C' : '#FF5C5C',
      }}
    >
      {((h2 % 0xff) | 0).toString(16).padStart(2, '0').toUpperCase()}
    </div>
  );
}

function InvalidId() {
  return (
    <section className="flex-1 px-6 pt-32 text-center">
      <QMark size={48} className="mx-auto opacity-50 mb-6" />
      <h2 className="font-display text-3xl tracking-crunch">Invalid room id.</h2>
    </section>
  );
}
