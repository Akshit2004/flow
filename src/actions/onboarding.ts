'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function completeOnboarding() {
    const session = await getSession();
    if (!session || !session.userId) {
        return { error: 'Unauthorized' };
    }

    await dbConnect();

    try {
        await User.findByIdAndUpdate(session.userId, { onboardingCompleted: true });
    } catch (error) {
        return { error: 'Failed to update user status' };
    }

    revalidatePath('/dashboard');
    redirect('/dashboard');
}
