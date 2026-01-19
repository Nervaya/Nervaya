'use client';

import { useState } from 'react';
import styles from './styles.module.css';
import { FaUser, FaEnvelope, FaSave } from 'react-icons/fa';
import Sidebar from '@/components/Sidebar/Sidebar';

export default function AccountPage() {
  // In a real app, load this from useAuth or API
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
    // eslint-disable-next-line no-alert
    alert('Profile updated! (Simulation)');
  };

  return (
    <Sidebar>
      <div className={styles.container}>
        <h1 className={styles.title}>My Account</h1>
        <div className={styles.card}>
          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <FaUser className={styles.icon} /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={styles.input}
              />
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

            <button type="submit" className={styles.saveBtn}>
              <FaSave /> Save Changes
            </button>
          </form>
        </div>
      </div>
    </Sidebar>
  );
}
