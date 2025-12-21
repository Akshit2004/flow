'use server';

import dbConnect from '@/lib/db';
import Task, { TaskStatus, TaskPriority } from '@/models/Task';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export interface TaskState {
    error?: string;
    success?: boolean;
}

export async function createTask(prevState: TaskState, formData: FormData): Promise<TaskState> {
    const session = await getSession();
    if (!session || !session.userId) {
        return { error: 'Unauthorized' };
    }

    const projectId = formData.get('projectId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priority = formData.get('priority') as TaskPriority || 'MEDIUM';
    const status = formData.get('status') as TaskStatus || 'TODO';

    if (!title || !projectId) {
        return { error: 'Title and Project ID are required' };
    }

    await dbConnect();

    try {
        // Get highest order to append
        const lastTask = await Task.findOne({ project: projectId, status }).sort({ order: -1 });
        const order = lastTask ? lastTask.order + 1 : 0;

        await Task.create({
            title,
            description,
            project: projectId,
            priority,
            status,
            order,
        });
    } catch (error) {
        return { error: 'Failed to create task' };
    }

    revalidatePath(`/dashboard/project/${projectId}`);
    return { success: true };
}

export async function getTasks(projectId: string) {
    const session = await getSession();
    if (!session) return [];

    await dbConnect();
    const tasks = await Task.find({ project: projectId }).sort({ order: 1 }).lean();

    return tasks.map(t => ({
        ...t,
        _id: t._id.toString(),
        project: t.project.toString(),
        assignedTo: t.assignedTo?.toString(),
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString()
    }));
}

export async function updateTaskStatus(taskId: string, newStatus: TaskStatus, newOrder: number) {
    // Note: In a real app, strict ordering requires more logic (shifting other items)
    // For this demo, we'll just update the status/order directly.
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    await dbConnect();

    await Task.findByIdAndUpdate(taskId, {
        status: newStatus,
        order: newOrder
    });

    // We don't revalidate path here for performance in drag operations, 
    // client should update optimistically.
    return { success: true };
}
