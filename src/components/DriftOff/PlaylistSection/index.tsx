'use client';

import { useSyncExternalStore, useState } from 'react';
import dynamic from 'next/dynamic';
import { FaPlay, FaInfinity } from 'react-icons/fa';
import { DRIFT_OFF_PLAYLIST_VIDEOS } from '@/lib/constants/driftOff.constants';
import styles from './styles.module.css';
import { VideoPlayerProps } from '../VideoPlayer';

const VideoPlayerDynamic = dynamic(() => import('../VideoPlayer'), {
  ssr: false,
}) as React.ComponentType<VideoPlayerProps>;

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const PlaylistSection = () => {
  const hasMounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
  const [playingId, setPlayingId] = useState<number | null>(null);

  return (
    <div className={styles.card}>
      <div className={styles.playlistHeader}>
        <div className={styles.accessBadge}>
          <FaInfinity /> Unlimited Lifetime Access
        </div>
      </div>

      <ul className={styles.playlistGrid} aria-label="Playlist videos">
        {DRIFT_OFF_PLAYLIST_VIDEOS.map((video) => (
          <li key={video.id} className={styles.videoCard}>
            <div className={styles.playlistVideoWrapper}>
              {hasMounted ? (
                <VideoPlayerDynamic
                  url={video.url}
                  width="100%"
                  height="100%"
                  playing={playingId === video.id}
                  controls
                  className={styles.playlistPlayerAbsolute}
                  onPlay={() => setPlayingId(video.id)}
                  light={playingId !== video.id}
                  playIcon={
                    <div className={styles.playlistPlayIcon}>
                      <FaPlay className={styles.playlistPlayIconSvg} color="#4f46e5" size={16} />
                    </div>
                  }
                />
              ) : null}

              {playingId !== video.id && (
                <>
                  <div className={`${styles.videoDuration} ${styles.videoCardOverlay}`}>{video.duration}</div>
                  <div className={`${styles.videoCardContent} ${styles.videoCardOverlay}`}>
                    <h3 className={styles.videoTitle}>
                      {video.title} <span className={styles.videoTitleDot}>●</span>
                    </h3>
                    <p className={styles.videoCardAuthor}>
                      {video.author}
                      {video.isFree && <span className={styles.freeBadgeSmall}>Free</span>}
                    </p>
                  </div>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlaylistSection;
