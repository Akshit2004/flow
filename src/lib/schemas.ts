import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { TaskPriority, TaskStatus } from '@/models/Task';

export const createTaskSchema = zfd.formData({
    title: zfd.text(z.string().min(1, 'Title is required').max(100, 'Title is too long')),
    description: zfd.text(z.string().optional()),
    projectId: zfd.text(z.string().min(1, 'Project ID is required')),
    priority: zfd.text(z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM')),
    status: zfd.text(z.string().default('TODO')),
});

export const updateTaskSchema = z.object({
    title: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    status: z.string().optional(),
    assignedTo: z.string().optional(),
    dueDate: z.string().nullable().optional(), // Accepting string because it usually comes as ISO string from client
    labels: z.array(z.string()).optional(),
});

export const addCommentSchema = z.object({
    taskId: z.string().min(1, 'Task ID is required'),
    text: z.string().min(1, 'Comment text is required').max(1000, 'Comment is too long'),
});
