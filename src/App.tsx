import React, { useState, useEffect, useRef } from 'react';
import { 
  ConnectionState, 
  ConnectionConfig, 
  EnvironmentalData, 
  SonarProfile, 
  HardwareSubsystem, 
  MissionAlert, 
  MissionTelemetryLog, 
  MissionSummary 
} from './types';
import { 
  calculateSoundVelocity, 
  calculateRangeResolutionCm, 
  determineAdaptiveProfile, 
  SONAR_PROFILE_PRESETS 
} from './utils/sonarCalculations';
import { soundEngine } from './utils/audio';
import { Header } from './components/Header';
import { ConnectionModal } from './components/ConnectionModal';
import { BootLoadingPage } from './components/BootLoadingPage';
import { LaunchHero } from './components/LaunchHero';
import { ConnectingPage } from './components/ConnectingPage';
import { EnvironmentalPanel } from './components/EnvironmentalPanel';
import { SonarProfilePanel } from './components/SonarProfilePanel';
import { WaveformOscilloscope } from './components/WaveformOscilloscope';
import { HardwareStatusPanel } from './components/HardwareStatusPanel';
import { SubsystemsPage } from './components/SubsystemsPage';
import { EnvironmentPage } from './components/EnvironmentPage';
import { AlertsPanel } from './components/AlertsPanel';
import { MissionDataLog } from './components/MissionDataLog';
import { MissionSummaryModal } from './components/MissionSummaryModal';
import { ThreeAuvExplorer } from './components/ThreeAuvExplorer';
import { AuvSonar2dSimulator } from './components/AuvSonar2dSimulator';
import { Sliders, RefreshCw, Layout, Eye, Play, Pause } from 'lucide-react';

type AppStage = 'boot' | 'landing' | 'connecting' | 'operational';
type ActiveTab = 'dashboard' | 'simulator' | 'subsystems' | 'environment' | 'logs' | 'alerts';

export default function App() {
  const [appStage, setAppStage] = useState<AppStage>('boot');
  
  // Connection State
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [connectionConfig, setConnectionConfig] = useState<ConnectionConfig>({
    mode: 'hardware_bus',
    portOrAddress: 'Internal Telemetry Bus',
    baudRate: 115200,
    sampleRateMs: 1000,
    auvId: 'AUV-HYDRO-ALPHA-01',
    payloadFirmware: 'CHIRPFLEX-ARM-v2.4.1',
  });
  
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Split-Screen OBS Control State
  const [splitScreenMode, setSplitScreenMode] = useState<'single' | 'split-horizontal' | 'split-vertical'>('split-horizontal');
  const [splitRatio, setSplitRatio] = useState<number>(45); // 45% control, 55% live output

  // Mission Tracking
  const [missionStartTime, setMissionStartTime] = useState<string>(() => new Date().toISOString());
  const [missionTimeSec, setMissionTimeSec] = useState(0);
  const [totalPings, setTotalPings] = useState(0);
  const [isStreamingPaused, setIsStreamingPaused] = useState(false);
  const [missionSummary, setMissionSummary] = useState<MissionSummary | null>(null);
  const [savedMissions, setSavedMissions] = useState<MissionSummary[]>(() => {
    try {
      const stored = localStorage.getItem('aquachirp_saved_missions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Live Interactive Control Inputs (Synchronized with HTML & Dashboard)
  const [environmental, setEnvironmental] = useState<EnvironmentalData>({
    depth: 23.4,
    temperature: 19.6,
    turbidity: 11.6,
    pressure: 3.30,
    salinity: 35.0,
    soundVelocity: 1520.8,
    ambientNoise: 48.5,
    batteryVoltage: 16.0,
    batteryPercent: 92,
    batteryCurrent: 1.85,
    estimatedRuntimeMinutes: 257,
  });

  // Active Sonar Profile
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [activeProfile, setActiveProfile] = useState<SonarProfile>(() => {
    return determineAdaptiveProfile({
      depth: 23.4,
      temperature: 19.6,
      turbidity: 11.6,
      pressure: 3.30,
      salinity: 35.0,
      soundVelocity: 1520.8,
      ambientNoise: 48.5,
      batteryVoltage: 16.0,
      batteryPercent: 92,
      batteryCurrent: 1.85,
      estimatedRuntimeMinutes: 257,
    });
  });

  // Hardware Subsystem Status
  const [hardware, setHardware] = useState<HardwareSubsystem>({
    controller: {
      status: 'nominal',
      mcuTempC: 38.4,
      cpuLoadPercent: 8,
      clockSpeedMhz: 480,
      dmaActive: true,
      dmaBufferState: 'PING',
      timerJitterPs: 12,
    },
    dac: {
      status: 'nominal',
      resolutionBits: 12,
      sampleRateMsps: 2.4,
      outputSwingVpp: 3.3,
    },
    afe: {
      status: 'nominal',
      stageTempC: 41.2,
      vswr: 1.08,
      transducerImpedanceOhm: 50.2,
      filterCutoffKhz: 250,
      ampGainDb: 24,
    },
  });

  // Alerts & Anomalies
  const [alerts, setAlerts] = useState<MissionAlert[]>([]);
  // Mission Data Logs
  const [logs, setLogs] = useState<MissionTelemetryLog[]>([]);

  // Previous state ref to track crossings
  const prevProfileRef = useRef<string>(activeProfile.id);
  const prevDepthBandRef = useRef<'shallow' | 'thermocline' | 'deep'>('shallow');
  const prevTurbidityRef = useRef<number>(environmental.turbidity);
  const prevBatteryRef = useRef<number>(environmental.batteryPercent);

  // Helper to append alert
  const addAlert = (
    type: MissionAlert['type'],
    severity: MissionAlert['severity'],
    title: string,
    message: string
  ) => {
    const newAlert: MissionAlert = {
      id: `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString(),
      timestampMs: Date.now(),
      missionTimeSec,
      type,
      severity,
      title,
      message,
      read: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);

    if (severity === 'critical') {
      soundEngine.playAlert(true);
    } else if (severity === 'warning' || severity === 'adapt') {
      soundEngine.playAlert(false);
    }
  };

  // Connection Handler
  const handleConnect = (config: ConnectionConfig) => {
    setConnectionConfig(config);
    setConnectionState('connected');
    setAppStage('operational');
    setActiveTab('dashboard');
    const startTimeStr = new Date().toISOString();
    setMissionStartTime(startTimeStr);
    setMissionTimeSec(0);
    setTotalPings(0);
    setLogs([]);
    setAlerts([
      {
        id: `ALT-INIT-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        timestampMs: Date.now(),
        missionTimeSec: 0,
        type: 'INFO',
        severity: 'info',
        title: 'AUV Connection Established',
        message: `Linked to ${config.auvId} via ${config.mode.toUpperCase()} (${config.portOrAddress}). CHIRPFLEX payload active.`,
        read: false,
      },
    ]);
  };

  const handleDisconnect = () => {
    setConnectionState('disconnected');
    setIsStreamingPaused(false);
    setAppStage('connecting');
    addAlert('INFO', 'warning', 'AUV Telemetry Disconnected', 'Payload link cleanly closed by operator.');
  };

  // Mission Timer Loop
  useEffect(() => {
    if (connectionState !== 'connected' || isStreamingPaused) return;

    const timer = setInterval(() => {
      setMissionTimeSec((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [connectionState, isStreamingPaused]);

  // Telemetry Ping and Environmental Simulation Loop
  useEffect(() => {
    if (connectionState !== 'connected' || isStreamingPaused) return;

    const interval = setInterval(() => {
      setTotalPings((prev) => prev + 1);

      // Hydrostatic & acoustic calculations
      setEnvironmental((prev) => {
        const newPressure = 1.013 + prev.depth * 0.0981;
        const newSoundVelocity = calculateSoundVelocity(prev.temperature, prev.salinity, prev.depth);

        return {
          ...prev,
          pressure: newPressure,
          soundVelocity: newSoundVelocity,
          estimatedRuntimeMinutes: Math.floor((prev.batteryPercent / 100) * 280),
        };
      });

      // Toggle DMA buffer state
      setHardware((prev) => ({
        ...prev,
        controller: {
          ...prev.controller,
          dmaBufferState: prev.controller.dmaBufferState === 'PING' ? 'PONG' : 'PING',
          cpuLoadPercent: 7 + Math.random() * 3,
        },
      }));

      // Sound audio ping
      soundEngine.playChirp(
        activeProfile.startFreqKhz * 8,
        activeProfile.endFreqKhz * 8,
        Math.min(0.2, activeProfile.pulseDurationMs / 30)
      );
    }, connectionConfig.sampleRateMs);

    return () => clearInterval(interval);
  }, [connectionState, isStreamingPaused, connectionConfig, activeProfile]);

  // Adaptive Engine Reaction to Inputs
  useEffect(() => {
    if (connectionState !== 'connected') return;

    let currentBand: 'shallow' | 'thermocline' | 'deep' = 'shallow';
    if (environmental.depth < 35) currentBand = 'shallow';
    else if (environmental.depth < 95) currentBand = 'thermocline';
    else currentBand = 'deep';

    if (currentBand !== prevDepthBandRef.current) {
      addAlert(
        'THERMOCLINE_CROSS',
        'info',
        `Water Column Transition (${currentBand.toUpperCase()})`,
        `Vehicle depth adjusted to ${environmental.depth.toFixed(1)}m into ${currentBand} zone (c: ${environmental.soundVelocity.toFixed(1)} m/s).`
      );
      prevDepthBandRef.current = currentBand;
    }

    if (environmental.turbidity > 42 && prevTurbidityRef.current <= 42) {
      addAlert(
        'TURBIDITY_SPIKE',
        'warning',
        'Suspended Particulate Clutter Detected',
        `Optical backscatter set to ${environmental.turbidity.toFixed(1)} NTU.`
      );
    }
    prevTurbidityRef.current = environmental.turbidity;

    if (environmental.batteryPercent <= 30 && prevBatteryRef.current > 30) {
      addAlert(
        'BATTERY_LOW',
        'critical',
        'Battery Low Reserve Alert (≤30%)',
        `Vehicle bus voltage reached ${environmental.batteryVoltage.toFixed(2)}V (${environmental.batteryPercent.toFixed(0)}%). Power-saving profile engaged.`
      );
    }
    prevBatteryRef.current = environmental.batteryPercent;

    if (!isManualOverride) {
      const optimalProfile = determineAdaptiveProfile(environmental);

      if (optimalProfile.id !== prevProfileRef.current) {
        addAlert(
          'PROFILE_ADAPT',
          'adapt',
          `Adaptive Waveform Reconfigured (${optimalProfile.code})`,
          `Switched to "${optimalProfile.name}" (${optimalProfile.startFreqKhz}-${optimalProfile.endFreqKhz} kHz). Reason: ${optimalProfile.adaptationReason}`
        );
        prevProfileRef.current = optimalProfile.id;
      }

      setActiveProfile(optimalProfile);
    }
  }, [environmental, isManualOverride, connectionState]);

  // Synchronized Mission Log Recording
  useEffect(() => {
    if (connectionState !== 'connected' || totalPings === 0) return;

    const newLog: MissionTelemetryLog = {
      id: `LOG-${Date.now()}-${totalPings}`,
      timestamp: new Date().toLocaleTimeString(),
      missionTimeSec,
      depth: environmental.depth,
      temperature: environmental.temperature,
      turbidity: environmental.turbidity,
      pressure: environmental.pressure,
      soundVelocity: environmental.soundVelocity,
      batteryPercent: environmental.batteryPercent,
      batteryVoltage: environmental.batteryVoltage,
      profileId: activeProfile.id,
      profileName: activeProfile.name,
      waveformType: activeProfile.waveformType,
      startFreqKhz: activeProfile.startFreqKhz,
      endFreqKhz: activeProfile.endFreqKhz,
      bandwidthKhz: Math.abs(activeProfile.endFreqKhz - activeProfile.startFreqKhz),
      pulseDurationMs: activeProfile.pulseDurationMs,
      txPowerWatts: activeProfile.txPowerWatts,
      dutyCycle: activeProfile.dutyCyclePercent,
      activeAlertCount: alerts.length,
    };

    setLogs((prev) => [...prev, newLog]);
  }, [totalPings]);

  // Manual Profile Selection
  const handleSelectManualProfile = (profileId: string) => {
    const basePreset = SONAR_PROFILE_PRESETS[profileId];
    if (basePreset) {
      const bandwidthKhz = Math.abs(basePreset.endFreqKhz - basePreset.startFreqKhz);
      const res = calculateRangeResolutionCm(environmental.soundVelocity, bandwidthKhz);
      const manualProfile: SonarProfile = {
        ...basePreset,
        theoreticalRangeResCm: res,
        adaptationReason: 'Manually set in control desk.',
      };
      setActiveProfile(manualProfile);
      prevProfileRef.current = manualProfile.id;
      addAlert(
        'PROFILE_ADAPT',
        'warning',
        `Manual Profile Override: ${manualProfile.code}`,
        `Transmission set to ${manualProfile.name}.`
      );
    }
  };

  const handleAddNote = (noteText: string) => {
    setLogs((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      updated[lastIndex] = {
        ...updated[lastIndex],
        note: noteText,
      };
      return updated;
    });

    addAlert('INFO', 'info', 'Waypoint Tagged', `Observation: "${noteText}"`);
  };

  const handleEndMission = () => {
    const endTimeStr = new Date().toISOString();
    const durations = Math.max(1, missionTimeSec);
    const depths = logs.map((l) => l.depth);
    const temps = logs.map((l) => l.temperature);
    const turbidities = logs.map((l) => l.turbidity);

    const minDepthM = depths.length ? Math.min(...depths) : environmental.depth;
    const maxDepthM = depths.length ? Math.max(...depths) : environmental.depth;
    const avgDepthM = depths.length ? depths.reduce((a, b) => a + b, 0) / depths.length : environmental.depth;

    const minTempC = temps.length ? Math.min(...temps) : environmental.temperature;
    const maxTempC = temps.length ? Math.max(...temps) : environmental.temperature;
    const maxTurbidityNtu = turbidities.length ? Math.max(...turbidities) : environmental.turbidity;

    const totalEnergyWh = logs.reduce((acc, l) => {
      return acc + (l.txPowerWatts * (l.pulseDurationMs * 0.001) / 3600);
    }, 0);

    const profileBreakdown: Record<string, number> = {};
    logs.forEach((l) => {
      profileBreakdown[l.profileName] = (profileBreakdown[l.profileName] || 0) + 1;
    });

    const summary: MissionSummary = {
      missionId: `MSN-${Date.now().toString().slice(-6)}`,
      auvId: connectionConfig.auvId,
      startTime: missionStartTime || new Date().toISOString(),
      endTime: endTimeStr,
      durationSec: durations,
      totalPingsSent: totalPings,
      totalEnergyWh,
      minDepthM,
      maxDepthM,
      avgDepthM,
      minTempC,
      maxTempC,
      maxTurbidityNtu,
      profileAdaptationCount: alerts.filter((a) => a.type === 'PROFILE_ADAPT').length,
      alertCount: alerts.length,
      criticalAlertCount: alerts.filter((a) => a.severity === 'critical').length,
      profileBreakdown,
      logs,
    };

    setMissionSummary(summary);
    setSavedMissions((prev) => {
      const updated = [summary, ...prev];
      try {
        localStorage.setItem('aquachirp_saved_missions', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save mission to localStorage', e);
      }
      return updated;
    });
    setIsSummaryModalOpen(true);
  };

  const handleRestartMission = () => {
    setIsSummaryModalOpen(false);
    setConnectionState('disconnected');
    setIsStreamingPaused(false);
    setAppStage('connecting');
  };

  const unreadAlerts = alerts.filter((a) => !a.read).length;

  return (
    <div className="min-h-screen bg-[#0A0E14] text-[#E8EEF2] flex flex-col selection:bg-[#17A9C9] selection:text-[#0A0E14]">
      {/* Top Application Header */}
      <Header
        connectionState={connectionState}
        onOpenConnectModal={() => setAppStage('connecting')}
        onDisconnect={handleDisconnect}
        isStreamingPaused={isStreamingPaused}
        onTogglePauseStream={() => setIsStreamingPaused(!isStreamingPaused)}
        onEndMission={handleEndMission}
        missionTimeSec={missionTimeSec}
        totalPings={totalPings}
        activeProfile={activeProfile}
        unreadAlertCount={unreadAlerts}
        onSelectTab={(tab) => {
          if (tab === 'landing') {
            setAppStage('landing');
          } else {
            setAppStage('operational');
            setActiveTab(tab as ActiveTab);
          }
        }}
        activeTab={activeTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1800px] w-full mx-auto p-2 sm:p-4">
        {/* Stage 1: Clean System Boot Loader */}
        {appStage === 'boot' && (
          <BootLoadingPage onComplete={() => setAppStage('landing')} />
        )}

        {/* Stage 2: Product & Architecture Landing Page */}
        {appStage === 'landing' && (
          <LaunchHero onConnectClick={() => setAppStage('connecting')} />
        )}

        {/* Stage 3: Connecting Handshake Page */}
        {appStage === 'connecting' && (
          <ConnectingPage
            onConnected={handleConnect}
            onCancel={() => setAppStage('landing')}
            savedMissions={savedMissions}
          />
        )}

        {/* Stage 4: Operational Dashboard Stage */}
        {appStage === 'operational' && (
          <div className="space-y-4">
            {/* Live Telemetry Dashboard & Dedicated 3D Simulator Page */}
            <div className="w-full">
              {activeTab === 'simulator' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-[#0B1F3A]/90 p-4 rounded-xl border border-slate-800">
                    <div>
                      <h2 className="font-heading font-extrabold text-base text-[#E8EEF2] tracking-wider">
                        3D AUV SONAR PAYLOAD SIMULATOR
                      </h2>
                      <p className="text-xs text-[#8FA3B8]">
                        Interactive 3D Cad Model • Assembled & Exploded Inspection Modes
                      </p>
                    </div>
                  </div>

                  <ThreeAuvExplorer
                    depth={environmental.depth}
                    temperature={environmental.temperature}
                    turbidity={environmental.turbidity}
                    batteryPercent={environmental.batteryPercent}
                    onEnvChange={(d, t, turb, b) => {
                      setEnvironmental((prev) => ({
                        ...prev,
                        depth: d,
                        temperature: t,
                        turbidity: turb,
                        batteryPercent: b,
                        batteryVoltage: 12.0 + (b / 100) * 4.8,
                        soundVelocity: calculateSoundVelocity(t, prev.salinity, d),
                        pressure: 1.013 + d * 0.0981,
                      }));
                    }}
                  />
                </div>
              )}

              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* 1. 2D Interactive Hydrographic Sonar Simulator (Reflects Live) */}
                  <AuvSonar2dSimulator
                    env={environmental}
                    onEnvChange={(partial) => {
                      setEnvironmental((prev) => {
                        const updated = { ...prev, ...partial };
                        return {
                          ...updated,
                          soundVelocity: calculateSoundVelocity(updated.temperature, updated.salinity, updated.depth),
                          pressure: 1.013 + updated.depth * 0.0981,
                        };
                      });
                    }}
                  />

                  {/* 2. Stacked 3D CAD AUV Explorer Model */}
                  <div className="w-full">
                    <ThreeAuvExplorer
                      depth={environmental.depth}
                      temperature={environmental.temperature}
                      turbidity={environmental.turbidity}
                      batteryPercent={environmental.batteryPercent}
                      onEnvChange={(d, t, turb, b) => {
                        setEnvironmental((prev) => ({
                          ...prev,
                          depth: d,
                          temperature: t,
                          turbidity: turb,
                          batteryPercent: b,
                          batteryVoltage: 12.0 + (b / 100) * 4.8,
                          soundVelocity: calculateSoundVelocity(t, prev.salinity, d),
                          pressure: 1.013 + d * 0.0981,
                        }));
                      }}
                    />
                  </div>

                  {/* 3. Hydrographic Panels & Waveform Analysis */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <EnvironmentalPanel
                      env={environmental}
                      onUpdateManualEnv={(partial) => setEnvironmental((prev) => ({ ...prev, ...partial }))}
                      isSimulated={true}
                    />

                    <SonarProfilePanel
                      activeProfile={activeProfile}
                      isManualOverride={isManualOverride}
                      onToggleManualOverride={() => setIsManualOverride(!isManualOverride)}
                      onSelectManualProfile={handleSelectManualProfile}
                    />
                  </div>

                  <WaveformOscilloscope
                    profile={activeProfile}
                    pingCount={totalPings}
                    isStreaming={connectionState === 'connected' && !isStreamingPaused}
                  />

                  <HardwareStatusPanel hardware={hardware} />
                </div>
              )}

              {activeTab === 'subsystems' && (
                <SubsystemsPage hardware={hardware} profile={activeProfile} />
              )}

              {activeTab === 'environment' && (
                <EnvironmentPage env={environmental} profile={activeProfile} />
              )}

              {activeTab === 'logs' && (
                <MissionDataLog logs={logs} onAddNote={handleAddNote} onOpenSummaryModal={handleEndMission} />
              )}

              {activeTab === 'alerts' && (
                <AlertsPanel alerts={alerts} onClearAlerts={() => setAlerts([])} onMarkAllRead={() => setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))} />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070B10] px-4 py-3 text-xs text-[#8FA3B8] font-mono">
        <div className="max-w-[1800px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#E8EEF2]">AQUACHIRP</span>
            <span>•</span>
            <span>Autonomous Underwater Vehicle Sonar Telemetry</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Link: <span className="text-[#E8EEF2]">{connectionState.toUpperCase()}</span></span>
          </div>
        </div>
      </footer>

      {/* Connection Modal */}
      <ConnectionModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnect={handleConnect}
      />

      {/* Post-Mission Summary Modal */}
      {missionSummary && (
        <MissionSummaryModal
          isOpen={isSummaryModalOpen}
          onClose={() => setIsSummaryModalOpen(false)}
          summary={missionSummary}
          savedMissions={savedMissions}
          onSelectSavedMission={(selected) => setMissionSummary(selected)}
          onRestartMission={handleRestartMission}
        />
      )}
    </div>
  );
}
