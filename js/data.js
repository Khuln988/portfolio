// ===================================================================
//  data.js — сайтын бүх агуулга энд. Текст солих бол зөвхөн энэ файлыг засна.
// ===================================================================

export const profile = {
  name: 'Хулан',                 // TODO: Овог нэрээ бүтнээр нь бичиж болно
  nameLatin: 'KHULAN',
  role: 'Full-stack вэб хөгжүүлэгч',
  tagline:
    'Хүмүүсийн цагийг хэмнэж, ашиглахад таатай вэб бүтээгдэхүүнийг санаанаас нь эхлээд production хүртэл хүргэдэг.',
  school: 'СЭЗИС · Мэдээллийн Системийн Менежментийн тэнхим',
  nationality: 'Монгол',
  languages: 'Монгол, Англи',
  base: 'Улаанбаатар',
  bio: [
    'Би СЭЗИС-ийн МСМ тэнхимд суралцдаг, вэб хөгжүүлэлтэд дуртай оюутан. Нэг товчлуурын ард юу болдгийг — өгөгдлийн сан, эрхийн бодлого, төлбөрийн урсгал хүртэл — өөрөө ойлгож, өөрөө бүтээх дуртай.',
    'Сүүлийн хичээлийн жилд цаг захиалгын SaaS, тэнхимийн дижитал музей, онлайн дэлгүүр гэсэн гурван төслийг бүтээж, Vercel дээр нийтэд байршуулсан. Дараагийн «нислэг» маань — бодит хэрэглэгчидтэй багт дадлага хийх.',
  ],
  email: 'b22fa1276@ufe.edu.mn', // TODO: нийтэд харуулахыг хүсэх имэйлээ тавина
  socials: [
    { label: 'GitHub', handle: '@Khuln988', url: 'https://github.com/Khuln988' },
    // TODO: хоосон биш болговол автоматаар гарч ирнэ
    { label: 'LinkedIn', handle: '', url: '' },
    { label: 'Instagram', handle: '', url: '' },
  ],
};

// Паспортын «виз тамга» — ур чадвар. year = анх хэрэглэж эхэлсэн он
export const skills = [
  { name: 'HTML / CSS', year: 2023, shape: 'circle', note: 'Semantic markup, Grid/Flex, container query, анимэйшн' },
  { name: 'JavaScript', year: 2023, shape: 'rect', note: 'ES modules, DOM, Web Audio, IntersectionObserver' },
  { name: 'React', year: 2025, shape: 'circle', note: 'Hooks, React Router, компонент архитектур' },
  { name: 'Supabase', year: 2025, shape: 'rect', note: 'Auth, Storage, RLS бодлого, Edge Functions' },
  { name: 'PostgreSQL', year: 2025, shape: 'oval', note: 'RPC функц, exclusion constraint, pg_cron' },
  { name: 'Stripe', year: 2026, shape: 'rect', note: 'Checkout, webhook, автомат буцаалт' },
  { name: 'Vite', year: 2025, shape: 'oval', note: 'Build, env тохиргоо' },
  { name: 'Git / Vercel', year: 2024, shape: 'circle', note: 'Git-тэй холбосон автомат deploy' },
  { name: 'Figma', year: 2024, shape: 'rect', note: 'Wireframe, user flow, прототип' },
];

// Нислэгүүд = бүтээлүүд
export const works = [
  {
    flight: 'KH101',
    dest: 'BOOKIT',
    title: 'BookIt — цаг захиалгын SaaS',
    date: '2026.11',
    gate: 'C1',
    status: 'ОНЛАЙН',
    image: 'assets/works/bookit.svg',
    summary:
      'Салон, шүдний эмнэлэг, фитнес зэрэг үйлчилгээний бизнест зориулсан онлайн цаг захиалгын платформ. Бизнес бүр өөрийн хуудастай, үйлчлүүлэгч бүртгэлгүйгээр цаг авч, холбоосоор цуцална.',
    highlights: [
      'Давхар захиалгыг өгөгдлийн сангийн түвшинд exclusion constraint-оор хориглосон',
      'Stripe-аар урьдчилгаа авч, төлөгдөөгүй захиалгыг pg_cron 5 минут тутам цуцална',
      'Цуцлагдсан захиалгын төлбөрийг webhook автоматаар буцаана',
    ],
    stack: ['React 18', 'Vite', 'Supabase', 'PostgreSQL', 'Stripe', 'Vercel'],
    live: 'https://bookit-mn.vercel.app',
    repo: '', // хаалттай репо
    repoNote: 'Хаалттай репо — хүсэлтээр',
  },
  {
    flight: 'KH202',
    dest: 'ISM МУЗЕЙ',
    title: 'ISM Digital Museum',
    date: '2026.10',
    gate: 'C2',
    status: 'ОНЛАЙН',
    image: 'assets/works/museum.svg',
    summary:
      'МСМ тэнхимийн түүх, багш нар, арга хэмжээ, оюутнуудын бүтээлийг нэг дор хадгалсан интерактив дижитал музей. Зочин, бүтээгч, админ гэсэн 3 түвшний эрхтэй.',
    highlights: [
      'Виртуал үзэсгэлэн: 3D галерейн коридор, ангилал бүрээр өрөө, аудио хөтөч',
      'Оюутны нэмсэн бүтээл «pending» төлөвт орж админ хянана (RLS)',
      'Хайлт, шүүлтүүр URL query-д хадгалагдана',
    ],
    stack: ['React 18', 'React Router', 'Supabase', 'RLS', 'Vercel'],
    live: 'https://ism-digital-museum.vercel.app',
    repo: 'https://github.com/khuln988/ism-digital-museum',
  },
  {
    flight: 'KH303',
    dest: 'LINQUIRE',
    title: 'Linquire — хувцасны дэлгүүр',
    date: '2026.10',
    gate: 'C3',
    status: 'ОНЛАЙН',
    image: 'assets/works/linquire.svg',
    summary:
      'Эмэгтэй хувцасны онлайн дэлгүүрийн нүүр хуудас. Ангиллаар сонгох, шинэ бараа, сагс, нэвтрэх цонхтой — ямар ч framework-гүй цэвэр HTML, CSS, JavaScript.',
    highlights: [
      'Playfair Display + DM Sans хослол, зөөлөн ягаавтар палитр',
      'Сагсанд нэмэх, нийт дүн тооцох логик JavaScript-ээр',
      'Гар утсанд зориулсан responsive grid',
    ],
    stack: ['HTML', 'CSS', 'JavaScript'],
    live: 'projects/linquire/',
    repo: '',
    repoNote: 'Эх код энэ портфолиогийн репо дотор',
  },
];

// Нисэх буудлын «зарлал» — хэсэг рүү ороход гарна
export const announcements = {
  hero: 'Terminal K-д тавтай морил. Таны хөтөч бол Хулан.',
  about: 'Паспорт шалгалт: ур чадварын тамга бүр дээр дарж дэлгэрэнгүйг үзээрэй.',
  works: 'KH101, KH202, KH303 нислэгүүд C хаалганаас хөөрөхөд бэлэн.',
  contact: 'Сүүлчийн дуудлага! Check-in ширээ нээлттэй байна.',
};
