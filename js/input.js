// ===================================================================
//  input.js — гар (keyboard) болон мэдрэгч дэлгэцийн товчлуур.
//  held  = одоо дарагдсан байгаа эсэх
//  press = энэ frame-д шинээр дарагдсан эсэх (нэг удаа үйлдэл)
// ===================================================================

const held = { left: false, right: false, jump: false, up: false };
const pressed = { jump: false, action: false };

const KEYMAP = {
  ArrowLeft: 'left', a: 'left', A: 'left',
  ArrowRight: 'right', d: 'right', D: 'right',
  ' ': 'jump', w: 'jump', W: 'jump', z: 'jump', Z: 'jump',
  ArrowUp: 'up', e: 'up', E: 'up', Enter: 'up',
};

export const input = {
  enabled: true,
  get left() { return held.left; },
  get right() { return held.right; },
  get jumpHeld() { return held.jump; },
  /** Нэг удаа уншаад цэвэрлэнэ */
  take(name) { const v = pressed[name]; pressed[name] = false; return v; },
  reset() { Object.keys(held).forEach((k) => (held[k] = false)); pressed.jump = pressed.action = false; },
};

function set(name, down) {
  if (name === 'up') { if (down && !held.up) pressed.action = true; held.up = down; return; }
  if (name === 'jump' && down && !held.jump) pressed.jump = true;
  held[name] = down;
}

addEventListener('keydown', (e) => {
  if (!input.enabled) return;
  if (e.target.closest && e.target.closest('input, textarea, select')) return;
  const name = KEYMAP[e.key];
  if (!name) return;
  e.preventDefault(); // Space-ээр хуудас гүйлгэхээс сэргийлнэ
  set(name, true);
});
addEventListener('keyup', (e) => { const name = KEYMAP[e.key]; if (name) set(name, false); });
addEventListener('blur', () => input.reset());

/** Мэдрэгч товчлуурууд: data-key="left|right|jump|up" */
export function bindTouch(root) {
  root.querySelectorAll('[data-key]').forEach((btn) => {
    const name = btn.dataset.key;
    const down = (e) => { e.preventDefault(); btn.classList.add('on'); set(name, true); };
    const up = (e) => { e.preventDefault(); btn.classList.remove('on'); set(name, false); };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('pointerleave', up);
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  });
}
