export interface FooterLink {
  text: string;
  href: string;
}

export interface FooterLinkGroup {
  links: FooterLink[];
}

export const FOOTER_LINK_GROUPS: FooterLinkGroup[] = [
  {
    links: [
      { text: 'Therapy', href: '/therapy' },
      { text: 'Drift Off', href: '/drift-off' },
      { text: 'Sleep Elixir', href: '/sleep-elixir' },
      { text: 'Blog', href: '/blog' },
    ],
  },
  {
    links: [
      { text: 'About Us', href: '/about-us' },
      { text: 'Privacy Policy', href: '/privacy-policy' },
      { text: 'Terms & Cond.', href: '/terms-and-conditions' },
      { text: 'Delivery Policy', href: '/delivery-policy' },
    ],
  },
  {
    links: [
      { text: 'For Therapists', href: '/for-therapists' },
      { text: 'For Counselors', href: '/for-counselors' },
      { text: 'For Yoga Trainers', href: '/for-yoga-trainers' },
    ],
  },
];

export const SOCIAL_LINKS = [
  { name: 'linked_in', icon: './icons/linked_in.svg', alt: 'linked_in' },
  { name: 'twitter', icon: './icons/twitter.svg', alt: 'twitter' },
  { name: 'instagram', icon: './icons/instagram.svg', alt: 'instagram' },
] as const;
