"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Initial load
        const savedTheme = localStorage.getItem('flow-theme') as Theme | null;
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            // Default to light mode, ignoring system preference
            setTheme('light');
            document.documentElement.setAttribute('data-theme', 'light');
        }

        // Listen for changes in other tabs
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'flow-theme' && e.newValue) {
                const newTheme = e.newValue as Theme;
                if (newTheme === 'light' || newTheme === 'dark') {
                    setTheme(newTheme);
                    document.documentElement.setAttribute('data-theme', newTheme);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('flow-theme', newTheme);
        
        // Dispatch a storage event manually for the current tab (storage event only fires for other tabs)
        // actually we don't need to dispatch for current tab as we just set state, 
        // but if we had other components relying on storage event in same tab (unlikely)
    };

    // We render children immediately to avoid blocking, but we suppress hydration warning in layout
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
