'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PageHeader from '@/components/PageHeader/PageHeader';
import SessionsTab from './SessionsTab';
import QuestionsTab from './QuestionsTab';
import SettingsTab from './SettingsTab';
import styles from './styles.module.css';
import type { BreadcrumbItem } from '@/components/common/Breadcrumbs';

type Tab = 'sessions' | 'questions' | 'settings';

export default function AdminDriftOffPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) || 'sessions';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Drift Off' }];

  return (
    <div>
      <PageHeader
        title="Drift Off — Admin"
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
