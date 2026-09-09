<div align="center">

# AQUACHIRP 🌊
### Autonomous Underwater Vehicle Software-Defined Sonar Telemetry Platform

[![React](https://img.shields.io/badge/React-18-17A9C9?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.128-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

---

## 📌 Architectural Overview & Data Flow

```mermaid
flowchart TD
    subgraph SENSORS ["Hydrographic Sensing Array"]
        S1["Depth Column Sensor\n(0 – 1000m)"]
        S2["CTD Temperature Sensor\n(-2°C – 30°C)"]
        S3["Optical Turbidity Backscatter\n(0 – 100 NTU)"]
        S4["4S LiPo Voltage Monitor\n(12.0V – 16.8V)"]
    end

    subgraph ENGINE ["Adaptive DSP & Decision Engine"]
        M1["Hydrostatic Pressure Model\np = 1.013 + 0.0981 · z"]
        M2["Mackenzie Sound Velocity Model\nc(T, S, z) m/s"]
        DE["Adaptive Waveform Matrix\n(LFM Chirp Sweep & Power)"]
    end

    subgraph HARDWARE ["Software-Defined Transmitter Payload"]
        MCU["STM32 MCU Controller\n(480 MHz ARM Cortex-M7)"]
        DMA["Ping-Pong DMA Buffers\n(2.4 MSps DAC Stream)"]
        AFE["Analog Frontend & PA\n(50Ω Match / VSWR 1.08)"]
        TX["PZT Acoustic Transducer\n(180 – 500 kHz)"]
    end

    subgraph TELEMETRY ["Operator Ground Control Dashboard"]
        D1["3D CAD Explorer\n(Assembled & Exploded View)"]
        D2["Real-Time Oscilloscope\n(Time-Domain & FFT Spectrum)"]
        D3["Waterfall Echogram\n(Broadside Acoustic Return)"]
        D4["Mission Debrief Desk\n(CSV / JSON Telemetry Export)"]
    end

    S1 & S2 & S3 & S4 --> M1 & M2
    M1 & M2 --> DE
    DE --> MCU
    MCU --> DMA --> AFE --> TX
    TX --> D1 & D2 & D3 & D4
```

---

## ⚡ System Architecture Layers

```
+-------------------------------------------------------------------------------+
|                       OPERATOR GROUND CONTROL DASHBOARD                       |
|   +-------------------+  +--------------------+  +------------------------+   |
|   | 3D AUV Explorer   |  | Live Oscilloscope  |  | Acoustic Waterfall     |   |
|   | (Assembled/Expl.) |  | (Chirp & FFT)      |  | Echogram               |   |
|   +-------------------+  +--------------------+  +------------------------+   |
+---------------------------------------+---------------------------------------+
                                        |  (Bidirectional postMessage Bus)
+---------------------------------------v---------------------------------------+
|                    ADAPTIVE WAVEFORM TRANSMISSION MATRIX                      |
|  +--------------------+  +--------------------+  +-------------------------+  |
|  | PRF-01 (Shallow)   |  | PRF-02 (Thermocli.)|  | PRF-05 (ECO Save <=30%) |  |
|  | 180 -> 220 kHz     |  | 120 -> 160 kHz     |  | 80 -> 110 kHz Low Power |  |
|  +--------------------+  +--------------------+  +-------------------------+  |
+---------------------------------------+---------------------------------------+
                                        |  (SPI / DMA Hardware Stream)
+---------------------------------------v---------------------------------------+
|                    EMBEDDED HARDWARE PAYLOAD SUBSYSTEM                        |
|  +--------------------+  +--------------------+  +-------------------------+  |
|  | STM32 MCU Core     |  | 12-Bit Fast DAC    |  | Transducer Matching PA  |  |
|  | 480 MHz ARM M7     |  | 2.4 MSps Stream    |  | 50 Ohm Impedance        |  |
|  +--------------------+  +--------------------+  +-------------------------+  |
+-------------------------------------------------------------------------------+
```

---

## ✨ Key Platform Features

- 🛸 **Cinematic Boot & Connection Desk**: Clean system startup screen with hardware bus handshake setup and saved mission archives.
- 🔮 **3D Interactive AUV Explorer**: Three.js CAD payload inspection view with assembled and exploded subsystem disassembly modes.
- 🌊 **Real-Time Hydrographic Sensing**: In-situ monitoring of water column depth, CTD temperature, barometric pressure, turbidity clutter, and battery reserves.
- ⚡ **Adaptive Decision Engine**: Automatic LFM Chirp bandwidth ($\Delta f$), sweep rate ($k$), pulse duration ($\tau$), and ECO power mode adjustments upon detecting environmental stress or $\le 30\%$ battery reserves.
- 📈 **Signal Oscilloscope & Waterfall Echogram**: High-resolution time-domain waveform display, 0–700 kHz FFT spectral density curve, and broadside acoustic waterfall returns.
- 📁 **Mission Debrief Desk**: Synchronous telemetry log database with custom waypoint tagging, interactive range filters, and 1-click CSV/JSON export.

---

## 🚀 Quick Start (Run Locally)

**Prerequisites:** Node.js (v18+)

```bash
# 1. Clone the repository
git clone https://github.com/yashkoparde/aquachirp.git

# 2. Navigate to project directory
cd aquachirp

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev
```

Open your browser and navigate to `http://localhost:3000/`.

---

<div align="center">

**AQUACHIRP Engineering Prototype** • Hydrographic Acoustic Telemetry Suite

</div>
