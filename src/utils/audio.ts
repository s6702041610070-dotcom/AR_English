// Web Audio API Synthesizer for educational game SFX

class SoundFX {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Sparkling ascending major chime: C5, E5, G5, C6
  public playCorrectChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = this.ctx.currentTime;

    notes.forEach((freq, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      gain.gain.setValueAtTime(0, now + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.18, now + index * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.5);
    });
  }

  // Dissonant descending buzzer sound for mistakes
  public playWrongBuzzer() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';

    osc1.frequency.setValueAtTime(140, now);
    osc1.frequency.linearRampToValueAtTime(80, now + 0.32);

    osc2.frequency.setValueAtTime(148, now); // slight detune dissonance
    osc2.frequency.linearRampToValueAtTime(85, now + 0.32);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.33);
    osc2.stop(now + 0.33);
  }

  // Crisp tactile snap/pop for pinch grabbing
  public playGrabSnap() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.07);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Gentle water splash / bubble sound
  public playSplash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Filtered noise + bubble pop
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.2);
    filter.Q.setValueAtTime(3, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.21);

    // Add high tone bubble bloop
    const bubbleOsc = this.ctx.createOscillator();
    const bubbleGain = this.ctx.createGain();
    bubbleOsc.type = 'sine';
    bubbleOsc.frequency.setValueAtTime(450, now);
    bubbleOsc.frequency.exponentialRampToValueAtTime(950, now + 0.12);

    bubbleGain.gain.setValueAtTime(0.15, now);
    bubbleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    bubbleOsc.connect(bubbleGain);
    bubbleGain.connect(this.ctx.destination);

    bubbleOsc.start(now);
    bubbleOsc.stop(now + 0.16);
  }
}

export const soundFX = new SoundFX();
