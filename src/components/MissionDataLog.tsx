import React, { useState, useRef, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Tag, 
  Download, 
  ArrowDown, 
  Plus, 
  Database,
  Sliders,
  Filter
} from 'lucide-react';
import { MissionTelemetryLog } from '../types';

interface MissionDataLogProps {
  logs: MissionTelemetryLog[];
  onAddNote: (note: string) => void;
  onOpenSummaryModal: () => void;
}

export const MissionDataLog: React.FC<MissionDataLogProps> = ({
  logs,
  onAddNote,
  onOpenSummaryModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedProfileFilter, setSelectedProfileFilter] = useState('ALL');
  const tableTopRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (autoScroll && tableBottomRef.current) {
      tableBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs.length, autoScroll]);

  const scrollToTop = () => {
    setAutoScroll(false);
    if (tableTopRef.current) {
      tableTopRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    if (tableBottomRef.current) {
      tableBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAddMarkerNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddNote(newNoteText.trim());
    setNewNoteText('');
  };

  const filteredLogs = logs.filter((log) => {
    if (selectedProfileFilter !== 'ALL' && log.profileId !== selectedProfileFilter) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        log.timestamp.toLowerCase().includes(q) ||
        log.profileName.toLowerCase().includes(q) ||
        log.waveformType.toLowerCase().includes(q) ||
        (log.note && log.note.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="bg-[#0B1F3A]/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col h-full min-h-[600px]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#17A9C9]/10 border border-[#17A9C9]/30 text-[#17A9C9]">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#E8EEF2]">
                MISSION TELEMETRY DATA LOG
              </h3>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-[#17A9C9] border border-slate-700">
                {logs.length} records
              </span>
            </div>
            <p className="text-[11px] text-[#8FA3B8]">
              High-Frequency Synchronous Hydrographic & Waveform Telemetry
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={scrollToTop}
            title="Jump to Top / Earliest Log Records"
            className="px-2.5 py-1 text-xs font-mono rounded bg-[#0A0E14] text-[#17A9C9] border border-slate-700 hover:border-[#17A9C9] transition-colors"
          >
            ↑ Jump Top
          </button>
          <button
            onClick={scrollToBottom}
            title="Jump to Bottom / Latest Live Stream"
            className="px-2.5 py-1 text-xs font-mono rounded bg-[#0A0E14] text-[#FFB100] border border-slate-700 hover:border-[#FFB100] transition-colors"
          >
            ↓ Jump Live
          </button>

          <label className="flex items-center gap-1.5 text-xs text-[#8FA3B8] cursor-pointer ml-1">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded bg-[#0A0E14] border-slate-700 accent-[#17A9C9]"
            />
            <span className="font-mono text-[11px]">Auto-scroll</span>
          </label>

          <button
            onClick={onOpenSummaryModal}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#17A9C9] text-[#0A0E14] hover:bg-[#17A9C9]/90 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Review Summary & Export
          </button>
        </div>
      </div>

      {/* Field Note / Marker Injection Bar */}
      <form onSubmit={handleAddMarkerNote} className="flex gap-2 mb-3 bg-[#0A0E14]/70 p-2.5 rounded-lg border border-slate-800">
        <div className="relative flex-1">
          <Tag className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#17A9C9]" />
          <input
            type="text"
            placeholder="Tag acoustic waypoint or observation (e.g. 'Thermocline boundary crossed', 'Sub-bottom layer observed')..."
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            className="w-full bg-[#0B1F3A] border border-slate-700 rounded pl-8 pr-3 py-1.5 text-xs text-[#E8EEF2] placeholder-slate-500 focus:outline-none focus:border-[#17A9C9]"
          />
        </div>
        <button
          type="submit"
          disabled={!newNoteText.trim()}
          className="px-3 py-1.5 rounded bg-[#17A9C9]/20 text-[#17A9C9] border border-[#17A9C9]/40 hover:bg-[#17A9C9]/30 text-xs font-semibold flex items-center gap-1 disabled:opacity-50 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Tag</span>
        </button>
      </form>

      {/* Search and Profile Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 mb-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Filter records or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0A0E14] border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-[#E8EEF2] placeholder-slate-500 focus:outline-none focus:border-[#17A9C9]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[11px] text-[#8FA3B8] font-mono">Profile Filter:</span>
          <select
            value={selectedProfileFilter}
            onChange={(e) => setSelectedProfileFilter(e.target.value)}
            className="bg-[#0A0E14] border border-slate-800 rounded px-2.5 py-1 text-xs text-[#E8EEF2] font-mono focus:outline-none focus:border-[#17A9C9]"
          >
            <option value="ALL">All Profiles</option>
            <option value="P1_SHALLOW">PRF-01 (Shallow)</option>
            <option value="P2_THERMOCLINE">PRF-02 (Thermocline)</option>
            <option value="P3_DEEP_CHIRP">PRF-03 (Deep Bathymetry)</option>
            <option value="P4_TURBID_CLUTTER">PRF-04 (Turbid Clutter)</option>
            <option value="P5_ECO_SAFE">PRF-05 (Eco Safe)</option>
          </select>
        </div>
      </div>

      {/* Telemetry Log Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto rounded-lg border border-slate-800 bg-[#070B10] relative">
        <div ref={tableTopRef} />
        <table className="w-full text-left text-xs font-mono border-collapse whitespace-nowrap">
          <thead className="bg-[#0A0E14] sticky top-0 border-b border-slate-800 text-[10px] uppercase text-[#8FA3B8] tracking-wider z-10">
            <tr>
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-2.5">Depth (m)</th>
              <th className="py-2.5 px-2.5">Temp (°C)</th>
              <th className="py-2.5 px-2.5">Turbidity (NTU)</th>
              <th className="py-2.5 px-2.5">Pressure (bar)</th>
              <th className="py-2.5 px-2.5">Sound c (m/s)</th>
              <th className="py-2.5 px-2.5">Battery</th>
              <th className="py-2.5 px-2.5">Active Profile</th>
              <th className="py-2.5 px-2.5">Carrier Sweep</th>
              <th className="py-2.5 px-2.5">Pulse (τ)</th>
              <th className="py-2.5 px-2.5">Power</th>
              <th className="py-2.5 px-3">Field Notes / Tags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-[#E8EEF2]">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-8 text-center text-[#8FA3B8]">
                  No telemetry records captured yet. Connect to vehicle to begin stream.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log, index) => {
                const isEven = index % 2 === 0;
                return (
                  <tr 
                    key={log.id} 
                    className={`hover:bg-[#17A9C9]/10 transition-colors ${
                      log.note ? 'bg-[#FFB100]/5 font-medium' : isEven ? 'bg-[#0A0E14]/40' : 'bg-transparent'
                    }`}
                  >
                    <td className="py-2 px-3 text-[#8FA3B8]">
                      {log.timestamp} <span className="text-[10px] text-slate-500">T+{log.missionTimeSec}s</span>
                    </td>
                    <td className="py-2 px-2.5 font-bold text-[#17A9C9]">
                      {log.depth.toFixed(1)}
                    </td>
                    <td className="py-2 px-2.5 text-cyan-300">
                      {log.temperature.toFixed(1)}
                    </td>
                    <td className="py-2 px-2.5 text-amber-300">
                      {log.turbidity.toFixed(1)}
                    </td>
                    <td className="py-2 px-2.5 text-emerald-300">
                      {log.pressure.toFixed(2)}
                    </td>
                    <td className="py-2 px-2.5 text-slate-300">
                      {log.soundVelocity.toFixed(1)}
                    </td>
                    <td className="py-2 px-2.5">
                      <span className={log.batteryPercent < 25 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                        {log.batteryPercent.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-2 px-2.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#0B1F3A] border border-slate-700 text-[#E8EEF2]">
                        {log.profileName}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 text-[#FFB100]">
                      {log.startFreqKhz.toFixed(0)} → {log.endFreqKhz.toFixed(0)} kHz
                    </td>
                    <td className="py-2 px-2.5 text-slate-300">
                      {log.pulseDurationMs.toFixed(1)} ms
                    </td>
                    <td className="py-2 px-2.5 text-slate-300">
                      {log.txPowerWatts.toFixed(0)} W
                    </td>
                    <td className="py-2 px-3">
                      {log.note ? (
                        <span className="px-2 py-0.5 rounded bg-[#FFB100]/20 text-[#FFB100] border border-[#FFB100]/40 text-[11px] font-sans">
                          {log.note}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div ref={tableBottomRef} />
      </div>
    </div>
  );
};
