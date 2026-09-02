import React, { useState } from 'react';
import { HeartPulse, ShieldCheck, Clock, UserCheck, Check, AlertCircle, Sparkles, Lock } from 'lucide-react';
import type { DeadMansSwitchConfig } from '../types';
import { INITIAL_DEAD_MAN_CONFIG } from '../lib/mockData';
import { PROTOCOL_CONFIG } from '../lib/constants';

interface DeadMansSwitchProps {
  onArmSuccess: (feeUsd: number) => void;
  onPingSuccess: () => void;
  onTriggerModal: (details: any) => void;
  evmAddress: string;
}

export const DeadMansSwitch: React.FC<DeadMansSwitchProps> = ({
  onArmSuccess,
  onPingSuccess,
  onTriggerModal,
  evmAddress,
}) => {
  const [config, setConfig] = useState<DeadMansSwitchConfig>(INITIAL_DEAD_MAN_CONFIG);
  const [beneficiaryInput, setBeneficiaryInput] = useState<string>(config.beneficiaryAddress);
  const [thresholdDays, setThresholdDays] = useState<number>(config.inactivityThresholdDays);
  const [pingedNotice, setPingedNotice] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(() => Date.now());

  const setupFeeUsd = PROTOCOL_CONFIG.feeRates.deadMansSwitchSetupUsd; // $9.99

  // Calculate days elapsed and remaining
  const msElapsed = currentTime - config.lastHeartbeatTimestamp;
  const daysElapsed = Math.floor(msElapsed / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, config.inactivityThresholdDays - daysElapsed);
  const progressPercent = Math.min(100, Math.round((daysRemaining / config.inactivityThresholdDays) * 100));

  const handlePingHeartbeat = () => {
    const now = Date.now();
    setCurrentTime(now);
    setConfig((prev) => ({
      ...prev,
      lastHeartbeatTimestamp: now,
    }));
    setPingedNotice(true);
    onPingSuccess();
    setTimeout(() => setPingedNotice(false), 3000);
  };

  const handleArmSwitch = () => {
    if (!beneficiaryInput) return;

    onTriggerModal({
      title: 'Arm Non-Custodial Dead Man\'s Switch',
      actionName: 'Initialize Inactivity Testament',
      sourceDetails: {
        label: 'Heartbeat Testament Invariant',
        items: [
          `Protected Owner Vault: ${evmAddress}`,
          `Heartbeat Interval: ${thresholdDays} Days Inactivity Window`,
          `Beneficiary: ${beneficiaryInput}`,
          `Designated Protection: $${config.designatedAssetsUsd.toLocaleString()} USD Assets`,
        ],
        totalUsd: config.designatedAssetsUsd,
      },
      destinationDetails: {
        label: 'Timelocked Beneficiary Rights',
        asset: 'Automated Inheritance Trigger',
        estimatedAmount: 'Unlocked only if heartbeat expires without ping',
        destinationAddress: beneficiaryInput,
      },
      feeBreakdown: {
        platformFeeUsd: setupFeeUsd,
        platformFeePercent: `$${setupFeeUsd.toFixed(2)} One-Time Setup Fee`,
        treasuryAddress: PROTOCOL_CONFIG.defaultEvmTreasury,
        networkGasUsd: 0.42,
      },
      onExecuteConfirm: async () => {
        await new Promise((r) => setTimeout(r, 1400));
        setConfig((prev) => ({
          ...prev,
          isArmed: true,
          beneficiaryAddress: beneficiaryInput,
          inactivityThresholdDays: thresholdDays,
          lastHeartbeatTimestamp: Date.now(),
        }));
        onArmSuccess(setupFeeUsd);
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
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/30">
                <HeartPulse className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white">Cryptographic Dead Man's Switch</h2>
                <p className="text-xs text-slate-400">
                  Non-custodial inheritance testament. Ensure your loved ones receive your assets if you're inactive.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 px-4 py-2 text-xs text-cyan-300">
              <span className="block font-bold">Setup Fee: $9.99 Flat</span>
              <span className="text-[11px] text-slate-400">0.50% execution fee on transfer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Heartbeat Status Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
              <HeartPulse className="h-7 w-7 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Heartbeat Status: Active</h3>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-300 font-bold border border-emerald-500/30">
                  ARMED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Last ping confirmed {daysElapsed} days ago. Inactivity threshold: {config.inactivityThresholdDays} days.
              </p>
            </div>
          </div>

          <button
            onClick={handlePingHeartbeat}
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 text-xs font-bold text-white hover:bg-cyan-500 transition shadow-lg shadow-cyan-600/25"
          >
            {pingedNotice ? <Check className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            <span>{pingedNotice ? 'Heartbeat Refreshed!' : "I'M ALIVE (Ping Heartbeat)"}</span>
          </button>
        </div>

        {/* Countdown Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              <span>Inactivity Countdown:</span>
            </span>
            <span className="font-bold text-cyan-300 text-sm">
              {daysRemaining} Days Remaining Before Beneficiary Unlock
            </span>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-950 border border-white/10 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                daysRemaining > 30 ? 'bg-gradient-to-r from-cyan-500 to-emerald-400' : 'bg-gradient-to-r from-amber-500 to-red-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-500 block">
            Pinging your heartbeat or performing any swap on NEXUS-0 automatically resets this clock to {config.inactivityThresholdDays} days.
          </span>
        </div>
      </div>

      {/* Configuration Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <UserCheck className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Beneficiary & Timeline Settings</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-300 font-bold block mb-1">
                Designated Heir / Beneficiary Address
              </label>
              <input
                type="text"
                value={beneficiaryInput}
                onChange={(e) => setBeneficiaryInput(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Can be a spouse/heir wallet, trusted family multisig, or probate contract.
              </span>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-bold block mb-1">
                Inactivity Expiry Threshold
              </label>
              <select
                value={thresholdDays}
                onChange={(e) => setThresholdDays(Number(e.target.value))}
                aria-label="Inactivity Expiry Threshold"
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value={60}>60 Days Silence</option>
                <option value={90}>90 Days Silence (Quarterly)</option>
                <option value={180}>180 Days Silence (Semi-Annual - Recommended)</option>
                <option value={365}>365 Days Silence (Annual)</option>
              </select>
            </div>

            <button
              onClick={handleArmSwitch}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-slate-800 py-3 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
            >
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span>Update Beneficiary Settings (${setupFeeUsd.toFixed(2)} Fee)</span>
            </button>
          </div>
        </div>

        {/* Protection Invariant & Zero-Custody Explainer */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Lock className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">How NEXUS-0 Testament Works</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">1</span>
              <p>
                <strong>Zero Seed Phrase Exposure:</strong> You never give your private key to any lawyer, custodian, or website. The rules exist purely in smart contract logic.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">2</span>
              <p>
                <strong>30-Day Alert Buffer:</strong> Before beneficiary execution is enabled, the contract enters a 30-day grace window where warning pings are dispatched.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">3</span>
              <p>
                <strong>Fee Monetization:</strong> $9.99 is charged once upon arming. If inheritance is ever claimed, a 0.50% execution fee forwards directly to the protocol treasury.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3 text-[11px] text-cyan-300 flex items-center gap-2 mt-4">
            <AlertCircle className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>Designated Covered Portfolio Value: ~${config.designatedAssetsUsd.toLocaleString()} USD</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DeadMansSwitch;
