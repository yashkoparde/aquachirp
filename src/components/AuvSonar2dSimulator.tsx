import React, { useEffect, useRef } from 'react';
import { EnvironmentalData } from '../types';

interface AuvSonar2dSimulatorProps {
  env: EnvironmentalData;
  onEnvChange: (partial: Partial<EnvironmentalData>) => void;
}

export const AuvSonar2dSimulator: React.FC<AuvSonar2dSimulatorProps> = ({
  env,
  onEnvChange,
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'AQUACHIRP_ENV_CHANGE') {
        const { depth, temp, turb, batt } = event.data;
        onEnvChange({
          depth: depth !== undefined ? depth : env.depth,
          temperature: temp !== undefined ? temp : env.temperature,
          turbidity: turb !== undefined ? turb : env.turbidity,
          batteryPercent: batt !== undefined ? batt : env.batteryPercent,
          batteryVoltage: batt !== undefined ? 12.0 + (batt / 100) * 4.8 : env.batteryVoltage,
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [env, onEnvChange]);

  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'SET_AQUACHIRP_ENV',
        depth: env.depth,
        temp: env.temperature,
        turb: env.turbidity,
        batt: env.batteryPercent
      }, '*');
    }
  }, [env.depth, env.temperature, env.turbidity, env.batteryPercent]);

  return (
    <div className="w-full h-[620px] rounded-xl overflow-hidden border border-slate-800 bg-[#0A0E14] shadow-2xl relative">
      <iframe
        ref={iframeRef}
        src="/auv-2d-hydrographic-sim.html"
        title="AquaChirp 2D Hydrographic Sonar Simulator"
        className="w-full h-full border-none rounded-xl"
      />
    </div>
  );
};
