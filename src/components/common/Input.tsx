import React, { InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, ...props }) => {
    return (
        <div className={styles.inputContainer}>
            <label className={styles.label}>{label}</label>
            <input className={`${styles.input} ${error ? styles.inputError : ''}`} {...props} />
            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    );
};

export default Input;
