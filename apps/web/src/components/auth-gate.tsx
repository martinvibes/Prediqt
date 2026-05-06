'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { QMark } from './q-mark';
import { Button } from './ui/button';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { status, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'idle') {
      // Don't auto-redirect — user might want to sign in from here.
    }
  }, [status, router]);

  if (status === 'authenticated') return <>{children}</>;

  if (status === 'initializing') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          <QMark size={40} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="text-center space-y-8 max-w-sm">
        <QMark size={56} className="mx-auto" />
        <div className="space-y-3">
          <h2 className="font-display text-3xl tracking-crunch">Sign in to continue</h2>
          <p className="text-ink-dim text-sm">
            Prediqt uses Web3Auth — sign in with email, social, or wallet. Your account is
            a key, not a profile.
          </p>
        </div>
        <Button size="lg" onClick={signIn} loading={status === 'connecting'}>
          Sign in
        </Button>
      </div>
    </div>
  );
}
