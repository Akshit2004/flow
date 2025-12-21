"use client";

import { useState } from 'react';
import { LayoutGrid, BarChart3 } from 'lucide-react';
import styles from './ProjectTabs.module.css';

interface ProjectTabsProps {
    projectId: string;
    activeTab: 'board' | 'analytics';
    onTabChange: (tab: 'board' | 'analytics') => void;
}

export default function ProjectTabs({ projectId, activeTab, onTabChange }: ProjectTabsProps) {
    return (
        <div className={styles.tabs}>
            <button
                className={`${styles.tab} ${activeTab === 'board' ? styles.active : ''}`}
                onClick={() => onTabChange('board')}
            >
                <LayoutGrid size={16} />
                <span>Board</span>
            </button>
            <button
                className={`${styles.tab} ${activeTab === 'analytics' ? styles.active : ''}`}
                onClick={() => onTabChange('analytics')}
            >
                <BarChart3 size={16} />
                <span>Analytics</span>
            </button>
        </div>
    );
}
