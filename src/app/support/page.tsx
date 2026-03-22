import Sidebar from '@/components/Sidebar/LazySidebar';
import SupportHeader from '@/components/Support/SupportHeader';
import ChatWithUs from '@/components/Support/ChatWithUs';
import FrequentlyAskedQuestions from '@/components/Support/FrequentlyAskedQuestions';
import AboutUsConsultation from '@/components/AboutUS/AboutUsConsultation';
import { type BreadcrumbItem } from '@/components/common';
import PageHeader from '@/components/PageHeader/PageHeader';
import styles from './support.module.css';

const SupportPage = () => {
  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/dashboard' }, { label: 'Support' }];

  return (
    <Sidebar hideGlobalBreadcrumbs>
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <PageHeader breadcrumbs={breadcrumbs} />
          <SupportHeader />
          <ChatWithUs />
          <FrequentlyAskedQuestions />
          <AboutUsConsultation />
        </div>
      </div>
    </Sidebar>
  );
};

export default SupportPage;
