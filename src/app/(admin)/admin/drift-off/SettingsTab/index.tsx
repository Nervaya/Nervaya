'use client';

import { useState, useEffect } from 'react';
import { configApi } from '@/lib/api/config';
import { LottieLoader } from '@/components/common';
import { Icon } from '@iconify/react';
import type { ISystemConfig } from '@/types/systemConfig.types';
import styles from './styles.module.css';

export default function SettingsTab() {
  const [price, setPrice] = useState<number>(999);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await configApi.getAll();
      if (res.success && res.data) {
        const priceConfig = res.data.find((config: ISystemConfig) => config.key === 'driftOffSessionPrice');
        if (priceConfig && typeof priceConfig.value === 'number') {
          setPrice(priceConfig.value);
        }
      }
    } catch (_err) {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const res = await configApi.update('driftOffSessionPrice', price, true, 'Drift Off Session Price (₹)');
      if (res.success) {
        setSuccess('Settings saved successfully');
      }
    } catch (_err) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loaderWrapper}>
        <LottieLoader width={180} height={180} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Drift Off Configuration</h3>
          <p className={styles.cardSubtitle}>Manage global settings for the Deep Rest sessions.</p>
        </div>

        <form onSubmit={handleSave} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="price" className={styles.label}>
              Session Price (₹)
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputPrefix}>₹</span>
              <input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className={styles.input}
                placeholder="999"
                required
                min="0"
              />
            </div>
            <p className={styles.helpText}>
              This price will be displayed on the landing page and applied during checkout.
            </p>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}
          {success && <div className={styles.successMessage}>{success}</div>}

          <div className={styles.formActions}>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? (
                <>
                  <Icon icon="line-md:loading-twotone-loop" className={styles.btnIcon} />
                  Saving...
                </>
              ) : (
                <>
                  <Icon icon="fluent:save-24-filled" className={styles.btnIcon} />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
