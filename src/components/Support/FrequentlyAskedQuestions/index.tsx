'use client';

import { useReducer } from 'react';
import { usePathname } from 'next/navigation';
import { trackFaqOpened } from '@/utils/analytics';
import { Icon } from '@iconify/react';
import { ICON_ADD, ICON_REMOVE } from '@/constants/icons';
import { faqData } from '@/utils/faqData';
import styles from './styles.module.css';

type FAQState = {
  expandedId: number | null;
};

type FAQAction = {
  type: 'TOGGLE';
  id: number;
};

const faqReducer = (state: FAQState, action: FAQAction): FAQState => {
  switch (action.type) {
    case 'TOGGLE':
      if (state.expandedId === action.id) {
        return { expandedId: null };
      }
      return { expandedId: action.id };
    default:
      return state;
  }
};

const FrequentlyAskedQuestions = () => {
  const pathname = usePathname();
  const [state, dispatch] = useReducer(faqReducer, { expandedId: 1 });

  const handleToggle = (id: number) => {
    const item = faqData.find((f) => f.id === id);
    if (state.expandedId !== id && item) {
      trackFaqOpened({
        faq_id: String(id),
        faq_topic: item.question,
        page_type: pathname,
      });
    }
    dispatch({ type: 'TOGGLE', id });
  };

  return (
    <section className={styles.faqSection}>
      <div className={styles.faqHeader}>
        <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
        <p className={styles.faqSubtitle}>
          Find answers to common questions about sleep health and our Deep Rest Sessions
        </p>
      </div>
      <ul className={styles.faqGrid}>
        {faqData.map((item) => {
          const isExpanded = state.expandedId === item.id;
          return (
            <li key={`faq-item-${item.id}`} className={styles.faqItem} data-faq-id={item.id} data-expanded={isExpanded}>
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
                  aria-label={isExpanded ? 'Collapse answer' : 'Expand answer'}
                  data-button-id={item.id}
                >
                  {isExpanded ? (
                    <Icon icon={ICON_REMOVE} className={styles.toggleIcon} />
                  ) : (
                    <Icon icon={ICON_ADD} className={styles.toggleIcon} />
                  )}
                </button>
              </div>
              {isExpanded && (
                <div className={styles.faqAnswerWrapper} data-answer-id={item.id}>
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
