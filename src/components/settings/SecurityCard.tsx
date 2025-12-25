"use client";

import { useActionState, useEffect } from 'react';
import { changePassword } from '@/actions/settings';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import styles from './settings.module.css';

const initialState = {
    error: '',
    success: ''
};

export default function SecurityCard() {
    // @ts-ignore
    const [state, formAction, isPending] = useActionState(changePassword, initialState);

    return (
        <div className={styles.card}>
            <h3 className={styles.cardTitle}>Change Password</h3>
            <form action={formAction} className={styles.formStack}>
                <Input 
                    name="currentPassword" 
                    type="password" 
                    label="Current Password" 
                    required 
                />
                <div className={styles.fieldGroup}>
                    <Input 
                        name="newPassword" 
                        type="password" 
                        label="New Password" 
                        required 
                    />
                    <Input 
                        name="confirmPassword" 
                        type="password" 
                        label="Confirm New Password" 
                        required 
                    />
                </div>
                
                {state?.error && <p className={styles.errorText}>{state.error}</p>}
                {state?.success && <p className={styles.successText}>{state.success}</p>}

                <div className={styles.actionRow}>
                   <Button type="submit" disabled={isPending}>
                        {isPending ? 'Updating...' : 'Update Password'}
                   </Button>
                </div>
            </form>
        </div>
    );
}
