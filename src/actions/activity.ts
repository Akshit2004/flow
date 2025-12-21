"use server";

import dbConnect from "@/lib/db";
import ActivityLog, { ActivityAction, IActivityLog } from "@/models/ActivityLog";
import { getSession } from "@/lib/auth";
import mongoose from "mongoose";

interface LogActivityParams {
    projectId: string;
    taskId?: string;
    action: ActivityAction;
    field?: string;
    oldValue?: string;
    newValue?: string;
    metadata?: Record<string, unknown>;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
    const session = await getSession();
    if (!session) return;

    await dbConnect();

    try {
        await ActivityLog.create({
            project: new mongoose.Types.ObjectId(params.projectId),
            task: params.taskId ? new mongoose.Types.ObjectId(params.taskId) : undefined,
            user: new mongoose.Types.ObjectId(session.userId),
            action: params.action,
            field: params.field,
            oldValue: params.oldValue,
            newValue: params.newValue,
            metadata: params.metadata,
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
        // Don't throw - activity logging should not break main functionality
    }
}

export async function getTaskActivity(taskId: string) {
    const session = await getSession();
    if (!session) return [];

    await dbConnect();

    const activities = await ActivityLog.find({ task: taskId })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

    return activities.map(activity => ({
        _id: activity._id.toString(),
        action: activity.action,
        field: activity.field,
        oldValue: activity.oldValue,
        newValue: activity.newValue,
        metadata: activity.metadata,
        createdAt: activity.createdAt.toISOString(),
        user: activity.user
            ? {
                _id: (activity.user as any)._id?.toString(),
                name: (activity.user as any).name,
                avatar: (activity.user as any).avatar,
            }
            : null,
    }));
}

export async function getProjectActivity(projectId: string) {
    const session = await getSession();
    if (!session) return [];

    await dbConnect();

    const activities = await ActivityLog.find({ project: projectId })
        .populate('user', 'name avatar')
        .populate('task', 'title ticketId')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

    return activities.map(activity => ({
        _id: activity._id.toString(),
        action: activity.action,
        field: activity.field,
        oldValue: activity.oldValue,
        newValue: activity.newValue,
        metadata: activity.metadata,
        createdAt: activity.createdAt.toISOString(),
        user: activity.user
            ? {
                _id: (activity.user as any)._id?.toString(),
                name: (activity.user as any).name,
                avatar: (activity.user as any).avatar,
            }
            : null,
        task: activity.task
            ? {
                _id: (activity.task as any)._id?.toString(),
                title: (activity.task as any).title,
                ticketId: (activity.task as any).ticketId,
            }
            : null,
    }));
}
