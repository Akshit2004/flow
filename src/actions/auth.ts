'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { createSession, deleteSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function signup(prevState: any, formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
        return { error: 'Please fill in all fields' };
    }

    await dbConnect();

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return { error: 'User already exists' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    try {
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        await createSession(user._id.toString(), user.email, user.name);
    } catch (error) {
        return { error: 'Something went wrong' };
    }

    redirect('/dashboard');
}

export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Please fill in all fields' };
    }

    await dbConnect();

    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.password) {
        return { error: 'Invalid credentials' };
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
        return { error: 'Invalid credentials' };
    }

    await createSession(user._id.toString(), user.email, user.name);
    redirect('/dashboard');
}

export async function logout() {
    await deleteSession();
    redirect('/login');
}
