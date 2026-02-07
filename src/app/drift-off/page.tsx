import Sidebar from '@/components/Sidebar/LazySidebar';
import PageHeader from '@/components/PageHeader/PageHeader';
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
        <PageHeader
          title="Drift Off"
          subtitle="No more hoping to find the right sessions."
          description="You are as unique as your needs and our specialists will curate a 25 min Deep Rest Session for you targeting your special needs."
        />
        <DriftOffHero />
        <HowItWorks />
        <PlaylistSection />
        <SupportCards />
        <Testimonials />
      </div>
    </Sidebar>
  );
}
