import { MissionSummary, MissionTelemetryLog } from '../types';

/**
 * Generates an oceanographic/hydrographic CSV file format compliant with standard
 * post-mission analysis tools (MATLAB, Python pandas, QGIS, SonarWiz, Excel).
 */
export function generateMissionCSV(summary: MissionSummary): string {
  const headers = [
    '# =========================================================================',
    `# AQUACHIRP AUV SONAR TELEMETRY LOG - POST-MISSION DATASET`,
    `# Payload Architecture: CHIRPFLEX Adaptive Software-Defined Transmitter`,
    `# Mission ID: ${summary.missionId}`,
    `# Vehicle ID: ${summary.auvId}`,
    `# Mission Start: ${summary.startTime}`,
    `# Mission End: ${summary.endTime}`,
    `# Total Duration: ${Math.floor(summary.durationSec / 60)}m ${summary.durationSec % 60}s (${summary.durationSec} sec)`,
    `# Total Pings Transmitted: ${summary.totalPingsSent}`,
    `# Total Acoustic Energy (Wh): ${summary.totalEnergyWh.toFixed(3)}`,
    `# Depth Range (m): Min ${summary.minDepthM.toFixed(1)}m | Max ${summary.maxDepthM.toFixed(1)}m | Avg ${summary.avgDepthM.toFixed(1)}m`,
    `# Temperature Range (°C): Min ${summary.minTempC.toFixed(1)}°C | Max ${summary.maxTempC.toFixed(1)}°C`,
    `# Max Turbidity (NTU): ${summary.maxTurbidityNtu.toFixed(1)}`,
    `# Profile Adaptations Count: ${summary.profileAdaptationCount}`,
    `# Recorded Alerts Count: ${summary.alertCount} (Critical: ${summary.criticalAlertCount})`,
    '# =========================================================================',
    '# DATA COLUMNS DEFINITION:',
    '# Timestamp_ISO,Mission_Time_Sec,Depth_Meters,Temperature_C,Turbidity_NTU,Hydrostatic_Pressure_Bar,Sound_Velocity_M_S,Battery_SOC_Pct,Battery_Voltage_V,Profile_ID,Profile_Name,Waveform_Type,Start_Freq_kHz,End_Freq_kHz,Bandwidth_kHz,Pulse_Width_ms,TX_Power_Watts,Duty_Cycle_Pct,Active_Alerts,Field_Notes',
  ];

  const rows = summary.logs.map((log: MissionTelemetryLog) => {
    const cleanNote = (log.note || '').replace(/"/g, '""');
    return [
      log.timestamp,
      log.missionTimeSec,
      log.depth.toFixed(2),
      log.temperature.toFixed(2),
      log.turbidity.toFixed(2),
      log.pressure.toFixed(2),
      log.soundVelocity.toFixed(1),
      log.batteryPercent.toFixed(1),
      log.batteryVoltage.toFixed(2),
      log.profileId,
      `"${log.profileName}"`,
      log.waveformType,
      log.startFreqKhz.toFixed(1),
      log.endFreqKhz.toFixed(1),
      log.bandwidthKhz.toFixed(1),
      log.pulseDurationMs.toFixed(2),
      log.txPowerWatts.toFixed(1),
      log.dutyCycle.toFixed(0),
      log.activeAlertCount,
      `"${cleanNote}"`,
    ].join(',');
  });

  return [...headers, ...rows].join('\r\n');
}

/**
 * Triggers a browser download of the generated CSV file.
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers a browser download of the full JSON dataset.
 */
export function downloadJSON(data: any, filename: string): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
