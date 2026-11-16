// ===================================================================
//  world.js — түвшний зураглал (level design). Бүх координат «логик
//  пиксел»-ээр: дэлгэцийн өндөр = 240, газрын гадаргуу GROUND = 200.
//  4 бүлэг (chapter): Миний тухай → Хобби → Бүтээлүүд → Холбоо барих
// ===================================================================

import { profile, skills, hobbies, works } from './data.js';

export const VIEW_H = 240;
export const GROUND = 200;
export const WORLD_W = 4480;

// Газар — хооронд нь цоорхой (унавал ойрын шалган дээр буцна)
export const grounds = [
  [0, 880], [940, 1400], [1460, 2700], [2760, 4000], [4060, WORLD_W],
];

// Номоор хийсэн тавцан [x, y, өргөн]. hidden = нууц (бараг үл харагдана)
export const platforms = [
  { x: 520, y: 166, w: 56 },
  { x: 640, y: 140, w: 48 },
  { x: 776, y: 164, w: 56 },
  { x: 1060, y: 162, w: 64 },
  { x: 1180, y: 134, w: 48 },
  { x: 1272, y: 88, w: 34, hidden: true },
];

// Будгийн сав — хажуугаас мөргөнө, дээр нь гарч болно
export const rocks = [
  { x: 3000, w: 20, h: 18 },
  { x: 3440, w: 22, h: 22 },
  { x: 4180, w: 18, h: 14 },
];

// Ур чадварын стикер — skills массивын дарааллаар
const spots = [
  [460, 184], [548, 146], [664, 118], [804, 144], [910, 150],
  [990, 184], [1092, 140], [1204, 112], [1340, 184],
];
export const coins = skills.map((s, i) => ({ ...s, x: spots[i][0], y: spots[i][1], taken: false }));
export const secretCoin = { name: 'Нууц стикер', color: '#ffffff', x: 1289, y: 68, taken: false, secret: true };

// Самбар — ойртоход манга маягийн яриан бөмбөлөг гарна
export const signs = [
  { x: 200, title: 'Сайн уу! 👋', text: `Би ${profile.name} — ${profile.role}. ${profile.tagline} ← → алхаж, Space-ээр үсэрнэ.` },
  { x: 420, title: 'Миний тухай', text: profile.bio[0] },
  { x: 1000, title: 'Миний тухай (2)', text: profile.bio[1] },
  { x: 1490, title: 'Бүлэг 2 · Хобби', text: 'Миний хоббигийн өрөөнд тавтай мор! Объект бүрийн өмнө зогсоод ↑ (эсвэл «Үзэх») дарна уу.' },
  { x: 2790, title: 'Бүлэг 3 · Галерей', text: '5 жааз = 5 бүтээл. Эхний хоёр нь энэ бие даалтад шинээр хийсэн 🆕' },
  { x: 4100, title: 'Бүлэг 4 · Сүүлийн хуудас', text: 'Интоорын модонд хүрвэл холбоо барих хэсэг нээгдэнэ 🌸' },
];

// Хоббигийн объектууд — draw: art.js дахь зурах функцийн төрөл
const hobbyX = { draw: 1580, anime: 1760, read: 1940, volley: 2160, pingpong: 2380, billiard: 2560 };
export const hobbyObjs = hobbies.map((h) => ({ ...h, x: hobbyX[h.id], w: 64 }));

// Волейболын тор ба бөмбөг (физиктэй)
export const net = { x: 2190, top: 150 };
export const volleyBall = { x: 2140, y: 120, vx: 0, vy: 0, r: 6, hits: 0, best: 0 };

// Бүтээлийн жааз
const frameX = [2880, 3100, 3320, 3540, 3760];
export const frames = works.map((w, i) => ({ ...w, x: frameX[i], w: 72, visited: false }));

// Төгсгөл — интоорын мод
export const tree = { x: 4300 };

// Хэсгүүд — HUD-ийн нэр, хурдан шилжих цэг
export const sections = [
  { id: '01', label: 'Миний тухай', from: 0, spawn: 60 },
  { id: '02', label: 'Хобби', from: 1440, spawn: 1490 },
  { id: '03', label: 'Бүтээлүүд', from: 2740, spawn: 2790 },
  { id: '04', label: 'Холбоо барих', from: 4040, spawn: 4090 },
];

export const checkpoints = [60, 420, 860, 1380, 1490, 2680, 2790, 3980, 4090];

// Чимэглэл: ном, өвс, цэцэг (тогтмол «санамсаргүй»)
export const decor = [];
for (let x = 40, k = 1; x < WORLD_W; x += 60 + ((k * 53) % 80), k++) {
  const onGround = grounds.some(([a, b]) => x > a + 10 && x < b - 20);
  const busy = [...hobbyObjs, ...frames].some((o) => Math.abs(o.x + 32 - x) < 56) || Math.abs(tree.x - x) < 70 || Math.abs(net.x - x) < 70;
  if (onGround && !busy) decor.push({ x, type: ['tuft', 'flower', 'bookpile', 'tuft'][k % 4], k });
}
