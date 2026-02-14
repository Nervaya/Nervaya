'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaChevronUp } from 'react-icons/fa6';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { primaryNavItems, moreNavItems, type BottomNavItem } from '@/utils/bottomNavigationConstants';
import { AUTH_ROUTES } from '@/utils/routesConstants';
import { iconMap } from '@/utils/sidebarConstants';
import styles from './BottomNavigation.module.css';

const BottomNavigation = () => {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const isAuthPage = (AUTH_ROUTES as readonly string[]).includes(pathname as string);

  if (isAuthPage) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  const showBadge = (path: string, title: string) =>
    (path === '/supplements/cart' || title === 'Cart') && cartCount > 0;

  const NavLinkItem = ({ item }: { item: BottomNavItem }) => {
    const active = isActive(item.path);
    const badge = showBadge(item.path, item.title);

    return (
      <li key={item.path} className={styles.navItem}>
        <Link
          href={item.path}
          className={`${styles.navLink} ${active ? styles.active : ''}`}
          aria-current={active ? 'page' : undefined}
          onClick={() => setIsMoreOpen(false)}
        >
          <span className={styles.iconWrapper}>
            <span className={styles.icon}>{iconMap[item.icon] || iconMap['FaHouse']}</span>
            {badge && <span className={styles.badge}>{cartCount}</span>}
          </span>
          <span className={styles.label}>{item.title}</span>
        </Link>
      </li>
    );
  };

  const MoreIconLink = ({ item }: { item: BottomNavItem }) => {
    const active = isActive(item.path);

    return (
      <li key={item.path} className={styles.moreIconItem}>
        <Link
          href={item.path}
          className={`${styles.moreIconLink} ${active ? styles.active : ''}`}
          aria-current={active ? 'page' : undefined}
          aria-label={item.title}
          onClick={() => setIsMoreOpen(false)}
        >
          <span className={styles.moreIcon}>{iconMap[item.icon] || iconMap['FaHouse']}</span>
        </Link>
      </li>
    );
  };

  const hasActiveInMore = moreNavItems.some((item) => isActive(item.path));

  return (
    <nav className={styles.bottomNav} aria-label="Bottom navigation">
      {isMoreOpen && (
        <div className={styles.morePanel} role="dialog" aria-label="More navigation options">
          <ul className={styles.moreList}>
            {moreNavItems.map((item) => (
              <MoreIconLink key={item.path} item={item} />
            ))}
            {isAuthenticated && (
              <li className={styles.moreIconItem}>
                <button
                  className={`${styles.moreIconLink} ${styles.logoutButton}`}
                  onClick={() => {
                    logout();
                    setIsMoreOpen(false);
                  }}
                  aria-label="Logout"
                >
                  <span className={`${styles.moreIcon} ${styles.logoutIcon}`}>{iconMap['FaRightFromBracket']}</span>
                  <span className={`${styles.logoutLabel}`}>Logout</span>
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
      <div className={styles.navBar}>
        <ul className={styles.navList}>
          {primaryNavItems.map((item) => (
            <NavLinkItem key={item.path} item={item} />
          ))}
          <li className={styles.navItem}>
            <button
              type="button"
              className={`${styles.moreButton} ${isMoreOpen || hasActiveInMore ? styles.active : ''}`}
              onClick={() => setIsMoreOpen((prev) => !prev)}
              aria-label={isMoreOpen ? 'Collapse more options' : 'Expand more options'}
              aria-expanded={isMoreOpen}
            >
              <span className={`${styles.iconWrapper} ${isMoreOpen ? styles.chevronUp : ''}`}>
                <FaChevronUp className={styles.chevronIcon} />
              </span>
              <span className={styles.label}>More</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default BottomNavigation;
