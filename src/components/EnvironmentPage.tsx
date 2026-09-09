import React from 'react';
import { 
  Waves, 
  Thermometer, 
  Eye, 
  Gauge, 
  Sparkles, 
  Compass, 
  Layers, 
  Info,
  CheckCircle2,
  TrendingDown
} from 'lucide-react';
import { EnvironmentalData, SonarProfile } from '../types';

interface EnvironmentPageProps {
  env: EnvironmentalData;
  profile: SonarProfile;
}

export const EnvironmentPage: React.FC<EnvironmentPageProps> = ({
  env,
  profile,
}) => {
  // Generate sample depth curve points for sound velocity profile
  const depthProfilePoints = [
    { depth: 5, temp: 22.0, c: 1526 },
    { depth: 20, temp: 21.2, c: 1524 },
    { depth: 40, temp: 18.5, c: 1516 },
    { depth: 65, temp: 14.2, c: 1502 },
    { depth: 90, temp: 9.8, c: 1488 },
    { depth: 130, temp: 6.5, c: 1476 },
    { depth: 180, temp: 4.8, c: 1471 },
    { depth: 240, temp: 3.9, c: 1472 },
  ];

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-[#0B1F3A]/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-extrabold text-lg text-[#E8EEF2]">
              OCEANOGRAPHIC WATER COLUMN & CTD ANALYSIS
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#17A9C9]/20 text-[#17A9C9] border border-[#17A9C9]/40 font-bold">
              IN-SITU SENSING
            </span>
          </div>
          <p className="text-xs text-[#8FA3B8] font-mono mt-1">
            MacKenzie Sound Velocity Model (1981) • Thermocline Stratification • Turbidity Backscatter
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#0A0E14] px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-500 block text-[10px]">SOUND VELOCITY (c)</span>
            <span className="text-[#17A9C9] font-bold text-sm">{env.soundVelocity.toFixed(1)} m/s</span>
          </div>
          <div className="bg-[#0A0E14] px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-500 block text-[10px]">CURRENT DEPTH</span>
            <span className="text-emerald-400 font-bold text-sm">{env.depth.toFixed(1)} m</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Bathymetric Column + Sound Velocity Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 cols: Water Column Visualizer */}
        <div className="lg:col-span-4 bg-[#0B1F3A]/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h3 className="font-heading font-bold text-sm text-[#E8EEF2] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#17A9C9]" />
              Bathymetric Water Column
            </h3>
            <span className="text-[10px] font-mono text-[#8FA3B8]">0 - 250m Range</span>
          </div>

          {/* Depth Gradient Column */}
          <div className="relative h-80 w-full rounded-lg bg-gradient-to-b from-cyan-950 via-sky-950 to-[#070B10] border border-slate-800 overflow-hidden p-3 flex flex-col justify-between text-xs font-mono">
            {/* Epipelagic Littoral Layer */}
            <div className="border-b border-cyan-500/20 pb-1">
              <span className="text-cyan-300 font-bold block text-[11px]">Surface / Mixed Littoral (0-30m)</span>
              <span className="text-[10px] text-slate-400">High ambient light, warm surface temperature</span>
            </div>

            {/* Thermocline Transition Layer */}
            <div className="border-y border-amber-500/20 py-1 my-auto">
              <span className="text-amber-300 font-bold block text-[11px]">Thermocline Boundary (30-95m)</span>
              <span className="text-[10px] text-slate-400">Rapid thermal drop, strong acoustic refraction</span>
            </div>

            {/* Bathypelagic Deep Layer */}
            <div className="border-t border-indigo-500/20 pt-1">
              <span className="text-indigo-300 font-bold block text-[11px]">Abyssal Deep Water (95m+)</span>
              <span className="text-[10px] text-slate-400">High hydrostatic pressure, cold uniform layer</span>
            </div>

            {/* AUV Vehicle Marker on the Column */}
            <div 
              className="absolute left-0 right-0 border-t-2 border-[#17A9C9] bg-[#17A9C9]/20 flex items-center justify-between px-3 py-1 transition-all duration-500 shadow-md shadow-[#17A9C9]/30"
              style={{ top: `${Math.min(90, Math.max(8, (env.depth / 200) * 100))}%` }}
            >
              <span className="text-[11px] font-bold text-[#E8EEF2] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#17A9C9] animate-ping" />
                AUV CURRENT DEPTH: {env.depth.toFixed(1)}m
              </span>
              <span className="text-[10px] text-[#FFB100] font-bold">
                {profile.code}
              </span>
            </div>
          </div>

          <div className="mt-4 text-xs text-[#8FA3B8] font-mono space-y-1">
            <div className="flex justify-between">
              <span>Hydrostatic Pressure:</span>
              <span className="text-[#E8EEF2]">{env.pressure.toFixed(2)} bar</span>
            </div>
            <div className="flex justify-between">
              <span>Water Column Salinity:</span>
              <span className="text-slate-300">{env.salinity} PSU</span>
            </div>
          </div>
        </div>

        {/* Right 8 cols: CTD & Sound Velocity Profile Chart */}
        <div className="lg:col-span-8 bg-[#0B1F3A]/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h3 className="font-heading font-bold text-sm text-[#E8EEF2] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#17A9C9]" />
              Sound Velocity Profile (SSP) & Ray Bending
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-[#17A9C9]">
              MacKenzie Formulation
            </span>
          </div>

          {/* SSP Graphic Table & Bar Representation */}
          <div className="space-y-2 mb-4">
            <div className="grid grid-cols-4 text-[10px] font-mono text-[#8FA3B8] uppercase pb-1 border-b border-slate-800">
              <span>Depth Band</span>
              <span>Temp (°C)</span>
              <span>Velocity c (m/s)</span>
              <span>Acoustic Waveguide</span>
            </div>

            {depthProfilePoints.map((pt) => {
              const isCurrentDepthBand = Math.abs(pt.depth - env.depth) < 25;
              return (
                <div 
                  key={pt.depth}
                  className={`grid grid-cols-4 text-xs font-mono py-1.5 px-2 rounded transition-all items-center ${
                    isCurrentDepthBand 
                      ? 'bg-[#17A9C9]/20 border border-[#17A9C9]/50 text-white font-bold' 
                      : 'bg-[#0A0E14]/60 text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    {pt.depth}m
                    {isCurrentDepthBand && <span className="text-[9px] text-[#FFB100]">★ AUV</span>}
                  </span>
                  <span className="text-cyan-300">{pt.temp.toFixed(1)}°C</span>
                  <span className="text-[#17A9C9]">{pt.c} m/s</span>
                  <span className="text-[10px] text-slate-400">
                    {pt.depth < 30 ? 'Surface Duct' : pt.depth < 100 ? 'Negative Gradient' : 'Deep Sound Channel'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Explanatory callout */}
          <div className="bg-[#0A0E14] p-3.5 rounded-lg border border-slate-800 text-xs text-[#8FA3B8] leading-relaxed">
            <div className="flex items-center gap-2 text-[#E8EEF2] font-semibold mb-1">
              <Info className="w-4 h-4 text-[#17A9C9]" />
              <span>Acoustic Refraction & Profile Adaptation</span>
            </div>
            When passing through the thermocline, the negative sound velocity gradient ($dc/dz &lt; 0$) bends acoustic rays downward into shadow zones. The CHIRPFLEX adaptive decision engine compensates by dynamically broadening bandwidth and switching to Profile 2 or 3 to maintain acoustic penetration.
          </div>
        </div>
      </div>
    </div>
  );
};
