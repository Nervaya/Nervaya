"use client";

import { useCallback } from "react";
import styles from "./styles.module.css";
import type {
  IQuestionOption,
  QuestionType,
} from "@/types/sleepAssessment.types";

interface QuestionCardProps {
  questionText: string;
  questionType: QuestionType;
  options: IQuestionOption[];
  selectedAnswer: string | string[] | null;
  onAnswerChange: (answer: string | string[]) => void;
  isRequired?: boolean;
}

const QuestionCard = ({
  questionText,
  questionType,
  options,
  selectedAnswer,
  onAnswerChange,
  isRequired = true,
}: QuestionCardProps) => {
  const handleSingleChoice = useCallback(
    (value: string) => {
      onAnswerChange(value);
    },
    [onAnswerChange],
  );

  const handleMultipleChoice = useCallback(
    (value: string) => {
      const currentAnswers = Array.isArray(selectedAnswer)
        ? selectedAnswer
        : [];
      const isSelected = currentAnswers.includes(value);

      if (isSelected) {
        onAnswerChange(currentAnswers.filter((v) => v !== value));
      } else {
        onAnswerChange([...currentAnswers, value]);
      }
    },
    [selectedAnswer, onAnswerChange],
  );

  const handleTextInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onAnswerChange(e.target.value);
    },
    [onAnswerChange],
  );

  const isOptionSelected = useCallback(
    (optionValue: string): boolean => {
      if (Array.isArray(selectedAnswer)) {
        return selectedAnswer.includes(optionValue);
      }
      return selectedAnswer === optionValue;
    },
    [selectedAnswer],
  );

  const renderOptions = () => {
    if (questionType === "text") {
      return (
        <textarea
          className={styles.textInput}
          value={typeof selectedAnswer === "string" ? selectedAnswer : ""}
          onChange={handleTextInput}
          placeholder="Type your answer here..."
          rows={4}
          aria-required={isRequired}
        />
      );
    }

    if (questionType === "scale") {
      return (
        <div className={styles.scaleContainer}>
          <ul className={styles.scaleList}>
            {options.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  className={`${styles.scaleOption} ${isOptionSelected(option.value) ? styles.selected : ""}`}
                  onClick={() => handleSingleChoice(option.value)}
                  aria-pressed={isOptionSelected(option.value)}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return (
      <ul className={styles.optionsList}>
        {options.map((option) => (
          <li key={option.id}>
            <button
              type="button"
              className={`${styles.optionCard} ${isOptionSelected(option.value) ? styles.selected : ""}`}
              onClick={() =>
                questionType === "single_choice"
                  ? handleSingleChoice(option.value)
                  : handleMultipleChoice(option.value)
              }
              role={questionType === "single_choice" ? "radio" : "checkbox"}
              aria-checked={isOptionSelected(option.value)}
            >
              <span className={styles.optionIndicator}>
                {questionType === "multiple_choice" && (
                  <span className={styles.checkbox}>
                    {isOptionSelected(option.value) && (
                      <svg
                        viewBox="0 0 12 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 5L4.5 8.5L11 1"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                )}
                {questionType === "single_choice" && (
                  <span className={styles.radio}>
                    {isOptionSelected(option.value) && (
                      <span className={styles.radioDot} />
                    )}
                  </span>
                )}
              </span>
              <span className={styles.optionLabel}>{option.label}</span>
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <article className={styles.questionCard}>
      <h2 className={styles.questionText}>
        {questionText}
        {isRequired && <span className={styles.requiredIndicator}> *</span>}
      </h2>
      <div className={styles.optionsContainer}>{renderOptions()}</div>
    </article>
  );
};

export default QuestionCard;
