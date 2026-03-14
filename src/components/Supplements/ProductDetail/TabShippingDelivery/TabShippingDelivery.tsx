'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import { ICON_BOX } from '@/constants/icons';
import styles from './TabShippingDelivery.module.css';

const SHIPPING_OPTIONS = [
  {
    title: 'Free Standard Shipping',
    description: 'All orders ship free via standard delivery (5-7 business days)',
    icon: ICON_BOX,
  },
  {
    title: 'Express Shipping Available',
    description: 'Get your order in 2-3 business days for $12.99',
    icon: ICON_BOX,
  },
];

const SHIPPING_AND_DELIVERY_SCRIPT =
  'We ship across India. Orders are processed within 1–2 business days. Standard delivery takes 5–7 business days; express options may be available at checkout. You will receive tracking details once your order is dispatched. Delivery is made to the address provided at checkout; please ensure someone is available to receive the package.';

const RETURN_POLICY =
  "We offer a 30-day money-back guarantee on all products. If you're not completely satisfied with your purchase, simply return it within 30 days for a full refund. Products must be in original packaging and unused for return eligibility. Contact our customer service team to initiate a return.";

const TabShippingDelivery: React.FC = () => {
  return (
    <div className={styles.content}>
      <section className={styles.section}>
        <h3 className={styles.heading}>Shipping & Delivery</h3>
        <div className={styles.policyBox}>
          <p className={styles.policyText}>{SHIPPING_AND_DELIVERY_SCRIPT}</p>
        </div>
      </section>
      <section className={styles.section}>
        <h3 className={styles.heading}>Shipping Options</h3>
        <ul className={styles.options} aria-label="Shipping options">
          {SHIPPING_OPTIONS.map((opt) => (
            <li key={opt.title} className={styles.option}>
              <span className={styles.optionIcon} aria-hidden>
                <Icon icon={opt.icon} width={24} height={24} />
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
        <h3 className={styles.heading}>Returns</h3>
        <div className={styles.policyBox}>
          <p className={styles.policyText}>{RETURN_POLICY}</p>
        </div>
      </section>
    </div>
  );
};

export default TabShippingDelivery;
