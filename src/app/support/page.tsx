import Sidebar from '@/components/Sidebar/LazySidebar';
import SupportHeader from '@/components/Support/SupportHeader';
import ChatWithUs from '@/components/Support/ChatWithUs';
import FrequentlyAskedQuestions from '@/components/Support/FrequentlyAskedQuestions';
import AboutUsConsultation from '@/components/AboutUS/AboutUsConsultation';
import styles from './support.module.css';

const SupportPage = () => {
  return (
    <Sidebar>
      <div className={styles.wrapper}>
        <div className={styles.container}>
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
