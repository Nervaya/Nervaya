import Sidebar from '@/components/Sidebar/LazySidebar';
import { DriftOffPageTracker } from './DriftOffPageTracker';
import DriftOffLandingHero from '@/components/DriftOff/DriftOffLandingHero';
import MySessionsSection from '@/components/DriftOff/MySessionsSection';
import HowItWorks from '@/components/DriftOff/HowItWorks';
import PlaylistSection from '@/components/DriftOff/PlaylistSection';
import SupportCards from '@/components/DriftOff/SupportCards';
import Testimonials from '@/components/DriftOff/Testimonials';
import styles from './styles.module.css';

export default function DriftOffPage() {
  return (
    <Sidebar>
      <DriftOffPageTracker />
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <DriftOffLandingHero />

          <section className={styles.section} aria-labelledby="my-sessions-heading">
            <h2 id="my-sessions-heading" className={styles.sectionTitle}>
              My Deep Rest Sessions
            </h2>
            <MySessionsSection />
          </section>

          <section className={styles.section} aria-labelledby="how-it-works-heading">
            <h2 id="how-it-works-heading" className={styles.sectionTitle}>
              How It Works
            </h2>
            <HowItWorks />
          </section>

          <section className={styles.section} aria-labelledby="playlists-heading">
            <h2 id="playlists-heading" className={styles.sectionTitle}>
              Playlists Made For You
            </h2>
            <PlaylistSection />
          </section>

          <section className={styles.section} aria-labelledby="support-heading">
            <h2 id="support-heading" className={styles.sectionTitle}>
              Support & Assistance
            </h2>
            <SupportCards />
          </section>

          <section className={styles.section} aria-labelledby="testimonials-heading">
            <h2 id="testimonials-heading" className={styles.sectionTitle}>
              Testimonials
            </h2>
            <Testimonials />
          </section>
        </div>
      </div>
    </Sidebar>
  );
}
