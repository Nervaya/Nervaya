import styles from './LoadingScreen.module.css';
import { LottieLoader } from '@/components/common';

export default function LoadingScreen() {
  return (
    <div className={styles.loadingContainer}>
      <LottieLoader width={200} height={200} />
    </div>
  );
}
