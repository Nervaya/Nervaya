'use client';

import { useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, LazyMotion, m } from 'framer-motion';
import { Icon } from '@iconify/react';
import { ICON_CHEVRON_LEFT, ICON_CHEVRON_RIGHT } from '@/constants/icons';
import {
  adminMenuGroups,
  therapistMenuGroups,
  iconMap,
  sidebarMenuGroups,
  sidebarBottomNavItems,
} from '@/utils/sidebarConstants';
import { RouteBreadcrumbs } from '@/components/common/Breadcrumbs';
import BottomNavigation from '@/components/BottomNavigation/BottomNavigation';
import styles from './styles.module.css';

import { useSidebar } from '@/context/SidebarContext';
import { checkIsActivePath } from '@/utils/navigationUtils';

const Sidebar = ({
  children,
  className,
  hideGlobalBreadcrumbs = false,
}: {
  children?: React.ReactNode;
  className?: string;
  hideGlobalBreadcrumbs?: boolean;
}) => {
  const { cartCount } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  const { isCollapsed, isDesktop, toggleCollapsed } = useSidebar();

  const isAdminRoute = pathname.startsWith('/admin');
  const isTherapistRoute = pathname.startsWith('/therapist');
  const menuGroups = isAdminRoute ? adminMenuGroups : isTherapistRoute ? therapistMenuGroups : sidebarMenuGroups;
  const bottomNavItems = isAdminRoute || isTherapistRoute ? [] : sidebarBottomNavItems;
  const expandedWidth = 240;
  const collapsedWidth = 72;
  const sidebarWidth = isDesktop ? (isCollapsed ? collapsedWidth : expandedWidth) : 240;

  useEffect(() => {
    document.body.classList.add('sidebar-layout');
    if (isCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
    return () => {
      document.body.classList.remove('sidebar-collapsed');
      document.body.classList.remove('sidebar-layout');
    };
  }, [isCollapsed]);

  return (
    <>
      <LazyMotion features={() => import('framer-motion').then((mod) => mod.domAnimation)}>
        <AnimatePresence mode="wait">
          {isAuthenticated && isDesktop && (
            <m.aside
              className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}
              id="app-sidebar"
              initial={false}
              animate={{ width: sidebarWidth }}
              exit={{ x: -300 }}
              transition={{
                width: {
                  type: 'tween',
                  duration: 0.16,
                  ease: [0.22, 1, 0.36, 1],
                },
                x: {
                  type: 'tween',
                  duration: 0.2,
                  ease: [0.4, 0, 0.2, 1],
                },
              }}
            >
              <button
                type="button"
                className={styles.edgeToggle}
                onClick={toggleCollapsed}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-pressed={isCollapsed}
              >
                <Icon
                  icon={isCollapsed ? ICON_CHEVRON_RIGHT : ICON_CHEVRON_LEFT}
                  className={styles.toggleIcon}
                  width={18}
                  height={18}
                />
              </button>
              <nav className={styles.nav}>
                <ul className={styles.navList}>
                  {menuGroups.map((group, index) => (
                    <li key={group.title || 'default'}>
                      {index > 0 && <div className={styles.separator} />}
                      {group.title && <span className={styles.groupTitle}>{group.title}</span>}
                      <ul className={styles.navList}>
                        {group.items.map((item) => {
                          const isActive = checkIsActivePath(
                            pathname,
                            item.path,
                            group.items.map((i) => i.path),
                          );
                          return (
                            <li key={`${item.path}-${item.title}`}>
                              <Link href={item.path} className={`${styles.navItem} ${isActive ? styles.active : ''}`}>
                                <span className={styles.icon}>
                                  <Icon icon={iconMap[item.icon] || iconMap['FaHouse']} width={20} height={20} />
                                  {(item.path === '/supplements/cart' || item.title === 'Cart') && cartCount > 0 && (
                                    <span className={styles.badge}>{cartCount}</span>
                                  )}
                                </span>
                                <span className={styles.title}>{item.title}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className={styles.bottomMenu}>
                {(bottomNavItems.length > 0 || isAuthenticated) && <div className={styles.separator} />}
                <ul className={styles.navList}>
                  {bottomNavItems.map((item) => (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        className={`${styles.navItem} ${styles.secondaryItem} ${pathname === item.path ? styles.active : ''}`}
                      >
                        <span className={styles.icon}>
                          <Icon icon={iconMap[item.icon] || iconMap['FaHouse']} width={20} height={20} />
                          {(item.path === '/supplements/cart' || item.title === 'Cart') && cartCount > 0 && (
                            <span className={styles.badge}>{cartCount}</span>
                          )}
                        </span>
                        <span className={styles.title}>{item.title}</span>
                      </Link>
                    </li>
                  ))}
                  {isAuthenticated && (
                    <li>
                      <button
                        type="button"
                        className={`${styles.navItem} ${styles.secondaryItem} ${styles.logoutButton}`}
                        onClick={() => {
                          logout();
                        }}
                      >
                        <span className={styles.icon}>
                          <Icon
                            icon={iconMap['FaRightFromBracket']}
                            width={20}
                            height={20}
                            className={styles.logoutIcon}
                          />
                        </span>
                        <span className={styles.title}>Logout</span>
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            </m.aside>
          )}
        </AnimatePresence>
      </LazyMotion>

      <main className={`main-content ${!isAuthenticated || !isDesktop ? 'no-sidebar' : ''} ${className || ''}`}>
        {!hideGlobalBreadcrumbs && (
          <div className="breadcrumbs-slot">
            <RouteBreadcrumbs />
          </div>
        )}
        {children}
      </main>

      <BottomNavigation />
    </>
  );
};

export default Sidebar;
