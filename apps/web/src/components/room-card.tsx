'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Globe2, Users } from 'lucide-react';
import type { Room } from '@prediqt/shared';
import { RoomType } from '@prediqt/shared';
import { cn } from '@/lib/utils';

export function RoomCard({
  room,
  index = 0,
  href,
}: {
  room: Room;
  index?: number;
  href?: string;
}) {
  const isPrivate = room.roomType === RoomType.Private;
  const Icon = isPrivate ? Lock : Globe2;
  const target = href ?? `/rooms/${room.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.04,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link
        href={target}
        className={cn(
          'group relative block rounded-2xl border border-line bg-canvas-raised p-6',
          'transition-all duration-300',
          'hover:border-volt/40 hover:bg-canvas-raised/80',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        )}
      >
        {/* Hover glow */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at top right, rgba(217,255,60,0.06) 0%, transparent 70%)',
          }}
        />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 label-micro mb-3">
              <Icon className="h-3 w-3" />
              {isPrivate ? 'Private' : 'Public'}
              <span className="text-ink-ghost">/</span>
              <span className="text-ink-muted">#{room.id.toString()}</span>
            </div>
            <h3 className="font-display text-3xl tracking-crunch leading-none mb-2 group-hover:text-volt transition-colors duration-300">
              {room.name}
            </h3>
            {room.description && (
              <p className="text-ink-dim text-sm leading-relaxed line-clamp-2 mb-5">
                {room.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs font-mono tabular text-ink-muted">
              <span className="flex items-center gap-1.5">
                <Users className="h-3 w-3" />
                {room.memberCount.toString()} {room.memberCount === 1 ? 'member' : 'members'}
              </span>
              <span className="text-ink-ghost">·</span>
              <span>0 markets</span>
            </div>
          </div>

          {/* Decorative arrow */}
          <div
            aria-hidden
            className="text-ink-ghost group-hover:text-volt transition-colors duration-300 -mr-1 mt-1"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 5L15 5L15 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M5 15L15 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
