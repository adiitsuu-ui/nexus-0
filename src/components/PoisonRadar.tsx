import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, ShieldCheck, Search, Shield } from 'lucide-react';
import type { AddressPoisonAlert } from '../types';
import { INITIAL_POISON_ALERTS } from '../lib/mockData';
import { PROTOCOL_CONFIG } from '../lib/constants';

interface PoisonRadarProps {
  onVerifySuccess: (feeUsd: number) => void;
  onTriggerModal: (details: any) => void;
  evmAddress: string;
}

export const PoisonRadar: React.FC<PoisonRadarProps> = ({
  onVerifySuccess,
  onTriggerModal,
  evmAddress,
}) => {
  const [alerts, setAlerts] = useState<AddressPoisonAlert[]>(INITIAL_POISON_ALERTS);
  const [testInput, setTestInput] = useState<string>('');
  const [testResult, setTestResult] = useState<{
    status: 'clean' | 'suspicious' | 'idle';
    message: string;
    matchedOriginal?: string;
  }>({ status: 'idle', message: '' });

  const verificationFeeUsd = PROTOCOL_CONFIG.feeRates.poisonRadarFixedUsd; // $1.00

  // Real-time similarity checker
  const handleAnalyzePasted = (input: string) => {
    setTestInput(input);
    if (!input || input.length < 10) {
      setTestResult({ status: 'idle', message: '' });
      return;
    }

    const cleanInput = input.trim().toLowerCase();
    const knownAddress = evmAddress.toLowerCase();

    // Check if starts with same 4 chars and ends with same 4 chars, but middle is different
    const inputPrefix = cleanInput.slice(0, 6);
    const inputSuffix = cleanInput.slice(-4);
    const knownPrefix = knownAddress.slice(0, 6);
    const knownSuffix = knownAddress.slice(-4);

    if (inputPrefix === knownPrefix && inputSuffix === knownSuffix && cleanInput !== knownAddress) {
      setTestResult({
        status: 'suspicious',
        message: 'CRITICAL POISONING ATTEMPT: Look-alike vanity address detected! The middle characters DO NOT MATCH your verified wallet.',
        matchedOriginal: evmAddress,
      });
    } else if (cleanInput === knownAddress) {
      setTestResult({
        status: 'clean',
        message: 'PERFECT MATCH: Exactly matches your verified connected wallet.',
      });
    } else {
      setTestResult({
        status: 'clean',
        message: 'No look-alike poisoning detected. Standard address format confirmed.',
      });
    }
  };

  const handleWhitelistAddress = (alertItem: AddressPoisonAlert) => {
    onTriggerModal({
      title: '🛡️ Whitelist & Cryptographic Verification',
      actionName: 'Verify & Protect Target Address',
      sourceDetails: {
        label: 'Candidate Address for Verification',
        items: [
          `Original Target: ${alertItem.originalAddress}`,
          `Threat Neutralization: Address Poisoning Shield Active`,
        ],
        totalUsd: 0,
      },
      destinationDetails: {
        label: 'Nexus Permanent Whitelist Registry',
        asset: 'Verified Contact NFT / On-Chain Entry',
        estimatedAmount: 'Permanent Spoof Defense Enabled',
        destinationAddress: alertItem.originalAddress,
      },
      feeBreakdown: {
        platformFeeUsd: verificationFeeUsd,
        platformFeePercent: `$${verificationFeeUsd.toFixed(2)} Flat Verification Fee`,
        treasuryAddress: PROTOCOL_CONFIG.defaultEvmTreasury,
        networkGasUsd: 0.12,
      },
      onExecuteConfirm: async () => {
        await new Promise((r) => setTimeout(r, 1200));
        setAlerts((prev) =>
          prev.map((a) => (a.id === alertItem.id ? { ...a, isVerifiedSafe: true } : a))
        );
        onVerifySuccess(verificationFeeUsd);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/30">
                <ShieldAlert className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Clipboard Hijack & Address Poisoning Radar</span>
                  <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-mono text-rose-400 border border-rose-500/20 font-bold">
                    SPOOF SHIELD
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Detect zero-value lookalike vanity spam before you copy-paste and send funds to a scammer.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 px-4 py-2 text-xs text-rose-300">
              <span className="block font-bold">Verification Fee: $1.00</span>
              <span className="text-[11px] text-slate-400">Permanent Whitelist Badge</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Clipboard Paste Tester */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <Search className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Live Address Inspector & Clipboard Test
          </h3>
        </div>

        <div>
          <label className="text-xs text-slate-400 font-medium block mb-1">
            Paste Any Address to Test for Poisoning / Lookalike Traps
          </label>
          <input
            type="text"
            value={testInput}
            onChange={(e) => handleAnalyzePasted(e.target.value)}
            placeholder="Paste address here (e.g. 0x...)"
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>

        {testResult.status === 'suspicious' && (
          <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/40 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
            <div>
              <span className="font-bold text-rose-300 text-xs block">
                {testResult.message}
              </span>
              <span className="text-[11px] text-slate-400 block mt-1 font-mono">
                Original Wallet: {testResult.matchedOriginal}
              </span>
            </div>
          </div>
        )}

        {testResult.status === 'clean' && (
          <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/30 flex items-start gap-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <span>{testResult.message}</span>
          </div>
        )}
      </div>

      {/* Detected Poisoning Attempts List */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Inbound Look-Alike Poison Attacks ({alerts.length})
            </h3>
          </div>
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                alert.isVerifiedSafe
                  ? 'border-emerald-500/30 bg-emerald-950/20'
                  : 'border-rose-500/40 bg-rose-950/20'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">
                    {alert.tokenTransferred}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-mono uppercase ${
                      alert.isVerifiedSafe
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {alert.isVerifiedSafe ? 'WHITELISTED SAFE' : `${alert.similarityScore}% SPOOF SIMILARITY`}
                  </span>
                  <span className="text-[11px] text-slate-500">{alert.detectedAt}</span>
                </div>

                <div className="font-mono text-xs text-slate-300 space-y-0.5">
                  <div>
                    <span className="text-slate-500">Intended Target:</span>{' '}
                    <span className="text-cyan-400">{alert.originalAddress}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Poison Attacker:</span>{' '}
                    <span className="text-rose-400 font-bold">{alert.spoofAddress}</span>
                  </div>
                </div>
              </div>

              <div>
                {alert.isVerifiedSafe ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Verified Contact</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleWhitelistAddress(alert)}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-white transition border border-white/10"
                  >
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>Whitelist Target ($1.00 Fee)</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default PoisonRadar;
