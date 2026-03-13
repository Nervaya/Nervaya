export interface BottomNavItem {
  title: string;
  path: string;
  icon: string;
}

export const primaryNavItems: BottomNavItem[] = [
  { title: 'Dashboard', path: '/dashboard', icon: 'FaChartPie' },
  { title: 'Drift Off', path: '/drift-off', icon: 'FaBed' },
  { title: 'Therapy', path: '/therapy-corner', icon: 'FaUsers' },
  { title: 'Cart', path: '/supplements/cart', icon: 'FaCartShopping' },
];

export const moreNavItems: BottomNavItem[] = [
  { title: 'Questionnaire', path: '/sleep-assessment', icon: 'FaClipboardList' },
  { title: 'Supplements', path: '/supplements', icon: 'FaPills' },
  { title: 'Account', path: '/account', icon: 'FaUserDoctor' },
];
