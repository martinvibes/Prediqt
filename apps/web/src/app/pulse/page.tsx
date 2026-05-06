'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search } from 'lucide-react';

import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { AuthGate } from '@/components/auth-gate';
import { OnboardingModal } from '@/components/onboarding-modal';
import { RoomCard } from '@/components/room-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QMark } from '@/components/q-mark';
import { usePublicRooms, useMyRooms } from '@/hooks/use-rooms';
import { cn } from '@/lib/utils';

type Tab = 'public' | 'mine';

export default function PulsePage() {
  return (
    <main className="relative min-h-screen flex flex-col">
      <Nav />
      <AuthGate>
        <OnboardingModal />
        <PulseContent />
      </AuthGate>
      <Footer />
    </main>
  );
}

function PulseContent() {
  const [tab, setTab] = useState<Tab>('public');
  const [query, setQuery] = useState('');
  const publicRooms = usePublicRooms();
  const myRooms = useMyRooms();

  const active = tab === 'public' ? publicRooms : myRooms;
  const filtered = active.rooms.filter((r) =>
    query.trim() ? r.name.toLowerCase().includes(query.toLowerCase()) : true,
  );

  return (
    <section className="flex-1 px-6 pt-16 pb-24">
      <div className="mx-auto max-w-[1280px]">
        {/* Editorial header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-8 mb-16">
          <div className="md:col-span-4 space-y-2">
            <div className="label-micro flex items-center gap-2">
              <span className="q-dot" />
              Pulse
            </div>
            <p className="text-ink-dim text-sm pt-2">
              All rooms you can see right now.
            </p>
          </div>
          <h1 className="md:col-span-8 heading-display text-mega">
            What do you{' '}
            <span className="italic text-volt">believe?</span>
          </h1>
        </div>

        {/* Tab switcher + search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-1 p-1 rounded-xl border border-line bg-canvas-raised w-fit">
            <TabButton active={tab === 'public'} onClick={() => setTab('public')}>
              Public
              <span className="ml-2 text-ink-muted text-xs tabular">
                {publicRooms.rooms.length}
              </span>
            </TabButton>
            <TabButton active={tab === 'mine'} onClick={() => setTab('mine')}>
              My rooms
              <span className="ml-2 text-ink-muted text-xs tabular">
                {myRooms.rooms.length}
              </span>
            </TabButton>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-muted" />
              <Input
                placeholder="Search rooms…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 pl-9 w-64"
              />
            </div>
            <Link href="/rooms/new">
              <Button size="md">
                <Plus className="h-3.5 w-3.5" />
                New room
              </Button>
            </Link>
          </div>
        </div>

        {/* Room grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab + filtered.length}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {active.loading ? (
              <SkeletonGrid />
            ) : filtered.length === 0 ? (
              <EmptyState tab={tab} hasQuery={query.trim().length > 0} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((room, i) => (
                  <RoomCard key={room.id.toString()} room={room} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Markets-coming-soon banner — Week 2 */}
        <div className="mt-16 rounded-2xl border border-line bg-canvas-raised p-8 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-3">
              <div className="label-micro flex items-center gap-2">
                <span className="q-dot" />
                Week 2 · Coming next
              </div>
              <h3 className="font-display text-3xl tracking-crunch">
                Markets land inside rooms.
              </h3>
              <p className="text-ink-dim text-sm leading-relaxed">
                Constant-product AMM. YES / NO bets encrypted on-chain. Public price,
                private positions. <span className="text-volt">Real markets — not mock data.</span>
              </p>
            </div>
            <div className="md:col-span-4 flex justify-end">
              <QMark size={56} className="opacity-30" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative px-4 py-1.5 rounded-lg font-mono uppercase tracking-wider text-xs transition-colors',
        active ? 'text-canvas' : 'text-ink-dim hover:text-ink',
      )}
    >
      {active && (
        <motion.div
          layoutId="tab-bg"
          className="absolute inset-0 rounded-lg bg-volt"
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
      <span className="relative">{children}</span>
    </button>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="shimmer-overlay rounded-2xl border border-line bg-canvas-raised p-6 h-44"
        />
      ))}
    </div>
  );
}

function EmptyState({ tab, hasQuery }: { tab: Tab; hasQuery: boolean }) {
  if (hasQuery) {
    return (
      <div className="text-center py-24">
        <p className="text-ink-dim font-mono text-sm">No rooms match.</p>
      </div>
    );
  }
  if (tab === 'mine') {
    return (
      <div className="rounded-2xl border border-dashed border-line p-16 text-center space-y-6">
        <QMark size={48} className="mx-auto opacity-50" />
        <div className="space-y-2 max-w-sm mx-auto">
          <h3 className="font-display text-2xl tracking-crunch">No private rooms yet.</h3>
          <p className="text-ink-dim text-sm">
            Spin up a private room for your team, your friends, or your Discord.
          </p>
        </div>
        <Link href="/rooms/new" className="inline-block">
          <Button size="md">
            <Plus className="h-3.5 w-3.5" />
            Create a room
          </Button>
        </Link>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-dashed border-line p-16 text-center space-y-4">
      <p className="text-ink-dim font-mono text-sm">
        No public rooms found. Has the registry been deployed?
      </p>
    </div>
  );
}
