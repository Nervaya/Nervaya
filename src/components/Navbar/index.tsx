'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import styles from "./styles.module.css";

const Navbar = () => {
    const pathname = usePathname();
    const isHomePage = pathname === '/';
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLLIElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

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

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
        setIsDropdownOpen(false);
    };

    return (
        <nav className={`${styles.navbar} ${isHomePage ? styles.navbarTransparent : styles.navbarBlack}`}>
            <div className={styles.navbarContainer}>
                <div className={styles.navbarLogo}>
                    <Image src="/icons/nervaya-logo.svg" alt="logo" width={150} height={50} />
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

                {isMobileMenuOpen && (
                    <div className={styles.mobileOverlay} onClick={closeMobileMenu}></div>
                )}

                <ul className={`${styles.navbarMenu} ${isMobileMenuOpen ? styles.navbarMenuOpen : ''}`}>
                    <li>
                        <Link href="/" onClick={closeMobileMenu}>Home</Link>
                    </li>
                    <li className={styles.navbarDropdown} ref={dropdownRef}>
                        <button
                            className={styles.navbarDropdownButton}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            aria-expanded={isDropdownOpen}
                            aria-haspopup="true"
                        >
                            Products
                            <span className={`${styles.dropdownArrow} ${isDropdownOpen ? styles.arrowOpen : ''}`}>▼</span>
                        </button>
                        {isDropdownOpen && (
                            <ul className={styles.dropdownMenu}>
                                <li>
                                    <Link href="/therapy" className={styles.dropdownItem} onClick={closeMobileMenu}>Therapy</Link>
                                </li>
                                <li>
                                    <Link href="/drift-off" className={styles.dropdownItem} onClick={closeMobileMenu}>Drift Off</Link>
                                </li>
                                <li>
                                    <Link href="/sleep-elixir" className={styles.dropdownItem} onClick={closeMobileMenu}>Sleep Elixir</Link>
                                </li>
                            </ul>
                        )}
                    </li>
                    <li>
                        <Link href="/about-us" onClick={closeMobileMenu}>About Us</Link>
                    </li>
                    <li>
                        <Link href="/login" onClick={closeMobileMenu}>SignUp/Log In</Link>
                    </li>
                    <li>
                        <button className={styles.navbarCta} onClick={closeMobileMenu}>
                            Call Us
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;