// ===================================================================
//  game.js — тоглоомын хөдөлгүүр: game loop, физик, мөргөлдөөн, камер.
//  UI-тай шууд холбогдохгүй — юу болсныг hooks (callback)-аар мэдэгдэнэ.
// ===================================================================

import {
  VIEW_H, GROUND, WORLD_W, grounds, platforms, rocks, coins, secretCoin,
  signs, hobbyObjs, frames, tree, net, volleyBall, sections, checkpoints, decor,
} from './world.js';
import * as art from './art.js';
import { input } from './input.js';
import { sfx } from './audio.js';

const STEP = 1 / 60;           // физикийг тогтмол 60 FPS-ээр тооцно
const GRAVITY = 0.28;
const JUMP_V = -5.7;
const SPEED = 2.1;
const TURBO_SPEED = 3.4;

export class Game {
  constructor(canvas, hooks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.buf = document.createElement('canvas'); // жижиг нягтралтай «дотоод» дэлгэц
    this.bctx = this.buf.getContext('2d');
    this.hooks = hooks;
    this.theme = 'day';
    this.turbo = false;
    this.paused = true;
    this.t = 0; this.acc = 0; this.last = 0;
    this.parts = [];
    this.petals = Array.from({ length: 26 }, (_, i) => ({
      x: Math.random() * 600, y: Math.random() * VIEW_H - 60, v: 0.25 + Math.random() * 0.35,
      f: Math.random() > 0.5 ? 1 : -1, ph: Math.random() * 6, c: i % 4 ? art.C.sakuraDeep : art.C.cherry,
    }));
    this.imgs = frames.map((f) => { const im = new Image(); im.src = f.image; return im; });
    this.reset();
    this.resize();
    addEventListener('resize', () => this.resize());
    requestAnimationFrame((ts) => this.loop(ts));
  }

  reset() {
    this.p = { x: 60, y: GROUND - 18, w: 18, h: 18, vx: 0, vy: 0, onGround: true, facing: 1, coyote: 0, buffer: 0, frame: 0, ft: 0 };
    this.cam = 0;
    this.stats = { coins: 0, secret: false, seen: new Set(), start: 0, end: 0, volleyBest: 0 };
    coins.forEach((c) => (c.taken = false));
    secretCoin.taken = false;
    frames.forEach((f) => (f.visited = false));
    let rec = 0; try { rec = +localStorage.getItem('volley-best') || 0; } catch {}
    Object.assign(volleyBall, { x: 2140, y: GROUND - 7, vx: 0, vy: 0, hits: 0, rot: 0, best: rec, newRec: false });
    this.finished = false;
    this.cur = { sign: null, obj: null, section: null };
  }

  /* ---------- Дэлгэцийн хэмжээ ---------- */
  resize() {
    const r = this.canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(r.width * dpr);
    this.canvas.height = Math.round(r.height * dpr);
    // логик 240 өндөр багтах, гэхдээ өргөн нь 260–520 логик пиксел байх
    let scale = Math.min(this.canvas.height / VIEW_H, this.canvas.width / 260);
    scale = Math.max(scale, this.canvas.width / 520);
    // Босоо утсан дээр: илүү ойроос харуулж, газрыг товчлууруудын ДЭЭР байрлуулна
    const portrait = r.height > r.width * 1.15;
    const padPx = matchMedia('(pointer: coarse)').matches ? 150 : 0;
    if (portrait) scale = this.canvas.width / 196;
    this.scale = scale;
    this.cssScale = scale / dpr;
    this.viewW = Math.ceil(this.canvas.width / scale);
    this.viewH = Math.ceil(this.canvas.height / scale);
    this.top = portrait
      ? Math.round(GROUND - (this.canvas.height - padPx * dpr) / scale + 12)
      : VIEW_H - this.viewH; // сөрөг бол дээр нэмэлт хоосон цаас харагдана
    this.buf.width = this.viewW;
    this.buf.height = this.viewH;
  }

  /* ---------- Үндсэн давталт ---------- */
  loop(ts) {
    const dt = Math.min((ts - this.last) / 1000 || 0, 0.1);
    this.last = ts;
    this.t += dt;
    if (!this.paused) {
      this.acc += dt;
      while (this.acc >= STEP) { this.update(); this.acc -= STEP; }
    }
    this.updatePetals();
    this.render();
    requestAnimationFrame((n) => this.loop(n));
  }

  start() {
    this.paused = false;
    if (!this.stats.start) this.stats.start = performance.now();
    input.reset();
  }

  warp(i) {
    const s = sections[i];
    Object.assign(this.p, { x: s.spawn, y: GROUND - 18, vx: 0, vy: 0 });
    this.cam = Math.max(0, Math.min(WORLD_W - this.viewW, s.spawn - this.viewW * 0.4));
    this.dust(this.p.x + 9, GROUND, 14, art.C.sakuraDeep);
  }

  /* ---------- Тоглогчийн физик ---------- */
  update() {
    const p = this.p;
    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const max = this.turbo ? TURBO_SPEED : SPEED;
    p.vx += (dir * max - p.vx) * (p.onGround ? 0.25 : 0.12);
    if (Math.abs(p.vx) < 0.05) p.vx = 0;
    if (dir) p.facing = dir;

    // coyote time (ирмэгээс унасны дараа хэдэн frame) + jump buffer — тоглоход «зөөлөн» мэдрэмж өгнө
    p.coyote = p.onGround ? 6 : p.coyote - 1;
    p.buffer = input.take('jump') ? 7 : p.buffer - 1;
    if (p.buffer > 0 && p.coyote > 0) {
      p.vy = JUMP_V; p.coyote = 0; p.buffer = 0; p.onGround = false;
      sfx.jump();
      this.dust(p.x + 9, p.y + p.h, 5, art.C.brownLight);
    }
    p.vy += GRAVITY;
    if (!input.jumpHeld && p.vy < -2) p.vy += 0.35; // богино дарвал намхан үсэрнэ
    p.vy = Math.min(p.vy, 7);

    // X тэнхлэг + будгийн сав
    p.x += p.vx;
    p.x = Math.max(0, Math.min(WORLD_W - p.w, p.x));
    for (const r of rocks) {
      const top = GROUND - r.h;
      if (p.y + p.h > top + 1 && p.x + p.w > r.x && p.x < r.x + r.w) {
        if (p.vx > 0) p.x = r.x - p.w; else if (p.vx < 0) p.x = r.x + r.w;
        if (Math.abs(p.vx) > 1.2) sfx.bump();
        p.vx = 0;
      }
    }

    // Y тэнхлэг: газар, ном, сав дээр буух
    const prevBottom = p.y + p.h;
    p.y += p.vy;
    const bottom = p.y + p.h;
    const wasGround = p.onGround;
    p.onGround = false;
    if (p.vy >= 0) {
      const tops = [];
      if (grounds.some(([a, b]) => p.x + p.w - 3 > a && p.x + 3 < b)) tops.push(GROUND);
      platforms.forEach((pl) => { if (p.x + p.w - 2 > pl.x && p.x + 2 < pl.x + pl.w) tops.push(pl.y); });
      rocks.forEach((r) => { if (p.x + p.w > r.x && p.x < r.x + r.w) tops.push(GROUND - r.h); });
      for (const top of tops.sort((a, b) => a - b)) {
        if (prevBottom <= top + 0.5 && bottom >= top) {
          p.y = top - p.h; p.vy = 0; p.onGround = true;
          if (!wasGround) this.dust(p.x + 9, top, 6, art.C.brownLight);
          break;
        }
      }
    }

    if (p.y > VIEW_H + 40) {
      sfx.fall();
      const cp = checkpoints.filter((c) => c < p.x).pop() ?? 60;
      Object.assign(p, { x: cp, y: GROUND - 60, vx: 0, vy: 0 });
      this.hooks.onFall?.();
    }

    p.ft += Math.abs(p.vx);
    if (p.ft > 7) { p.ft = 0; p.frame = (p.frame + 1) % 4; }
    if (p.onGround && Math.abs(p.vx) > 1.5 && Math.random() < 0.15) this.dust(p.x + (p.facing > 0 ? 2 : 16), GROUND, 1, art.C.brownLight);

    this.updateVolley();
    this.interact();

    const target = Math.max(0, Math.min(WORLD_W - this.viewW, p.x - this.viewW * 0.4));
    this.cam += (target - this.cam) * 0.12;

    this.parts.forEach((q) => { q.x += q.vx; q.y += q.vy; q.vy += 0.08; q.life -= 0.03; });
    this.parts = this.parts.filter((q) => q.life > 0);
  }

  /* ---------- Волейболын бөмбөг: толгойгоороо тосох мини тоглоом ---------- */
  updateVolley() {
    const b = volleyBall, p = this.p;
    b.vy += 0.12;
    b.x += b.vx; b.y += b.vy;
    b.rot += b.vx * 0.15;
    // хана (бөмбөг хол өнхрөхгүй)
    if (b.x < 2070) { b.x = 2070; b.vx = Math.abs(b.vx) * 0.7; }
    if (b.x > 2310) { b.x = 2310; b.vx = -Math.abs(b.vx) * 0.7; }
    // тор
    if (b.y + b.r > net.top && Math.abs(b.x - net.x) < b.r + 1) {
      b.x = net.x + (b.vx > 0 ? -(b.r + 1) : b.r + 1); b.vx = -b.vx * 0.6; sfx.bump();
    }
    // газар
    if (b.y > GROUND - b.r) {
      b.y = GROUND - b.r;
      if (Math.abs(b.vy) > 0.8) sfx.bump();
      b.vy = -b.vy * 0.45; b.vx *= 0.9;
      if (Math.abs(b.vy) < 0.6) b.vy = 0;
      if (b.hits > 0) { this.hooks.onVolley?.(b.hits, true); b.hits = 0; b.newRec = false; }
    }
    // тоглогчтой мөргөлдөх: бөмбөг доошоо явж байхад нуруу/толгойд хүрвэл дээш ойно
    const px = p.x + p.w / 2;
    const overlapX = Math.abs(b.x - px) < p.w / 2 + b.r - 2;
    const overlapY = b.y + b.r > p.y - 2 && b.y - b.r < p.y + p.h;
    if (overlapX && overlapY && (b.vy > -0.5 || p.vy < 0) && b.y < p.y + 6) {
      b.vy = -4.4 + Math.min(0, p.vy) * 0.35;
      b.vx = (b.x - px) * 0.14 + p.vx * 0.45 + (b.x < net.x ? 0.6 : -0.6);
      b.y = p.y - b.r - 2;
      b.hits++;
      this.stats.volleyBest = Math.max(this.stats.volleyBest, b.hits);
      if (b.hits > b.best) {           // шинэ рекорд — хөтөчид хадгална
        b.best = b.hits;
        try { localStorage.setItem('volley-best', b.best); } catch {}
        if (!b.newRec && b.hits >= 2) { b.newRec = true; this.hooks.onVolleyRecord?.(b.hits); }
      }
      sfx.coin();
      this.dust(b.x, b.y + b.r, 6, '#fffdf8');
      this.hooks.onVolley?.(b.hits, false);
    } else if (overlapX && overlapY && b.vy === 0) {
      b.vx = (b.x - px) * 0.2; b.vy = -2.2; // хажуунаас түлхэх
    }
    const vo = hobbyObjs.find((o) => o.id === 'volley');
    vo.score = b.hits; vo.best = b.best;
  }

  /* ---------- Стикер, самбар, объект, мод ---------- */
  interact() {
    const p = this.p;
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;

    for (const c of [...coins, secretCoin]) {
      if (c.taken) continue;
      if (Math.abs(c.x - cx) < 13 && Math.abs(c.y - cy) < 14) {
        c.taken = true;
        if (c.secret) { this.stats.secret = true; sfx.secret(); } else { this.stats.coins++; sfx.coin(); }
        this.dust(c.x, c.y, 14, c.color);
        this.hooks.onCoin?.(c, this.stats.coins);
      }
    }

    const sign = signs.find((s) => Math.abs(cx - (s.x + 11)) < 30) || null;
    if (sign !== this.cur.sign) { this.cur.sign = sign; this.hooks.onSign?.(sign); }

    const obj = [...hobbyObjs, ...frames].find((o) => cx > o.x + 6 && cx < o.x + o.w - 6) || null;
    this.cur.obj = obj;
    if (obj) {
      const sx = (obj.x + obj.w / 2 - this.cam) * this.cssScale;
      const sy = (GROUND - (obj.kind ? 74 : 86) - this.top) * this.cssScale;
      this.hooks.onNear?.(obj, sx, sy);
      if (input.take('action')) this.open(obj);
    } else {
      this.hooks.onNear?.(null);
      input.take('action');
    }

    const sec = [...sections].reverse().find((s) => cx >= s.from);
    if (sec !== this.cur.section) { this.cur.section = sec; this.hooks.onSection?.(sec, sections.indexOf(sec)); }

    if (!this.finished && cx > tree.x + 4) {
      this.finished = true;
      this.stats.end = performance.now();
      sfx.win();
      const cols = [art.C.cherry, art.C.sakura, '#ffd36e', art.C.sakuraDeep];
      for (let i = 0; i < 4; i++) setTimeout(() => this.dust(tree.x + 30, GROUND - 70, 18, cols[i]), i * 180);
      this.hooks.onFinish?.(this.stats);
    }
    this.hooks.onProgress?.(cx / WORLD_W);
  }

  open(obj) {
    if (!obj.kind) obj.visited = true;
    this.stats.seen.add(obj.id);
    sfx.door();
    this.hooks.onOpen?.(obj);
  }

  dust(x, y, n, c) {
    for (let i = 0; i < n; i++) {
      this.parts.push({ x, y, vx: (Math.random() - 0.5) * 2.4, vy: -Math.random() * 2, life: 0.7 + Math.random() * 0.4, s: 1 + (Math.random() * 2 | 0), c });
    }
  }

  updatePetals() {
    for (const q of this.petals) {
      q.ph += 0.03;
      q.y += q.v; q.x += Math.sin(q.ph) * 0.4 + 0.15;
      if (q.y > VIEW_H) { q.y = this.top - 5; q.x = Math.random() * this.viewW + this.cam * 0.3; }
    }
  }

  /* ---------- Зурах ---------- */
  render() {
    const b = this.bctx, w = this.viewW, cam = Math.round(this.cam), t = this.t;
    const pal = art.palettes[this.theme];
    b.imageSmoothingEnabled = false;
    b.save();
    b.translate(0, -this.top);

    art.drawPaper(b, w, this.viewH, this.top, pal, cam, t);
    art.drawParallax(b, cam, w, pal, t);

    b.save();
    b.translate(-cam, 0);
    const vis = (x, ww = 80) => x + ww > cam - 10 && x < cam + w + 10;
    decor.forEach((d) => vis(d.x, 20) && art.drawDecor(b, d.x, d.type, d.k, pal));
    hobbyObjs.forEach((o) => vis(o.x, 90) && art.drawHobby(b, o, t, this.cur.obj === o, pal));
    if (vis(net.x - 140, 300)) { art.drawVolleyWalls(b, 2063, 2317, pal); art.drawNet(b, net, pal); }
    frames.forEach((f, i) => vis(f.x, 90) && art.drawFrame(b, f, i, this.imgs[i], f.visited, this.cur.obj === f, t, pal));
    signs.forEach((s) => vis(s.x, 30) && art.drawSign(b, s.x, this.cur.sign === s, t, pal));
    if (vis(tree.x - 40, 160)) art.drawTree(b, tree.x, t, this.finished);
    b.restore();

    art.drawGround(b, cam, w, grounds, pal);

    b.save();
    b.translate(-cam, 0);
    platforms.forEach((pl) => vis(pl.x, pl.w) && art.drawPlatform(b, pl.x, pl.y, pl.w, pal, pl.hidden, t));
    rocks.forEach((r) => vis(r.x, r.w) && art.drawRock(b, r.x, r.w, r.h));
    coins.forEach((c) => !c.taken && vis(c.x, 10) && art.drawCoin(b, c.x, c.y, c.color, t));
    if (!secretCoin.taken && vis(secretCoin.x, 10)) art.drawCoin(b, secretCoin.x, secretCoin.y, '#fff7d6', t, true);
    if (vis(volleyBall.x - 10, 20)) art.drawVolleyBall(b, volleyBall, t);
    const p = this.p;
    const state = !p.onGround ? 'jump' : Math.abs(p.vx) > 0.3 ? 'run' : 'idle';
    art.drawKhulan(b, p.x - 4, p.y - 2 + (state === 'idle' ? Math.round(Math.sin(t * 3) * 0.5) : 0), p.facing, state, p.frame, this.turbo, t);
    b.restore();

    art.drawParticles(b, this.parts, cam);
    art.drawPetals(b, this.petals.map((q) => ({ ...q, x: q.x - cam * 0.3 })), w);
    b.restore();

    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(this.buf, 0, 0, this.viewW * this.scale, this.viewH * this.scale);
  }
}
