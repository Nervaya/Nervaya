'use client';

import styles from './styles.module.css';
import { FaWhatsapp } from 'react-icons/fa6';
import { IoChatbubbleEllipsesOutline } from 'react-icons/io5';
import Button from '@/components/common/Button/Button';

const ChatWithUs = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = '1234567890';
    const message = encodeURIComponent('Hello! I need support with your product.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <section className={styles.supportSection}>
      <div className={styles.chatBanner}>
        <div className={styles.whatsappIconContainer}>
          <FaWhatsapp className={styles.whatsappIcon} />
        </div>
        <div className={styles.bannerText}>
          <h2 className={styles.bannerTitle}>Chat with Us</h2>
          <p className={styles.bannerSubtitle}>
            Have questions about the product? Let us support your journey to restful sleep.
          </p>
        </div>
      </div>
      <div className={styles.supportCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIcon}>
            <IoChatbubbleEllipsesOutline />
          </div>
          <h3 className={styles.cardTitle}>Get Instant Support</h3>
        </div>
        <p className={styles.cardDescription}>
          Connect with our sleep wellness experts directly on WhatsApp. Get personalized guidance, product
          recommendations, and answers to all your questions about achieving better sleep.
        </p>
      </div>
      <div className={styles.buttonContainer}>
        <Button variant="primary" className={styles.whatsappButton} onClick={handleWhatsAppClick}>
          <IoChatbubbleEllipsesOutline className={styles.buttonIcon} />
          Chat with Us on WhatsApp
        </Button>
        <p className={styles.disclaimer}>We typically respond within 2 hours. Your information is kept confidential.</p>
      </div>

      <div className={styles.featuresGrid}>
        <div className={styles.featureCard}>
          <div className={styles.featureValue}>24/7</div>
          <div className={styles.featureLabel}>Available</div>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureValue}>{'<2 hr'}</div>
          <div className={styles.featureLabel}>Response Time</div>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureValue}>100%</div>
          <div className={styles.featureLabel}>Confidential</div>
        </div>
      </div>
    </section>
  );
};

export default ChatWithUs;
