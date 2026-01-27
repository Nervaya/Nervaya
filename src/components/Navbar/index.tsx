"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaCircleUser } from "react-icons/fa6";
import {
  NAVBAR_PRODUCTS_LINKS,
  NAVBAR_ACCOUNT_LINKS,
} from "@/utils/navbarConstants";
import { useAuth } from "@/hooks/useAuth";
import styles from "./styles.module.css";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();

  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const productsDropdownRef = useRef<HTMLLIElement>(null);
  const accountDropdownRef = useRef<HTMLLIElement>(null);

  const handleLogout = async () => {
    await logout();
    setIsProductsDropdownOpen(false);
    setIsAccountDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        productsDropdownRef.current &&
        !productsDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProductsDropdownOpen(false);
      }
      if (
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAccountDropdownOpen(false);
      }
    };

    if (isProductsDropdownOpen || isAccountDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProductsDropdownOpen, isAccountDropdownOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileMenuOpen(false);
    setIsProductsDropdownOpen(false);
    setIsAccountDropdownOpen(false);
  }, [pathname]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsProductsDropdownOpen(false);
    setIsAccountDropdownOpen(false);
  };

  return (
    <nav className={`${styles.navbar} ${styles.navbarMain}`}>
      <div className={styles.navbarContainer}>
        <div className={styles.navbarLogo}>
          <Link href="/">
            <Image
              src="/icons/nervaya-logo.svg"
              alt="logo"
              width={150}
              height={50}
            />
          </Link>
        </div>
        <button
          className={styles.hamburger}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span
            className={`${styles.hamburgerBar} ${isMobileMenuOpen ? styles.hamburgerBarOpen : ""}`}
          ></span>
          <span
            className={`${styles.hamburgerBar} ${isMobileMenuOpen ? styles.hamburgerBarOpen : ""}`}
          ></span>
          <span
            className={`${styles.hamburgerBar} ${isMobileMenuOpen ? styles.hamburgerBarOpen : ""}`}
          ></span>
        </button>

        {isMobileMenuOpen && (
          <div className={styles.mobileOverlay} onClick={closeMobileMenu}></div>
        )}

        <ul
          className={`${styles.navbarMenu} ${isMobileMenuOpen ? styles.navbarMenuOpen : ""}`}
        >
          <li>
            <Link href="/" onClick={closeMobileMenu}>
              Home
            </Link>
          </li>
          <li className={styles.navbarDropdown} ref={productsDropdownRef}>
            <button
              className={styles.navbarDropdownButton}
              onClick={() => setIsProductsDropdownOpen(!isProductsDropdownOpen)}
              aria-expanded={isProductsDropdownOpen}
              aria-haspopup="true"
            >
              Products
              <span
                className={`${styles.dropdownArrow} ${isProductsDropdownOpen ? styles.arrowOpen : ""}`}
              >
                ▼
              </span>
            </button>
            {isProductsDropdownOpen && (
              <ul className={styles.dropdownMenu}>
                {NAVBAR_PRODUCTS_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={styles.dropdownItem}
                      onClick={closeMobileMenu}
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
          <li>
            <Link href="/about-us" onClick={closeMobileMenu}>
              About Us
            </Link>
          </li>

          {isAuthenticated ? (
            <li className={styles.navbarDropdown} ref={accountDropdownRef}>
              <button
                onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                className={styles.accountButton}
              >
                <FaCircleUser size={24} />
                <span>{user?.name?.split(" ")[0] || "Account"}</span>
                <span
                  className={`${styles.dropdownArrow} ${isAccountDropdownOpen ? styles.arrowOpen : ""}`}
                >
                  {" "}
                </span>
              </button>
              {isAccountDropdownOpen && (
                <ul
                  className={`${styles.dropdownMenu} ${styles.accountDropdownMenu}`}
                >
                  {NAVBAR_ACCOUNT_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={styles.dropdownItem}
                        onClick={closeMobileMenu}
                      >
                        {link.text}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={handleLogout}
                      className={styles.dropdownItem}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </li>
          ) : (
            <li>
              <Link href="/login" onClick={closeMobileMenu}>
                SignUp/Log In
              </Link>
            </li>
          )}

          {!isAuthenticated && (
            <li>
              <button className={styles.navbarCta} onClick={closeMobileMenu}>
                Call Us
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
