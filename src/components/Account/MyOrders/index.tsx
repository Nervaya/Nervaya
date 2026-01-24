'use client';

import styles from './styles.module.css';
import { FaShoppingBag } from 'react-icons/fa';

export default function MyOrders() {
    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>My Orders</h2>

            <div className={styles.emptyState}>
                <div className={styles.iconWrapper}>
                    <FaShoppingBag className={styles.icon} />
                </div>
                <h3 className={styles.emptyTitle}>No orders yet</h3>
                <p className={styles.emptyText}>
                    Your product purchases will appear here
                </p>
            </div>
        </div>
    );
}
