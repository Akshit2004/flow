'use server';

import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import User from '@/models/User';
import Invitation from '@/models/Invitation';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import { sendLiveInvitationEmail } from '@/lib/email';
import mongoose from 'mongoose';

export async function addProjectMember(projectId: string, email: string, role: string = 'MEMBER') {
    const session = await getSession();
    if (!session || !session.userId) return { error: 'Unauthorized' };

    await dbConnect();
    try {
        const project = await Project.findById(projectId);
        if (!project) return { error: 'Project not found' };

        const invitedUser = await User.findOne({ email });
        if (invitedUser && project.members.some((m: any) => m.user.toString() === invitedUser._id.toString())) {
            return { error: 'User is already a project member' };
        }

        const existingInvite = await Invitation.findOne({ project: projectId, email, status: 'PENDING' });
        if (existingInvite) return { error: 'A pending invitation already exists for this email' };

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await Invitation.create({
            project: projectId,
            email,
            token,
            invitedBy: session.userId,
            role,
            expiresAt,
        });

        const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://flow-six-liart.vercel.app'}/invite/${token}`;
        await sendLiveInvitationEmail(email, project.name, inviteUrl, session.userName || 'Someone');

        revalidatePath(`/dashboard/project/${projectId}/settings`);
        return { success: true };
    } catch (error) {
        console.error('Invite Error:', error);
        return { error: 'Failed to send invitation' };
    }
}

export async function getProjectInvitations(projectId: string) {
    const session = await getSession();
    if (!session) return [];

    await dbConnect();
    const invites = await Invitation.find({ project: projectId, status: 'PENDING' }).lean();

    return invites.map((i: any) => ({
        _id: i._id.toString(),
        email: i.email,
        status: i.status,
        expiresAt: i.expiresAt.toISOString(),
    }));
}

export async function revokeInvitation(invitationId: string) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    await dbConnect();
    try {
        const invite = await Invitation.findByIdAndDelete(invitationId);
        if (invite) {
            revalidatePath(`/dashboard/project/${invite.project}/settings`);
        }
        return { success: true };
    } catch (error) {
        return { error: 'Failed to revoke invitation' };
    }
}

export async function acceptInvitation(token: string) {
    const session = await getSession();
    if (!session || !session.userId) return { error: 'You must be logged in to accept invitations' };

    await dbConnect();
    try {
        const invite = await Invitation.findOne({ token, status: 'PENDING' });
        if (!invite) return { error: 'Invalid or expired invitation' };

        if (new Date() > invite.expiresAt) {
            await Invitation.findByIdAndDelete(invite._id);
            return { error: 'Invitation has expired' };
        }

        await Project.findByIdAndUpdate(invite.project, {
            $addToSet: { members: { user: new mongoose.Types.ObjectId(session.userId), role: invite.role } }
        });

        invite.status = 'ACCEPTED';
        await invite.save();

        revalidatePath(`/dashboard/project/${invite.project}`);
        revalidatePath('/dashboard');
        return { success: true, projectId: invite.project.toString() };
    } catch (error) {
        return { error: 'Failed to accept invitation' };
    }
}

export async function getDashboardInvitations() {
    const session = await getSession();
    if (!session || !session.userEmail) return [];

    await dbConnect();
    try {
        const invites = await Invitation.find({
            email: { $regex: new RegExp(`^${session.userEmail}$`, 'i') },
            status: 'PENDING'
        })
            .populate('project', 'name')
            .populate('invitedBy', 'name')
            .lean();

        return invites.map((i: any) => ({
            _id: i._id.toString(),
            projectName: i.project?.name || 'Unknown Project',
            inviterName: i.invitedBy?.name || 'Someone',
            token: i.token,
            expiresAt: i.expiresAt.toISOString(),
        }));
    } catch (error) {
        console.error('Fetch Dashboard Invites Error:', error);
        return [];
    }
}

export async function declineInvitation(invitationId: string) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    await dbConnect();
    try {
        await Invitation.findByIdAndDelete(invitationId);
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to decline invitation' };
    }
}
