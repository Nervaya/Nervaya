'use client';

import type { SavedAddress } from '@/types/supplement.types';
import styles from './styles.module.css';

interface CheckoutSavedAddressesProps {
  addresses: SavedAddress[];
  onUseAddress: (addr: SavedAddress) => void;
}

export function CheckoutSavedAddresses({ addresses, onUseAddress }: CheckoutSavedAddressesProps) {
  if (addresses.length === 0) return null;

  return (
    <div className={styles.savedAddresses}>
      <h3 className={styles.sectionTitle}>Saved Addresses</h3>
      <ul className={styles.addressGrid} aria-label="Saved addresses">
        {addresses.map((addr) => (
          <li key={addr._id} className={styles.addressCard}>
            <div className={styles.addressHeader}>
              <span className={styles.addressLabel}>{addr.label}</span>
              {addr.isDefault && <span className={styles.defaultBadge}>Default</span>}
            </div>
            <p className={styles.addressName}>{addr.name}</p>
            <p className={styles.addressText}>{addr.addressLine1}</p>
            {addr.addressLine2 && <p className={styles.addressText}>{addr.addressLine2}</p>}
            <p className={styles.addressText}>
              {addr.city}, {addr.state} {addr.zipCode}
            </p>
            <p className={styles.addressText}>{addr.phone}</p>
            <button type="button" className={styles.useButton} onClick={() => onUseAddress(addr)}>
              Use this address
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
