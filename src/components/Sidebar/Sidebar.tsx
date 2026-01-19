'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars } from 'react-icons/fa';
import { iconMap, sidebarNavItems, sidebarBottomNavItems } from '@/utils/sidebarConstants';
import { NavigationMenuGroup } from '@/types/navigation.types';
import styles from './styles.module.css';

const Sidebar = ({ children, className }: { children?: React.ReactNode; className?: string }) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [menuGroups, setMenuGroups] = useState<NavigationMenuGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdminRoute = pathname.startsWith('/admin');

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 768);
      if (window.innerWidth <= 768) {setIsCollapsed(false);}
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const fetchNavigation = async () => {
      try {
        const response = await fetch('/api/navigation');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setMenuGroups(result.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch navigation', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNavigation();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ... render logic ... 

  return (
    <>
      <button
        className={styles.mobileToggle}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <FaBars />
      </button>

      <AnimatePresence mode="wait">
        {(isMobileOpen || isDesktop) && (
          <motion.aside
            className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${isMobileOpen ? styles.mobileOpen : ''}`}
            initial={false}
            animate={{ x: 0 }}
            onMouseEnter={() => setIsCollapsed(false)}
            onMouseLeave={() => setIsCollapsed(true)}
          >
            {!isAdminRoute && (
              <div className={styles.header}>
                <ul className={styles.navList}>
                  {sidebarNavItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.path}
                        className={`${styles.navItem} ${item.isDashboard ? styles.dashboardItem : ''} ${pathname === item.path ? styles.active : ''}`}
                        onClick={() => setIsMobileOpen(false)}
                      >
                        <span className={styles.icon}>{iconMap[item.icon]}</span>
                        {!isCollapsed && <span className={styles.title}>{item.title}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <nav className={styles.nav}>
              {loading ? (
                <div style={{ padding: '1rem', color: '#9ca3af', textAlign: 'center' }}>Loading...</div>
              ) : (
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
                              <span className={styles.icon}>{iconMap[item.icon] || iconMap['FaHome']}</span>
                              {!isCollapsed && <span className={styles.title}>{item.title}</span>}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}

              <div className={styles.bottomMenu}>
                <ul className={styles.navList}>
                  {sidebarBottomNavItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.path}
                        className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
                        onClick={() => setIsMobileOpen(false)}
                      >
                        <span className={styles.icon}>{iconMap[item.icon]}</span>
                        {!isCollapsed && <span className={styles.title}>{item.title}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {isMobileOpen && <div className={styles.overlay} onClick={() => setIsMobileOpen(false)} />}

      <main className={`${styles.mainContent} ${isCollapsed ? styles.mainContentCollapsed : ''} ${className || ''}`}>
        {children}
      </main>
    </>
  );
};

export default Sidebar;
