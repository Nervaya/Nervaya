'use client';

import Image from "next/image";
import Link from "next/link";
import styles from "./index.module.css";

const Navbar = () => (
    <nav className={styles.navbar}>
        <div className={styles.navbarContainer}>
            <div className={styles.navbarLogo}>
                <Image src="/icons/nervaya-logo.svg" alt="logo" width={200} height={200} />
            </div>
            <ul className={styles.navbarMenu}>
                <li>
                    <Link href="/">Home</Link>
                </li>
                <li className={styles.navbarDropdown}>
                    <select className={styles.navbarSelect}>
                        <option value="">Products</option>
                        <option value="therapy">Therapy</option>
                        <option value="drift-off">Drift Off</option>
                        <option value="sleep-elixir">Sleep Elixir</option>
                    </select>
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

export default Navbar;