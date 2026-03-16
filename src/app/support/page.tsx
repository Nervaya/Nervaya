import Sidebar from '@/components/Sidebar/LazySidebar';
import SupportHeader from '@/components/Support/SupportHeader';
import ChatWithUs from '@/components/Support/ChatWithUs';
import FrequentlyAskedQuestions from '@/components/Support/FrequentlyAskedQuestions';
import AboutUsConsultation from '@/components/AboutUS/AboutUsConsultation';
import Breadcrumbs, { type BreadcrumbItem } from '@/components/common/Breadcrumbs';
import styles from './support.module.css';

const SupportPage = () => {
  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/dashboard' }, { label: 'Support' }];

  return (
    <Sidebar hideGlobalBreadcrumbs>
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={`${styles.breadcrumbsWrapper} breadcrumbs-slot`}>
            <Breadcrumbs items={breadcrumbs} />
          </div>
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
