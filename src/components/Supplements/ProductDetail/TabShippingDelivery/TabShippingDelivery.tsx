'use client';

import React from 'react';
import styles from './TabShippingDelivery.module.css';

const SHIPPING_OPTIONS = [
  {
    title: 'Free Standard Shipping',
    description: 'All orders ship free via standard delivery (5-7 business days)',
    icon: '🚚',
  },
  {
    title: 'Express Shipping Available',
    description: 'Get your order in 2-3 business days for $12.99',
    icon: '📦',
  },
];

const RETURN_POLICY =
  "We offer a 30-day money-back guarantee on all products. If you're not completely satisfied with your purchase, simply return it within 30 days for a full refund. Products must be in original packaging and unused for return eligibility. Contact our customer service team to initiate a return.";

const TabShippingDelivery: React.FC = () => {
  return (
    <div className={styles.content}>
      <section className={styles.section}>
        <h3 className={styles.heading}>Shipping Information</h3>
        <ul className={styles.options} aria-label="Shipping options">
          {SHIPPING_OPTIONS.map((opt) => (
            <li key={opt.title} className={styles.option}>
              <span className={styles.optionIcon} aria-hidden>
                {opt.icon}
              </span>
              <div>
                <h4 className={styles.optionTitle}>{opt.title}</h4>
                <p className={styles.optionDesc}>{opt.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className={styles.section}>
        <h3 className={styles.heading}>Return Policy</h3>
        <div className={styles.policyBox}>
          <p className={styles.policyText}>{RETURN_POLICY}</p>
        </div>
      </section>
    </div>
  );
};

export default TabShippingDelivery;
