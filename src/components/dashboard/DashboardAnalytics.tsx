"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTaskStats, getOverdueTasks, TaskStats, OverdueTask } from '@/actions/analytics';
import { CheckCircle, Clock, AlertTriangle, LayoutList, Loader2, TrendingUp, Download, FileText } from 'lucide-react';
import styles from './DashboardAnalytics.module.css';

function formatDaysOverdue(dateStr: string): string {
    const dueDate = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return '1 day overdue';
    return `${diffDays} days overdue`;
}

export default function DashboardAnalytics() {
    const [stats, setStats] = useState<TaskStats | null>(null);
    const [overdueTasks, setOverdueTasks] = useState<OverdueTask[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [statsData, overdueData] = await Promise.all([
                    getTaskStats(),
                    getOverdueTasks()
                ]);
                setStats(statsData);
                setOverdueTasks(overdueData);
            } catch (err) {
                console.error('Failed to fetch analytics:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className={styles.loading}>
                <Loader2 size={24} className="animate-spin" />
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className={styles.analyticsSection}>
            {overdueTasks.length > 0 && (
                <div className={styles.overdueSection}>
                    <div className={styles.sectionHeader}>
                        <AlertTriangle size={16} color="var(--error)" />
                        Overdue Tasks
                    </div>
                    <div className={styles.overdueList}>
                        {overdueTasks.slice(0, 5).map((task) => (
                            <Link 
                                key={task._id} 
                                href={`/dashboard/project/${task.projectId}`}
                                className={styles.overdueItem}
                            >
                                <div className={styles.overdueInfo}>
                                    <div className={styles.overdueTitle}>{task.title}</div>
                                    <div className={styles.overdueTicket}>
                                        {task.ticketId || task.projectName}
                                    </div>
                                </div>
                                <div className={styles.overdueDays}>
                                    {formatDaysOverdue(task.dueDate)}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
