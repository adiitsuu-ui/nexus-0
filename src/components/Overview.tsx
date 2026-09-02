import React from 'react';
import {
  ShieldCheck,
  Lock,
  Signature,
  Landmark,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import vaultHero from '../assets/vault-hero.jpg';
import { ALL_TOOLS, CATEGORIES, type TabType } from '../lib/navigation';
import type { TreasuryStats } from '../types';

interface OverviewProps {
  stats: TreasuryStats;
  onSelectTool: (id: TabType) => void;
}

const PILLARS = [
  {
    icon: Lock,
    title: 'Zero custody',
    body: 'Every contract ends the block with a zero balance. There is no pooled vault for an attacker to drain.',
  },
  {
    icon: ShieldCheck,
    title: 'Atomic execution',
    body: 'If a route, oracle, or slippage check fails, the entire transaction reverts. Capital stays in your wallet.',
  },
  {
    icon: Signature,
    title: 'Client-side keys',
    body: 'Private keys never leave MetaMask, Phantom, or Ledger. NEXUS-0 cannot sign on your behalf.',
  },
  {
    icon: Landmark,
    title: 'Direct-to-treasury',
    body: 'Protocol fees stream to a designated cold wallet in the same block. No overnight fee pool.',
  },
];

export const Overview: React.FC<OverviewProps> = ({ stats, onSelectTool }) => {
  return (
    <div className="space-y-8 pb-8">
      <section className="relative overflow-hidden rounded-2xl border border-[#c9a86c]/20 min-h-[320px] sm:min-h-[380px]">
        <img
          src={vaultHero}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1219] via-[#0b1219]/88 to-[#0b1219]/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1219] via-transparent to-[#0b1219]/30" />

        <div className="relative z-10 flex h-full flex-col justify-end p-6 sm:p-10 lg:p-12 max-w-3xl">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#c9a86c]/30 bg-[#0b1219]/50 px-3 py-1 text-[11px] font-medium tracking-[0.14em] uppercase text-[#e8d5a3]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3dba8b]" />
            Non-custodial · Mainnet
          </div>
          <h1 className="mt-5 font-display text-[2.1rem] sm:text-5xl leading-[1.12] text-[#f4efe4]">
            Protect capital without
            <br className="hidden sm:block" /> giving up custody.
          </h1>
          <p className="mt-4 max-w-xl text-sm sm:text-[15px] leading-relaxed text-[#c5cdd6]">
            NEXUS-0 is a zero-custody operations gateway. Every action is atomic,
            keys remain in your wallet, and fees settle directly to cold storage —
            never into a shared contract pool.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onSelectTool('security')}
              className="inline-flex items-center gap-2 rounded-lg bg-[#c9a86c] px-4 py-2.5 text-sm font-semibold text-[#0b1219] hover:bg-[#d4b57a] transition"
            >
              Review allowances
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onSelectTool('panic')}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-[#eef2f6] hover:bg-white/10 transition"
            >
              Emergency withdrawal
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric
          label="Volume settled"
          value={`$${(stats.totalVolumeProcessedUsd / 1_000_000).toFixed(2)}M`}
          hint="Atomic, non-custodial"
        />
        <Metric
          label="Transactions"
          value={stats.totalTransactions.toLocaleString()}
          hint="Across 7 networks"
        />
        <Metric label="Custody model" value="Zero" hint="address(this).balance == 0" />
        <Metric label="Key custody" value="Yours" hint="Client-side signatures only" />
      </section>

      <section>
        <div className="mb-4">
          <h2 className="font-display text-2xl text-[#f4efe4]">How your funds stay yours</h2>
          <p className="mt-1 text-sm text-[#8b98a8]">
            Four invariants. No exceptions. This is the security model every module inherits.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article
                key={pillar.title}
                className="glass-panel rounded-xl p-5 h-full"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#c9a86c]/25 bg-[#c9a86c]/10 text-[#c9a86c]">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-white">{pillar.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[#8b98a8]">{pillar.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-[#f4efe4]">Operations</h2>
            <p className="mt-1 text-sm text-[#8b98a8]">
              Sixteen modules. One security model. Select an operation to begin.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {CATEGORIES.map((cat) => {
            const tools = ALL_TOOLS.filter((t) => t.category === cat.id);
            return (
              <div key={cat.id}>
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6d7a8a]">
                  {cat.label}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {tools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => onSelectTool(tool.id)}
                        className="glass-panel glass-panel-interactive rounded-xl p-4 text-left group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-[#c9a86c] border border-white/[0.06]">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-semibold text-white group-hover:text-[#e8d5a3] transition">
                                {tool.label}
                              </span>
                              <span className="text-[10px] font-mono text-[#8b98a8]">{tool.badge}</span>
                            </div>
                            <p className="mt-1 text-[12px] leading-relaxed text-[#8b98a8]">
                              {tool.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="glass-panel-elevated rounded-2xl p-6 sm:p-8">
        <h2 className="font-display text-2xl text-[#f4efe4]">Settlement path</h2>
        <p className="mt-1 text-sm text-[#8b98a8] max-w-2xl">
          Every operation follows the same three-step path. There is no alternative custody flow.
        </p>
        <ol className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'You sign',
              body: 'The payload is assembled in the browser. Your wallet is the only signer.',
            },
            {
              step: '02',
              title: 'It executes atomically',
              body: 'Routers, oracles, and fee forwards run in one transaction. Any failure reverts all of it.',
            },
            {
              step: '03',
              title: 'Funds return home',
              body: 'Outputs land in your address. Fees go to the treasury. The contract holds nothing.',
            },
          ].map((item) => (
            <li key={item.step} className="relative">
              <div className="text-[11px] font-mono tracking-[0.18em] text-[#c9a86c]">{item.step}</div>
              <h3 className="mt-2 text-sm font-semibold text-white">{item.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[#8b98a8]">{item.body}</p>
            </li>
          ))}
        </ol>
        <div className="gold-rule my-6" />
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-[#8b98a8]">
          <span className="inline-flex items-center gap-1.5 text-[#3dba8b]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            OpenZeppelin v5
          </span>
          <span>ReentrancyGuard</span>
          <span>Whitelisted routers</span>
          <span>Ethereum · Base · Arbitrum · Solana · zkSync · Polygon · BNB</span>
        </div>
      </section>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string; hint: string }> = ({
  label,
  value,
  hint,
}) => (
  <div className="glass-panel rounded-xl px-4 py-4">
    <div className="text-[11px] uppercase tracking-[0.14em] text-[#6d7a8a]">{label}</div>
    <div className="mt-1.5 font-display text-2xl sm:text-[1.7rem] text-[#f4efe4] tabular-nums">
      {value}
    </div>
    <div className="mt-1 text-[11px] font-mono text-[#8b98a8]">{hint}</div>
  </div>
);

export default Overview;
