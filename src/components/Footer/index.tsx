import Image from "next/image";
import Link from "next/link";
import styles from './styles.module.css';

const Footer = () => (
    <footer className={styles['footer-container']}>
        <div className={styles['logo-container']}>
            <Image src="./icons/nervaya-logo.svg" width={180} height={60} className={styles['footer-logo']} alt="Nervaya" />
            <ul className={styles['social-links']}>
                <li className={styles['social-img']}>
                    <Image src="./icons/linked_in.svg" width={25} height={25} alt="linked_in" />
                </li>

                <li className={styles['social-img']}>
                    <Image src="./icons/twitter.svg" width={25} height={25} alt="twitter" />
                </li>

                <li className={styles['social-img']}>
                    <Image src="./icons/instagram.svg" width={25} height={25} alt="instagram" />
                </li>
            </ul>
        </div>

        <ul className={styles['nervaya-link-container']}>
            <li className={styles['link-box']}>
                <Link href="/therapy" className={styles['link']}>Therapy</Link>
                <Link href="/drift-off" className={styles['link']}>Drift Off</Link>
                <Link href="/sleep-elixir" className={styles['link']}>Sleep Elixir</Link>
                <Link href="/blog" className={styles['link']}>Blog</Link>
            </li>

            <li className={styles['link-box']}>
                <Link href="/about-us" className={styles['link']}>About Us</Link>
                <Link href="/privacy-policy" className={styles['link']}>Privacy Policy</Link>
                <Link href="/terms-and-conditions" className={styles['link']}>Terms & Cond.</Link>
                <Link href="/delivery-policy" className={styles['link']}>Delivery Policy</Link>
            </li>

            <li className={styles['link-box']}>
                <Link href="/for-therapists" className={styles['link']}>For Therapists</Link>
                <Link href="/for-counselors" className={styles['link']}>For Counselors</Link>
                <Link href="/for-yoga-trainers" className={styles['link']}>For Yoga Trainers</Link>
            </li>
        </ul>
    </footer>
);

export default Footer;