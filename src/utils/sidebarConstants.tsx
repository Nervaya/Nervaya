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
      { title: 'Dashboard', path: '/dashboard', icon: 'FaChartPie', activePaths: ['/dashboard', '/'] },
      { title: 'Sleep Assessment', path: '/sleep-assessment', icon: 'FaClipboardList' },
      {
        title: 'Shopping Cart',
        path: '/cart',
        icon: 'FaCartShopping',
        activePaths: ['/cart', '/checkout', '/order-success'],
      },
    ],
  },
  {
    title: 'THERAPY',
    items: [{ title: 'Therapy Corner', path: '/therapy-corner', icon: 'FaUsers' }],
  },
  {
    title: 'DEEP REST',
    items: [
      { title: 'Deep Rest', path: '/deep-rest', icon: 'FaBed' },
      { title: 'My Sessions', path: '/deep-rest/sessions', icon: 'FaCalendarCheck' },
    ],
  },
  {
    title: 'SHOP',
    items: [{ title: 'Sleep Elixir', path: '/supplements', icon: 'FaPills' }],
  },
  {
    title: 'HELP',
    items: [
      { title: 'Support', path: '/support', icon: 'FaHeadset' },
      { title: 'Blogs', path: '/blog', icon: 'FaNewspaper' },
      { title: 'Feedback', path: '#feedback', icon: 'FaCommentDots' },
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
      { title: 'Deep Rest', path: '/admin/deep-rest', icon: 'FaBed' },
      { title: 'Supplements', path: '/admin/supplements', icon: 'FaPills' },
      { title: 'Orders', path: '/admin/orders', icon: 'FaBoxOpen' },
      { title: 'Sessions', path: '/admin/sessions', icon: 'FaCalendarCheck' },
      { title: 'Promo Codes', path: '/admin/promo-codes', icon: 'FaTag' },
      { title: 'Blogs', path: '/admin/blogs', icon: 'FaNewspaper' },
      { title: 'Reviews', path: '/admin/reviews', icon: 'FaStar' },
      { title: 'Feedback', path: '/admin/feedback', icon: 'FaCommentDots' },
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
