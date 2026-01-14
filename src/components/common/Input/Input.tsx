import React, { InputHTMLAttributes, ReactNode } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    labelIcon?: ReactNode;
    containerClassName?: string;
}

const Input: React.FC<InputProps> = ({ label, error, labelIcon, containerClassName, className, ...props }) => {
    return (
        <div className={`${styles.inputContainer} ${containerClassName || ''}`}>
            <label className={styles.label}>
                {labelIcon && <span className={styles.labelIcon}>{labelIcon}</span>}
                {label}
            </label>
            <input className={`${styles.input} ${error ? styles.inputError : ''} ${className || ''}`} {...props} />
            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    );
};

export default Input;
