"use client";

import { useTheme } from '@/components/ui/ThemeProvider';
import styles from './settings.module.css';
import { Sun, Moon } from 'lucide-react';
import clsx from 'clsx';

export default function ThemeCard() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className={styles.card}>
            <div className={styles.themeOptions}>
                <button 
                    className={clsx(styles.themeOption, { [styles.active]: theme === 'light' })}
                    onClick={() => theme === 'dark' && toggleTheme()}
                >
                    <Sun size={24} />
                    <span className={styles.themeLabel}>Light Mode</span>
                </button>
                
                <button 
                    className={clsx(styles.themeOption, { [styles.active]: theme === 'dark' })}
                    onClick={() => theme === 'light' && toggleTheme()}
                >
                    <Moon size={24} />
                    <span className={styles.themeLabel}>Dark Mode</span>
                </button>
            </div>
        </div>
    );
}
