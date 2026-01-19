import {
  FaHome,
  FaBed,
  FaHeartbeat,
  FaShoppingCart,
  FaHeadset,
  FaCommentDots,
  FaBars,
  FaUserMd,
  FaCog,
  FaUsers,
  FaRupeeSign,
} from 'react-icons/fa';

export const iconMap: { [key: string]: React.ReactElement } = {
  FaHome: <FaHome />,
  FaBed: <FaBed />,
  FaHeartbeat: <FaHeartbeat />,
  FaShoppingCart: <FaShoppingCart />,
  FaHeadset: <FaHeadset />,
  FaCommentDots: <FaCommentDots />,
  FaBars: <FaBars />,
  FaUserMd: <FaUserMd />,
  FaCog: <FaCog />,
  FaUsers: <FaUsers />,
  FaRupeeSign: <FaRupeeSign />,
};

export interface SidebarNavItem {
    title: string;
    path: string;
    icon: string;
    isDashboard?: boolean;
}

export const sidebarNavItems: SidebarNavItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: 'FaHome',
    isDashboard: true,
  },
];

export const sidebarBottomNavItems: SidebarNavItem[] = [
  {
    title: 'Feedback',
    path: '/feedback',
    icon: 'FaCommentDots',
  },
];
