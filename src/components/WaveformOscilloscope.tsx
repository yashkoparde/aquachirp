import React, { useEffect, useRef, useState } from 'react';
import { 
  Activity, 
  Eye, 
  Sliders, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Disc, 
  Cpu, 
  Zap,
  Play,
  Pause
} from 'lucide-react';
import { SonarProfile } from '../types';

interface WaveformOscilloscopeProps {
  profile: SonarProfile;
  pingCount: number;
  isStreaming: boolean;
  onSelectProfile?: (profileId: string) => void;
}

export const WaveformOscilloscope: React.FC<WaveformOscilloscopeProps> = ({
  profile,
  pingCount,
  isStreaming,
  onSelectProfile,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const waterfallCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [viewMode, setViewMode] = useState<'oscilloscope' | 'spectrum' | 'waterfall'>('oscilloscope');
  const [timebaseMsPerDiv, setTimebaseMsPerDiv] = useState<number>(0.5); // 0.5 ms / div
  const [amplitudeGain, setAmplitudeGain] = useState<number>(1.0);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [phaseOffset, setPhaseOffset] = useState<number>(0);

  // Dynamic Canvas Resize Observer
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const parent = canvasRef.current.parentElement;
        const w = parent ? parent.clientWidth : 800;
        const h = parent ? parent.clientHeight : 260;
        canvasRef.current.width = w > 0 ? w : 800;
        canvasRef.current.height = h > 0 ? h : 260;
      }
      if (waterfallCanvasRef.current) {
        const parent = waterfallCanvasRef.current.parentElement;
        const w = parent ? parent.clientWidth : 800;
        const h = parent ? parent.clientHeight : 260;
        waterfallCanvasRef.current.width = w > 0 ? w : 800;
        waterfallCanvasRef.current.height = h > 0 ? h : 260;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  // Animation frame loop for real-time oscilloscope
  useEffect(() => {
    let animationFrameId: number;
    let localPhase = 0;

    const render = () => {
      if (!isFrozen && isStreaming) {
        localPhase += 0.04;
        setPhaseOffset(localPhase);
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;

          // Background
          ctx.fillStyle = '#070B10';
          ctx.fillRect(0, 0, width, height);

          // Grid Drawing (Oscilloscope Graticule: 10 horizontal divisions, 8 vertical)
          ctx.lineWidth = 1;
          ctx.strokeStyle = 'rgba(23, 169, 201, 0.12)';

          const numDivsX = 10;
          const numDivsY = 8;
          const stepX = width / numDivsX;
          const stepY = height / numDivsY;

          // Vertical grid lines
          for (let x = 0; x <= width; x += stepX) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
          }

          // Horizontal grid lines
          for (let y = 0; y <= height; y += stepY) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
          }

          // Center crosshairs with division sub-ticks
          ctx.strokeStyle = 'rgba(23, 169, 201, 0.28)';
          ctx.beginPath();
          ctx.moveTo(width / 2, 0);
          ctx.lineTo(width / 2, height);
          ctx.moveTo(0, height / 2);
          ctx.lineTo(width, height / 2);
          ctx.stroke();

          // Sub-ticks on center axes
          const subTickSize = 3;
          for (let x = 0; x <= width; x += stepX / 5) {
            ctx.beginPath();
            ctx.moveTo(x, height / 2 - subTickSize);
            ctx.lineTo(x, height / 2 + subTickSize);
            ctx.stroke();
          }
          for (let y = 0; y <= height; y += stepY / 5) {
            ctx.beginPath();
            ctx.moveTo(width / 2 - subTickSize, y);
            ctx.lineTo(width / 2 + subTickSize, y);
            ctx.stroke();
          }

          if (viewMode === 'oscilloscope') {
            // RENDER TIME-DOMAIN LFM CHIRP WAVEFORM
            // s(t) = A(t) * sin(2*pi * (f0*t + 0.5*k*t^2) + phi)
            ctx.save();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#17A9C9';
            ctx.shadowColor = '#17A9C9';
            ctx.shadowBlur = 6;

            const totalTimeMs = numDivsX * timebaseMsPerDiv;
            const centerY = height / 2;
            const maxAmplitudePx = (height / 2 - 20) * amplitudeGain;

            ctx.beginPath();

            const f0 = profile.startFreqKhz;
            const f1 = profile.endFreqKhz;
            const duration = profile.pulseDurationMs;
            const k = (f1 - f0) / Math.max(0.1, duration); // sweep rate kHz/ms

            // Number of points to render
            const points = width;
            for (let i = 0; i < points; i++) {
              const x = (i / points) * width;
              const t = (i / points) * totalTimeMs; // time in ms
              const normT = (i / points); // 0.0 to 1.0 continuous across whole screen

              // Windowing envelope calculation across continuous screen
              let windowEnvelope = 1.0;
              const winType = profile.windowType || 'HANN';
              if (winType === 'HANN') {
                windowEnvelope = 0.85 + 0.15 * Math.sin(Math.PI * normT);
              } else if (winType === 'HAMMING') {
                windowEnvelope = 0.88 + 0.12 * Math.cos(2 * Math.PI * normT);
              } else if (winType === 'BLACKMAN') {
                windowEnvelope = 0.82 + 0.18 * Math.cos(4 * Math.PI * normT);
              }

              // Continuous Waveform Synthesis Across Entire Horizontal Timebase
              let carrierWave = 0;
              const wfType = profile.waveformType;
              const relT = t;

              if (wfType === 'GEOMETRIC_SWEEP') {
                // Geometric / Logarithmic Sweep f(t) = f0 * e^(alpha * t)
                const alpha = Math.log(Math.max(0.1, f1) / Math.max(0.1, f0)) / Math.max(0.1, totalTimeMs);
                const instFreq = f0 * Math.exp(alpha * relT) * 0.035;
                carrierWave = Math.sin(2 * Math.PI * instFreq * relT + localPhase);
              } else if (wfType === 'PHASE_CODED') {
                // Barker / BPSK PhaseCode 13-bit continuous sequence
                const barkerCode = [1, 1, 1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1];
                const chipIndex = Math.floor(normT * barkerCode.length) % barkerCode.length;
                const phaseShift = barkerCode[chipIndex] === 1 ? 0 : Math.PI;
                const carrierFreq = ((f0 + f1) / 2) * 0.035;
                carrierWave = Math.sin(2 * Math.PI * carrierFreq * relT + phaseShift + localPhase);
              } else if (wfType === 'HYPERBOLIC_CHIRP') {
                const instFreq = (f0 * f1 * totalTimeMs) / Math.max(0.001, (f1 * totalTimeMs - (f1 - f0) * relT)) * 0.035;
                carrierWave = Math.sin(2 * Math.PI * instFreq * relT + localPhase);
              } else if (wfType === 'CW_TONE_BURST') {
                const carrierFreq = f0 * 0.035;
                carrierWave = Math.sin(2 * Math.PI * carrierFreq * relT + localPhase);
              } else {
                // Linear Frequency Modulation (LFM Chirp)
                const kCont = (f1 - f0) / Math.max(0.1, totalTimeMs);
                const instFreq = (f0 + kCont * relT) * 0.035;
                carrierWave = Math.sin(2 * Math.PI * instFreq * relT + localPhase);
              }

              const sample = carrierWave * windowEnvelope * (profile.amplitudePercent / 100);

              const y = centerY - sample * maxAmplitudePx;
              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }
            ctx.stroke();
            ctx.restore();

            // Trace trigger indicator
            ctx.fillStyle = '#FFB100';
            ctx.beginPath();
            ctx.moveTo(0, height / 2);
            ctx.lineTo(8, height / 2 - 5);
            ctx.lineTo(8, height / 2 + 5);
            ctx.fill();

            // Time and Frequency Labels on the Grid
            ctx.fillStyle = '#8FA3B8';
            ctx.font = '10px "JetBrains Mono", monospace';
            ctx.fillText(`CH1: 500mV/div  TIME: ${timebaseMsPerDiv}ms/div  TRIGGER: AUTO`, 15, height - 12);
            ctx.fillText(`WF: ${profile.waveformType} | WIN: ${profile.windowType || 'NONE'} | PULSE: ${profile.pulseDurationMs.toFixed(1)}ms | SWEEP: ${profile.startFreqKhz}k→${profile.endFreqKhz}k`, width - 420, height - 12);

          } else if (viewMode === 'spectrum') {
            // RENDER FREQUENCY SPECTRUM (FFT)
            const centerY = height - 30;
            const chartHeight = height - 60;
            const maxFreqKhz = 250; // max scale 250 kHz

            // Draw Frequency Axis Labels
            ctx.fillStyle = '#8FA3B8';
            ctx.font = '10px "JetBrains Mono", monospace';
            for (let f = 0; f <= maxFreqKhz; f += 50) {
              const x = (f / maxFreqKhz) * width;
              ctx.fillText(`${f}k`, x > width - 30 ? width - 30 : x + 2, height - 8);
              ctx.strokeStyle = 'rgba(23, 169, 201, 0.15)';
              ctx.beginPath();
              ctx.moveTo(x, 10);
              ctx.lineTo(x, height - 25);
              ctx.stroke();
            }

            // Draw Active Chirp Band Highlight
            const minF = Math.min(profile.startFreqKhz, profile.endFreqKhz);
            const maxF = Math.max(profile.startFreqKhz, profile.endFreqKhz);
            const startX = (minF / maxFreqKhz) * width;
            const endX = (maxF / maxFreqKhz) * width;

            ctx.fillStyle = 'rgba(23, 169, 201, 0.12)';
            ctx.fillRect(startX, 20, endX - startX, chartHeight);

            ctx.fillStyle = '#17A9C9';
            ctx.fillText(`ACTIVE BAND (${minF}-${maxF} kHz)`, startX + 5, 32);

            // Draw FFT Spectral Curve
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = '#17A9C9';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#17A9C9';
            ctx.shadowBlur = 8;

            const noiseFloor = centerY - 15;

            for (let x = 0; x <= width; x += 2) {
              const currentF = (x / width) * maxFreqKhz;
              let powerDb = -75; // baseline dB

              // If within active sweep bandwidth
              if (currentF >= minF - 4 && currentF <= maxF + 4) {
                // In-band flat chirp response with Fresnel ripple
                const inBandT = (currentF - minF) / (maxF - minF);
                const ripple = Math.sin(inBandT * 18 + localPhase * 2) * 2.5;
                powerDb = -18 + ripple + (Math.random() - 0.5) * 1.5;
              } else {
                // Roll-off with analog filter skirt
                const dist = currentF < minF ? minF - currentF : currentF - maxF;
                powerDb = -18 - dist * 3.2 + (Math.random() - 0.5) * 2;
                if (powerDb < -80) powerDb = -80 + Math.random() * 3;
              }

              // Map dB (-90 to 0) to Y
              const normalized = (powerDb + 90) / 90; // 0 to 1
              const y = centerY - normalized * chartHeight;

              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Fill under spectrum
            ctx.lineTo(width, centerY);
            ctx.lineTo(0, centerY);
            ctx.fillStyle = 'rgba(23, 169, 201, 0.08)';
            ctx.fill();
            ctx.restore();
          }
        }
      }

      // If in waterfall mode, update waterfall canvas
      if (viewMode === 'waterfall' && waterfallCanvasRef.current) {
        const wCanvas = waterfallCanvasRef.current;
        const wCtx = wCanvas.getContext('2d');
        if (wCtx) {
          const w = wCanvas.width;
          const h = wCanvas.height;

          // Shift previous rows down by 2 pixels
          wCtx.drawImage(wCanvas, 0, 0, w, h - 2, 0, 2, w, h - 2);

          // Generate new acoustic ping line at top (Y = 0)
          const imgData = wCtx.createImageData(w, 2);
          for (let x = 0; x < w; x++) {
            // Simulate ocean acoustic reflection echoes:
            // strong return at target depth/seabed + particulate backscatter
            const normX = x / w;
            let intensity = Math.sin(normX * 12 + localPhase) * 0.15;

            // Target reflection spike
            const targetPos = 0.38 + Math.sin(localPhase * 0.5) * 0.08;
            const dist = Math.abs(normX - targetPos);
            if (dist < 0.03) {
              intensity += (1 - dist / 0.03) * 0.85;
            }

            // Bottom seafloor echo
            const seabedPos = 0.82;
            const seabedDist = Math.abs(normX - seabedPos);
            if (seabedDist < 0.06) {
              intensity += (1 - seabedDist / 0.06) * 0.95;
            }

            // Turbidity clutter noise
            intensity += Math.random() * 0.15;
            intensity = Math.max(0, Math.min(1, intensity));

            // Colormap: Deep Navy (0) -> Cyan (0.5) -> Amber (0.85) -> White (1.0)
            let r = 0, g = 0, b = 0;
            if (intensity < 0.4) {
              const t = intensity / 0.4;
              r = Math.floor(11 + t * (23 - 11));
              g = Math.floor(31 + t * (169 - 31));
              b = Math.floor(58 + t * (201 - 58));
            } else if (intensity < 0.8) {
              const t = (intensity - 0.4) / 0.4;
              r = Math.floor(23 + t * (255 - 23));
              g = Math.floor(169 + t * (177 - 169));
              b = Math.floor(201 - t * 201);
            } else {
              const t = (intensity - 0.8) / 0.2;
              r = 255;
              g = Math.floor(177 + t * (255 - 177));
              b = Math.floor(t * 255);
            }

            for (let dy = 0; dy < 2; dy++) {
              const idx = (dy * w + x) * 4;
              imgData.data[idx] = r;
              imgData.data[idx + 1] = g;
              imgData.data[idx + 2] = b;
              imgData.data[idx + 3] = 255;
            }
          }
          wCtx.putImageData(imgData, 0, 0);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [profile, isFrozen, isStreaming, viewMode, timebaseMsPerDiv, amplitudeGain]);

  return (
    <div className="bg-[#0B1F3A]/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-xl">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#17A9C9]/10 border border-[#17A9C9]/30 text-[#17A9C9]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#E8EEF2]">
              REAL-TIME SIGNAL OSCILLOSCOPE & SPECTRUM
            </h3>
            <p className="text-[11px] text-[#8FA3B8]">
              DMA Output Stream • 12-Bit Fast DAC • 2.4 MSps Clock
            </p>
          </div>
        </div>

        {/* Interactive Graph & Waveform Type Switcher Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Waveform Segment Fast-Switch Buttons */}
          <div className="flex items-center bg-[#0A0E14] p-0.5 rounded-lg border border-slate-800 text-[11px] overflow-x-auto">
            <button
              onClick={() => onSelectProfile && onSelectProfile('P1_SHALLOW')}
              className={`px-2 py-1 rounded transition-all font-mono whitespace-nowrap ${
                profile.waveformType === 'LFM_UP_CHIRP' || profile.waveformType === 'LFM_DOWN_CHIRP'
                  ? 'bg-[#FFB100] text-[#0A0E14] font-bold shadow-sm'
                  : 'text-[#8FA3B8] hover:text-[#E8EEF2]'
              }`}
              title="Switch Graph Segment to LFM Chirp"
            >
              LFM Chirp
            </button>
            <button
              onClick={() => onSelectProfile && onSelectProfile('P6_GEOMETRIC_SWEEP')}
              className={`px-2 py-1 rounded transition-all font-mono whitespace-nowrap ${
                profile.waveformType === 'GEOMETRIC_SWEEP'
                  ? 'bg-[#FFB100] text-[#0A0E14] font-bold shadow-sm'
                  : 'text-[#8FA3B8] hover:text-[#E8EEF2]'
              }`}
              title="Switch Graph Segment to GeoSweep (Geometric Sweep)"
            >
              GeoSweep
            </button>
            <button
              onClick={() => onSelectProfile && onSelectProfile('P7_PHASE_CODED')}
              className={`px-2 py-1 rounded transition-all font-mono whitespace-nowrap ${
                profile.waveformType === 'PHASE_CODED'
                  ? 'bg-[#FFB100] text-[#0A0E14] font-bold shadow-sm'
                  : 'text-[#8FA3B8] hover:text-[#E8EEF2]'
              }`}
              title="Switch Graph Segment to PhaseCode (13-bit Barker BPSK)"
            >
              PhaseCode
            </button>
            <button
              onClick={() => onSelectProfile && onSelectProfile('P4_TURBID_CLUTTER')}
              className={`px-2 py-1 rounded transition-all font-mono whitespace-nowrap ${
                profile.waveformType === 'HYPERBOLIC_CHIRP'
                  ? 'bg-[#FFB100] text-[#0A0E14] font-bold shadow-sm'
                  : 'text-[#8FA3B8] hover:text-[#E8EEF2]'
              }`}
              title="Switch Graph Segment to Hyperbolic Chirp"
            >
              Hyperbolic
            </button>
          </div>

          {/* View Domain Mode Switcher */}
          <div className="flex items-center bg-[#0A0E14] p-0.5 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => setViewMode('oscilloscope')}
              className={`px-2.5 py-1 rounded transition-all font-mono ${
                viewMode === 'oscilloscope'
                  ? 'bg-[#17A9C9] text-[#0A0E14] font-bold'
                  : 'text-[#8FA3B8] hover:text-[#E8EEF2]'
              }`}
            >
              Time Domain
            </button>
            <button
              onClick={() => setViewMode('spectrum')}
              className={`px-2.5 py-1 rounded transition-all font-mono ${
                viewMode === 'spectrum'
                  ? 'bg-[#17A9C9] text-[#0A0E14] font-bold'
                  : 'text-[#8FA3B8] hover:text-[#E8EEF2]'
              }`}
            >
              FFT Spectrum
            </button>
            <button
              onClick={() => setViewMode('waterfall')}
              className={`px-2.5 py-1 rounded transition-all font-mono ${
                viewMode === 'waterfall'
                  ? 'bg-[#17A9C9] text-[#0A0E14] font-bold'
                  : 'text-[#8FA3B8] hover:text-[#E8EEF2]'
              }`}
            >
              Waterfall
            </button>
          </div>

          <button
            onClick={() => setIsFrozen(!isFrozen)}
            title={isFrozen ? 'Resume Signal Capture' : 'Hold / Freeze Waveform'}
            className={`p-1.5 rounded border text-xs transition-all ${
              isFrozen
                ? 'bg-[#FFB100] text-[#0A0E14] border-[#FFB100] font-bold'
                : 'bg-[#0A0E14] text-[#8FA3B8] border-slate-800 hover:text-[#17A9C9]'
            }`}
          >
            {isFrozen ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Screen Canvas Area */}
      <div className="relative w-full rounded-lg overflow-hidden border border-[#17A9C9]/30 bg-[#070B10] shadow-inner">
        {/* Oscilloscope and FFT view */}
        <canvas
          ref={canvasRef}
          width={800}
          height={260}
          className={`w-full h-[220px] sm:h-[260px] object-cover ${viewMode === 'waterfall' ? 'hidden' : 'block'}`}
        />

        {/* Sonar Waterfall view */}
        <div className={`relative w-full h-[220px] sm:h-[260px] ${viewMode === 'waterfall' ? 'block' : 'hidden'}`}>
          <canvas
            ref={waterfallCanvasRef}
            width={800}
            height={260}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 bg-[#0A0E14]/80 px-2 py-1 rounded text-[10px] font-mono text-[#8FA3B8] border border-slate-800">
            Acoustic Echogram Waterfall • Bearing: 000° Broadside
          </div>
          <div className="absolute bottom-2 right-2 bg-[#0A0E14]/80 px-2 py-1 rounded text-[10px] font-mono text-[#17A9C9] border border-slate-800">
            Range: 0m → {profile.maxOperationalRangeM}m
          </div>
        </div>

        {/* Live Status Overlay Badges */}
        <div className="absolute top-2 right-2 flex items-center gap-2 pointer-events-none">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0A0E14]/90 text-[#17A9C9] border border-[#17A9C9]/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#17A9C9] animate-pulse" />
            DMA ACTIVE
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0A0E14]/90 text-[#FFB100] border border-[#FFB100]/40">
            {profile.waveformType}
          </span>
        </div>
      </div>

      {/* Oscilloscope Controls & Calibration Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-2 border-t border-slate-800/80 text-xs font-mono">
        <div className="flex items-center gap-3 text-[#8FA3B8]">
          <div className="flex items-center gap-1.5">
            <span>Timebase:</span>
            <select
              value={timebaseMsPerDiv}
              onChange={(e) => setTimebaseMsPerDiv(Number(e.target.value))}
              className="bg-[#0A0E14] border border-slate-700 rounded px-1.5 py-0.5 text-[#E8EEF2] text-[11px] focus:outline-none"
            >
              <option value={0.25}>0.25 ms/div</option>
              <option value={0.5}>0.50 ms/div</option>
              <option value={1.0}>1.00 ms/div</option>
              <option value={2.0}>2.00 ms/div</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Gain:</span>
            <select
              value={amplitudeGain}
              onChange={(e) => setAmplitudeGain(Number(e.target.value))}
              className="bg-[#0A0E14] border border-slate-700 rounded px-1.5 py-0.5 text-[#E8EEF2] text-[11px] focus:outline-none"
            >
              <option value={0.5}>0.5x</option>
              <option value={1.0}>1.0x (1V/div)</option>
              <option value={1.5}>1.5x</option>
              <option value={2.0}>2.0x</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-[#8FA3B8]">
          <span>Sweep: <span className="text-[#E8EEF2]">{profile.sweepRateKhzPerMs.toFixed(2)} kHz/ms</span></span>
          <span>Vpp: <span className="text-[#17A9C9]">3.30 V</span></span>
          <span>Ping: <span className="text-[#FFB100]">#{pingCount}</span></span>
        </div>
      </div>
    </div>
  );
};
