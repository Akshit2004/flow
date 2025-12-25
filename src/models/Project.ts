import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './User';

export interface IProject extends Document {
    name: string;
    description?: string;
    owner: IUser; // Reference to User
    key: string;
    taskCount: number;
    members: { user: IUser | mongoose.Types.ObjectId | string, role: 'ADMIN' | 'MEMBER' }[];
    columns: { id: string; title: string; order: number }[];
    labels: { id: string; name: string; color: string }[];
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema: Schema<IProject> = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a project name'],
            maxlength: [100, 'Name cannot be more than 100 characters'],
        },
        key: {
            type: String,
            unique: true, // Should be unique per project
            trim: true,
            uppercase: true,
        },
        taskCount: {
            type: Number,
            default: 0,
        },
        description: {
            type: String,
            maxlength: [500, 'Description cannot be more than 500 characters'],
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        members: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            role: {
                type: String,
                enum: ['ADMIN', 'MEMBER'],
                default: 'MEMBER',
            }
        }],
        columns: {
            type: [{
                id: { type: String, required: true },
                title: { type: String, required: true },
                order: { type: Number, required: true },
            }],
            default: [
                { id: 'TODO', title: 'To Do', order: 0 },
                { id: 'IN_PROGRESS', title: 'In Progress', order: 1 },
                { id: 'COMPLETED', title: 'Completed', order: 2 },
            ],
        },
        labels: {
            type: [{
                id: { type: String, required: true },
                name: { type: String, required: true },
                color: { type: String, required: true },
            }],
            default: [],
        }
    },
    {
        timestamps: true,
    }
);

// Prevent overwrite on HMR
const Project: Model<IProject> =
    mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
