/**
 * Deterministic seed data generators.
 *
 * All output is Thai-script — names, services, honorifics — so a Thai
 * clinic operator running the prototype sees realistic data, not
 * transliterated placeholders. Technical abbreviations that are read in
 * English in real Thai clinics (IPL, HIFU, RF) are kept as-is.
 *
 * Uses a simple seeded PRNG so reloads produce identical data without
 * needing a heavy dep. Not cryptographic; intentional.
 */

const TH_FIRST_NAMES = [
  'อนงค์',
  'มะลิ',
  'สม',
  'พลอย',
  'ณัฐ',
  'พิม',
  'ทิพย์',
  'เฟิร์น',
  'ขวัญ',
  'แทน',
  'มินท์',
  'หญิง',
  'เอม',
  'โบว์',
  'เค้ก',
  'ใหม่',
  'แพรว',
  'เนย',
  'เบลล์',
  'แป้ง',
];

const TH_LAST_NAMES = [
  'ศรชัย',
  'วาณิชกุล',
  'แซ่ตั้ง',
  'พรหมชัย',
  'คงทรัพย์',
  'บุญเรือง',
  'รัตนกุล',
  'สุเทพ',
  'ไพศาล',
  'เจริญ',
  'ศิริสุข',
  'พงษ์พัฒน์',
  'อนันตชัย',
  'พรหมแก้ว',
];

// Service names — Thai script for descriptive procedures, kept as
// abbreviations for terms that are universally read in English at Thai
// clinics (IPL, HIFU, RF). Matches how front-desk staff actually speak.
const SERVICES = [
  'โบท็อกซ์',
  'ฟิลเลอร์',
  'กำจัดขนด้วยเลเซอร์',
  'IPL',
  'เมโสเทอราพี',
  'HIFU',
  'เธอร์มาจ',
  'สกินบูสเตอร์',
  'ผลัดเซลล์ผิว',
  'ไมโครนีดเดิ้ลลิ่ง',
];

const HONORIFICS = ['คุณ', 'ค.'];

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function rand(): number {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: ReadonlyArray<T>): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

function uuidFromSeed(seed: number, salt: string): string {
  // Build a deterministic UUID-shaped string. Not cryptographic — for fixtures only.
  const rng = mulberry32(seed + salt.length * 1000);
  const hex = (n: number) => Math.floor(rng() * 16 ** n).toString(16).padStart(n, '0');
  return `${hex(8)}-${hex(4)}-4${hex(3)}-8${hex(3)}-${hex(12)}`;
}

export function genThaiPhone(rng: () => number): { digits: string; display: string } {
  const second = Math.floor(rng() * 9) + 1;
  const rest = Math.floor(rng() * 90_000_000 + 10_000_000)
    .toString()
    .padStart(8, '0');
  const digits = `0${second}${rest}`;
  const display = `0${second}${rest.slice(0, 1)}-${rest.slice(1, 4)}-${rest.slice(4)}`;
  return { digits, display };
}

export function genFullName(rng: () => number): string {
  const honor = pick(rng, HONORIFICS);
  const first = pick(rng, TH_FIRST_NAMES);
  const last = pick(rng, TH_LAST_NAMES);
  return `${honor}${first} ${last}`;
}

export function genServiceName(rng: () => number): string {
  return pick(rng, SERVICES);
}

export function makeRng(seed: number): () => number {
  return mulberry32(seed);
}

export { uuidFromSeed };
