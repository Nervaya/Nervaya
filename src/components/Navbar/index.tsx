'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import styles from "./index.module.css";

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

    return (
        <nav className={styles.navbar}>
            <div className={styles.navbarContainer}>
                <div className={styles.navbarLogo}>
                    <Image src="/icons/nervaya-logo.svg" alt="logo" width={150} height={50} />
                </div>
                <ul className={styles.navbarMenu}>
                    <li>
                        <Link href="/">Home</Link>
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
                                    <Link href="/therapy" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>Therapy</Link>
                                </li>
                                <li>
                                    <Link href="/drift-off" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>Drift Off</Link>
                                </li>
                                <li>
                                    <Link href="/sleep-elixir" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>Sleep Elixir</Link>
                                </li>
                            </ul>
                        )}
                    </li>
                    <li>
                        <Link href="/about">About Us</Link>
                    </li>
                    <li>
                        <Link href="/sign-up">SignUp/Log In</Link>
                    </li>
                    <li>
                        <button className={styles.navbarCta}>
                            Call Us
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;