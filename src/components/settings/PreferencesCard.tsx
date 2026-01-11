"use client";

import { useState } from "react";
import styles from "./settings.module.css";
import { Globe, Clock, Calendar } from "lucide-react";

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
];

const timezones = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Central European Time (CET)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
  { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
];

const dateFormats = [
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (12/31/2024)" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (31/12/2024)" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2024-12-31)" },
];

export default function PreferencesCard() {
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("UTC");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");

  return (
    <div className={styles.card}>
      <div className={styles.preferenceItem}>
        <div className={styles.preferenceHeader}>
          <Globe size={18} />
          <span className={styles.preferenceLabel}>Language</span>
        </div>
        <select
          className={styles.select}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.preferenceItem}>
        <div className={styles.preferenceHeader}>
          <Clock size={18} />
          <span className={styles.preferenceLabel}>Timezone</span>
        </div>
        <select
          className={styles.select}
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
        >
          {timezones.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.preferenceItem}>
        <div className={styles.preferenceHeader}>
          <Calendar size={18} />
          <span className={styles.preferenceLabel}>Date Format</span>
        </div>
        <select
          className={styles.select}
          value={dateFormat}
          onChange={(e) => setDateFormat(e.target.value)}
        >
          {dateFormats.map((df) => (
            <option key={df.value} value={df.value}>
              {df.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
