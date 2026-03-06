'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Icon } from '@iconify/react';
import { ICON_PLAY } from '@/constants/icons';
import { DRIFT_OFF_LANDING_VIDEO_URL } from '@/lib/constants/driftOff.constants';
import type { VideoPlayerProps } from '../VideoPlayer';
import styles from './styles.module.css';

const VideoPlayerDynamic = dynamic(() => import('../VideoPlayer'), {
  ssr: false,
}) as React.ComponentType<VideoPlayerProps>;

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const DriftOffLandingHero = () => {
  const hasMounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
  const [playing, setPlaying] = useState(false);

  return (
    <section className={styles.hero} aria-label="Drift Off hero">
      <div className={styles.heroLeft}>
        <span className={styles.badge}>Unleashing full power of Neuroplasticity</span>
        <h1 className={styles.title}>Deep Rest Sessions</h1>
        <p className={styles.description}>
          No more longing for the right session. You are as unique as your needs and our specialists will curate a 25
          min Deep Rest Session for you targeting your special mental needs.
        </p>
        <div className={styles.actions}>
          <Link href="/drift-off/payment" className={styles.btnPrimary}>
            Buy Custom Session
          </Link>
          <Link href="/drift-off/about" className={styles.btnOutline}>
            Know More
          </Link>
        </div>
      </div>

      <div className={styles.heroRight}>
        <div className={styles.videoCard}>
          <div className={styles.videoWrapper}>
            {hasMounted && (
              <VideoPlayerDynamic
                url={DRIFT_OFF_LANDING_VIDEO_URL}
                width="100%"
                height="100%"
                playing={playing}
                controls
                className={styles.playerAbsolute}
                onPlay={() => setPlaying(true)}
              />
            )}
            {!playing && (
              <button
                type="button"
                className={styles.playButton}
                onClick={() => setPlaying(true)}
                aria-label="Play sample video"
              >
                <Icon icon={ICON_PLAY} width={18} height={18} aria-hidden />
              </button>
            )}
          </div>
          <div className={styles.videoMeta}>
            <span className={styles.videoTitle}>
              Sample Guided Meditation <span className={styles.dot}>●</span>
            </span>
            <span className={styles.videoAuthor}>By Practia</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DriftOffLandingHero;
