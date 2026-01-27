import React from 'react';
import styles from './AuthForm.module.css';

interface AuthFormProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const AuthForm: React.FC<AuthFormProps> = ({ title, subtitle, children }) => {
  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthForm;
