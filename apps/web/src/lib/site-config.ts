export const siteConfig = {
  name: 'Lesso',
  tagline: 'Less cost. More care.',
  hostname: 'https://lesso.clinic',
  locales: ['en', 'th'] as const,
  defaultLocale: 'en' as const,
  description: {
    en: 'Aesthetic clinic backoffice that lowers cost and raises care.',
    th: 'ระบบหลังบ้านคลินิกความงามที่ลดต้นทุน เพิ่มคุณภาพการดูแล',
  },
} as const;

export type Locale = (typeof siteConfig.locales)[number];
