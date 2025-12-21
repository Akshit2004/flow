import { acceptInvitation } from '@/actions/invite';
import dbConnect from '@/lib/db';
import Invitation from '@/models/Invitation';
import Project from '@/models/Project';
import Button from '@/components/ui/Button';
import { redirect } from 'next/navigation';
import styles from './InvitePage.module.css';
import { CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { getSession } from '@/lib/auth';

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const session = await getSession();

    if (!session || !session.userId) {
        redirect(`/login?callbackUrl=/invite/${token}`);
    }
    
    await dbConnect();
    const invitation = await Invitation.findOne({ token, status: 'PENDING' })
        .populate('project', 'name description')
        .populate('invitedBy', 'name email')
        .lean();

    if (!invitation) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <XCircle size={48} className={styles.errorIcon} />
                    <h1 className={styles.title}>Invalid Invitation</h1>
                    <p className={styles.text}>This invitation link is invalid or has already been used.</p>
                    <Link href="/dashboard">
                        <Button className={styles.button}>Go to Dashboard</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const project = invitation.project as any;
    const inviter = invitation.invitedBy as any;

    async function handleAccept() {
        'use server';
        const res = await acceptInvitation(token);
        if (res.success) {
            redirect(`/dashboard/project/${res.projectId}`);
        }
        // Handle error in UI? For now just re-render with error if possible, 
        // but since this is a server component we just redirect or show error on next pass.
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <CheckCircle2 size={48} className={styles.successIcon} />
                    <h1 className={styles.title}>Project Invitation</h1>
                    <p className={styles.inviterText}>
                        <strong>{inviter.name}</strong> ({inviter.email}) invited you to join:
                    </p>
                </div>

                <div className={styles.projectInfo}>
                    <h2 className={styles.projectName}>{project.name}</h2>
                    {project.description && <p className={styles.projectDesc}>{project.description}</p>}
                </div>

                <form action={handleAccept}>
                    <Button type="submit" className={styles.button}>Accept and Join Project</Button>
                </form>
                
                <p className={styles.footerText}>
                    By joining, you will be able to view and manage tasks in this project.
                </p>
            </div>
        </div>
    );
}
