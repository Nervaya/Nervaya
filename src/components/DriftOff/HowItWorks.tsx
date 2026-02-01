import styles from './styles.module.css';

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      description:
        'Complete payment and receive a detailed form on your Whats App. Fill the form mindfully and completely.',
    },
    {
      id: 2,
      description:
        'Our experts will analyze your forms and create a custom deep rest session playlist within 1-2 days.',
    },
    {
      id: 3,
      description:
        'Listen to invite tranquility & calm at chaotic moments during the day and fall asleep to the session at night.',
    },
  ];

  return (
    <div className={styles.howItWorksSection}>
      <h2 className={styles.sectionTitle}>How It Works</h2>
      <div className={styles.stepsGrid}>
        {steps.map((step) => (
          <div key={step.id} className={styles.stepCard}>
            <div className={styles.stepNumber}>{step.id}</div>
            <p className={styles.stepDescription}>{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
