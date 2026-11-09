import { SWAMI_CHANT_BASE64 } from './chantAudioBase64';

/**
 * Web Audio API synthesizer for devotional bell sound (घंटानाद),
 * and zero-latency sacred vocal chanting ("श्री स्वामी समर्थ").
 * Uses pre-decoded AudioBuffer for instant, reliable mobile/desktop playback.
 */

class TempleSoundManager {
  private ctx: AudioContext | null = null;
  private voiceBuffer: AudioBuffer | null = null;
  private isDecodingVoice = false;
  private voiceAudioElement: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Warm up audio buffer on first interaction
      const warmup = () => {
        this.preloadVoiceBuffer();
        window.removeEventListener('pointerdown', warmup);
        window.removeEventListener('keydown', warmup);
      };
      window.addEventListener('pointerdown', warmup, { once: true, passive: true });
      window.addEventListener('keydown', warmup, { once: true, passive: true });
    }
  }

  public getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Pre-fetches and decodes the sweet vocal chant into an in-memory AudioBuffer
   */
  async preloadVoiceBuffer(): Promise<AudioBuffer | null> {
    if (this.voiceBuffer) return this.voiceBuffer;
    if (this.isDecodingVoice) return null;
    this.isDecodingVoice = true;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return null;

      let arrayBuffer: ArrayBuffer | null = null;

      // 1. Try fetching from public/audio/swami_samarth_chant.mp3
      try {
        const resp = await fetch('/audio/swami_samarth_chant.mp3?v=11', { cache: 'no-cache' });
        if (resp.ok) {
          arrayBuffer = await resp.arrayBuffer();
        }
      } catch {
        // Fallback to base64 below
      }

      // 2. If fetch failed or running offline, decode from embedded base64 data URI
      if (!arrayBuffer && SWAMI_CHANT_BASE64) {
        const base64Data = SWAMI_CHANT_BASE64.split(',')[1];
        const binaryString = window.atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        arrayBuffer = bytes.buffer;
      }

      if (arrayBuffer && ctx) {
        this.voiceBuffer = await ctx.decodeAudioData(arrayBuffer);
      }
    } catch {
      // Decode error fallback handled in playSwamiChant
    } finally {
      this.isDecodingVoice = false;
    }

    return this.voiceBuffer;
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
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, ctx.currentTime + 0.05);
      osc.frequency.exponentialRampToValueAtTime(frequency, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(25);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Plays the beloved sweet vocal chant audio: "श्री स्वामी समर्थ"
   * Uses Web Audio API AudioBuffer for guaranteed zero latency and multiple rapid taps.
   */
  async playSwamiChant(variant: 'voice' | 'bell' = 'voice') {
    if (variant === 'bell') {
      this.playBell(760, 0.45);
      return;
    }

    // Trigger haptic vibration on mobile
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25);
      } catch {}
    }

    const ctx = this.getAudioContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        try {
          await ctx.resume();
        } catch {}
      }

      // If buffer is already decoded, play with 0ms latency!
      if (this.voiceBuffer) {
        try {
          const source = ctx.createBufferSource();
          source.buffer = this.voiceBuffer;
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(1.1, ctx.currentTime);
          source.connect(gain);
          gain.connect(ctx.destination);
          source.start(0);
          return;
        } catch {}
      }
    }

    // If buffer is still decoding or unavailable, use HTMLAudioElement with embedded base64
    try {
      if (!this.voiceAudioElement) {
        this.voiceAudioElement = new Audio(SWAMI_CHANT_BASE64 || '/audio/swami_samarth_chant.mp3');
        this.voiceAudioElement.preload = 'auto';
      }
      this.voiceAudioElement.currentTime = 0;
      const playPromise = this.voiceAudioElement.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If HTML audio also fails, attempt buffer decode for subsequent taps
          this.preloadVoiceBuffer();
        });
      }
    } catch {
      // Buffer load triggered for next tap
      this.preloadVoiceBuffer();
    }
  }

  /**
   * Plays celebratory chime when completing 108 beads
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

export function playSwamiChant() {
  templeSound.playSwamiChant();
}

export function playBellChime(frequency?: number, duration?: number) {
  templeSound.playBell(frequency, duration);
}

export function playCompletionChime() {
  templeSound.playCompletionChime();
}

export function unlockAudio() {
  templeSound.preloadVoiceBuffer();
}
