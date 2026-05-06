import { cn } from '@/lib/utils';

/**
 * The Prediqt Q mark.
 * The Q's tail is split — a half-volt, half-coral diagonal that mirrors
 * the YES/NO duality of every market. The negative space inside the loop
 * is meant to read as a sealed envelope / crystal ball.
 */
export function QMark({
  className,
  size = 32,
  monochrome = false,
}: {
  className?: string;
  size?: number;
  monochrome?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-label="Prediqt"
    >
      <defs>
        <linearGradient id="q-tail" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={monochrome ? '#F4F4F0' : '#D9FF3C'} />
          <stop offset="50%" stopColor={monochrome ? '#F4F4F0' : '#D9FF3C'} />
          <stop offset="50%" stopColor={monochrome ? '#F4F4F0' : '#FF5C5C'} />
          <stop offset="100%" stopColor={monochrome ? '#F4F4F0' : '#FF5C5C'} />
        </linearGradient>
      </defs>
      {/* Outer ring — the loop of the Q */}
      <circle
        cx="24"
        cy="22"
        r="14"
        stroke={monochrome ? '#F4F4F0' : '#F4F4F0'}
        strokeWidth="2.5"
        fill="none"
      />
      {/* Inner accent — sealed envelope hint */}
      <circle cx="24" cy="22" r="5" fill={monochrome ? '#F4F4F0' : '#D9FF3C'} opacity="0.9" />
      {/* The Q tail — split diagonal */}
      <line
        x1="32"
        y1="30"
        x2="42"
        y2="42"
        stroke="url(#q-tail)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Wordmark — Q mark + "prediqt" lockup */
export function Wordmark({ className }: { className?: string }) {
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <QMark size={22} />
      <span className="font-display text-2xl tracking-crunch text-ink leading-none">
        prediqt
      </span>
    </div>
  );
}
