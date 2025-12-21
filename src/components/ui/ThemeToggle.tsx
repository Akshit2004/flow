"use client";

import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            className={styles.toggle}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            <span className={`${styles.iconWrapper} ${theme === 'light' ? styles.visible : ''}`}>
                <Sun size={18} />
            </span>
            <span className={`${styles.iconWrapper} ${theme === 'dark' ? styles.visible : ''}`}>
                <Moon size={18} />
            </span>
        </button>
    );
}
