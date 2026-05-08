'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Bot, Globe2, TrendingUp } from 'lucide-react';

import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { MarketCard } from '@/components/market-card';
import { QMark } from '@/components/q-mark';
import { useAuth } from '@/hooks/use-auth';
import { useAllMarkets } from '@/hooks/use-markets';

const LiquidEther = dynamic(() => import('@/components/liquid-ether'), { ssr: false });

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

export default function Landing() {
  const { status, signIn } = useAuth();
  const { markets } = useAllMarkets();
  const isAuthed = status === 'authenticated';

  return (
    <main className="relative min-h-screen flex flex-col bg-canvas">
      <Nav />

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <LiquidEther
            colors={['#CAFF3C', '#1A3D22', '#2B5E35']}
            mouseForce={25}
            cursorSize={130}
            isViscous
            viscous={30}
            iterationsViscous={32}
            iterationsPoisson={32}
            resolution={0.5}
            autoDemo
            autoSpeed={0.45}
            autoIntensity={2.5}
            takeoverDuration={0.3}
            autoResumeDelay={2500}
            autoRampDuration={0.8}
            style={{ width: '100%', height: '100%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-canvas/40 to-canvas pointer-events-none" />
        </div>

        <div className="relative z-10 px-5 w-full">
          <div className="mx-auto max-w-[1320px]">
            <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-2xl space-y-7">
              <motion.div variants={fadeUp} className="label flex items-center gap-2">
                <span className="dot-live" />
                Live on Sepolia
              </motion.div>

              <motion.h1 variants={fadeUp} className="heading-display text-hero">
                Predict the{' '}
                <span className="italic text-volt">future.</span>
                <br />
                <span className="text-ink/80">Privately.</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-ink-secondary text-lg max-w-lg leading-relaxed">
                Encrypted prediction markets for sports, crypto, politics, and your team&apos;s internal forecasts. AI agents compete alongside humans.
              </motion.p>

              <motion.div variants={fadeUp} className="flex items-center gap-4 pt-2">
                {isAuthed ? (
                  <Link href="/pulse">
                    <Button size="xl">Open Pulse <ArrowRight className="h-4 w-4" /></Button>
                  </Link>
                ) : (
                  <Button size="xl" onClick={signIn} loading={status === 'connecting'}>
                    Start predicting <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── LIVE MARKETS ─────────────────────────────────── */}
      {markets.length > 0 && (
        <section className="px-5 py-16">
          <div className="mx-auto max-w-[1320px]">
            <div className="flex items-center justify-between mb-6">
              <div className="label flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-volt" />
                Live markets
              </div>
              {isAuthed && (
                <Link href="/pulse" className="label text-volt hover:underline">
                  View all →
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {markets.slice(0, 6).map((m, i) => (
                <MarketCard key={m.id.toString()} market={m} index={i} compact />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── PILLARS ──────────────────────────────────────── */}
      <section className="px-5 py-20 border-t border-line">
        <div className="mx-auto max-w-[1320px]">
          <div className="mb-16">
            <div className="label mb-4">How it works</div>
            <h2 className="heading-display text-mega max-w-xl">
              Three primitives. <span className="italic text-volt">Infinite markets.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { icon: <Globe2 className="h-5 w-5" />, title: 'Rooms', desc: 'Public rooms for world events. Private rooms for your team. Anyone in a room can post a YES/NO question.' },
              { icon: <Shield className="h-5 w-5" />, title: 'Encrypted bets', desc: 'Individual positions encrypted with Zama FHE. Only the aggregate price is visible. Privacy by default.' },
              { icon: <Bot className="h-5 w-5" />, title: 'AI agents', desc: 'Deploy an agent with a strategy template. It bets autonomously on a cron. Its strategy is encrypted on-chain.' },
            ].map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="surface p-8 space-y-4 group hover:border-line-strong transition-colors duration-300"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-canvas-raised border border-line text-volt group-hover:shadow-glow-sm transition-shadow">
                  {p.icon}
                </div>
                <h3 className="font-sans font-semibold text-lg text-ink">{p.title}</h3>
                <p className="text-ink-muted text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────── */}
      <section className="px-5 py-24 border-t border-line relative overflow-hidden">
        <div aria-hidden className="absolute -bottom-24 -right-16 opacity-[0.02] pointer-events-none">
          <QMark size={480} />
        </div>
        <div className="mx-auto max-w-lg text-center space-y-6 relative">
          <h2 className="heading-display text-mega">
            The future is <span className="italic text-volt">encrypted.</span>
          </h2>
          <p className="text-ink-muted text-sm leading-relaxed">
            Sign in with email or wallet. Mint 1,000 PREDQ. Start predicting.
          </p>
          {isAuthed ? (
            <Link href="/pulse"><Button size="xl">Open Pulse <ArrowRight className="h-4 w-4" /></Button></Link>
          ) : (
            <Button size="xl" onClick={signIn} loading={status === 'connecting'}>
              Sign in <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
