import { SIDEBAR_ICON_MAP } from '@/constants/icons';
import type { NavigationMenuGroup } from '@/types/navigation.types';

// Re-export icon map for backward compatibility during migration
// iconMap now returns Iconify icon ID strings instead of React elements
export const iconMap: Record<string, string> = SIDEBAR_ICON_MAP;

export interface SidebarNavItem {
  title: string;
  path: string;
  icon: string;
  isDashboard?: boolean;
}

export const sidebarBottomNavItems: SidebarNavItem[] = [
  {
    title: 'Feedback',
    path: '/support',
    icon: 'FaRegCommentDots',
  },
];

export const sidebarMenuGroups: NavigationMenuGroup[] = [
  {
    title: 'General',
    items: [
      { title: 'Dashboard', path: '/dashboard', icon: 'FaChartPie' },
      {
        title: 'Questionnaire',
        path: '/sleep-assessment',
        icon: 'FaClipboardList',
      },
    ],
  },
  {
    title: 'Sleep',
    items: [
      { title: 'Drift Off', path: '/drift-off', icon: 'FaBed' },
      { title: 'My Session', path: '/drift-off/my-session', icon: 'FaHeadphones' },
    ],
  },
  {
    title: 'Shop',
    items: [
      { title: 'Supplements', path: '/supplements', icon: 'FaPills' },
      { title: 'Cart', path: '/supplements/cart', icon: 'FaCartShopping' },
    ],
  },
  {
    title: 'Support',
    items: [
      {
        title: 'Therapy Corner',
        path: '/therapy-corner',
        icon: 'FaUserDoctor',
      },
      { title: 'Support', path: '/support', icon: 'FaHeadset' },
      { title: 'Account', path: '/account', icon: 'FaUsers' },
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
