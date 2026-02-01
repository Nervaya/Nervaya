import Sidebar from '@/components/Sidebar/LazySidebar';
import DriftOffHero from '@/components/DriftOff/DriftOffHero';
import HowItWorks from '@/components/DriftOff/HowItWorks';
import PlaylistSection from '@/components/DriftOff/PlaylistSection';
import SupportCards from '@/components/DriftOff/SupportCards';
import Testimonials from '@/components/DriftOff/Testimonials';
import styles from './styles.module.css';

export default function DriftOffPage() {
  return (
    <Sidebar>
      <div className={styles.container}>
        <DriftOffHero />
        <HowItWorks />
        <PlaylistSection />
        <SupportCards />
        <Testimonials />
      </div>
    </Sidebar>
  );
}
