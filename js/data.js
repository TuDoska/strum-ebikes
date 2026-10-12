// Дані сайту: моделі, опції конфігуратора, ціни оренди
const BIKES = [
  { id: 'pulse', name: 'Pulse 2', type: 'city', color: '#d4ff3a', speed: 45, range: 70, battery: '48V 20Ah', motor: '1500 Вт', weight: 38, price: 62000, rent: 450, tag: 'Для міста', text: 'Легкий і тихий: щоденні поїздки й доставка без пробок.' },
  { id: 'metro', name: 'Metro Cargo', type: 'city', color: '#4fd1ff', speed: 40, range: 90, battery: '48V 30Ah', motor: '1200 Вт', weight: 44, price: 68000, rent: 500, tag: 'Курʼєрам', text: 'Багажник на 40 кг і батарея на цілу зміну.' },
  { id: 'ridge', name: 'Ridge 3000', type: 'offroad', color: '#ff7a3a', speed: 65, range: 80, battery: '60V 30Ah', motor: '3000 Вт', weight: 52, price: 98000, rent: 750, tag: 'Ендуро', text: 'Довгий хід підвіски для лісу, кару й піску.' },
  { id: 'boulder', name: 'Boulder X', type: 'offroad', color: '#a78bfa', speed: 75, range: 65, battery: '72V 35Ah', motor: '5000 Вт', weight: 58, price: 128000, rent: 950, tag: 'Потужний', text: 'Максимальний крутний момент для крутих підйомів.' },
  { id: 'flow', name: 'Flow Lite', type: 'city', color: '#ffd23a', speed: 35, range: 55, battery: '36V 15Ah', motor: '750 Вт', weight: 29, price: 44000, rent: 350, tag: 'Новачкам', text: 'Найлегший у лінійці, підійде для перших поїздок.' },
  { id: 'trail', name: 'Trail Hybrid', type: 'offroad', color: '#3affb2', speed: 55, range: 95, battery: '60V 40Ah', motor: '2000 Вт', weight: 49, price: 112000, rent: 850, tag: 'Універсал', text: 'І по місту, і на вихідні в Карпати.' },
];

const TYPES = { all: 'Усі', city: 'Місто', offroad: 'Бездоріжжя' };

// Конфігуратор кастомної збірки
const CONFIG = {
  base: 48000,
  frame: [
    { id: 'street', label: 'Street', price: 0, note: 'Низька посадка' },
    { id: 'enduro', label: 'Enduro', price: 9000, note: 'Висока, підсилена' },
    { id: 'cargo', label: 'Cargo', price: 6000, note: 'Посилений багажник' },
  ],
  motor: [
    { id: 1500, label: '1500 Вт', price: 0, speed: 45 },
    { id: 3000, label: '3000 Вт', price: 14000, speed: 60 },
    { id: 5000, label: '5000 Вт', price: 26000, speed: 75 },
  ],
  battery: [
    { id: 20, label: '20 Ah', price: 0, range: 60 },
    { id: 30, label: '30 Ah', price: 9000, range: 85 },
    { id: 40, label: '40 Ah', price: 17000, range: 110 },
  ],
  color: ['#d4ff3a', '#ff7a3a', '#4fd1ff', '#a78bfa', '#f4f4f0', '#ff4d6d'],
  extras: [
    { id: 'gps', label: 'GPS-трекер і застосунок', price: 2500 },
    { id: 'light', label: 'LED-фара 3000 лм', price: 1800 },
    { id: 'hydraulic', label: 'Гідравлічні гальма', price: 4200 },
  ],
};

// Оренда
const RENT = {
  discounts: [
    { from: 7, percent: 15, label: 'від 7 днів' },
    { from: 3, percent: 10, label: 'від 3 днів' },
  ],
  extras: [
    { id: 'helmet', label: 'Шолом', perDay: 50 },
    { id: 'battery2', label: 'Запасна батарея', perDay: 150 },
    { id: 'insurance', label: 'Страховка', perDay: 80 },
  ],
  deposit: 5000,
};

// Ілюстрація електробайка (SVG, малюється кодом)
function bikeSVG(color = '#d4ff3a', kind = 'city') {
  const off = kind === 'offroad' || kind === 'enduro';
  const tire = off ? 15 : 10;
  const r = off ? 58 : 52;
  const spokes = (cx) => Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    return `<line x1="${cx}" y1="190" x2="${(cx + Math.cos(a) * (r - tire)).toFixed(1)}" y2="${(190 + Math.sin(a) * (r - tire)).toFixed(1)}" stroke="#8a8a85" stroke-width="2"/>`;
  }).join('');
  return `<svg viewBox="0 0 440 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Електробайк">
    <ellipse cx="220" cy="258" rx="180" ry="10" fill="#000" opacity=".35"/>
    <g>
      <circle cx="95" cy="190" r="${r}" fill="none" stroke="#1d1d1b" stroke-width="${tire + 4}"/>
      <circle cx="95" cy="190" r="${r}" fill="none" stroke="#3a3a36" stroke-width="${tire}" ${off ? 'stroke-dasharray="6 5"' : ''}/>
      ${spokes(95)}<circle cx="95" cy="190" r="14" fill="#2a2a27" stroke="${color}" stroke-width="3"/>
      <circle cx="345" cy="190" r="${r}" fill="none" stroke="#1d1d1b" stroke-width="${tire + 4}"/>
      <circle cx="345" cy="190" r="${r}" fill="none" stroke="#3a3a36" stroke-width="${tire}" ${off ? 'stroke-dasharray="6 5"' : ''}/>
      ${spokes(345)}<circle cx="345" cy="190" r="10" fill="#2a2a27"/>
    </g>
    <path d="M95 190 L175 140 L250 150 L345 190" fill="none" stroke="#2a2a27" stroke-width="9" stroke-linecap="round"/>
    <path d="M175 140 L150 85 L300 78 L330 120 L345 190" fill="none" stroke="${color}" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M300 78 L318 40" stroke="#2a2a27" stroke-width="8" stroke-linecap="round"/>
    <path d="M300 40 L345 34" stroke="#2a2a27" stroke-width="7" stroke-linecap="round"/>
    <rect x="168" y="96" width="112" height="40" rx="12" fill="#1d1d1b" stroke="${color}" stroke-width="3"/>
    <path d="M214 104 l-8 14 h10 l-6 12 l16 -18 h-10 l6 -8z" fill="${color}"/>
    <path d="M115 70 q35 -14 70 0 v10 h-70z" fill="#1d1d1b"/>
    <path d="M150 85 L135 78" stroke="#2a2a27" stroke-width="8" stroke-linecap="round"/>
    <circle cx="225" cy="160" r="20" fill="#2a2a27" stroke="#4a4a45" stroke-width="3"/>
    <path d="M225 160 l18 22 h14" stroke="#4a4a45" stroke-width="5" fill="none" stroke-linecap="round"/>
    ${off ? '<path d="M330 120 l18 -8" stroke="#2a2a27" stroke-width="6"/>' : '<path d="M330 118 h-34" stroke="#2a2a27" stroke-width="5"/>'}
    <circle cx="352" cy="62" r="7" fill="#fffbe0"/><path d="M359 62 l40 -10 v20z" fill="#fffbe0" opacity=".18"/>
  </svg>`;
}
