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
}

export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { to: '/', icon: Home, labelKey: 'nav.today', exact: true, primary: true },
  { to: '/patients', icon: Users, labelKey: 'nav.patients', exact: false, primary: true },
  {
    to: '/appointments',
    icon: Calendar,
    labelKey: 'nav.appointments',
    exact: false,
    primary: true,
  },
  { to: '/courses', icon: GraduationCap, labelKey: 'nav.courses', exact: false, primary: false },
  { to: '/inventory', icon: Package, labelKey: 'nav.inventory', exact: false, primary: false },
  { to: '/branches', icon: Building2, labelKey: 'nav.branches', exact: false, primary: false },
  { to: '/reports', icon: BarChart3, labelKey: 'nav.reports', exact: false, primary: true },
  { to: '/audit', icon: ShieldCheck, labelKey: 'nav.audit', exact: false, primary: false },
];
