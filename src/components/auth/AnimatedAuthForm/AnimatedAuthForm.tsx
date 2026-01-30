'use client';

import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { useAuthForm } from '@/hooks/useAuthForm';
import styles from './AnimatedAuthForm.module.css';
import { IMAGES } from '@/utils/imageConstants';

export interface AnimatedAuthFormProps {
  initialMode?: 'login' | 'signup';
  returnUrl?: string;
}

const AnimatedAuthForm: React.FC<AnimatedAuthFormProps> = ({
  initialMode = 'login',
  returnUrl,
}) => {
  const {
    isRightPanelActive,
    email,
    password,
    name,
    fieldErrors,
    loading,
    error,
    handleSignupClick,
    handleLoginClick,
    handleLoginSubmit,
    handleSignupSubmit,
    handleInputChange,
  } = useAuthForm({ initialMode, returnUrl });

  return (
    <div className={styles.container}>
      <div className={`${styles.authCard} ${isRightPanelActive ? styles.rightPanelActive : ''}`}>

        {/* Sign Up Form Container (Left Side in Code, slides to active) */}
        <div className={`${styles.formSection} ${styles.formSignup}`} style={{
          opacity: isRightPanelActive ? 1 : 0,
          zIndex: isRightPanelActive ? 5 : 1,
          transform: isRightPanelActive ? 'translateX(100%)' : 'translateX(0)',
        }}>
          <h1 className={styles.title}>Create Account</h1>
          <div className={styles.socialIcons}>
            <a href="#" className={styles.icon}><FcGoogle /></a>
          </div>
          <p className={styles.divider}>or use your email for registration</p>
          {error && (
            <div role="alert" className={styles.errorBanner} aria-live="polite">
              {error}
            </div>
          )}
          <form className={styles.form} onSubmit={handleSignupSubmit}>
            <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="Name"
                className={`${styles.input} ${fieldErrors.name ? styles.inputError : ''}`}
                value={name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                autoComplete="name"
                aria-invalid={!!fieldErrors.name}
                aria-describedby={fieldErrors.name ? 'name-error' : undefined}
              />
              {fieldErrors.name && (
                <span id="name-error" className={styles.fieldError}>{fieldErrors.name}</span>
              )}
            </div>
            <div className={styles.inputGroup}>
              <input
                type="email"
                placeholder="Email"
                className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
                value={email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                autoComplete="email"
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'signup-email-error' : undefined}
              />
              {fieldErrors.email && (
                <span id="signup-email-error" className={styles.fieldError}>{fieldErrors.email}</span>
              )}
            </div>
            <div className={styles.inputGroup}>
              <input
                type="password"
                placeholder="Password"
                className={`${styles.input} ${fieldErrors.password ? styles.inputError : ''}`}
                value={password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                autoComplete="new-password"
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'signup-password-error' : undefined}
              />
              {fieldErrors.password && (
                <span id="signup-password-error" className={styles.fieldError}>{fieldErrors.password}</span>
              )}
            </div>
            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
          <div className={`${styles.authToggle} md:hidden`}>
            Already have an account? <span onClick={handleLoginClick} className={styles.authToggleLink}>Sign In</span>
          </div>
        </div>

        {/* Sign In Form Container (Right Side in Code, default active) */}
        <div className={`${styles.formSection} ${styles.formLogin}`} style={{
          opacity: isRightPanelActive ? 0 : 1,
          zIndex: isRightPanelActive ? 1 : 5,
          transform: isRightPanelActive ? 'translateX(100%)' : 'translateX(0)',
        }}>
          <h1 className={styles.title}>Sign in</h1>
          <div className={styles.socialIcons}>
            <a href="#" className={styles.icon}><FcGoogle /></a>
          </div>
          <p className={styles.divider}>or use your account</p>
          {error && (
            <div role="alert" className={styles.errorBanner} aria-live="polite">
              {error}
            </div>
          )}
          <form className={styles.form} onSubmit={handleLoginSubmit}>
            <div className={styles.inputGroup}>
              <input
                type="email"
                placeholder="Email"
                className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
                value={email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                autoComplete="email"
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
              />
              {fieldErrors.email && (
                <span id="login-email-error" className={styles.fieldError}>{fieldErrors.email}</span>
              )}
            </div>
            <div className={styles.inputGroup}>
              <input
                type="password"
                placeholder="Password"
                className={`${styles.input} ${fieldErrors.password ? styles.inputError : ''}`}
                value={password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                autoComplete="current-password"
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
              />
              {fieldErrors.password && (
                <span id="login-password-error" className={styles.fieldError}>{fieldErrors.password}</span>
              )}
            </div>
            <a href="#" className={styles.forgotPassword}>Forgot your password?</a>
            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className={`${styles.authToggle} md:hidden`}>
            Don&apos;t have an account? <span onClick={handleSignupClick} className={styles.authToggleLink}>Sign Up</span>
          </div>
        </div>

        {/* Overlay Container (The Sliding Image Part) */}
        <div className={styles.overlayContainer}>
          <div className={styles.overlay}>
            {/* Background Images for Overlay */}
            <div className={styles.overlayBg} style={{ left: 0 }}>
              <img
                src={IMAGES.AUTH_LOGIN_ILLUSTRATION}
                alt="Login Illustration"
                className={styles.overlayImage}
              />
              <div className={styles.overlayDim}></div>
            </div>
            <div className={styles.overlayBg} style={{ right: 0 }}>
              <img
                src={IMAGES.AUTH_SIGNUP_ILLUSTRATION}
                alt="Signup Illustration"
                className={styles.overlayImage}
              />
              <div className={styles.overlayDim}></div>
            </div>

            <div className={`${styles.overlayPanel} ${styles.overlayLeft}`}>
              <h1 className={styles.overlayTitle}>Welcome Back!</h1>
              <p className={styles.overlayText}>
                To keep connected with us please login with your personal info
              </p>
              <button type="button" className={styles.ghostButton} onClick={handleLoginClick}>
                Sign In
              </button>
            </div>
            <div className={`${styles.overlayPanel} ${styles.overlayRight}`}>
              <h1 className={styles.overlayTitle}>Hello, Friend!</h1>
              <p className={styles.overlayText}>
                Enter your personal details and start your journey with us
              </p>
              <button type="button" className={styles.ghostButton} onClick={handleSignupClick}>
                Sign Up
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnimatedAuthForm;
