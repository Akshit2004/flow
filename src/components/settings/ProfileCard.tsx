"use client";

import styles from './settings.module.css';
import Input from '@/components/ui/Input';

interface ProfileCardProps {
    user: {
        name: string;
        email: string;
    };
}

export default function ProfileCard({ user }: ProfileCardProps) {
    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={styles.avatarLarge}>
                    {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className={styles.profileInfo}>
                    <div className={styles.name}>{user.name}</div>
                    <div className={styles.email}>{user.email}</div>
                </div>
            </div>
            
            <div className={styles.fieldGroup}>
                <Input 
                    label="Display Name" 
                    defaultValue={user.name} 
                    disabled 
                />
                <Input 
                    label="Email Address" 
                    defaultValue={user.email} 
                    disabled 
                />
            </div>
        </div>
    );
}
