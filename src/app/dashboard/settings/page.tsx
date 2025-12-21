"use client";

import { logout } from "@/actions/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import styles from "./Settings.module.css";

export default function SettingsPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Settings</h1>
      
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Profile</h2>
        <div className={styles.card}>
            <div className={styles.field}>
                <label className={styles.label}>Full Name</label>
                <Input defaultValue="User Name" disabled />
            </div>
             <div className={styles.field}>
                <label className={styles.label}>Email Address</label>
                <Input defaultValue="user@example.com" disabled />
            </div>
            <p className={styles.hint}>Profile editing is coming soon.</p>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Account Actions</h2>
        <div className={styles.card}>
            <form action={logout}>
                <Button variant="danger">Sign Out</Button>
            </form>
        </div>
      </div>
    </div>
  );
}
