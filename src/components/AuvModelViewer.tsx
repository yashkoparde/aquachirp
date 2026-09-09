import React, { useState, useEffect } from 'react';
import { Box, Layers, RotateCcw, Radio, Sliders, Activity, Power } from 'lucide-react';
import { SonarProfile } from '../types';

interface AuvModelViewerProps {
  depth: number;
  activeProfile: SonarProfile;
}

export const AuvModelViewer: React.FC<AuvModelViewerProps> = ({
  depth,
  activeProfile,
}) => {
  const [isExplodedView, setIsExplodedView] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [rotationAngle, setRotationAngle] = useState(15);
  const [activeSubsystem, setActiveSubsystem] = useState<'hull' | 'electronics' | 'battery' | 'transducer' | 'fins'>('hull');
  const [sonarActive, setSonarActive] = useState(true);

  // Subsystem callout specifications (exact match with user image)
  const subsystemInfo = {
    hull: {
      title: 'Outer hull',
      badge: 'PROPOSED AUV INTEGRATION',
      desc: "Hydrodynamic pressure-tolerant shell that houses and protects the AUV's internal systems.",
    },
    transducer: {
      title: 'Acoustic Transducer Dome',
      badge: 'SONAR TRANSMITTER ARRAY',
      desc: 'Piezo-ceramic array transmitting software-defined LFM chirp waveforms into the ocean water column.',
    },
    electronics: {
      title: 'CHIRPFLEX Payload Board',
      badge: 'DSP & 12-BIT DAC CORE',
      desc: 'High-speed signal synthesizer generating precise frequency sweep pulses with sub-nanosecond phase jitter.',
    },
    battery: {
      title: 'Power Supply Module',
      badge: 'VEHICLE BUS POWER',
      desc: 'High-density LiPo power cell array supplying regulated rails for signal processing and power amplification.',
    },
    fins: {
      title: 'Control Surfaces & Thruster',
      badge: 'PROPULSION & STEERING',
      desc: 'Brushless tail thruster and active fin actuators for depth trajectory control and attitude stabilization.',
    },
  };

  // Auto rotation loop
  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      if (autoRotate) {
        setRotationAngle((prev) => (prev + 0.4) % 360);
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [autoRotate]);

  const currentInfo = subsystemInfo[activeSubsystem];
  const offsetMultiplier = isExplodedView ? 1 : 0;

  return (
    <div className="bg-[#081B26]/95 border border-[#17A9C9]/30 rounded-xl p-5 shadow-2xl relative overflow-hidden select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#17A9C9]/20 mb-4">
        <div>
          <h2 className="font-heading font-extrabold text-base text-white tracking-wide flex items-center gap-2">
            <span>Adaptive Sonar AUV — Explorer</span>
          </h2>
          <p className="text-xs text-[#8FA3B8] font-mono">
            Software-defined sonar transmitter payload · autonomous underwater vehicle
          </p>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setSonarActive(!sonarActive)}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${
              sonarActive 
                ? 'bg-[#17A9C9]/20 text-[#17A9C9] border-[#17A9C9]/40 font-bold' 
                : 'bg-[#0A0E14] text-slate-400 border-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            {sonarActive ? 'Sonar Active' : 'Sonar Muted'}
          </button>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${
              autoRotate 
                ? 'bg-[#17A9C9]/20 text-[#17A9C9] border-[#17A9C9]/40 font-bold' 
                : 'bg-[#0A0E14] text-slate-400 border-slate-800'
            }`}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            {autoRotate ? 'Auto Rotate' : 'Rotate Paused'}
          </button>

          <button
            id="btn-exploded-view"
            onClick={() => setIsExplodedView(!isExplodedView)}
            className={`px-4 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              isExplodedView
                ? 'bg-[#FFB100] text-[#0A0E14] border-[#FFB100] shadow-md shadow-[#FFB100]/20'
                : 'bg-[#17A9C9] text-[#0A0E14] border-[#17A9C9] hover:bg-[#17A9C9]/90'
            }`}
          >
            <Layers className="w-3.5 h-3.5 inline mr-1.5" />
            {isExplodedView ? 'Collapse View' : 'Exploded View'}
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Screen */}
      <div className="relative w-full h-[400px] bg-[#05131C] border border-[#17A9C9]/20 rounded-xl overflow-hidden flex items-center justify-center">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-grid-dense opacity-15 pointer-events-none" />

        {/* Subsystem Callout Card Overlay (Top Left - Matches Image) */}
        <div className="absolute top-4 left-4 z-20 max-w-xs bg-[#092231]/90 border border-[#17A9C9]/40 rounded-xl p-4 shadow-2xl backdrop-blur-md animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-[#17A9C9]/20 text-[#17A9C9] border border-[#17A9C9]/30 tracking-wider">
              {currentInfo.badge}
            </span>
          </div>
          <h3 className="font-heading font-bold text-lg text-white mb-1.5">
            {currentInfo.title}
          </h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed font-sans">
            {currentInfo.desc}
          </p>
        </div>

        {/* Adaptive Sonar Output Telemetry Card Overlay (Bottom Center/Right) */}
        <div className="absolute bottom-4 left-4 z-20 bg-[#092231]/90 border border-[#17A9C9]/40 rounded-xl p-3.5 shadow-2xl backdrop-blur-md font-mono text-xs w-64">
          <span className="text-[10px] font-extrabold text-[#8FA3B8] uppercase block mb-2 tracking-wider">
            ADAPTIVE SONAR OUTPUT
          </span>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Recommended freq:</span>
              <span className="text-[#17A9C9] font-bold">{((activeProfile.startFreqKhz + activeProfile.endFreqKhz) / 2).toFixed(1)} kHz</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Frequency sweep:</span>
              <span className="text-white font-bold">{activeProfile.startFreqKhz}–{activeProfile.endFreqKhz} kHz</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Pulse duration:</span>
              <span className="text-[#FFB100] font-bold">{activeProfile.pulseDurationMs.toFixed(2)} ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Amplitude Vpp:</span>
              <span className="text-emerald-400 font-bold">7.7 Vpp</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-[#17A9C9]/20 flex items-center justify-between text-[10px]">
            <span className="px-2 py-0.5 rounded bg-[#17A9C9]/20 text-[#17A9C9] font-bold">
              {activeProfile.powerMode} POWER
            </span>
            <span className="text-slate-400">Depth: {depth.toFixed(1)}m</span>
          </div>
        </div>

        {/* 3D AUV Vector Graphic (Exact Visual Match to HTML Shell & Modules) */}
        <svg
          viewBox="0 0 900 400"
          className="w-full h-full object-contain cursor-grab active:cursor-grabbing transition-transform duration-300"
        >
          <defs>
            {/* Outer Translucent Hull Glass Shader */}
            <linearGradient id="glassHullGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#17A9C9" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#0284C7" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0B192C" stopOpacity="0.35" />
            </linearGradient>

            {/* Nose Transducer Cap */}
            <radialGradient id="transducerCapGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="60%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#065F46" />
            </radialGradient>

            {/* Internal Components */}
            <linearGradient id="compGradBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            <linearGradient id="compGradGreen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            <filter id="glowPulse" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Sonar Pulse Acoustic Beams Radiating From Nose Cap */}
          {sonarActive && (
            <g transform="translate(680, 200)">
              {[1, 2, 3, 4].map((ring) => (
                <path
                  key={ring}
                  d={`M 0 ${-ring * 20} A ${ring * 25} ${ring * 25} 0 0 1 0 ${ring * 20}`}
                  fill="none"
                  stroke="#34D399"
                  strokeWidth="2.5"
                  strokeOpacity={0.8 - ring * 0.18}
                  strokeDasharray="4 4"
                  className="animate-pulse"
                />
              ))}
            </g>
          )}

          {/* Rotated Assembly Center Group */}
          <g transform={`translate(450, 200) rotate(${Math.sin(rotationAngle * (Math.PI / 180)) * 5}) translate(-450, -200)`}>

            {/* 1. STERN / TAIL PROPULSION & FINS */}
            <g
              transform={`translate(${-offsetMultiplier * 90}, 0)`}
              className="transition-transform duration-500 cursor-pointer"
              onClick={() => setActiveSubsystem('fins')}
            >
              {/* Fins */}
              <polygon points="260,150 210,70 235,70 280,150" fill="#38BDF8" opacity="0.6" />
              <polygon points="260,250 210,330 235,330 280,250" fill="#38BDF8" opacity="0.6" />
              {/* Tail Cone */}
              <path d="M 270 160 L 220 180 L 220 220 L 270 240 Z" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />
            </g>

            {/* 2. INTERNAL ELECTRONICS & POWER MODULES (Visible inside translucent hull) */}
            <g
              transform={`translate(0, ${-offsetMultiplier * 45})`}
              className="transition-transform duration-500 cursor-pointer"
              onClick={() => setActiveSubsystem('electronics')}
            >
              {/* Internal DSP Box (Blue) */}
              <rect x="290" y="170" width="85" height="60" rx="8" fill="url(#compGradBlue)" opacity="0.85" />
              {/* Internal Battery Blocks (Green) */}
              <g onClick={() => setActiveSubsystem('battery')}>
                <rect x="390" y="175" width="55" height="50" rx="6" fill="url(#compGradGreen)" opacity="0.85" />
                <rect x="455" y="175" width="55" height="50" rx="6" fill="url(#compGradGreen)" opacity="0.85" />
                <rect x="520" y="175" width="55" height="50" rx="6" fill="url(#compGradGreen)" opacity="0.85" />
              </g>
            </g>

            {/* 3. MAIN TRANSLUCENT OUTER HULL CANISTER */}
            <g
              transform={`translate(0, ${offsetMultiplier * 35})`}
              className="transition-transform duration-500 cursor-pointer"
              onClick={() => setActiveSubsystem('hull')}
            >
              {/* Outer Cylinder Body */}
              <rect x="270" y="140" width="370" height="120" rx="60" fill="url(#glassHullGrad)" stroke="#17A9C9" strokeWidth="2.5" strokeDasharray="none" />
              <line x1="370" y1="140" x2="370" y2="260" stroke="#17A9C9" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3 3" />
              <line x1="570" y1="140" x2="570" y2="260" stroke="#17A9C9" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3 3" />
            </g>

            {/* 4. NOSE CONE TRANSDUCER DOME (Green cap in HTML visual) */}
            <g
              transform={`translate(${offsetMultiplier * 110}, 0)`}
              className="transition-transform duration-500 cursor-pointer"
              onClick={() => setActiveSubsystem('transducer')}
            >
              <path
                d="M 640 140 C 730 140 730 260 640 260 Z"
                fill="url(#transducerCapGrad)"
                stroke="#34D399"
                strokeWidth="2.5"
                filter="url(#glowPulse)"
              />
              <circle cx="680" cy="200" r="10" fill="#34D399" className="animate-ping" />
            </g>

            {/* Subsystem Hover Label Tooltip */}
            <g transform="translate(640, 120)">
              <rect x="-40" y="-20" width="80" height="22" rx="4" fill="#092231" stroke="#34D399" strokeWidth="1.5" />
              <text x="0" y="-5" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
                {currentInfo.title}
              </text>
            </g>

          </g>
        </svg>

        {/* Interactive Selection Buttons Bottom */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-[#092231]/90 p-1 rounded-lg border border-[#17A9C9]/30 backdrop-blur-md text-[10px] font-mono">
          <button
            onClick={() => setActiveSubsystem('hull')}
            className={`px-2.5 py-1 rounded transition-all ${
              activeSubsystem === 'hull' ? 'bg-[#17A9C9] text-[#0A0E14] font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Outer Hull
          </button>
          <button
            onClick={() => setActiveSubsystem('transducer')}
            className={`px-2.5 py-1 rounded transition-all ${
              activeSubsystem === 'transducer' ? 'bg-[#34D399] text-[#0A0E14] font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Transducer Dome
          </button>
          <button
            onClick={() => setActiveSubsystem('electronics')}
            className={`px-2.5 py-1 rounded transition-all ${
              activeSubsystem === 'electronics' ? 'bg-[#38BDF8] text-[#0A0E14] font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            DSP Electronics
          </button>
          <button
            onClick={() => setActiveSubsystem('battery')}
            className={`px-2.5 py-1 rounded transition-all ${
              activeSubsystem === 'battery' ? 'bg-[#F59E0B] text-[#0A0E14] font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Power Cells
          </button>
        </div>
      </div>
    </div>
  );
};
