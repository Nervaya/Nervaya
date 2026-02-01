'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar/Sidebar';
import PageHeader from '@/components/PageHeader/PageHeader';
import MySessions from '@/components/Account/MySessions';
import MyOrders from '@/components/Account/MyOrders';
import styles from './styles.module.css';
import { FaUser, FaEnvelope, FaSave } from 'react-icons/fa';

type TabType = 'settings' | 'orders' | 'sessions';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<TabType>('settings');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: 'Test Customer',
    email: 'customer@example.com',
    phone: '+91 9876543210',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('Profile updated! (Simulation)');
  };

  return (
    <Sidebar>
      <div className={styles.container}>
        <PageHeader title="My Account" />

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'settings' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'orders' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            My Orders
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'sessions' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('sessions')}
          >
            My Sessions
          </button>
        </div>

        {activeTab === 'settings' && (
          <div className={styles.card}>
            <form onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <FaUser className={styles.icon} /> Full Name
                </label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className={styles.input} />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <FaEnvelope className={styles.icon} /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.input}
                  disabled
                />
                <span className={styles.hint}>Email cannot be changed</span>
              </div>

              {successMessage && (
                <p className={styles.successMessage} role="status">
                  {successMessage}
                </p>
              )}
              <button type="submit" className={styles.saveBtn}>
                <FaSave /> Save Changes
              </button>
            </form>
          </div>
        )}

        {activeTab === 'orders' && <MyOrders />}
        {activeTab === 'sessions' && <MySessions />}
      </div>
    </Sidebar>
  );
}
