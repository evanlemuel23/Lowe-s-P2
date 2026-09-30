export const soundBank = [
  { id: 'kick', name: 'Deep Kick', type: 'KICK', key: 'Q', color: 'coral' },
  { id: 'snare', name: 'Studio Snare', type: 'SNARE', key: 'W', color: 'amber' },
  { id: 'clap', name: 'Hand Clap', type: 'CLAP', key: 'E', color: 'mint' },
  { id: 'hat', name: 'Closed Hat', type: 'HI-HAT', key: 'A', color: 'sky' },
  { id: 'openHat', name: 'Open Hat', type: 'HI-HAT', key: 'S', color: 'lavender' },
  { id: 'tom', name: 'Low Tom', type: 'TOM', key: 'D', color: 'coral' },
  { id: 'rim', name: 'Rim Shot', type: 'PERC', key: 'Z', color: 'amber' },
  { id: 'shaker', name: 'Shaker', type: 'PERC', key: 'X', color: 'mint' },
  { id: 'crash', name: 'Crash', type: 'CYMBAL', key: 'C', color: 'sky' },
];

function noiseBuffer(context, duration = 0.35) {
  const length = Math.ceil(context.sampleRate * duration);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) {
    channel[index] = Math.random() * 2 - 1;
  }
  return buffer;
}

function tone(context, output, { frequency, endFrequency, duration, wave = 'sine', level = 0.8 }) {
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  const now = context.currentTime;
  oscillator.type = wave;
  oscillator.frequency.setValueAtTime(frequency, now);
  if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + duration);
  envelope.gain.setValueAtTime(level, now);
  envelope.gain.exponentialRampToValueAtTime(0.001, now + duration);
  oscillator.connect(envelope).connect(output);
  oscillator.start(now);
  oscillator.stop(now + duration);
}

function noise(context, output, { duration, cutoff, level = 0.6, bursts = 1 }) {
  const now = context.currentTime;
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();
  source.buffer = noiseBuffer(context, duration + 0.02);
  filter.type = 'highpass';
  filter.frequency.value = cutoff;
  envelope.gain.setValueAtTime(level, now);
  envelope.gain.exponentialRampToValueAtTime(0.001, now + duration);
  source.connect(filter).connect(envelope).connect(output);
  source.start(now);
  source.stop(now + duration);

  for (let burst = 1; burst < bursts; burst += 1) {
    const repeat = context.createBufferSource();
    const repeatGain = context.createGain();
    repeat.buffer = source.buffer;
    repeatGain.gain.setValueAtTime(level * 0.72 ** burst, now + burst * 0.035);
    repeatGain.gain.exponentialRampToValueAtTime(0.001, now + burst * 0.035 + duration * 0.55);
    repeat.connect(filter).connect(repeatGain).connect(output);
    repeat.start(now + burst * 0.035);
    repeat.stop(now + burst * 0.035 + duration * 0.55);
  }
}

export function playSound(context, output, soundId) {
  switch (soundId) {
    case 'kick':
      tone(context, output, { frequency: 155, endFrequency: 42, duration: 0.42, level: 1 });
      break;
    case 'snare':
      tone(context, output, { frequency: 190, endFrequency: 115, duration: 0.17, level: 0.48 });
      noise(context, output, { duration: 0.2, cutoff: 1350, level: 0.62 });
      break;
    case 'clap':
      noise(context, output, { duration: 0.19, cutoff: 900, level: 0.66, bursts: 4 });
      break;
    case 'hat':
      noise(context, output, { duration: 0.065, cutoff: 7000, level: 0.46 });
      break;
    case 'openHat':
      noise(context, output, { duration: 0.48, cutoff: 6200, level: 0.38 });
      break;
    case 'tom':
      tone(context, output, { frequency: 180, endFrequency: 78, duration: 0.34, wave: 'sine', level: 0.8 });
      break;
    case 'rim':
      tone(context, output, { frequency: 1250, endFrequency: 520, duration: 0.075, wave: 'triangle', level: 0.55 });
      break;
    case 'shaker':
      noise(context, output, { duration: 0.12, cutoff: 4200, level: 0.25, bursts: 3 });
      break;
    case 'crash':
      noise(context, output, { duration: 0.85, cutoff: 4600, level: 0.34 });
      break;
    default:
      break;
  }
}