'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
import { ICON_USER, ICON_CHEVRON_DOWN } from '@/constants/icons';
import { NAVBAR_PRODUCTS_LINKS } from '@/utils/navbarConstants';
import { useAuth } from '@/hooks/useAuth';
import { hasRole } from '@/lib/constants/rbac';
import { ROLES } from '@/lib/constants/roles';
import { ROUTES, AUTH_ROUTES } from '@/utils/routesConstants';
import styles from './styles.module.css';
import { Dropdown } from '@/components/common/Dropdown';

const Navbar = () => {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = hasRole(user, ROLES.ADMIN);
  const pathname = usePathname();

  const isAuthPage = (AUTH_ROUTES as readonly string[]).includes(pathname);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrollDownStyleActive, setIsScrollDownStyleActive] = useState(false);
  const lastScrollYRef = useRef(0);
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const closeMenus = () => {
      setIsMobileMenuOpen(false);
    };
    const id = requestAnimationFrame(closeMenus);
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollYRef.current + 4;
      const isScrollingUp = currentScrollY < lastScrollYRef.current - 4;

      if (currentScrollY <= 16) {
        setIsScrollDownStyleActive(false);
      } else if (isScrollingDown) {
        setIsScrollDownStyleActive(true);
      } else if (isScrollingUp) {
        setIsScrollDownStyleActive(false);
      }

      lastScrollYRef.current = currentScrollY;
    };

    lastScrollYRef.current = window.scrollY;
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isProfessional = isAdmin || hasRole(user, ROLES.THERAPIST);

  if (isAuthPage) {
    return (
      <nav className={`${styles.navbar} ${styles.navbarAuthPage}`} aria-label="Site navigation">
        <div className={styles.navbarContainer}>
          <div className={styles.navbarLogo}>
            <Link href="/">
              <Image src="/icons/nervaya-logo.svg" alt="Nervaya logo" width={160} height={52} />
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className={`${styles.navbar} ${styles.navbarMain} ${isScrollDownStyleActive ? styles.navbarScrolledDown : ''}`}
    >
      <div className={styles.navbarContainer}>
        <div className={styles.navbarLeft}>
          <div className={styles.navbarLogo}>
            <Link href="/">
              <Image src="/icons/nervaya-logo.svg" alt="Nervaya logo" width={110} height={36} />
            </Link>
          </div>
        </div>
        <button
          className={styles.hamburger}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className={`${styles.hamburgerBar} ${isMobileMenuOpen ? styles.hamburgerBarOpen : ''}`}></span>
          <span className={`${styles.hamburgerBar} ${isMobileMenuOpen ? styles.hamburgerBarOpen : ''}`}></span>
          <span className={`${styles.hamburgerBar} ${isMobileMenuOpen ? styles.hamburgerBarOpen : ''}`}></span>
        </button>

        {isMobileMenuOpen && <div className={styles.mobileOverlay} onClick={closeMobileMenu}></div>}

        <ul className={`${styles.navbarMenu} ${isMobileMenuOpen ? styles.navbarMenuOpen : ''}`}>
          {!isProfessional && (
            <li>
              <Link href="/" onClick={closeMobileMenu} aria-current={pathname === '/' ? 'page' : undefined}>
                Home
              </Link>
            </li>
          )}
          {!isProfessional && (
            <li className={styles.navbarDropdown}>
              <Dropdown
                variant="navbar"
                modal={false}
                options={NAVBAR_PRODUCTS_LINKS.map((link) => ({
                  label: link.text,
                  value: link.href,
                  href: link.href,
                  onClick: closeMobileMenu,
                }))}
                trigger={
                  <button className={styles.navbarDropdownButton}>
                    Products
                    <Icon icon={ICON_CHEVRON_DOWN} className={styles.dropdownArrow} width={16} height={16} />
                  </button>
                }
              />
            </li>
          )}
          {!isProfessional && (
            <li>
              <Link
                href="/blog"
                onClick={closeMobileMenu}
                aria-current={pathname === '/blog' || pathname?.startsWith('/blog/') ? 'page' : undefined}
              >
                Blog
              </Link>
            </li>
          )}
          {!isProfessional && (
            <li>
              <Link
                href="/about-us"
                onClick={closeMobileMenu}
                aria-current={pathname === '/about-us' ? 'page' : undefined}
              >
                About Us
              </Link>
            </li>
          )}

          {isAuthenticated ? (
            <li>
              <Link
                href={isAdmin ? ROUTES.ADMIN_DASHBOARD : '/account'}
                onClick={closeMobileMenu}
                className={styles.accountButton}
                aria-current={
                  pathname === ROUTES.ADMIN_DASHBOARD || pathname?.startsWith('/account') ? 'page' : undefined
                }
              >
                <Icon icon={ICON_USER} width={24} height={24} />
                <span>{isAdmin ? 'Admin' : user?.name?.split(' ')[0] || 'Account'}</span>
              </Link>
            </li>
          ) : (
            <>
              <li>
                <Link
                  href={ROUTES.LOGIN || ROUTES.SIGNUP}
                  onClick={closeMobileMenu}
                  aria-current={pathname === ROUTES.LOGIN || pathname === ROUTES.SIGNUP ? 'page' : undefined}
                >
                  Log in / Sign up
                </Link>
              </li>
              <li>
                <button type="button" className={styles.navbarCta} onClick={closeMobileMenu}>
                  Contact Us
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
