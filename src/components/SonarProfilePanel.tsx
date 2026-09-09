import React from 'react';
import { 
  Radio, 
  Cpu, 
  Sliders, 
  Zap, 
  Activity, 
  Check, 
  Lock, 
  Unlock,
  Layers,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { SonarProfile } from '../types';
import { SONAR_PROFILE_PRESETS } from '../utils/sonarCalculations';

interface SonarProfilePanelProps {
  activeProfile: SonarProfile;
  isManualOverride: boolean;
  onToggleManualOverride: () => void;
  onSelectManualProfile: (profileId: string) => void;
}

export const SonarProfilePanel: React.FC<SonarProfilePanelProps> = ({
  activeProfile,
  isManualOverride,
  onToggleManualOverride,
  onSelectManualProfile,
}) => {
  const bandwidthKhz = Math.abs(activeProfile.endFreqKhz - activeProfile.startFreqKhz);

  const getPowerBadge = (mode: string) => {
    switch (mode) {
      case 'BOOST':
        return { label: 'BOOST (55W)', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
      case 'NOMINAL':
        return { label: 'NOMINAL (28W-34W)', color: 'text-[#17A9C9] bg-[#17A9C9]/10 border-[#17A9C9]/30' };
      case 'ECO_CONSERVE':
        return { label: 'ECO SAFE (7W)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      default:
        return { label: 'LOW POWER (14W)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    }
  };

  const powerBadge = getPowerBadge(activeProfile.powerMode);

  return (
    <div className="bg-[#0B1F3A]/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-xl">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#FFB100]/10 border border-[#FFB100]/30 text-[#FFB100]">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#E8EEF2]">
                ACTIVE TRANSMISSION PROFILE
              </h3>
            </div>
            <p className="text-[11px] text-[#8FA3B8]">
              Adaptive Software-Defined Acoustic Parameter Matrix
            </p>
          </div>
        </div>

        {/* Manual Override Switch */}
        <button
          onClick={onToggleManualOverride}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-all ${
            isManualOverride
              ? 'bg-[#FFB100]/20 text-[#FFB100] border-[#FFB100]/40 shadow-sm'
              : 'bg-[#0A0E14] text-[#8FA3B8] border-slate-800 hover:text-[#17A9C9]'
          }`}
          title={isManualOverride ? 'Manual Override Active' : 'Automatic Adaptive Mode Active'}
        >
          {isManualOverride ? (
            <>
              <Unlock className="w-3.5 h-3.5" />
              <span className="font-mono text-[10px]">MANUAL OVERRIDE</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-[#17A9C9]" />
              <span className="font-mono text-[10px] text-[#17A9C9]">AUTO-ADAPTING</span>
            </>
          )}
        </button>
      </div>

      {/* Main Profile Spotlight Card */}
      <div className="bg-[#0A0E14]/90 rounded-lg p-3.5 border border-[#17A9C9]/30 relative overflow-hidden mb-3">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#17A9C9]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
          <div>
            <h4 className="font-heading font-bold text-sm text-[#E8EEF2] flex items-center gap-2">
              <span>{activeProfile.name}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${powerBadge.color}`}>
                {powerBadge.label}
              </span>
            </h4>
            <p className="text-[11px] text-[#8FA3B8] mt-0.5 line-clamp-2">
              {activeProfile.description}
            </p>
          </div>

          <div className="text-right sm:self-center shrink-0">
            <span className="text-[10px] font-mono text-[#8FA3B8] block">RESOLUTION</span>
            <span className="text-base font-mono font-bold text-[#17A9C9]">
              ΔR ≈ {activeProfile.theoreticalRangeResCm} cm
            </span>
          </div>
        </div>

        {/* Technical Parameter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 border-t border-slate-800/80 text-xs font-mono">
          <div className="bg-[#0B1F3A]/60 p-2 rounded border border-slate-800">
            <span className="text-[10px] text-[#8FA3B8] block">CARRIER SWEEP</span>
            <span className="text-[#E8EEF2] font-semibold text-xs">
              {activeProfile.startFreqKhz} → {activeProfile.endFreqKhz} <span className="text-[10px] text-slate-400">kHz</span>
            </span>
            <span className="text-[10px] text-[#17A9C9] block">Δf = {bandwidthKhz} kHz</span>
          </div>

          <div className="bg-[#0B1F3A]/60 p-2 rounded border border-slate-800">
            <span className="text-[10px] text-[#8FA3B8] block">PULSE WIDTH (τ)</span>
            <span className="text-[#E8EEF2] font-semibold text-xs">
              {activeProfile.pulseDurationMs.toFixed(1)} <span className="text-[10px] text-slate-400">ms</span>
            </span>
            <span className="text-[10px] text-slate-400 block">Duty: {activeProfile.dutyCyclePercent}%</span>
          </div>

          <div className="bg-[#0B1F3A]/60 p-2 rounded border border-slate-800">
            <span className="text-[10px] text-[#8FA3B8] block">SWEEP RATE (k)</span>
            <span className="text-[#E8EEF2] font-semibold text-xs">
              {activeProfile.sweepRateKhzPerMs.toFixed(2)} <span className="text-[10px] text-slate-400">kHz/ms</span>
            </span>
            <span className="text-[10px] text-[#FFB100] block">{activeProfile.waveformType}</span>
          </div>

          <div className="bg-[#0B1F3A]/60 p-2 rounded border border-slate-800">
            <span className="text-[10px] text-[#8FA3B8] block">MAX EST. RANGE</span>
            <span className="text-[#E8EEF2] font-semibold text-xs">
              ~{activeProfile.maxOperationalRangeM} <span className="text-[10px] text-slate-400">m</span>
            </span>
            <span className="text-[10px] text-emerald-400 block">TX: {activeProfile.txPowerWatts}W</span>
          </div>
        </div>
      </div>

      {/* Adaptive Decision Engine Rationale */}
      <div className="bg-[#0A0E14]/70 rounded-lg p-2.5 border border-slate-800 mb-3 flex items-start gap-2.5">
        <div className="p-1 rounded bg-[#17A9C9]/10 text-[#17A9C9] mt-0.5 shrink-0">
          <Zap className="w-3.5 h-3.5" />
        </div>
        <div className="text-xs">
          <span className="font-mono text-[10px] uppercase text-[#8FA3B8] block font-semibold">
            ADAPTIVE DECISION REASONING
          </span>
          <p className="text-[#E8EEF2] text-[11px] leading-relaxed">
            {activeProfile.adaptationReason}
          </p>
        </div>
      </div>

      {/* Profile Selection Matrix */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-[#8FA3B8] uppercase tracking-wider font-mono">
            CHIRPFLEX Software-Defined Profiles
          </span>
          {isManualOverride && (
            <span className="text-[10px] text-[#FFB100] font-mono">
              Click to force profile:
            </span>
          )}
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {Object.values(SONAR_PROFILE_PRESETS).map((preset) => {
            const isSelected = activeProfile.id === preset.id;
            return (
              <button
                key={preset.id}
                disabled={!isManualOverride}
                onClick={() => onSelectManualProfile(preset.id)}
                className={`p-1.5 rounded border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'bg-[#17A9C9]/20 border-[#17A9C9] text-[#E8EEF2] shadow-sm'
                    : isManualOverride
                    ? 'bg-[#0A0E14] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    : 'bg-[#0A0E14]/40 border-slate-800/60 text-slate-500 opacity-60 cursor-default'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[10px]">{preset.code}</span>
                  {isSelected && <Check className="w-3 h-3 text-[#17A9C9]" />}
                </div>
                <div className="text-[9px] font-mono truncate text-[#8FA3B8] mt-1">
                  {preset.startFreqKhz}-{preset.endFreqKhz}k
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
