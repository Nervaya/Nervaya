'use client';

import { useReducer } from 'react';
import styles from './styles.module.css';
import { IoAdd, IoRemove } from 'react-icons/io5';

interface FAQItem {
    id: number;
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    {
        id: 1,
        question: "Why can't I sleep even when I'm tired?",
        answer: "Sleep difficulties often stem from multiple factors including stress, anxiety, irregular sleep schedules, or underlying health conditions. Your mind may be racing with thoughts, or your body's natural circadian rhythm might be disrupted. Deep Rest Sessions are specifically designed to calm your mind and help your body transition into sleep naturally, even when you feel exhausted but can't fall asleep."
    },
    {
        id: 2,
        question: "How long does it take to see results?",
        answer: "Many users begin to notice improvements in their sleep quality within the first few sessions. However, individual results may vary based on your specific sleep challenges and consistency with the program. Most people see significant improvements within 2-4 weeks of regular use."
    },
    {
        id: 3,
        question: "What really helps you sleep better?",
        answer: "Better sleep comes from a combination of factors including establishing a consistent sleep schedule, creating a relaxing bedtime routine, managing stress and anxiety, and using evidence-based techniques like those in our Deep Rest Sessions. Our program combines these elements to help you achieve restful sleep."
    },
    {
        id: 4,
        question: "What's the bottom-line cause for sleep issues?",
        answer: "Sleep issues can have various root causes including stress, anxiety, medical conditions, lifestyle factors, or disruptions to your circadian rhythm. Our Deep Rest Sessions address these underlying factors by helping you relax, manage stress, and establish healthy sleep patterns."
    },
    {
        id: 5,
        question: "Does everyone have sleep issues?",
        answer: "While not everyone experiences chronic sleep issues, many people face occasional sleep challenges. Factors like stress, life changes, or environmental disruptions can affect anyone's sleep. Our program is designed to help both those with occasional sleep difficulties and those with more persistent challenges."
    },
    {
        id: 6,
        question: "How do I know when I really need to sleep?",
        answer: "Your body provides natural signals when it needs sleep, such as feeling drowsy, yawning, difficulty concentrating, or feeling heavy eyelids. However, if you're experiencing chronic sleep issues, these signals may be disrupted. Our Deep Rest Sessions can help you reconnect with your body's natural sleep signals."
    }
];

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
    const [state, dispatch] = useReducer(faqReducer, { expandedId: 1 });

    const handleToggle = (id: number) => {
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
            <div className={styles.faqGrid}>
                {faqData.map((item) => {
                    const isExpanded = state.expandedId === item.id;
                    return (
                        <div
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
                                    aria-label={isExpanded ? 'Collapse answer' : 'Expand answer'}
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
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default FrequentlyAskedQuestions;
