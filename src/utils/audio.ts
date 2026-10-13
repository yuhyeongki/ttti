// Web Audio API synthesizer for hermetic, reliable sound effects

let audioCtx: AudioContext | null = null;
let noiseNode: AudioNode | null = null;
let noiseGainNode: GainNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Rich resonant chime when a Pomodoro focus session finishes.
 */
export function playPomodoroCompletedChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const frequencies = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 chord

  frequencies.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + index * 0.08);

    const startTime = now + index * 0.08;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.25 / (index + 1), startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 2.5);
  });
}

/**
 * Uplifting two-tone chime when a Break finishes.
 */
export function playBreakCompletedChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const chord = [440, 554.37, 659.25]; // A major

  chord.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + index * 0.1);

    const startTime = now + index * 0.1;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.2, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 1.9);
  });
}

/**
 * Gentle wooden tick sound for the ticking option.
 */
export function playTick(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.03);

  gain.gain.setValueAtTime(0.04, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.035);
}

/**
 * Gentle UI click sound.
 */
export function playClick(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);

  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.05);
}

/**
 * Toggle soothing pink/brown ambient noise for deep concentration.
 */
export function setAmbientNoise(enabled: boolean): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (!enabled) {
    if (noiseNode) {
      try {
        if (noiseGainNode) {
          noiseGainNode.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
          setTimeout(() => {
            noiseNode?.disconnect();
            noiseGainNode?.disconnect();
            noiseNode = null;
            noiseGainNode = null;
          }, 500);
        } else {
          noiseNode.disconnect();
          noiseNode = null;
        }
      } catch {
        noiseNode = null;
      }
    }
    return;
  }

  if (noiseNode) return; // already playing

  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Pink noise approximation
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
    b6 = white * 0.115926;
  }

  const whiteNoiseSource = ctx.createBufferSource();
  whiteNoiseSource.buffer = buffer;
  whiteNoiseSource.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(450, ctx.currentTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 1.0);

  whiteNoiseSource.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  whiteNoiseSource.start();
  noiseNode = whiteNoiseSource;
  noiseGainNode = gain;
}
