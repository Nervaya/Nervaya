import Link from 'next/link';
import Image from 'next/image';
import styles from './styles.module.css';

interface NavbarLogoProps {
  isAuthPage?: boolean;
}

export function NavbarLogo({ isAuthPage = false }: NavbarLogoProps) {
  const logoWidth = isAuthPage ? 160 : 110;
  const logoHeight = isAuthPage ? 52 : 36;

  return (
    <div className={styles.navbarLogo}>
      <Link href="/">
        <Image src="/icons/nervaya-logo.svg" alt="Nervaya logo" width={logoWidth} height={logoHeight} />
      </Link>
    </div>
  );
}

export default NavbarLogo;
