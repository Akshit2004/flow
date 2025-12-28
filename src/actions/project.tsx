'use server';

import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import User from '@/models/User';
import Task from '@/models/Task';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
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
        const key = await generateUniqueKey(name);
        await Project.create({
            name,
            description,
            owner: session.userId,
            key,
            taskCount: 0,
            members: [{ user: new mongoose.Types.ObjectId(session.userId), role: 'ADMIN' }], // Add owner to members
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
    const projects = await Project.find({
        $or: [
            { owner: session.userId },
            { 'members.user': session.userId }
        ]
    })
        .sort({ createdAt: -1 })
        .lean();

    // Serialize to simple objects to avoid "Only plain objects..." warning in Server Components
    return projects.map((p: any) => ({
        _id: p._id.toString(),
        name: p.name,
        description: p.description,
        key: p.key,
        taskCount: p.taskCount,
        owner: p.owner ? p.owner.toString() : '',
        members: p.members?.filter((m: any) => m.user).map((m: any) => m.user.toString()) || [],
        columns: p.columns?.map((c: any) => ({
            id: c.id,
            title: c.title,
            order: c.order,
            _id: c._id ? c._id.toString() : undefined
        })) || [],
        labels: p.labels?.map((l: any) => ({
            id: l.id,
            name: l.name,
            color: l.color,
            _id: l._id ? l._id.toString() : undefined
        })) || [],
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
    }));
}

export async function getProjectDetails(projectId: string) {
    const session = await getSession();
    if (!session) return null;

    await dbConnect();
    const project = await Project.findOne({
        _id: projectId,
        $or: [
            { owner: session.userId },
            { 'members.user': session.userId }
        ]
    })
        .populate('members.user', 'name email avatar')
        .populate('owner', 'name email avatar')
        .lean();

    if (!project) return null;

    return {
        _id: project._id.toString(),
        name: project.name,
        description: project.description,
        key: project.key,
        taskCount: project.taskCount,
        owner: project.owner && typeof project.owner === 'object' && '_id' in project.owner
            ? {
                _id: (project.owner as any)._id.toString(),
                name: (project.owner as any).name,
                email: (project.owner as any).email,
                avatar: (project.owner as any).avatar
            }
            : null,
        members: project.members?.map((m: any) => {
            const user = m.user;
            if (!user || typeof user !== 'object' || !('_id' in user)) return null;
            return {
                _id: (user as any)._id.toString(),
                name: (user as any).name,
                email: (user as any).email,
                avatar: (user as any).avatar,
                role: m.role
            };
        }).filter((m: any) => m !== null) || [],
        columns: project.columns?.map((c: any) => ({
            id: c.id,
            title: c.title,
            order: c.order,
            _id: c._id ? c._id.toString() : undefined
        })) || [],
        labels: project.labels?.map((l: any) => ({
            id: l.id,
            name: l.name,
            color: l.color,
            _id: l._id ? l._id.toString() : undefined
        })) || [],
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
    };
}

export async function updateProjectDetails(projectId: string, data: { name: string; description: string; key: string }) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    await dbConnect();
    try {
        await Project.findByIdAndUpdate(projectId, data);
        revalidatePath(`/dashboard/project/${projectId}`);
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update project' };
    }
}





export async function removeProjectMember(projectId: string, userId: string) {
    // ... (rest of the file)
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    await dbConnect();
    try {
        await Project.findByIdAndUpdate(projectId, {
            $pull: { members: { user: userId } }
        });
        revalidatePath(`/dashboard/project/${projectId}/settings`);
        return { success: true };
    } catch (error) {
        return { error: 'Failed to remove member' };
    }
}

export async function updateProjectColumns(projectId: string, columns: any[]) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    await dbConnect();
    try {
        await Project.findByIdAndUpdate(projectId, { columns });
        revalidatePath(`/dashboard/project/${projectId}`); // Revalidate board
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update columns' };
    }
}

export async function updateProjectLabels(projectId: string, labels: any[]) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    await dbConnect();
    try {
        await Project.findByIdAndUpdate(projectId, { labels });
        revalidatePath(`/dashboard/project/${projectId}`);
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update labels' };
    }
}

export async function deleteProject(projectId: string) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    await dbConnect();
    try {
        await Task.deleteMany({ project: projectId });
        await Project.findByIdAndDelete(projectId);
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete project' };
    }
}

async function generateUniqueKey(name: string): Promise<string> {
    // 1. Generate base key
    const words = name.trim().split(/\s+/);
    let baseKey = '';

    if (words.length === 1) {
        baseKey = words[0].substring(0, 3).toUpperCase();
    } else {
        // First letter of first 3 words max
        baseKey = words.slice(0, 3).map(w => w[0]).join('').toUpperCase();
    }

    // Ensure at least 2 chars
    if (baseKey.length < 2) {
        baseKey = (baseKey + 'X').substring(0, 2);
    }

    // 2. Check for collision and resolve
    let key = baseKey;
    let counter = 1;

    while (true) {
        const existing = await Project.findOne({ key });
        if (!existing) return key;

        key = `${baseKey}${counter}`;
        counter++;
    }
}
