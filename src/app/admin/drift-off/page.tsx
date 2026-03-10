'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PageHeader from '@/components/PageHeader/PageHeader';
import SessionsTab from './SessionsTab';
import QuestionsTab from './QuestionsTab';
import styles from './styles.module.css';

type Tab = 'sessions' | 'questions';

export default function AdminDriftOffPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) || 'sessions';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  return (
    <div>
      <PageHeader
        title="Drift Off — Admin"
        subtitle="Manage Deep Rest Session questions and view all user responses."
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
      </div>

      {activeTab === 'sessions' && <SessionsTab />}
      {activeTab === 'questions' && <QuestionsTab />}
    </div>
  );
}
