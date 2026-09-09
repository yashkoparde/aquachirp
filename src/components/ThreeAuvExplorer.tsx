import React, { useEffect, useRef } from 'react';

interface ThreeAuvExplorerProps {
  depth: number;
  temperature: number;
  turbidity: number;
  batteryPercent: number;
  onEnvChange: (depth: number, temp: number, turb: number, batt: number) => void;
}

export const ThreeAuvExplorer: React.FC<ThreeAuvExplorerProps> = ({
  depth,
  temperature,
  turbidity,
  batteryPercent,
  onEnvChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create iframe pointing to the exact auv-sonar-explorer.html model
    const iframe = document.createElement('iframe');
    iframe.src = '/auv-sonar-explorer.html';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '12px';

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(iframe);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="w-full h-[680px] rounded-xl overflow-hidden border border-[#134A5E] bg-[#031A24] shadow-2xl relative">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
