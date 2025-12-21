import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './User';
import { IProject } from './Project';
import { ITask } from './Task';

export type ActivityAction =
    | 'TASK_CREATED'
    | 'TASK_UPDATED'
    | 'TASK_DELETED'
    | 'TASK_MOVED'
    | 'TASK_ASSIGNED'
    | 'COMMENT_ADDED'
    | 'SUBTASK_ADDED'
    | 'SUBTASK_COMPLETED'
    | 'PROJECT_CREATED'
    | 'PROJECT_UPDATED'
    | 'MEMBER_ADDED'
    | 'MEMBER_REMOVED';

export interface IActivityLog extends Document {
    project: IProject | mongoose.Types.ObjectId | string;
    task?: ITask | mongoose.Types.ObjectId | string;
    user: IUser | mongoose.Types.ObjectId | string;
    action: ActivityAction;
    field?: string; // e.g., 'status', 'priority', 'assignedTo'
    oldValue?: string;
    newValue?: string;
    metadata?: Record<string, unknown>; // Flexible additional data
    createdAt: Date;
}

const ActivityLogSchema: Schema<IActivityLog> = new Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        action: {
            type: String,
            required: true,
            enum: [
                'TASK_CREATED',
                'TASK_UPDATED',
                'TASK_DELETED',
                'TASK_MOVED',
                'TASK_ASSIGNED',
                'COMMENT_ADDED',
                'SUBTASK_ADDED',
                'SUBTASK_COMPLETED',
                'PROJECT_CREATED',
                'PROJECT_UPDATED',
                'MEMBER_ADDED',
                'MEMBER_REMOVED',
            ],
        },
        field: {
            type: String,
        },
        oldValue: {
            type: String,
        },
        newValue: {
            type: String,
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Add indexes for efficient querying
ActivityLogSchema.index({ project: 1, createdAt: -1 });
ActivityLogSchema.index({ task: 1, createdAt: -1 });

// Prevent overwrite on HMR
const ActivityLog: Model<IActivityLog> =
    mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);

export default ActivityLog;
