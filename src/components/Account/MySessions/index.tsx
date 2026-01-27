'use client';

import { useState, useEffect } from 'react';
import { Session } from '@/types/session.types';
import { Therapist } from '@/types/therapist.types';
import styles from './styles.module.css';

export default function MySessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const result = await response.json();
      setSessions(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Are you sure you want to cancel this session?')) {
      return;
    }

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel session');
      }

      fetchSessions();
    } catch (err) {
      // eslint-disable-next-line no-alert
      window.alert(err instanceof Error ? err.message : 'Error cancelling session');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const baseClass = styles.statusBadge;
    return `${baseClass} ${styles[`status${status.charAt(0).toUpperCase()}${status.slice(1)}`]}`;
  };

  if (loading) {
    return <div className={styles.loading}>Loading sessions...</div>;
  }
  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>My Sessions</h2>

      {sessions.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No sessions booked yet</p>
        </div>
      ) : (
        <div className={styles.sessionsList}>
          {sessions.map((session) => {
            // The user's JSON shows 'therapistId' is the populated object
            const therapist = session.therapistId as unknown as Therapist;

            return (
              <div key={session._id} className={styles.sessionCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.therapistInfo}>
                    <h3 className={styles.therapistName}>{therapist?.name || 'Unknown Therapist'}</h3>
                    <p className={styles.qualifications}>{therapist?.qualifications?.join(', ')}</p>
                  </div>
                  <span className={getStatusBadgeClass(session.status)}>{session.status}</span>
                </div>

                <div className={styles.sessionDetails}>
                  <p>📅 {new Date(session.date).toLocaleDateString()}</p>
                  <p>
                    🕐 {session.startTime} - {session.endTime}
                  </p>
                </div>

                {session.status === 'pending' && (
                  <button className={styles.cancelBtn} onClick={() => handleCancelSession(session._id)}>
                    Cancel Session
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
