// ===================================================================
//  main.js — бүгдийг холбоно: горим солих (нүүр / тоглоом / унших),
//  тоглоомын hooks → UI, горим (өдөр/шөнө), дуу, нууц (easter egg).
// ===================================================================

import { profile, skills } from './data.js';
import { sections, frames } from './world.js';
import { Game } from './game.js';
import { bindTouch, input } from './input.js';
import { sfx } from './audio.js';
import { drawKhulan } from './art.js';
import { $, $$, toast, splitLetters, openPanel, closeDialog, initDialogs, renderLinks } from './ui.js';
import { initReading, initMagnetic } from './reading.js';
import { initPingPong, openPingPong } from './pingpong.js';

const body = document.body;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Горим (өдөр/шөнө) ---------- */
function initTheme(game) {
  const root = document.documentElement;
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch {}
  const apply = (t) => {
    root.dataset.theme = t;
    game.theme = t;
    $('meta[name="theme-color"]').content = t === 'night' ? '#1f1713' : '#fbf7f0';
  };
  apply(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day'));
  $$('[data-theme-toggle]').forEach((b) => b.addEventListener('click', () => {
    const next = root.dataset.theme === 'day' ? 'night' : 'day';
    apply(next);
    try { localStorage.setItem('theme', next); } catch {}
    toast(next === 'night' ? 'Шөнийн дэвтэр' : 'Өдрийн дэвтэр', next === 'night' ? 'Дэнлүүгээ асаалаа 🏮' : 'Нар гарлаа ☀', next === 'night' ? '☾' : '☀');
  }));
}

/* ---------- Горим солих: «бэх арчилт» transition ---------- */
let game;
function setMode(mode, ev) {
  if (body.dataset.mode === mode) return;
  const wipe = $('#wipe');
  const x = ev?.clientX ?? innerWidth / 2, y = ev?.clientY ?? innerHeight / 2;
  wipe.style.setProperty('--wx', x + 'px');
  wipe.style.setProperty('--wy', y + 'px');
  const swap = () => {
    body.dataset.mode = mode;
    game.paused = mode !== 'game';
    input.enabled = mode === 'game'; // унших горимд сумаар гүйлгэх боломжтой байлгана
    input.reset();
    if (mode === 'game') { game.start(); game.resize(); $('#screen').focus?.(); }
    if (mode === 'reading') { history.replaceState(null, '', '#reading'); $('#reading').focus({ preventScroll: true }); }
    else history.replaceState(null, '', location.pathname);
  };
  if (reduce) return swap();
  wipe.className = 'wipe in';
  setTimeout(() => { swap(); wipe.className = 'wipe out'; }, 430);
  setTimeout(() => (wipe.className = 'wipe'), 1000);
}

/* ---------- Яриан бөмбөлөг: бичгийн машин мэт гарна ---------- */
let typeTimer;
function showBubble(sign) {
  const b = $('#bubble');
  clearInterval(typeTimer);
  if (!sign) { b.classList.remove('show'); return; }
  $('#bubbleTitle').textContent = sign.title;
  const p = $('#bubbleText');
  b.classList.add('show');
  if (reduce) { p.textContent = sign.text; return; }
  let i = 0;
  p.textContent = '';
  typeTimer = setInterval(() => {
    i += 2;
    p.innerHTML = '';
    p.append(sign.text.slice(0, i));
    if (i < sign.text.length) p.insertAdjacentHTML('beforeend', '<span class="caret"></span>');
    else clearInterval(typeTimer);
  }, 18);
}

const volleyBest = () => { try { return +localStorage.getItem('volley-best') || 0; } catch { return 0; } };

/* ---------- Тоглоомын hooks → UI ---------- */
function gameHooks() {
  const prompt = $('#prompt');
  let nearObj = null;
  return {
    onSign: showBubble,
    onNear(obj, sx, sy) {
      if (!obj) { prompt.classList.remove('show'); nearObj = null; return; }
      if (obj !== nearObj) { $('#promptLabel').textContent = obj.play ? obj.play.label : obj.kind ? obj.title : 'Бүтээл үзэх'; nearObj = obj; }
      prompt.style.left = sx + 'px';
      prompt.style.top = Math.max(70, sy) + 'px';
      prompt.classList.add('show');
    },
    onOpen(obj) {
      game.paused = true;
      input.reset();
      const resume = () => { if (body.dataset.mode === 'game') { game.paused = false; input.reset(); } };
      if (obj.play) openPingPong(resume);      // ширээний теннис — шууд тоглоом нээгдэнэ
      else openPanel(obj, resume);
    },
    onCoin(c, n) {
      const s = $('#stickers');
      $('#coinCount').textContent = n;
      s.classList.remove('bump'); void s.offsetWidth; s.classList.add('bump');
      if (c.secret) toast('Нууц стикер олдлоо! 🎉', profile.nameFact.slice(0, 60) + '…', '★', '#3b2a20');
      else toast(`+ ${c.name}`, c.note, '✦', c.color);
      if (n === skills.length) setTimeout(() => toast('Бүх ур чадвар цугларлаа!', '9/9 стикер ✿', '♛', '#b3122e'), 700);
    },
    onSection(sec, i) {
      const ch = $('#chapter');
      $('#chapNo').textContent = sec.id;
      $('#chapName').textContent = sec.label;
      ch.classList.remove('flip'); void ch.offsetWidth; ch.classList.add('flip');
      $$('#map button').forEach((b, k) => b.classList.toggle('on', k <= i));
    },
    onProgress(f) { $('#progress').style.width = (f * 100).toFixed(1) + '%'; },
    onVolley(n, ended) {
      if (!ended && n >= 2) toast(`Волей ×${n}!`, n >= 5 ? 'Жинхэнэ тамирчин 🏐' : 'Бөмбөгийг унагаалгүй тос!', '🏐', '#2f5fb3');
      if (ended && n >= 3) toast(`Сайн байна! ${n} удаа тоссон`, `Рекорд: ${volleyBest()}`, '🏐', '#2f5fb3');
    },
    onVolleyRecord(n) { toast(`Шинэ рекорд: ${n} тосолт! 🏆`, 'Хөтөчид хадгалагдлаа', '★', '#b3122e'); },
    onFall() { toast('Ой! Цаасны нүх 🙈', 'Ойрын хуудаснаас дахин эхэллээ', '!', '#7a5238'); },
    onFinish(stats) { setTimeout(() => showFinish(stats), 900); },
  };
}

function showFinish(stats) {
  const sec = Math.round((stats.end - stats.start) / 1000);
  const items = [
    [`${stats.coins}/${skills.length}`, 'ур чадварын стикер'],
    [`${frames.filter((f) => f.visited).length}/${frames.length}`, 'бүтээл үзсэн'],
    [`${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`, 'хугацаа'],
    [`${stats.volleyBest || 0} / ${volleyBest()}`, 'волей: энэ удаа / рекорд'],
  ];
  if (stats.secret) items.push(['★', 'нууц стикер']);
  $('#finishStats').innerHTML = items.map(([b, s], i) => `<li style="--i:${i}"><b>${b}</b><small>${s}</small></li>`).join('');
  renderLinks($('#finishLinks'));
  game.paused = true;
  $('#finish').showModal();
}

/* ---------- Нүүрний жижиг баатар охин (гүйж буй sprite) ---------- */
function spriteLoop() {
  const cvs = [$('#heroSprite'), $('#readSprite')].map((c) => {
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    return x;
  });
  let f = 0, t = 0, last = 0;
  (function tick(now) {
    t = now / 1000;
    if (now - last > 90) { f = (f + 1) % 4; last = now; }
    cvs.forEach((x) => {
      x.setTransform(1, 0, 0, 1, 0, 0);
      x.clearRect(0, 0, 78, 60);
      x.scale(3, 3);
      drawKhulan(x, 0, Math.round(Math.abs(Math.sin(t * 6)) * -1), 1, 'run', f, false, t);
    });
    requestAnimationFrame(tick);
  })(0);
}

/* ---------- Нууцууд ---------- */
function initEasterEggs() {
  const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let pos = 0;
  addEventListener('keydown', (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    pos = k === code[pos] ? pos + 1 : k === code[0] ? 1 : 0;
    if (pos === code.length) {
      pos = 0;
      game.turbo = !game.turbo;
      const f = $('#flyover');
      f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
      sfx.secret();
      toast(game.turbo ? 'ТУРБО ГОРИМ!' : 'Турбо унтарлаа', game.turbo ? 'Сакура сүүлтэй хурдан зураач охин 🌸' : '', '⚡', '#b3122e');
    }
  });
  console.log('%c✎ Sketchbook Quest ', 'background:#b3122e;color:#fff;font:800 15px sans-serif;padding:6px 10px;border-radius:6px');
  console.log('Кодыг сонирхсонд баярлалаа! Нууц: Konami код, номон тавцангийн дээрх үл харагдах ном.');
}

/* ---------- Эхлүүлэх ---------- */
function init() {
  game = new Game($('#screen'), gameHooks());
  window.game = game; // DevTools-оос шалгахад хэрэгтэй
  initTheme(game);
  initDialogs();
  initPingPong();
  // «Тоглох» товч (хобби самбар, унших горимын карт) → ширээний теннис
  document.addEventListener('click', (e) => {
    const b = e.target.closest?.('[data-play]');
    if (!b) return;
    const wasPanel = $('#panel').open;
    if (wasPanel) closeDialog($('#panel'));
    setTimeout(() => {
      if (body.dataset.mode === 'game') game.paused = true;
      openPingPong(() => { if (body.dataset.mode === 'game') { game.paused = false; input.reset(); } });
    }, wasPanel ? 260 : 0);
  });
  splitLetters();
  $('#coverTag').textContent = profile.tagline;
  $$('.year').forEach((y) => (y.textContent = new Date().getFullYear()));
  bindTouch($('#pad'));
  initReading();
  initMagnetic();
  initEasterEggs();
  spriteLoop();

  // Бүлгийн цэгүүд (HUD дээрх газрын зураг)
  const map = $('#map');
  sections.forEach((s, i) => {
    const b = document.createElement('button');
    b.textContent = s.id;
    b.dataset.label = s.label;
    b.style.left = (i / (sections.length - 1)) * 100 + '%';
    b.setAttribute('aria-label', `Бүлэг ${s.id}: ${s.label} руу шилжих`);
    b.addEventListener('click', () => { game.warp(i); b.blur(); });
    map.append(b);
  });

  $('#prompt').addEventListener('click', () => { if (game.cur.obj) game.open(game.cur.obj); });
  $('#playBtn').addEventListener('click', (e) => setMode('game', e));
  $$('[data-go]').forEach((b) => b.addEventListener('click', (e) => {
    e.preventDefault();
    closeDialog($('#finish'));
    setMode(b.dataset.go, e);
  }));
  $('#againBtn').addEventListener('click', () => { closeDialog($('#finish')); game.reset(); $('#coinCount').textContent = 0; game.start(); });
  $('#finish').addEventListener('close', () => { if (body.dataset.mode === 'game') game.paused = false; });

  const sb = $('#soundBtn');
  const toggleSound = () => { const on = sfx.toggle(); sb.setAttribute('aria-pressed', on); toast(on ? 'Дуу асаалаа ♪' : 'Дуу унтраалаа', on ? 'Пентатоник аялгуу тоглож байна' : '', '♪', '#7a5238'); };
  sb.addEventListener('click', toggleSound);

  addEventListener('keydown', (e) => {
    if (e.target.closest?.('input, textarea, select')) return;
    if (body.dataset.mode === 'start' && e.key === 'Enter') { e.preventDefault(); setMode('game'); }
    if (body.dataset.mode === 'game' && (e.key === 'm' || e.key === 'M')) toggleSound();
  });

  // Шууд унших горимоор нээх (жишээ нь бүтээлийн хуудаснаас «буцах» үед)
  if (location.hash.startsWith('#reading') || location.hash.startsWith('#r-')) {
    body.dataset.mode = 'reading';
    history.replaceState(null, '', '#reading');
  }
  input.enabled = false;
  addEventListener('hashchange', () => { if (location.hash === '#reading') setMode('reading'); });
}

init();
