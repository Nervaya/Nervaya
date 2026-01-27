"use client";

import { useReducer } from "react";
import styles from "./styles.module.css";
import { IoAdd, IoRemove } from "react-icons/io5";
import { faqData } from "@/utils/faqData";

type FAQState = {
  expandedId: number | null;
};

type FAQAction = {
  type: "TOGGLE";
  id: number;
};

const faqReducer = (state: FAQState, action: FAQAction): FAQState => {
  switch (action.type) {
    case "TOGGLE":
      if (state.expandedId === action.id) {
        return { expandedId: null };
      }
      return { expandedId: action.id };
    default:
      return state;
  }
};

const FrequentlyAskedQuestions = () => {
  const [state, dispatch] = useReducer(faqReducer, { expandedId: 1 });

  const handleToggle = (id: number) => {
    dispatch({ type: "TOGGLE", id });
  };

  return (
    <section className={styles.faqSection}>
      <div className={styles.faqHeader}>
        <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
        <p className={styles.faqSubtitle}>
          Find answers to common questions about sleep health and our Deep Rest
          Sessions
        </p>
      </div>
      <ul className={styles.faqGrid}>
        {faqData.map((item) => {
          const isExpanded = state.expandedId === item.id;
          return (
            <li
              key={`faq-item-${item.id}`}
              className={styles.faqItem}
              data-faq-id={item.id}
              data-expanded={isExpanded}
            >
              <div className={styles.faqQuestionRow}>
                <h3 className={styles.faqQuestion}>{item.question}</h3>
                <button
                  type="button"
                  className={styles.toggleButton}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleToggle(item.id);
                  }}
                  aria-expanded={isExpanded}
                  aria-label={isExpanded ? "Collapse answer" : "Expand answer"}
                  data-button-id={item.id}
                >
                  {isExpanded ? (
                    <IoRemove className={styles.toggleIcon} />
                  ) : (
                    <IoAdd className={styles.toggleIcon} />
                  )}
                </button>
              </div>
              {isExpanded && (
                <div
                  className={styles.faqAnswerWrapper}
                  data-answer-id={item.id}
                >
                  <p className={styles.faqAnswer}>{item.answer}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default FrequentlyAskedQuestions;
