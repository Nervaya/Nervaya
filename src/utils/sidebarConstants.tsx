import {
  FaHouse,
  FaRightFromBracket,
  FaBed,
  FaHeartPulse,
  FaCartShopping,
  FaChartPie,
  FaCalendarCheck,
  FaUserGroup,
  FaClipboardList,
  FaFileMedical,
  FaMoneyBillWave,
  FaBoxOpen,
  FaHeadset,
  FaCommentDots,
  FaRegCommentDots,
  FaBars,
  FaUserDoctor,
  FaGear,
  FaUsers,
  FaIndianRupeeSign,
  FaBell,
  FaShieldHalved,
  FaStethoscope,
  FaPills,
  FaCapsules,
  FaNewspaper,
  FaTag,
} from 'react-icons/fa6';
import type { NavigationMenuGroup } from '@/types/navigation.types';

export const iconMap: { [key: string]: React.ReactElement } = {
  FaHouse: <FaHouse />,
  FaBed: <FaBed />,
  FaHeartPulse: <FaHeartPulse />,
  FaCartShopping: <FaCartShopping />,
  FaChartPie: <FaChartPie />,
  FaCalendarCheck: <FaCalendarCheck />,
  FaUserGroup: <FaUserGroup />,
  FaClipboardList: <FaClipboardList />,
  FaFileMedical: <FaFileMedical />,
  FaMoneyBillWave: <FaMoneyBillWave />,
  FaBoxOpen: <FaBoxOpen />,
  FaHeadset: <FaHeadset />,
  FaCommentDots: <FaCommentDots />,
  FaRegCommentDots: <FaRegCommentDots />,
  FaBars: <FaBars />,
  FaUserDoctor: <FaUserDoctor />,
  FaGear: <FaGear />,
  FaUsers: <FaUsers />,
  FaIndianRupeeSign: <FaIndianRupeeSign />,
  FaBell: <FaBell />,
  FaShieldHalved: <FaShieldHalved />,
  FaStethoscope: <FaStethoscope />,
  FaPills: <FaPills />,
  FaCapsules: <FaCapsules />,
  FaNewspaper: <FaNewspaper />,
  FaTag: <FaTag />,
  FaRightFromBracket: <FaRightFromBracket />,
};

export interface SidebarNavItem {
  title: string;
  path: string;
  icon: string;
  isDashboard?: boolean;
}

export const sidebarBottomNavItems: SidebarNavItem[] = [
  {
    title: 'Feedback',
    path: '/feedback',
    icon: 'FaRegCommentDots',
  },
];

export const sidebarMenuGroups: NavigationMenuGroup[] = [
  {
    title: 'General',
    items: [
      { title: 'Dashboard', path: '/dashboard', icon: 'FaChartPie' },
      {
        title: 'Questionnaire',
        path: '/sleep-assessment',
        icon: 'FaClipboardList',
      },
    ],
  },
  {
    title: 'Sleep',
    items: [
      { title: 'Drift Off', path: '/drift-off', icon: 'FaBed' },
      { title: 'Sleep Elixir', path: '/sleep-elixir', icon: 'FaHeartPulse' },
    ],
  },
  {
    title: 'Shop',
    items: [
      { title: 'Supplements', path: '/supplements', icon: 'FaPills' },
      { title: 'Cart', path: '/supplements/cart', icon: 'FaCartShopping' },
    ],
  },
  {
    title: 'Support',
    items: [
      {
        title: 'Therapy Corner',
        path: '/therapy-corner',
        icon: 'FaUserDoctor',
      },
      { title: 'Support', path: '/support', icon: 'FaHeadset' },
      { title: 'Account', path: '/account', icon: 'FaUsers' },
    ],
  },
];

export const adminMenuGroups: NavigationMenuGroup[] = [
  {
    title: 'Admin',
    items: [
      { title: 'Dashboard', path: '/admin/dashboard', icon: 'FaChartPie' },
      { title: 'Therapists', path: '/admin/therapists', icon: 'FaUserDoctor' },
      {
        title: 'Sleep Assessment',
        path: '/admin/sleep-assessment',
        icon: 'FaClipboardList',
      },
      { title: 'Supplements', path: '/admin/supplements', icon: 'FaPills' },
      { title: 'Promo Codes', path: '/admin/promo-codes', icon: 'FaTag' },
      { title: 'Blogs', path: '/admin/blogs', icon: 'FaNewspaper' },
    ],
  },
];
