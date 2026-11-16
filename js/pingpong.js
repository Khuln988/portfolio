// ===================================================================
//  pingpong.js — тоглогдох ширээний теннис (дээрээс харсан).
//  Та доод цохиурыг хулгана/хуруу/←→-ээр хөдөлгөнө, дээд талд «Хулан-бот».
//  5 оноо түрүүлж авсан нь ялна. Хамгийн урт rally ба ялалтын тоо хадгалагдана.
// ===================================================================

import { sfx } from './audio.js';

const W = 300, H = 460, TABLE = { x: 22, y: 20, w: 256, h: 420 };
const PW = 58, PH = 9, BR = 6, WIN = 5;
const C = { cherry: '#b3122e', dark: '#7c0c22', ink: '#3b2a20', paper: '#fbf7f0', wood: '#5d3a20' };

let dlg, cv, ctx, raf = 0, state, onClose;
const keys = { left: false, right: false };
const store = {
  get rally() { try { return +localStorage.getItem('pp-rally') || 0; } catch { return 0; } },
  set rally(v) { try { localStorage.setItem('pp-rally', v); } catch {} },
  get wins() { try { return +localStorage.getItem('pp-wins') || 0; } catch { return 0; } },
  set wins(v) { try { localStorage.setItem('pp-wins', v); } catch {} },
};

export function initPingPong() {
  dlg = document.getElementById('ppDialog');
  cv = document.getElementById('ppCanvas');
  ctx = cv.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = W * dpr; cv.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // хулгана / хуруу — цохиур курсорын X байрлалыг дагана
  const follow = (e) => {
    if (!state) return;
    const r = cv.getBoundingClientRect();
    state.target = ((e.clientX - r.left) / r.width) * W;
  };
  cv.addEventListener('pointermove', follow);
  cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture(e.pointerId); follow(e); if (state.over) restart(); });
  addEventListener('keydown', (e) => {
    if (!dlg.open) return;
    if (e.key === 'ArrowLeft' || e.key === 'a') { keys.left = true; e.preventDefault(); }
    if (e.key === 'ArrowRight' || e.key === 'd') { keys.right = true; e.preventDefault(); }
    if ((e.key === ' ' || e.key === 'Enter') && state?.over) { restart(); e.preventDefault(); }
  });
  addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
  });
  dlg.addEventListener('close', () => { cancelAnimationFrame(raf); raf = 0; onClose?.(); onClose = null; });
  document.getElementById('ppClose').addEventListener('click', () => dlg.close());
  document.getElementById('ppAgain').addEventListener('click', restart);
}

export function openPingPong(cb) {
  onClose = cb;
  restart();
  dlg.showModal();
  if (!raf) loop();
}

function restart() {
  state = {
    me: { x: W / 2, vx: 0 }, ai: { x: W / 2, err: 0 }, target: null,
    score: [0, 0], rally: 0, serveTo: 1, over: false, msg: 'Бэлэн үү?', msgT: 1.2,
    ball: null, wait: 1.1,
  };
  ui();
}

function serve() {
  const dir = state.serveTo === 1 ? -1 : 1; // 1 = бот руу (дээш)
  const ang = (Math.random() - 0.5) * 0.7;
  state.ball = { x: W / 2, y: H / 2, vx: Math.sin(ang) * 3.2, vy: dir * 3.4, z: 0, from: H / 2 };
  state.rally = 0;
  state.ai.err = (Math.random() - 0.5) * 30;
}

function point(winner) {
  state.score[winner]++;
  state.serveTo = winner === 0 ? 0 : 1;
  state.ball = null;
  state.wait = 1.0;
  if (state.rally > store.rally) { store.rally = state.rally; state.msg = `Шинэ рекорд rally: ${state.rally}!`; } else state.msg = winner === 0 ? 'Оноо! ✦' : 'Бот оноо авлаа';
  state.msgT = 1.1;
  winner === 0 ? sfx.coin() : sfx.fall();
  if (state.score[winner] >= WIN) {
    state.over = true;
    state.msg = winner === 0 ? 'Та яллаа! 🏆' : 'Бот яллаа 🤖';
    state.msgT = 99;
    if (winner === 0) { store.wins = store.wins + 1; sfx.win(); }
  }
  ui();
}

function ui() {
  document.getElementById('ppScore').textContent = `${state.score[0]} : ${state.score[1]}`;
  document.getElementById('ppRec').textContent = `Рекорд rally: ${store.rally} · Ялалт: ${store.wins}`;
  document.getElementById('ppAgain').hidden = !state.over;
}

/* ---------- Физик ---------- */
function update() {
  const s = state, me = s.me, ai = s.ai;
  // миний цохиур
  const prev = me.x;
  if (keys.left) s.target = (s.target ?? me.x) - 6;
  if (keys.right) s.target = (s.target ?? me.x) + 6;
  if (s.target != null) me.x += (s.target - me.x) * 0.35;
  me.x = Math.max(TABLE.x, Math.min(TABLE.x + TABLE.w, me.x));
  me.vx = me.x - prev;

  if (s.msgT > 0) s.msgT -= 1 / 60;
  if (s.over) return;
  if (!s.ball) { s.wait -= 1 / 60; if (s.wait <= 0) serve(); return; }

  const b = s.ball;
  b.x += b.vx; b.y += b.vy;
  // хажуугийн хашлага (ширээний ирмэгээс ойно)
  if (b.x < TABLE.x + BR) { b.x = TABLE.x + BR; b.vx = Math.abs(b.vx); }
  if (b.x > TABLE.x + TABLE.w - BR) { b.x = TABLE.x + TABLE.w - BR; b.vx = -Math.abs(b.vx); }

  // бөмбөгний өндөр (z) — ширээн дээр нэг удаа ойсон мэт харагдуулна
  const span = Math.abs(b.y - b.from) / (H - 70);
  b.z = span < 0.62 ? Math.sin((span / 0.62) * Math.PI) * 16 : Math.sin(((span - 0.62) / 0.38) * Math.PI) * 9;
  if (span > 0.6 && !b.bounced) { b.bounced = true; sfx.bump(); }

  // бот: бөмбөг өөр рүүгээ ирж байхад дагана (хурд хязгаартай, жаахан алдаатай)
  const goal = b.vy < 0 ? b.x + s.ai.err : W / 2;
  const maxSpd = 3.1 + s.score[0] * 0.25 + s.rally * 0.05;
  ai.x += Math.max(-maxSpd, Math.min(maxSpd, goal - ai.x));

  // цохиурууд
  const hitPad = (px, py, dir) => {
    if (Math.sign(b.vy) !== dir) return false;
    if (Math.abs(b.y - py) > PH / 2 + BR || Math.abs(b.x - px) > PW / 2 + BR) return false;
    const off = (b.x - px) / (PW / 2);              // цохиурын аль хэсэгт тусав (-1..1)
    const speed = Math.min(8.5, Math.hypot(b.vx, b.vy) * 1.05 + 0.15);
    const ang = off * 0.95 + (dir > 0 ? me.vx * 0.04 : 0);
    b.vx = Math.sin(ang) * speed; b.vy = -dir * Math.cos(ang) * speed;
    b.from = b.y; b.bounced = false;
    s.rally++;
    s.ai.err = (Math.random() - 0.5) * (26 + s.rally * 2);
    sfx.jump();
    return true;
  };
  hitPad(me.x, H - 34, 1);
  hitPad(ai.x, 34, -1);

  if (b.y > H + 10) point(1);
  else if (b.y < -10) point(0);
}

/* ---------- Зурах ---------- */
function draw() {
  const s = state;
  ctx.clearRect(0, 0, W, H);
  // ширээ: cherry өнгө, цагаан шугам, тор
  ctx.fillStyle = C.wood; rr(TABLE.x - 6, TABLE.y - 6, TABLE.w + 12, TABLE.h + 12, 12); ctx.fill();
  const g = ctx.createLinearGradient(0, TABLE.y, 0, TABLE.y + TABLE.h);
  g.addColorStop(0, '#c8173a'); g.addColorStop(1, '#8e0f28');
  ctx.fillStyle = g; ctx.fillRect(TABLE.x, TABLE.y, TABLE.w, TABLE.h);
  ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 3;
  ctx.strokeRect(TABLE.x + 1.5, TABLE.y + 1.5, TABLE.w - 3, TABLE.h - 3);
  ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(W / 2, TABLE.y); ctx.lineTo(W / 2, TABLE.y + TABLE.h); ctx.stroke();
  // тор
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(TABLE.x - 10, H / 2 - 4, TABLE.w + 20, 8);
  ctx.fillStyle = C.paper; ctx.fillRect(TABLE.x - 10, H / 2 - 1.5, TABLE.w + 20, 3);
  ctx.fillStyle = C.ink; ctx.fillRect(TABLE.x - 14, H / 2 - 5, 6, 10); ctx.fillRect(TABLE.x + TABLE.w + 8, H / 2 - 5, 6, 10);

  // цохиурууд
  paddle(s.ai.x, 34, '#2f2f2f');
  paddle(s.me.x, H - 34, C.cherry);

  // бөмбөг + сүүдэр
  const b = s.ball;
  if (b) {
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(b.x + b.z * 0.4, b.y + b.z * 0.6, BR, BR * 0.7, 0, 0, 7); ctx.fill();
    const r = BR * (1 + b.z / 40);
    ctx.fillStyle = '#fffdf8'; ctx.beginPath(); ctx.arc(b.x, b.y - b.z * 0.2, r, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(59,42,32,.4)'; ctx.lineWidth = 1; ctx.stroke();
  }

  // rally тоолуур
  if (b && s.rally > 1) {
    ctx.font = '900 13px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,.75)';
    ctx.fillText(`RALLY ${s.rally}`, W / 2, H / 2 + 26);
  }
  // мессеж
  if (s.msgT > 0) {
    ctx.save();
    const k = Math.min(1, s.msgT * 3);
    ctx.globalAlpha = k;
    ctx.translate(W / 2, H / 2 - 30); ctx.scale(0.8 + k * 0.2, 0.8 + k * 0.2);
    ctx.font = '400 24px "Dela Gothic One", Nunito, sans-serif'; ctx.textAlign = 'center';
    ctx.lineWidth = 6; ctx.strokeStyle = C.ink; ctx.strokeText(s.msg, 0, 0);
    ctx.fillStyle = '#fff'; ctx.fillText(s.msg, 0, 0);
    if (s.over) { ctx.font = '800 13px Nunito, sans-serif'; ctx.strokeText('дарж дахин эхлэх', 0, 28); ctx.fillText('дарж дахин эхлэх', 0, 28); }
    ctx.restore();
  }
}
function paddle(x, y, color) {
  ctx.fillStyle = 'rgba(0,0,0,.25)'; rr(x - PW / 2 + 2, y - PH / 2 + 3, PW, PH, 5); ctx.fill();
  ctx.fillStyle = color; rr(x - PW / 2, y - PH / 2, PW, PH, 5); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.35)'; rr(x - PW / 2 + 4, y - PH / 2 + 1.5, PW - 8, 2, 1); ctx.fill();
}
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); }

function loop() {
  update();
  draw();
  raf = requestAnimationFrame(loop);
}
