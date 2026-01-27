import Image from 'next/image';
import Link from 'next/link';
import { FOOTER_LINK_GROUPS, SOCIAL_LINKS } from '@/utils/footerConstants';
import styles from './styles.module.css';

const Footer = () => (
  <footer className={styles['footer-container']}>
    <div className={styles['logo-container']}>
      <Image
        src="./icons/nervaya-logo.svg"
        width={180}
        height={60}
        className={styles['footer-logo']}
        alt="Nervaya"
      />
      <ul className={styles['social-links']}>
        {SOCIAL_LINKS.map((social) => (
          <li key={social.name} className={styles['social-img']}>
            <Image src={social.icon} width={25} height={25} alt={social.alt} />
          </li>
        ))}
      </ul>
    </div>

    <ul className={styles['nervaya-link-container']}>
      {FOOTER_LINK_GROUPS.map((group) => (
        <li
          key={group.links[0]?.href || 'group'}
          className={styles['link-box']}
        >
          {group.links.map((link) => (
            <Link key={link.href} href={link.href} className={styles['link']}>
              {link.text}
            </Link>
          ))}
        </li>
      ))}
    </ul>
  </footer>
);

export default Footer;
