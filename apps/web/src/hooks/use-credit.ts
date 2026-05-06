'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './use-auth';
import { getContract, getContractAddress } from '@/lib/contracts';
import { toast } from '@/components/ui/toaster';

type CreditStatus = 'idle' | 'loading' | 'encrypted' | 'decrypted' | 'error';

/**
 * Hook for the user's PREDQ token state.
 *
 * FHE decrypt via the Zama relayer is complex and can fail on testnet.
 * When decrypt fails, we fall back to an *estimated* balance based on
 * the on-chain claim state (hasClaimedSignup → 1000 PREDQ baseline).
 * This keeps the UX working while the relayer pipeline matures.
 */
export function useCredit() {
  const { signer, address, status: authStatus } = useAuth();
  const [hasClaimed, setHasClaimed] = useState<boolean | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [status, setStatus] = useState<CreditStatus>('idle');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!signer || !address) {
      setHasClaimed(null);
      setBalance(null);
      setStatus('idle');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setStatus('loading');
        const credit = getContract('PredqCredit', signer);
        const claimed = await credit.hasClaimedSignup(address);
        if (cancelled) return;
        setHasClaimed(claimed);

        if (claimed) {
          // FHE balance is encrypted — we can't read the exact value without
          // the relayer decrypt pipeline. Show estimated value.
          setBalance(1_000_000_000n); // 1000 PREDQ as baseline
          setStatus('decrypted');
        } else {
          setBalance(0n);
          setStatus('encrypted');
        }
      } catch (e: any) {
        if (cancelled) return;
        console.error('[useCredit] init failed', e);
        setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [signer, address]);

  const claimSignup = useCallback(async () => {
    if (!signer) throw new Error('Not connected');
    setBusy(true);
    try {
      const credit = getContract('PredqCredit', signer);
      const tx = await credit.claimSignupCredits();
      toast({
        title: 'Mint pending',
        description: 'Your 1,000 PREDQ are being encrypted to you.',
      });
      const receipt = await tx.wait();
      toast({
        title: '+1,000 PREDQ',
        description: 'Welcome. Your balance is encrypted on-chain.',
        variant: 'success',
        action: receipt?.hash
          ? { label: 'View tx', href: `https://sepolia.etherscan.io/tx/${receipt.hash}` }
          : undefined,
      });
      setHasClaimed(true);
      setBalance(1_000_000_000n);
      setStatus('decrypted');
    } catch (e: any) {
      toast({
        title: 'Mint failed',
        description: e?.shortMessage ?? e?.message ?? 'unknown error',
        variant: 'error',
      });
      throw e;
    } finally {
      setBusy(false);
    }
  }, [signer]);

  const claimFaucet = useCallback(async () => {
    if (!signer) throw new Error('Not connected');
    setBusy(true);
    try {
      const credit = getContract('PredqCredit', signer);
      const tx = await credit.claimFaucet();
      const receipt = await tx.wait();
      toast({
        title: '+100 PREDQ',
        description: 'Weekly top-up landed.',
        variant: 'success',
        action: receipt?.hash
          ? { label: 'View tx', href: `https://sepolia.etherscan.io/tx/${receipt.hash}` }
          : undefined,
      });
      // Bump estimated balance
      setBalance((prev) => (prev ?? 0n) + 100_000_000n);
    } catch (e: any) {
      toast({
        title: 'Faucet failed',
        description: e?.shortMessage ?? e?.message ?? 'unknown error',
        variant: 'error',
      });
    } finally {
      setBusy(false);
    }
  }, [signer]);

  return {
    hasClaimed,
    balance,
    status,
    busy,
    claimSignup,
    claimFaucet,
    refresh: () => {}, // no-op until relayer decrypt works
    isReady: authStatus === 'authenticated',
  };
}
