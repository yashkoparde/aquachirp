import React, { useState } from 'react';
import { 
  Waves, 
  Thermometer, 
  Eye, 
  Gauge, 
  BatteryCharging, 
  Compass, 
  Sparkles,
  Sliders,
  RefreshCcw,
  Zap,
  Info
} from 'lucide-react';
import { EnvironmentalData } from '../types';

interface EnvironmentalPanelProps {
  env: EnvironmentalData;
  onUpdateManualEnv?: (partial: Partial<EnvironmentalData>) => void;
  isSimulated: boolean;
}

export const EnvironmentalPanel: React.FC<EnvironmentalPanelProps> = ({
  env,
  onUpdateManualEnv,
  isSimulated,
}) => {
  const [showInjector, setShowInjector] = useState(false);

  // Depth band classification
  const getDepthBand = (depth: number) => {
    if (depth < 35) return { label: 'Shallow Littoral Column', color: 'text-[#17A9C9]', bg: 'bg-[#17A9C9]/10' };
    if (depth < 95) return { label: 'Thermocline Gradient Layer', color: 'text-sky-400', bg: 'bg-sky-500/10' };
    return { label: 'Deep Bathypelagic Zone', color: 'text-indigo-400', bg: 'bg-indigo-500/10' };
  };

  // Turbidity state classification
  const getTurbidityStatus = (ntu: number) => {
    if (ntu < 18) return { label: 'Clear Water', color: 'text-emerald-400' };
    if (ntu < 42) return { label: 'Moderate Littoral', color: 'text-amber-300' };
    return { label: 'High Particulate Clutter', color: 'text-[#FFB100]' };
  };

  const depthBand = getDepthBand(env.depth);
  const turbStatus = getTurbidityStatus(env.turbidity);

  // Battery bar color & alert status
  const getBatteryColor = (pct: number) => {
    if (pct > 50) return 'bg-[#17A9C9]';
    if (pct > 30) return 'bg-[#FFB100] font-semibold';
    return 'bg-red-500 animate-pulse font-bold';
  };

  return (
    <div className="bg-[#0B1F3A]/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden">
      {/* Panel Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#17A9C9]/10 border border-[#17A9C9]/30 text-[#17A9C9]">
            <Waves className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#E8EEF2]">
              ENVIRONMENTAL TELEMETRY
            </h3>
            <p className="text-[11px] text-[#8FA3B8]">
              Real-time In-Situ Hydrographic Sensing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-slate-700 ${depthBand.bg} ${depthBand.color}`}>
            {depthBand.label}
          </span>
          {isSimulated && (
            <button
              onClick={() => setShowInjector(!showInjector)}
              title="Toggle Environmental Stress Injector"
              className={`p-1 rounded border text-xs flex items-center gap-1 transition-all ${
                showInjector 
                  ? 'bg-[#FFB100] text-[#0A0E14] border-[#FFB100] font-bold' 
                  : 'bg-[#0A0E14] text-[#8FA3B8] border-slate-800 hover:text-[#17A9C9]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline">Stress Injector</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Key Environmental Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Depth Gauge */}
        <div className="bg-[#0A0E14]/80 p-3 rounded-lg border border-slate-800/80 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between text-[#8FA3B8] text-[11px]">
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-[#17A9C9]" />
              Depth
            </span>
            <span className="font-mono text-[10px] text-slate-500">MAX 300m</span>
          </div>
          <div className="my-1 flex items-baseline gap-1">
            <span className="font-mono font-bold text-2xl text-[#E8EEF2]">
              {env.depth.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-[#8FA3B8]">m</span>
          </div>
          {/* Depth progress bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
            <div 
              className="h-full bg-gradient-to-r from-[#17A9C9] to-indigo-500 transition-all duration-300"
              style={{ width: `${Math.min(100, (env.depth / 200) * 100)}%` }}
            />
          </div>
        </div>

        {/* Temperature Gauge */}
        <div className="bg-[#0A0E14]/80 p-3 rounded-lg border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8FA3B8] text-[11px]">
            <span className="flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
              Water Temp
            </span>
            <span className="font-mono text-[10px] text-slate-500">CTD SENSOR</span>
          </div>
          <div className="my-1 flex items-baseline gap-1">
            <span className="font-mono font-bold text-2xl text-[#E8EEF2]">
              {env.temperature.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-[#8FA3B8]">°C</span>
          </div>
          <div className="text-[10px] font-mono text-[#8FA3B8] flex justify-between">
            <span>Thermocline: {env.temperature < 10 ? 'Cold Abyssal' : 'Mixed Layer'}</span>
          </div>
        </div>

        {/* Turbidity Gauge */}
        <div className="bg-[#0A0E14]/80 p-3 rounded-lg border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8FA3B8] text-[11px]">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-[#FFB100]" />
              Turbidity
            </span>
            <span className="font-mono text-[10px] text-slate-500">OPTICAL</span>
          </div>
          <div className="my-1 flex items-baseline gap-1">
            <span className="font-mono font-bold text-2xl text-[#E8EEF2]">
              {env.turbidity.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-[#8FA3B8]">NTU</span>
          </div>
          <span className={`text-[10px] font-mono ${turbStatus.color}`}>
            ● {turbStatus.label}
          </span>
        </div>

        {/* Hydrostatic Pressure */}
        <div className="bg-[#0A0E14]/80 p-3 rounded-lg border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8FA3B8] text-[11px]">
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              Hydrostatic Press.
            </span>
            <span className="font-mono text-[10px] text-slate-500">BAROMETRIC</span>
          </div>
          <div className="my-1 flex items-baseline gap-1">
            <span className="font-mono font-bold text-xl text-[#E8EEF2]">
              {env.pressure.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-[#8FA3B8]">bar</span>
          </div>
          <div className="text-[10px] font-mono text-[#8FA3B8]">
            {(env.pressure * 100).toFixed(0)} kPa load
          </div>
        </div>

        {/* Sound Velocity MacKenzie Model */}
        <div className="bg-[#0A0E14]/80 p-3 rounded-lg border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8FA3B8] text-[11px]">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#17A9C9]" />
              Sound Velocity (c)
            </span>
            <span className="font-mono text-[10px] text-slate-500">MACKENZIE</span>
          </div>
          <div className="my-1 flex items-baseline gap-1">
            <span className="font-mono font-bold text-xl text-[#17A9C9]">
              {env.soundVelocity.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-[#8FA3B8]">m/s</span>
          </div>
          <div className="text-[10px] font-mono text-[#8FA3B8]">
            Salinity: {env.salinity} PSU
          </div>
        </div>

        {/* Battery Bus Voltage & SOC */}
        <div className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
          env.batteryPercent <= 30 
            ? 'bg-rose-950/40 border-rose-500/80 shadow-lg shadow-rose-500/20' 
            : 'bg-[#0A0E14]/80 border-slate-800/80'
        }`}>
          <div className="flex items-center justify-between text-[#8FA3B8] text-[11px]">
            <span className="flex items-center gap-1">
              <BatteryCharging className={`w-3.5 h-3.5 ${env.batteryPercent <= 30 ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
              Vehicle Battery
            </span>
            <span className="font-mono text-[10px] text-slate-500">4S LIPO</span>
          </div>
          <div className="my-1 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className={`font-mono font-bold text-xl ${env.batteryPercent <= 30 ? 'text-rose-400' : 'text-[#E8EEF2]'}`}>
                {env.batteryPercent.toFixed(0)}%
              </span>
              <span className="text-[10px] font-mono text-[#8FA3B8]">({env.batteryVoltage.toFixed(1)}V)</span>
            </div>
            <span className="text-[10px] font-mono text-[#8FA3B8]">
              ~{env.estimatedRuntimeMinutes}m
            </span>
          </div>
          {env.batteryPercent <= 30 && (
            <div className="text-[10px] font-mono text-rose-300 font-bold flex items-center justify-between bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/40 mb-1">
              <span>⚠️ LOW BATTERY REACTION ALERT (&le;30%)</span>
            </div>
          )}
          {/* Battery progress */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
            <div 
              className={`h-full transition-all duration-300 ${getBatteryColor(env.batteryPercent)}`}
              style={{ width: `${Math.max(0, Math.min(100, env.batteryPercent))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Interactive Environmental Stress Injector (For Testing / Pitch Demonstrations) */}
      {showInjector && onUpdateManualEnv && (
        <div className="mt-3.5 p-3 rounded-lg bg-[#0A0E14] border border-[#FFB100]/40 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-[#FFB100] font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>BENCHTOP STRESS INJECTOR (DEMO REACTION TEST)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onUpdateManualEnv({
                    depth: 18,
                    temperature: 21.5,
                    turbidity: 8.2,
                    batteryPercent: 88,
                    batteryVoltage: 16.2
                  });
                }}
                className="text-[10px] font-mono text-[#17A9C9] hover:underline flex items-center gap-1"
              >
                <RefreshCcw className="w-3 h-3" /> Reset
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Depth Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-[#8FA3B8] mb-1 font-mono">
                <span>Depth: {env.depth.toFixed(0)}m</span>
                <span className="text-[#17A9C9]">{env.depth > 95 ? '→ Deep Chirp' : env.depth < 35 ? '→ Shallow Chirp' : '→ Thermocline'}</span>
              </div>
              <input
                type="range"
                min={2}
                max={160}
                value={env.depth}
                onChange={(e) => onUpdateManualEnv({ depth: Number(e.target.value) })}
                className="w-full accent-[#17A9C9] cursor-pointer"
              />
            </div>

            {/* Turbidity Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-[#8FA3B8] mb-1 font-mono">
                <span>Turbidity: {env.turbidity.toFixed(0)} NTU</span>
                <span className="text-[#FFB100]">{env.turbidity > 42 ? '→ Clutter Filter' : 'Nominal'}</span>
              </div>
              <input
                type="range"
                min={2}
                max={90}
                value={env.turbidity}
                onChange={(e) => onUpdateManualEnv({ turbidity: Number(e.target.value) })}
                className="w-full accent-[#FFB100] cursor-pointer"
              />
            </div>

            {/* Temperature Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-[#8FA3B8] mb-1 font-mono">
                <span>Temp: {env.temperature.toFixed(1)}°C</span>
                <span className="text-cyan-400">{env.temperature < 8 ? 'Abyssal' : 'Littoral'}</span>
              </div>
              <input
                type="range"
                min={2}
                max={28}
                step={0.5}
                value={env.temperature}
                onChange={(e) => onUpdateManualEnv({ temperature: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Battery Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-[#8FA3B8] mb-1 font-mono">
                <span>Battery: {env.batteryPercent.toFixed(0)}%</span>
                <span className="text-red-400">{env.batteryPercent < 25 ? '→ ECO Save Mode' : 'Nominal'}</span>
              </div>
              <input
                type="range"
                min={8}
                max={100}
                value={env.batteryPercent}
                onChange={(e) => {
                  const pct = Number(e.target.value);
                  const voltage = 12.0 + (pct / 100) * 4.8;
                  onUpdateManualEnv({ batteryPercent: pct, batteryVoltage: voltage });
                }}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
            <Info className="w-3 h-3 text-[#17A9C9]" />
            Slide parameters above to trigger the real-time Adaptive Decision Engine live in the next panel.
          </p>
        </div>
      )}
    </div>
  );
};
