'use client';

import React from 'react';
import Link from 'next/link';
import styles from './styles.module.css';

interface SessionRow {
  _id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime?: string;
  status: string;
  therapistId?: { name?: string } | string;
}

export interface UpcomingSessionsProps {
  sessions: SessionRow[];
  emptyMessage?: string;
}

export default function UpcomingSessions({ sessions, emptyMessage = 'No upcoming sessions.' }: UpcomingSessionsProps) {
  if (!sessions?.length) {
    return (
      <div className={styles.empty} role="status">
        {emptyMessage}
      </div>
    );
  }
  return (
    <ul className={styles.list} aria-label="Upcoming sessions">
      {sessions.map((session) => {
        const therapist = session.therapistId;
        const name = typeof therapist === 'object' && therapist && 'name' in therapist ? therapist.name : '—';
        return (
          <li key={session._id} className={styles.item}>
            <div className={styles.main}>
              <span className={styles.date}>{new Date(session.date).toLocaleDateString()}</span>
              <span className={styles.time}>
                {session.startTime}
                {session.endTime ? ` – ${session.endTime}` : ''}
              </span>
              <span className={styles.therapist}>{name}</span>
              <span className={styles.badge}>{session.status}</span>
            </div>
            <span className={styles.userId}>User: {String(session.userId).slice(0, 8)}…</span>
          </li>
        );
      })}
      <li className={styles.footer}>
        <Link href="/admin/sessions" className={styles.link}>
          View all sessions
        </Link>
      </li>
    </ul>
  );
}
