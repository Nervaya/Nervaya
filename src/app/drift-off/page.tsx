import Sidebar from '@/components/Sidebar/LazySidebar';
import PageHeader from '@/components/PageHeader/PageHeader';
import { DriftOffPageTracker } from './DriftOffPageTracker';
import DriftOffHero from '@/components/DriftOff/DriftOffHero';
import HowItWorks from '@/components/DriftOff/HowItWorks';
import PlaylistSection from '@/components/DriftOff/PlaylistSection';
import SupportCards from '@/components/DriftOff/SupportCards';
import Testimonials from '@/components/DriftOff/Testimonials';
import WhatAreSection from '@/components/DriftOff/WhatAreSection';
import WhatMakesDifferentSection from '@/components/DriftOff/WhatMakesDifferentSection';
import WhyChooseSection from '@/components/DriftOff/WhyChooseSection';
import styles from './styles.module.css';

export default function DriftOffPage() {
  return (
    <Sidebar>
      <DriftOffPageTracker />
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <PageHeader
            title="Drift Off"
            subtitle="No more hoping to find the right sessions."
            description="You are as unique as your needs and our specialists will curate a 25 min Deep Rest Session for you targeting your special needs."
          />

          <section className={styles.section} aria-labelledby="what-are-heading">
            <h2 id="what-are-heading" className={styles.sectionTitle}>
              What are Deep Rest Sessions?
            </h2>
            <WhatAreSection />
          </section>

          <section className={styles.section} aria-labelledby="why-choose-heading">
            <h2 id="why-choose-heading" className={styles.sectionTitle}>
              Why choose Deep Rest Sessions?
            </h2>
            <WhyChooseSection />
          </section>

          <section className={styles.section} aria-labelledby="sample-session-heading">
            <h2 id="sample-session-heading" className={styles.sectionTitle}>
              Sample session
            </h2>
            <DriftOffHero />
          </section>

          <section className={styles.section} aria-labelledby="how-it-works-heading">
            <h2 id="how-it-works-heading" className={styles.sectionTitle}>
              How it works
            </h2>
            <HowItWorks />
          </section>

          <section className={styles.section} aria-labelledby="playlists-heading">
            <h2 id="playlists-heading" className={styles.sectionTitle}>
              Playlists made for you
            </h2>
            <PlaylistSection />
          </section>

          <section className={styles.section} aria-labelledby="what-makes-heading">
            <h2 id="what-makes-heading" className={styles.sectionTitle}>
              What makes Deep Rest Sessions different?
            </h2>
            <WhatMakesDifferentSection />
          </section>

          <section className={styles.section} aria-labelledby="support-heading">
            <h2 id="support-heading" className={styles.sectionTitle}>
              Support
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
