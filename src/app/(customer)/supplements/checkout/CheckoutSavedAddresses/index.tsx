'use client';

import type { SavedAddress } from '@/types/supplement.types';
import { Icon } from '@iconify/react';

import styles from './styles.module.css';

interface CheckoutSavedAddressesProps {
  addresses: SavedAddress[];
  onUseAddress: (addr: SavedAddress) => void;
  onAddNew: () => void;
}

export function CheckoutSavedAddresses({ addresses, onUseAddress, onAddNew }: CheckoutSavedAddressesProps) {
  if (addresses.length === 0) return null;

  return (
    <div className={styles.savedAddresses}>
      <div className={styles.sectionHeader}>
        <div className={styles.headerLeft}>
          <span className={styles.sectionHeaderIcon} aria-hidden>
            <Icon icon="lucide:book-user" width={20} height={20} />
          </span>
          <h3 className={styles.sectionTitle}>Saved Addresses</h3>
        </div>
        <button type="button" className={styles.addNewButton} onClick={onAddNew}>
          <Icon icon="lucide:plus" width={16} height={16} />
          Add New
        </button>
      </div>
      <ul className={styles.addressList} aria-label="Saved addresses">
        {addresses.map((addr) => (
          <li
            key={addr._id}
            className={styles.addressItem}
            onClick={() => onUseAddress(addr)}
            role="button"
            tabIndex={0}
          >
            <div className={styles.selectionIndicator}>
              <div className={styles.radioOutline}>
                <div className={styles.radioInner} />
              </div>
            </div>
            <div className={styles.addressInfo}>
              <div className={styles.addressMain}>
                <span className={styles.addressName}>{addr.name}</span>
                <span className={styles.addressLabel}>{addr.label}</span>
                {addr.isDefault && <span className={styles.defaultBadge}>Default</span>}
              </div>
              <p className={styles.addressDetails}>
                {addr.addressLine1}, {addr.addressLine2 ? `${addr.addressLine2}, ` : ''}
                {addr.city}, {addr.state} {addr.zipCode}
              </p>
            </div>
            <div className={styles.phoneInfo}>
              <span className={styles.phoneLabel}>Phone:</span>
              <span className={styles.phoneText}>{addr.phone}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
