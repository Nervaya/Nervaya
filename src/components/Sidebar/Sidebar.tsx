'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, LazyMotion, m } from 'framer-motion';
import { FaBars } from 'react-icons/fa6';
import { adminMenuGroups, iconMap, sidebarMenuGroups, sidebarBottomNavItems } from '@/utils/sidebarConstants';
import styles from './styles.module.css';

const Sidebar = ({ children, className }: { children?: React.ReactNode; className?: string }) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const isAdminRoute = pathname.startsWith('/admin');
  const menuGroups = isAdminRoute ? adminMenuGroups : sidebarMenuGroups;
  const expandedWidth = 280;
  const collapsedWidth = 88;
  const sidebarWidth = isDesktop ? (isCollapsed ? collapsedWidth : expandedWidth) : expandedWidth;

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth > 768;
      setIsDesktop(desktop);
      if (!desktop) {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mainMarginLeft = isDesktop ? sidebarWidth : 0;
  
  return (
    <>
      <button
        className={styles.mobileToggle}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <FaBars />
      </button>

      <LazyMotion features={() => import('framer-motion').then((mod) => mod.domAnimation)}>
        <AnimatePresence mode="wait">
          {(isMobileOpen || isDesktop) && (
            <m.aside
              className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${isMobileOpen ? styles.mobileOpen : ''}`}
              initial={false}
              animate={{ x: 0, width: sidebarWidth }}
              transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
              style={{ willChange: 'width, transform' }}
              onMouseEnter={() => {
                if (!isDesktop) return;
                setIsCollapsed(false);
              }}
              onMouseLeave={() => {
                if (!isDesktop) return;
                setIsCollapsed(true);
              }}
            >
              <nav className={styles.nav}>
              <ul className={styles.navList}>
                {menuGroups.map((group, groupIndex) => (
                  <li key={groupIndex} className={styles.menuGroup}>
                    {group.title && !isCollapsed && (
                      <div className={styles.groupTitle}>{group.title}</div>
                    )}
                    <ul className={styles.navList}>
                      {group.items.map((item, itemIndex) => (
                        <li key={itemIndex}>
                          <Link
                            href={item.path}
                            className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
                            onClick={() => setIsMobileOpen(false)}
                          >
                            <span className={styles.icon}>{iconMap[item.icon] || iconMap['FaHouse']}</span>
                            <span className={styles.title} aria-hidden={isCollapsed}>
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
                  {sidebarBottomNavItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.path}
                        className={`${styles.navItem} ${styles.secondaryItem} ${pathname === item.path ? styles.active : ''}`}
                        onClick={() => setIsMobileOpen(false)}
                      >
                        <span className={styles.icon}>{iconMap[item.icon] || iconMap['FaHouse']}</span>
                        <span className={styles.title} aria-hidden={isCollapsed}>
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

      {isMobileOpen && <div className={styles.overlay} onClick={() => setIsMobileOpen(false)} />}

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
