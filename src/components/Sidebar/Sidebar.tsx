'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, LazyMotion, m } from 'framer-motion';
import {
  FaBars,
  FaChevronLeft,
  FaChevronRight,
  FaXmark,
} from 'react-icons/fa6';
import {
  adminMenuGroups,
  iconMap,
  sidebarMenuGroups,
  sidebarBottomNavItems,
} from '@/utils/sidebarConstants';
import styles from './styles.module.css';

const Sidebar = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  const { cartCount } = useCart();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    try {
      return window.localStorage.getItem('sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const isAdminRoute = pathname.startsWith('/admin');
  const menuGroups = isAdminRoute ? adminMenuGroups : sidebarMenuGroups;
  const expandedWidth = 280;
  const collapsedWidth = 88;
  const sidebarWidth = isDesktop
    ? isCollapsed
      ? collapsedWidth
      : expandedWidth
    : expandedWidth;

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth > 768;
      setIsDesktop(desktop);
      if (!desktop) {
        setIsCollapsed(false);
        setIsMobileOpen(false);
        return;
      }
      try {
        const stored = window.localStorage.getItem('sidebar-collapsed');
        if (stored !== null) {
          setIsCollapsed(stored === 'true');
        }
      } catch {
        // ignore
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const mainMarginLeft = isDesktop ? sidebarWidth : 0;
  const closeMobileSidebar = () => setIsMobileOpen(false);

  return (
    <>
      <button
        className={styles.mobileToggle}
        onClick={() => setIsMobileOpen((v) => !v)}
        aria-label={isMobileOpen ? 'Close sidebar' : 'Open sidebar'}
        aria-expanded={isMobileOpen}
        aria-controls="app-sidebar"
      >
        {isMobileOpen ? <FaXmark /> : <FaBars />}
      </button>

      <LazyMotion
        features={() => import('framer-motion').then((mod) => mod.domAnimation)}
      >
        <AnimatePresence mode="wait">
          {(isMobileOpen || isDesktop) && (
            <m.aside
              className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${isMobileOpen ? styles.mobileOpen : ''}`}
              id="app-sidebar"
              initial={false}
              animate={{ x: 0, width: sidebarWidth }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                mass: 0.8,
              }}
              style={{ willChange: 'width, transform' }}
            >
              <button
                type="button"
                className={styles.edgeToggle}
                onClick={() =>
                  setIsCollapsed((v) => {
                    const next = !v;
                    try {
                      window.localStorage.setItem(
                        'sidebar-collapsed',
                        String(next),
                      );
                    } catch {
                      // ignore
                    }
                    return next;
                  })
                }
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-pressed={isCollapsed}
              >
                {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
              </button>
              <nav className={styles.nav}>
                <ul className={styles.navList}>
                  {menuGroups.map((group) => (
                    <li
                      key={group.title || 'default'}
                      className={styles.menuGroup}
                    >
                      {group.title && !isCollapsed && (
                        <div className={styles.groupTitle}>{group.title}</div>
                      )}
                      <ul className={styles.navList}>
                        {group.items.map((item) => (
                          <li key={item.path}>
                            <Link
                              href={item.path}
                              className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
                              onClick={closeMobileSidebar}
                            >
                              <span className={styles.icon}>
                                {iconMap[item.icon] || iconMap['FaHouse']}
                                {(item.path === '/supplements/cart' ||
                                  item.title === 'Cart') &&
                                  cartCount > 0 && (
                                  <span className={styles.badge}>
                                    {cartCount}
                                  </span>
                                )}
                              </span>
                              <span
                                className={styles.title}
                                aria-hidden={isCollapsed}
                              >
                                {item.title}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>

                <div className={styles.bottomMenu}>
                  <ul className={styles.navList}>
                    {sidebarBottomNavItems.map((item) => (
                      <li key={item.path}>
                        <Link
                          href={item.path}
                          className={`${styles.navItem} ${styles.secondaryItem} ${pathname === item.path ? styles.active : ''}`}
                          onClick={closeMobileSidebar}
                        >
                          <span className={styles.icon}>
                            {iconMap[item.icon] || iconMap['FaHouse']}
                            {(item.path === '/supplements/cart' ||
                              item.title === 'Cart') &&
                              cartCount > 0 && (
                              <span className={styles.badge}>
                                {cartCount}
                              </span>
                            )}
                          </span>
                          <span
                            className={styles.title}
                            aria-hidden={isCollapsed}
                          >
                            {item.title}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </nav>
            </m.aside>
          )}
        </AnimatePresence>
      </LazyMotion>

      {isMobileOpen && (
        <div className={styles.overlay} onClick={closeMobileSidebar} />
      )}

      <main
        className={`${styles.mainContent} ${className || ''}`}
        style={{ marginLeft: `${mainMarginLeft}px` }}
      >
        {children}
      </main>
    </>
  );
};

export default Sidebar;
