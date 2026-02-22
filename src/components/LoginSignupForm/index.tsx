'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import {
  AUTH_FORM_MODE,
  AUTH_STEP,
  OTP_PURPOSE,
  type AuthFormMode,
  type AuthStep,
  type OtpPurpose,
} from '@/lib/constants/enums';
import { useAuthForm } from '@/hooks/useAuthForm';
import { useAuthContext, type AuthData } from '@/context/AuthContext';
import { OTPVerificationStep } from './OTPVerificationStep';
import { trackLogin, trackSignUp } from '@/utils/analytics';
import styles from './styles.module.css';
import { IMAGES } from '@/utils/imageConstants';

export interface LoginSignupFormProps {
  initialMode?: AuthFormMode;
  returnUrl?: string;
}

const LoginSignupForm: React.FC<LoginSignupFormProps> = ({ initialMode = AUTH_FORM_MODE.LOGIN, returnUrl }) => {
  const { completeLoginWithOtp, clearError: clearAuthError } = useAuthContext();
  const [authStep, setAuthStep] = useState<AuthStep>(AUTH_STEP.CREDENTIALS);
  const [otpPurpose, setOtpPurpose] = useState<OtpPurpose>(OTP_PURPOSE.LOGIN);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

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

  const onLoginSubmit = useCallback(
    async (e: React.FormEvent) => {
      const response = await handleLoginSubmit(e);
      if (
        response?.success &&
        response?.data &&
        typeof response.data === 'object' &&
        'requireOtp' in response.data &&
        response.data.requireOtp &&
        'email' in response.data
      ) {
        clearAuthError();
        setOtpPurpose(OTP_PURPOSE.LOGIN);
        setAuthStep(AUTH_STEP.OTP);
      }
    },
    [handleLoginSubmit, clearAuthError],
  );

  const onSignupSubmit = useCallback(
    async (e: React.FormEvent) => {
      const response = await handleSignupSubmit(e);
      if (
        response?.success &&
        response?.data &&
        typeof response.data === 'object' &&
        'requireOtp' in response.data &&
        response.data.requireOtp &&
        'email' in response.data
      ) {
        clearAuthError();
        setOtpPurpose(OTP_PURPOSE.SIGNUP);
        setAuthStep(AUTH_STEP.OTP);
      }
    },
    [handleSignupSubmit, clearAuthError],
  );

  const onOtpSuccess = useCallback(
    (session?: { user: unknown; token: string }) => {
      if (session?.user && session?.token) {
        if (otpPurpose === OTP_PURPOSE.SIGNUP) {
          trackSignUp('email');
        } else {
          trackLogin('email');
        }
        completeLoginWithOtp({ user: session.user as AuthData['user'], token: session.token }, returnUrl);
      }
    },
    [completeLoginWithOtp, returnUrl, otpPurpose],
  );

  const onOtpBack = useCallback(() => setAuthStep(AUTH_STEP.CREDENTIALS), []);

  return (
    <div className={styles.container}>
      <div className={`${styles.authCard} ${isRightPanelActive ? styles.rightPanelActive : ''}`}>
        <div
          className={`${styles.formSection} ${styles.formSignup}`}
          style={{
            opacity: isRightPanelActive ? 1 : 0,
            zIndex: isRightPanelActive ? 5 : 1,
            transform: isRightPanelActive ? 'translateX(100%)' : 'translateX(0)',
          }}
        >
          {authStep === AUTH_STEP.OTP && otpPurpose === OTP_PURPOSE.SIGNUP ? (
            <OTPVerificationStep
              email={email.trim().toLowerCase()}
              purpose={OTP_PURPOSE.SIGNUP}
              onSuccess={onOtpSuccess}
              onBack={onOtpBack}
              autoSend={false}
            />
          ) : (
            <>
              <h1 className={styles.title}>Create Account</h1>
              <p className={styles.divider}>or use your email for registration</p>
              {error && (
                <div role="alert" className={styles.errorBanner} aria-live="polite">
                  {error}
                </div>
              )}
              <form className={styles.form} onSubmit={onSignupSubmit}>
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
                    <span id="name-error" className={styles.fieldError}>
                      {fieldErrors.name}
                    </span>
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
                    <span id="signup-email-error" className={styles.fieldError}>
                      {fieldErrors.email}
                    </span>
                  )}
                </div>
                <div className={styles.inputGroup}>
                  <div className={styles.passwordInputWrapper}>
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      placeholder="Password"
                      className={`${styles.input} ${styles.passwordInput} ${fieldErrors.password ? styles.inputError : ''}`}
                      value={password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      autoComplete="new-password"
                      aria-invalid={!!fieldErrors.password}
                      aria-describedby={fieldErrors.password ? 'signup-password-error' : undefined}
                    />
                    <button
                      type="button"
                      className={styles.togglePasswordButton}
                      onClick={() => setShowSignupPassword((prev) => !prev)}
                      aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSignupPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <span id="signup-password-error" className={styles.fieldError}>
                      {fieldErrors.password}
                    </span>
                  )}
                </div>
                <button type="submit" className={styles.button} disabled={loading}>
                  {loading ? 'Signing up...' : 'Sign Up'}
                </button>
              </form>
              <div className={`${styles.authToggle} md:hidden`}>
                Already have an account?{' '}
                <span onClick={handleLoginClick} className={styles.authToggleLink}>
                  Sign In
                </span>
              </div>
            </>
          )}
        </div>

        <div
          className={`${styles.formSection} ${styles.formLogin}`}
          style={{
            opacity: isRightPanelActive ? 0 : 1,
            zIndex: isRightPanelActive ? 1 : 5,
            transform: isRightPanelActive ? 'translateX(100%)' : 'translateX(0)',
          }}
        >
          {authStep === AUTH_STEP.OTP && otpPurpose === OTP_PURPOSE.LOGIN ? (
            <OTPVerificationStep
              email={email.trim().toLowerCase()}
              purpose={OTP_PURPOSE.LOGIN}
              onSuccess={onOtpSuccess}
              onBack={onOtpBack}
            />
          ) : (
            <>
              <h1 className={styles.title}>Sign in</h1>
              <p className={styles.divider}>or use your account</p>
              {error && (
                <div role="alert" className={styles.errorBanner} aria-live="polite">
                  {error}
                </div>
              )}
              <form className={styles.form} onSubmit={onLoginSubmit}>
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
                    <span id="login-email-error" className={styles.fieldError}>
                      {fieldErrors.email}
                    </span>
                  )}
                </div>
                <div className={styles.inputGroup}>
                  <div className={styles.passwordInputWrapper}>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder="Password"
                      className={`${styles.input} ${styles.passwordInput} ${fieldErrors.password ? styles.inputError : ''}`}
                      value={password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      autoComplete="current-password"
                      aria-invalid={!!fieldErrors.password}
                      aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
                    />
                    <button
                      type="button"
                      className={styles.togglePasswordButton}
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <span id="login-password-error" className={styles.fieldError}>
                      {fieldErrors.password}
                    </span>
                  )}
                </div>
                <a href="#" className={styles.forgotPassword}>
                  Forgot your password?
                </a>
                <button type="submit" className={styles.button} disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
              <div className={`${styles.authToggle} md:hidden`}>
                Don&apos;t have an account?{' '}
                <span onClick={handleSignupClick} className={styles.authToggleLink}>
                  Sign Up
                </span>
              </div>
            </>
          )}
        </div>

        <div className={styles.overlayContainer}>
          <div className={styles.overlay}>
            <div className={styles.overlayBg} style={{ left: 0 }}>
              <Image
                src={IMAGES.AUTH_LOGIN_ILLUSTRATION}
                alt="Login Illustration"
                fill
                sizes="50vw"
                className={styles.overlayImage}
                priority
              />
              <div className={styles.overlayDim}></div>
            </div>
            <div className={styles.overlayBg} style={{ right: 0 }}>
              <Image
                src={IMAGES.AUTH_SIGNUP_ILLUSTRATION}
                alt="Signup Illustration"
                fill
                sizes="50vw"
                className={styles.overlayImage}
                priority
              />
              <div className={styles.overlayDim}></div>
            </div>

            <div className={`${styles.overlayPanel} ${styles.overlayLeft}`}>
              <h1 className={styles.overlayTitle}>Welcome Back!</h1>
              <p className={styles.overlayText}>To keep connected with us please login with your personal info</p>
              <button type="button" className={styles.ghostButton} onClick={handleLoginClick}>
                Sign In
              </button>
            </div>
            <div className={`${styles.overlayPanel} ${styles.overlayRight}`}>
              <h1 className={styles.overlayTitle}>Hello, Friend!</h1>
              <p className={styles.overlayText}>Enter your personal details and start your journey with us</p>
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

export default LoginSignupForm;
