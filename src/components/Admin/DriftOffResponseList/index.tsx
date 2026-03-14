'use client';

import { useState, useMemo } from 'react';
import DriftOffAssignVideoModal from '@/components/Admin/DriftOffAssignVideoModal';
import Pagination from '@/components/common/Pagination';
import UserSessionGroup from './UserSessionGroup';
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
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(responses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

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

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // Group responses by User
  const groupedResponses = useMemo(() => {
    const groups = new Map<string, IDriftOffResponse[]>();
    responses.forEach((response) => {
      const uid = response.userId;
      if (!groups.has(uid)) {
        groups.set(uid, []);
      }
      groups.get(uid)?.push(response);
    });

    // Sort users by their most recent response date
    return Array.from(groups.entries()).sort((a: [string, IDriftOffResponse[]], b: [string, IDriftOffResponse[]]) => {
      const latestA = Math.max(...a[1].map((r: IDriftOffResponse) => new Date(r.createdAt).getTime()));
      const latestB = Math.max(...b[1].map((r: IDriftOffResponse) => new Date(r.createdAt).getTime()));
      return latestB - latestA;
    });
  }, [responses]);

  const totalGroups = groupedResponses.length;
  const currentGroups = groupedResponses.slice(startIndex, endIndex);

  return (
    <>
      <div className={styles.list} aria-label="Drift Off responses">
        {currentGroups.length > 0 ? (
          currentGroups.map(([uid, userResponses]: [string, IDriftOffResponse[]]) => (
            <UserSessionGroup
              key={uid}
              userResponses={userResponses}
              questions={questions}
              onAssignToResponse={setActiveResponseId}
              getQuestionText={getQuestionText}
              formatAnswer={formatAnswer}
            />
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>No Drift Off responses yet.</p>
          </div>
        )}
      </div>

      <Pagination
        page={currentPage}
        limit={ITEMS_PER_PAGE}
        total={totalGroups}
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
