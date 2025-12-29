"use client";

import { useEffect, useState } from 'react';
import { getTaskStats, getOverdueTasks, getCompletionTrend, getProjectTaskStats, getWorkloadStats, TaskStats, OverdueTask, DailyCompletion, ProjectTaskStats, WorkloadStats } from '@/actions/analytics';
import { CheckCircle, Clock, AlertTriangle, LayoutList, Loader2, TrendingUp, Download, Share2, Printer, Copy, Check } from 'lucide-react';
import styles from './ProjectAnalytics.module.css';
import StatusPieChart from './analytics/StatusPieChart';
import WorkloadChart from './analytics/WorkloadChart';
import CompletionChart from './analytics/CompletionChart';

interface ProjectAnalyticsProps {
    projectId: string;
}

function formatDaysOverdue(dateStr: string): string {
    const dueDate = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return '1 day overdue';
    return `${diffDays} days overdue`;
}

function generateReportCSV(stats: TaskStats, overdueTasks: OverdueTask[], completionTrend: DailyCompletion[]): string {
    const date = new Date().toLocaleDateString();
    let csv = `Project Analytics Report\nGenerated: ${date}\n\n`;
    csv += `SUMMARY\n`;
    csv += `Metric,Value\n`;
    csv += `Total Tasks,${stats.total}\n`;
    csv += `Completed,${stats.completed}\n`;
    csv += `In Progress,${stats.inProgress}\n`;
    csv += `Overdue,${stats.overdue}\n`;
    csv += `Completion Rate,${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%\n`;
    csv += `\n`;

    csv += `DAILY COMPLETIONS (Last 7 Days)\n`;
    csv += `Date,Completions\n`;
    completionTrend.forEach(day => {
        csv += `${day.date},${day.count}\n`;
    });
    csv += `\n`;
    
    if (overdueTasks.length > 0) {
        csv += `OVERDUE TASKS\n`;
        csv += `Title,Ticket ID,Due Date,Days Overdue\n`;
        overdueTasks.forEach(task => {
            const dueDate = new Date(task.dueDate);
            const daysOverdue = Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
            csv += `"${task.title}","${task.ticketId || ''}","${dueDate.toLocaleDateString()}",${daysOverdue}\n`;
        });
    }
    
    return csv;
}

export default function ProjectAnalytics({ projectId }: ProjectAnalyticsProps) {
    const [stats, setStats] = useState<TaskStats | null>(null);
    const [projectStats, setProjectStats] = useState<ProjectTaskStats | null>(null);
    const [overdueTasks, setOverdueTasks] = useState<OverdueTask[]>([]);
    const [completionTrend, setCompletionTrend] = useState<DailyCompletion[]>([]);
    const [workloadStats, setWorkloadStats] = useState<WorkloadStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [statsData, overdueData, trendData, projectStatsData, workloadData] = await Promise.all([
                    getTaskStats(),
                    getOverdueTasks(),
                    getCompletionTrend(7),
                    getProjectTaskStats(projectId),
                    getWorkloadStats(projectId)
                ]) as [TaskStats, OverdueTask[], DailyCompletion[], ProjectTaskStats, WorkloadStats[]];
                setStats(statsData);
                setOverdueTasks(overdueData.filter(t => t.projectId === projectId));
                setCompletionTrend(trendData);
                setProjectStats(projectStatsData);
                setWorkloadStats(workloadData);
            } catch (err) {
                console.error('Failed to fetch analytics:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [projectId]);

    const handleDownloadCSV = () => {
        if (!stats) return;
        const csv = generateReportCSV(stats, overdueTasks, completionTrend);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `project-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <Loader2 size={24} className="animate-spin" />
                <span>Loading analytics...</span>
            </div>
        );
    }

    if (!stats) return null;

    // Prepare Pie Chart Data
    const pieData = projectStats ? projectStats.columns
        .filter(c => c.count > 0)
        .map((col, index) => {
            const colors = ['var(--success)', 'var(--info)', 'var(--warning)', 'var(--error)', '#8B5CF6', '#EC4899', '#10B981'];
            return {
                name: col.title,
                value: col.count,
                color: colors[index % colors.length]
            };
        }) : [];

    return (
        <div className={styles.container}>
            {/* Header with Export Options */}
            <div className={styles.header}>
                <h2 className={styles.title}>Project Analytics</h2>
                <div className={styles.actions}>
                    <button className={styles.actionButton} onClick={handleDownloadCSV} title="Download CSV">
                        <Download size={16} />
                        <span>Export</span>
                    </button>
                    <button className={styles.actionButton} onClick={handlePrint} title="Print Report">
                        <Printer size={16} />
                        <span>Print</span>
                    </button>
                    <button className={styles.actionButton} onClick={handleCopyLink} title="Copy Link to Share">
                        {copied ? <Check size={16} /> : <Share2 size={16} />}
                        <span>{copied ? 'Copied!' : 'Share'}</span>
                    </button>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Donut Chart */}
                <div className={styles.chartCard} style={{ minHeight: '380px' }}>
                    <h3 className={styles.chartTitle}>Task Distribution</h3>
                    <StatusPieChart data={pieData} />
                </div>

                {/* Completion Bar Chart */}
                <div className={styles.chartCard} style={{ minHeight: '380px' }}>
                    <h3 className={styles.chartTitle}>Completions (Last 7 Days)</h3>
                    <CompletionChart data={completionTrend} />
                    <div className={styles.chartFooter}>
                        <TrendingUp size={14} />
                        <span>{stats.completedThisWeek} tasks completed this week</span>
                    </div>
                </div>

                 {/* Workload Chart */}
                 <div className={`${styles.chartCard} md:col-span-2`} style={{ minHeight: '380px' }}>
                    <h3 className={styles.chartTitle}>Workload by Member (Open Tasks)</h3>
                    <WorkloadChart data={workloadStats} />
                </div>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.total}`}>
                        <LayoutList size={20} />
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{stats.total}</div>
                        <div className={styles.statLabel}>Total Tasks</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.completed}`}>
                        <CheckCircle size={20} />
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{stats.completed}</div>
                        <div className={styles.statLabel}>Completed</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.progress}`}>
                        <Clock size={20} />
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{stats.inProgress}</div>
                        <div className={styles.statLabel}>In Progress</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.overdue}`}>
                        <AlertTriangle size={20} />
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{stats.overdue}</div>
                        <div className={styles.statLabel}>Overdue</div>
                    </div>
                </div>
            </div>

            {/* Overdue Tasks */}
            {overdueTasks.length > 0 && (
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                        <AlertTriangle size={16} color="var(--error)" />
                        Overdue Tasks
                    </h3>
                    <div className={styles.overdueList}>
                        {overdueTasks.map(task => (
                            <div key={task._id} className={styles.overdueItem}>
                                <div>
                                    <div className={styles.overdueTitle}>{task.title}</div>
                                    <div className={styles.overdueTicket}>{task.ticketId}</div>
                                </div>
                                <div className={styles.overdueDays}>{formatDaysOverdue(task.dueDate)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
