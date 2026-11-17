// ===================================================================
//  data.js — сайтын БҮХ агуулга. Текст солих бол зөвхөн энэ файлыг засна.
//  Тоглоом (game.js) болон унших горим (reading.js) хоёулаа эндээс уншина.
// ===================================================================

export const profile = {
  name: 'Хулан',
  fullName: 'Хатанбаатар Хулан',
  nameLatin: 'KHULAN',
  role: 'Full-stack вэб хөгжүүлэгч',
  tagline: 'Зураг шиг сэтгэл татам, тоглоом шиг сонирхолтой вэб туршлагыг кодоор бүтээдэг.',
  school: 'СЭЗИС · Мэдээллийн Системийн Менежментийн тэнхим',
  base: 'Улаанбаатар',
  languages: 'Монгол, Англи',
  bio: [
    'Сайн уу! Би Хатанбаатар Хулан — СЭЗИС-ийн МСМ тэнхимд суралцдаг, вэб хөгжүүлэлтэд дуртай оюутан. Товчлуурын ард юу болдгийг — өгөгдлийн сан, эрхийн бодлого, төлбөрийн урсгал хүртэл — өөрөө ойлгож, өөрөө бүтээх дуртай.',
    'Чөлөөт цагаараа зураг зурж, анимэ үзэж, ном уншдаг. Зураг зурах дуртай учраас интерфэйс бүрт хөдөлгөөн, өнгө, жижиг «амьд» мөчүүдийг нэмэх дуртай — энэ сайт ч тэр дундаа нэг.',
  ],
  facts: [
    { k: 'Овог нэр', v: 'Хатанбаатар Хулан' },
    { k: 'Суурин', v: 'Улаанбаатар' },
    { k: 'Сургууль', v: 'СЭЗИС · МСМ' },
    { k: 'Хэл', v: 'Монгол, Англи' },
    { k: 'Одоо', v: 'Дадлагын байр хайж байна' },
  ],
  colors: [
    { name: 'Цагаан', hex: '#fbf7f0' },
    { name: 'Бор', hex: '#7a5238' },
    { name: 'Cherry red', hex: '#b3122e' },
  ],
  nameFact: 'Тоглоомын баатар бол буржгар үстэй, зурах дуртай охин — яг л би 🎨 Cherry red даашинзтай, гартаа харандаатай дэвтрийн хуудсуудаар аялж, ур чадвар, хобби, бүтээлүүдээ танилцуулна.',
  email: 'Khuln988@gmail.com',
  socials: [
    { label: 'GitHub', handle: '@Khuln988', url: 'https://github.com/Khuln988' },
    { label: 'LinkedIn', handle: 'Хулан Хатанбаатар', url: 'https://www.linkedin.com/in/%D1%85%D1%83%D0%BB%D0%B0%D0%BD-%D1%85%D0%B0%D1%82%D0%B0%D0%BD%D0%B1%D0%B0%D0%B0%D1%82%D0%B0%D1%80-b40b263b3' },
    { label: 'Instagram', handle: '@cessicre', url: 'https://www.instagram.com/cessicre/' },
  ],
};

// Мэргэжлийн ур чадвар — тоглоомд «стикер», унших горимд хөдөлгөөнт мөр болно
export const skills = [
  { name: 'HTML / CSS', group: 'Frontend', level: 90, color: '#e8743b', note: 'Semantic markup, Grid/Flex, keyframe анимэйшн, responsive' },
  { name: 'JavaScript', group: 'Frontend', level: 85, color: '#d9a400', note: 'ES modules, Canvas 2D, Web Audio, Pointer events' },
  { name: 'React', group: 'Frontend', level: 80, color: '#2fa3c8', note: 'Hooks, React Router, custom hook, компонент архитектур' },
  { name: 'Supabase', group: 'Backend', level: 75, color: '#2f9e6e', note: 'Auth, Storage, RLS бодлого, Edge Functions' },
  { name: 'PostgreSQL', group: 'Backend', level: 70, color: '#3b6ea5', note: 'JOIN, GROUP BY, RPC функц, exclusion constraint, pg_cron' },
  { name: 'REST API', group: 'Backend', level: 72, color: '#6a3fa0', note: 'fetch, статус код, Stripe webhook, алдааны боловсруулалт' },
  { name: 'Git / Vercel', group: 'Хэрэгсэл', level: 80, color: '#c2410c', note: 'Branch, commit түүх, Git-тэй холбосон автомат deploy' },
  { name: 'Figma', group: 'Хэрэгсэл', level: 75, color: '#d6336c', note: 'Wireframe, user flow, прототип' },
  { name: 'Motion design', group: 'Хэрэгсэл', level: 78, color: '#b3122e', note: 'Micro-interaction, transition, scroll animation, sprite анимэйшн' },
];

export const softSkills = ['Багаар ажиллах 🏐', 'Шинийг хурдан сурах', 'Асуудал шийдвэрлэх', 'Нарийн мэдрэмж 🎨', 'Тайлбарлах чадвар'];

// Хобби — тоглоомын 2-р бүлэгт объект болж гарна
export const hobbies = [
  { id: 'draw', kind: 'hobby', icon: '✎', title: 'Зураг зурах', tag: 'Хобби',
    text: 'Харандаа, бэхээр анимэ маягийн дүр, ландшафт зурах дуртай. Зурах дуртай учраас өөрийн гэсэн зураг зурах апп хүртэл хийсэн — доорх товчоор туршаад үзээрэй!',
    link: { label: 'Sketchbook апп нээх ✎', url: 'projects/sketchbook/' } },
  { id: 'anime', kind: 'hobby', icon: '✦', title: 'Анимэ үзэх', tag: 'Хобби',
    text: 'Анимэгийн өнгө, хөдөлгөөн, түүх өгүүлэх арга надад их урам өгдөг. Энэ сайтын манга маягийн самбар, хурдны зураас, хэлхээ бөмбөлөг тэндээс санаа авсан.' },
  { id: 'read', kind: 'hobby', icon: '❦', title: 'Ном унших', tag: 'Хобби',
    text: 'Уран зохиол, хөгжүүлэлтийн ном уншиж, сонирхолтой санаагаа дэвтэртээ тэмдэглэдэг. Энэ тоглоомын номон тавцангууд яг миний номын тавиураас 📚' },
  { id: 'volley', kind: 'sport', icon: '🏐', title: 'Волейбол', tag: 'Спорт',
    text: 'Багийн тоглоом — харилцаа, итгэлцэл, хурдан шийдвэр. Тоглоомд бөмбөгийг толгойгоороо тосоод, рекордоо тогтоогоорой! (үсэрч тосно)' },
  { id: 'pingpong', kind: 'sport', icon: '🏓', title: 'Ширээний теннис', tag: 'Спорт',
    text: 'Хурдан хариу үйлдэл, анхаарал төвлөрөл. Хулан-боттой 5 оноо хүртэл тоглоод, хамгийн урт rally-гаа рекорд болгоорой!',
    play: { label: 'Теннис тоглох 🏓', id: 'pingpong' } },
  { id: 'billiard', kind: 'sport', icon: '🎱', title: 'Биллиард', tag: 'Спорт',
    text: 'Өнцөг, хүч, тэвчээр — яг программчлал шиг. Тиймээс олон улсын 8-ball дүрэмтэй, жинхэнэ физиктэй биллиардын тоглоом бүтээсэн. Компьютертэй тоглоод үзээрэй!',
    link: { label: 'Cherry Billiards тоглох 🎱', url: 'projects/billiards/' } },
];

// Бүтээлүүд — тоглоомын 3-р бүлэгт зургийн жааз болно. isNew: энэ бие даалтад шинээр хийсэн
export const works = [
  {
    id: 'sketchbook', isNew: true, type: 'Creative tool',
    title: 'Sketchbook — зураг зурах апп',
    year: '2026', accent: '#b3122e',
    image: 'assets/works/sketchbook.webp',
    summary: 'Хөтөч дээр шууд ажилладаг зургийн дэвтэр. Харандаа, бэх үзэг, маркер, баллуур; толин болон 6 талт «мандал» тэгш хэм; зурсан зургаа timelapse хэлбэрээр дахин тоглуулж, PNG болгон татна.',
    highlights: [
      'Бэх үзэг зурах хурдаас хамаарч зузаан/нимгэн болно (Pointer Events + үзгийн даралт)',
      'Зураас бүрийг цэгийн массиваар хадгалсан тул буцаах/дахих, timelapse боломжтой',
      'Гарын товчлол, хөдөлгөөнт tooltip, toast зэрэг micro-interaction',
    ],
    stack: ['Canvas 2D', 'Pointer Events', 'JavaScript', 'CSS animation'],
    live: 'projects/sketchbook/',
    repo: 'https://github.com/Khuln988/portfolio/tree/main/projects/sketchbook',
  },
  {
    id: 'billiards', isNew: true, type: 'Game',
    title: 'Cherry Billiards — 8-ball',
    year: '2026', accent: '#7c0c22',
    image: 'assets/works/billiards.webp',
    summary: 'Олон улсын 8-ball дүрэмтэй, cherry red даавуутай 2D биллиард. Компьютер эсвэл 2 тоглогчоор тоглоно. 8 Ball Pool шиг чиглэлийн шугам бай бөмбөг болон цагаан бөмбөг хаашаа явахыг харуулж, хүчний саваагаар цохино.',
    highlights: [
      'Дүрэм: бүтэн/судалтай бүлэг, foul (цагаан унах, буруу бөмбөг, хана), ball in hand, 8-аар ялах/хожигдох',
      'Компьютер: халаас бүрт «сүнс бөмбөг» тооцож, саадгүй замтай хамгийн амар цохилтыг сонгоно',
      'Мөргөлдөөнийг нэг frame-д 4 дэд алхмаар тооцсон; гар утсан дээр ширээ 90° эргэнэ',
    ],
    stack: ['Canvas 2D', 'Физик', 'Game AI', 'Web Audio'],
    live: 'projects/billiards/',
    repo: 'https://github.com/Khuln988/portfolio/tree/main/projects/billiards',
  },
  {
    id: 'bookit', type: 'SaaS',
    title: 'BookIt — цаг захиалгын SaaS',
    year: '2026', accent: '#4f46e5',
    image: 'assets/works/bookit.svg',
    summary: 'Салон, шүдний эмнэлэг, фитнес зэрэг үйлчилгээний бизнест зориулсан онлайн цаг захиалгын платформ. Үйлчлүүлэгч бүртгэлгүйгээр цаг авч, холбоосоор цуцална.',
    highlights: [
      'Давхар захиалгыг өгөгдлийн сангийн түвшинд exclusion constraint-оор хориглосон',
      'Stripe-аар урьдчилгаа авч, төлөгдөөгүй захиалгыг pg_cron 5 минут тутам цуцална',
      'Цуцлагдсан захиалгын төлбөрийг webhook автоматаар буцаана',
    ],
    stack: ['React 18', 'Supabase', 'PostgreSQL', 'Stripe', 'Vercel'],
    live: 'https://bookit-mn.vercel.app',
    repo: '', repoNote: 'Хаалттай репо — хүсэлтээр',
  },
  {
    id: 'museum', type: 'Web app',
    title: 'ISM Digital Museum',
    year: '2026', accent: '#8a6a52',
    image: 'assets/works/museum.svg',
    summary: 'МСМ тэнхимийн түүх, багш нар, арга хэмжээ, оюутнуудын бүтээлийг нэг дор хадгалсан интерактив дижитал музей. 3D галерейн коридор бүхий виртуал үзэсгэлэнтэй.',
    highlights: [
      'Виртуал үзэсгэлэн: ангилал бүрээр өрөө, аудио хөтөч, автомат аялал',
      'Оюутны нэмсэн бүтээл «pending» төлөвт орж админ хянана (RLS)',
      'Хайлт, шүүлтүүр URL query-д хадгалагдана',
    ],
    stack: ['React 18', 'React Router', 'Supabase', 'RLS'],
    live: 'https://ism-digital-museum.vercel.app',
    repo: 'https://github.com/khuln988/ism-digital-museum',
  },
  {
    id: 'linquire', type: 'Website',
    title: 'Linquire — хувцасны дэлгүүр',
    year: '2026', accent: '#c2477a',
    image: 'assets/works/linquire.svg',
    summary: 'Эмэгтэй хувцасны онлайн дэлгүүрийн нүүр хуудас. Ангилал, шинэ бараа, сагс, нэвтрэх цонхтой — framework-гүй цэвэр HTML, CSS, JavaScript.',
    highlights: [
      'Playfair Display + DM Sans хослол, зөөлөн ягаавтар палитр',
      'Сагсанд нэмэх, нийт дүн тооцох логик JavaScript-ээр',
      'Гар утсанд зориулсан responsive grid',
    ],
    stack: ['HTML', 'CSS', 'JavaScript'],
    live: 'projects/linquire/',
    repo: 'https://github.com/Khuln988/portfolio/tree/main/projects/linquire',
  },
];
