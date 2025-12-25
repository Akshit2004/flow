"use client";

import { useState } from 'react';
import styles from './settings.module.css';
import { Bell, Mail, Smartphone } from 'lucide-react';

export default function NotificationCard() {
    const [preferences, setPreferences] = useState({
        email: true,
        projectUpdates: true,
        marketing: false,
    });

    const toggle = (key: keyof typeof preferences) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className={styles.card}>
            <div className={styles.notificationItem}>
                <div className={styles.notificationInfo}>
                    <div className={styles.notificationHeader}>
                        <Mail size={18} />
                        <span className={styles.notificationLabel}>Email Notifications</span>
                    </div>
                    <p className={styles.notificationDesc}>Receive emails about activity in your projects.</p>
                </div>
                <label className={styles.switch}>
                    <input 
                        type="checkbox" 
                        checked={preferences.email}
                        onChange={() => toggle('email')}
                    />
                    <span className={styles.slider}></span>
                </label>
            </div>

            <div className={styles.notificationItem}>
                <div className={styles.notificationInfo}>
                    <div className={styles.notificationHeader}>
                        <Bell size={18} />
                        <span className={styles.notificationLabel}>Project Updates</span>
                    </div>
                    <p className={styles.notificationDesc}>Get notified when tasks are assigned to you.</p>
                </div>
                <label className={styles.switch}>
                    <input 
                        type="checkbox" 
                        checked={preferences.projectUpdates}
                        onChange={() => toggle('projectUpdates')}
                    />
                    <span className={styles.slider}></span>
                </label>
            </div>

             <div className={styles.notificationItem}>
                <div className={styles.notificationInfo}>
                    <div className={styles.notificationHeader}>
                        <Smartphone size={18} />
                        <span className={styles.notificationLabel}>Marketing Updates</span>
                    </div>
                    <p className={styles.notificationDesc}>Receive news about new features and updates.</p>
                </div>
                <label className={styles.switch}>
                    <input 
                        type="checkbox" 
                        checked={preferences.marketing}
                        onChange={() => toggle('marketing')}
                    />
                    <span className={styles.slider}></span>
                </label>
            </div>
        </div>
    );
}
