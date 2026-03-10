import type { BreadcrumbItem } from '@/components/common/Breadcrumbs';

const SEGMENT_LABELS: Record<string, string> = {
  supplements: 'Supplements',
  cart: 'Cart',
  checkout: 'Checkout',
  'order-success': 'Order Success',
  dashboard: 'Dashboard',
  account: 'Account',
  profile: 'Profile',
  'sleep-assessment': 'Sleep Assessment',
  'drift-off': 'Drift Off',
  'therapy-corner': 'Therapy Corner',
  support: 'Support',
  blog: 'Blog',
  'about-us': 'About Us',
  'privacy-policy': 'Privacy Policy',
  admin: 'Admin',
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
  '/admin/drift-off/questions',
  '/admin/drift-off/questions/edit',
  '/admin/therapists/edit',
  '/supplements/order-success',
]);

export function getBreadcrumbsForPath(pathname: string): BreadcrumbItem[] {
  const clean = pathname.replace(/\/$/, '') || '/';
  if (clean === '/') {
    return [{ label: 'Home', href: '/' }];
  }

  const segments = clean.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];
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
