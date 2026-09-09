import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  Compass, 
  Thermometer, 
  Eye, 
  Radio, 
  BatteryCharging, 
  Layers, 
  AlertTriangle, 
  Clock, 
  RotateCcw,
  X,
  FileCode,
  History,
  ChevronRight
} from 'lucide-react';
import { MissionSummary } from '../types';
import { generateMissionCSV, downloadCSV, downloadJSON } from '../utils/csvExport';

interface MissionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: MissionSummary;
  savedMissions?: MissionSummary[];
  onSelectSavedMission?: (mission: MissionSummary) => void;
  onRestartMission: () => void;
}

export const MissionSummaryModal: React.FC<MissionSummaryModalProps> = ({
  isOpen,
  onClose,
  summary,
  savedMissions = [],
  onSelectSavedMission,
  onRestartMission,
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

  if (!isOpen) return null;

  const handleExportCSV = () => {
    const csvData = generateMissionCSV(summary);
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    downloadCSV(csvData, `aquachirp_mission_${summary.missionId}_${dateStr}.csv`);
  };

  const handleExportJSON = () => {
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    downloadJSON(summary, `aquachirp_mission_${summary.missionId}_${dateStr}.json`);
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s (${sec} seconds)`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0E14]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0B1F3A] border border-[#17A9C9]/40 rounded-xl shadow-2xl shadow-[#17A9C9]/15 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-[#0A0E14]/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#17A9C9]/20 text-[#17A9C9] border border-[#17A9C9]/40">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-base text-[#E8EEF2]">
                  POST-MISSION DEBRIEF & SUMMARY
                </h2>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  MISSION COMPLETE
                </span>
              </div>
              <p className="text-xs text-[#8FA3B8]">
                Aquachirp Sonar Telemetry • CHIRPFLEX Adaptive Payload Log
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle Buttons */}
            <div className="flex bg-[#0A0E14] border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveTab('current')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'current'
                    ? 'bg-[#17A9C9] text-[#0A0E14] font-bold'
                    : 'text-[#8FA3B8] hover:text-[#E8EEF2]'
                }`}
              >
                Current Debrief
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'bg-[#17A9C9] text-[#0A0E14] font-bold'
                    : 'text-[#8FA3B8] hover:text-[#E8EEF2]'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Saved History ({savedMissions.length})</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#8FA3B8] hover:text-[#E8EEF2] hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {activeTab === 'history' ? (
            <div className="space-y-3 font-mono text-xs">
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#8FA3B8]">
                ARCHIVED MISSION LOGS & DEBRIEFS ({savedMissions.length})
              </h3>
              {savedMissions.length === 0 ? (
                <div className="p-8 text-center bg-[#0A0E14]/60 rounded-lg border border-slate-800 text-[#8FA3B8]">
                  No prior missions saved. Completed missions will automatically be recorded here.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {savedMissions.map((m, idx) => {
                    const isSelected = m.missionId === summary.missionId;
                    return (
                      <div
                        key={m.missionId || idx}
                        onClick={() => {
                          if (onSelectSavedMission) onSelectSavedMission(m);
                          setActiveTab('current');
                        }}
                        className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                          isSelected
                            ? 'bg-[#17A9C9]/15 border-[#17A9C9] text-white shadow-md shadow-[#17A9C9]/10'
                            : 'bg-[#0A0E14]/70 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-[#0A0E14]'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#17A9C9]">{m.missionId}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                              {m.auvId}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                                Active View
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#8FA3B8] flex items-center gap-3">
                            <span>Duration: <strong className="text-[#FFB100]">{formatDuration(m.durationSec)}</strong></span>
                            <span>Pings: <strong className="text-emerald-400">{m.totalPingsSent}</strong></span>
                            <span>Max Depth: <strong className="text-[#17A9C9]">{m.maxDepthM.toFixed(1)}m</strong></span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[#8FA3B8]">
                          <span className="text-[10px]">{new Date(m.startTime).toLocaleTimeString()}</span>
                          <ChevronRight className="w-4 h-4 text-[#17A9C9]" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Mission Metadata Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0A0E14]/80 p-3.5 rounded-lg border border-slate-800 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-[#8FA3B8] block">MISSION ID</span>
                  <span className="font-bold text-[#17A9C9]">{summary.missionId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8FA3B8] block">AUV PLATFORM</span>
                  <span className="font-bold text-[#E8EEF2]">{summary.auvId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8FA3B8] block">TOTAL DURATION</span>
                  <span className="font-bold text-[#FFB100]">{formatDuration(summary.durationSec)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8FA3B8] block">TOTAL PINGS SENT</span>
                  <span className="font-bold text-emerald-400">{summary.totalPingsSent} pings</span>
                </div>
              </div>

              {/* Key Oceanographic & Acoustic Metrics */}
              <div>
                <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#8FA3B8] mb-2.5">
                  Oceanographic & Acoustic Performance Summary
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* Depth Traversal */}
                  <div className="bg-[#0A0E14]/70 p-3 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs text-[#8FA3B8] mb-1">
                      <Compass className="w-3.5 h-3.5 text-[#17A9C9]" />
                      <span>Depth Profile</span>
                    </div>
                    <div className="font-mono text-xs space-y-0.5">
                      <div className="flex justify-between">
                        <span className="text-[#8FA3B8]">Max Depth:</span>
                        <span className="font-bold text-[#E8EEF2]">{summary.maxDepthM.toFixed(1)} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8FA3B8]">Min Depth:</span>
                        <span className="text-slate-300">{summary.minDepthM.toFixed(1)} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8FA3B8]">Mean Depth:</span>
                        <span className="text-[#17A9C9]">{summary.avgDepthM.toFixed(1)} m</span>
                      </div>
                    </div>
                  </div>

                  {/* Temperature & Water Quality */}
                  <div className="bg-[#0A0E14]/70 p-3 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs text-[#8FA3B8] mb-1">
                      <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Water Column</span>
                    </div>
                    <div className="font-mono text-xs space-y-0.5">
                      <div className="flex justify-between">
                        <span className="text-[#8FA3B8]">Temp Range:</span>
                        <span className="font-bold text-[#E8EEF2]">{summary.minTempC.toFixed(1)}° - {summary.maxTempC.toFixed(1)}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8FA3B8]">Peak Turbidity:</span>
                        <span className="text-amber-300 font-bold">{summary.maxTurbidityNtu.toFixed(1)} NTU</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8FA3B8]">Thermocline:</span>
                        <span className="text-slate-300">Traversed</span>
                      </div>
                    </div>
                  </div>

                  {/* Acoustic Power & Payload Energy */}
                  <div className="bg-[#0A0E14]/70 p-3 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs text-[#8FA3B8] mb-1">
                      <BatteryCharging className="w-3.5 h-3.5 text-[#FFB100]" />
                      <span>Energy & Events</span>
                    </div>
                    <div className="font-mono text-xs space-y-0.5">
                      <div className="flex justify-between">
                        <span className="text-[#8FA3B8]">Acoustic Energy:</span>
                        <span className="font-bold text-[#FFB100]">{summary.totalEnergyWh.toFixed(2)} Wh</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8FA3B8]">Profile Adaptations:</span>
                        <span className="font-bold text-[#17A9C9]">{summary.profileAdaptationCount} events</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8FA3B8]">Total Anomalies:</span>
                        <span className="text-rose-400 font-bold">{summary.alertCount} ({summary.criticalAlertCount} crit)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Breakdown Matrix */}
              <div>
                <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#8FA3B8] mb-2.5">
                  Adaptive Transmission Profile Distribution
                </h3>
                <div className="bg-[#0A0E14]/80 p-3 rounded-lg border border-slate-800 space-y-2">
                  {Object.entries(summary.profileBreakdown).map(([profileName, count]) => {
                    const numCount = Number(count);
                    const percentage = summary.totalPingsSent > 0 ? (numCount / summary.totalPingsSent) * 100 : 0;
                    return (
                      <div key={profileName} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-[#E8EEF2]">{profileName}</span>
                          <span className="text-[#8FA3B8]">{numCount} pings ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#17A9C9] to-[#FFB100]"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CSV Export Instructions / Format Spec */}
              <div className="bg-[#0A0E14]/50 p-3 rounded-lg border border-slate-800/80 text-xs text-[#8FA3B8] leading-relaxed">
                <p className="font-semibold text-[#E8EEF2] mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#17A9C9]" />
                  Data Log Export Standards
                </p>
                The exported CSV log incorporates ISO timestamps, calibrated hydrographic parameters (Depth, Temperature, Turbidity, MacKenzie Sound Velocity), real-time LFM Chirp bandwidth, sweep rate, and transmission power. Ready for direct ingestion into Python pandas, MATLAB, or hydrographic GIS analysis suites.
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-700/60 bg-[#0A0E14]/80">
          <button
            type="button"
            onClick={onRestartMission}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-lg bg-[#0B1F3A] text-[#8FA3B8] hover:text-[#E8EEF2] border border-slate-700 hover:border-slate-600 transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset & New Mission</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleExportJSON}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#0B1F3A] text-slate-300 border border-slate-700 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>JSON Telemetry</span>
            </button>

            <button
              type="button"
              id="btn-export-csv"
              onClick={handleExportCSV}
              className="w-full sm:w-auto px-5 py-2 text-xs font-bold rounded-lg bg-[#17A9C9] text-[#0A0E14] hover:bg-[#17A9C9]/90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#17A9C9]/25"
            >
              <Download className="w-4 h-4" />
              <span>Export Mission Logs (CSV)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
