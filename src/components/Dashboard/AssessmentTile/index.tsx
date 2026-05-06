import Link from 'next/link';
import { Icon } from '@iconify/react';
import {
  ICON_BED,
  ICON_CLOCK,
  ICON_ARROW_RIGHT,
  ICON_SPARKLES,
  ICON_SHIELD_CHECK,
  ICON_GRAPH,
} from '@/constants/icons';
import type { AssessmentTileModel } from '../dashboardViewModel.util';
import styles from './styles.module.css';

interface AssessmentTileProps {
  data: AssessmentTileModel;
}

export function AssessmentTile({ data }: AssessmentTileProps) {
  const { status, value, subtitle, description, bannerText, lastAssessed, ctaLabel } = data;

  const isCompleted = status === 'completed';

  if (!isCompleted) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span className={styles.badge}>SLEEP ASSESSMENT</span>
            <h2 className={styles.title}>{value}</h2>
          </div>
          <div className={styles.bedIconWrapper}>
            <Icon icon={ICON_BED} className={styles.bedIcon} />
          </div>
        </div>
        <p className={styles.subtitle}>{subtitle}</p>
        <Link href="/sleep-assessment" className={styles.startBtn}>
          {ctaLabel}
        </Link>
      </div>
    );
  }

  const renderBannerText = (text?: string) => {
    if (!text) return null;
    // Replace **text** with <strong>text</strong>
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // eslint-disable-next-line react/no-danger
    return <p className={styles.bannerText} dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.mainInfo}>
          <div className={styles.graphIconWrapper}>
            <Icon icon={ICON_GRAPH} className={styles.graphIcon} />
          </div>
          <div className={styles.titleGroup}>
            <span className={styles.badge}>
              SLEEP ASSESSMENT <span className={styles.separator}>•</span> {subtitle}
            </span>
            <h2 className={styles.title}>{value}</h2>
          </div>
        </div>
        <div className={styles.bedIconWrapper}>
          <Icon icon={ICON_BED} className={styles.bedIcon} />
        </div>
      </div>

      <div className={styles.content}>
        <p className={styles.description}>{description}</p>
      </div>

      <div className={styles.footer}>
        <div className={styles.lastAssessed}>
          <Icon icon={ICON_CLOCK} className={styles.clockIcon} />
          <span>Last assessed: {lastAssessed}</span>
        </div>

        <div className={styles.ctaGroup}>
          <Link href="/sleep-assessment" className={styles.viewPlanBtn}>
            {ctaLabel}
            <Icon icon={ICON_ARROW_RIGHT} className={styles.arrowIcon} />
          </Link>
          <div className={styles.tooltip}>
            <Icon icon={ICON_SPARKLES} className={styles.sparkleIcon} />
            <p>Explore your tailored recommendations, habits, and next best steps.</p>
          </div>
        </div>
      </div>

      <div className={styles.banner}>
        <div className={styles.shieldIconWrapper}>
          <Icon icon={ICON_SHIELD_CHECK} className={styles.shieldIcon} />
        </div>
        {renderBannerText(bannerText)}
      </div>
    </div>
  );
}
