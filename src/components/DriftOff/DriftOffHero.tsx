'use client';

import Link from 'next/link';
import { useSyncExternalStore, useState } from 'react';
import dynamic from 'next/dynamic';
import { FaPlay } from 'react-icons/fa';
import {
  DRIFT_OFF_HERO_VIDEO_AUTHOR,
  DRIFT_OFF_HERO_VIDEO_IS_FREE,
  DRIFT_OFF_HERO_VIDEO_TITLE,
  DRIFT_OFF_HERO_VIDEO_URL,
} from '@/lib/constants/driftOff.constants';
import styles from './styles.module.css';
import { VideoPlayerProps } from './VideoPlayer';

const VideoPlayerDynamic = dynamic(() => import('./VideoPlayer'), {
  ssr: false,
}) as React.ComponentType<VideoPlayerProps>;

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const DriftOffHero = () => {
  const hasMounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
  const [playing, setPlaying] = useState(false);

  return (
    <div className={styles.card}>
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={`${styles.cardHeading} ${styles.heroHeading}`}>Deep Rest Sessions</h1>
          <span className={styles.neuroTag}>Full power of Neuroplasticity</span>
          <p className={styles.cardParagraph}>
            No more hoping to find the right sessions. You are as unique as your needs and our specialists will curate a
            25 min Deep Rest Session for you targeting your special needs.
          </p>
          <div className={styles.heroButtons}>
            <Link href="#" className={styles.buttonPrimary}>
              Buy Custom Session &gt;
            </Link>
            <Link href="#" className={styles.buttonSecondary}>
              Know More &gt;
            </Link>
          </div>
        </div>

        <div className={styles.heroVideoCard}>
          <div className={styles.heroVideoWrapper}>
            {hasMounted && (
              <VideoPlayerDynamic
                url={DRIFT_OFF_HERO_VIDEO_URL}
                width="100%"
                height="100%"
                playing={playing}
                controls
                className={styles.heroPlayerAbsolute}
                onPlay={() => setPlaying(true)}
              />
            )}

            {!playing && (
              <>
                <div className={styles.heroVideoOverlay}>
                  <h3 className={styles.heroVideoOverlayTitle}>
                    {DRIFT_OFF_HERO_VIDEO_TITLE} <span className={styles.videoTitleDot}>●</span>
                  </h3>
                  <p className={styles.heroVideoOverlayAuthor}>
                    {DRIFT_OFF_HERO_VIDEO_AUTHOR}{' '}
                    {DRIFT_OFF_HERO_VIDEO_IS_FREE && <span className={styles.freeBadge}>Free</span>}
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.heroPlayButton}
                  onClick={() => setPlaying(true)}
                  aria-label="Play video"
                >
                  <FaPlay className={styles.heroPlayButtonIcon} color="#4f46e5" size={20} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriftOffHero;
