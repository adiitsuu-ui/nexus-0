import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, ArrowRight, Loader2, X, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  actionName: string;
  sourceDetails: {
    label: string;
    items: string[];
    totalUsd: number;
  };
  destinationDetails: {
    label: string;
    asset: string;
    estimatedAmount: string;
    destinationAddress: string;
  };
  feeBreakdown: {
    platformFeeUsd: number;
    platformFeePercent: string;
    treasuryAddress: string;
    networkGasUsd: number;
  };
  onExecuteConfirm: () => Promise<void>;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  isOpen,
  onClose,
  title,
  actionName,
  sourceDetails,
  destinationDetails,
  feeBreakdown,
  onExecuteConfirm,
}) => {
  const [step, setStep] = useState<'review' | 'simulating' | 'success'>('review');
  const [txHash, setTxHash] = useState<string>('');

  // Reset state whenever modal is opened
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setStep('review');
      setTxHash('');
    }
  }

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setStep('simulating');
    try {
      await onExecuteConfirm();
      const mockHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setTxHash(mockHash);
      setStep('success');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#8b5cf6'],
      });
    } catch {
      setStep('review');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0b1219]/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#c9a86c]/20 bg-[#141c26] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-[#3dba8b]/10 p-2 text-[#3dba8b] ring-1 ring-[#3dba8b]/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{title}</h3>
              <p className="text-xs text-[#8b98a8]">Atomic pre-flight review · zero custody</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-[#8b98a8] hover:bg-white/5 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {step === 'review' && (
            <>
              {/* Security Banner */}
              <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs text-emerald-300">
                <Lock className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <p>
                  <strong>Atomic Execution Guarantee:</strong> Funds never stay in contract custody. If any price or router step deviates outside slippage bounds, the entire transaction reverts automatically.
                </p>
              </div>

              {/* Asset Flow Preview */}
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-white/5 bg-slate-950/60 p-4">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    {sourceDetails.label}
                  </span>
                  <div className="mt-1 space-y-1">
                    {sourceDetails.items.slice(0, 3).map((item, idx) => (
                      <p key={idx} className="text-xs text-slate-300 font-mono truncate">{item}</p>
                    ))}
                    {sourceDetails.items.length > 3 && (
                      <p className="text-[11px] text-slate-500">+{sourceDetails.items.length - 3} more tokens</p>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-bold text-white">${sourceDetails.totalUsd.toFixed(2)} USD</p>
                </div>

                <div className="border-l border-white/10 pl-4">
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    {destinationDetails.label}
                  </span>
                  <p className="mt-1 text-sm font-bold text-emerald-400 font-mono">
                    {destinationDetails.estimatedAmount} {destinationDetails.asset}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-1 truncate">
                    To: {destinationDetails.destinationAddress.slice(0, 6)}...{destinationDetails.destinationAddress.slice(-4)}
                  </p>
                </div>
              </div>

              {/* Protocol Fee Breakdown */}
              <div className="space-y-2 rounded-xl border border-white/5 bg-slate-950/40 p-3 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>NEXUS-0 Platform Fee ({feeBreakdown.platformFeePercent}):</span>
                  <span className="font-mono text-slate-200">${feeBreakdown.platformFeeUsd.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Direct Treasury Forward:</span>
                  <span className="font-mono text-blue-400">
                    {feeBreakdown.treasuryAddress.slice(0, 6)}...{feeBreakdown.treasuryAddress.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Estimated Network Gas:</span>
                  <span className="font-mono text-slate-200">~${feeBreakdown.networkGasUsd.toFixed(3)}</span>
                </div>
              </div>

              {/* Execute Button */}
              <button
                onClick={handleConfirm}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#c9a86c] px-4 py-3 text-sm font-semibold text-[#0b1219] transition hover:bg-[#d4b57a]"
              >
                <span>{actionName}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}

          {step === 'simulating' && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-400" />
              <div>
                <h4 className="text-base font-semibold text-white">Broadcasting Atomic Transaction...</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Routing through audited aggregators and forwarding protocol fee to treasury.
                </p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-6 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 ring-2 ring-emerald-500/30">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Execution Succeeded!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  All swaps and fee streams settled in a single atomic block.
                </p>
              </div>

              <div className="rounded-xl border border-white/5 bg-slate-950/80 p-3 text-left text-xs font-mono text-slate-400">
                <span className="text-slate-500">Tx Hash:</span>
                <p className="text-emerald-400 truncate select-all">{txHash}</p>
              </div>

              <button
                onClick={onClose}
                className="w-full rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
