import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './User';

export interface IProject extends Document {
    name: string;
    description?: string;
    owner: IUser; // Reference to User
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
        description: {
            type: String,
            maxlength: [500, 'Description cannot be more than 500 characters'],
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent overwrite on HMR
const Project: Model<IProject> =
    mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
