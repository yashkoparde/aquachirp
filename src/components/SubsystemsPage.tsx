import React from 'react';
import { 
  Cpu, 
  Layers, 
  Timer, 
  Zap, 
  ShieldCheck, 
  Thermometer, 
  Activity, 
  Gauge, 
  Sliders, 
  HardDrive,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { HardwareSubsystem, SonarProfile } from '../types';

interface SubsystemsPageProps {
  hardware: HardwareSubsystem;
  profile: SonarProfile;
}

export const SubsystemsPage: React.FC<SubsystemsPageProps> = ({
  hardware,
  profile,
}) => {
  return (
    <div className="space-y-6 max-w-[1700px] mx-auto animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="bg-[#0B1F3A]/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-extrabold text-lg text-[#E8EEF2]">
              AUV HARDWARE SUBSYSTEMS & DSP ARCHITECTURE
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#17A9C9]/20 text-[#17A9C9] border border-[#17A9C9]/40 font-bold">
              DIAGNOSTICS & TELEMETRY
            </span>
          </div>
          <p className="text-xs text-[#8FA3B8] font-mono mt-1">
            CHIRPFLEX Embedded Hardware Controller • Autonomous DMA Streaming Engine
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#0A0E14] px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-500 block text-[10px]">MCU HEALTH</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> NOMINAL (480 MHz)
            </span>
          </div>
          <div className="bg-[#0A0E14] px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-500 block text-[10px]">PA STAGE</span>
            <span className="text-[#FFB100] font-bold">VSWR 1.08:1</span>
          </div>
        </div>
      </div>

      {/* Main 4 Subsystem Engineering Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Subsystem 1: Embedded MCU Core */}
        <div className="bg-[#0B1F3A]/90 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#17A9C9]/10 text-[#17A9C9] border border-[#17A9C9]/30">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-[#E8EEF2]">
                  1. Embedded Microcontroller (MCU)
                </h3>
                <span className="text-[10px] font-mono text-[#8FA3B8]">STM32H743ZI / ARM Cortex-M7</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              CORE 0 ONLINE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono mb-4">
            <div className="bg-[#0A0E14] p-2.5 rounded-lg border border-slate-800">
              <span className="text-[#8FA3B8] block text-[10px]">CPU CLOCK</span>
              <span className="text-[#E8EEF2] font-bold text-sm">{hardware.controller.clockSpeedMhz} MHz</span>
            </div>
            <div className="bg-[#0A0E14] p-2.5 rounded-lg border border-slate-800">
              <span className="text-[#8FA3B8] block text-[10px]">CPU UTILIZATION</span>
              <span className="text-[#17A9C9] font-bold text-sm">{hardware.controller.cpuLoadPercent.toFixed(1)}%</span>
              <span className="text-[10px] text-emerald-400 block">(DMA Offloaded)</span>
            </div>
            <div className="bg-[#0A0E14] p-2.5 rounded-lg border border-slate-800">
              <span className="text-[#8FA3B8] block text-[10px]">CORE TEMPERATURE</span>
              <span className="text-[#E8EEF2] font-bold text-sm">{hardware.controller.mcuTempC.toFixed(1)}°C</span>
            </div>
            <div className="bg-[#0A0E14] p-2.5 rounded-lg border border-slate-800">
              <span className="text-[#8FA3B8] block text-[10px]">TIMER PHASE JITTER</span>
              <span className="text-emerald-400 font-bold text-sm">&lt; {hardware.controller.timerJitterPs} ps</span>
            </div>
          </div>

          <p className="text-xs text-[#8FA3B8] leading-relaxed bg-[#0A0E14]/60 p-3 rounded-lg border border-slate-800/80">
            The high-performance 480 MHz ARM Cortex-M7 core computes the adaptive transmission parameters while offloading time-critical chirp synthesis completely to the hardware timer and DMA streamer.
          </p>
        </div>

        {/* Subsystem 2: DMA Streamer Engine */}
        <div className="bg-[#0B1F3A]/90 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#FFB100]/10 text-[#FFB100] border border-[#FFB100]/30">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-[#E8EEF2]">
                  2. DMA Circular Waveform Streamer
                </h3>
                <span className="text-[10px] font-mono text-[#8FA3B8]">DMA2 Stream0 • Double Buffered</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FFB100]/15 text-[#FFB100] border border-[#FFB100]/30">
              STREAMING
            </span>
          </div>

          <div className="bg-[#0A0E14] p-3 rounded-lg border border-slate-800 mb-4">
            <div className="flex justify-between items-center text-xs font-mono mb-2">
              <span className="text-[#8FA3B8]">Buffer Ping-Pong Memory Status:</span>
              <span className="text-[#17A9C9] font-bold">4096 Samples / Ping</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className={`p-2.5 rounded border transition-all ${
                hardware.controller.dmaBufferState === 'PING' 
                  ? 'bg-[#17A9C9]/20 border-[#17A9C9] text-white font-bold' 
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                <span>BUFFER A (PING):</span>
                <span className="block text-[10px] text-slate-300">STREAMING TO DAC</span>
              </div>
              <div className={`p-2.5 rounded border transition-all ${
                hardware.controller.dmaBufferState === 'PONG' 
                  ? 'bg-[#FFB100]/20 border-[#FFB100] text-white font-bold' 
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                <span>BUFFER B (PONG):</span>
                <span className="block text-[10px] text-slate-300">STREAMING TO DAC</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-[#8FA3B8] leading-relaxed bg-[#0A0E14]/60 p-3 rounded-lg border border-slate-800/80">
            DMA circular streaming eliminates CPU jitter. Samples are transferred directly from SRAM to the DAC at 2.4 MSps without CPU interrupt overhead, ensuring pristine phase coherence for LFM chirps.
          </p>
        </div>

        {/* Subsystem 3: 12-Bit Fast DAC */}
        <div className="bg-[#0B1F3A]/90 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-[#E8EEF2]">
                  3. Digital-to-Analog Converter (DAC)
                </h3>
                <span className="text-[10px] font-mono text-[#8FA3B8]">Dual Channel 12-Bit High Speed</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              LOCKED 2.4 MSps
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-mono mb-4">
            <div className="bg-[#0A0E14] p-2.5 rounded-lg border border-slate-800">
              <span className="text-[#8FA3B8] block text-[10px]">RESOLUTION</span>
              <span className="text-[#E8EEF2] font-bold text-sm">{hardware.dac.resolutionBits}-Bit</span>
            </div>
            <div className="bg-[#0A0E14] p-2.5 rounded-lg border border-slate-800">
              <span className="text-[#8FA3B8] block text-[10px]">SAMPLE RATE</span>
              <span className="text-[#17A9C9] font-bold text-sm">{hardware.dac.sampleRateMsps} MSps</span>
            </div>
            <div className="bg-[#0A0E14] p-2.5 rounded-lg border border-slate-800">
              <span className="text-[#8FA3B8] block text-[10px]">ANALOG SWING</span>
              <span className="text-emerald-400 font-bold text-sm">{hardware.dac.outputSwingVpp} Vpp</span>
            </div>
          </div>

          <p className="text-xs text-[#8FA3B8] leading-relaxed bg-[#0A0E14]/60 p-3 rounded-lg border border-slate-800/80">
            Hardware timer TIM1 triggers the DAC conversion on each clock edge. Fast settling time (&lt;1.5 µs) ensures high spectral purity across the 20 kHz to 220 kHz operational acoustic band.
          </p>
        </div>

        {/* Subsystem 4: Analog Front End & Power Stage */}
        <div className="bg-[#0B1F3A]/90 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-[#E8EEF2]">
                  4. Analog Front End & Power Amplifier
                </h3>
                <span className="text-[10px] font-mono text-[#8FA3B8]">Active 4th-Order Sallen-Key Filter + Class-D Stage</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              50Ω MATCHED
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-mono mb-4">
            <div className="bg-[#0A0E14] p-2.5 rounded-lg border border-slate-800">
              <span className="text-[#8FA3B8] block text-[10px]">FILTER CUTOFF</span>
              <span className="text-[#E8EEF2] font-bold text-sm">{hardware.afe.filterCutoffKhz} kHz</span>
            </div>
            <div className="bg-[#0A0E14] p-2.5 rounded-lg border border-slate-800">
              <span className="text-[#8FA3B8] block text-[10px]">VSWR RATIO</span>
              <span className="text-emerald-400 font-bold text-sm">{hardware.afe.vswr.toFixed(2)}:1</span>
            </div>
            <div className="bg-[#0A0E14] p-2.5 rounded-lg border border-slate-800">
              <span className="text-[#8FA3B8] block text-[10px]">HEATSINK TEMP</span>
              <span className="text-slate-300 font-bold text-sm">{hardware.afe.stageTempC.toFixed(1)}°C</span>
            </div>
          </div>

          <p className="text-xs text-[#8FA3B8] leading-relaxed bg-[#0A0E14]/60 p-3 rounded-lg border border-slate-800/80">
            Anti-aliasing active reconstruction filter attenuates DAC clock images. Power amplifier delivers up to 55W acoustic output into the piezo-ceramic transducer element with thermal limiting protection.
          </p>
        </div>
      </div>
    </div>
  );
};
