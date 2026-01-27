import { memo, useMemo } from "react";
import { TOCItem, tocItems } from "@/utils/privacyPolicyData";
import styles from "./styles.module.css";

interface PrivacyPolicyTOCProps {
  activeSection: string;
  isSectionActive: (sectionId: string) => boolean;
  scrollToSection: (sectionId: string) => void;
}

const PrivacyPolicyTOC = memo(
  ({ isSectionActive, scrollToSection }: PrivacyPolicyTOCProps) => {
    const tocItemsWithHandlers = useMemo(() => {
      return tocItems.map((item: TOCItem) => ({
        ...item,
        onClick: () => scrollToSection(item.id),
        isActive: isSectionActive(item.id),
      }));
    }, [scrollToSection, isSectionActive]);

    return (
      <aside className={styles.tableOfContents}>
        <h3 className={styles.tocTitle}>Contents</h3>
        <nav className={styles.tocNav}>
          <ul className={styles.tocList}>
            {tocItemsWithHandlers.map((item) => (
              <li key={item.id}>
                <button
                  onClick={item.onClick}
                  className={`${styles.tocLink} ${item.isActive ? styles.tocLinkActive : ""}`}
                >
                  <span className={styles.tocNumber}>{item.number}</span>
                  <span className={styles.tocText}>{item.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    );
  },
);

PrivacyPolicyTOC.displayName = "PrivacyPolicyTOC";

export default PrivacyPolicyTOC;
