// ===================================================================
//  ui.js — тоглоом ба унших горимд хамтдаа ашиглах UI хэсгүүд:
//  toast, манга самбар (dialog), холбоо барих холбоосууд, текст хуваах.
// ===================================================================

import { profile } from './data.js';

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const isExternal = (url) => /^https?:/.test(url);

/* ---------- Toast (баруун дээд буланд стикер мэт гарна) ---------- */
export function toast(title, sub = '', icon = '✦', color = 'var(--cherry)') {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<i style="background:${color}">${icon}</i><span>${esc(title)}${sub ? `<small>${esc(sub)}</small>` : ''}</span>`;
  $('#toasts').append(el);
  setTimeout(() => el.remove(), 2900);
}

/* ---------- Үсэг бүрийг span болгох (hover, stagger анимэйшн) ---------- */
export function splitLetters(root = document) {
  $$('[data-split]', root).forEach((el) => {
    if (el.dataset.done) return;
    el.dataset.done = 1;
    el.setAttribute('aria-label', el.textContent);
    el.innerHTML = [...el.textContent].map((c, i) => `<span class="ch" aria-hidden="true" style="--i:${i}">${esc(c)}</span>`).join('');
  });
}

/* ---------- Манга самбар: бүтээл эсвэл хобби ---------- */
let onPanelClose = null;
export function openPanel(item, onClose) {
  const body = $('#panelBody');
  if (item.kind) {
    body.innerHTML = `
      <div class="hobby-panel">
        <span class="big-ico" aria-hidden="true">${item.icon}</span>
        <p class="pb-tag" style="justify-content:center;margin-top:10px">${esc(item.tag)}</p>
        <h3 id="panelTitle">${esc(item.title)}</h3>
        <p>${esc(item.text)}</p>
        ${item.link ? `<a class="btn btn-cherry" href="${esc(item.link.url)}">${esc(item.link.label)}</a>` : ''}
        ${item.play ? `<button class="btn btn-cherry" data-play="${esc(item.play.id)}">${esc(item.play.label)}</button>` : ''}
      </div>`;
  } else {
    const live = isExternal(item.live) ? item.live : new URL(item.live, location.href).href;
    body.innerHTML = `
      <div class="pb-grid">
        <figure class="pb-shot" style="margin:0"><img src="${esc(item.image)}" alt="${esc(item.title)} — дэлгэцийн зураг" /></figure>
        <div>
          <p class="pb-tag">${item.isNew ? '<span class="new">NEW</span>' : ''}${esc(item.type)} · ${esc(item.year)}</p>
          <h3 id="panelTitle">${esc(item.title)}</h3>
          <p>${esc(item.summary)}</p>
          <ul class="pb-hi">${item.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
          <ul class="chips">${item.stack.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
          <div class="pb-links">
            <a class="btn btn-cherry" href="${esc(live)}" ${isExternal(item.live) ? 'target="_blank" rel="noopener"' : ''}>${item.id === 'billiards' ? 'Тоглох' : 'Live demo'} ↗</a>
            ${item.repo
              ? `<a class="btn btn-paper" href="${esc(item.repo)}" target="_blank" rel="noopener">GitHub ↗</a>`
              : `<span class="muted">🔒 ${esc(item.repoNote || 'Репо хаалттай')}</span>`}
          </div>
        </div>
      </div>`;
  }
  onPanelClose = onClose || null;
  const dlg = $('#panel');
  dlg.showModal();
  body.scrollTop = 0;
}

// хаахдаа жижиг «гарах» анимэйшн тоглуулна
export function closeDialog(dlg) {
  if (!dlg.open) return;
  dlg.classList.add('closing');
  setTimeout(() => { dlg.classList.remove('closing'); dlg.close(); }, 220);
}

export function initDialogs() {
  for (const id of ['panel', 'finish']) {
    const dlg = $('#' + id);
    dlg.addEventListener('click', (e) => { if (e.target === dlg) closeDialog(dlg); }); // гадна дарвал хаагдана
    dlg.addEventListener('close', () => { if (id === 'panel' && onPanelClose) { const f = onPanelClose; onPanelClose = null; f(); } });
  }
  $('#panelClose').addEventListener('click', () => closeDialog($('#panel')));
  $('#finishClose').addEventListener('click', () => closeDialog($('#finish')));
}

/* ---------- Холбоо барих холбоосууд (имэйл хуулах + сошиал) ---------- */
export function renderLinks(ul) {
  ul.innerHTML = '';
  const li = document.createElement('li');
  const btn = document.createElement('button');
  btn.className = 'link';
  btn.type = 'button';
  btn.innerHTML = `<span class="ico">✉</span><span><small>Имэйл · дарж хуулна</small><em>${esc(profile.email)}</em></span><span class="go">⧉</span>`;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      btn.classList.add('copied');
      btn.querySelector('.ico').textContent = '✓';
      btn.querySelector('small').textContent = 'Хуулагдлаа!';
      toast('Имэйл хуулагдлаа', profile.email, '✉');
      setTimeout(() => { btn.classList.remove('copied'); btn.querySelector('.ico').textContent = '✉'; btn.querySelector('small').textContent = 'Имэйл · дарж хуулна'; }, 1800);
    } catch { location.href = `mailto:${profile.email}`; }
  });
  li.append(btn);
  ul.append(li);
  const icons = { GitHub: '⌥', LinkedIn: 'in', Instagram: '◎' };
  profile.socials.filter((s) => s.url).forEach((s) => {
    const item = document.createElement('li');
    item.innerHTML = `<a class="link" href="${esc(s.url)}" target="_blank" rel="noopener"><span class="ico">${icons[s.label] || '↗'}</span><span><small>${esc(s.label)}</small><em>${esc(s.handle)}</em></span><span class="go">→</span></a>`;
    ul.append(item);
  });
}
