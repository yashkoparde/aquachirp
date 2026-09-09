import React, { useEffect } from 'react';

interface BootLoadingPageProps {
  onComplete: () => void;
}

export const BootLoadingPage: React.FC<BootLoadingPageProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#06151E] flex items-center justify-center select-none overflow-hidden">
      {/* Cinematic Ambient Glow */}
      <div className="absolute w-[500px] h-[500px] bg-[#17A9C9]/10 rounded-full blur-3xl animate-pulse" />

      {/* Cinematic Title & Pulse */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-4">
        <div className="relative w-16 h-16 flex items-center justify-center mb-2">
          <div className="absolute inset-0 rounded-full border border-[#17A9C9]/40 animate-ping [animation-duration:2s]" />
          <div className="w-10 h-10 rounded-full border border-[#17A9C9] flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-[#17A9C9]" />
          </div>
        </div>

        <h1 className="font-heading font-extrabold text-4xl sm:text-6xl text-white tracking-[0.3em] uppercase drop-shadow-2xl">
          AQUACHIRP
        </h1>
      </div>
    </div>
  );
};
