import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/utils/jwt.util';
import { ROLES, Role } from '@/lib/constants/roles';
import { successResponse, errorResponse } from '@/lib/utils/response.util';

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('auth_token')?.value;
        let role: Role = ROLES.CUSTOMER;

        if (token) {
            const decoded = await verifyToken(token);
            if (decoded) {
                role = decoded.role as any;
            }
        }

        const menuItems = [
            {
                title: 'GENERAL',
                items: [
                    { title: 'Sleep Assessment', path: '/sleep-assessment', icon: 'FaBed' },
                    { title: 'Shopping Cart', path: '/cart', icon: 'FaShoppingCart' }
                ]
            },
            {
                title: 'THERAPY',
                items: [
                    { title: 'Therapy Corner', path: '/therapy-corner', icon: 'FaHeartbeat' }
                ]
            },
            {
                title: 'DRIFT OFF',
                items: [
                    { title: 'Deep Rest Sessions', path: '/drift-off', icon: 'FaBed' }
                ]
            },
            {
                title: 'SUPPLEMENTS',
                items: [
                    { title: 'Sleep Elixir', path: '/sleep-elixir', icon: 'FaBed' }
                ]
            },
            {
                title: 'HELP',
                items: [
                    { title: 'Free 1 on 1 Assistance', path: '/assistance', icon: 'FaHeadset' },
                    { title: 'Customer Support', path: '/support', icon: 'FaHeadset' }
                ]
            }
        ];

        if (role === ROLES.ADMIN) {
            menuItems.unshift({
                title: 'ADMIN',
                items: [
                    { title: 'Dashboard', path: '/admin/dashboard', icon: 'FaHome' },
                    { title: 'Manage Doctors', path: '/admin/doctors', icon: 'FaUserMd' },
                    { title: 'Manage Therapies', path: '/admin/therapies', icon: 'FaHeartbeat' },
                ]
            });
        }

        return NextResponse.json(successResponse('Navigation fetched successfully', menuItems));
    } catch (error) {
        return NextResponse.json(errorResponse('Failed to fetch navigation', error, 500), { status: 500 });
    }
}
