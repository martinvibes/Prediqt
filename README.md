# Prediqt

> Bet on anything, with anyone — privately. From the World Cup final to your office's Q3 ship date, with humans and AI agents predicting side-by-side. Powered by Zama's FHE.

A private prediction market with a "rooms" model. Every bet is encrypted on-chain. Only the aggregate price is public. AI agents bet alongside humans with encrypted strategies.

**Status:** Week 1 — onboarding, PREDQ token (ERC-7984), and room registry are live.
**Network:** Zama FHEVM on Sepolia.

---

## Repository

```
prediqt/
├── apps/
│   └── web/                # Next.js 14 App Router · UI + Web3Auth
└── packages/
    ├── contracts/          # Solidity 0.8.24 + Hardhat + @fhevm/hardhat-plugin
    └── shared/             # ABIs + addresses + shared types
```

---

## Quick start

```bash
# 1. Install
pnpm install

# 2. Compile + test contracts
pnpm contracts:compile
pnpm contracts:test

# 3. Sync ABIs into the shared package (after compile)
pnpm --filter @prediqt/shared sync-abis

# 4. Deploy contracts
#    a) Local hardhat node (separate terminal):
pnpm contracts:node
#    b) Deploy to local:
pnpm contracts:deploy:local
#    OR deploy to Sepolia:
pnpm contracts:deploy:sepolia

# 5. Run the web app
cp apps/web/.env.example apps/web/.env.local
# fill in NEXT_PUBLIC_WEB3AUTH_CLIENT_ID
pnpm web
```

Open http://localhost:3000.

---

## What's in Week 1

| Layer | Delivered |
|---|---|
| **Smart contracts** | `PredqCredit.sol` (ERC-7984 confidential token, 1,000 PREDQ signup mint, weekly faucet, confidential transfers); `RoomRegistry.sol` (public + private rooms, membership, 5 pre-seeded public rooms) |
| **Tests** | Hardhat tests covering signup, faucet cooldown, confidential transfer (over/under-balance), authorized spender, room creation, membership, public/private separation |
| **Web app** | Editorial landing page; Web3Auth sign-in (email/social/wallet); first-run onboarding modal with on-chain mint + reveal animation; Pulse home with public/My-Rooms tabs and live data; Create-Room flow with on-chain submission; Room detail with members; Profile with encrypted balance + faucet |
| **Design system** | Two-tone brand palette (volt #D9FF3C + coral #FF5C5C) on warm-black canvas; Instrument Serif + Geist; Q-mark logo; encrypted-reveal animation; dual-tone probability bar; grain texture overlay; full primitive set (button, card, dialog, input, toast) |

---

## Environment

### `apps/web/.env.local`

```env
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=        # https://dashboard.web3auth.io
NEXT_PUBLIC_CHAIN=sepolia              # or "localhost"
NEXT_PUBLIC_SEPOLIA_RPC_URL=           # optional override
NEXT_PUBLIC_FHEVM_RELAYER=https://relayer.testnet.zama.cloud
```

### `packages/contracts/.env`

```env
PRIVATE_KEY=                           # deployer key (use a fresh wallet)
SEPOLIA_RPC_URL=https://eth-sepolia.public.blastapi.io
ETHERSCAN_API_KEY=                     # optional, for verification
```

---

## How to get a Web3Auth Client ID

1. Go to https://dashboard.web3auth.io
2. Create a "Plug and Play" project
3. Choose **Sapphire Devnet** as the network (free, ideal for development)
4. Add `http://localhost:3000` and your Vercel domain to allowed origins
5. Copy the Client ID into `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID`

---

## How to get test ETH on Sepolia

You need Sepolia ETH for two things:
1. The deployer wallet that runs `deploy:sepolia`
2. Each user wallet, to pay for the signup mint + room creation transactions

Faucets:
- https://www.alchemy.com/faucets/ethereum-sepolia
- https://sepoliafaucet.com
- https://www.infura.io/faucet/sepolia

---

## Architecture (full vision — most lands in later weeks)

```
┌──────────────────────────────────────────────────────────────┐
│  Next.js 14 (apps/web)                                       │
│  Web3Auth → ethers Signer → @zama-fhe/relayer-sdk            │
└────────────┬───────────────────────────────────┬─────────────┘
             │                                   │
             ▼                                   ▼
┌────────────────────┐         ┌───────────────────────────────┐
│  Anthropic API     │         │  Zama FHEVM (Sepolia)         │
│  (Claude — Week 4) │         │  • PredqCredit  ✓ Week 1      │
└────────────────────┘         │  • RoomRegistry ✓ Week 1      │
                               │  • MarketFactory   Week 2     │
                               │  • ForecastMarket  Week 2     │
                               │  • ResolutionOracle Week 3    │
                               │  • AgentRegistry    Week 4    │
                               └───────────────────────────────┘
```

---

## Troubleshooting

- **`No deployment record for chainId X`** — run `pnpm contracts:deploy:sepolia` (or `:local`), then `pnpm --filter @prediqt/shared sync-abis`. The web app reads addresses from `packages/shared/src/deployments/<chainId>.json`.
- **`NEXT_PUBLIC_WEB3AUTH_CLIENT_ID is not set`** — copy `apps/web/.env.example` → `.env.local` and paste in your Web3Auth Client ID.
- **Decryption fails with relayer errors** — make sure the chain is set to `sepolia` and the relayer URL is reachable. Local hardhat does not route through the public relayer.
- **`Already claimed` on signup mint** — that wallet has already claimed. Use a different wallet via Web3Auth (sign out, sign in with a different email/social).

---

## What ships next

- **Week 2:** `MarketFactory` + `ForecastMarket` (constant-product AMM with encrypted positions). Pulse + Market Detail screens become functional.
- **Week 3:** `ResolutionOracle` + payouts. Leaderboard.
- **Week 4:** `AgentRegistry` + Claude-driven agents on Vercel Cron.
- **Week 5:** Demo polish, seed-state, pitch.

---

## License

MIT
