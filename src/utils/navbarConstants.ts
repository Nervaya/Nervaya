export interface NavbarLink {
  text: string;
  href: string;
}

export const NAVBAR_PRODUCTS_LINKS: NavbarLink[] = [
  { text: 'Therapy Corner', href: '/therapy-corner' },
  { text: 'Deep Rest Sessions', href: '/drift-off' },
  { text: 'Sleep Elixir', href: '/sleep-elixir' },
  { text: 'Supplements', href: '/supplements' },
];

export const NAVBAR_ACCOUNT_LINKS: NavbarLink[] = [{ text: 'Settings', href: '/account' }];
