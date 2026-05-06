'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wordmark } from './q-mark';
import { useAuth } from '@/hooks/use-auth';
import { Button } from './ui/button';
import { BalancePill } from './balance-pill';
import { shortAddr, cn } from '@/lib/utils';
import { LogOut, Plus } from 'lucide-react';

const NAV_LINKS = [
  { href: '/pulse', label: 'Pulse' },
  { href: '/profile', label: 'Profile' },
];

export function Nav() {
  const pathname = usePathname();
  const { address, status, signIn, signOut } = useAuth();
  const isAuthed = status === 'authenticated';

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link href={isAuthed ? '/pulse' : '/'} className="ring-focus rounded-md">
            <Wordmark />
          </Link>
          {isAuthed && (
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    'px-3 py-1.5 rounded-md font-mono uppercase tracking-wider text-xs transition-colors',
                    pathname?.startsWith(l.href)
                      ? 'text-volt'
                      : 'text-ink-dim hover:text-ink',
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAuthed ? (
            <>
              <Link href="/rooms/new" className="hidden sm:block">
                <Button variant="outline" size="sm">
                  <Plus className="h-3.5 w-3.5" />
                  New room
                </Button>
              </Link>
              <BalancePill />
              <div className="hidden sm:flex items-center gap-2 px-3 h-8 rounded-lg border border-line bg-canvas-raised">
                <span className="block w-1.5 h-1.5 rounded-full bg-volt" />
                <span className="font-mono text-xs tabular text-ink-dim">
                  {shortAddr(address)}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={signIn}
              loading={status === 'connecting'}
            >
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
