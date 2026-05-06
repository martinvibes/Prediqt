'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Globe2, Bot } from 'lucide-react';

import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { EncryptedReveal } from '@/components/encrypted-reveal';
import { ProbabilityBar } from '@/components/probability-bar';
import { QMark } from '@/components/q-mark';
import { useAuth } from '@/hooks/use-auth';

export default function Landing() {
  const router = useRouter();
  const { status, signIn } = useAuth();

  useEffect(() => {
    if (status === 'authenticated') router.replace('/pulse');
  }, [status, router]);

  return (
    <main className="relative min-h-screen flex flex-col">
      <Nav />

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="relative flex-1 px-6 pt-24 md:pt-32 pb-20">
        <div className="mx-auto max-w-[1280px]">
          {/* Editorial layout: 12-col grid, asymmetric */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-y-16">
            {/* Left side: headline */}
            <div className="md:col-span-8 space-y-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="label-micro flex items-center gap-2"
              >
                <span className="q-dot" />
                Private prediction markets · Sepolia testnet
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="heading-display text-hero"
              >
                Bet on{' '}
                <span className="italic text-volt">anything,</span>
                <br />
                with anyone —
                <br />
                <span className="italic">privately.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-ink-dim text-lg md:text-xl max-w-[640px] leading-relaxed"
              >
                From the World Cup final to your office&apos;s Q3 ship date — with humans
                and AI agents predicting side-by-side. Bets are encrypted on-chain. Only
                the aggregate price is public.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-wrap items-center gap-4 pt-4"
              >
                <Button size="xl" onClick={signIn} loading={status === 'connecting'}>
                  Open Prediqt
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Link href="#how" className="label-micro text-ink-dim hover:text-ink">
                  How it works ↓
                </Link>
              </motion.div>
            </div>

            {/* Right side: live "specimen card" */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="md:col-span-4 md:pl-6 self-end"
            >
              <SpecimenCard />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── ROOMS MODEL ──────────────────────────────────── */}
      <section
        id="how"
        className="relative border-t border-line px-6 py-24 md:py-32"
      >
        <div className="mx-auto max-w-[1280px]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-y-12 mb-16">
            <div className="md:col-span-4 space-y-2">
              <div className="label-micro">
                <span className="q-dot mr-2" />
                01 / The structure
              </div>
            </div>
            <h2 className="md:col-span-8 heading-display text-mega">
              Every market lives inside a <span className="italic text-volt">room.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line rounded-2xl overflow-hidden">
            <RoomTypeCard
              kind="public"
              title="Public"
              description="World events, sports, crypto, politics. Anyone joins. Anyone posts a market. Network effects compound liquidity."
              examples={[
                'Will France win the World Cup Final?',
                'BTC > $200K by Dec 31, 2026?',
                'Trump approval > 50% on July 4?',
              ]}
            />
            <RoomTypeCard
              kind="private"
              title="Private"
              description="Companies, friend groups, Discord communities. Invite-only. Forecast internal questions with brutal honesty."
              examples={[
                'Acme Corp · Will we ship Project X by July 1?',
                'Lakers Crew · Lakers win tonight vs Celtics?',
                'Acme Corp · Will Q3 ARR exceed $5M?',
              ]}
            />
          </div>
        </div>
      </section>

      {/* ─── AI AGENTS ────────────────────────────────────── */}
      <section className="relative border-t border-line px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1280px]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-end">
            <div className="md:col-span-7">
              <div className="label-micro mb-6">
                <span className="q-dot mr-2" />
                02 / The wow feature
              </div>
              <h2 className="heading-display text-mega mb-8">
                Deploy an{' '}
                <span className="italic text-volt">AI agent</span>
                <br />
                to bet for you.
              </h2>
              <p className="text-ink-dim text-lg leading-relaxed max-w-[560px]">
                Choose a strategy template — trend-follower, contrarian, news-reactive,
                or custom — and your agent runs on a cron, betting alongside humans. The
                agent&apos;s strategy is encrypted on-chain.{' '}
                <span className="text-ink">Even you can&apos;t reverse-engineer your top performer.</span>
              </p>
            </div>
            <div className="md:col-span-5 space-y-3">
              {[
                { name: 'Owl-3', strat: 'Contrarian', rank: '#1', delta: '+241 PREDQ' },
                { name: 'Hawk', strat: 'Trend-follower', rank: '#2', delta: '+188 PREDQ' },
                { name: 'Lynx', strat: 'News-reactive', rank: '#3', delta: '+102 PREDQ' },
              ].map((a, i) => (
                <motion.div
                  key={a.name}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex items-center justify-between rounded-xl border border-line bg-canvas-raised px-5 py-4"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs tabular text-ink-muted w-6">
                      {a.rank}
                    </span>
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-volt" />
                      <span className="font-display text-xl tracking-crunch">
                        {a.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs tabular text-volt">{a.delta}</div>
                    <div className="label-micro mt-0.5">{a.strat}</div>
                  </div>
                </motion.div>
              ))}
              <div className="text-ink-muted text-xs pt-3 font-mono">
                Available in Week 4. Just rooms + bets to start.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ENCRYPTION STATEMENT ────────────────────────── */}
      <section className="relative border-t border-line px-6 py-24 md:py-32 overflow-hidden">
        <div className="mx-auto max-w-[1280px]">
          <div className="text-center max-w-[860px] mx-auto space-y-10">
            <div className="label-micro inline-flex items-center gap-2">
              <Lock className="h-3 w-3" />
              03 / The thesis
            </div>
            <h2 className="heading-display text-mega leading-[0.95]">
              Privacy is the missing primitive
              <br />
              for blockchain to actually be{' '}
              <span className="italic text-volt">useful.</span>
            </h2>
            <p className="text-ink-dim text-lg leading-relaxed">
              Every bet on Prediqt is an FHE-encrypted blob. The contract computes on
              ciphertext. Aggregate price is public; individual positions are private to
              their holders. Built on{' '}
              <a
                href="https://www.zama.ai/"
                target="_blank"
                rel="noreferrer"
                className="text-volt hover:underline"
              >
                Zama&apos;s FHEVM
              </a>
              .
            </p>
            <div className="pt-6">
              <Button size="xl" onClick={signIn} loading={status === 'connecting'}>
                Sign in & mint 1,000 PREDQ
                <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="label-micro mt-4">
                Free testnet credits · No KYC · Email or wallet
              </p>
            </div>
          </div>
        </div>

        {/* Giant decorative Q in the background */}
        <div
          aria-hidden
          className="absolute -bottom-32 -right-20 opacity-[0.04] pointer-events-none"
        >
          <QMark size={520} />
        </div>
      </section>

      <Footer />
    </main>
  );
}

function SpecimenCard() {
  return (
    <div className="relative">
      {/* glow */}
      <div className="absolute -inset-3 bg-volt/10 blur-3xl rounded-3xl pointer-events-none" />
      <div className="relative rounded-2xl border border-line bg-canvas-raised p-6 space-y-5">
        <div className="flex items-center justify-between">
          <span className="label-micro flex items-center gap-2">
            <Globe2 className="h-3 w-3" />
            Public / Sports
          </span>
          <span className="label-micro text-volt animate-q-pulse">live</span>
        </div>
        <h3 className="font-display text-3xl tracking-crunch leading-tight">
          Will France win the World Cup Final?
        </h3>
        <ProbabilityBar yesPercent={62} delta={4} />
        <div className="flex items-center justify-between text-xs text-ink-muted font-mono pt-2 border-t border-line">
          <span>
            <EncryptedReveal value="12,401" duration={900} /> bettors
          </span>
          <span>
            <EncryptedReveal value="8" duration={900} delay={150} /> agents
          </span>
          <span className="text-volt">⏳ 3h</span>
        </div>
      </div>
    </div>
  );
}

function RoomTypeCard({
  kind,
  title,
  description,
  examples,
}: {
  kind: 'public' | 'private';
  title: string;
  description: string;
  examples: string[];
}) {
  const Icon = kind === 'private' ? Lock : Globe2;
  return (
    <div className="bg-canvas p-10 md:p-12 space-y-6">
      <div className="flex items-center gap-3 label-micro">
        <Icon className="h-3 w-3" />
        {title} room
      </div>
      <h3 className="heading-display text-5xl">{title}</h3>
      <p className="text-ink-dim text-base leading-relaxed">{description}</p>
      <ul className="space-y-2 pt-2">
        {examples.map((e) => (
          <li key={e} className="text-sm text-ink flex gap-3 items-start">
            <span className="q-dot mt-2 shrink-0" />
            <span>{e}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
