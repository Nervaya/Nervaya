'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PageHeader from '@/components/PageHeader/PageHeader';
import SessionsTab from './SessionsTab';
import QuestionsTab from './QuestionsTab';
import SettingsTab from './SettingsTab';
import styles from './styles.module.css';
import { type BreadcrumbItem } from '@/components/common';

type Tab = 'sessions' | 'questions' | 'settings';
const VALID_TABS: Tab[] = ['sessions', 'questions', 'settings'];

export default function AdminDeepRestPage() {
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const initialTab: Tab = VALID_TABS.includes(rawTab as Tab) ? (rawTab as Tab) : 'sessions';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Deep Rest' }];

  return (
    <div>
      <PageHeader
        title="Deep Rest — Admin"
        subtitle="Manage Deep Rest Session questions and view all user responses."
        breadcrumbs={breadcrumbs}
      />

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'sessions' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          Sessions
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'questions' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          Questions
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'settings' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {activeTab === 'sessions' && <SessionsTab />}
      {activeTab === 'questions' && <QuestionsTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </div>
  );
}
