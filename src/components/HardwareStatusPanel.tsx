import React from 'react';
import { 
  Cpu, 
  Layers, 
  Timer, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Gauge,
  Thermometer,
  Flame,
  ShieldCheck
} from 'lucide-react';
import { HardwareSubsystem } from '../types';

interface HardwareStatusPanelProps {
  hardware: HardwareSubsystem;
}

export const HardwareStatusPanel: React.FC<HardwareStatusPanelProps> = ({
  hardware,
}) => {
  return (
    <div className="bg-[#0B1F3A]/90 border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#17A9C9]/10 border border-[#17A9C9]/30 text-[#17A9C9]">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#E8EEF2]">
              HARDWARE SUBSYSTEM ARCHITECTURE
            </h3>
            <p className="text-[11px] text-[#8FA3B8]">
              Firmware Bus • DMA Engine • Analog Front End (AFE)
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          ALL RAILS LOCKED
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Subsystem 1: Embedded MCU Controller */}
        <div className="bg-[#0A0E14]/80 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-mono font-semibold text-[#E8EEF2] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#17A9C9]" />
              STM32H743 MCU
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">NOMINAL</span>
          </div>

          <div className="space-y-1 text-[11px] font-mono text-[#8FA3B8]">
            <div className="flex justify-between">
              <span>Core Temp:</span>
              <span className="text-[#E8EEF2]">{hardware.controller.mcuTempC.toFixed(1)}°C</span>
            </div>
            <div className="flex justify-between">
              <span>CPU Load:</span>
              <span className="text-[#17A9C9]">{hardware.controller.cpuLoadPercent.toFixed(0)}% (Offloaded)</span>
            </div>
            <div className="flex justify-between">
              <span>Sys Clock:</span>
              <span className="text-slate-300">{hardware.controller.clockSpeedMhz} MHz</span>
            </div>
          </div>
        </div>

        {/* Subsystem 2: DMA Streamer */}
        <div className="bg-[#0A0E14]/80 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-mono font-semibold text-[#E8EEF2] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#FFB100]" />
              DMA Streamer
            </span>
            <span className="text-[10px] text-[#FFB100] font-mono">STREAMING</span>
          </div>

          <div className="space-y-1 text-[11px] font-mono text-[#8FA3B8]">
            <div className="flex justify-between">
              <span>Buffer Mode:</span>
              <span className="text-[#FFB100]">Ping-Pong (Circular)</span>
            </div>
            <div className="flex justify-between">
              <span>Active Buffer:</span>
              <span className="text-[#E8EEF2] font-semibold">{hardware.controller.dmaBufferState} (4096B)</span>
            </div>
            <div className="flex justify-between">
              <span>CPU Intervention:</span>
              <span className="text-emerald-400 font-semibold">0% (Autonomous)</span>
            </div>
          </div>
        </div>

        {/* Subsystem 3: Hardware Timers & DAC */}
        <div className="bg-[#0A0E14]/80 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-mono font-semibold text-[#E8EEF2] flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-cyan-400" />
              TIM1 / 12-Bit DAC
            </span>
            <span className="text-[10px] text-[#17A9C9] font-mono">SYNCHRONIZED</span>
          </div>

          <div className="space-y-1 text-[11px] font-mono text-[#8FA3B8]">
            <div className="flex justify-between">
              <span>DAC Sample Rate:</span>
              <span className="text-[#E8EEF2]">{hardware.dac.sampleRateMsps} MSps</span>
            </div>
            <div className="flex justify-between">
              <span>DAC Resolution:</span>
              <span className="text-slate-300">{hardware.dac.resolutionBits}-Bit Dual-Channel</span>
            </div>
            <div className="flex justify-between">
              <span>Trigger Jitter:</span>
              <span className="text-emerald-400">&lt; {hardware.controller.timerJitterPs} ps</span>
            </div>
          </div>
        </div>

        {/* Subsystem 4: Analog Front End & Power Stage */}
        <div className="bg-[#0A0E14]/80 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-mono font-semibold text-[#E8EEF2] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              AFE & Amp Stage
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">MATCHED</span>
          </div>

          <div className="space-y-1 text-[11px] font-mono text-[#8FA3B8]">
            <div className="flex justify-between">
              <span>VSWR:</span>
              <span className="text-emerald-400 font-semibold">{hardware.afe.vswr.toFixed(2)}:1</span>
            </div>
            <div className="flex justify-between">
              <span>Load Impedance:</span>
              <span className="text-[#E8EEF2]">{hardware.afe.transducerImpedanceOhm} Ω (Acoustic)</span>
            </div>
            <div className="flex justify-between">
              <span>Heatsink Temp:</span>
              <span className="text-slate-300">{hardware.afe.stageTempC.toFixed(1)}°C</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
