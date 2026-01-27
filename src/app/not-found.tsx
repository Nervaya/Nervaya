'use client';

import Link from 'next/link';
import styles from './not-found.module.css';
import { LazyMotion, m } from 'framer-motion';

export default function NotFound() {
  return (
    <LazyMotion features={() => import('framer-motion').then((mod) => mod.domAnimation)}>
      <div className={styles.container}>
        <m.div
          className={styles.glow}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <m.div
          className={styles.secondaryGlow}
          animate={{
            translateY: [0, -30, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <div className={styles.content}>
          <m.h1
            className={styles.title}
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            404
          </m.h1>

          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <h2 className={styles.subtitle}>Page Not Found</h2>

            <p className={styles.description}>
              This page is currently dreaming. Let&apos;s get you back to wakefulness.
            </p>
          </m.div>

          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
          >
            <Link href="/" className={styles.button}>
              Return Home
            </Link>
          </m.div>
        </div>
      </div>
    </LazyMotion>
  );
}
