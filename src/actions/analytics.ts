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

export interface ProjectTaskStats {
    total: number;
    columns: {
        id: string;
        title: string;
        count: number;
    }[];
}

export interface WorkloadStats {
    memberId: string;
    memberName: string;
    count: number;
}

export async function getProjectTaskStats(projectId: string): Promise<ProjectTaskStats> {
    const session = await getSession();
    if (!session) {
        return { total: 0, columns: [] };
    }

    await dbConnect();

    // Get specific project with columns
    const project = await Project.findById(projectId).select('columns').lean();
    if (!project) return { total: 0, columns: [] };

    const tasks = await Task.find({ project: projectId }).select('status').lean();

    const stats = {
        total: tasks.length,
        columns: project.columns.map(col => ({
            id: col.id,
            title: col.title,
            count: tasks.filter(t => t.status === col.id).length
        }))
    };

    return stats;
}

export async function getWorkloadStats(projectId: string): Promise<WorkloadStats[]> {
    const session = await getSession();
    if (!session) return [];

    await dbConnect();

    // Verify access
    const project = await Project.findOne({
        _id: projectId,
        $or: [
            { owner: session.userId },
            { "members.user": session.userId }
        ]
    });

    if (!project) return [];

    const stats = await Task.aggregate([
        {
            $match: {
                project: project._id,
                // Only count tasks that are NOT in a completed column
                // We need to determine which statuses are "done"
            }
        },
        // We can't filter by status here easily without knowing which columns are "done"
        // So we'll group by assignee and status first
        {
            $group: {
                _id: {
                    assignedTo: "$assignedTo",
                    status: "$status"
                },
                count: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "_id.assignedTo",
                foreignField: "_id",
                as: "assignee"
            }
        },
        {
            $unwind: {
                path: "$assignee",
                preserveNullAndEmptyArrays: true
            }
        }
    ]);

    // Process in JS to filter out completed tasks
    const completedStatuses = new Set(
        project.columns
            .filter(c =>
                c.id.toLowerCase().includes('done') ||
                c.id.toLowerCase().includes('complete') ||
                c.title.toLowerCase().includes('done') ||
                c.title.toLowerCase().includes('complete')
            )
            .map(c => c.id)
    );

    const workloadMap = new Map<string, { name: string; count: number }>();

    stats.forEach(item => {
        const { assignedTo, status } = item._id;
        const count = item.count;
        const assignee = item.assignee;

        // Skip completed tasks
        if (completedStatuses.has(status)) return;

        const memberId = assignedTo ? assignedTo.toString() : 'unassigned';
        const memberName = assignee ? assignee.name : 'Unassigned';

        const current = workloadMap.get(memberId) || { name: memberName, count: 0 };
        current.count += count;
        workloadMap.set(memberId, current);
    });

    return Array.from(workloadMap.entries()).map(([memberId, { name, count }]) => ({
        memberId,
        memberName: name,
        count
    }));
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
            { "members.user": session.userId }
        ]
    }).select('_id columns').lean();

    const projectIds = projects.map(p => p._id);

    if (projectIds.length === 0) {
        return { total: 0, completed: 0, inProgress: 0, overdue: 0, completedThisWeek: 0 };
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Optimized aggregation
    const aggResult = await Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        {
            $project: {
                project: 1,
                status: 1,
                dueDate: 1,
                updatedAt: 1,
                isOverdue: { $lt: ["$dueDate", now] },
                isUpdatedThisWeek: { $gte: ["$updatedAt", weekAgo] }
            }
        },
        {
            $group: {
                _id: {
                    project: "$project",
                    status: "$status"
                },
                count: { $sum: 1 },
                overdueCount: { $sum: { $cond: ["$isOverdue", 1, 0] } },
                updatedThisWeekCount: { $sum: { $cond: ["$isUpdatedThisWeek", 1, 0] } }
            }
        }
    ]);

    let total = 0;
    let completed = 0;
    let inProgress = 0;
    let overdue = 0;
    let completedThisWeek = 0;

    for (const group of aggResult) {
        const projectId = group._id.project.toString();
        const status = group._id.status;
        const count = group.count;

        const project = projects.find(p => p._id.toString() === projectId);
        if (!project) continue;

        total += count;

        const columns = project.columns || [];

        const isCompleted = columns.some(c =>
            (c.id === status || c.title === status) &&
            (c.id.toLowerCase().includes('done') ||
                c.id.toLowerCase().includes('complete') ||
                c.title.toLowerCase().includes('done') ||
                c.title.toLowerCase().includes('complete'))
        );

        const isInProgress = columns.some(c =>
            (c.id === status || c.title === status) &&
            (c.id.toLowerCase().includes('progress') ||
                c.title.toLowerCase().includes('progress'))
        );

        if (isCompleted) {
            completed += count;
            // For completedThisWeek, we need to be careful. 
            // The aggregation summed up updatedThisWeekCount for ALL tasks in this group.
            // Since this entire group is "completed", all updated tasks here are "completed this week" candidates.
            // (Assuming "completed this week" means completed task that was updated this week)
            completedThisWeek += group.updatedThisWeekCount;
        } else {
            // Not completed
            if (isInProgress) {
                inProgress += count;
            }
            // Overdue logic: check if overdue count > 0 in this group
            overdue += group.overdueCount;
        }
    }

    return {
        total,
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
            { "members.user": session.userId }
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
            { "members.user": session.userId }
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
