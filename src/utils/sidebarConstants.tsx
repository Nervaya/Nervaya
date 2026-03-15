import { SIDEBAR_ICON_MAP } from '@/constants/icons';
import type { NavigationMenuGroup } from '@/types/navigation.types';
export const iconMap: Record<string, string> = SIDEBAR_ICON_MAP;

export interface SidebarNavItem {
  title: string;
  path: string;
  icon: string;
  isDashboard?: boolean;
}

export const sidebarBottomNavItems: SidebarNavItem[] = [];

export const sidebarMenuGroups: NavigationMenuGroup[] = [
  {
    title: 'GENERAL',
    items: [
      { title: 'Dashboard', path: '/dashboard', icon: 'FaChartPie' },
      { title: 'Sleep Assessment', path: '/sleep-assessment', icon: 'FaClipboardList' },
      { title: 'Shopping Cart', path: '/supplements/cart', icon: 'FaCartShopping' },
    ],
  },
  {
    title: 'THERAPY',
    items: [{ title: 'Therapy Corner', path: '/therapy-corner', icon: 'FaUsers' }],
  },
  {
    title: 'DRIFT OFF',
    items: [
      { title: 'Drift Off', path: '/drift-off', icon: 'FaBed' },
      { title: 'My Sessions', path: '/drift-off/sessions', icon: 'FaCalendarCheck' },
    ],
  },
  {
    title: 'SUPPLEMENTS',
    items: [{ title: 'Sleep Elixir', path: '/supplements', icon: 'FaPills' }],
  },
  {
    title: 'HELP',
    items: [
      { title: 'Support', path: '/support', icon: 'FaHeadset' },
      { title: 'Account', path: '/account', icon: 'FaUserDoctor' },
    ],
  },
];

export const adminMenuGroups: NavigationMenuGroup[] = [
  {
    title: 'Admin',
    items: [
      { title: 'Dashboard', path: '/admin/dashboard', icon: 'FaChartPie' },
      { title: 'Therapists', path: '/admin/therapists', icon: 'FaUserDoctor' },
      {
        title: 'Sleep Assessment',
        path: '/admin/sleep-assessment',
        icon: 'FaClipboardList',
      },
      { title: 'Drift Off', path: '/admin/drift-off', icon: 'FaBed' },
      { title: 'Supplements', path: '/admin/supplements', icon: 'FaPills' },
      { title: 'Orders', path: '/admin/orders', icon: 'FaBoxOpen' },
      { title: 'Sessions', path: '/admin/sessions', icon: 'FaCalendarCheck' },
      { title: 'Promo Codes', path: '/admin/promo-codes', icon: 'FaTag' },
      { title: 'Blogs', path: '/admin/blogs', icon: 'FaNewspaper' },
    ],
  },
];

export const therapistMenuGroups: NavigationMenuGroup[] = [
  {
    title: 'Therapist',
    items: [
      { title: 'Dashboard', path: '/therapist/dashboard', icon: 'FaChartPie' },
      { title: 'Set your dates', path: '/therapist/schedule', icon: 'FaCalendarCheck' },
      { title: 'Support', path: '/support', icon: 'FaHeadset' },
      { title: 'Account', path: '/account', icon: 'FaUserDoctor' },
    ],
  },
];
