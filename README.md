# AQUACHIRP — Autonomous Underwater Vehicle Sonar Telemetry Simulator

Software-defined acoustic waveform transmission & hydrographic telemetry simulator platform for Autonomous Underwater Vehicles (AUVs).

## Key Features

- **Cinematic Boot & Handshake**: Clean system startup sequence and AUV hardware telemetry bus handshake.
- **3D AUV Sonar Explorer**: Interactive CAD model of the vehicle payload featuring Assembled and Exploded inspection views.
- **Real-Time Hydrographic Sensing**: In-situ monitoring of depth column, temperature, pressure, turbidity, sound velocity (Mackenzie formula), and battery reserves.
- **Adaptive Transmission Decision Engine**: Dynamic LFM Chirp bandwidth, sweep rate, and power profile adjustments based on environmental stress.
- **Signal Oscilloscope & Waterfall Echogram**: Real-time time-domain waveform, FFT spectral density display, and broadside acoustic waterfall echogram.
- **Mission Log & Export**: Filterable synchronous telemetry log desk with custom waypoint tagging and CSV/JSON debrief export.

## Run Locally

**Prerequisites:** Node.js (v18+)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open your browser at `http://localhost:3000/`.
