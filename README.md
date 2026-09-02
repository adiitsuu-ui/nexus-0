# ⚡ NEXUS-0 (Zero-Custody Universal DeFi Gateway)

**NEXUS-0** is an all-in-one, chain-agnostic Web3 terminal built to solve the key bottlenecks crypto traders face during a bull run across **Ethereum, Base, Arbitrum, zkSync, Polygon, BNB Chain, and Solana**.

By adhering strictly to a **Zero-Custody, Atomic-Execution Architecture**, NEXUS-0 eliminates the shared contract pools and honey-pots that attract hackers. User funds are never locked or pooled overnight; transactions execute atomically across audited routing infrastructure; and protocol fees forward directly and immediately to your designated treasury wallets.

---

## 🚀 Key Features & Revenue Streams

| Module | What It Does | Fee Revenue Mechanism |
| :--- | :--- | :--- |
| **🧹 Multi-Chain Dust Sweeper** | Consolidates low-value leftover tokens into native ETH, SOL, or USDC in 1 click. | **2.50%** of swept volume |
| **🪦 Tax-Loss Cremator** | Burns unsellable/rugged tokens to legally realize capital losses for tax write-offs. | Flat **$2.50** per batch |
| **🪙 Solana Rent Reclaimer** | Closes empty Associated Token Accounts and recovers trapped rent (~0.002039 SOL each). | **15.0%** cut of reclaimed SOL |
| **🚨 "Scorched Earth" Panic Evac** | 1-click emergency evacuation to cold storage using Flashbots private mempool. | **0.75%** priority fee (min $5) |
| **⏳ Dead Man's Switch** | Non-custodial estate testament with heartbeat verification to protect lost keys. | **$9.99** setup + **0.50%** exec fee |
| **⛽ Emergency Gas Station** | Instant cross-chain gas refuel (~8s) for wallets stranded with 0 native gas. | Flat **$1.50** per refuel |
| **🎯 Exit Strategy Vault** | Pre-sets non-custodial tiered profit ladders (e.g. 2x, 4x, 10x) to lock in gains. | **0.35%** on executed profit |
| **🤝 Trustless P2P / OTC Escrow** | Direct counterparty swaps for large or illiquid bags without DEX slippage or MEV. | **0.25%** platform fee |
| **📦 Batch Multi-Sender** | Disperse tokens or native gas to hundreds of addresses in a single atomic transaction. | Flat **$1.00** per batch |
| **🛡️ Wallet Revoke Shield** | Scans and resets risky, unlimited token allowances across all connected chains. | Free scan / **$0.50** batch revoke |
| **🪂 Airdrop Radar** | Discovers and 1-click claims retroactive distributions across L2s and Solana. | **3.00%** finder fee on claims |
| **📊 Revenue Cockpit** | Live protocol owner dashboard tracking total volume, cumulative fees, and settings. | Direct-to-Treasury forwarding |

---

## 🔒 Security Architecture: Why It Cannot Be Hacked

1. **Zero-Custody Invariant:** The smart contracts maintain an invariant of `address(this).balance == 0` at the conclusion of every transaction block. There is no pooled liquidity for an attacker to drain.
2. **Atomic Execution:** If any swap, oracle check, or route slips outside user tolerances, the entire transaction reverts automatically. 100% of the funds remain in the user's wallet.
3. **Direct-to-Treasury Streaming:** Fees are not collected in a pool contract waiting to be claimed. They are pushed directly to your hardware cold wallet or Gnosis Safe multisig within the same block.
4. **Client-Side Signatures:** Private keys and seed phrases never leave the user's wallet (MetaMask, Phantom, Ledger).
5. **Battle-Tested Standards:** Built with OpenZeppelin Contracts v5, `ReentrancyGuard`, and audited aggregators (1inch, Uniswap v3, Jupiter, Across, deBridge).

---

## 🛠️ Smart Contracts (`contracts/`)

* **`AegisAtomicRouter.sol`:** Stateless multi-token swap and fee router enforcing `ReentrancyGuard`, exact token pulling, router whitelisting, and direct fee streaming.
* **`AegisTaxCremator.sol`:** Zero-custody disposal contract burning unsellable tokens and generating cryptographic tax-loss certificates.
* **`AegisDeadMansSwitch.sol`:** Timelocked heartbeat and estate inheritance vault with setup fee and execution fee forwarding.
* **`AegisOTCEscrow.sol`:** Trustless P2P deal maker allowing maker/taker negotiation with zero slippage and anytime emergency refund before execution.
* **`AegisDisperse.sol`:** Gas-efficient batch token and native gas multi-sender with flat fee forwarding.

---

## 💻 Getting Started

### Prerequisites
* [Bun](https://bun.sh/) (installed at `~/.bun/bin/bun`) or Node.js 18+

### Running the App Locally

```bash
# Start development server
export PATH="$HOME/.bun/bin:$PATH"
bun dev

# Build for production
bun run build

# Run linter
bun run lint
```

Open `http://localhost:5173` in your browser.

---

## ⚙️ Treasury Configuration

Configure your fee recipient addresses in `src/lib/constants.ts` or directly through the in-app **Revenue Cockpit**:
* **EVM Treasury:** `0x71C67073755129441Cd5426154562473D1b5e589`
* **Solana Treasury:** `NexusZeroTreasurySafeSol77x9PQk4VmW3b1J2n9LzP6e`
