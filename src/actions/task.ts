'use server';

import dbConnect from '@/lib/db';
import Task, { TaskStatus, TaskPriority } from '@/models/Task';
import Project from '@/models/Project';
import User from '@/models/User';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { logActivity } from './activity';

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

        // Log activity
        await logActivity({
            projectId,
            taskId: task._id.toString(),
            action: 'TASK_CREATED',
            metadata: { title, ticketId }
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

    // Verify membership
    const project = await Project.findOne({
        _id: projectId,
        $or: [
            { owner: session.userId },
            { "members.user": session.userId }
        ]
    });

    if (!project) return [];

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
        subtasks: (t as any).subtasks?.map((s: any) => ({
            _id: s._id.toString(),
            text: s.text,
            completed: s.completed,
            order: s.order
        })) || [],
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

    const oldTask = await Task.findById(taskId).select('status project').lean();

    await Task.findByIdAndUpdate(taskId, {
        status: newStatus,
        order: newOrder
    });

    // Log status change
    if (oldTask && oldTask.status !== newStatus) {
        await logActivity({
            projectId: oldTask.project.toString(),
            taskId,
            action: 'TASK_MOVED',
            field: 'status',
            oldValue: oldTask.status,
            newValue: newStatus
        });
    }

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
    labels: string[];
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
                labels: plainTask.labels || [],
                comments: plainTask.comments?.map((c: any) => ({
                    ...c,
                    _id: c._id.toString(),
                    user: c.user && typeof c.user === 'object' && '_id' in c.user
                        ? { ...c.user, _id: (c.user as any)._id.toString() }
                        : c.user?.toString(),
                    createdAt: c.createdAt.toISOString()
                })),
                subtasks: plainTask.subtasks?.map((s: any) => ({
                    ...s,
                    _id: s._id.toString()
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

        // Log comment activity
        await logActivity({
            projectId: task.project.toString(),
            taskId,
            action: 'COMMENT_ADDED',
            metadata: { preview: text.substring(0, 100) }
        });

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

        // Log deletion
        await logActivity({
            projectId: task.project.toString(),
            taskId,
            action: 'TASK_DELETED',
            metadata: { title: task.title, ticketId: task.ticketId }
        });

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

// ============================================
// SUBTASK ACTIONS
// ============================================

export async function addSubtask(taskId: string, text: string) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    await dbConnect();

    try {
        // Check if task exists first
        const taskExists = await Task.exists({ _id: taskId });
        if (!taskExists) return { error: 'Task not found' };

        // Get current subtasks count for order
        const currentTask = await Task.findById(taskId).select('subtasks project');
        const order = currentTask?.subtasks?.length || 0;
        const projectId = currentTask?.project?.toString();

        // Use findOneAndUpdate to atomically push and return the new document
        const updatedTask = await Task.findOneAndUpdate(
            { _id: taskId },
            {
                $push: {
                    subtasks: { text, completed: false, order }
                }
            },
            { new: true, runValidators: true }
        ).select('subtasks').lean();

        if (!updatedTask) return { error: 'Failed to add subtask' };

        // Log activity
        if (projectId) {
            await logActivity({
                projectId,
                taskId,
                action: 'SUBTASK_ADDED',
                metadata: { text }
            });
        }

        return {
            success: true,
            subtasks: (updatedTask.subtasks || []).map((s: any) => ({
                _id: s._id.toString(),
                text: s.text,
                completed: s.completed,
                order: s.order
            }))
        };
    } catch (error) {
        console.error('addSubtask error:', error);
        return { error: 'Failed to add subtask' };
    }
}

export async function toggleSubtask(taskId: string, subtaskId: string) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    await dbConnect();

    try {
        const task = await Task.findById(taskId);
        if (!task) return { error: 'Task not found' };

        const subtask = task.subtasks?.find((s: any) => s._id.toString() === subtaskId);
        if (!subtask) return { error: 'Subtask not found' };

        const newCompleted = !subtask.completed;

        await Task.updateOne(
            { _id: taskId, 'subtasks._id': subtaskId },
            { $set: { 'subtasks.$.completed': newCompleted } }
        );

        // Log activity if completed
        if (newCompleted) {
            await logActivity({
                projectId: task.project.toString(),
                taskId,
                action: 'SUBTASK_COMPLETED',
                metadata: { text: subtask.text }
            });
        }

        const updatedTask = await Task.findById(taskId);
        return {
            success: true,
            subtasks: updatedTask?.subtasks?.map((s: any) => ({
                _id: s._id.toString(),
                text: s.text,
                completed: s.completed,
                order: s.order
            })) || []
        };
    } catch (error) {
        return { error: 'Failed to toggle subtask' };
    }
}

export async function deleteSubtask(taskId: string, subtaskId: string) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    await dbConnect();

    try {
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { $pull: { subtasks: { _id: subtaskId } } },
            { new: true }
        );

        if (!updatedTask) return { error: 'Task not found' };

        return {
            success: true,
            subtasks: updatedTask.subtasks?.map((s: any) => ({
                _id: s._id.toString(),
                text: s.text,
                completed: s.completed,
                order: s.order
            })) || []
        };
    } catch (error) {
        return { error: 'Failed to delete subtask' };
    }
}
