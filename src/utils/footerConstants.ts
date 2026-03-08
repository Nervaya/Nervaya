export interface FooterLink {
  text: string;
  href: string;
  isHeading?: boolean;
}

export interface FooterLinkGroup {
  title: string;
  links: FooterLink[];
}

export const FOOTER_LINK_GROUPS: FooterLinkGroup[] = [
  {
    title: 'Products',
    links: [
      { text: 'Therapy Corner', href: '/therapy-corner' },
      { text: 'Drift Off', href: '/drift-off' },
      { text: 'Supplements', href: '/supplements' },
    ],
  },
  {
    title: 'Company',
    links: [
      { text: 'About Us', href: '/about-us', isHeading: true },
      { text: 'Delivery Policy', href: '/delivery-policy' },
      { text: 'Privacy Policy', href: '/privacy-policy' },
      { text: 'T & C', href: '/terms-and-conditions' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { text: 'Support Center', href: '/support' },
      { text: 'Sleep Assessment', href: '/sleep-assessment' },
      { text: 'Blog', href: '/blog' },
    ],
  },
];

export const SOCIAL_LINKS = [
  { name: 'linkedin', icon: '/icons/linked_in.svg', alt: 'LinkedIn', href: 'https://www.linkedin.com' },
  { name: 'x', icon: '/icons/twitter.svg', alt: 'X (Twitter)', href: 'https://x.com' },
  { name: 'instagram', icon: '/icons/instagram.svg', alt: 'Instagram', href: 'https://www.instagram.com' },
] as const;
