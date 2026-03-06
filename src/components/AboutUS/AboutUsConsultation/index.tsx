'use client';

import { useState } from 'react';
import styles from './styles.module.css';
import { Icon } from '@iconify/react';
import { ICON_CHAT, ICON_USER, ICON_MAIL, ICON_CALENDAR, ICON_VIDEO } from '@/constants/icons';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import { Dropdown } from '@/components/common';

interface AboutUsConsultationProps {
  centerCard?: boolean;
}

const AboutUsConsultation = ({ centerCard = false }: AboutUsConsultationProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    connectionType: 'Google Meet',
    email: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const connectionOptions = [
    { value: 'Google Meet', label: 'Google Meet' },
    { value: 'Zoom', label: 'Zoom' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <section className={`${styles.consultationSection} ${centerCard ? styles.consultationSectionCentered : ''}`}>
      <div className={`${styles.formCard} ${centerCard ? styles.formCardAligned : ''}`}>
        <div className={styles.cardHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.titleWrapper}>
              <Icon icon={ICON_CHAT} className={styles.titleIcon} />
              <h2 className={styles.formTitle}>Free 1 on 1 Assistance</h2>
            </div>
            <p className={styles.formSubtitle}>
              Connect with our sleep experts for personalized guidance on your journey to better rest.
            </p>
          </div>
          <div className={styles.freeSessionBadge}>
            <span className={styles.badgeText}>Free Session</span>
            <span className={styles.badgeDuration}>30 minutes</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formLeft}>
              <Input
                label="First Name"
                labelIcon={<Icon icon={ICON_USER} className={styles.labelIcon} />}
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                containerClassName={styles.customInputContainer}
                className={styles.customInput}
              />

              <Input
                label="Last Name"
                labelIcon={<Icon icon={ICON_USER} className={styles.labelIcon} />}
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                containerClassName={styles.customInputContainer}
                className={styles.customInput}
              />

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>
                  <Icon icon={ICON_CALENDAR} className={styles.labelIcon} />
                  How would you like to connect?
                </label>
                <div className={styles.selectWrapper}>
                  <Icon icon={ICON_VIDEO} className={styles.selectIcon} aria-hidden />
                  <Dropdown
                    id="connectionType"
                    options={connectionOptions}
                    value={formData.connectionType}
                    onChange={(value) => setFormData({ ...formData, connectionType: value })}
                    ariaLabel="How would you like to connect?"
                    className={styles.connectionDropdown}
                  />
                </div>
              </div>
            </div>

            <div className={styles.formRight}>
              <div className={styles.inputGroup}>
                <Input
                  label="Email Address"
                  labelIcon={<Icon icon={ICON_MAIL} className={styles.labelIcon} />}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  containerClassName={styles.customInputContainer}
                  className={styles.customInput}
                />
                <p className={styles.inputHint}>We&apos;ll send the Google Meet link here</p>
              </div>

              <div className={styles.expectSection}>
                <h3 className={styles.expectTitle}>What to expect</h3>
                <ul className={styles.expectList}>
                  <li className={styles.expectItem}>Personalized sleep assessment</li>
                  <li className={styles.expectItem}>Custom recommendations</li>
                  <li className={styles.expectItem}>Answer all your questions</li>
                </ul>
              </div>
            </div>
          </div>

          <div className={styles.formFooter}>
            <Button type="submit" variant="primary" className={styles.submitButton}>
              <Icon icon={ICON_CALENDAR} className={styles.buttonIcon} />
              Schedule Free Consultation
            </Button>
            <p className={styles.footerText}>We&apos;ll respond within 24 hours to confirm your appointment</p>
          </div>
        </form>
      </div>
    </section>
  );
};

export default AboutUsConsultation;
