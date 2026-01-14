'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaHome,
    FaBed,
    FaHeartbeat,
    FaShoppingCart,
    FaHeadset,
    FaCommentDots,
    FaBars,
    FaUserMd,
} from 'react-icons/fa';
import styles from './styles.module.css';

const iconMap: { [key: string]: any } = {
    FaHome: <FaHome />,
    FaBed: <FaBed />,
    FaHeartbeat: <FaHeartbeat />,
    FaShoppingCart: <FaShoppingCart />,
    FaHeadset: <FaHeadset />,
    FaCommentDots: <FaCommentDots />,
    FaBars: <FaBars />,
    FaUserMd: <FaUserMd />, // Ensure FaUserMd is imported
};

const Sidebar = ({ children, className }: { children?: React.ReactNode; className?: string }) => {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const [menuGroups, setMenuGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth > 768);
            if (window.innerWidth <= 768) setIsCollapsed(false);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        const fetchNavigation = async () => {
            try {
                const response = await fetch('/api/navigation');
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        setMenuGroups(result.data);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch navigation', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNavigation();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ... render logic ... 

    return (
        <>
            <button
                className={styles.mobileToggle}
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                <FaBars />
            </button>

            <AnimatePresence mode="wait">
                {(isMobileOpen || isDesktop) && (
                    <motion.aside
                        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${isMobileOpen ? styles.mobileOpen : ''}`}
                        initial={false}
                        animate={{ x: 0 }}
                        onMouseEnter={() => setIsCollapsed(false)}
                        onMouseLeave={() => setIsCollapsed(true)}
                    >
                        <div className={styles.header}>
                            <Link
                                href="/dashboard"
                                className={`${styles.navItem} ${styles.dashboardItem} ${pathname === '/dashboard' ? styles.active : ''}`}
                                onClick={() => setIsMobileOpen(false)}
                            >
                                <span className={styles.icon}><FaHome /></span>
                                {!isCollapsed && <span className={styles.title}>Dashboard</span>}
                            </Link>
                        </div>

                        <nav className={styles.nav}>
                            {loading ? (
                                <div style={{ padding: '1rem', color: '#9ca3af', textAlign: 'center' }}>Loading...</div>
                            ) : (
                                menuGroups.map((group, groupIndex) => (
                                    <div key={groupIndex} className={styles.menuGroup}>
                                        {group.title && !isCollapsed && (
                                            <div className={styles.groupTitle}>{group.title}</div>
                                        )}
                                        {group.items.map((item: any, itemIndex: number) => (
                                            <Link
                                                key={itemIndex}
                                                href={item.path}
                                                className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
                                                onClick={() => setIsMobileOpen(false)}
                                            >
                                                <span className={styles.icon}>{iconMap[item.icon] || <FaHome />}</span>
                                                {!isCollapsed && <span className={styles.title}>{item.title}</span>}
                                            </Link>
                                        ))}
                                    </div>
                                ))
                            )}

                            <div className={styles.bottomMenu}>
                                <Link
                                    href="/feedback"
                                    className={`${styles.navItem} ${pathname === '/feedback' ? styles.active : ''}`}
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <span className={styles.icon}><FaCommentDots /></span>
                                    {!isCollapsed && <span className={styles.title}>Feedback</span>}
                                </Link>
                            </div>
                        </nav>
                    </motion.aside>
                )}
            </AnimatePresence>

            {isMobileOpen && <div className={styles.overlay} onClick={() => setIsMobileOpen(false)} />}

            <main className={`${styles.mainContent} ${isCollapsed ? styles.mainContentCollapsed : ''} ${className || ''}`}>
                {children}
            </main>
        </>
    );
};

export default Sidebar;
