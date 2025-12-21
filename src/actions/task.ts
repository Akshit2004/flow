'use server';

import dbConnect from '@/lib/db';
import Task, { TaskStatus, TaskPriority } from '@/models/Task';
import Project from '@/models/Project';
import User from '@/models/User';
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
        const project = await Project.findById(projectId);
        if (!project) return { error: 'Project not found' };

        // Generate Ticket ID if project has key, otherwise fallback or skip
        // For now assuming key exists (new projects) or we might need migration
        let ticketId = undefined;
        if (project.key || project.taskCount !== undefined) {
            // Atomic increment would be better but for MVP this is okay-ish 
            // actually findOneAndUpdate is safer
        }

        // Better approach:
        const projectDoc = await Project.findByIdAndUpdate(
            projectId,
            { $inc: { taskCount: 1 } },
            { new: true, select: 'key taskCount' }
        );

        if (projectDoc && projectDoc.key) {
            ticketId = `${projectDoc.key}-${projectDoc.taskCount}`;
        }

        const task = await Task.create({
            title,
            description,
            project: projectId,
            priority,
            status,
            order: await getNextOrder(projectId, status),
            ticketId,
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
    const tasks = await Task.find({ project: projectId })
        .sort({ order: 1 })
        .populate('comments.user', 'name email avatar')
        .lean();

    return tasks.map(t => ({
        _id: t._id.toString(),
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        order: t.order,
        project: t.project.toString(),
        ticketId: t.ticketId,
        assignedTo: t.assignedTo?.toString(),
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        dueDate: t.dueDate?.toISOString(),
        comments: t.comments?.map((c: any) => ({
            _id: c._id.toString(),
            text: c.text,
            user: c.user && typeof c.user === 'object' && '_id' in c.user
                ? {
                    _id: (c.user as any)._id.toString(),
                    name: (c.user as any).name,
                    email: (c.user as any).email,
                    avatar: (c.user as any).avatar
                }
                : c.user?.toString(),
            createdAt: c.createdAt.toISOString()
        })) || []
    }));
}

export async function getProjectUsers() {
    // Temporary: fetch all users until project membership is real
    // In a real app we'd filter by project.
    const session = await getSession();
    if (!session) return [];

    await dbConnect();
    const users = await User.find({}).select('name email avatar').lean();
    return users.map(u => ({ ...u, _id: u._id.toString() }));
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

export async function updateTaskDetails(taskId: string, updates: Partial<{
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    assignedTo: string;
    dueDate: string | Date | null;
}>) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    await dbConnect();

    try {
        const task = await Task.findByIdAndUpdate(taskId, { $set: updates }, { new: true })
            .populate('assignedTo', 'name email avatar')
            .populate('comments.user', 'name email avatar');

        if (!task) return { error: 'Task not found' };

        revalidatePath(`/dashboard/project/${task.project}`);

        const plainTask = task.toObject();
        return {
            success: true, task: {
                ...plainTask,
                _id: plainTask._id.toString(),
                project: plainTask.project.toString(),
                assignedTo: plainTask.assignedTo && typeof plainTask.assignedTo === 'object' && '_id' in plainTask.assignedTo
                    ? { ...plainTask.assignedTo, _id: (plainTask.assignedTo as any)._id.toString() }
                    : plainTask.assignedTo?.toString(),
                createdAt: plainTask.createdAt.toISOString(),
                updatedAt: plainTask.updatedAt.toISOString(),
                dueDate: plainTask.dueDate?.toISOString(),
                comments: plainTask.comments?.map((c: any) => ({
                    ...c,
                    _id: c._id.toString(),
                    user: c.user && typeof c.user === 'object' && '_id' in c.user
                        ? { ...c.user, _id: (c.user as any)._id.toString() }
                        : c.user?.toString(),
                    createdAt: c.createdAt.toISOString()
                }))
            }
        };
    } catch (error) {
        return { error: 'Failed to update task' };
    }
}

export async function addComment(taskId: string, text: string) {
    const session = await getSession();
    if (!session || !session.userId) return { error: 'Unauthorized' };

    await dbConnect();

    try {
        const task = await Task.findByIdAndUpdate(
            taskId,
            {
                $push: {
                    comments: {
                        text,
                        user: session.userId,
                        createdAt: new Date()
                    }
                }
            },
            { new: true }
        )
            .populate('assignedTo', 'name email avatar')
            .populate('comments.user', 'name email avatar');

        if (!task) return { error: 'Task not found' };

        revalidatePath(`/dashboard/project/${task.project}`);

        const plainTask = task.toObject();
        return {
            success: true, task: {
                ...plainTask,
                _id: plainTask._id.toString(),
                project: plainTask.project.toString(),
                assignedTo: plainTask.assignedTo && typeof plainTask.assignedTo === 'object' && '_id' in plainTask.assignedTo
                    ? { ...plainTask.assignedTo, _id: (plainTask.assignedTo as any)._id.toString() }
                    : plainTask.assignedTo?.toString(),
                createdAt: plainTask.createdAt.toISOString(),
                updatedAt: plainTask.updatedAt.toISOString(),
                dueDate: plainTask.dueDate?.toISOString(),
                comments: plainTask.comments?.map((c: any) => ({
                    ...c,
                    _id: c._id.toString(),
                    user: c.user && typeof c.user === 'object' && '_id' in c.user
                        ? { ...c.user, _id: (c.user as any)._id.toString() }
                        : c.user?.toString(),
                    createdAt: c.createdAt.toISOString()
                }))
            }
        };
    } catch (error) {
        return { error: 'Failed to add comment' };
    }
}

export async function deleteTask(taskId: string) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    await dbConnect();

    try {
        const task = await Task.findByIdAndDelete(taskId);
        if (!task) return { error: 'Task not found' };

        revalidatePath(`/dashboard/project/${task.project}`);
        return { success: true, taskId };
    } catch (error) {
        return { error: 'Failed to delete task' };
    }
}

async function getNextOrder(projectId: string, status: TaskStatus): Promise<number> {
    const lastTask = await Task.findOne({ project: projectId, status }).sort({ order: -1 });
    return lastTask ? lastTask.order + 1 : 0;
}
