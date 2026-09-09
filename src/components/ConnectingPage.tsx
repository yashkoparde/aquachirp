import React, { useState } from 'react';
import { ConnectionConfig, ConnectionMode, MissionSummary } from '../types';
import { Radio, Play, History, Compass, Clock, CheckCircle2 } from 'lucide-react';

interface ConnectingPageProps {
  onConnected: (config: ConnectionConfig) => void;
  onCancel: () => void;
  savedMissions?: MissionSummary[];
}

export const ConnectingPage: React.FC<ConnectingPageProps> = ({
  onConnected,
  onCancel,
  savedMissions = [],
}) => {
  const [mode] = useState<ConnectionMode>('hardware_bus');
  const [isConnecting, setIsConnecting] = useState(false);
  const [progress, setProgress] = useState(0);

  const startConnection = () => {
    setIsConnecting(true);
    let pct = 0;
    const interval = setInterval(() => {
      pct += 5;
      setProgress(Math.min(100, pct));
      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onConnected({
            mode,
            portOrAddress: 'Internal Telemetry Bus',
            baudRate: 115200,
            sampleRateMs: 1000,
            auvId: 'AUV-HYDRO-ALPHA-01',
            payloadFirmware: 'CHIRPFLEX-ARM-v2.4.1',
          });
        }, 200);
      }
    }, 40);
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 select-none font-mono">
      <div className="w-full max-w-xl bg-[#0B1F3A]/90 border border-[#17A9C9]/30 rounded-xl p-6 shadow-2xl shadow-[#17A9C9]/10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17A9C9]/10 text-[#17A9C9] text-xs border border-[#17A9C9]/30 mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>PAYLOAD LINK DESK</span>
          </div>
          <h2 className="font-heading font-extrabold text-xl tracking-wider text-[#E8EEF2]">
            CONNECTIVITY CONTROL
          </h2>
          <p className="text-xs text-[#8FA3B8]">
            AUV-HYDRO-ALPHA-01 • CHIRPFLEX ARM v2.4.1
          </p>
        </div>

        {/* Connection Status / Progress */}
        {isConnecting ? (
          <div className="space-y-3 py-4 text-center">
            <p className="text-xs text-[#17A9C9] font-bold tracking-widest">
              ESTABLISHING HARDWARE BUS LINK...
            </p>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-[#17A9C9] to-emerald-400 transition-all duration-75 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span>SYNCHRONIZING DMA BUFFERS</span>
              <span>{progress}%</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Start Mission Action */}
            <button
              onClick={startConnection}
              className="w-full py-3.5 px-6 rounded-lg bg-[#17A9C9] text-[#0A0E14] font-bold text-sm hover:bg-[#17A9C9]/90 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#17A9C9]/20"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START NEW TELEMETRY MISSION</span>
            </button>

            {/* Saved Missions Log Section */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-[#8FA3B8] font-bold">
                <span className="flex items-center gap-1.5">
                  <History className="w-4 h-4 text-[#17A9C9]" />
                  SAVED MISSIONS ARCHIVE ({savedMissions.length})
                </span>
              </div>

              {savedMissions.length === 0 ? (
                <div className="p-4 text-center bg-[#0A0E14]/60 rounded-lg border border-slate-800 text-[11px] text-slate-500">
                  No saved missions in local memory yet. Completed missions will automatically register here.
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {savedMissions.map((m, idx) => (
                    <div
                      key={m.missionId || idx}
                      className="p-3 bg-[#0A0E14]/70 border border-slate-800 rounded-lg text-xs flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#17A9C9]">{m.missionId}</span>
                          <span className="text-[10px] text-slate-400">({m.auvId})</span>
                        </div>
                        <div className="text-[10px] text-[#8FA3B8] flex items-center gap-3">
                          <span>Duration: <strong className="text-[#FFB100]">{formatDuration(m.durationSec)}</strong></span>
                          <span>Pings: <strong className="text-emerald-400">{m.totalPingsSent}</strong></span>
                          <span>Max Depth: <strong className="text-[#17A9C9]">{m.maxDepthM.toFixed(1)}m</strong></span>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(m.startTime).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Back / Cancel */}
        <div className="flex justify-center pt-2">
          <button
            onClick={onCancel}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Return to Landing Hero
          </button>
        </div>
      </div>
    </div>
  );
};
