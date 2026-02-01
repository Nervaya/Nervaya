'use client';

import { useState, useEffect } from 'react';
import { Session } from '@/types/session.types';
import { Therapist } from '@/types/therapist.types';
import styles from './styles.module.css';

export default function MySessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmCancel, setConfirmCancel] = useState<{ sessionId: string } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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

  const handleCancelClick = (sessionId: string) => {
    setConfirmCancel({ sessionId });
    setActionError(null);
  };

  const handleCancelConfirm = async () => {
    if (!confirmCancel) return;
    const { sessionId } = confirmCancel;
    setConfirmCancel(null);
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel session');
      }

      fetchSessions();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error cancelling session');
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
      {confirmCancel && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmDialog}>
            <h3>Cancel Session</h3>
            <p>Are you sure you want to cancel this session?</p>
            {actionError && <p className={styles.confirmError}>{actionError}</p>}
            <div className={styles.confirmActions}>
              <button onClick={handleCancelConfirm} className={styles.confirmButton}>
                Cancel Session
              </button>
              <button onClick={() => setConfirmCancel(null)} className={styles.cancelButton}>
                Keep Session
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 className={styles.heading}>My Sessions</h2>

      {sessions.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No sessions booked yet</p>
        </div>
      ) : (
        <ul className={styles.sessionsList} aria-label="My sessions">
          {sessions.map((session) => {
            const therapist = session.therapistId as unknown as Therapist;

            return (
              <li key={session._id} className={styles.sessionCard}>
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
                  <button className={styles.cancelBtn} onClick={() => handleCancelClick(session._id)}>
                    Cancel Session
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
