// ===================================================================
//  art.js — бүх зургийг кодоор зурна (зургийн файл бараг байхгүй).
//  Жижиг (логик) нягтралтай canvas дээр зураад томруулж харуулдаг тул
//  «пиксел арт» харагдана. Өнгө: цагаан цаас · бор бэх · cherry red.
// ===================================================================

import { GROUND, VIEW_H } from './world.js';

export const palettes = {
  day: {
    paper: '#fbf7f0', rule: 'rgba(179,18,46,.09)', margin: 'rgba(179,18,46,.35)',
    ink: '#3b2a20', inkSoft: 'rgba(59,42,32,.35)', far: 'rgba(122,82,56,.32)', mid: 'rgba(122,82,56,.5)',
    ground: '#f1e6d4', hatch: 'rgba(122,82,56,.25)', sun: '#b3122e', cloud: '#fffdf8', glow: 'rgba(255,214,140,.35)',
    night: 0,
  },
  night: {
    paper: '#1f1713', rule: 'rgba(244,199,207,.06)', margin: 'rgba(244,199,207,.2)',
    ink: '#f3e6cf', inkSoft: 'rgba(243,230,207,.3)', far: 'rgba(243,230,207,.16)', mid: 'rgba(243,230,207,.28)',
    ground: '#2b201a', hatch: 'rgba(243,230,207,.12)', sun: '#f3e6cf', cloud: '#2f241e', glow: 'rgba(255,190,110,.28)',
    night: 1,
  },
};
export const C = {
  cherry: '#b3122e', cherryDark: '#7c0c22', sakura: '#f4c7cf', sakuraDeep: '#e48a9c',
  brown: '#7a5238', brownLight: '#c9a27e', wood: '#8a5a34', woodDark: '#5d3a20',
  white: '#fffdf8', ink: '#3b2a20',
};

const R = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
// Бэхэн хүрээтэй тэгш өнцөгт (манга/скетч маяг)
const box = (ctx, x, y, w, h, fill, ink) => { R(ctx, x, y, w, h, ink); R(ctx, x + 1, y + 1, w - 2, h - 2, fill); };
const hash = (n) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };


/* ---------- 3×5 пиксел фонт (жижиг бичигт бүдгэрэхгүй) ---------- */
const GLYPH = {
  0: '111101101101111', 1: '010110010010111', 2: '111001111100111', 3: '111001111001111', 4: '101101111001001',
  5: '111100111001111', 6: '111100111101111', 7: '111001010010010', 8: '111101111101111', 9: '111101111001111',
  N: '101111111111101', E: '111100110100111', W: '101101111111101',
};
export function pixelText(ctx, str, x, y, color) {
  ctx.fillStyle = color;
  [...str].forEach((ch, i) => {
    const g = GLYPH[ch];
    if (!g) return;
    for (let k = 0; k < 15; k++) if (g[k] === '1') ctx.fillRect(Math.round(x) + i * 4 + (k % 3), Math.round(y) + ((k / 3) | 0), 1, 1);
  });
}

/* ---------- Цаасан дэвсгэр (дэвтрийн мөр) ---------- */
export function drawPaper(ctx, w, h, top, p, camX, t) {
  R(ctx, 0, top, w, h, p.paper);
  const off = Math.round(camX * 0.05) % 12;
  for (let y = 12 - (top % 12 + 12) % 12 + top; y < VIEW_H; y += 12) R(ctx, 0, y, w, 1, p.rule);
  // дэвтрийн улаан захын шугам — бага зэрэг хөдөлнө (параллакс)
  const mx = 34 - Math.round(camX * 0.05) % (w + 40);
  if (mx > -2) R(ctx, mx, top, 1, h, p.margin);
  if (p.night) {
    for (let i = 0; i < 60; i++) {
      const sx = (hash(i) * w) | 0, sy = top + ((hash(i + 99) * (VIEW_H - top - 100)) | 0);
      const tw = (Math.sin(t * 2 + i) + 1) / 2;
      R(ctx, sx, sy, 1, 1, `rgba(243,230,207,${0.2 + tw * 0.6})`);
    }
  }
  // нар / сар — бэхэн тойрог + зураас (скетч)
  const sx = w - 64, sy = Math.max(top + 30, 38);
  ctx.strokeStyle = p.sun; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(sx, sy, 11, 0, 7); ctx.stroke();
  if (!p.night) {
    for (let i = 0; i < 10; i++) {
      const a = i * 0.628 + t * 0.2, r1 = 14, r2 = 18 + (i % 2) * 3;
      ctx.beginPath(); ctx.moveTo(sx + Math.cos(a) * r1, sy + Math.sin(a) * r1); ctx.lineTo(sx + Math.cos(a) * r2, sy + Math.sin(a) * r2); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(179,18,46,.12)'; ctx.beginPath(); ctx.arc(sx, sy, 10, 0, 7); ctx.fill();
  } else {
    ctx.fillStyle = p.sun; ctx.beginPath(); ctx.arc(sx, sy, 10, 0, 7); ctx.fill();
    ctx.fillStyle = p.paper; ctx.beginPath(); ctx.arc(sx + 5, sy - 3, 9, 0, 7); ctx.fill();
  }
}

/* ---------- Параллакс: харандаагаар зурсан уул, толгод ---------- */
function ridgeLine(ctx, camX, w, factor, base, amp, freq, color, seed, fill) {
  let prev = null;
  for (let x = 0; x <= w; x += 2) {
    const wx = x + camX * factor;
    const y = Math.round(base - amp * (0.55 * Math.sin(wx * freq + seed) + 0.3 * Math.sin(wx * freq * 2.3 + seed * 2) + 0.15 * Math.sin(wx * freq * 5.1)));
    if (fill) R(ctx, x, y + 1, 2, VIEW_H - y, fill);
    if (prev !== null) R(ctx, x, Math.min(prev, y), 2, Math.abs(prev - y) + 1, color);
    // налуу зураасан сүүдэр (hatching)
    if (fill && (x + Math.round(camX * factor)) % 6 === 0) R(ctx, x, y + 3, 1, 3, color);
    prev = y;
  }
}
export function drawParallax(ctx, camX, w, p, t) {
  for (let i = 0; i < 5; i++) {
    const cx = ((i * 190 - camX * 0.08 - t * 3) % (w + 140) + w + 140) % (w + 140) - 70;
    cloud(ctx, cx, 30 + (i % 3) * 20, p);
  }
  ridgeLine(ctx, camX, w, 0.12, 146, 36, 0.012, p.far, 1, null);
  ridgeLine(ctx, camX, w, 0.3, 170, 18, 0.02, p.mid, 4, p.paper);
  ridgeLine(ctx, camX, w, 0.55, 190, 8, 0.035, p.mid, 7, p.paper);
}
function cloud(ctx, x, y, p) {
  ctx.fillStyle = p.cloud; ctx.strokeStyle = p.inkSoft; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x + 10, y + 6, 7, Math.PI, 0); ctx.arc(x + 22, y + 3, 9, Math.PI, 0); ctx.arc(x + 34, y + 7, 6, Math.PI, 0);
  ctx.lineTo(x + 40, y + 12); ctx.lineTo(x + 3, y + 12); ctx.closePath();
  ctx.fill(); ctx.stroke();
}

/* ---------- Газар: бэхэн шугам + налуу зураас ---------- */
export function drawGround(ctx, camX, w, grounds, p) {
  for (const [a, b] of grounds) {
    const x0 = Math.max(a - camX, -2), x1 = Math.min(b - camX, w + 2);
    if (x1 < 0 || x0 > w) continue;
    R(ctx, x0, GROUND, x1 - x0, VIEW_H - GROUND + 300, p.ground);
    R(ctx, x0, GROUND, x1 - x0, 2, p.ink);
    for (let wx = Math.ceil(Math.max(a, camX) / 5) * 5; wx < Math.min(b, camX + w); wx += 5) {
      const sx = wx - camX, hv = hash(wx);
      // налуу зураас
      for (let k = 0; k < 4; k++) R(ctx, sx + k, GROUND + 5 + k, 1, 1, p.hatch);
      if (hv > 0.82) { R(ctx, sx, GROUND - 2, 1, 2, p.ink); R(ctx, sx + 2, GROUND - 3, 1, 3, p.ink); }
      if (hv < 0.05) R(ctx, sx, GROUND + 14 + ((hv * 300) | 0) % 20, 2, 1, p.hatch);
    }
    R(ctx, a - camX, GROUND, 2, VIEW_H, p.ink);
    R(ctx, b - camX - 2, GROUND, 2, VIEW_H, p.ink);
  }
}

/* ---------- Номон тавцан ---------- */
const BOOKS = ['#b3122e', '#7a5238', '#fffdf8', '#c9a27e', '#7c0c22'];
export function drawPlatform(ctx, x, y, w, p, hidden, t) {
  if (hidden) ctx.globalAlpha = 0.2 + 0.12 * Math.sin(t * 3);
  // 2 давхар ном
  const c1 = BOOKS[(x / 8 | 0) % 5], c2 = BOOKS[(x / 8 + 2 | 0) % 5];
  box(ctx, x, y, w, 5, c1, C.ink);
  box(ctx, x + 3, y + 4, w - 6, 5, c2, C.ink);
  R(ctx, x + w - 4, y + 1, 2, 3, '#f3e6cf'); // хуудасны ирмэг
  R(ctx, x + 6, y + 2, w - 14, 1, 'rgba(255,255,255,.35)');
  ctx.globalAlpha = 1;
}

/* ---------- Будгийн сав (саад) ---------- */
export function drawRock(ctx, x, w, h) {
  const y = GROUND - h;
  box(ctx, x, y + 2, w, h - 2, C.white, C.ink);
  R(ctx, x + 1, y + 2, w - 2, 4, C.cherry);
  R(ctx, x + 3, y + 6, 2, 3, C.cherry); R(ctx, x + w - 6, y + 6, 2, 5, C.cherry); // дусал
  R(ctx, x - 1, y, w + 2, 2, C.ink);
}

export function drawDecor(ctx, x, type, k, p) {
  if (type === 'tuft') {
    R(ctx, x, GROUND - 4, 1, 4, p.ink); R(ctx, x + 2, GROUND - 6, 1, 6, p.ink); R(ctx, x + 4, GROUND - 3, 1, 3, p.ink);
  } else if (type === 'flower') {
    R(ctx, x + 2, GROUND - 7, 1, 7, p.ink);
    R(ctx, x, GROUND - 10, 2, 2, C.sakuraDeep); R(ctx, x + 3, GROUND - 10, 2, 2, C.sakuraDeep); R(ctx, x + 1, GROUND - 12, 3, 2, C.sakura); R(ctx, x + 1, GROUND - 9, 3, 2, C.sakura);
    R(ctx, x + 2, GROUND - 10, 1, 1, C.cherry);
  } else {
    box(ctx, x, GROUND - 4, 16, 4, BOOKS[k % 5], C.ink);
    box(ctx, x + 2, GROUND - 7, 12, 4, BOOKS[(k + 2) % 5], C.ink);
  }
}

/* ---------- Самбар (зурсан мод) ---------- */
export function drawSign(ctx, x, active, t, p) {
  R(ctx, x + 9, GROUND - 22, 3, 22, C.woodDark);
  const bob = active ? Math.round(Math.sin(t * 8)) : 0;
  box(ctx, x, GROUND - 35 + bob, 22, 15, C.white, p.ink === '#3b2a20' ? C.ink : C.brown);
  R(ctx, x + 4, GROUND - 30 + bob, 14, 1, C.brownLight);
  R(ctx, x + 4, GROUND - 27 + bob, 9, 1, C.brownLight);
  R(ctx, x + 15, GROUND - 26 + bob, 3, 3, C.cherry);
  if (active) { R(ctx, x + 10, GROUND - 46 + bob, 2, 6, C.cherry); R(ctx, x + 10, GROUND - 38 + bob, 2, 2, C.cherry); }
}

/* ---------- Стикер (ур чадвар) — эргэлдэнэ ---------- */
export function drawCoin(ctx, x, y, color, t, secret) {
  const bob = Math.sin(t * 4 + x) * 2;
  const sw = Math.abs(Math.cos(t * 2.6 + x * 0.1));
  const w = Math.max(2, Math.round(11 * sw));
  const cx = Math.round(x - w / 2), cy = Math.round(y - 6 + bob);
  if (secret) ctx.globalAlpha = 0.55 + 0.45 * Math.sin(t * 10);
  // одон хэлбэр: тэгш өнцөгт + булан
  R(ctx, cx, cy + 2, w, 7, C.ink);
  R(ctx, cx + (w > 4 ? 1 : 0), cy + 1, Math.max(1, w - 2), 9, C.ink);
  R(ctx, cx + (w > 6 ? 2 : 0), cy, Math.max(1, w - 4), 11, C.ink);
  R(ctx, cx + 1, cy + 2, Math.max(1, w - 2), 7, color);
  R(ctx, cx + (w > 6 ? 2 : 0), cy + 1, Math.max(1, w - 4), 9, color);
  if (w > 6) { R(ctx, cx + 2, cy + 2, 2, 2, 'rgba(255,255,255,.8)'); R(ctx, Math.round(x) - 1, cy + 4, 2, 3, '#fffdf8'); }
  ctx.globalAlpha = 1;
}

/* ---------- ХОББИ объектууд ---------- */
export function drawHobby(ctx, o, t, near, p) {
  const x = o.x, y = GROUND;
  if (near) { ctx.fillStyle = p.glow; ctx.beginPath(); ctx.ellipse(x + 32, y - 22, 40, 30, 0, 0, 7); ctx.fill(); }
  ({ draw: easel, anime: tv, read: nook, volley: scoreboard, pingpong, billiard: pool })[o.id](ctx, x, y, t, o);
}

function easel(ctx, x, y, t) {
  // гурван хөлт мольберт + зурагтай даавуу
  R(ctx, x + 18, y - 52, 2, 52, C.wood); R(ctx, x + 44, y - 52, 2, 52, C.wood); R(ctx, x + 31, y - 46, 2, 46, C.woodDark);
  R(ctx, x + 14, y - 16, 36, 2, C.woodDark);
  box(ctx, x + 12, y - 58, 40, 32, C.white, C.ink);
  // зураг: нар, уул, интоорын мөчир — зурж буй мэт аажуухан гарч ирнэ
  const prog = (t * 0.25) % 1.4;
  ctx.save(); ctx.beginPath(); ctx.rect(x + 13, y - 57, Math.min(38, 38 * prog * 1.2), 30); ctx.clip();
  R(ctx, x + 13, y - 57, 38, 30, '#fde9ec');
  ctx.fillStyle = C.cherry; ctx.beginPath(); ctx.arc(x + 40, y - 48, 4, 0, 7); ctx.fill();
  ctx.fillStyle = C.brown; ctx.beginPath(); ctx.moveTo(x + 13, y - 28); ctx.lineTo(x + 24, y - 42); ctx.lineTo(x + 33, y - 33); ctx.lineTo(x + 40, y - 39); ctx.lineTo(x + 51, y - 28); ctx.fill();
  R(ctx, x + 15, y - 52, 10, 1, C.woodDark); [0, 3, 6, 9].forEach((d) => R(ctx, x + 16 + d, y - 54 + (d % 2), 2, 2, C.sakuraDeep));
  ctx.restore();
  // палитр
  ctx.fillStyle = C.brownLight; ctx.beginPath(); ctx.ellipse(x + 8, y - 3, 8, 3, 0, 0, 7); ctx.fill();
  R(ctx, x + 3, y - 4, 2, 2, C.cherry); R(ctx, x + 7, y - 5, 2, 2, '#fffdf8'); R(ctx, x + 11, y - 4, 2, 2, C.ink);
  // бийр «хөдөлнө»
  const bx = x + 13 + Math.min(38, 38 * prog * 1.2);
  if (prog < 0.85) { R(ctx, bx, y - 46 + Math.sin(t * 9) * 6, 2, 10, C.woodDark); R(ctx, bx, y - 47 + Math.sin(t * 9) * 6, 2, 2, C.cherry); }
}

function tv(ctx, x, y, t) {
  // хуучин зурагт + анимэ нүд (анивчина)
  R(ctx, x + 22, y - 62, 1, 10, C.ink); R(ctx, x + 40, y - 64, 1, 12, C.ink);
  box(ctx, x + 8, y - 54, 48, 36, C.cherryDark, C.ink);
  box(ctx, x + 12, y - 50, 34, 28, '#fff3f5', C.ink);
  R(ctx, x + 49, y - 46, 4, 4, C.white); R(ctx, x + 49, y - 39, 4, 4, C.brownLight);
  R(ctx, x + 14, y - 18, 4, 18, C.woodDark); R(ctx, x + 46, y - 18, 4, 18, C.woodDark);
  const blink = (t % 3.2) > 3.0;
  const scene = Math.floor(t / 4) % 2;
  if (scene === 0) {
    // том анимэ нүд
    for (const ex of [x + 17, x + 31]) {
      if (blink) { R(ctx, ex, y - 37, 10, 2, C.ink); continue; }
      box(ctx, ex, y - 44, 10, 14, '#fff', C.ink);
      R(ctx, ex + 2, y - 41, 7, 10, C.cherry); R(ctx, ex + 3, y - 38, 5, 6, C.cherryDark);
      R(ctx, ex + 3, y - 40, 3, 3, '#fff'); R(ctx, ex + 6, y - 34, 1, 1, '#fff');
      R(ctx, ex - 1, y - 46, 12, 2, C.ink);
    }
    R(ctx, x + 26, y - 26, 6, 1, C.sakuraDeep);
  } else {
    // хурдны зураас + ✦
    for (let i = 0; i < 8; i++) R(ctx, x + 13 + ((i * 7 + t * 60) % 32), y - 48 + i * 3, 6, 1, C.sakuraDeep);
    const sx = x + 28, sy = y - 37; R(ctx, sx, sy - 4, 1, 9, C.cherry); R(ctx, sx - 4, sy, 9, 1, C.cherry); R(ctx, sx - 1, sy - 1, 3, 3, C.cherry);
  }
}

function nook(ctx, x, y, t) {
  // гэрэлтэй дэнлүү
  R(ctx, x + 4, y - 50, 2, 50, C.ink); R(ctx, x, y - 2, 10, 2, C.ink);
  box(ctx, x - 3, y - 58, 16, 9, '#f6d69b', C.ink);
  ctx.fillStyle = 'rgba(255,214,140,.22)'; ctx.beginPath(); ctx.moveTo(x - 3, y - 49); ctx.lineTo(x + 13, y - 49); ctx.lineTo(x + 30, y); ctx.lineTo(x - 18, y); ctx.fill();
  // cherry сандал
  box(ctx, x + 18, y - 30, 36, 18, C.cherry, C.ink);
  box(ctx, x + 14, y - 22, 8, 22, C.cherryDark, C.ink); box(ctx, x + 50, y - 22, 8, 22, C.cherryDark, C.ink);
  box(ctx, x + 20, y - 16, 32, 10, C.cherry, C.ink);
  R(ctx, x + 22, y - 6, 2, 6, C.woodDark); R(ctx, x + 48, y - 6, 2, 6, C.woodDark);
  // нээлттэй ном — хуудас эргэнэ
  box(ctx, x + 28, y - 21, 16, 6, C.white, C.ink); R(ctx, x + 36, y - 21, 1, 6, C.ink);
  const f = (t * 1.2) % 2;
  if (f < 1) { const fx = x + 36 + Math.round(Math.cos(f * Math.PI) * 7); R(ctx, Math.min(fx, x + 36), y - 24, Math.abs(fx - (x + 36)) + 1, 4, C.white); }
  // номын овоо
  box(ctx, x + 58, y - 5, 14, 5, C.brown, C.ink); box(ctx, x + 59, y - 9, 12, 5, C.white, C.ink); box(ctx, x + 57, y - 13, 15, 5, C.cherry, C.ink);
}

function scoreboard(ctx, x, y, t, o) {
  // волейболын онооны самбар (тор нь тусдаа)
  R(ctx, x + 6, y - 40, 2, 40, C.ink);
  box(ctx, x - 2, y - 52, 26, 14, C.ink, C.ink);
  pixelText(ctx, String(Math.min(99, o.score ?? 0)).padStart(2, '0'), x + 7, y - 48, '#ffd36e');
}

export function drawNet(ctx, net, p) {
  R(ctx, net.x - 1, net.top - 6, 3, GROUND - net.top + 6, C.ink);
  for (let yy = net.top; yy < net.top + 26; yy += 4) R(ctx, net.x - 1, yy, 3, 1, p.inkSoft);
  R(ctx, net.x - 3, net.top, 7, 2, C.white);
  R(ctx, net.x - 1, net.top + 26, 3, 1, C.white);
}
export function drawVolleyBall(ctx, b, t) {
  const x = Math.round(b.x), y = Math.round(b.y);
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, b.r + 1, 0, 7); ctx.fill();
  ctx.fillStyle = '#fffdf8'; ctx.beginPath(); ctx.arc(x, y, b.r, 0, 7); ctx.fill();
  ctx.save(); ctx.translate(x, y); ctx.rotate(b.rot || 0);
  ctx.strokeStyle = C.cherry; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(-3, 0, 5, -1.1, 1.1); ctx.stroke();
  ctx.strokeStyle = '#2f5fb3'; ctx.beginPath(); ctx.arc(3, -1, 5, 2, 4.2); ctx.stroke();
  ctx.restore();
  // сүүдэр
  const sh = Math.max(2, 7 - (GROUND - y) / 12);
  ctx.fillStyle = 'rgba(59,42,32,.2)'; ctx.beginPath(); ctx.ellipse(x, GROUND - 1, sh, 1.5, 0, 0, 7); ctx.fill();
}

function pingpong(ctx, x, y, t) {
  // cherry ширээ + цагаан шугам + хөдлөх бөмбөг ба цохиур
  box(ctx, x + 2, y - 26, 60, 5, C.cherry, C.ink);
  R(ctx, x + 32, y - 26, 1, 5, C.white); R(ctx, x + 3, y - 25, 58, 1, 'rgba(255,255,255,.5)');
  R(ctx, x + 31, y - 32, 2, 7, C.ink); R(ctx, x + 28, y - 32, 8, 1, C.white);
  R(ctx, x + 8, y - 21, 2, 21, C.woodDark); R(ctx, x + 54, y - 21, 2, 21, C.woodDark);
  const ph = (t * 1.3) % 2, dir = ph < 1 ? ph : 2 - ph;
  const bx = x + 8 + dir * 48, by = y - 30 - Math.abs(Math.sin(ph * Math.PI)) * 18;
  R(ctx, bx, by, 3, 3, '#fffdf8'); R(ctx, bx, by + 2, 3, 1, C.brownLight);
  const lp = y - 34 - (dir < 0.15 ? 4 : 0), rp = y - 34 - (dir > 0.85 ? 4 : 0);
  box(ctx, x - 2, lp, 6, 7, C.cherry, C.ink); R(ctx, x, lp + 7, 2, 4, C.woodDark);
  box(ctx, x + 60, rp, 6, 7, '#2f2f2f', C.ink); R(ctx, x + 62, rp + 7, 2, 4, C.woodDark);
}

function pool(ctx, x, y, t) {
  box(ctx, x, y - 24, 66, 10, C.wood, C.ink);
  R(ctx, x + 3, y - 22, 60, 6, C.cherry);
  R(ctx, x + 6, y - 14, 3, 14, C.woodDark); R(ctx, x + 57, y - 14, 3, 14, C.woodDark);
  [[0, 0], [31, 0], [61, 0]].forEach(([dx]) => R(ctx, x + 2 + dx, y - 23, 3, 2, '#120b08'));
  [[40, '#f2c14e'], [44, '#2f5fb3'], [48, '#151515'], [52, '#2e8b57']].forEach(([dx, c], i) => R(ctx, x + dx, y - 21 + (i % 2), 3, 3, c));
  const pull = Math.abs(Math.sin(t * 2)) * 6;
  R(ctx, x + 18, y - 20, 2, 2, '#fffdf8');
  R(ctx, x - 10 - pull, y - 19, 26, 1, C.brownLight); R(ctx, x + 14 - pull, y - 19, 3, 1, '#fffdf8');
}

/* ---------- Бүтээлийн жааз ---------- */
export function drawFrame(ctx, f, i, img, visited, near, t, p) {
  const x = f.x, y = GROUND;
  if (near) { ctx.fillStyle = p.glow; ctx.beginPath(); ctx.ellipse(x + 36, y - 40, 46, 38, 0, 0, 7); ctx.fill(); }
  // тавиур
  R(ctx, x + 14, y - 22, 2, 22, C.woodDark); R(ctx, x + 56, y - 22, 2, 22, C.woodDark);
  const bob = near ? Math.round(Math.sin(t * 6)) : 0;
  const fy = y - 70 + bob;
  box(ctx, x, fy, 72, 50, C.wood, C.ink);
  R(ctx, x + 2, fy + 2, 68, 1, C.brownLight);
  box(ctx, x + 5, fy + 5, 62, 40, C.white, C.woodDark);
  if (img && img.complete && img.naturalWidth) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, x + 6, fy + 6, 60, 38);
  } else R(ctx, x + 6, fy + 6, 60, 38, f.accent);
  // нэрийн хавтан
  box(ctx, x + 22, y - 18, 28, 9, visited ? '#e9f6ee' : C.white, C.ink);
  pixelText(ctx, '0' + (i + 1), x + 33, y - 16, C.ink);
  if (f.isNew) { // «NEW» тууз
    const w = Math.round(Math.sin(t * 5) * 1);
    box(ctx, x + 50, fy - 6 + w, 24, 9, C.cherry, C.ink);
    pixelText(ctx, 'NEW', x + 56, fy - 4 + w, '#fff');
  }
  if (visited) { R(ctx, x + 3, fy + 3, 5, 5, '#2f9e6e'); R(ctx, x + 4, fy + 5, 1, 1, '#fff'); R(ctx, x + 5, fy + 6, 2, 1, '#fff'); }
}

/* ---------- Интоорын мод (төгсгөл) + шуудангийн хайрцаг ---------- */
export function drawTree(ctx, x, t, reached) {
  const y = GROUND;
  R(ctx, x + 26, y - 50, 8, 50, C.woodDark); R(ctx, x + 27, y - 50, 2, 50, C.wood);
  R(ctx, x + 14, y - 46, 14, 3, C.woodDark); R(ctx, x + 32, y - 58, 16, 3, C.woodDark);
  const blobs = [[30, -70, 26], [10, -58, 18], [52, -60, 20], [20, -84, 16], [44, -84, 17], [32, -96, 12]];
  blobs.forEach(([dx, dy, r], i) => {
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x + dx, y + dy, r + 1, 0, 7); ctx.fill();
  });
  blobs.forEach(([dx, dy, r], i) => {
    ctx.fillStyle = i % 2 ? C.sakura : '#f7d6dc'; ctx.beginPath(); ctx.arc(x + dx, y + dy, r, 0, 7); ctx.fill();
  });
  for (let i = 0; i < 26; i++) {
    const a = hash(i) * 6.28, d = hash(i + 7) * 30;
    R(ctx, x + 30 + Math.cos(a) * d, y - 72 + Math.sin(a) * d * 0.7, 2, 2, i % 3 ? C.sakuraDeep : C.cherry);
  }
  // шуудангийн хайрцаг
  R(ctx, x + 72, y - 20, 2, 20, C.woodDark);
  box(ctx, x + 64, y - 34, 18, 14, C.white, C.ink);
  R(ctx, x + 66, y - 28, 14, 1, C.brownLight);
  const flag = reached ? -10 : -4;
  R(ctx, x + 82, y - 34 + flag + 4, 2, 10, C.ink); R(ctx, x + 84, y - 34 + flag + 4, 6, 4, C.cherry);
  if (reached) for (let i = 0; i < 8; i++) {
    const a = t * 2 + i * 0.8;
    R(ctx, x + 30 + Math.cos(a) * 44, y - 70 + Math.sin(a) * 22, 2, 2, i % 2 ? C.cherry : '#ffd36e');
  }
}

/* ---------- ХУЛАН (тоглогч) — улаан берет, цагаан ороолттой ---------- */
const K = { body: '#c99a5c', shade: '#b0834a', light: '#f3e6cf', dark: '#3b2a1a', muzzle: '#eadcc4', eye: '#120d0a' };
const LEGS = {
  idle: [[6, 0], [9, 0], [16, 0], [19, 0]],
  run0: [[4, -2], [9, 1], [15, 2], [20, -2]],
  run1: [[6, -1], [8, 1], [17, 1], [19, -1]],
  run2: [[8, 2], [6, -2], [19, -2], [16, 2]],
  run3: [[7, 1], [7, -1], [18, -1], [17, 1]],
};
export function drawKhulan(ctx, x, y, facing, state, frame, turbo, t) {
  ctx.save();
  ctx.translate(Math.round(x) + (facing < 0 ? 26 : 0), Math.round(y));
  if (facing < 0) ctx.scale(-1, 1);
  if (turbo) { const cs = ['#b3122e', '#e48a9c', '#f4c7cf', '#fffdf8']; cs.forEach((c, i) => R(ctx, -14 - ((t * 60) % 4), 8 + i * 1.5, 14, 1, c)); }

  const legs = state === 'jump' ? [[6, -3], [9, -3], [16, -3], [19, -3]] : state === 'run' ? LEGS['run' + frame] : LEGS.idle;
  legs.forEach(([lx, dx], i) => {
    const shade = i % 2 ? K.body : K.shade, len = state === 'jump' ? 3 : 4;
    R(ctx, lx, 14, 2, 3, shade);
    R(ctx, lx + Math.sign(dx), 17, 2, len - 1, shade);
    R(ctx, lx + Math.sign(dx), 16 + len, 2, 1, K.dark);
  });
  const tw = state === 'run' ? frame % 2 : 0;
  R(ctx, 3, 8, 2, 1, K.body); R(ctx, 2, 9 + tw, 1, 3, K.body); R(ctx, 1, 11 + tw, 2, 3, K.dark);
  R(ctx, 5, 7, 15, 7, K.body); R(ctx, 4, 8, 1, 5, K.body);
  R(ctx, 7, 12, 11, 2, K.light);
  R(ctx, 6, 7, 12, 1, K.dark);
  R(ctx, 16, 3, 5, 6, K.body); R(ctx, 18, 2, 6, 5, K.body);
  R(ctx, 23, 4, 3, 4, K.muzzle); R(ctx, 25, 6, 1, 1, K.dark);
  R(ctx, 16, 3, 1, 4, K.dark);
  R(ctx, 21, 3, 1, 1, K.eye); R(ctx, 21, 2, 1, 1, '#fff');
  R(ctx, 22, 5, 1, 1, '#f2a7b5'); // ичимхий хацар ✿
  // цагаан ороолт (салхинд намирна)
  R(ctx, 16, 8, 6, 2, '#fffdf8');
  const sf = state === 'run' ? Math.round(Math.sin(t * 20)) : 0;
  R(ctx, 13, 8 + sf, 3, 1, '#fffdf8'); R(ctx, 11, 9 + sf, 3, 1, '#fffdf8');
  // cherry берет
  R(ctx, 17, 0, 7, 2, C.cherry); R(ctx, 16, 1, 9, 1, C.cherryDark); R(ctx, 20, -1, 1, 1, C.cherryDark);
  ctx.restore();
}

/* ---------- Бөөм, интоорын дэлбээ ---------- */
export function drawParticles(ctx, parts, camX) {
  for (const q of parts) {
    ctx.globalAlpha = Math.max(0, q.life);
    R(ctx, q.x - camX, q.y, q.s, q.s, q.c);
  }
  ctx.globalAlpha = 1;
}
export function drawPetals(ctx, petals, w) {
  for (const q of petals) {
    const x = ((q.x % (w + 20)) + w + 20) % (w + 20) - 10;
    R(ctx, x, q.y, 2, 1, q.c); R(ctx, x + (q.f > 0 ? 1 : 0), q.y + 1, 1, 1, q.c);
  }
}
