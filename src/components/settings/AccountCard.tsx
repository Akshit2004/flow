"use client";

import { logout } from "@/actions/auth";
import Button from "@/components/ui/Button";
import styles from './settings.module.css';

export default function AccountCard() {
    return (
        <div className={styles.card}>
            <div className={styles.dangerZone}>
                <h3 className={styles.dangerTitle}>Sign Out</h3>
                <p className={styles.dangerDesc}>
                    Log out of your account. You will need to sign in again to access your projects.
                </p>
                <form action={logout}>
                    <Button variant="danger">Sign Out</Button>
                </form>
            </div>
        </div>
    );
}
