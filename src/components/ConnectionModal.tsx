import React, { useState } from 'react';
import { 
  Cable, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Layers, 
  Activity, 
  ShieldCheck, 
  SlidersHorizontal,
  X
} from 'lucide-react';
import { ConnectionConfig, ConnectionMode } from '../types';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (config: ConnectionConfig) => void;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({
  isOpen,
  onClose,
  onConnect,
}) => {
  const [mode, setMode] = useState<ConnectionMode>('hardware_bus');
  const [portOrAddress, setPortOrAddress] = useState('COM3 (/dev/ttyUSB0)');
  const [baudRate, setBaudRate] = useState(115200);
  const [sampleRateMs, setSampleRateMs] = useState(1000);
  const [auvId, setAuvId] = useState('AUV-HYDRO-ALPHA-01');
  const [isHandshaking, setIsHandshaking] = useState(false);
  const [handshakeStep, setHandshakeStep] = useState(0);

  if (!isOpen) return null;

  const diagnostics = [
    { label: 'Embedded MCU Core (STM32H743ZI / 480MHz)', status: handshakeStep >= 1 ? 'ok' : 'pending' },
    { label: 'DMA Waveform Streamer (Ping-Pong 4096B)', status: handshakeStep >= 2 ? 'ok' : 'pending' },
    { label: 'Hardware Timer TIM1 Sync (2.4 MSps Clock)', status: handshakeStep >= 3 ? 'ok' : 'pending' },
    { label: '12-Bit Fast DAC (Analog 3.3V Vpp Rail)', status: handshakeStep >= 4 ? 'ok' : 'pending' },
    { label: 'Analog Front End & 50Ω Transducer Match', status: handshakeStep >= 5 ? 'ok' : 'pending' },
  ];

  const handleInitiateConnection = () => {
    setIsHandshaking(true);
    setHandshakeStep(1);

    const stepInterval = setInterval(() => {
      setHandshakeStep((prev) => {
        if (prev >= 5) {
          clearInterval(stepInterval);
          setTimeout(() => {
            setIsHandshaking(false);
            onConnect({
              mode,
              portOrAddress: mode === 'hardware_bus' ? 'Internal Telemetry Bus' : portOrAddress,
              baudRate,
              sampleRateMs,
              auvId,
              payloadFirmware: 'CHIRPFLEX-ARM-v2.4.1',
            });
            onClose();
          }, 400);
          return 5;
        }
        return prev + 1;
      });
    }, 280);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0E14]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0B1F3A] border border-[#17A9C9]/40 rounded-xl shadow-2xl shadow-[#17A9C9]/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-[#0A0E14]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#17A9C9]/15 text-[#17A9C9] border border-[#17A9C9]/30">
              <Cable className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-[#E8EEF2]">
                CONNECT TO AUV / PROTOTYPE
              </h2>
              <p className="text-xs text-[#8FA3B8]">
                CHIRPFLEX Software-Defined Sonar Payload Interface
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8FA3B8] hover:text-[#E8EEF2] hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Connection Mode Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#8FA3B8] uppercase tracking-wider mb-2">
              Physical Link / Telemetry Interface
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                id="conn-mode-sim"
                onClick={() => setMode('hardware_bus')}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1 ${
                  mode === 'hardware_bus'
                    ? 'bg-[#17A9C9]/15 border-[#17A9C9] text-[#E8EEF2] shadow-sm shadow-[#17A9C9]/20'
                    : 'bg-[#0A0E14]/70 border-slate-800 text-[#8FA3B8] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Internal Telemetry Bus</span>
                  <Activity className="w-3.5 h-3.5 text-[#17A9C9]" />
                </div>
                <span className="text-[11px] opacity-75">
                  Internal payload bus with live oceanographic & DMA wave streaming
                </span>
              </button>

              <button
                type="button"
                id="conn-mode-uart"
                onClick={() => {
                  setMode('serial_uart');
                  setPortOrAddress('/dev/ttyUSB0');
                }}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1 ${
                  mode === 'serial_uart'
                    ? 'bg-[#17A9C9]/15 border-[#17A9C9] text-[#E8EEF2] shadow-sm shadow-[#17A9C9]/20'
                    : 'bg-[#0A0E14]/70 border-slate-800 text-[#8FA3B8] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Serial UART / USB</span>
                  <Cpu className="w-3.5 h-3.5 text-[#17A9C9]" />
                </div>
                <span className="text-[11px] opacity-75">
                  Direct FTDI / CP2102 serial link to payload board
                </span>
              </button>

              <button
                type="button"
                id="conn-mode-udp"
                onClick={() => {
                  setMode('udp_ethernet');
                  setPortOrAddress('192.168.1.120:5005');
                }}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1 ${
                  mode === 'udp_ethernet'
                    ? 'bg-[#17A9C9]/15 border-[#17A9C9] text-[#E8EEF2] shadow-sm shadow-[#17A9C9]/20'
                    : 'bg-[#0A0E14]/70 border-slate-800 text-[#8FA3B8] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">UDP / HydroLink IP</span>
                  <Layers className="w-3.5 h-3.5 text-[#17A9C9]" />
                </div>
                <span className="text-[11px] opacity-75">
                  Ethernet / Tether socket telemetry stream
                </span>
              </button>

              <button
                type="button"
                id="conn-mode-can"
                onClick={() => {
                  setMode('can_bus');
                  setPortOrAddress('can0 (Node 0x2A)');
                }}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1 ${
                  mode === 'can_bus'
                    ? 'bg-[#17A9C9]/15 border-[#17A9C9] text-[#E8EEF2] shadow-sm shadow-[#17A9C9]/20'
                    : 'bg-[#0A0E14]/70 border-slate-800 text-[#8FA3B8] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">CAN Bus 2.0B / FD</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#17A9C9]" />
                </div>
                <span className="text-[11px] opacity-75">
                  Vehicle internal sub-sea bus architecture
                </span>
              </button>
            </div>
          </div>

          {/* Configuration Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#0A0E14]/60 p-3.5 rounded-lg border border-slate-800 text-xs">
            <div>
              <label className="block text-[#8FA3B8] mb-1 font-mono">AUV Vehicle Identifier</label>
              <input
                type="text"
                value={auvId}
                onChange={(e) => setAuvId(e.target.value)}
                className="w-full bg-[#0B1F3A] border border-slate-700 rounded px-2.5 py-1.5 text-[#E8EEF2] font-mono focus:border-[#17A9C9] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#8FA3B8] mb-1 font-mono">Telemetry Ping Rate</label>
              <select
                value={sampleRateMs}
                onChange={(e) => setSampleRateMs(Number(e.target.value))}
                className="w-full bg-[#0B1F3A] border border-slate-700 rounded px-2.5 py-1.5 text-[#E8EEF2] font-mono focus:border-[#17A9C9] focus:outline-none"
              >
                <option value={2000}>0.5 Hz (Power-saving, 2000ms)</option>
                <option value={1000}>1.0 Hz (Standard survey, 1000ms)</option>
                <option value={500}>2.0 Hz (High-rate inspection, 500ms)</option>
                <option value={250}>4.0 Hz (Fast acoustic scan, 250ms)</option>
              </select>
            </div>

            {mode !== 'prototype_sim' && (
              <>
                <div>
                  <label className="block text-[#8FA3B8] mb-1 font-mono">Port / Network Endpoint</label>
                  <input
                    type="text"
                    value={portOrAddress}
                    onChange={(e) => setPortOrAddress(e.target.value)}
                    className="w-full bg-[#0B1F3A] border border-slate-700 rounded px-2.5 py-1.5 text-[#E8EEF2] font-mono focus:border-[#17A9C9] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA3B8] mb-1 font-mono">Baud Rate</label>
                  <select
                    value={baudRate}
                    onChange={(e) => setBaudRate(Number(e.target.value))}
                    className="w-full bg-[#0B1F3A] border border-slate-700 rounded px-2.5 py-1.5 text-[#E8EEF2] font-mono focus:border-[#17A9C9] focus:outline-none"
                  >
                    <option value={115200}>115,200 baud</option>
                    <option value={460800}>460,800 baud</option>
                    <option value={921600}>921,600 baud</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Subsystem Health Diagnostics */}
          <div className="bg-[#0A0E14]/80 p-3.5 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#8FA3B8] uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#17A9C9]" />
                Hardware Subsystem Handshake
              </span>
              <span className="text-[11px] font-mono text-[#17A9C9]">
                {handshakeStep === 5 ? 'ALL SYSTEMS NOMINAL' : isHandshaking ? 'VERIFYING...' : 'READY'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              {diagnostics.map((d, index) => (
                <div key={index} className="flex items-center justify-between py-1 px-2 rounded bg-[#0B1F3A]/40">
                  <span className="text-slate-300">{d.label}</span>
                  {d.status === 'ok' ? (
                    <span className="flex items-center gap-1 text-[#17A9C9] text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      LOCKED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5" />
                      STANDBY
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700/60 bg-[#0A0E14]/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#8FA3B8] hover:text-[#E8EEF2] transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            id="btn-confirm-connect"
            onClick={handleInitiateConnection}
            disabled={isHandshaking}
            className="px-5 py-2 text-xs font-bold rounded-lg bg-[#17A9C9] text-[#0A0E14] hover:bg-[#17A9C9]/90 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-[#17A9C9]/25 disabled:opacity-50"
          >
            {isHandshaking ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#0A0E14]" />
                <span>Handshaking Payload ({handshakeStep}/5)...</span>
              </>
            ) : (
              <>
                <Cable className="w-4 h-4" />
                <span>Initialize & Open Live Dashboard</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
