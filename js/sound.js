// ===================================================================
//  sound.js — бүх дууг Web Audio API-гаар кодоор үүсгэнэ (аудио файлгүй).
//  Анх унтраалттай; хэрэглэгч 🔊 товч дарснаар асна (браузерийн дүрэм).
// ===================================================================

let ctx = null;
let enabled = false;
let lastFlap = 0;

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/** Богино «тас» дуу — цагаан шуугианаас (noise) үүсгэнэ */
function click({ freq = 2200, dur = 0.018, gain = 0.15 } = {}) {
  const a = ac();
  const len = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
  const src = a.createBufferSource();
  src.buffer = buf;
  const bp = a.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = freq;
  const g = a.createGain();
  g.gain.value = gain;
  src.connect(bp).connect(g).connect(a.destination);
  src.start();
}

/** Синус аялгуу */
function tone(freq, start, dur, gain = 0.12, type = 'sine') {
  const a = ac();
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  const t = a.currentTime + start;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export const sound = {
  get on() { return enabled; },
  toggle() {
    enabled = !enabled;
    if (enabled) this.chime();
    return enabled;
  },
  /** split-flap: олон нүд зэрэг эргэхэд чанга, гэхдээ 30мс-д нэгээс олон биш */
  flap(count = 1) {
    if (!enabled) return;
    const now = performance.now();
    if (now - lastFlap < 30) return;
    lastFlap = now;
    click({ freq: 1800 + Math.random() * 900, gain: Math.min(0.05 + count * 0.008, 0.2) });
  },
  /** нисэх буудлын «дин-дон» зарлалын дуу */
  chime() {
    if (!enabled) return;
    tone(784, 0, 0.9, 0.1);    // G5
    tone(622, 0.32, 1.1, 0.1); // D#5
  },
  /** паспортын тамга */
  stamp() {
    if (!enabled) return;
    tone(90, 0, 0.18, 0.35, 'triangle');
    click({ freq: 600, dur: 0.05, gain: 0.25 });
  },
  /** тасалбар хэвлэгч */
  printer(steps = 12, ms = 130) {
    if (!enabled) return;
    for (let i = 0; i < steps; i++) setTimeout(() => click({ freq: 900, dur: 0.03, gain: 0.1 }), i * ms);
  },
  /** онгоц өнгөрөх «шуугиан» */
  whoosh() {
    if (!enabled) return;
    const a = ac();
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(120, a.currentTime);
    o.frequency.exponentialRampToValueAtTime(60, a.currentTime + 3);
    g.gain.setValueAtTime(0.0001, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.05, a.currentTime + 1.2);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 3.5);
    const lp = a.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 400;
    o.connect(lp).connect(g).connect(a.destination);
    o.start();
    o.stop(a.currentTime + 3.6);
  },
};
