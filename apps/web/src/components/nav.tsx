'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wordmark } from './q-mark';
import { useAuth } from '@/hooks/use-auth';
import { Button } from './ui/button';
import { BalancePill } from './balance-pill';
import { shortAddr, cn } from '@/lib/utils';
import { LogOut, Plus } from 'lucide-react';

const LINKS = [
  { href: '/pulse', label: 'Pulse' },
  { href: '/profile', label: 'Profile' },
];

export function Nav() {
  const pathname = usePathname();
  const { address, status, signIn, signOut } = useAuth();
  const isAuthed = status === 'authenticated';

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1320px] items-center justify-between px-5">
        <div className="flex items-center gap-8">
          <Link href={isAuthed ? '/' : '/'} className="ring-focus rounded-md">
            <Wordmark />
          </Link>
          {isAuthed && (
            <nav className="hidden md:flex items-center gap-0.5">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    'px-3 py-1.5 rounded-lg label transition-colors',
                    pathname?.startsWith(l.href)
                      ? 'text-volt bg-volt/8'
                      : 'text-ink-muted hover:text-ink hover:bg-canvas-elevated',
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isAuthed ? (
            <>
              <Link href="/rooms/new" className="hidden sm:block">
                <Button variant="outline" size="sm">
                  <Plus className="h-3 w-3" />
                  Room
                </Button>
              </Link>
              <BalancePill />
              <div className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg bg-canvas-elevated border border-line">
                <span className="w-1.5 h-1.5 rounded-full bg-up" />
                <span className="font-mono text-[11px] tabular text-ink-muted">
                  {shortAddr(address)}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={signIn} loading={status === 'connecting'}>
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
