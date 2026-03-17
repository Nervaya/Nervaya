export interface BottomNavItem {
  title: string;
  path: string;
  icon: string;
}

export const primaryNavItems: BottomNavItem[] = [
  { title: 'Dashboard', path: '/dashboard', icon: 'FaChartPie' },
  { title: 'Questionnaire', path: '/sleep-assessment', icon: 'FaClipboardList' },
  { title: 'Therapy', path: '/therapy-corner', icon: 'FaUsers' },
  { title: 'Cart', path: '/supplements/cart', icon: 'FaCartShopping' },
];

export const moreNavItems: BottomNavItem[] = [
  { title: 'Drift Off', path: '/drift-off', icon: 'FaBed' },
  { title: 'Supplements', path: '/supplements', icon: 'FaPills' },
  { title: 'Account', path: '/account', icon: 'FaUserDoctor' },
];
