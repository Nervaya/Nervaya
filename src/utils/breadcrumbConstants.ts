import { type BreadcrumbItem } from '@/components/common';

const SEGMENT_LABELS: Record<string, string> = {
  supplements: 'Supplements',
  cart: 'Cart',
  checkout: 'Checkout',
  'order-success': 'Order Success',
  dashboard: 'Dashboard',
  account: 'Account',
  profile: 'Profile',
  'sleep-assessment': 'Sleep Assessment',
  'deep-rest': 'Deep Rest',
  'drift-off': 'Deep Rest',
  'therapy-corner': 'Therapy Corner',
  support: 'Support',
  blog: 'Blog',
  'about-us': 'About Us',
  'privacy-policy': 'Privacy Policy',
  admin: 'Admin',
  therapist: 'Therapist',
  therapists: 'Therapists',
  settings: 'Settings',
  users: 'Users',
  billing: 'Billing',
  blogs: 'Blogs',
  add: 'Add',
  edit: 'Edit',
  feedback: 'Feedback',
};

function segmentToLabel(segment: string): string {
  const key = segment.toLowerCase();
  return SEGMENT_LABELS[key] ?? segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
}

function isDynamicSegment(segment: string): boolean {
  if (/^[a-f0-9]{24}$/i.test(segment)) {
    return true;
  }
  if (/^[a-f0-9-]{20,}$/i.test(segment)) {
    return true;
  }
  return false;
}

const UNAVAILABLE_ROUTES = new Set([
  '/admin',
  '/admin/blogs/edit',
  '/admin/supplements/edit',
  '/admin/sleep-assessment/edit',
  '/admin/deep-rest/questions',
  '/admin/deep-rest/questions/edit',
  '/admin/drift-off/questions',
  '/admin/drift-off/questions/edit',
  '/admin/therapists/edit',
  '/cart',
  '/order-success',
]);

export function getBreadcrumbsForPath(pathname: string): BreadcrumbItem[] {
  const clean = pathname.replace(/\/$/, '') || '/';
  if (clean === '/') {
    return [{ label: 'Home', href: '/dashboard' }];
  }

  const segments = clean.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [{ label: 'Home', href: '/dashboard' }];
  let href = '';

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    href += `/${segment}`;
    const isLast = i === segments.length - 1;
    const label = isDynamicSegment(segment) ? 'Details' : segmentToLabel(segment);

    items.push({
      label,
      href: isLast || UNAVAILABLE_ROUTES.has(href) || isDynamicSegment(segment) ? undefined : href,
    });
  }

  return items;
}
