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
import { MarketCard } from '@/components/market-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QMark } from '@/components/q-mark';
import { usePublicRooms, useMyRooms } from '@/hooks/use-rooms';
import { useAllMarkets } from '@/hooks/use-markets';
import { cn } from '@/lib/utils';

type Tab = 'markets' | 'rooms' | 'mine';

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
  const [tab, setTab] = useState<Tab>('markets');
  const [query, setQuery] = useState('');
  const publicRooms = usePublicRooms();
  const myRooms = useMyRooms();
  const allMarkets = useAllMarkets();

  const filteredRooms = (tab === 'rooms' ? publicRooms.rooms : myRooms.rooms).filter((r) =>
    query.trim() ? r.name.toLowerCase().includes(query.toLowerCase()) : true,
  );
  const filteredMarkets = allMarkets.markets.filter((m) =>
    query.trim() ? m.question.toLowerCase().includes(query.toLowerCase()) : true,
  );

  return (
    <section className="flex-1 px-6 pt-16 pb-24">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-8 mb-16">
          <div className="md:col-span-4 space-y-2">
            <div className="label-micro flex items-center gap-2">
              <span className="q-dot" />
              Pulse
            </div>
            <p className="text-ink-dim text-sm pt-2">
              Live markets and rooms across the network.
            </p>
          </div>
          <h1 className="md:col-span-8 heading-display text-mega">
            What do you <span className="italic text-volt">believe?</span>
          </h1>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-1 p-1 rounded-xl border border-line bg-canvas-raised w-fit">
            <TabButton active={tab === 'markets'} onClick={() => setTab('markets')}>
              Markets
              <span className="ml-2 text-ink-muted text-xs tabular">{allMarkets.markets.length}</span>
            </TabButton>
            <TabButton active={tab === 'rooms'} onClick={() => setTab('rooms')}>
              Rooms
              <span className="ml-2 text-ink-muted text-xs tabular">{publicRooms.rooms.length}</span>
            </TabButton>
            <TabButton active={tab === 'mine'} onClick={() => setTab('mine')}>
              My rooms
              <span className="ml-2 text-ink-muted text-xs tabular">{myRooms.rooms.length}</span>
            </TabButton>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-muted" />
              <Input
                placeholder={tab === 'markets' ? 'Search markets…' : 'Search rooms…'}
                value={query} onChange={(e) => setQuery(e.target.value)}
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

        <AnimatePresence mode="wait">
          <motion.div
            key={tab + (tab === 'markets' ? filteredMarkets.length : filteredRooms.length)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {tab === 'markets' ? (
              allMarkets.loading ? (
                <SkeletonGrid />
              ) : filteredMarkets.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-line p-16 text-center space-y-6">
                  <QMark size={48} className="mx-auto opacity-50" />
                  <div className="space-y-2 max-w-sm mx-auto">
                    <h3 className="font-display text-2xl tracking-crunch">No markets yet.</h3>
                    <p className="text-ink-dim text-sm">
                      Go to a room and post the first question.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredMarkets.map((m, i) => (
                    <MarketCard key={m.id.toString()} market={m} index={i} />
                  ))}
                </div>
              )
            ) : (
              (() => {
                const loading = tab === 'rooms' ? publicRooms.loading : myRooms.loading;
                return loading ? (
                  <SkeletonGrid />
                ) : filteredRooms.length === 0 ? (
                  <EmptyState tab={tab} hasQuery={query.trim().length > 0} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRooms.map((room, i) => (
                      <RoomCard key={room.id.toString()} room={room} index={i} />
                    ))}
                  </div>
                );
              })()
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function TabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn(
      'relative px-4 py-1.5 rounded-lg font-mono uppercase tracking-wider text-xs transition-colors',
      active ? 'text-canvas' : 'text-ink-dim hover:text-ink',
    )}>
      {active && (
        <motion.div layoutId="tab-bg" className="absolute inset-0 rounded-lg bg-volt"
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} />
      )}
      <span className="relative">{children}</span>
    </button>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="shimmer-overlay rounded-2xl border border-line bg-canvas-raised p-6 h-44" />
      ))}
    </div>
  );
}

function EmptyState({ tab, hasQuery }: { tab: Tab; hasQuery: boolean }) {
  if (hasQuery) return <div className="text-center py-24"><p className="text-ink-dim font-mono text-sm">No rooms match.</p></div>;
  if (tab === 'mine') {
    return (
      <div className="rounded-2xl border border-dashed border-line p-16 text-center space-y-6">
        <QMark size={48} className="mx-auto opacity-50" />
        <div className="space-y-2 max-w-sm mx-auto">
          <h3 className="font-display text-2xl tracking-crunch">No private rooms yet.</h3>
          <p className="text-ink-dim text-sm">Spin up a private room for your team, friends, or community.</p>
        </div>
        <Link href="/rooms/new" className="inline-block"><Button size="md"><Plus className="h-3.5 w-3.5" />Create a room</Button></Link>
      </div>
    );
  }
  return <div className="rounded-2xl border border-dashed border-line p-16 text-center space-y-4"><p className="text-ink-dim font-mono text-sm">No public rooms found. Has the registry been deployed?</p></div>;
}
