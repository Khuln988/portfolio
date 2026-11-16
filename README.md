# ✈ Terminal K — Хулангийн портфолио

> SWE334 Internet Programming · Бие даалт 2 · Хувийн портфолио вэбсайт

- **Live:** https://portfolio-five-theta-hc4ghzeuww.vercel.app
- **GitHub:** https://github.com/Khuln988/portfolio

## Бүтээлч санаа

Сайт бүхэлдээ **нисэх онгоцны буудлын терминал** хэлбэртэй. Зочин «зорчигч» болж,
хаалга (A–D) бүрээр дамжин намайг танина:

| Хаалга | Хэсэг | Метафор |
|---|---|---|
| **A** | Танилцуулга | Split-flap (Solari) самбар дээр нэр, чиглэл эргэлдэж гарна. Онгоц хөөрнө |
| **B** | Миний тухай | **Паспорт** нээгдэнэ — зүүн хуудсанд намтар + MRZ код, баруун хуудсанд ур чадвар **виз тамга** болж «тас» хийн дарагдана |
| **C** | Бүтээлүүд | **Явах нислэгийн самбар** — төсөл бүр нэг нислэг. Мөр дээр дарахад **суух тасалбар** нээгдэж зураг, тайлбар, stack, холбоос харагдана |
| **D** | Холбоо барих | **Check-in ширээ** — маягт бөглөөд «Тасалбар хэвлэх» дарахад принтерээс таны нэртэй тасалбар хэвлэгдэж, имэйл бэлэн болно |

### Нэмэлт бүтээлч шийдлүүд
- **Шар wayfinding тэмдэг** маягийн навигаци; гар утсан дээр доод хэсэгт буух тэмдэг-самбар
- **PA зарлал** — хэсэг рүү ороход «дин-дон» дуутай зарлал гарна
- **Дуу бүгд кодоор үүссэн** (Web Audio API) — самбарын шаржигнаан, тамга, принтер, онгоцны шуугиан. Аудио файл ашиглаагүй
- **Өдөр / Шөнийн нислэг** горим (`localStorage`-д хадгална, системийн тохиргоог дагана)
- Улаанбаатарын бодит цаг, KH404 — «таны баг?» гэсэн ирээдүйн нислэг
- **Easter egg-үүд:** Konami код (↑↑↓↓←→←→BA) → онгоц баннер чирч нисэнэ; лого дээр 5 дарвал «турбулент»; DevTools console-д мэндчилгээ
- Лого, паспортын зураг, бүтээлийн зургууд — бүгд гараар бичсэн SVG

## Технологи

Ямар ч framework, build алхамгүй — **цэвэр HTML + CSS + JavaScript (ES modules)**.

| Файл | Үүрэг |
|---|---|
| `index.html` | Бүтэц (semantic: header, nav, main, section, dialog, footer) |
| `css/style.css` | CSS хувьсагчаар 2 горим, Grid/Flex, `container query` (`cqi`) — самбарын нүдний хэмжээ, keyframe анимэйшн, responsive (980/860/720/400px) |
| `js/data.js` | Бүх агуулга (профайл, ур чадвар, бүтээл) — текст солиход зөвхөн энийг засна |
| `js/splitflap.js` | `FlapText` класс: нүд бүр `CHARSET`-ээр алхам алхмаар эргэж зорилтот үсэг дээр зогсоно (`setInterval` + Promise) |
| `js/sound.js` | Web Audio API: noise buffer + bandpass filter = «тас», oscillator = «дин-дон» |
| `js/main.js` | Хэсгүүдийг угсрах, `IntersectionObserver` (scroll анимэйшн, идэвхтэй цэс), `<dialog>`, маягт шалгах, `mailto:`, easter egg |
| `projects/linquire/` | 3 дахь бүтээл (Linquire дэлгүүр) — портфолиотой хамт байршина |

**Хүртээмж:** `prefers-reduced-motion`-д анимэйшн унтарна, гараар бүрэн удирдана (`:focus-visible`, Esc-ээр dialog хаагдана), `aria-label`, skip link.

## Ажиллуулах

```bash
# ES modules тул файлыг шууд нээхгүй, жижиг сервер хэрэгтэй
npx serve .          # эсвэл: python3 -m http.server
```

## Deploy (Vercel)
1. Энэ репог GitHub-д push хийнэ
2. vercel.com → **Add New → Project** → репог сонгоно → Framework: **Other** → Deploy
3. Build command шаардлагагүй (static сайт)

## Эх сурвалж
- Фонт: [Unbounded](https://fonts.google.com/specimen/Unbounded), [Manrope](https://fonts.google.com/specimen/Manrope), [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) — Google Fonts (OFL)
- Linquire төслийн бүтээгдэхүүний зургууд — [Unsplash](https://unsplash.com) (Unsplash License)
- Split-flap самбар, паспорт, нисэх буудлын тэмдэглэгээний санаа — бодит нисэх буудлын дизайнаас сэдэвлэсэн, код өөрөө бичсэн
- Кодыг бичихэд AI туслах (Claude) ашигласан; бүх хэсгийг ойлгож, тайлбарлах боломжтой
