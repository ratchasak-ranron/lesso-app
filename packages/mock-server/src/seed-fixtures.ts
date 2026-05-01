/**
 * Deterministic seed data generators.
 * Uses a simple seeded PRNG so reloads produce identical data without needing
 * a heavy dep. Not cryptographic; intentional.
 */

const TH_FIRST_NAMES = [
  'Anong',
  'Mali',
  'Som',
  'Ploy',
  'Nat',
  'Pim',
  'Tip',
  'Fern',
  'Khai',
  'Tan',
  'Mint',
  'Ying',
  'Aim',
  'Bow',
  'Cake',
  'Mai',
  'Praew',
  'Noey',
  'Bell',
  'Pang',
];

const TH_LAST_NAMES = [
  'Sornchai',
  'Wanichakul',
  'Saetang',
  'Phromchai',
  'Kongsap',
  'Boonrueng',
  'Ratanakul',
  'Suthep',
  'Phaisit',
  'Charoen',
  'Sirisuk',
  'Phongphat',
  'Anantachai',
  'Promkaew',
];

const SERVICES = [
  'Botox',
  'Filler',
  'Laser hair removal',
  'IPL',
  'Mesotherapy',
  'HIFU',
  'Thermage',
  'Skin booster',
  'Chemical peel',
  'Microneedling',
];

const HONORIFICS = ['Khun', 'K.'];

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
  return `${honor} ${first} ${last}`;
}

export function genServiceName(rng: () => number): string {
  return pick(rng, SERVICES);
}

export function makeRng(seed: number): () => number {
  return mulberry32(seed);
}

export { uuidFromSeed };
