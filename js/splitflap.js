// ===================================================================
//  splitflap.js — нисэх буудлын «эргэдэг үсэгт» самбар.
//  Нүд (tile) бүр зорилтот үсэг рүүгээ хүрэх хүртэл CHARSET дотор
//  дараалан эргэнэ. Жинхэнэ Solari самбар шиг зарим нь эрт, зарим нь
//  хожуу зогсоно.
// ===================================================================

import { sound } from './sound.js';

export const CHARSET =
  ' АБВГДЕЁЖЗИЙКЛМНОӨПРСТУҮФХЦЧШЩЪЫЬЭЮЯABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-.:/·?!';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

export class FlapText {
  /**
   * @param {HTMLElement} el   — нүднүүдийг байрлуулах элемент
   * @param {number} length    — нүдний тоо
   * @param {{speed?:number, highlight?:boolean}} opts
   */
  constructor(el, length, { speed = 38, highlight = false } = {}) {
    this.el = el;
    this.length = length;
    this.speed = speed;
    this.tiles = [];
    this.timer = null;

    for (let i = 0; i < length; i++) {
      const tile = document.createElement('span');
      tile.className = 'tile' + (highlight ? ' hl' : '');
      const ch = document.createElement('span');
      ch.className = 'ch';
      ch.textContent = ' ';
      tile.append(ch);
      // эргэлт дуусахад класс авч, дараагийн эргэлтэд дахин нэмэх боломжтой болно
      tile.addEventListener('animationend', () => tile.classList.remove('flip'));
      el.append(tile);
      this.tiles.push({ tile, ch, current: 0 });
    }
  }

  /** Текстийг самбар дээр «эргүүлж» гаргана. Promise дуусахад бүгд зогссон. */
  set(text) {
    const target = text.toUpperCase().padEnd(this.length, ' ').slice(0, this.length);
    clearInterval(this.timer);

    if (reduceMotion) {
      this.tiles.forEach((t, i) => (t.ch.textContent = target[i]));
      return Promise.resolve();
    }

    // нүд бүрт хэдэн алхам эргэхийг тогтооно (санамсаргүй + зүүнээс баруун тийш саатал)
    const plan = this.tiles.map((t, i) => {
      const goal = Math.max(0, CHARSET.indexOf(target[i]));
      const extra = 3 + Math.floor(Math.random() * 6) + Math.floor(i * 0.6);
      return { goal, steps: target[i] === t.ch.textContent ? 0 : extra };
    });

    return new Promise((resolve) => {
      this.timer = setInterval(() => {
        let moving = 0;
        this.tiles.forEach((t, i) => {
          const p = plan[i];
          if (p.steps <= 0) return;
          p.steps--;
          moving++;
          // сүүлийн алхам дээр зорилтот үсэг, бусад үед дараагийн үсэг
          t.current = p.steps === 0 ? p.goal : (t.current + 1) % CHARSET.length;
          t.ch.textContent = CHARSET[t.current];
          t.tile.classList.remove('flip');
          void t.tile.offsetWidth; // reflow — анимэйшнийг дахин эхлүүлэх заль
          t.tile.classList.add('flip');
        });
        if (moving) sound.flap(moving);
        else {
          clearInterval(this.timer);
          resolve();
        }
      }, this.speed);
    });
  }
}

/** Олон мөртэй том самбар (hero) */
export function createBoard(el, cols, rows) {
  el.style.setProperty('--cols', cols);
  return Array.from({ length: rows }, (_, r) => {
    const row = document.createElement('div');
    row.className = 'flap-row';
    el.append(row);
    return new FlapText(row, cols, { highlight: r === 0 });
  });
}
