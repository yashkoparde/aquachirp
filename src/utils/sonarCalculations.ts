import { EnvironmentalData, SonarProfile } from '../types';

/**
 * MacKenzie (1981) formula for sound speed in seawater (m/s)
 * T = Temperature in Celsius
 * S = Salinity in parts per thousand (PSU)
 * D = Depth in meters
 */
export function calculateSoundVelocity(temperature: number, salinity: number, depth: number): number {
  const T = temperature;
  const S = salinity;
  const D = depth;

  const c = 1448.96 
    + 4.591 * T 
    - 5.304e-2 * Math.pow(T, 2) 
    + 2.374e-4 * Math.pow(T, 3) 
    + 1.340 * (S - 35) 
    + 1.630e-2 * D 
    + 1.675e-7 * Math.pow(D, 2) 
    - 1.025e-2 * T * (S - 35) 
    - 7.139e-13 * T * Math.pow(D, 3);

  return Math.round(c * 10) / 10;
}

/**
 * Theoretical Range Resolution:
 * Delta R = c / (2 * Bandwidth)
 * where c is speed of sound (m/s), Bandwidth in Hz
 * Result in cm
 */
export function calculateRangeResolutionCm(soundVelocity: number, bandwidthKhz: number): number {
  if (bandwidthKhz <= 0) return 50.0;
  const bandwidthHz = bandwidthKhz * 1000;
  const deltaRMeters = soundVelocity / (2 * bandwidthHz);
  return Math.round(deltaRMeters * 1000) / 10; // cm with 1 decimal
}

/**
 * Standard Presets for the CHIRPFLEX Software-Defined Sonar Payload
 */
export const SONAR_PROFILE_PRESETS: Record<string, Omit<SonarProfile, 'theoreticalRangeResCm'>> = {
  P1_SHALLOW: {
    id: 'P1_SHALLOW',
    code: 'PRF-01',
    name: 'High-Res Shallow Water',
    description: 'High-frequency wideband LFM chirp for shallow littoral zones (<30m). Maximizes spatial resolution for fine obstacle mapping.',
    waveformType: 'LFM_UP_CHIRP',
    windowType: 'HANN',
    startFreqKhz: 180,
    endFreqKhz: 220,
    pulseDurationMs: 2.5,
    sweepRateKhzPerMs: 16.0,
    amplitudePercent: 65,
    txPowerWatts: 14,
    dutyCyclePercent: 35,
    powerMode: 'LOW',
    maxOperationalRangeM: 45,
    adaptationReason: 'Depth < 35m with low turbidity. Optimal high-frequency acoustic window.',
  },
  P2_THERMOCLINE: {
    id: 'P2_THERMOCLINE',
    code: 'PRF-02',
    name: 'Mid-Band Thermocline Penetrator',
    description: 'Medium frequency chirp tuned to counter rapid acoustic refraction and gradient scattering across thermal layer boundaries.',
    waveformType: 'LFM_UP_CHIRP',
    windowType: 'HAMMING',
    startFreqKhz: 75,
    endFreqKhz: 115,
    pulseDurationMs: 6.0,
    sweepRateKhzPerMs: 6.67,
    amplitudePercent: 80,
    txPowerWatts: 28,
    dutyCyclePercent: 55,
    powerMode: 'NOMINAL',
    maxOperationalRangeM: 110,
    adaptationReason: 'Moderate depth (35m - 90m) or strong thermocline gradient (dT/dz > 0.3°C/m).',
  },
  P3_DEEP_CHIRP: {
    id: 'P3_DEEP_CHIRP',
    code: 'PRF-03',
    name: 'Deep-Ocean High-Power Bathymetry',
    description: 'Low-frequency high-energy chirp for abyssal acoustic propagation, sub-bottom penetration, and long-range seafloor mapping.',
    waveformType: 'LFM_DOWN_CHIRP',
    windowType: 'BLACKMAN',
    startFreqKhz: 45,
    endFreqKhz: 22,
    pulseDurationMs: 14.0,
    sweepRateKhzPerMs: 1.64,
    amplitudePercent: 95,
    txPowerWatts: 55,
    dutyCyclePercent: 75,
    powerMode: 'BOOST',
    maxOperationalRangeM: 260,
    adaptationReason: 'Depth > 90m. Low absorption acoustic band required for long-range sound path.',
  },
  P4_TURBID_CLUTTER: {
    id: 'P4_TURBID_CLUTTER',
    code: 'PRF-04',
    name: 'Turbid Water Clutter-Rejection',
    description: 'Hyperbolic frequency chirp engineered to suppress particulate volume backscatter and suspended particulate acoustic clutter.',
    waveformType: 'HYPERBOLIC_CHIRP',
    windowType: 'HANN',
    startFreqKhz: 105,
    endFreqKhz: 145,
    pulseDurationMs: 8.5,
    sweepRateKhzPerMs: 4.71,
    amplitudePercent: 85,
    txPowerWatts: 34,
    dutyCyclePercent: 60,
    powerMode: 'NOMINAL',
    maxOperationalRangeM: 80,
    adaptationReason: 'Turbidity exceeds 45 NTU. Particulate scattering mitigation active.',
  },
  P5_ECO_SAFE: {
    id: 'P5_ECO_SAFE',
    code: 'PRF-05',
    name: 'Battery Conservation Safe-Mode',
    description: 'Low-duty, narrow-band acoustic pulse to preserve vehicle bus voltage while retaining safety-critical obstacle detection.',
    waveformType: 'CW_TONE_BURST',
    windowType: 'NONE',
    startFreqKhz: 85,
    endFreqKhz: 95,
    pulseDurationMs: 1.8,
    sweepRateKhzPerMs: 5.56,
    amplitudePercent: 40,
    txPowerWatts: 7,
    dutyCyclePercent: 20,
    powerMode: 'ECO_CONSERVE',
    maxOperationalRangeM: 50,
    adaptationReason: 'Battery state-of-charge < 25%. System entered low-power survival profile.',
  },
  P6_GEOMETRIC_SWEEP: {
    id: 'P6_GEOMETRIC_SWEEP',
    code: 'PRF-06',
    name: 'Geometric Frequency Sweep',
    description: 'Logarithmic geometric sweep profile for multi-target velocity Doppler disambiguation.',
    waveformType: 'GEOMETRIC_SWEEP',
    windowType: 'HAMMING',
    startFreqKhz: 60,
    endFreqKhz: 150,
    pulseDurationMs: 5.0,
    sweepRateKhzPerMs: 18.0,
    amplitudePercent: 75,
    txPowerWatts: 25,
    dutyCyclePercent: 40,
    powerMode: 'NOMINAL',
    maxOperationalRangeM: 95,
    adaptationReason: 'Doppler velocity disambiguation enabled.',
  },
  P7_PHASE_CODED: {
    id: 'P7_PHASE_CODED',
    code: 'PRF-07',
    name: 'Phase-Coded Barker Sequence',
    description: 'Binary phase-shift keying (BPSK) coded waveform for low-probability of intercept and high compression ratio.',
    waveformType: 'PHASE_CODED',
    windowType: 'BLACKMAN',
    startFreqKhz: 130,
    endFreqKhz: 170,
    pulseDurationMs: 4.0,
    sweepRateKhzPerMs: 10.0,
    amplitudePercent: 80,
    txPowerWatts: 30,
    dutyCyclePercent: 45,
    powerMode: 'NOMINAL',
    maxOperationalRangeM: 85,
    adaptationReason: 'Phase-coded pulse compression selected.',
  },
};

/**
 * Adaptive Decision Engine:
 * Maps current environmental inputs and vehicle state into the optimal SonarProfile.
 */
export function determineAdaptiveProfile(env: EnvironmentalData): SonarProfile {
  let presetKey = 'P2_THERMOCLINE';
  let reason = '';

  // 1. Battery priority check (Fail-safe)
  if (env.batteryPercent < 22 || env.batteryVoltage < 13.8) {
    presetKey = 'P5_ECO_SAFE';
    reason = `Critical battery level (${env.batteryPercent.toFixed(0)}%, ${env.batteryVoltage.toFixed(1)}V). Power throttled to 7W to preserve AUV bus.`;
  }
  // 2. High turbidity condition (Particulate clutter rejection)
  else if (env.turbidity > 42) {
    presetKey = 'P4_TURBID_CLUTTER';
    reason = `High particulate turbidity (${env.turbidity.toFixed(1)} NTU). Clutter-rejection hyperbolic chirp selected to filter suspended sediment echo.`;
  }
  // 3. Deep water bathymetry
  else if (env.depth > 95) {
    presetKey = 'P3_DEEP_CHIRP';
    reason = `Deep water zone (${env.depth.toFixed(1)}m). Switched to 22-45 kHz low-frequency boost for maximum bottom penetration.`;
  }
  // 4. Shallow water high resolution
  else if (env.depth < 35) {
    presetKey = 'P1_SHALLOW';
    reason = `Shallow littoral column (${env.depth.toFixed(1)}m). Activated 180-220 kHz wideband chirp for millimeter-scale obstacle resolution.`;
  }
  // 5. Mid-depth / thermocline
  else {
    presetKey = 'P2_THERMOCLINE';
    reason = `Thermocline zone (${env.depth.toFixed(1)}m, ${env.temperature.toFixed(1)}°C). 75-115 kHz mid-band active for optimal refractive stability.`;
  }

  const basePreset = SONAR_PROFILE_PRESETS[presetKey];
  const bandwidthKhz = Math.abs(basePreset.endFreqKhz - basePreset.startFreqKhz);
  const theoreticalRangeResCm = calculateRangeResolutionCm(env.soundVelocity, bandwidthKhz);

  return {
    ...basePreset,
    theoreticalRangeResCm,
    adaptationReason: reason,
  };
}
