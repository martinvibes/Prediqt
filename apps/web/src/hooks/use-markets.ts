'use client';

import { useCallback, useEffect, useState } from 'react';
import { Contract, JsonRpcProvider } from 'ethers';
import { useAuth } from './use-auth';
import { getContract, getContractAddress } from '@/lib/contracts';
import { ABIS, SUPPORTED_CHAINS } from '@prediqt/shared';
import { toast } from '@/components/ui/toaster';
import { creditDeduct } from './use-credit';

export interface MarketInfo {
  id: bigint;
  roomId: bigint;
  marketAddress: string;
  question: string;
  creator: string;
  resolveAt: bigint;
  createdAt: bigint;
  yesReserve: bigint;
  noReserve: bigint;
  totalDeposited: bigint;
  totalBettors: number;
  yesPrice: number;
  status: number;
  outcome: boolean;
}

function readProvider() {
  const chainKey = (process.env.NEXT_PUBLIC_CHAIN as 'sepolia' | 'localhost') ?? 'sepolia';
  const chain = SUPPORTED_CHAINS[chainKey];
  const url = chainKey === 'sepolia'
    ? process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ?? chain.rpcUrl : chain.rpcUrl;
  return new JsonRpcProvider(url, chain.chainId);
}

function getMarketContract(addr: string, runner?: any) {
  return new Contract(addr, ABIS.ForecastMarket as any, runner ?? readProvider());
}

async function fetchMarketInfo(factory: Contract, id: bigint): Promise<MarketInfo | null> {
  try {
    const meta = await factory.getMarket(id);
    if (!meta.exists) return null;
    const mc = getMarketContract(meta.market);
    const info = await mc.info();
    return {
      id: BigInt(meta.id), roomId: BigInt(meta.roomId), marketAddress: meta.market,
      question: meta.question, creator: meta.creator,
      resolveAt: BigInt(meta.resolveAt), createdAt: BigInt(meta.createdAt),
      yesReserve: BigInt(info._yesReserve), noReserve: BigInt(info._noReserve),
      totalDeposited: BigInt(info._totalDeposited), totalBettors: Number(info._totalBettors),
      yesPrice: Number(info._yesPrice), status: Number(info._status), outcome: info._outcome,
    };
  } catch (e) { console.error(`[fetchMarketInfo] market ${id}`, e); return null; }
}

export function useRoomMarkets(roomId: bigint | null) {
  const [markets, setMarkets] = useState<MarketInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const refresh = useCallback(async () => {
    if (roomId === null) return;
    try {
      setLoading(true);
      const factory = getContract('MarketFactory', readProvider());
      const ids: bigint[] = await factory.getRoomMarketIds(roomId);
      if (ids.length === 0) { setMarkets([]); return; }
      const results = await Promise.all(ids.map((id) => fetchMarketInfo(factory, id)));
      setMarkets(results.filter(Boolean) as MarketInfo[]);
    } catch (e) { console.error('[useRoomMarkets]', e); } finally { setLoading(false); }
  }, [roomId]);
  useEffect(() => { refresh(); }, [refresh]);
  return { markets, loading, refresh };
}

export function useAllMarkets() {
  const [markets, setMarkets] = useState<MarketInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const factory = getContract('MarketFactory', readProvider());
      const ids: bigint[] = await factory.getAllMarketIds();
      if (ids.length === 0) { setMarkets([]); return; }
      const results = await Promise.all(ids.map((id) => fetchMarketInfo(factory, id)));
      setMarkets(results.filter(Boolean) as MarketInfo[]);
    } catch (e) { console.error('[useAllMarkets]', e); } finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return { markets, loading, refresh };
}

export function useMarket(marketAddress: string | null) {
  const { signer } = useAuth();
  const [market, setMarket] = useState<MarketInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [userYes, setUserYes] = useState<bigint>(0n);
  const [userNo, setUserNo] = useState<bigint>(0n);
  const refresh = useCallback(async () => {
    if (!marketAddress) return;
    try {
      setLoading(true);
      const runner = signer ?? readProvider();
      const factory = getContract('MarketFactory', runner);
      const mc = getMarketContract(marketAddress, runner);
      const info = await mc.info();
      const id = BigInt(info._marketId);
      const meta = await factory.getMarket(id);
      setMarket({
        id, roomId: BigInt(meta.roomId), marketAddress,
        question: meta.question, creator: meta.creator,
        resolveAt: BigInt(meta.resolveAt), createdAt: BigInt(meta.createdAt),
        yesReserve: BigInt(info._yesReserve), noReserve: BigInt(info._noReserve),
        totalDeposited: BigInt(info._totalDeposited), totalBettors: Number(info._totalBettors),
        yesPrice: Number(info._yesPrice), status: Number(info._status), outcome: info._outcome,
      });
      if (signer) {
        const addr = await signer.getAddress();
        const [yes, no] = await Promise.all([mc.yesShares(addr), mc.noShares(addr)]);
        setUserYes(BigInt(yes)); setUserNo(BigInt(no));
      }
    } catch (e) { console.error('[useMarket]', e); } finally { setLoading(false); }
  }, [marketAddress, signer]);
  useEffect(() => { refresh(); }, [refresh]);
  return { market, userYes, userNo, loading, refresh };
}

export function useCreateMarket() {
  const { signer } = useAuth();
  const [busy, setBusy] = useState(false);
  const create = useCallback(
    async (roomId: bigint, question: string, resolveAt: number) => {
      if (!signer) throw new Error('Sign in first');
      setBusy(true);
      try {
        const factory = getContract('MarketFactory', signer);
        const tx = await factory.createMarket(roomId, question, BigInt(resolveAt), '0x0000000000000000000000000000000000000000');
        toast({ title: 'Creating market…', description: 'Submitted to Sepolia.' });
        const receipt = await tx.wait();
        const log = receipt?.logs.find((l: any) => {
          try { return factory.interface.parseLog(l)?.name === 'MarketCreated'; } catch { return false; }
        });
        let newId: bigint | null = null;
        let marketAddr: string | null = null;
        if (log) {
          const parsed = factory.interface.parseLog(log);
          newId = BigInt(parsed!.args.marketId);
          marketAddr = parsed!.args.market;
        }
        toast({ title: 'Market live', description: question.slice(0, 60), variant: 'success' });
        return { id: newId, address: marketAddr, txHash: receipt?.hash };
      } finally { setBusy(false); }
    }, [signer],
  );
  return { create, busy };
}

export function usePlaceBet() {
  const { signer } = useAuth();
  const [busy, setBusy] = useState(false);
  const placeBet = useCallback(
    async (marketAddress: string, betYes: boolean, amount: bigint) => {
      if (!signer) throw new Error('Sign in first');
      setBusy(true);
      try {
        const mc = getMarketContract(marketAddress, signer);
        const tx = await mc.bet(betYes, amount);
        const side = betYes ? 'YES' : 'NO';
        const display = `${Number(amount) / 1_000_000} PREDQ`;
        toast({ title: `Betting ${side}…`, description: display });
        const receipt = await tx.wait();
        // Deduct from the shared credit store
        creditDeduct(amount);
        toast({
          title: `Bet placed — ${side}`, description: display, variant: 'success',
          action: receipt?.hash
            ? { label: 'View tx', href: `https://sepolia.etherscan.io/tx/${receipt.hash}` } : undefined,
        });
        return receipt;
      } catch (e: any) {
        toast({ title: 'Bet failed', description: e?.shortMessage ?? e?.message ?? 'unknown', variant: 'error' });
        throw e;
      } finally { setBusy(false); }
    }, [signer],
  );
  return { placeBet, busy };
}

export function useResolveMarket() {
  const { signer } = useAuth();
  const [busy, setBusy] = useState(false);
  const resolve = useCallback(
    async (marketAddress: string, outcome: boolean) => {
      if (!signer) throw new Error('Sign in first');
      setBusy(true);
      try {
        const mc = getMarketContract(marketAddress, signer);
        const tx = await mc.submitResolution(outcome);
        toast({ title: 'Resolving…', description: `Outcome: ${outcome ? 'YES' : 'NO'}` });
        const receipt = await tx.wait();
        toast({ title: 'Market resolved', description: outcome ? 'YES wins' : 'NO wins', variant: 'success' });
        return receipt;
      } catch (e: any) {
        toast({ title: 'Resolution failed', description: e?.shortMessage ?? e?.message ?? 'unknown', variant: 'error' });
        throw e;
      } finally { setBusy(false); }
    }, [signer],
  );
  return { resolve, busy };
}

export function useClaimPayout() {
  const { signer } = useAuth();
  const [busy, setBusy] = useState(false);
  const claim = useCallback(
    async (marketAddress: string) => {
      if (!signer) throw new Error('Sign in first');
      setBusy(true);
      try {
        const mc = getMarketContract(marketAddress, signer);
        const tx = await mc.claimPayout();
        toast({ title: 'Claiming payout…' });
        const receipt = await tx.wait();
        toast({ title: 'Payout claimed', variant: 'success' });
        return receipt;
      } catch (e: any) {
        toast({ title: 'Claim failed', description: e?.shortMessage ?? e?.message ?? 'unknown', variant: 'error' });
        throw e;
      } finally { setBusy(false); }
    }, [signer],
  );
  return { claim, busy };
}
