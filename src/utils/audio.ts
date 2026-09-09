// Web Audio API Synthesizer for Sonar Chirps and Alerts

class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Play an audible acoustic chirp scaled down into human audible range (e.g. 600Hz -> 2400Hz)
  playChirp(startFreqHz: number = 800, endFreqHz: number = 2200, durationSec: number = 0.18) {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const now = this.ctx.currentTime;

      // Linear frequency sweep
      osc.frequency.setValueAtTime(startFreqHz, now);
      osc.frequency.exponentialRampToValueAtTime(endFreqHz, now + durationSec);

      // Amplitude envelope (attack - sustain - decay)
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + durationSec + 0.05);
    } catch {
      // Ignore audio context constraints if blocked by browser policy
    }
  }

  // Alert tone for system warnings
  playAlert(isCritical: boolean = false) {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isCritical ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(isCritical ? 880 : 540, now);
      if (isCritical) {
        osc.frequency.setValueAtTime(660, now + 0.1);
        osc.frequency.setValueAtTime(880, now + 0.2);
      }

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isCritical ? 0.35 : 0.2));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + (isCritical ? 0.38 : 0.22));
    } catch {
      // Silent catch
    }
  }
}

export const soundEngine = new SoundEngine();
