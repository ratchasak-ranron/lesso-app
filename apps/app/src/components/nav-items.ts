import {
  BarChart3,
  Building2,
  Calendar,
  GraduationCap,
  Home,
  Package,
  PackageSearch,
  ScrollText,
  ShieldCheck,
  Stethoscope,
  Tag,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

// Per-section accent token. Maps to color tokens defined in
// packages/ui-tokens/src/css/tokens.css. Used for left-border,
// dot indicator, active-state tint, and KPI-strip color so each section
// has a memorable signature color while body content stays neutral.
export type SectionAccent =
  | 'indigo'
  | 'sky'
  | 'emerald'
  | 'violet'
  | 'amber'
  | 'rose'
  | 'zinc';

/**
 * Sidebar section a nav item belongs to. Items with the same group are
 * rendered as a contiguous block with an optional uppercase label
 * (shown only in the expanded rail).
 */
export type NavGroup = 'operations' | 'catalog' | 'organization' | 'finance' | 'insights';

export interface NavItem {
  to:
    | '/'
    | '/patients'
    | '/appointments'
    | '/courses'
    | '/inventory'
    | '/products'
    | '/promotions'
    | '/doctors'
    | '/branches'
    | '/expenses'
    | '/reports'
    | '/audit'
    | '/consent';
  icon: LucideIcon;
  labelKey:
    | 'nav.today'
    | 'nav.patients'
    | 'nav.appointments'
    | 'nav.courses'
    | 'nav.inventory'
    | 'nav.products'
    | 'nav.promotions'
    | 'nav.doctors'
    | 'nav.branches'
    | 'nav.expenses'
    | 'nav.reports'
    | 'nav.audit'
    | 'nav.consent';
  exact: boolean;
  primary: boolean; // shown in `<sm` bottom-tab dock
  accent: SectionAccent;
  group: NavGroup;
}

export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  // Operations — daily clinic flow.
  {
    to: '/',
    icon: Home,
    labelKey: 'nav.today',
    exact: true,
    primary: true,
    accent: 'indigo',
    group: 'operations',
  },
  {
    to: '/patients',
    icon: Users,
    labelKey: 'nav.patients',
    exact: false,
    primary: true,
    accent: 'sky',
    group: 'operations',
  },
  {
    to: '/appointments',
    icon: Calendar,
    labelKey: 'nav.appointments',
    exact: false,
    primary: true,
    accent: 'emerald',
    group: 'operations',
  },
  {
    to: '/courses',
    icon: GraduationCap,
    labelKey: 'nav.courses',
    exact: false,
    primary: false,
    accent: 'violet',
    group: 'operations',
  },
  // Catalog — master data the front desk picks from.
  {
    to: '/products',
    icon: PackageSearch,
    labelKey: 'nav.products',
    exact: false,
    primary: false,
    accent: 'indigo',
    group: 'catalog',
  },
  {
    to: '/promotions',
    icon: Tag,
    labelKey: 'nav.promotions',
    exact: false,
    primary: false,
    accent: 'amber',
    group: 'catalog',
  },
  {
    to: '/inventory',
    icon: Package,
    labelKey: 'nav.inventory',
    exact: false,
    primary: false,
    accent: 'rose',
    group: 'catalog',
  },
  // Organization — clinical roster + branches.
  {
    to: '/doctors',
    icon: Stethoscope,
    labelKey: 'nav.doctors',
    exact: false,
    primary: false,
    accent: 'sky',
    group: 'organization',
  },
  {
    to: '/branches',
    icon: Building2,
    labelKey: 'nav.branches',
    exact: false,
    primary: false,
    accent: 'emerald',
    group: 'organization',
  },
  // Finance — money out + payroll-ish ledgers.
  {
    to: '/expenses',
    icon: Wallet,
    labelKey: 'nav.expenses',
    exact: false,
    primary: false,
    accent: 'amber',
    group: 'finance',
  },
  // Insights — reporting + compliance.
  {
    to: '/reports',
    icon: BarChart3,
    labelKey: 'nav.reports',
    exact: false,
    primary: true,
    accent: 'zinc',
    group: 'insights',
  },
  {
    to: '/audit',
    icon: ScrollText,
    labelKey: 'nav.audit',
    exact: false,
    primary: false,
    accent: 'zinc',
    group: 'insights',
  },
  {
    to: '/consent',
    icon: ShieldCheck,
    labelKey: 'nav.consent',
    exact: false,
    primary: false,
    accent: 'zinc',
    group: 'insights',
  },
];

/** Display order + label key for each group header. */
export const NAV_GROUPS: ReadonlyArray<{ group: NavGroup; labelKey: string }> = [
  { group: 'operations', labelKey: 'nav.group.operations' },
  { group: 'catalog', labelKey: 'nav.group.catalog' },
  { group: 'organization', labelKey: 'nav.group.organization' },
  { group: 'finance', labelKey: 'nav.group.finance' },
  { group: 'insights', labelKey: 'nav.group.insights' },
];

// Tailwind class lookup per accent. Each accent provides a dot color
// (filled bg), text-safe (-ink), and a soft wash for active-tab bg.
// Strings are full literals so Tailwind's JIT picks them up at build.
export const ACCENT_CLASSES: Record<
  SectionAccent,
  {
    /** Solid surface fill — dots, indicator pills */
    bg: string;
    /** Text-safe variant for icon/label color */
    text: string;
    /** Left-border for KPI tile or banner */
    border: string;
    /** Wash background for active nav, KPI strip, badge */
    softBg: string;
    /** Active nav-item background */
    activeBg: string;
    /** Active nav-item text/icon color */
    activeText: string;
  }
> = {
  indigo: {
    bg: 'bg-indigo',
    text: 'text-indigo-ink',
    border: 'border-l-indigo',
    softBg: 'bg-indigo-soft',
    activeBg: 'bg-indigo-soft',
    activeText: 'text-indigo-ink',
  },
  sky: {
    bg: 'bg-sky',
    text: 'text-sky-ink',
    border: 'border-l-sky',
    softBg: 'bg-sky-soft',
    activeBg: 'bg-sky-soft',
    activeText: 'text-sky-ink',
  },
  emerald: {
    bg: 'bg-emerald',
    text: 'text-emerald-ink',
    border: 'border-l-emerald',
    softBg: 'bg-emerald-soft',
    activeBg: 'bg-emerald-soft',
    activeText: 'text-emerald-ink',
  },
  violet: {
    bg: 'bg-violet',
    text: 'text-violet-ink',
    border: 'border-l-violet',
    softBg: 'bg-violet-soft',
    activeBg: 'bg-violet-soft',
    activeText: 'text-violet-ink',
  },
  amber: {
    bg: 'bg-amber',
    text: 'text-amber-ink',
    border: 'border-l-amber',
    softBg: 'bg-amber-soft',
    activeBg: 'bg-amber-soft',
    activeText: 'text-amber-ink',
  },
  rose: {
    bg: 'bg-rose',
    text: 'text-rose-ink',
    border: 'border-l-rose',
    softBg: 'bg-rose-soft',
    activeBg: 'bg-rose-soft',
    activeText: 'text-rose-ink',
  },
  zinc: {
    bg: 'bg-foreground',
    text: 'text-foreground',
    border: 'border-l-foreground',
    softBg: 'bg-muted',
    activeBg: 'bg-muted',
    activeText: 'text-foreground',
  },
};
