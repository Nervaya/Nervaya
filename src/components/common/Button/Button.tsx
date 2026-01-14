import React, { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    loading?: boolean;
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    loading = false,
    children,
    disabled,
    className,
    ...props
}) => {
    return (
        <button
            className={`${styles.button} ${styles[variant]} ${className || ''}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? <span className={styles.loader}></span> : children}
        </button>
    );
};

export default Button;
