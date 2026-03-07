export interface FooterLink {
  text: string;
  href: string;
  isHeading?: boolean;
}

export interface FooterLinkGroup {
  links: FooterLink[];
}

export const FOOTER_LINK_GROUPS: FooterLinkGroup[] = [
  {
    links: [
      { text: 'Therapy', href: '/therapy', isHeading: true },
      { text: 'Drift Off', href: '/drift-off' },
      { text: 'Sleep Elixir', href: '/supplements' },
      { text: 'Blog', href: '/blog' },
    ],
  },
  {
    links: [
      { text: 'About Us', href: '/about-us', isHeading: true },
      { text: 'Delivery Policy', href: '/delivery-policy' },
      { text: 'Privacy Policy', href: '/privacy-policy' },
      { text: 'T & C', href: '/terms-and-conditions' },
    ],
  },
  {
    links: [
      { text: 'For Therapists', href: '/for-therapists', isHeading: true },
      { text: 'For Counselors', href: '/for-counselors' },
      { text: 'For Yoga Trainers', href: '/for-yoga-trainers' },
    ],
  },
];

export const SOCIAL_LINKS = [
  { name: 'linked_in', icon: '/icons/linked_in.svg', alt: 'LinkedIn' },
  { name: 'twitter', icon: '/icons/twitter.svg', alt: 'X / Twitter' },
  { name: 'instagram', icon: '/icons/instagram.svg', alt: 'Instagram' },
] as const;
