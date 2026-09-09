import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Flame, 
  Zap, 
  BellRing, 
  Check, 
  Trash2, 
  Search,
  Filter
} from 'lucide-react';
import { MissionAlert, AlertSeverity } from '../types';

interface AlertsPanelProps {
  alerts: MissionAlert[];
  onClearAlerts: () => void;
  onMarkAllRead: () => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  onClearAlerts,
  onMarkAllRead,
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlerts = alerts.filter((alert) => {
    if (severityFilter !== 'all' && alert.severity !== severityFilter) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        alert.title.toLowerCase().includes(q) ||
        alert.message.toLowerCase().includes(q) ||
        alert.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return {
          icon: <Flame className="w-3.5 h-3.5 text-rose-400" />,
          label: 'CRITICAL',
          color: 'bg-rose-500/15 border-rose-500/40 text-rose-400',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-[#FFB100]" />,
          label: 'WARNING',
          color: 'bg-[#FFB100]/15 border-[#FFB100]/40 text-[#FFB100]',
        };
      case 'adapt':
        return {
          icon: <Zap className="w-3.5 h-3.5 text-[#17A9C9]" />,
          label: 'ADAPTATION',
          color: 'bg-[#17A9C9]/15 border-[#17A9C9]/40 text-[#17A9C9]',
        };
      default:
        return {
          icon: <Info className="w-3.5 h-3.5 text-slate-400" />,
          label: 'INFO',
          color: 'bg-slate-800 border-slate-700 text-slate-300',
        };
    }
  };

  return (
    <div className="bg-[#0B1F3A]/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col h-full min-h-[550px]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#FFB100]/10 border border-[#FFB100]/30 text-[#FFB100]">
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#E8EEF2]">
                ANOMALY DETECTION & REAL-TIME ALERTS
              </h3>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {alerts.length} events logged
              </span>
            </div>
            <p className="text-[11px] text-[#8FA3B8]">
              Automated Environmental Transitions & Hardware Safety Triggers
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onMarkAllRead}
            className="px-2.5 py-1 text-xs font-medium rounded bg-[#0A0E14] text-[#8FA3B8] border border-slate-800 hover:text-[#17A9C9] flex items-center gap-1 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Mark Read
          </button>
          <button
            onClick={onClearAlerts}
            className="px-2.5 py-1 text-xs font-medium rounded bg-[#0A0E14] text-[#8FA3B8] border border-slate-800 hover:text-rose-400 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-1 bg-[#0A0E14] p-1 rounded-lg border border-slate-800 text-xs w-full sm:w-auto">
          {['all', 'adapt', 'warning', 'critical'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded font-mono text-[11px] uppercase transition-all ${
                severityFilter === sev
                  ? 'bg-[#17A9C9] text-[#0A0E14] font-bold shadow-sm'
                  : 'text-[#8FA3B8] hover:text-[#E8EEF2]'
              }`}
            >
              {sev === 'all' ? 'All Alerts' : sev}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search alerts or triggers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0A0E14] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#E8EEF2] placeholder-slate-500 focus:outline-none focus:border-[#17A9C9]"
          />
        </div>
      </div>

      {/* Alert Feed List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filteredAlerts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-[#0A0E14]/40 rounded-lg border border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-400/60 mb-2" />
            <p className="font-heading font-semibold text-sm text-[#E8EEF2]">All Systems Operating Within Tolerance</p>
            <p className="text-xs text-[#8FA3B8] max-w-sm mt-1">
              No anomalies or environmental transitions exceeding trigger thresholds.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const badge = getSeverityBadge(alert.severity);
            const formatSec = (s: number) => `T+${Math.floor(s / 60)}m ${(s % 60).toString().padStart(2, '0')}s`;

            return (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border transition-all ${
                  !alert.read
                    ? 'bg-[#0A0E14] border-slate-700 shadow-md'
                    : 'bg-[#0A0E14]/50 border-slate-800/80 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border flex items-center gap-1 font-bold ${badge.color}`}>
                      {badge.icon}
                      {badge.label}
                    </span>
                    <h4 className="font-semibold text-xs text-[#E8EEF2]">
                      {alert.title}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[10px] text-[#8FA3B8] block">
                      {alert.timestamp} ({formatSec(alert.missionTimeSec)})
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#8FA3B8] mt-1 leading-relaxed pl-1">
                  {alert.message}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
