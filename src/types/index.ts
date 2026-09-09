export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'paused' | 'error';

export type ConnectionMode = 'serial_uart' | 'udp_ethernet' | 'can_bus' | 'hardware_bus';

export interface ConnectionConfig {
  mode: ConnectionMode;
  portOrAddress: string;
  baudRate: number;
  sampleRateMs: number;
  auvId: string;
  payloadFirmware: string;
}

export interface EnvironmentalData {
  depth: number; // meters (0 to 300m)
  temperature: number; // Celsius (-2 to 30)
  turbidity: number; // NTU (0 to 120)
  pressure: number; // bar (atmospheric + depth * 0.1)
  salinity: number; // PSU (default ~35)
  soundVelocity: number; // m/s (calculated)
  ambientNoise: number; // dB (re 1uPa)
  batteryVoltage: number; // Volts (12.0 - 16.8)
  batteryPercent: number; // 0 - 100%
  batteryCurrent: number; // Amperes
  estimatedRuntimeMinutes: number;
}

export type WaveformType = 
  | 'LFM_UP_CHIRP' 
  | 'LFM_DOWN_CHIRP' 
  | 'HYPERBOLIC_CHIRP' 
  | 'CW_TONE_BURST'
  | 'RICKER_WAVELET';

export type PowerMode = 'LOW' | 'NOMINAL' | 'BOOST' | 'ECO_CONSERVE';

export interface SonarProfile {
  id: string;
  name: string;
  code: string;
  description: string;
  waveformType: WaveformType;
  startFreqKhz: number; // e.g. 180
  endFreqKhz: number; // e.g. 220
  pulseDurationMs: number; // e.g. 2.5 ms
  sweepRateKhzPerMs: number; // (end - start) / duration
  amplitudePercent: number; // 0 - 100%
  txPowerWatts: number;
  dutyCyclePercent: number;
  powerMode: PowerMode;
  theoreticalRangeResCm: number; // Resolution in cm (c / 2B)
  maxOperationalRangeM: number;
  adaptationReason: string;
}

export interface HardwareSubsystem {
  controller: {
    status: 'nominal' | 'warning' | 'fault';
    mcuTempC: number;
    cpuLoadPercent: number;
    clockSpeedMhz: number;
    dmaActive: boolean;
    dmaBufferState: 'PING' | 'PONG' | 'IDLE';
    timerJitterPs: number;
  };
  dac: {
    status: 'nominal' | 'warning' | 'fault';
    resolutionBits: number;
    sampleRateMsps: number;
    outputSwingVpp: number;
  };
  afe: {
    status: 'nominal' | 'warning' | 'fault';
    stageTempC: number;
    vswr: number;
    transducerImpedanceOhm: number;
    filterCutoffKhz: number;
    ampGainDb: number;
  };
}

export type AlertSeverity = 'info' | 'adapt' | 'warning' | 'critical';

export interface MissionAlert {
  id: string;
  timestamp: string;
  timestampMs: number;
  missionTimeSec: number;
  type: 'ENV_CHANGE' | 'PROFILE_ADAPT' | 'BATTERY_LOW' | 'TURBIDITY_SPIKE' | 'THERMOCLINE_CROSS' | 'HARDWARE_LIMIT' | 'INFO';
  severity: AlertSeverity;
  title: string;
  message: string;
  read: boolean;
}

export interface MissionTelemetryLog {
  id: string;
  timestamp: string;
  missionTimeSec: number;
  depth: number;
  temperature: number;
  turbidity: number;
  pressure: number;
  soundVelocity: number;
  batteryPercent: number;
  batteryVoltage: number;
  profileId: string;
  profileName: string;
  waveformType: WaveformType;
  startFreqKhz: number;
  endFreqKhz: number;
  bandwidthKhz: number;
  pulseDurationMs: number;
  txPowerWatts: number;
  dutyCycle: number;
  activeAlertCount: number;
  note?: string;
}

export interface MissionSummary {
  missionId: string;
  auvId: string;
  startTime: string;
  endTime: string;
  durationSec: number;
  totalPingsSent: number;
  totalEnergyWh: number;
  minDepthM: number;
  maxDepthM: number;
  avgDepthM: number;
  minTempC: number;
  maxTempC: number;
  maxTurbidityNtu: number;
  profileAdaptationCount: number;
  alertCount: number;
  criticalAlertCount: number;
  profileBreakdown: Record<string, number>;
  logs: MissionTelemetryLog[];
}
