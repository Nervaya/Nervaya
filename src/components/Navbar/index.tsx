'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import UserIcon from './UserIcon';
import { NAVBAR_PRODUCTS_LINKS } from '@/utils/navbarConstants';
import { useAuth } from '@/hooks/useAuth';
import { hasRole } from '@/lib/constants/rbac';
import { ROLES } from '@/lib/constants/roles';
import { ROUTES, AUTH_ROUTES } from '@/utils/routesConstants';
import styles from './styles.module.css';

const Navbar = () => {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = hasRole(user, ROLES.ADMIN);
  const pathname = usePathname();

  const isAuthPage = (AUTH_ROUTES as readonly string[]).includes(pathname);

  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const productsDropdownRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productsDropdownRef.current && !productsDropdownRef.current.contains(event.target as Node)) {
        setIsProductsDropdownOpen(false);
      }
    };

    if (isProductsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProductsDropdownOpen]);

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

  // Close mobile menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileMenuOpen(false);
    setIsProductsDropdownOpen(false);
  }, [pathname]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsProductsDropdownOpen(false);
  };

  if (isAuthPage) {
    return (
      <nav className={`${styles.navbar} ${styles.navbarAuthPage}`} aria-label="Site navigation">
        <div className={styles.navbarContainer}>
          <div className={styles.navbarLogo}>
            <Link href="/">
              <Image src="/icons/nervaya-logo.svg" alt="Nervaya logo" width={150} height={50} />
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`${styles.navbar} ${styles.navbarMain}`}>
      <div className={styles.navbarContainer}>
        <div className={styles.navbarLogo}>
          <Link href="/">
            <Image src="/icons/nervaya-logo.svg" alt="Nervaya logo" width={150} height={50} />
          </Link>
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
          <li>
            <Link href="/" onClick={closeMobileMenu}>
              Home
            </Link>
          </li>
          {!isAdmin && (
            <li className={styles.navbarDropdown} ref={productsDropdownRef}>
              <button
                className={styles.navbarDropdownButton}
                onClick={() => setIsProductsDropdownOpen(!isProductsDropdownOpen)}
                aria-expanded={isProductsDropdownOpen}
                aria-haspopup="true"
              >
                Products
                <span className={`${styles.dropdownArrow} ${isProductsDropdownOpen ? styles.arrowOpen : ''}`}>▼</span>
              </button>
              {isProductsDropdownOpen && (
                <ul className={styles.dropdownMenu}>
                  {NAVBAR_PRODUCTS_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className={styles.dropdownItem} onClick={closeMobileMenu}>
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )}
          <li>
            <Link href="/about-us" onClick={closeMobileMenu}>
              About Us
            </Link>
          </li>

          {isAuthenticated ? (
            <li>
              <Link
                href={isAdmin ? ROUTES.ADMIN_DASHBOARD : '/account'}
                onClick={closeMobileMenu}
                className={styles.accountButton}
              >
                <UserIcon size={24} />
                <span>{isAdmin ? 'Admin' : user?.name?.split(' ')[0] || 'Account'}</span>
              </Link>
            </li>
          ) : (
            <>
              <li>
                <Link href={ROUTES.LOGIN || ROUTES.SIGNUP} onClick={closeMobileMenu}>
                  Log in / Sign up
                </Link>
              </li>
              <li>
                <button type="button" className={styles.navbarCta} onClick={closeMobileMenu}>
                  Call Us
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
