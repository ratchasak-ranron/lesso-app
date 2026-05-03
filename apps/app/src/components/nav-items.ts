import {
  BarChart3,
  Building2,
  Calendar,
  GraduationCap,
  Home,
  Package,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';

// Per-section accent token. Maps to color tokens defined in
// packages/ui-tokens/src/css/tokens.css. Used for left-border, eyebrow,
// active-state tint, and KPI-strip color so each section has a memorable
// signature color while body content remains bone+slate.
export type SectionAccent = 'honey' | 'ink-blue' | 'sage' | 'leaf' | 'slate' | 'clay';

export interface NavItem {
  to:
    | '/'
    | '/patients'
    | '/appointments'
    | '/courses'
    | '/inventory'
    | '/branches'
    | '/reports'
    | '/audit';
  icon: LucideIcon;
  labelKey:
    | 'nav.today'
    | 'nav.patients'
    | 'nav.appointments'
    | 'nav.courses'
    | 'nav.inventory'
    | 'nav.branches'
    | 'nav.reports'
    | 'nav.audit';
  exact: boolean;
  primary: boolean; // shown in `<sm` bottom-tab dock
  accent: SectionAccent;
}

export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { to: '/', icon: Home, labelKey: 'nav.today', exact: true, primary: true, accent: 'honey' },
  {
    to: '/patients',
    icon: Users,
    labelKey: 'nav.patients',
    exact: false,
    primary: true,
    accent: 'ink-blue',
  },
  {
    to: '/appointments',
    icon: Calendar,
    labelKey: 'nav.appointments',
    exact: false,
    primary: true,
    accent: 'sage',
  },
  {
    to: '/courses',
    icon: GraduationCap,
    labelKey: 'nav.courses',
    exact: false,
    primary: false,
    accent: 'leaf',
  },
  {
    to: '/inventory',
    icon: Package,
    labelKey: 'nav.inventory',
    exact: false,
    primary: false,
    accent: 'clay',
  },
  {
    to: '/branches',
    icon: Building2,
    labelKey: 'nav.branches',
    exact: false,
    primary: false,
    accent: 'sage',
  },
  {
    to: '/reports',
    icon: BarChart3,
    labelKey: 'nav.reports',
    exact: false,
    primary: true,
    accent: 'slate',
  },
  {
    to: '/audit',
    icon: ShieldCheck,
    labelKey: 'nav.audit',
    exact: false,
    primary: false,
    accent: 'slate',
  },
];

// Tailwind class lookup per accent. Lazy strings for safelist purposes —
// keep these as full literals so Tailwind's JIT picks them up at build.
export const ACCENT_CLASSES: Record<
  SectionAccent,
  {
    text: string;
    bg: string;
    border: string;
    softBg: string;
    activeBg: string;
    activeText: string;
  }
> = {
  honey: {
    text: 'text-honey-ink',
    bg: 'bg-honey',
    border: 'border-l-honey',
    softBg: 'bg-honey-soft',
    activeBg: 'bg-honey-soft',
    activeText: 'text-honey-ink',
  },
  'ink-blue': {
    text: 'text-ink-blue',
    bg: 'bg-ink-blue',
    border: 'border-l-ink-blue',
    softBg: 'bg-ink-blue-soft',
    activeBg: 'bg-ink-blue-soft',
    activeText: 'text-ink-blue',
  },
  sage: {
    text: 'text-secondary',
    bg: 'bg-secondary',
    border: 'border-l-secondary',
    softBg: 'bg-muted',
    activeBg: 'bg-secondary/15',
    activeText: 'text-secondary',
  },
  leaf: {
    text: 'text-leaf-ink',
    bg: 'bg-leaf',
    border: 'border-l-leaf',
    softBg: 'bg-leaf-soft',
    activeBg: 'bg-leaf-soft',
    activeText: 'text-leaf-ink',
  },
  slate: {
    text: 'text-primary',
    bg: 'bg-primary',
    border: 'border-l-primary',
    softBg: 'bg-muted',
    activeBg: 'bg-primary/10',
    activeText: 'text-primary',
  },
  clay: {
    text: 'text-destructive',
    bg: 'bg-destructive',
    border: 'border-l-destructive',
    softBg: 'bg-destructive/10',
    activeBg: 'bg-destructive/10',
    activeText: 'text-destructive',
  },
};
