import { memo, useMemo } from 'react';
import { IoChevronDownOutline } from 'react-icons/io5';
import { PrivacySection } from '@/utils/privacyPolicyData';
import styles from './styles.module.css';

interface PrivacyPolicySectionProps {
  section: PrivacySection;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const PrivacyPolicySection = memo(({ section, isOpen, onToggle, children }: PrivacyPolicySectionProps) => {
  const iconClassName = useMemo(() => {
    return `${styles.accordionIcon} ${isOpen ? styles.accordionIconOpen : ''}`;
  }, [isOpen]);

  return (
    <section id={section.id} className={styles.section}>
      <div className={styles.sectionNumber}>{section.number}</div>
      <button className={styles.sectionHeader} onClick={onToggle} aria-expanded={isOpen}>
        <h2 className={styles.sectionTitle}>{section.title}</h2>
        <IoChevronDownOutline className={iconClassName} />
      </button>
      {isOpen && <div className={styles.sectionContent}>{children}</div>}
    </section>
  );
});

PrivacyPolicySection.displayName = 'PrivacyPolicySection';

export default PrivacyPolicySection;
