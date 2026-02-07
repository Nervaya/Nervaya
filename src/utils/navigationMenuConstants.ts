export interface NavigationMenuItem {
  title: string;
  path: string;
  icon: string;
}

export interface NavigationMenuGroup {
  title: string;
  items: NavigationMenuItem[];
}

export const BASE_MENU_ITEMS: NavigationMenuGroup[] = [
  {
    title: 'GENERAL',
    items: [
      { title: 'Sleep Assessment', path: '/sleep-assessment', icon: 'FaBed' },
      { title: 'Shopping Cart', path: '/supplements/cart', icon: 'FaShoppingCart' },
    ],
  },
  {
    title: 'THERAPY',
    items: [{ title: 'Therapy Corner', path: '/therapy-corner', icon: 'FaHeartbeat' }],
  },
  {
    title: 'DRIFT OFF',
    items: [{ title: 'Deep Rest Sessions', path: '/drift-off', icon: 'FaBed' }],
  },
  {
    title: 'SUPPLEMENTS',
    items: [{ title: 'Sleep Elixir', path: '/sleep-elixir', icon: 'FaBed' }],
  },
  {
    title: 'HELP',
    items: [
      {
        title: 'Free 1 on 1 Assistance',
        path: '/support',
        icon: 'FaHeadset',
      },
      { title: 'Customer Support', path: '/support', icon: 'FaHeadset' },
    ],
  },
];

export const ADMIN_MENU_GROUP: NavigationMenuGroup = {
  title: 'ADMIN',
  items: [
    { title: 'Dashboard', path: '/admin/dashboard', icon: 'FaHome' },
    { title: 'Manage Therapists', path: '/admin/therapists', icon: 'FaUserMd' },
    { title: 'Settings', path: '/admin/settings', icon: 'FaCog' },
    { title: 'Users', path: '/admin/users', icon: 'FaUsers' },
    { title: 'Billing', path: '/admin/billing', icon: 'FaRupeeSign' },
  ],
};
