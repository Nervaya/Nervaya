import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/utils/jwt.util';
import { ROLES, Role } from '@/lib/constants/roles';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { BASE_MENU_ITEMS, ADMIN_MENU_GROUP } from '@/utils/navigationMenuConstants';
import { COOKIE_NAMES } from '@/utils/cookieConstants';
import { NavigationMenuGroup } from '@/types/navigation.types';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAMES.AUTH_TOKEN)?.value;
    let role: Role = ROLES.CUSTOMER;

    if (token) {
      const decoded = await verifyToken(token);
      if (decoded && decoded.role) {
        role = decoded.role as Role;
      }
    }

    let menuItems: NavigationMenuGroup[];

    if (role === ROLES.ADMIN) {
      // Admins only see admin menu items
      menuItems = [ADMIN_MENU_GROUP];
    } else {
      // Regular users see base menu items
      menuItems = [...BASE_MENU_ITEMS];
    }

    return NextResponse.json(successResponse('Navigation fetched successfully', menuItems));
  } catch (error) {
    return NextResponse.json(errorResponse('Failed to fetch navigation', error, 500), { status: 500 });
  }
}
