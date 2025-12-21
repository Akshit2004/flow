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

function generateCSV(stats: TaskStats, overdueTasks: OverdueTask[]): string {
    const date = new Date().toLocaleDateString();
    let csv = `Project Analytics Report - ${date}\n\n`;
    csv += `Summary\n`;
    csv += `Metric,Value\n`;
    csv += `Total Tasks,${stats.total}\n`;
    csv += `Completed,${stats.completed}\n`;
    csv += `In Progress,${stats.inProgress}\n`;
    csv += `Overdue,${stats.overdue}\n`;
    csv += `Completed This Week,${stats.completedThisWeek}\n`;
    csv += `\n`;
    
    if (overdueTasks.length > 0) {
        csv += `Overdue Tasks\n`;
        csv += `Title,Ticket ID,Project,Due Date,Days Overdue\n`;
        overdueTasks.forEach(task => {
            const dueDate = new Date(task.dueDate);
            const daysOverdue = Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
            csv += `"${task.title}","${task.ticketId || ''}","${task.projectName}","${dueDate.toLocaleDateString()}",${daysOverdue}\n`;
        });
    }
    
    return csv;
}

function downloadCSV(stats: TaskStats, overdueTasks: OverdueTask[]) {
    const csv = generateCSV(stats, overdueTasks);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `project-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function printReport() {
    window.print();
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
            {/* Header with Export Buttons */}
            <div className={styles.analyticsHeader}>
                <h2 className={styles.analyticsTitle}>Dashboard Overview</h2>
                <div className={styles.exportButtons}>
                    <button 
                        className={styles.exportButton}
                        onClick={() => downloadCSV(stats, overdueTasks)}
                        title="Download CSV"
                    >
                        <Download size={16} />
                        <span>CSV</span>
                    </button>
                    <button 
                        className={styles.exportButton}
                        onClick={printReport}
                        title="Print / Save as PDF"
                    >
                        <FileText size={16} />
                        <span>Print</span>
                    </button>
                </div>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.total}`}>
                        <LayoutList size={20} />
                    </div>
                    <div className={styles.statValue}>{stats.total}</div>
                    <div className={styles.statLabel}>Total Tasks</div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.completed}`}>
                        <CheckCircle size={20} />
                    </div>
                    <div className={styles.statValue}>{stats.completed}</div>
                    <div className={styles.statLabel}>Completed</div>
                    {stats.completedThisWeek > 0 && (
                        <div className={styles.statChange}>
                            <TrendingUp size={12} />
                            {stats.completedThisWeek} this week
                        </div>
                    )}
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.progress}`}>
                        <Clock size={20} />
                    </div>
                    <div className={styles.statValue}>{stats.inProgress}</div>
                    <div className={styles.statLabel}>In Progress</div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.overdue}`}>
                        <AlertTriangle size={20} />
                    </div>
                    <div className={styles.statValue}>{stats.overdue}</div>
                    <div className={styles.statLabel}>Overdue</div>
                </div>
            </div>

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
