// Zero-dependency tactile sound synthesis using Web Audio API

const SOUND_MUTE_STORAGE_KEY = "occuring-sound-muted";

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean | null = null;

  isMuted(): boolean {
    if (typeof window === "undefined") return false;
    if (this.muted === null) {
      try {
        this.muted = localStorage.getItem(SOUND_MUTE_STORAGE_KEY) === "1";
      } catch {
        this.muted = false;
      }
    }
    return this.muted;
  }

  setMuted(nextMuted: boolean): void {
    this.muted = nextMuted;
    if (typeof window === "undefined") return;
    try {
      if (nextMuted) {
        localStorage.setItem(SOUND_MUTE_STORAGE_KEY, "1");
      } else {
        localStorage.removeItem(SOUND_MUTE_STORAGE_KEY);
      }
    } catch {
      // Ignore storage restrictions
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined" || this.isMuted()) return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Soft tactile click
  playPop() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.035);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch {
      // Audio playback best-effort
    }
  }

  // Clean harmonic completion chime
  playComplete() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + idx * 0.055;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.075, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.22);
      });
    } catch {
      // Audio playback best-effort
    }
  }

  // Calming warm chord for grounding
  playGrounding() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const chord = [329.63, 440.0, 523.25]; // E4, A4, C5
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.045, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.36);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.36);
      });
    } catch {
      // Audio playback best-effort
    }
  }
}

export const sounds = new SoundEngine();
