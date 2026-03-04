'use client';

import { useState } from 'react';
import DriftOffAssignVideoModal from '@/components/Admin/DriftOffAssignVideoModal';
import Pagination from '@/components/common/Pagination';
import type { IDriftOffResponse } from '@/types/driftOff.types';
import type { ISleepAssessmentQuestion } from '@/types/sleepAssessment.types';
import styles from './styles.module.css';

interface DriftOffResponseListProps {
  responses: IDriftOffResponse[];
  questions: ISleepAssessmentQuestion[];
  onAssign: (responseId: string, videoUrl: string) => Promise<void>;
}

const ITEMS_PER_PAGE = 10;

const DriftOffResponseList = ({ responses, questions, onAssign }: DriftOffResponseListProps) => {
  const [activeResponseId, setActiveResponseId] = useState<string | null>(null);
  const [expandedResponses, setExpandedResponses] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(responses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentResponses = responses.slice(startIndex, endIndex);

  const activeResponse = activeResponseId ? responses.find((r) => r._id === activeResponseId) : null;

  const getQuestionText = (questionId: string) => {
    const question = questions.find((q) => q._id === questionId);
    return question?.questionText || `Question ${questionId}`;
  };

  const formatAnswer = (answer: string | string[]) => {
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }
    return answer;
  };

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

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      <ul className={styles.list} aria-label="Drift Off responses">
        {currentResponses.map((response) => {
          const userName = response.user?.name || 'Unknown User';
          const userEmail = response.user?.email || '';

          return (
            <li key={response._id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.meta}>
                  <span className={styles.label}>User</span>
                  <div className={styles.userInfo}>
                    <div className={styles.userName}>{userName}</div>
                    {userEmail && <div className={styles.userEmail}>{userEmail}</div>}
                  </div>
                </div>
                <div className={styles.metaRow}>
                  <span className={response.completedAt ? styles.badgeCompleted : styles.badgePending}>
                    {response.completedAt ? 'Completed' : 'In Progress'}
                  </span>
                  {response.assignedVideoUrl && <span className={styles.badgeAssigned}>Video Assigned</span>}
                </div>
              </div>

              <div className={styles.details}>
                <p className={styles.detailItem}>
                  <span className={styles.detailLabel}>Submitted:</span>{' '}
                  {response.completedAt
                    ? new Date(response.completedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—'}
                </p>
                <p className={styles.detailItem}>
                  <span className={styles.detailLabel}>Answers:</span> {response.answers.length}/{questions.length}
                </p>
                {response.assignedVideoUrl && (
                  <p className={styles.detailItem}>
                    <span className={styles.detailLabel}>Video:</span>{' '}
                    <a
                      href={response.assignedVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.videoLink}
                    >
                      View Video
                    </a>
                  </p>
                )}
              </div>

              {response.answers.length > 0 && (
                <div className={styles.answersSection}>
                  <button
                    type="button"
                    className={styles.toggleAnswersBtn}
                    onClick={() => toggleExpanded(response._id)}
                  >
                    {expandedResponses.has(response._id) ? '▼' : '▶'} View Answers ({response.answers.length})
                  </button>

                  {expandedResponses.has(response._id) && (
                    <div className={styles.answersList}>
                      {response.answers.map((answer, index) => (
                        <div key={answer.questionId} className={styles.answerItem}>
                          <div className={styles.questionNumber}>Q{index + 1}</div>
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

              <div className={styles.actions}>
                <button type="button" className={styles.assignBtn} onClick={() => setActiveResponseId(response._id)}>
                  {response.assignedVideoUrl ? '📹 Update Video' : '📹 Assign Video'}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Pagination at the bottom */}
      <Pagination
        page={currentPage}
        limit={ITEMS_PER_PAGE}
        total={responses.length}
        totalPages={totalPages}
        onPageChange={goToPage}
        ariaLabel="Drift Off responses pagination"
      />

      {activeResponse && (
        <DriftOffAssignVideoModal
          responseId={activeResponse._id}
          userId={activeResponse.userId}
          existingVideoUrl={activeResponse.assignedVideoUrl}
          onClose={() => setActiveResponseId(null)}
          onAssign={onAssign}
        />
      )}
    </>
  );
};

export default DriftOffResponseList;
