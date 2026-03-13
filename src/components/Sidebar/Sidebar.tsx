'use client';

import { useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, LazyMotion, m } from 'framer-motion';
import { Icon } from '@iconify/react';
import { adminMenuGroups, iconMap, sidebarMenuGroups, sidebarBottomNavItems } from '@/utils/sidebarConstants';
import { RouteBreadcrumbs } from '@/components/common/Breadcrumbs';
import BottomNavigation from '@/components/BottomNavigation/BottomNavigation';
import styles from './styles.module.css';

import { useSidebar } from '@/context/SidebarContext';

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

  const { isCollapsed, isMobileOpen, isDesktop, closeMobileSidebar } = useSidebar();

  const isAdminRoute = pathname.startsWith('/admin');
  const menuGroups = isAdminRoute ? adminMenuGroups : sidebarMenuGroups;
  const bottomNavItems = isAdminRoute ? [] : sidebarBottomNavItems;
  const expandedWidth = 240;
  const collapsedWidth = 72;
  const sidebarWidth = isDesktop ? (isCollapsed ? collapsedWidth : expandedWidth) : 240;

  useEffect(() => {
    if (!isMobileOpen) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileOpen]);

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
          {(isDesktop || isMobileOpen) && (
            <m.aside
              className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${isMobileOpen ? styles.mobileOpen : ''}`}
              id="app-sidebar"
              initial={isDesktop ? false : { x: -300 }}
              animate={{ x: 0, width: sidebarWidth }}
              exit={{ x: -300 }}
              transition={{
                type: 'tween',
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <nav className={styles.nav}>
                <ul className={styles.navList}>
                  {menuGroups.map((group) => (
                    <li key={group.title || 'default'} className={styles.menuGroup}>
                      {group.title && !isCollapsed && <div className={styles.groupTitle}>{group.title}</div>}
                      <ul className={styles.navList}>
                        {group.items.map((item) => {
                          const isActive =
                            pathname === item.path || (isAdminRoute && pathname.startsWith(`${item.path}/`));
                          return (
                            <li key={`${item.path}-${item.title}`}>
                              <Link
                                href={item.path}
                                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                                onClick={closeMobileSidebar}
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
                          );
                        })}
                      </ul>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className={styles.bottomMenu}>
                <ul className={styles.navList}>
                  {bottomNavItems.map((item) => (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        className={`${styles.navItem} ${styles.secondaryItem} ${pathname === item.path ? styles.active : ''}`}
                        onClick={closeMobileSidebar}
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
                          closeMobileSidebar();
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

      {isMobileOpen && isDesktop && <div className={styles.overlay} onClick={closeMobileSidebar} />}

      <main className={`main-content ${className || ''}`}>
        {!hideGlobalBreadcrumbs && <RouteBreadcrumbs />}
        {children}
      </main>

      <BottomNavigation />
    </>
  );
};

export default Sidebar;
