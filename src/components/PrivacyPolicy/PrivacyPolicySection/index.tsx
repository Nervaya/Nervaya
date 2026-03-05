import { memo, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { ICON_ARROW_DOWN } from '@/constants/icons';
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
        <Icon icon={ICON_ARROW_DOWN} className={iconClassName} width={20} height={20} aria-hidden />
      </button>
      {isOpen && <div className={styles.sectionContent}>{children}</div>}
    </section>
  );
});

PrivacyPolicySection.displayName = 'PrivacyPolicySection';

export default PrivacyPolicySection;
