'use client';

import { useState, useTransition } from 'react';
import { Bot, Play, ExternalLink, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { tickAction, type TickActionResult } from './actions';
import { shortAddr, cn } from '@/lib/utils';

interface AgentRow {
  id: string;
  name: string;
  persona: string;
  wallet: string;
  active: boolean;
  hasKey: boolean;
}

interface Status {
  agents: AgentRow[];
  oracleOwner: string;
  agentOperator: string;
  operatorIsOracleOwner: boolean;
  openAiConfigured: boolean;
}

const PALETTE = [
  { color: '#D9FF3C', bg: 'rgba(217,255,60,0.10)', border: 'rgba(217,255,60,0.30)' }, // volt
  { color: '#FF5C5C', bg: 'rgba(255,92,92,0.10)', border: 'rgba(255,92,92,0.30)' },  // crimson
  { color: '#7BD0FF', bg: 'rgba(123,208,255,0.10)', border: 'rgba(123,208,255,0.30)' }, // sky
];

export function AgentsClient({ status }: { status: Status }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<TickActionResult | null>(null);

  const handleTick = () =>
    startTransition(async () => {
      const r = await tickAction();
      setResult(r);
    });

  const allKeysPresent = status.agents.every((a) => a.hasKey);

  return (
    <div className="space-y-8">
      {/* Status row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatusCard
          label="OpenAI key"
          ok={status.openAiConfigured}
          okText="configured"
          badText="missing OPENAI_API_KEY"
        />
        <StatusCard
          label="Agent keys"
          ok={allKeysPresent}
          okText={`${status.agents.filter((a) => a.hasKey).length}/${status.agents.length} loaded`}
          badText="some keys missing"
        />
        <StatusCard
          label="Auto-resolution"
          ok={status.operatorIsOracleOwner}
          okText="enabled — operator owns oracle"
          badText="disabled — operator is not oracle owner"
        />
      </div>

      {/* Action panel */}
      <div className="surface p-6 space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 label">
              <Activity className="h-3 w-3" />
              Manual trigger
            </div>
            <p className="text-ink-dim text-sm max-w-md">
              Runs the same logic as the cron: resolves expired markets and lets each agent
              decide whether to bet on each open market. Idempotent.
            </p>
          </div>
          <Button onClick={handleTick} loading={pending} disabled={pending} size="lg">
            <Play className="h-4 w-4" /> Tick now
          </Button>
        </div>

        {result && <TickResultPanel result={result} />}
      </div>

      {/* Agent list */}
      <div className="space-y-3">
        <div className="label-micro flex items-center gap-2">
          <span className="q-dot" />
          Roster
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {status.agents.map((a, i) => (
            <AgentCard key={a.id} agent={a} palette={PALETTE[i % PALETTE.length]} />
          ))}
        </div>
      </div>

      {/* Wiring details */}
      <details className="rounded-2xl border border-line bg-canvas-raised p-5">
        <summary className="label-micro cursor-pointer text-ink-dim">
          Server wiring
        </summary>
        <div className="mt-4 space-y-2 font-mono text-[11px] tabular text-ink-muted">
          <div>
            <span className="text-ink-ghost">oracle.owner</span>{' '}
            <span className="text-ink">{shortAddr(status.oracleOwner, 8, 6)}</span>
          </div>
          <div>
            <span className="text-ink-ghost">agent operator</span>{' '}
            <span className="text-ink">
              {status.agentOperator ? shortAddr(status.agentOperator, 8, 6) : 'missing key'}
            </span>
          </div>
          {!status.operatorIsOracleOwner && status.agentOperator && (
            <div className="mt-3 p-3 rounded-lg bg-down-dim border border-down/20 text-down text-[12px] font-sans">
              To turn on auto-resolution, run from your wallet (the current oracle owner):
              <code className="block mt-2 p-2 bg-canvas-elevated rounded text-[11px] break-all">
                oracle.transferOwnership({status.agentOperator})
              </code>
            </div>
          )}
        </div>
      </details>
    </div>
  );
}

function StatusCard({
  label,
  ok,
  okText,
  badText,
}: {
  label: string;
  ok: boolean;
  okText: string;
  badText: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        ok ? 'border-up/30 bg-up-dim' : 'border-down/30 bg-down-dim',
      )}
    >
      <div className="label flex items-center gap-1.5 mb-1.5">
        {ok ? (
          <CheckCircle2 className="h-3 w-3 text-up" />
        ) : (
          <AlertTriangle className="h-3 w-3 text-down" />
        )}
        {label}
      </div>
      <div className={cn('font-mono text-xs tabular', ok ? 'text-up' : 'text-down')}>
        {ok ? okText : badText}
      </div>
    </div>
  );
}

function AgentCard({
  agent,
  palette,
}: {
  agent: AgentRow;
  palette: { color: string; bg: string; border: string };
}) {
  return (
    <div
      className="relative rounded-2xl border bg-canvas-raised p-5 space-y-3 overflow-hidden"
      style={{ borderColor: palette.border }}
    >
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-xl grid place-items-center"
          style={{ background: palette.bg, color: palette.color, border: `1px solid ${palette.border}` }}
        >
          <Bot className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-lg tracking-crunch leading-none" style={{ color: palette.color }}>
            {agent.name}
          </div>
          <div className="font-mono text-[10px] tabular text-ink-ghost mt-1 truncate">
            {shortAddr(agent.wallet, 6, 4)}
          </div>
        </div>
        {agent.active && agent.hasKey ? (
          <span className="label text-up flex items-center gap-1">
            <span className="dot-live" /> live
          </span>
        ) : (
          <span className="label text-ink-ghost">paused</span>
        )}
      </div>
      <p className="text-ink-dim text-[12px] leading-relaxed">{agent.persona}</p>
      <a
        href={`https://sepolia.etherscan.io/address/${agent.wallet}`}
        target="_blank"
        rel="noreferrer"
        className="label flex items-center gap-1 hover:text-ink transition-colors"
      >
        view txs <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

function TickResultPanel({ result }: { result: TickActionResult }) {
  if (!result.ok) {
    return (
      <div className="rounded-xl border border-down/30 bg-down-dim p-4 text-down text-sm">
        <div className="label flex items-center gap-1.5 mb-1">
          <AlertTriangle className="h-3 w-3" /> tick failed
        </div>
        <code className="font-mono text-[11px] break-all">{result.error}</code>
      </div>
    );
  }

  const { report } = result;
  const total = report.bets.length + report.skipped.length + report.resolved.length;

  return (
    <div className="rounded-xl border border-line bg-canvas-elevated p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="label-micro">tick complete · {report.ms}ms</div>
        <div className="font-mono text-[11px] tabular text-ink-ghost">{total} actions</div>
      </div>

      {report.resolved.length > 0 && (
        <Section label={`Resolved (${report.resolved.length})`} accent="text-volt">
          {report.resolved.map((r, i) => (
            <Row key={i}>
              <span className="text-ink-dim truncate">{r.question}</span>
              <span className={r.outcome === 'yes' ? 'text-up' : 'text-down'}>{r.outcome.toUpperCase()}</span>
            </Row>
          ))}
        </Section>
      )}

      {report.bets.length > 0 && (
        <Section label={`Bets (${report.bets.length})`} accent="text-up">
          {report.bets.map((b, i) => (
            <Row key={i}>
              <span className="font-medium" style={{ color: '#D9FF3C' }}>{b.agent}</span>
              <span className="text-ink-dim truncate flex-1 mx-2">{b.question}</span>
              <span className={b.side === 'yes' ? 'text-up' : 'text-down'}>
                {b.side.toUpperCase()} {b.amount}
              </span>
              {b.error && <span className="text-down text-[10px] ml-2">err</span>}
            </Row>
          ))}
        </Section>
      )}

      {report.skipped.length > 0 && (
        <Section label={`Skipped (${report.skipped.length})`} accent="text-ink-ghost">
          {report.skipped.slice(0, 8).map((s, i) => (
            <Row key={i}>
              <span className="text-ink-ghost">{s.agent}</span>
              <span className="text-ink-dim truncate flex-1 mx-2">{s.question}</span>
              <span className="text-ink-ghost text-[10px]">{s.reason}</span>
            </Row>
          ))}
          {report.skipped.length > 8 && (
            <div className="label text-ink-ghost">+{report.skipped.length - 8} more</div>
          )}
        </Section>
      )}

      {report.resolveSkipped.length > 0 && (
        <Section label={`Resolve skipped (${report.resolveSkipped.length})`} accent="text-down">
          {report.resolveSkipped.map((r, i) => (
            <Row key={i}>
              <span className="text-ink-dim truncate flex-1">{r.question}</span>
              <span className="text-down text-[10px] ml-2">{r.reason}</span>
            </Row>
          ))}
        </Section>
      )}

      {total === 0 && report.resolveSkipped.length === 0 && (
        <div className="text-ink-ghost text-sm">Nothing to do — all agents already settled their positions.</div>
      )}
    </div>
  );
}

function Section({
  label,
  accent,
  children,
}: {
  label: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className={cn('label-micro', accent)}>{label}</div>
      <div className="space-y-1 font-mono text-[11px] tabular">{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2 py-0.5">{children}</div>;
}
