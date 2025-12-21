'use server';

import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export interface ProjectState {
    error?: string;
    success?: boolean;
}

export async function createProject(prevState: ProjectState, formData: FormData): Promise<ProjectState> {
    const session = await getSession();
    if (!session || !session.userId) {
        return { error: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!name) {
        return { error: 'Project name is required' };
    }

    await dbConnect();

    try {
        await Project.create({
            name,
            description,
            owner: session.userId,
        });
    } catch (error) {
        return { error: 'Failed to create project' };
    }

    revalidatePath('/dashboard');
    return { success: true };
}

export async function getProjects() {
    const session = await getSession();
    if (!session || !session.userId) {
        return [];
    }

    await dbConnect();

    // Sort by newest first
    const projects = await Project.find({ owner: session.userId })
        .sort({ createdAt: -1 })
        .lean();

    // Serialize to simple objects to avoid "Only plain objects..." warning in Server Components
    return projects.map((p) => ({
        ...p,
        _id: p._id.toString(),
        owner: p.owner.toString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
    }));
}
