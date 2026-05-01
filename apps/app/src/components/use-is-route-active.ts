import { useLocation } from '@tanstack/react-router';
import type { NavItem } from './nav-items';

/**
 * Sole source of truth for "is this nav item currently active". Sidebar,
 * MobileNav, and BottomTabBar all consume this hook so a single rule
 * decides both the visual highlight and the `aria-current` attribute.
 */
export function useIsRouteActive(item: Pick<NavItem, 'to' | 'exact'>): boolean {
  const { pathname } = useLocation();
  const { to, exact } = item;
  if (exact) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}
