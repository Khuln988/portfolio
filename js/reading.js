// ===================================================================
//  reading.js — «Унших горим»: энгийн гүйлгэдэг портфолио.
//  Scroll animation (IntersectionObserver), прогресс мөр, параллакс,
//  3D tilt карт, соронзон товч, шүүлтүүр, захидлын форм.
// ===================================================================

import { profile, skills, softSkills, hobbies, works } from './data.js';
import { $, $$, esc, toast, openPanel, renderLinks } from './ui.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initReading() {
  const root = $('#reading');

  /* ---- Hero ---- */
  $('#rTag').textContent = profile.tagline;
  const petals = $('.petals', root);
  for (let i = 0; i < 16; i++) {
    const p = document.createElement('i');
    p.style.cssText = `--x:${Math.random() * 100}%;--t:${9 + Math.random() * 9}s;--d:${-Math.random() * 15}s`;
    petals.append(p);
  }

  /* ---- Миний тухай ---- */
  $('#aboutText').innerHTML = profile.bio.map((p, i) => `<p class="reveal" style="--i:${i}">${esc(p)}</p>`).join('');
  $('#facts').innerHTML = profile.facts.map((f) => `<div><dt>${esc(f.k)}</dt><dd>${esc(f.v)}</dd></div>`).join('');
  $('#facts').classList.add('reveal-scale');
  $('#nameFact').textContent = profile.nameFact;
  const sw = $('#colorSwatches');
  profile.colors.forEach((c) => {
    const b = document.createElement('button');
    const light = c.hex.toLowerCase() === '#fbf7f0';
    b.className = 'swatch ' + (light ? 'light' : 'dark');
    b.style.background = c.hex;
    b.innerHTML = `<b>${esc(c.name)}</b><small>${c.hex}</small>`;
    b.title = 'Дарж HEX кодыг хуулна';
    b.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(c.hex); } catch {}
      toast(`${c.name} хуулагдлаа`, c.hex, '●', c.hex === '#fbf7f0' ? '#c9a27e' : c.hex);
    });
    sw.append(b);
  });

  /* ---- Ур чадвар: бүлэг тус бүр карт, мөр scroll-оор дүүрнэ ---- */
  const groups = [...new Set(skills.map((s) => s.group))];
  const groupIcon = { Frontend: '◧', Backend: '⛁', 'Хэрэгсэл': '✎' };
  $('#skillGroups').innerHTML = groups.map((g, gi) => `
    <article class="skill-card reveal" style="--i:${gi}">
      <h3><i>${groupIcon[g] || '✦'}</i>${esc(g)}</h3>
      ${skills.filter((s) => s.group === g).map((s, i) => `
        <div class="skill">
          <div class="skill-top"><span>${esc(s.name)}</span><output data-to="${s.level}">0</output></div>
          <div class="bar" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.level}" aria-label="${esc(s.name)}"><i style="--w:${s.level}%;--c:${s.color};--i:${i}"></i></div>
          <p class="skill-note">${esc(s.note)}</p>
        </div>`).join('')}
    </article>`).join('');
  $('#softSkills').innerHTML = softSkills.map((s) => `<li>${esc(s)}</li>`).join('');

  /* ---- Хобби ---- */
  const scenes = { volley: 'ms-volley', pingpong: 'ms-ping', billiard: 'ms-pool' };
  $('#hobbyGrid').innerHTML = hobbies.map((h, i) => `
    <article class="hobby ${h.kind} ${h.link ? 'wide' : ''} reveal" style="--i:${i % 3}" data-tilt>
      <span class="h-tag">${esc(h.tag)}</span>
      <span class="h-ico" aria-hidden="true">${h.icon}</span>
      <h3>${esc(h.title)}</h3>
      <p>${esc(h.text)}</p>
      ${h.link ? `<a class="btn btn-cherry sm magnetic" href="${esc(h.link.url)}">${esc(h.link.label)}</a>` : ''}
      ${scenes[h.id] ? `<div class="mini-scene ${scenes[h.id]}" aria-hidden="true">${h.id === 'billiard' ? '<span class="ball b1"></span><span class="ball b2"></span>' : '<span class="ball"></span>'}</div>` : ''}
    </article>`).join('');

  /* ---- Бүтээлүүд + шүүлтүүр ---- */
  const cats = [
    { id: 'all', label: 'Бүгд', test: () => true },
    { id: 'new', label: 'Шинэ', test: (w) => w.isNew },
    { id: 'creative', label: 'Тоглоом ба Creative', test: (w) => ['Game', 'Creative tool'].includes(w.type) },
    { id: 'web', label: 'Вэб апп ба сайт', test: (w) => !['Game', 'Creative tool'].includes(w.type) },
  ];
  $('#filters').innerHTML = cats.map((c, i) => `<button class="chip" data-cat="${c.id}" aria-pressed="${i === 0}">${esc(c.label)} <sup>${works.filter(c.test).length}</sup></button>`).join('');
  const grid = $('#worksGrid');
  grid.innerHTML = works.map((w, i) => `
    <button class="work ${i < 2 ? 'big' : ''} reveal" style="--i:${i % 3}" data-id="${w.id}" aria-label="${esc(w.title)} — дэлгэрэнгүй">
      <div class="work-img">
        <img src="${esc(w.image)}" alt="" loading="lazy" />
        ${w.isNew ? '<span class="new">NEW ✦</span>' : ''}
        <span class="view">Дэлгэрэнгүй →</span>
      </div>
      <div class="work-body">
        <span class="work-type">${esc(w.type)} · ${esc(w.year)}</span>
        <h3>${esc(w.title)}</h3>
        <p>${esc(w.summary)}</p>
        <ul class="chips">${w.stack.slice(0, 4).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
      </div>
    </button>`).join('');
  $$('.work', grid).forEach((el) => el.addEventListener('click', () => openPanel(works.find((w) => w.id === el.dataset.id))));
  $$('.chip', $('#filters')).forEach((chip) => chip.addEventListener('click', () => {
    const cat = cats.find((c) => c.id === chip.dataset.cat);
    $$('.chip', $('#filters')).forEach((c) => c.setAttribute('aria-pressed', c === chip));
    let k = 0;
    $$('.work', grid).forEach((el) => {
      const show = cat.test(works.find((w) => w.id === el.dataset.id));
      el.classList.toggle('hidden', !show);
      el.classList.remove('pop');
      if (show) { void el.offsetWidth; el.style.setProperty('--i', k++); el.classList.add('pop', 'in'); }
    });
  }));

  /* ---- Холбоо барих ---- */
  renderLinks($('#contactLinks'));
  $('#contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#cName'), msg = $('#cMsg'), err = $('#cErr');
    const bad = name.value.trim().length < 2 ? name : msg.value.trim().length < 5 ? msg : null;
    if (bad) {
      err.textContent = bad === name ? 'Нэрээ бичнэ үү.' : 'Мессеж хэт богино байна.';
      bad.classList.remove('shake'); void bad.offsetWidth; bad.classList.add('shake'); bad.focus();
      return;
    }
    err.textContent = '';
    const btn = e.submitter || $('#contactForm .btn');
    btn.classList.add('sent');
    $('.send-label', btn).textContent = 'Илгээж байна…';
    const subject = `[Портфолио] ${$('#cPurpose').value} — ${name.value.trim()}`;
    setTimeout(() => {
      location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg.value.trim() + '\n\n— ' + name.value.trim())}`;
      $('.send-label', btn).textContent = 'Имэйл апп нээгдлээ ✓';
      setTimeout(() => { btn.classList.remove('sent'); $('.send-label', btn).textContent = 'Захидал илгээх'; }, 2500);
    }, 650);
  });

  initMotion(root);
}

/* =====================================================================
   Хөдөлгөөн: reveal, тоолуур, scroll прогресс, nav, параллакс, tilt, magnetic
   ===================================================================== */
function initMotion(root) {
  // 1) Scroll reveal — элемент дэлгэцэнд орж ирэхэд .in класс нэмнэ
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      $$('output[data-to]', e.target).forEach(countUp);
      io.unobserve(e.target);
    });
  }, { root, threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal, .reveal-left, .reveal-scale, .r-head, .skill-card', root).forEach((el) => io.observe(el));

  // 2) Scroll прогресс, nav нуух/гаргах, идэвхтэй цэс, параллакс — rAF-аар нэг удаа
  const bar = $('#scrollProgress'), nav = $('.rnav', root), art = $('.panel-art', root);
  const links = $$('.rnav-links a', root);
  const secs = links.map((a) => $(a.getAttribute('href')));
  let lastY = 0, ticking = false;
  root.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = root.scrollTop, max = root.scrollHeight - root.clientHeight;
      bar.style.transform = `scaleX(${max ? y / max : 0})`;
      nav.classList.toggle('hide', y > lastY && y > 240);
      lastY = y;
      if (!reduce && art) art.style.transform = `translateY(${y * -0.12}px) rotate(${3 - y * 0.01}deg)`;
      let cur = 0;
      secs.forEach((s, i) => { if (s && s.offsetTop - 140 <= y) cur = i; });
      links.forEach((a, i) => a.classList.toggle('active', i === cur && y > 300));
      ticking = false;
    });
  }, { passive: true });

  // 3) 3D tilt карт — хулганы байрлалаар хазайна
  if (!reduce && matchMedia('(pointer: fine)').matches) {
    $$('[data-tilt]', root).forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', `${px * 10}deg`);
        card.style.setProperty('--rx', `${-py * 10}deg`);
      });
      card.addEventListener('pointerleave', () => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });
    });
  }
}

/* Соронзон товч — курсор руу бага зэрэг татагдана (бүх горимд) */
export function initMagnetic() {
  if (reduce || !matchMedia('(pointer: fine)').matches) return;
  document.addEventListener('pointermove', (e) => {
    const b = e.target.closest?.('.magnetic');
    $$('.magnetic.pull').forEach((m) => { if (m !== b) { m.classList.remove('pull'); m.style.setProperty('--mx', '0px'); m.style.setProperty('--my', '0px'); } });
    if (!b) return;
    const r = b.getBoundingClientRect();
    b.classList.add('pull');
    b.style.setProperty('--mx', `${(e.clientX - r.left - r.width / 2) * 0.22}px`);
    b.style.setProperty('--my', `${(e.clientY - r.top - r.height / 2) * 0.3}px`);
  });
}

// 0-ээс зорилтот тоо хүртэл тоолох
function countUp(out) {
  const to = +out.dataset.to, t0 = performance.now(), dur = reduce ? 0 : 1300;
  (function tick(now) {
    const k = dur ? Math.min(1, (now - t0) / dur) : 1;
    out.textContent = Math.round(to * (1 - (1 - k) ** 3)) + '%';
    if (k < 1) requestAnimationFrame(tick);
  })(t0);
}
