'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import { LazyMotion, m, AnimatePresence } from 'framer-motion';
import Input from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import { useAuth } from '@/hooks/useAuth';
import styles from './AnimatedAuthForm.module.css';

interface AnimatedAuthFormProps {
    initialMode?: 'login' | 'signup';
}

export default function AnimatedAuthForm({ initialMode = 'login' }: AnimatedAuthFormProps) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { login, signup, loading, error } = useAuth();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!isLogin) {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      } else if (formData.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isLogin && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {return;}

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.email, formData.password, formData.name);
      }
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({ name: '', email: '', password: '' });
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.formSection}>
          <div className={styles.formContent}>
            <div className={styles.logoContainer}>
              <Image
                src="/icons/nervaya-logo.svg"
                alt="Nervaya Logo"
                width={160}
                height={50}
                priority
              />
            </div>

            <div className={styles.formContainer}>
              <div className={`${styles.formWrapper} ${isLogin ? styles.showLogin : styles.showSignup}`}>
                <div className={`${styles.formPanel} ${styles.loginPanel}`}>
                  <div className={styles.header}>
                    <h1 className={styles.title}>Welcome back</h1>
                    <p className={styles.subtitle}>Please enter your details to continue</p>
                  </div>
                  <form onSubmit={handleSubmit} className={styles.form}>
                    <Input
                      label="Email address"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      error={errors.email}
                      className={styles.glassInput}
                    />

                    <Input
                      label="Password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      error={errors.password}
                      className={styles.glassInput}
                    />

                    <div className={styles.formOptions}>
                      <label className={styles.checkboxLabel}>
                        <input type="checkbox" className={styles.checkbox} />
                        <span>Remember for 30 days</span>
                      </label>
                      <a href="#" className={styles.forgotLink}>Forgot password?</a>
                    </div>

                    {error && <div className={styles.errorMessage}>{error}</div>}

                    <Button type="submit" loading={loading}>
                                            Sign in
                    </Button>
                  </form>
                </div>

                <div className={`${styles.formPanel} ${styles.signupPanel}`}>
                  <div className={styles.header}>
                    <h1 className={styles.title}>Create your account</h1>
                    <p className={styles.subtitle}>Please enter your details to get started</p>
                  </div>
                  <form onSubmit={handleSubmit} className={styles.form}>
                    <Input
                      label="Full name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      error={errors.name}
                      className={styles.glassInput}
                    />

                    <Input
                      label="Email address"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      error={errors.email}
                      className={styles.glassInput}
                    />

                    <Input
                      label="Password"
                      type="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      error={errors.password}
                      className={styles.glassInput}
                    />

                    {error && <div className={styles.errorMessage}>{error}</div>}

                    <Button type="submit" loading={loading}>
                                            Create account
                    </Button>
                  </form>
                </div>
              </div>
            </div>

            <div className={styles.switchContainer}>
              <p className={styles.switchText}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button type="button" onClick={switchMode} className={styles.switchLink}>
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>

        <div className={styles.illustrationSection}>
          <LazyMotion features={() => import('framer-motion').then((mod) => mod.domAnimation)}>
            <AnimatePresence mode='wait'>
              <m.div
                key={isLogin ? 'login-img' : 'signup-img'}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className={styles.illustrationContent}
                style={{ position: 'relative', width: '100%', height: '100%' }}
              >
                <Image
                  src={isLogin ? '/assets/auth/login-illustration.jpg' : '/assets/auth/signup-illustration.png'}
                  alt={isLogin ? 'Login Illustration' : 'Signup Illustration'}
                  fill
                  className={styles.illustrationImage}
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'cover', objectPosition: 'center' }}
                />
              </m.div>
            </AnimatePresence>
          </LazyMotion>
        </div>
      </div>
    </div>
  );
}
