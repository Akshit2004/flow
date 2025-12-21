import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvitation extends Document {
    project: mongoose.Types.ObjectId;
    email: string;
    token: string;
    invitedBy: mongoose.Types.ObjectId;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const InvitationSchema: Schema<IInvitation> = new Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
        },
        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
            default: 'PENDING',
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 }, // TTL index to auto-delete expired invites
        },
    },
    {
        timestamps: true,
    }
);

const Invitation: Model<IInvitation> =
    mongoose.models.Invitation || mongoose.model<IInvitation>('Invitation', InvitationSchema);

export default Invitation;
