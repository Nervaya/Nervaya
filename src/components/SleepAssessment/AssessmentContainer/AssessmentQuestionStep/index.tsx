'use client';

import { LazyMotion, m, AnimatePresence } from 'framer-motion';
import QuestionCard from '../../QuestionCard';
import styles from './styles.module.css';
import type { ISleepAssessmentQuestion } from '@/types/sleepAssessment.types';

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
};

interface AssessmentQuestionStepProps {
  question: ISleepAssessmentQuestion;
  direction: number;
  currentAnswer: string | string[] | null;
  onAnswerChange: (answer: string | string[]) => void;
}

export function AssessmentQuestionStep({
  question,
  direction,
  currentAnswer,
  onAnswerChange,
}: AssessmentQuestionStepProps) {
  return (
    <LazyMotion features={() => import('framer-motion').then((mod) => mod.domAnimation)}>
      <div className={styles.questionWrapper}>
        <AnimatePresence mode="wait" custom={direction}>
          <m.div
            key={question._id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          >
            <QuestionCard
              questionText={question.questionText}
              questionType={question.questionType}
              options={question.options}
              selectedAnswer={currentAnswer}
              onAnswerChange={onAnswerChange}
              isRequired={question.isRequired}
            />
          </m.div>
        </AnimatePresence>
      </div>
    </LazyMotion>
  );
}
