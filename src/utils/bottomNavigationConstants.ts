export interface BottomNavItem {
  title: string;
  path: string;
  icon: string;
}

export const primaryNavItems: BottomNavItem[] = [
  { title: 'Dashboard', path: '/dashboard', icon: 'FaChartPie' },
  { title: 'Questionnaire', path: '/sleep-assessment', icon: 'FaClipboardList' },
  { title: 'Therapy', path: '/therapy-corner', icon: 'FaUsers' },
  { title: 'Cart', path: '/cart', icon: 'FaCartShopping' },
];

export const moreNavItems: BottomNavItem[] = [
  { title: 'Deep Rest', path: '/deep-rest', icon: 'FaBed' },
  { title: 'Supplements', path: '/supplements', icon: 'FaPills' },
  { title: 'Account', path: '/account', icon: 'FaUserDoctor' },
];
