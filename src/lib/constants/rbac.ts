import { ROLES, Role } from '@/lib/constants/roles';
import { ADMIN_ROUTES, PROTECTED_ROUTES } from '@/utils/routesConstants';

/**
 * Check if the user has the given role.
 */
export function hasRole(user: { role: Role } | null, role: Role): boolean {
  if (!user) return false;
  return user.role === role;
}

/**
 * Check if the role can access admin-only routes.
 */
export function canAccessAdminRoute(role: Role): boolean {
  return role === ROLES.ADMIN;
}

/**
 * Get allowed roles for a path, or null if path is public.
 */
export function getAllowedRolesForRoute(path: string): Role[] | null {
  if (ADMIN_ROUTES.some((route) => path.startsWith(route))) {
    return [ROLES.ADMIN];
  }
  if (PROTECTED_ROUTES.some((route) => path.startsWith(route))) {
    return [ROLES.ADMIN, ROLES.CUSTOMER];
  }
  return null;
}
