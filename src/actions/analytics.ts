"use server";

import dbConnect from "@/lib/db";
import Task from "@/models/Task";
import Project from "@/models/Project";
import ActivityLog from "@/models/ActivityLog";
import { getSession } from "@/lib/auth";

export interface TaskStats {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
    completedThisWeek: number;
}

export interface OverdueTask {
    _id: string;
    title: string;
    ticketId?: string;
    dueDate: string;
    projectName: string;
    projectId: string;
}

export interface DailyCompletion {
    date: string;
    count: number;
}

export async function getTaskStats(): Promise<TaskStats> {
    const session = await getSession();
    if (!session) {
        return { total: 0, completed: 0, inProgress: 0, overdue: 0, completedThisWeek: 0 };
    }

    await dbConnect();

    // Get all projects user has access to
    const projects = await Project.find({
        $or: [
            { owner: session.userId },
            { members: session.userId }
        ]
    }).select('_id columns').lean();

    const projectIds = projects.map(p => p._id);

    // Get all tasks for these projects
    const tasks = await Task.find({ project: { $in: projectIds } }).lean();

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Calculate stats
    let completed = 0;
    let inProgress = 0;
    let overdue = 0;
    let completedThisWeek = 0;

    for (const task of tasks) {
        const project = projects.find(p => p._id.toString() === task.project.toString());
        const columns = project?.columns || [];

        // Check if task is in a "completed" column
        const isCompleted = columns.some(c =>
            (c.id === task.status || c.title === task.status) &&
            (c.id.toLowerCase().includes('done') ||
                c.id.toLowerCase().includes('complete') ||
                c.title.toLowerCase().includes('done') ||
                c.title.toLowerCase().includes('complete'))
        );

        const isInProgress = columns.some(c =>
            (c.id === task.status || c.title === task.status) &&
            (c.id.toLowerCase().includes('progress') ||
                c.title.toLowerCase().includes('progress'))
        );

        if (isCompleted) {
            completed++;
            if (task.updatedAt && new Date(task.updatedAt) >= weekAgo) {
                completedThisWeek++;
            }
        } else if (isInProgress) {
            inProgress++;
        }

        // Check overdue (not completed and past due date)
        if (!isCompleted && task.dueDate && new Date(task.dueDate) < now) {
            overdue++;
        }
    }

    return {
        total: tasks.length,
        completed,
        inProgress,
        overdue,
        completedThisWeek
    };
}

export async function getOverdueTasks(): Promise<OverdueTask[]> {
    const session = await getSession();
    if (!session) return [];

    await dbConnect();

    const projects = await Project.find({
        $or: [
            { owner: session.userId },
            { members: session.userId }
        ]
    }).select('_id name columns').lean();

    const projectIds = projects.map(p => p._id);
    const now = new Date();

    const tasks = await Task.find({
        project: { $in: projectIds },
        dueDate: { $lt: now }
    })
        .select('title ticketId dueDate project status')
        .sort({ dueDate: 1 })
        .limit(10)
        .lean();

    // Filter out completed tasks
    const overdueTasks: OverdueTask[] = [];
    for (const task of tasks) {
        const project = projects.find(p => p._id.toString() === task.project.toString());
        if (!project) continue;

        const columns = (project as any).columns || [];
        const isCompleted = columns.some((c: any) =>
            (c.id === task.status || c.title === task.status) &&
            (c.id.toLowerCase().includes('done') ||
                c.id.toLowerCase().includes('complete') ||
                c.title.toLowerCase().includes('done') ||
                c.title.toLowerCase().includes('complete'))
        );

        if (!isCompleted) {
            overdueTasks.push({
                _id: task._id.toString(),
                title: task.title,
                ticketId: task.ticketId,
                dueDate: task.dueDate!.toISOString(),
                projectName: project.name,
                projectId: project._id.toString()
            });
        }
    }

    return overdueTasks;
}

export async function getCompletionTrend(days: number = 7): Promise<DailyCompletion[]> {
    const session = await getSession();
    if (!session) return [];

    await dbConnect();

    const projects = await Project.find({
        $or: [
            { owner: session.userId },
            { members: session.userId }
        ]
    }).select('_id').lean();

    const projectIds = projects.map(p => p._id);

    // Get completion activities for the last N days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const activities = await ActivityLog.find({
        project: { $in: projectIds },
        action: { $in: ['TASK_MOVED', 'TASK_UPDATED'] },
        newValue: { $regex: /done|complete/i },
        createdAt: { $gte: startDate }
    }).lean();

    // Group by date
    const dailyMap = new Map<string, number>();

    // Initialize all days with 0
    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyMap.set(dateStr, 0);
    }

    // Count completions per day
    for (const activity of activities) {
        const dateStr = activity.createdAt.toISOString().split('T')[0];
        dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + 1);
    }

    // Convert to array and sort chronologically
    return Array.from(dailyMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
}
