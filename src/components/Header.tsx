import React from 'react';
import { 
  Radio, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  Square, 
  Unplug, 
  Cable, 
  Layers, 
  Sliders,
  AlertTriangle,
  Cpu,
  Waves,
  Box
} from 'lucide-react';
import { ConnectionState, SonarProfile } from '../types';
import { soundEngine } from '../utils/audio';

interface HeaderProps {
  connectionState: ConnectionState;
  onOpenConnectModal: () => void;
  onDisconnect: () => void;
  isStreamingPaused: boolean;
  onTogglePauseStream: () => void;
  onEndMission: () => void;
  missionTimeSec: number;
  totalPings: number;
  activeProfile: SonarProfile;
  unreadAlertCount: number;
  onSelectTab: (tab: string) => void;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({
  connectionState,
  onOpenConnectModal,
  onDisconnect,
  isStreamingPaused,
  onTogglePauseStream,
  onEndMission,
  missionTimeSec,
  totalPings,
  activeProfile,
  unreadAlertCount,
  onSelectTab,
  activeTab,
}) => {
  const [isMuted, setIsMuted] = React.useState(false);

  const toggleMute = () => {
    soundEngine.isMuted = !soundEngine.isMuted;
    setIsMuted(soundEngine.isMuted);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isConnected = connectionState === 'connected';

  return (
    <header className="sticky top-0 z-40 bg-[#0B1F3A]/95 backdrop-blur-md border-b border-[#17A9C9]/20 px-4 py-2.5">
      <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSelectTab('landing')}>
            {/* Concept A "Adaptive Ring" Logo Icon */}
            <div className="relative w-9 h-9 rounded-lg bg-[#0A0E14] border border-[#17A9C9]/40 flex items-center justify-center p-1 shadow-inner shadow-[#17A9C9]/20">
              <svg viewBox="0 0 40 40" className="w-full h-full">
                {/* Incomplete circular sonar arc */}
                <path 
                  d="M 20 5 A 15 15 0 1 1 5 20" 
                  fill="none" 
                  stroke="#17A9C9" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                />
                {/* Secondary inner ring arc */}
                <path 
                  d="M 20 11 A 9 9 0 1 1 11 20" 
                  fill="none" 
                  stroke="#17A9C9" 
                  strokeWidth="1.5" 
                  strokeOpacity="0.5"
                  strokeLinecap="round" 
                />
                {/* Adaptive Chirp waveform breaking through gap */}
                <path 
                  d="M 5 20 Q 9 14, 13 20 T 21 20 T 27 20 T 31 16 T 35 24" 
                  fill="none" 
                  stroke="#FFB100" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                />
              </svg>
              {/* Pulse indicator */}
              {isConnected && !isStreamingPaused && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#17A9C9] rounded-full animate-ping opacity-75" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-lg tracking-widest text-[#E8EEF2]">
                  AQUACHIRP
                </span>
              </div>
              <p className="text-[11px] text-[#8FA3B8] tracking-tight -mt-0.5 hidden sm:block">
                Adaptive Software-Defined Sonar Transmitter Payload
              </p>
            </div>
          </div>

          {/* Mobile Connect Button */}
          <div className="flex items-center gap-2 md:hidden">
            {!isConnected ? (
              <button
                id="btn-connect-mobile"
                onClick={onOpenConnectModal}
                className="px-3 py-1 text-xs font-semibold rounded bg-[#17A9C9] text-[#0A0E14] flex items-center gap-1.5 active:scale-95 transition-transform"
              >
                <Cable className="w-3.5 h-3.5" />
                Connect
              </button>
            ) : (
              <button
                id="btn-end-mission-mobile"
                onClick={onEndMission}
                className="px-3 py-1 text-xs font-semibold rounded bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1.5"
              >
                <Square className="w-3.5 h-3.5" />
                End
              </button>
            )}
          </div>
        </div>

        {/* Right Section: Navigation Tabs & Controls */}
        <div className="flex items-center gap-2.5">
          {/* Navigation Pill Switcher */}
          <nav className="flex items-center bg-[#0A0E14] p-1 rounded-lg border border-slate-800 text-xs overflow-x-auto">
            <button
              id="tab-btn-dashboard"
              onClick={() => onSelectTab('dashboard')}
              className={`px-2.5 py-1 rounded transition-all font-medium flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'dashboard' 
                  ? 'bg-[#17A9C9] text-[#0A0E14] font-semibold shadow-sm' 
                  : 'text-[#8FA3B8] hover:text-[#E8EEF2]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Live Dashboard</span>
            </button>
            <button
              id="tab-btn-simulator"
              onClick={() => onSelectTab('simulator')}
              className={`px-2.5 py-1 rounded transition-all font-medium flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'simulator' 
                  ? 'bg-[#17A9C9] text-[#0A0E14] font-semibold shadow-sm' 
                  : 'text-[#8FA3B8] hover:text-[#E8EEF2]'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Simulator</span>
            </button>
            <button
              id="tab-btn-subsystems"
              onClick={() => onSelectTab('subsystems')}
              className={`px-2.5 py-1 rounded transition-all font-medium flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'subsystems' 
                  ? 'bg-[#17A9C9] text-[#0A0E14] font-semibold shadow-sm' 
                  : 'text-[#8FA3B8] hover:text-[#E8EEF2]'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Subsystems</span>
            </button>
            <button
              id="tab-btn-environment"
              onClick={() => onSelectTab('environment')}
              className={`px-2.5 py-1 rounded transition-all font-medium flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'environment' 
                  ? 'bg-[#17A9C9] text-[#0A0E14] font-semibold shadow-sm' 
                  : 'text-[#8FA3B8] hover:text-[#E8EEF2]'
              }`}
            >
              <Waves className="w-3.5 h-3.5" />
              <span>Water Column</span>
            </button>
            <button
              id="tab-btn-logs"
              onClick={() => onSelectTab('logs')}
              className={`px-2.5 py-1 rounded transition-all font-medium flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'logs' 
                  ? 'bg-[#17A9C9] text-[#0A0E14] font-semibold shadow-sm' 
                  : 'text-[#8FA3B8] hover:text-[#E8EEF2]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Logs</span>
            </button>
            <button
              id="tab-btn-alerts"
              onClick={() => onSelectTab('alerts')}
              className={`px-2.5 py-1 rounded transition-all font-medium flex items-center gap-1.5 whitespace-nowrap relative ${
                activeTab === 'alerts' 
                  ? 'bg-[#17A9C9] text-[#0A0E14] font-semibold shadow-sm' 
                  : 'text-[#8FA3B8] hover:text-[#E8EEF2]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Alerts</span>
              {unreadAlertCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#FFB100] text-[#0A0E14] text-[10px] font-bold flex items-center justify-center -ml-0.5">
                  {unreadAlertCount}
                </span>
              )}
            </button>
          </nav>

          {/* Sound Mute/Unmute */}
          <button
            id="btn-toggle-sound"
            onClick={toggleMute}
            title={isMuted ? 'Unmute Sonar Chirps' : 'Mute Sonar Chirps'}
            className="p-1.5 rounded-lg border border-slate-800 bg-[#0A0E14] text-[#8FA3B8] hover:text-[#17A9C9] transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#17A9C9]" />}
          </button>

          {/* Pause / Resume Streaming */}
          {isConnected && (
            <button
              id="btn-pause-stream"
              onClick={onTogglePauseStream}
              title={isStreamingPaused ? 'Resume Telemetry Stream' : 'Pause Telemetry Stream'}
              className="p-1.5 rounded-lg border border-slate-800 bg-[#0A0E14] text-[#8FA3B8] hover:text-[#FFB100] transition-colors"
            >
              {isStreamingPaused ? <Play className="w-4 h-4 text-[#17A9C9]" /> : <Pause className="w-4 h-4" />}
            </button>
          )}

          {/* Connect / Disconnect / End Mission */}
          {!isConnected ? (
            <button
              id="btn-connect-header"
              onClick={onOpenConnectModal}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#17A9C9] text-[#0A0E14] hover:bg-[#17A9C9]/90 flex items-center gap-1.5 transition-all shadow-sm shadow-[#17A9C9]/30"
            >
              <Cable className="w-3.5 h-3.5" />
              <span>Connect AUV</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="btn-end-mission"
                onClick={onEndMission}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 flex items-center gap-1.5 transition-all"
                title="End mission, review summary and export CSV logs"
              >
                <Square className="w-3.5 h-3.5 fill-red-400" />
                <span>End Mission & Export</span>
              </button>
              <button
                id="btn-disconnect"
                onClick={onDisconnect}
                className="p-1.5 rounded-lg border border-slate-800 bg-[#0A0E14] text-[#8FA3B8] hover:text-red-400 transition-colors"
                title="Disconnect Payload"
              >
                <Unplug className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
