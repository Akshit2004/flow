import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import ProfileCard from "@/components/settings/ProfileCard";
import ThemeCard from "@/components/settings/ThemeCard";
import AccountCard from "@/components/settings/AccountCard";
import SecurityCard from "@/components/settings/SecurityCard";
import NotificationCard from "@/components/settings/NotificationCard";
import styles from "./Settings.module.css";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) return notFound();

  const user = {
    name: session.userName || 'User',
    email: session.userEmail || 'user@example.com'
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Settings</h1>
      
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Profile</h2>
        <ProfileCard user={user} />
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Appearance</h2>
        <ThemeCard />
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Security</h2>
        <SecurityCard />
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Notifications</h2>
        <NotificationCard />
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Account</h2>
        <AccountCard />
      </div>
    </div>
  );
}
