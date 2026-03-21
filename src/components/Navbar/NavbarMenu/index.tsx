'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';
import { ICON_CHEVRON_DOWN } from '@/constants/icons';
import { NAVBAR_PRODUCTS_LINKS } from '@/utils/navbarConstants';
import { ROUTES } from '@/utils/routesConstants';
import { Dropdown } from '@/components/common/Dropdown';
import NavbarAccountLink from '../NavbarAccountLink';
import styles from './styles.module.css';

interface NavbarMenuProps {
  isAuthenticated: boolean;
  isMobileMenuOpen: boolean;
  isMobileViewport: boolean;
  pathname: string;
  dashboardHref: string;
  accountHref: string;
  accountLabel: string;
  onCloseMobileMenu: () => void;
}

export function NavbarMenu({
  isAuthenticated,
  isMobileMenuOpen,
  isMobileViewport,
  pathname,
  dashboardHref,
  accountHref,
  accountLabel,
  onCloseMobileMenu,
}: NavbarMenuProps) {
  const isAccountPage = pathname === ROUTES.ADMIN_DASHBOARD || pathname?.startsWith('/account');

  return (
    <ul className={`${styles.navbarMenu} ${isMobileMenuOpen ? styles.navbarMenuOpen : ''}`}>
      <li>
        <Link href="/" onClick={onCloseMobileMenu} aria-current={pathname === '/' ? 'page' : undefined}>
          Home
        </Link>
      </li>
      <li className={styles.navbarDropdown}>
        <Dropdown
          variant="navbar"
          modal={false}
          options={NAVBAR_PRODUCTS_LINKS.map((link) => ({
            label: link.text,
            value: link.href,
            href: link.href,
            onClick: onCloseMobileMenu,
          }))}
          trigger={
            <button className={styles.navbarDropdownButton}>
              Products
              <Icon icon={ICON_CHEVRON_DOWN} className={styles.dropdownArrow} width={16} height={16} />
            </button>
          }
        />
      </li>
      {isAuthenticated && (
        <li>
          <Link
            href={dashboardHref}
            onClick={onCloseMobileMenu}
            aria-current={pathname === ROUTES.DASHBOARD || pathname === ROUTES.ADMIN_DASHBOARD ? 'page' : undefined}
          >
            Dashboard
          </Link>
        </li>
      )}
      <li>
        <Link href="/about-us" onClick={onCloseMobileMenu} aria-current={pathname === '/about-us' ? 'page' : undefined}>
          About Us
        </Link>
      </li>

      {isAuthenticated && isMobileViewport ? (
        <li>
          <NavbarAccountLink
            href={accountHref}
            label={accountLabel}
            isActive={isAccountPage}
            onClick={onCloseMobileMenu}
          />
        </li>
      ) : !isAuthenticated ? (
        <>
          <li>
            <Link
              href={ROUTES.LOGIN || ROUTES.SIGNUP}
              onClick={onCloseMobileMenu}
              aria-current={pathname === ROUTES.LOGIN || pathname === ROUTES.SIGNUP ? 'page' : undefined}
            >
              Log in / Sign up
            </Link>
          </li>
          <li>
            <button type="button" className={styles.navbarCta} onClick={onCloseMobileMenu}>
              Contact Us
            </button>
          </li>
        </>
      ) : null}
    </ul>
  );
}

export default NavbarMenu;
