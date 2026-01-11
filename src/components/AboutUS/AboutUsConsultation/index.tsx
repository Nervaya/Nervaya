'use client';

import { useState } from "react";
import styles from "./styles.module.css";
import { FaRegComment, FaRegUser, FaRegEnvelope } from "react-icons/fa";
import { IoVideocamOutline } from "react-icons/io5";
import { CiCalendar } from "react-icons/ci";

const AboutUsConsultation = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        connectionType: 'Google Meet',
        email: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log('Form submitted:', formData);
    };

    return (
        <section className={styles.consultationSection}>
            <div className={styles.formCard}>
                <div className={styles.cardHeader}>
                    <div className={styles.headerLeft}>
                        <div className={styles.titleWrapper}>
                            <FaRegComment className={styles.titleIcon} />
                            <h2 className={styles.formTitle}>Free 1 on 1 Assistance</h2>
                        </div>
                        <p className={styles.formSubtitle}>
                            Connect with our sleep experts for personalized guidance on your journey to better rest.
                        </p>
                    </div>
                    <div className={styles.freeSessionBadge}>
                        <span className={styles.badgeText}>Free Session</span>
                        <span className={styles.badgeDuration}>30 minutes</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGrid}>
                        <div className={styles.formLeft}>
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    <FaRegUser className={styles.labelIcon} />
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="John"
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    <FaRegUser className={styles.labelIcon} />
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Doe"
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    <CiCalendar className={styles.labelIcon} />
                                    How would you like to connect?
                                </label>
                                <div className={styles.selectWrapper}>
                                    <IoVideocamOutline className={styles.selectIcon} />
                                    <select
                                        name="connectionType"
                                        value={formData.connectionType}
                                        onChange={handleChange}
                                        className={styles.select}
                                    >
                                        <option value="Google Meet">Google Meet</option>
                                        <option value="Zoom">Zoom</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className={styles.formRight}>
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    <FaRegEnvelope className={styles.labelIcon} />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="your.email@example.com"
                                    className={styles.input}
                                />
                                <p className={styles.inputHint}>
                                    We'll send the Google Meet link here
                                </p>
                            </div>

                            <div className={styles.expectSection}>
                                <h3 className={styles.expectTitle}>What to expect</h3>
                                <ul className={styles.expectList}>
                                    <li className={styles.expectItem}>
                                        Personalized sleep assessment
                                    </li>
                                    <li className={styles.expectItem}>
                                        Custom recommendations
                                    </li>
                                    <li className={styles.expectItem}>
                                        Answer all your questions
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className={styles.formFooter}>
                        <button type="submit" className={styles.submitButton}>
                            <CiCalendar className={styles.buttonIcon} />
                            Schedule Free Consultation
                        </button>
                        <p className={styles.footerText}>
                            We'll respond within 24 hours to confirm your appointment
                        </p>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default AboutUsConsultation;
