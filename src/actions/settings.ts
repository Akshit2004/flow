'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import Project from '@/models/Project';
import Task from '@/models/Task';
import Invitation from '@/models/Invitation';
import { getSession, deleteSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function changePassword(prevState: any, formData: FormData) {
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { error: 'Please fill in all fields' };
    }

    if (newPassword !== confirmPassword) {
        return { error: 'New passwords do not match' };
    }

    if (newPassword.length < 6) {
        return { error: 'Password must be at least 6 characters' };
    }

    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    await dbConnect();

    const user = await User.findById(session.userId).select('+password');
    if (!user || !user.password) {
        return { error: 'User not found' };
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        return { error: 'Incorrect current password' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return { success: 'Password updated successfully' };
}

export async function deleteAccount() {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    await dbConnect();

    try {
        const userId = session.userId;

        // Delete projects owned by user
        const ownedProjects = await Project.find({ owner: userId });
        const projectIds = ownedProjects.map(p => p._id);

        // Delete tasks in those projects
        await Task.deleteMany({ project: { $in: projectIds } });

        // Delete the projects
        await Project.deleteMany({ owner: userId });

        // Remove user from other projects
        await Project.updateMany(
            { 'members.user': userId },
            { $pull: { members: { user: userId } } }
        );

        // Delete invitations
        await Invitation.deleteMany({ email: session.userEmail });

        // Delete user
        await User.findByIdAndDelete(userId);

        // Logout
        await deleteSession();

    } catch (error) {
        console.error('Delete Account Error:', error);
        return { error: 'Failed to delete account' };
    }

    redirect('/login');
}
