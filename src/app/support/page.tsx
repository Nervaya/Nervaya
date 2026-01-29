import PageHeader from '@/components/PageHeader/PageHeader';
import ChatWithUs from '@/components/Support/ChatWithUs';
import FrequentlyAskedQuestions from '@/components/Support/FrequentlyAskedQuestions';
import AboutUsConsultation from '@/components/AboutUS/AboutUsConsultation';
import styles from './support.module.css';

const SupportPage = () => {
  return (
    <div className={styles.container}>
      <PageHeader
        title="Welcome to the Support Page"
        subtitle="We're here to help you with any problems you may be having with our product."
      />
      <ChatWithUs />
      <FrequentlyAskedQuestions />
      <AboutUsConsultation />
    </div>
  );
};

export default SupportPage;
