import { Contract } from 'ethers';
import { ABIS } from '@prediqt/shared';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { AgentsClient } from './agents-client';
import { getServerProvider, getAddress, getDeployerWallet } from '@/lib/server-contracts';

export const dynamic = 'force-dynamic';

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

async function fetchStatus(): Promise<Status> {
  const provider = getServerProvider();
  const registry = new Contract(getAddress('AgentRegistry'), ABIS.AgentRegistry as any, provider);
  const oracle = new Contract(getAddress('ResolutionOracle'), ABIS.ResolutionOracle as any, provider);

  const ids: bigint[] = await registry.getAllAgentIds();
  const agents: AgentRow[] = [];
  for (const id of ids) {
    const a = await registry.getAgent(id);
    agents.push({
      id: a.id.toString(),
      name: a.name,
      persona: a.persona,
      wallet: a.wallet,
      active: a.active,
      hasKey: !!process.env[`AGENT_KEY_${a.name.toUpperCase()}`],
    });
  }

  const oracleOwner: string = await oracle.owner();
  let operator = '';
  try { operator = getDeployerWallet().address; } catch { /* missing */ }

  return {
    agents,
    oracleOwner,
    agentOperator: operator,
    operatorIsOracleOwner: operator !== '' && oracleOwner.toLowerCase() === operator.toLowerCase(),
    openAiConfigured: !!process.env.OPENAI_API_KEY,
  };
}

export default async function AgentsPage() {
  const status = await fetchStatus();

  return (
    <main className="relative min-h-screen flex flex-col">
      <Nav />
      <section className="flex-1 px-6 pt-16 pb-24">
        <div className="mx-auto max-w-[1100px]">
          <h1 className="heading-display text-mega mb-3">AI agents</h1>
          <p className="text-ink-dim text-base md:text-lg leading-relaxed mb-10 max-w-[680px]">
            Three traders that read every open market and decide whether to bet.
            They live on Sepolia, hold real PREDQ, and lose it when wrong — same
            as you.
          </p>

          <AgentsClient status={status} />
        </div>
      </section>
      <Footer />
    </main>
  );
}
