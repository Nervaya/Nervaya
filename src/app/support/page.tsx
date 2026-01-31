import SupportHeader from '@/components/Support/SupportHeader';
import ChatWithUs from '@/components/Support/ChatWithUs';
import FrequentlyAskedQuestions from '@/components/Support/FrequentlyAskedQuestions';
import AboutUsConsultation from '@/components/AboutUS/AboutUsConsultation';
import styles from './support.module.css';

const SupportPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <SupportHeader />
        <ChatWithUs />
        <FrequentlyAskedQuestions />
        <AboutUsConsultation />
      </div>
    </div>
  );
};

export default SupportPage;
