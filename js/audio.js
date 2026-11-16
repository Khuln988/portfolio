// ===================================================================
//  audio.js — 8-bit дуу, хөгжмийг Web Audio API-гаар кодоор үүсгэнэ.
//  Аудио файл огт ашиглаагүй. Анх унтраалттай (браузерийн дүрэм).
// ===================================================================

let ctx = null;
let enabled = false;
let musicTimer = null;
let master = null;

function ac() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/** Нэг нот: square долгион = хуучин тоглоомын дуу */
function note(freq, start, dur, { type = 'square', gain = 0.08, slide = 0 } = {}) {
  const a = ac();
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  const t = a.currentTime + start;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

// Монгол ардын аялгуунд түгээмэл пентатоник (5 нот) хэмнэл
const PENTA = [261.6, 293.7, 329.6, 392.0, 440.0, 523.3, 587.3, 659.3];
const MELODY = [4, 3, 4, 5, 4, 3, 2, -1, 2, 3, 4, 3, 2, 1, 0, -1, 0, 2, 3, 4, 5, 6, 5, 4, 3, 4, 2, 3, 1, 2, 0, -1];

export const sfx = {
  get on() { return enabled; },
  toggle() {
    enabled = !enabled;
    if (enabled) { ac(); this.coin(); this.music(true); } else this.music(false);
    return enabled;
  },
  jump() { if (enabled) note(220, 0, 0.18, { slide: 2.6, gain: 0.06 }); },
  coin() { if (enabled) { note(988, 0, 0.08, { gain: 0.07 }); note(1319, 0.07, 0.25, { gain: 0.07 }); } },
  secret() { if (enabled) [523, 659, 784, 1047, 1319].forEach((f, i) => note(f, i * 0.07, 0.2, { gain: 0.06 })); },
  door() { if (enabled) { note(330, 0, 0.1, { type: 'triangle', gain: 0.15 }); note(494, 0.1, 0.2, { type: 'triangle', gain: 0.15 }); } },
  fall() { if (enabled) note(440, 0, 0.5, { slide: 0.25, gain: 0.07 }); },
  bump() { if (enabled) note(110, 0, 0.08, { type: 'triangle', gain: 0.2 }); },
  win() {
    if (!enabled) return;
    [392, 523, 659, 784, 659, 784, 1047].forEach((f, i) => note(f, i * 0.12, i === 6 ? 0.6 : 0.14, { gain: 0.07 }));
  },
  /** Арын хөгжим — пентатоник аялгууг давтана */
  music(on) {
    clearInterval(musicTimer);
    if (!on) return;
    let i = 0;
    musicTimer = setInterval(() => {
      if (!enabled || document.hidden) return;
      const n = MELODY[i % MELODY.length];
      if (n >= 0) note(PENTA[n], 0, 0.22, { type: 'triangle', gain: 0.05 });
      if (i % 4 === 0) note(PENTA[0] / 2, 0, 0.35, { type: 'triangle', gain: 0.05 }); // басс
      i++;
    }, 230);
  },
};
