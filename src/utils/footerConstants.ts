export interface FooterLink {
  text: string;
  href: string;
}

export interface FooterLinkGroup {
  title: string;
  links: FooterLink[];
}

export const FOOTER_LINK_GROUPS: FooterLinkGroup[] = [
  {
    title: 'Products',
    links: [
      { text: 'Therapy', href: '/therapy' },
      { text: 'Drift Off', href: '/drift-off' },
      { text: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Company',
    links: [
      { text: 'About Us', href: '/about-us' },
      { text: 'Privacy Policy', href: '/privacy-policy' },
      { text: 'Terms & Cond.', href: '/terms-and-conditions' },
      { text: 'Delivery Policy', href: '/delivery-policy' },
    ],
  },
  {
    title: 'For Professionals',
    links: [
      { text: 'For Therapists', href: '/for-therapists' },
      { text: 'For Counselors', href: '/for-counselors' },
      { text: 'For Yoga Trainers', href: '/for-yoga-trainers' },
    ],
  },
];

export const SOCIAL_LINKS = [
  { name: 'linkedin', icon: '/icons/linked_in.svg', alt: 'LinkedIn', href: 'https://www.linkedin.com' },
  { name: 'x', icon: '/icons/twitter.svg', alt: 'X (Twitter)', href: 'https://x.com' },
  { name: 'instagram', icon: '/icons/instagram.svg', alt: 'Instagram', href: 'https://www.instagram.com' },
] as const;
