// Minimalist Web Audio API sound generator for kitchen alerts (Section 5.3)
// Zero external files, zero third-party requests, works offline.

class SoundAlertManager {
  private audioCtx: AudioContext | null = null;
  private isMuted = false;

  constructor() {
    try {
      const saved = localStorage.getItem('cafe_kitchen_muted');
      if (saved !== null) {
        this.isMuted = JSON.parse(saved);
      }
    } catch {
      this.isMuted = false;
    }
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem('cafe_kitchen_muted', JSON.stringify(muted));
    } catch (e) {
      console.error(e);
    }
  }

  playOrderAlert(): void {
    if (this.isMuted) return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      // Gentle two-tone chime: 587Hz (D5) -> 880Hz (A5), short and unobtrusive
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      const now = this.audioCtx.currentTime;

      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880.0, now + 0.1);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Audio not permitted or supported; visual signal is primary anyway
    }
  }
}

export const soundManager = new SoundAlertManager();
