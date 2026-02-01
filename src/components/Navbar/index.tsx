'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaCircleUser } from 'react-icons/fa6';
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

  useEffect(() => {
    const closeMenus = () => {
      setIsMobileMenuOpen(false);
      setIsProductsDropdownOpen(false);
    };
    const id = requestAnimationFrame(closeMenus);
    return () => cancelAnimationFrame(id);
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
            <Link href="/" onClick={closeMobileMenu} aria-current={pathname === '/' ? 'page' : undefined}>
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
            <Link
              href="/blog"
              onClick={closeMobileMenu}
              aria-current={pathname === '/blog' || pathname?.startsWith('/blog/') ? 'page' : undefined}
            >
              Blog
            </Link>
          </li>
          <li>
            <Link
              href="/about-us"
              onClick={closeMobileMenu}
              aria-current={pathname === '/about-us' ? 'page' : undefined}
            >
              About Us
            </Link>
          </li>

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
                <FaCircleUser size={24} />
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
