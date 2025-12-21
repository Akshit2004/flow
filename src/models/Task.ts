import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './User';
import { IProject } from './Project';

export type TaskStatus = string; // Now supports dynamic column IDs
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ISubtask {
    _id: mongoose.Types.ObjectId;
    text: string;
    completed: boolean;
    order: number;
}

export interface ITask extends Document {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    project: IProject | mongoose.Types.ObjectId | string;
    assignedTo?: IUser | mongoose.Types.ObjectId | string;
    dueDate?: Date;
    labels: string[]; // IDs of labels defined in Project
    subtasks: ISubtask[];
    comments: {
        _id: mongoose.Types.ObjectId;
        text: string;
        user: IUser | mongoose.Types.ObjectId | string;
        createdAt: Date;
    }[];
    order: number; // For manual sorting within a column
    ticketId?: string; // e.g., 'PROJ-123'
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
        ticketId: {
            type: String,
        },
        description: {
            type: String,
            maxlength: [1000, 'Description cannot be more than 1000 characters'],
        },
        status: {
            type: String,
            required: true,
            // Removed strict enum to allow dynamic columns
            default: 'TODO',
        },
        labels: [{
            type: String,
        }],
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
        dueDate: {
            type: Date,
        },
        subtasks: [{
            text: { type: String, required: true },
            completed: { type: Boolean, default: false },
            order: { type: Number, default: 0 }
        }],
        comments: [{
            text: { type: String, required: true },
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            createdAt: { type: Date, default: Date.now }
        }],
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
if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.Task;
}

const Task: Model<ITask> =
    mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

export default Task;
