import React from 'react';
import { ArrowRight, Waves } from 'lucide-react';

interface LaunchHeroProps {
  onConnectClick: () => void;
}

export const LaunchHero: React.FC<LaunchHeroProps> = ({ onConnectClick }) => {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 flex flex-col items-center text-center select-none">
      {/* Subtle Icon */}
      <div className="w-12 h-12 rounded-xl bg-[#0A0E14] border border-[#17A9C9]/30 flex items-center justify-center text-[#17A9C9] mb-6 shadow-sm">
        <Waves className="w-6 h-6" />
      </div>

      {/* Main Title */}
      <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-[#E8EEF2] tracking-wider mb-3">
        AQUACHIRP
      </h1>

      {/* Subtitle */}
      <p className="text-sm sm:text-base font-mono text-[#17A9C9] tracking-widest uppercase mb-6">
        Software-Defined Sonar Telemetry Platform
      </p>

      {/* Brief Description */}
      <p className="text-sm text-[#8FA3B8] max-w-xl leading-relaxed mb-8">
        Real-time telemetry, oceanographic sensing, adaptive LFM chirp sonar waveform synthesis, and mission logging for autonomous underwater vehicles.
      </p>

      {/* Minimal Action Button */}
      <button
        id="btn-launch-connect"
        onClick={onConnectClick}
        className="px-6 py-3 rounded-lg bg-[#17A9C9] text-[#0A0E14] hover:bg-[#17A9C9]/90 font-heading font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-[#17A9C9]/20"
      >
        <span>Open Sonar Explorer Dashboard</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
