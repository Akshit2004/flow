"use client";

import { useEffect, useState } from 'react';
import { getTaskActivity } from '@/actions/activity';
import styles from './ActivityFeed.module.css';
import { ArrowRight, Loader2 } from 'lucide-react';

interface Activity {
    _id: string;
    action: string;
    field?: string;
    oldValue?: string;
    newValue?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
    user: {
        _id: string;
        name: string;
        avatar?: string;
    } | null;
}

interface ActivityFeedProps {
    taskId: string;
}

const ACTION_LABELS: Record<string, string> = {
    TASK_CREATED: 'created this task',
    TASK_UPDATED: 'updated this task',
    TASK_DELETED: 'deleted this task',
    TASK_MOVED: 'moved this task',
    TASK_ASSIGNED: 'changed assignment',
    COMMENT_ADDED: 'added a comment',
    SUBTASK_ADDED: 'added a subtask',
    SUBTASK_COMPLETED: 'completed a subtask',
};

function formatTimestamp(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
}

export default function ActivityFeed({ taskId }: ActivityFeedProps) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchActivities() {
            setLoading(true);
            try {
                const data = await getTaskActivity(taskId);
                setActivities(data);
            } catch (err) {
                console.error('Failed to fetch activities:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchActivities();
    }, [taskId]);

    if (loading) {
        return (
            <div className={styles.loading}>
                <Loader2 size={20} className="animate-spin" />
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className={styles.empty}>
                No activity recorded yet
            </div>
        );
    }

    return (
        <div className={styles.feed}>
            {activities.map((activity) => (
                <div key={activity._id} className={styles.feedItem}>
                    <div className={styles.avatar}>
                        {activity.user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className={styles.content}>
                        <div className={styles.header}>
                            <span className={styles.userName}>
                                {activity.user?.name || 'Unknown'}
                            </span>
                            <span className={styles.actionText}>
                                {ACTION_LABELS[activity.action] || activity.action.toLowerCase().replace(/_/g, ' ')}
                            </span>
                            <span className={styles.timestamp}>
                                {formatTimestamp(activity.createdAt)}
                            </span>
                        </div>
                        {activity.field && activity.oldValue && activity.newValue && (
                            <div className={styles.fieldChange}>
                                <span className={styles.oldValue}>{activity.oldValue}</span>
                                <ArrowRight size={12} className={styles.arrow} />
                                <span className={styles.newValue}>{activity.newValue}</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
