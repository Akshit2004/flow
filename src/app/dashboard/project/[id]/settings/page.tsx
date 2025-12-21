import { getProjectDetails } from '@/actions/project';
import { getProjectInvitations } from '@/actions/invite';
import SettingsClient from '@/components/project/SettingsClient';
import { notFound } from 'next/navigation';

type Params = Promise<{ id: string }>;

export default async function SettingsPage({ params }: { params: Params }) {
    const { id } = await params;
    const [project, invitations] = await Promise.all([
        getProjectDetails(id),
        getProjectInvitations(id)
    ]);

    if (!project) {
        notFound();
    }

    return <SettingsClient project={project} initialInvitations={invitations} />;
}
