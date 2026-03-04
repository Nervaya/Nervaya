import Link from 'next/link';
import Sidebar from '@/components/Sidebar/LazySidebar';
import WhatAreSection from '@/components/DriftOff/WhatAreSection';
import WhyChooseSection from '@/components/DriftOff/WhyChooseSection';
import DriftOffAboutHowItWorks from '@/components/DriftOff/DriftOffAboutHowItWorks';
import WhatMakesDifferentSection from '@/components/DriftOff/WhatMakesDifferentSection';
import styles from './styles.module.css';

export default function DriftOffAboutPage() {
  return (
    <Sidebar>
      <div className={styles.wrapper}>
        <header className={styles.pageHeader}>
          <div className={styles.pageHeaderInner}>
            <div>
              <h1 className={styles.pageHeaderTitle}>Deep Rest Sessions</h1>
              <p className={styles.pageHeaderSubtitle}>
                Experience personalized audio sessions designed to transform your sleep
              </p>
            </div>
            <Link href="/drift-off/payment" className={styles.buyBtn}>
              Buy Session &gt;
            </Link>
          </div>
        </header>

        <div className={styles.container}>
          <section className={styles.section} aria-labelledby="what-are-heading">
            <h2 id="what-are-heading" className={styles.sectionTitle}>
              What Are Deep Rest Sessions?
            </h2>
            <WhatAreSection />
          </section>

          <section className={styles.section} aria-labelledby="why-choose-heading">
            <h2 id="why-choose-heading" className={styles.sectionTitle}>
              Why Choose Deep Rest Sessions?
            </h2>
            <WhyChooseSection />
          </section>

          <section className={styles.section} aria-labelledby="how-it-works-heading">
            <h2 id="how-it-works-heading" className={styles.sectionTitle}>
              How Deep Rest Sessions Work
            </h2>
            <DriftOffAboutHowItWorks />
          </section>

          <section className={styles.section} aria-labelledby="what-makes-heading">
            <h2 id="what-makes-heading" className={styles.sectionTitle}>
              What Makes Deep Rest Sessions Different?
            </h2>
            <WhatMakesDifferentSection />
          </section>
        </div>
      </div>
    </Sidebar>
  );
}
