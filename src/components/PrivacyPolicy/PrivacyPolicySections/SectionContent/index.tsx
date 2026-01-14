import { memo, useMemo } from 'react';
import { SectionContent as SectionContentType, GridItem, Subsection } from '@/utils/privacyPolicyData';
import styles from './styles.module.css';

interface SectionContentProps {
    content: SectionContentType;
}

const SectionContent = memo(({ content }: SectionContentProps) => {
    // Memoize paragraphs
    const paragraphs = useMemo(() => {
        return content.paragraphs?.map((paragraph, index) => (
            <p key={index} className={styles.paragraph}>
                {paragraph}
            </p>
        ));
    }, [content.paragraphs]);

    const subsections = useMemo(() => {
        return content.subsections?.map((subsection: Subsection, index: number) => (
            <div key={index} className={styles.subsection}>
                <h3 className={styles.subsectionTitle}>{subsection.title}</h3>
                {subsection.paragraph && (
                    <p className={styles.paragraph}>{subsection.paragraph}</p>
                )}
                {subsection.listItems && (
                    <ul className={styles.list}>
                        {subsection.listItems.map((item, itemIndex) => (
                            <li key={itemIndex}>
                                <strong>{item.label}</strong> {item.text}
                            </li>
                        ))}
                    </ul>
                )}
                {subsection.cookieCards && (
                    <div className={styles.cookieGrid}>
                        {subsection.cookieCards.map((card: GridItem, cardIndex: number) => (
                            <div key={cardIndex} className={styles.cookieCard}>
                                <div className={styles.cookieIcon}>{card.icon}</div>
                                <h4 className={styles.cookieTitle}>{card.title}</h4>
                                <p className={styles.cookieText}>{card.text}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        ));
    }, [content.subsections]);

    // Memoize grid items
    const gridItems = useMemo(() => {
        return content.gridItems?.map((item: GridItem, index: number) => (
            <div key={index} className={styles.gridItem}>
                <div className={styles.gridIcon}>{item.icon}</div>
                <h4 className={styles.gridTitle}>{item.title}</h4>
                <p className={styles.gridText}>{item.text}</p>
            </div>
        ));
    }, [content.gridItems]);

    const securityCards = useMemo(() => {
        return content.securityCards?.map((card: GridItem, index: number) => (
            <div key={index} className={styles.securityCard}>
                <div className={styles.securityIcon}>{card.icon}</div>
                <h4 className={styles.securityTitle}>{card.title}</h4>
                <p className={styles.securityText}>{card.text}</p>
            </div>
        ));
    }, [content.securityCards]);

    // Memoize rights cards
    const rightsCards = useMemo(() => {
        return content.rightsCards?.map((card: GridItem, index: number) => (
            <div key={index} className={styles.rightCard}>
                <div className={styles.rightIcon}>{card.icon}</div>
                <h4 className={styles.rightTitle}>{card.title}</h4>
                <p className={styles.rightText}>{card.text}</p>
            </div>
        ));
    }, [content.rightsCards]);

    const contactItems = useMemo(() => {
        return content.contactItems?.map((item, index) => (
            <div key={index} className={styles.contactItem}>
                <div className={styles.contactIcon}>{item.icon}</div>
                <div className={styles.contactContent}>
                    <strong className={styles.contactLabel}>{item.label}</strong>
                    {item.href ? (
                        <a href={item.href} className={styles.link}>{item.text}</a>
                    ) : (
                        <span className={styles.contactText}>{item.text}</span>
                    )}
                </div>
            </div>
        ));
    }, [content.contactItems]);

    return (
        <>
            {paragraphs}

            {subsections && (
                <>
                    {subsections}
                </>
            )}

            {gridItems && (
                <div className={styles.grid}>
                    {gridItems}
                </div>
            )}

            {securityCards && (
                <div className={styles.securityGrid}>
                    {securityCards}
                </div>
            )}

            {rightsCards && (
                <div className={styles.rightsGrid}>
                    {rightsCards}
                </div>
            )}

            {contactItems && (
                <div className={styles.contactInfo}>
                    {contactItems}
                </div>
            )}
        </>
    );
});

SectionContent.displayName = 'SectionContent';

export default SectionContent;
