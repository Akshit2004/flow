import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './User';
import { IProject } from './Project';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ITask extends Document {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    project: IProject | mongoose.Types.ObjectId | string;
    assignedTo?: IUser | mongoose.Types.ObjectId | string;
    order: number; // For manual sorting within a column
    createdAt: Date;
    updatedAt: Date;
}

const TaskSchema: Schema<ITask> = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide a task title'],
            maxlength: [200, 'Title cannot be more than 200 characters'],
        },
        description: {
            type: String,
            maxlength: [1000, 'Description cannot be more than 1000 characters'],
        },
        status: {
            type: String,
            enum: ['TODO', 'IN_PROGRESS', 'DONE'],
            default: 'TODO',
        },
        priority: {
            type: String,
            enum: ['LOW', 'MEDIUM', 'HIGH'],
            default: 'MEDIUM',
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent overwrite on HMR
const Task: Model<ITask> =
    mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

export default Task;
