/**
 * Web Audio API synthesizer for devotional bell sound (घंटानाद),
 * temple chime, and Om resonance without requiring external mp3 files.
 * Works 100% offline on both Android and iOS!
 */

class TempleSoundManager {
  private ctx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Plays a brass temple bell (घंटा) chime
   */
  playBell(frequency = 880, duration = 1.2) {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      // Harmonic overtones for rich temple bell ring
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, ctx.currentTime + 0.05);
      osc.frequency.exponentialRampToValueAtTime(frequency, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);

      // Mobile haptic vibration if supported
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(30);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Plays a celebratory shankha / completion chime (when finishing 108 beads)
   */
  playCompletionChime() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playBell(freq, 1.8);
        }, idx * 180);
      });

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([60, 40, 80]);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }
}

export const templeSound = new TempleSoundManager();

export function playBellChime(frequency?: number, duration?: number) {
  templeSound.playBell(frequency, duration);
}

export function playCompletionChime() {
  templeSound.playCompletionChime();
}
