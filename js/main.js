// ===================================================================
//  main.js — сайтыг угсарч, харилцан үйлдлүүдийг холбоно.
//  Хэсэг бүр тусдаа функц: hero, passport, departures, checkin, extras.
// ===================================================================

import { profile, skills, works, announcements } from './data.js';
import { FlapText, createBoard } from './splitflap.js';
import { sound } from './sound.js';

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const h = (tag, attrs = {}, html = '') => {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  el.innerHTML = html;
  return el;
};
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/* ---------- Цаг (Улаанбаатар) ---------- */
const ubTime = (opts) => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ulaanbaatar', ...opts }).format(new Date());
function tickClock() {
  const t = ubTime({ hour: '2-digit', minute: '2-digit' });
  $('#clock').textContent = t;
  $('#depClock').textContent = t;
}

/* ---------- Горим (өдөр/шөнө) — localStorage-д хадгална ---------- */
function initTheme() {
  const root = document.documentElement;
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch {}
  const start = saved || (matchMedia('(prefers-color-scheme: light)').matches ? 'day' : 'night');
  root.dataset.theme = start;

  $('#themeBtn').addEventListener('click', () => {
    const next = root.dataset.theme === 'night' ? 'day' : 'night';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch {}
    announce(next === 'day' ? 'Өдрийн нислэг рүү шилжлээ. Нарны шил зүүгээрэй 😎' : 'Шөнийн нислэг. Салоны гэрлийг бүдэгрүүлж байна.');
  });
}

/* ---------- Дуу ---------- */
function initSound() {
  const btn = $('#soundBtn');
  btn.addEventListener('click', () => {
    const on = sound.toggle();
    btn.setAttribute('aria-pressed', on);
    announce(on ? 'Дуу асаалаа. Самбарын шаржигнах дууг сонсоорой.' : 'Дуу унтраалаа.');
  });
}

/* ---------- Зарлал (PA) ---------- */
let paTimer;
function announce(text) {
  const pa = $('#pa');
  $('#paText').textContent = text;
  pa.classList.add('show');
  sound.chime();
  clearTimeout(paTimer);
  paTimer = setTimeout(() => pa.classList.remove('show'), 4200);
}

/* ---------- A · Hero самбар ---------- */
async function initHero() {
  $('#heroTitle').textContent = `${profile.name} — ${profile.role}`;
  // tagline: эхний хэсгийг онцолно
  $('#tagline').innerHTML = esc(profile.tagline).replace('ашиглахад таатай вэб бүтээгдэхүүнийг', '<em>$&</em>');

  const isNarrow = innerWidth < 520;
  const cols = isNarrow ? 10 : 14;
  const rows = createBoard($('#heroBoard'), cols, 3);
  // богино текстийн өмнө 1 зай авч самбарын ирмэгээс холдуулна
  const pad = (s) => (s.length < cols ? ' ' + s : s);

  await rows[0].set(pad(profile.name.toUpperCase()));
  await rows[1].set(pad('FULL-STACK'));
  await rows[2].set(pad('ХӨГЖҮҮЛЭГЧ'));
  $('#heroPlane').classList.add('takeoff');

  // 3-р мөр мэндчилгээг ээлжлэн солино
  const seq = isNarrow
    ? ['САЙН УУ', 'ХӨГЖҮҮЛЭГЧ', 'WELCOME', 'ХӨГЖҮҮЛЭГЧ', 'HIRE ME', 'ХӨГЖҮҮЛЭГЧ']
    : ['САЙН БАЙНА УУ', 'ХӨГЖҮҮЛЭГЧ', 'WELCOME ABOARD', 'ХӨГЖҮҮЛЭГЧ', 'ДАДЛАГАД БЭЛЭН', 'ХӨГЖҮҮЛЭГЧ'];
  let i = 0;
  setInterval(() => {
    if (document.hidden) return;
    rows[2].set(pad(seq[i++ % seq.length]));
  }, 4200);
}

/* ---------- B · Паспорт ---------- */
function initPassport() {
  const fields = [
    ['Овог нэр / Name', `${profile.name} · ${profile.nameLatin}`, true],
    ['Чиглэл / Role', profile.role],
    ['Сургууль / School', profile.school],
    ['Хэл / Languages', profile.languages],
    ['Суурин / Base', profile.base],
  ];
  $('#fields').append(
    ...fields.map(([k, v, big]) => h('div', big ? { class: 'big' } : {}, `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`)),
  );
  $('#bio').innerHTML = profile.bio.map((p) => `<p>${esc(p)}</p>`).join('');

  // Machine-readable zone — паспортын доод талын код
  const latin = profile.nameLatin.replace(/\s+/g, '<');
  const line1 = `P<MNG${latin}<<FULL<STACK<DEVELOPER`.padEnd(44, '<').slice(0, 44);
  const line2 = `KH${new Date().getFullYear()}<UFE<ISM<REACT<SUPABASE<OPEN<TO<WORK`.padEnd(44, '<').slice(0, 44);
  $('#mrz').innerHTML = `${line1}<br>${line2}`;

  // Тамгууд
  const note = $('#stampNote');
  const list = $('#stamps');
  skills.forEach((s, i) => {
    const rot = ((i * 37) % 22) - 11; // тогтвортой «санамсаргүй» эргэлт
    const li = h('li');
    const btn = h(
      'button',
      { class: `stamp ${s.shape}`, style: `--rot:${rot}deg`, type: 'button', 'aria-label': `${s.name}: ${s.note}` },
      `<span><small>ОРСОН ${s.year}</small>${esc(s.name)}<small>★ APPROVED ★</small></span>`,
    );
    btn.addEventListener('click', () => {
      $$('.stamp.active').forEach((b) => b !== btn && b.classList.remove('active'));
      btn.classList.toggle('active');
      note.innerHTML = btn.classList.contains('active')
        ? `<b>${esc(s.name)}</b> — ${esc(s.note)}`
        : 'Тамга дээр дарж тухайн технологиор юу хийснийг үзээрэй.';
      sound.stamp();
    });
    li.append(btn);
    list.append(li);
  });

  // Дэлгэцэнд орж ирэхэд паспорт нээгдэж, тамга нэг нэгээр дарагдана
  const passport = $('#passport');
  const io = new IntersectionObserver(
    ([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      passport.classList.add('open');
      $$('.stamp', passport).forEach((st, i) =>
        setTimeout(() => { st.classList.add('in'); sound.stamp(); }, 700 + i * 170),
      );
    },
    { threshold: 0.25 },
  );
  io.observe(passport);
}

/* ---------- C · Нислэгийн самбар ---------- */
function barcode(el, seed, bars = 38) {
  let x = seed;
  el.innerHTML = '';
  for (let i = 0; i < bars; i++) {
    x = (x * 9301 + 49297) % 233280; // жижиг псевдо-санамсаргүй генератор
    const w = 1 + (x % 4);
    const bar = document.createElement('i');
    bar.style[el.closest('.t-stub') ? 'height' : 'width'] = w + 'px';
    if (el.closest('.t-stub')) bar.style.width = '100%';
    el.append(bar);
  }
}
const seedOf = (s) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0);

function initDepartures() {
  const list = $('#depRows');
  const flaps = [];

  works.forEach((w, idx) => {
    const li = h('li');
    const row = h('button', { class: 'dep-row', type: 'button', 'aria-label': `${w.title} — дэлгэрэнгүй` });
    row.innerHTML = `
      <span class="when">${esc(w.date)}</span>
      <span class="c-flight mini"></span>
      <span class="c-dest mini"></span>
      <span class="c-gate mini"></span>
      <span class="status"><span class="lamp"></span><span class="c-status mini"></span><span class="dep-go">ТАСАЛБАР →</span></span>`;
    row.addEventListener('click', () => openPass(w, idx));
    li.append(row);
    list.append(li);
    flaps.push([
      [new FlapText($('.c-flight', row), 5, { highlight: true }), w.flight],
      [new FlapText($('.c-dest', row), 9), w.dest],
      [new FlapText($('.c-gate', row), 2, { highlight: true }), w.gate],
      [new FlapText($('.c-status', row), 6), w.status],
    ]);
  });

  // 4 дэх «нислэг» — ирээдүйн төсөл: дарахад холбоо барих хэсэг рүү аваачна
  const li = h('li');
  const soon = h('button', { class: 'dep-row soon', type: 'button', 'aria-label': 'Дараагийн төсөл — холбоо барих' });
  soon.innerHTML = `
      <span class="when">ТУН УДАХГҮЙ</span>
      <span class="c-flight mini"></span>
      <span class="c-dest mini"></span>
      <span class="c-gate mini"></span>
      <span class="status"><span class="lamp"></span><span class="c-status mini"></span><span class="dep-go">CHECK-IN →</span></span>`;
  soon.addEventListener('click', () => {
    $('#contact').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => $('#fName').focus({ preventScroll: true }), 700);
  });
  li.append(soon);
  list.append(li);
  flaps.push([
    [new FlapText($('.c-flight', soon), 5, { highlight: true }), 'KH404'],
    [new FlapText($('.c-dest', soon), 9), 'ТАНЫ БАГ?'],
    [new FlapText($('.c-gate', soon), 2, { highlight: true }), 'D1'],
    [new FlapText($('.c-status', soon), 6), 'ХҮЛЭЭЖ'],
  ]);

  list.after(h('p', { class: 'dep-foot' }, `<b>${works.length}</b> нислэг хөөрсөн · KH404 таны багийг хүлээж байна · мөр дээр дарна уу`));

  // Самбар харагдахад мөр бүр ээлжлэн эргэнэ
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    flaps.forEach((row, r) => setTimeout(() => row.forEach(([f, txt]) => f.set(txt)), r * 450));
  }, { threshold: 0.3 });
  io.observe($('.departures'));
}

/* Суух тасалбар — <dialog> */
function openPass(w, idx) {
  const seat = `${12 + idx * 7}${'ACF'[idx % 3]}`;
  const live = w.live.startsWith('http') ? w.live : new URL(w.live, location.href).href;
  $('#passBody').innerHTML = `
    <div class="pass-main">
      <div class="pass-air"><span><img src="assets/logo.svg" alt="" width="20" height="20"> TERMINAL K</span><span>СУУХ ТАСАЛБАР · BOARDING PASS</span></div>
      <figure class="pass-shot" style="margin:0"><img src="${esc(w.image)}" alt="${esc(w.title)} — дэлгэцийн зураг"></figure>
      <h3 id="passTitle">${esc(w.title)}</h3>
      <p>${esc(w.summary)}</p>
      <ul class="hi">${w.highlights.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      <ul class="chips">${w.stack.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      <div class="pass-links">
        <a class="btn btn-sign" href="${esc(live)}" target="_blank" rel="noopener">Live demo ↗</a>
        ${w.repo
          ? `<a class="btn btn-ghost" href="${esc(w.repo)}" target="_blank" rel="noopener">GitHub ↗</a>`
          : `<span class="muted">🔒 ${esc(w.repoNote || 'Репо хаалттай')}</span>`}
      </div>
    </div>
    <aside class="pass-stub">
      <div><small>НИСЛЭГ</small><b>${esc(w.flight)}</b></div>
      <div><small>ХААЛГА</small><b>${esc(w.gate)}</b></div>
      <div><small>СУУДАЛ</small><b>${seat}</b></div>
      <div class="barcode"></div>
    </aside>`;
  barcode($('#passBody .barcode'), seedOf(w.flight), 44);
  const dlg = $('#passDialog');
  dlg.showModal();
  sound.chime();
}

function initDialog() {
  const dlg = $('#passDialog');
  $('#passClose').addEventListener('click', () => dlg.close());
  // гадна талд (backdrop) дарахад хаагдана
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
}

/* ---------- D · Check-in ---------- */
function initCheckin() {
  const form = $('#checkinForm');
  const ticket = $('#ticket');
  barcode($('#barcode'), 42, 30);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#fName').value.trim();
    const msg = $('#fMsg').value.trim();
    const purpose = $('#fPurpose').value;
    const err = $('#formErr');

    if (name.length < 2) { err.textContent = 'Зорчигчийн нэрээ бичнэ үү.'; $('#fName').focus(); return; }
    if (msg.length < 5) { err.textContent = 'Мессеж хэт богино байна.'; $('#fMsg').focus(); return; }
    err.textContent = '';

    $('#tName').textContent = name;
    $('#tFrom').textContent = name.slice(0, 3).toUpperCase();
    $('#tPurpose').textContent = purpose;
    $('#tDate').textContent = ubTime({ day: '2-digit', month: '2-digit', year: 'numeric' });
    $('#tSeat').textContent = `${1 + (seedOf(name) % 30)}${'ABCDEF'[seedOf(msg) % 6]}`;
    barcode($('#barcode'), seedOf(name + msg), 30);

    const subject = `[Портфолио] ${purpose} — ${name}`;
    $('#tSend').href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg + '\n\n— ' + name)}`;

    // хэвлэгчийн анимэйшн — дахин эхлүүлэхийн тулд классыг арилгаад reflow хийнэ
    ticket.classList.remove('printing', 'printed');
    void ticket.offsetWidth;
    ticket.classList.add('printing');
    sound.printer();
    $('.printer').classList.add('has-ticket');
    ticket.addEventListener('animationend', () => { ticket.classList.add('printed'); $('#tSend').focus({ preventScroll: true }); }, { once: true });
    announce(`${name}, таны тасалбар хэвлэгдлээ. «Имэйлээр илгээх» товчийг дарна уу.`);
  });

  // Сошиал «хаалганууд»
  const gates = $('#gates');
  const emailGate = h('li');
  const eb = h('button', { class: 'gate', type: 'button', title: 'Имэйл хуулах' },
    `<b>D1</b><span><small>Имэйл · дарж хуулна</small><em>${esc(profile.email)}</em></span><span class="arrow">⧉</span>`);
  eb.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(profile.email); announce('Имэйл хаяг хуулагдлаа ✓'); }
    catch { location.href = `mailto:${profile.email}`; }
  });
  emailGate.append(eb);
  gates.append(emailGate);

  profile.socials.filter((s) => s.url).forEach((s, i) => {
    gates.append(h('li', {},
      `<a class="gate" href="${esc(s.url)}" target="_blank" rel="noopener"><b>D${i + 2}</b><span><small>${esc(s.label)}</small><em>${esc(s.handle)}</em></span><span class="arrow">→</span></a>`));
  });
}

/* ---------- Навигаци: идэвхтэй хаалга + хэсэг тус бүрийн зарлал ---------- */
function initNav() {
  const links = $$('.signs a');
  const said = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
      const gate = e.target.dataset.gate;
      if (!said.has(gate) && gate !== 'hero') { said.add(gate); announce(announcements[gate]); }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main > section').forEach((s) => io.observe(s));

  // гарч ирэх анимэйшн
  const rv = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add('in')), { threshold: 0.12 });
  $$('.sec-head, .departures, .desk, .printer, .gates').forEach((el) => { el.classList.add('reveal'); rv.observe(el); });
}

/* ---------- Easter eggs ---------- */
function initEasterEggs() {
  // 1) Konami код → онгоц баннер чирч нисэнэ
  const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let pos = 0;
  addEventListener('keydown', (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    pos = k === code[pos] ? pos + 1 : k === code[0] ? 1 : 0;
    if (pos === code.length) { pos = 0; flyover(); }
  });

  // 2) Логог 5 удаа дарвал «турбулент»
  let clicks = 0, t;
  $('#logo').addEventListener('click', () => {
    clicks++;
    clearTimeout(t);
    t = setTimeout(() => (clicks = 0), 1200);
    if (clicks === 5) {
      clicks = 0;
      document.body.classList.add('turbulence');
      announce('Турбулент! Суудлын бүсээ бүслээрэй. (Нууц #2 олдлоо 🎉)');
      setTimeout(() => document.body.classList.remove('turbulence'), 1500);
    }
  });

  // 3) Developer console-д мэндчилгээ
  console.log('%c✈ TERMINAL K ', 'background:#ffcf24;color:#111;font:800 16px monospace;padding:6px 10px;border-radius:4px');
  console.log('Кодыг сонирхож байгаад баярлалаа! Нууц: Konami код (↑↑↓↓←→←→BA) болон лого дээр 5 дарах.');
}
function flyover() {
  const f = $('#flyover');
  f.classList.remove('go');
  void f.offsetWidth;
  f.classList.add('go');
  sound.whoosh();
  announce('Нууц #1 олдлоо! Онгоц таны дэлгэцээр нисэж өнгөрлөө ✈');
}

/* ---------- Эхлүүлэх ---------- */
$('#year').textContent = new Date().getFullYear();
initTheme();
initSound();
tickClock();
setInterval(tickClock, 15000);
initPassport();
initDepartures();
initDialog();
initCheckin();
initNav();
initEasterEggs();
initHero();
setTimeout(() => announce(announcements.hero), 1400);
