'use client';

import { useState } from 'react';
import type { IDriftOffResponse } from '@/types/driftOff.types';
import type { ISleepAssessmentQuestion } from '@/types/sleepAssessment.types';
import styles from './styles.module.css';

interface UserSessionGroupProps {
  userResponses: IDriftOffResponse[];
  questions: ISleepAssessmentQuestion[];
  onAssignToResponse: (responseId: string) => void;
  getQuestionText: (questionId: string) => string;
  formatAnswer: (answer: string | string[]) => string;
}

const SESSIONS_PER_PAGE = 1;

const UserSessionGroup = ({
  userResponses,
  questions,
  onAssignToResponse,
  getQuestionText,
  formatAnswer,
}: UserSessionGroupProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedResponses, setExpandedResponses] = useState<Set<string>>(new Set());

  const totalSessions = userResponses.length;
  const totalPages = Math.ceil(totalSessions / SESSIONS_PER_PAGE);
  const startIndex = (currentPage - 1) * SESSIONS_PER_PAGE;

  const sortedSessions = [...userResponses].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const currentSessions = sortedSessions.slice(startIndex, startIndex + SESSIONS_PER_PAGE);

  const toggleExpanded = (responseId: string) => {
    setExpandedResponses((prev) => {
      const next = new Set(prev);
      if (next.has(responseId)) {
        next.delete(responseId);
      } else {
        next.add(responseId);
      }
      return next;
    });
  };

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const userName = userResponses[0]?.user?.name || 'Unknown User';
  const userEmail = userResponses[0]?.user?.email || '';

  return (
    <div className={styles.userGroup}>
      <div className={styles.groupHeader}>
        <div className={styles.avatar}>{userName.charAt(0).toUpperCase()}</div>
        <div className={styles.groupInfo}>
          <h3 className={styles.groupUserName}>{userName}</h3>
          <div className={styles.groupMeta}>
            {userEmail && <span className={styles.groupEmail}>{userEmail}</span>}
            <span className={styles.sessionCount}>
              {totalSessions} {totalSessions === 1 ? 'Session' : 'Sessions'}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.sliderContainer}>
        <button
          type="button"
          className={`${styles.sideArrow} ${styles.prevArrow}`}
          onClick={prevPage}
          disabled={currentPage === 1}
          aria-label="Previous sessions"
        >
          ←
        </button>

        <div className={styles.sessionCards}>
          {currentSessions.map((response, idx) => {
            // Calculate overall index for Session # labeling
            const overallIdx = totalSessions - (startIndex + idx);

            return (
              <div key={response._id} className={styles.sessionCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.sessionIdentity}>
                    <span className={styles.sessionLabel}>Session #{overallIdx}</span>
                    <span className={styles.sessionDate}>
                      {new Date(response.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className={styles.badgeRow}>
                    <span className={response.completedAt ? styles.badgeCompleted : styles.badgePending}>
                      {response.completedAt ? 'Completed' : 'In Progress'}
                    </span>
                    {response.assignedVideoUrl && <span className={styles.badgeAssigned}>Video Assigned</span>}
                  </div>
                </div>

                <div className={styles.cardContent}>
                  <div className={styles.stats}>
                    <div className={styles.statLine}>
                      <span className={styles.statLabel}>Answers:</span>
                      <span className={styles.statValue}>
                        {response.answers.length}/{questions.length}
                      </span>
                    </div>
                    {response.completedAt && (
                      <div className={styles.statLine}>
                        <span className={styles.statLabel}>Submitted:</span>
                        <span className={styles.statValue}>
                          {new Date(response.completedAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {response.assignedVideoUrl && (
                    <div className={styles.videoSection}>
                      <a
                        href={response.assignedVideoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.videoLink}
                      >
                        <span className={styles.videoIcon}>📹</span> View Assigned Video
                      </a>
                    </div>
                  )}

                  {response.answers.length > 0 && (
                    <div className={styles.answersCollapse}>
                      <button
                        type="button"
                        className={styles.toggleAnswersBtn}
                        onClick={() => toggleExpanded(response._id)}
                      >
                        {expandedResponses.has(response._id) ? '▼' : '▶'} View Details
                      </button>

                      {expandedResponses.has(response._id) && (
                        <div className={styles.answersList}>
                          {response.answers.map((answer, index) => (
                            <div key={answer.questionId} className={styles.answerItem}>
                              <div className={styles.questionNumber}>{index + 1}</div>
                              <div className={styles.answerContent}>
                                <div className={styles.questionText}>{getQuestionText(answer.questionId)}</div>
                                <div className={styles.answerText}>{formatAnswer(answer.answer)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className={styles.cardActions}>
                  <button type="button" className={styles.assignBtn} onClick={() => onAssignToResponse(response._id)}>
                    {response.assignedVideoUrl ? 'Update Session' : 'Assign Session'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className={`${styles.sideArrow} ${styles.nextArrow}`}
          onClick={nextPage}
          disabled={currentPage === totalPages}
          aria-label="Next sessions"
        >
          →
        </button>
      </div>

      <div className={styles.sliderInfo}>
        {startIndex + 1}-{Math.min(startIndex + SESSIONS_PER_PAGE, totalSessions)} of {totalSessions}
      </div>
    </div>
  );
};

export default UserSessionGroup;
