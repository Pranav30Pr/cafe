/**
 * Web Audio API Chime Synthesizer for Kitchen Display System.
 * Generates an attention-grabbing, pleasant two-tone kitchen alert
 * without requiring external sound files or CDN assets.
 */

class KitchenAudioAlert {
  private ctx: AudioContext | null = null;
  private isUnlocked: boolean = false;

  private initContext() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  public async unlock(): Promise<boolean> {
    this.initContext();
    if (!this.ctx) return false;

    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }

    // Play a brief silent buffer to satisfy browser autoplay security
    const buffer = this.ctx.createBuffer(1, 1, 22050);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.ctx.destination);
    source.start(0);

    this.isUnlocked = true;
    return true;
  }

  public playNewOrderChime() {
    try {
      this.initContext();
      if (!this.ctx) return;

      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }

      const now = this.ctx.currentTime;

      // Note 1: High crisp bell (D5 - 587.33 Hz)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now);

      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // Note 2: Harmonic resolving chime (A5 - 880.00 Hz)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(880.0, now + 0.15);

      gain2.gain.setValueAtTime(0.4, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.9);
    } catch (err) {
      console.warn("Audio chime prevented by browser policy:", err);
    }
  }

  public getUnlockedStatus(): boolean {
    return this.isUnlocked;
  }
}

export const kitchenAudio = new KitchenAudioAlert();
