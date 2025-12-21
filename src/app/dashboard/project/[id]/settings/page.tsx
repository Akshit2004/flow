import { getProjectDetails } from '@/actions/project';
import SettingsClient from '@/components/project/SettingsClient';
import { notFound } from 'next/navigation';

type Params = Promise<{ id: string }>;

export default async function SettingsPage({ params }: { params: Params }) {
    const { id } = await params;
    const project = await getProjectDetails(id);

    if (!project) {
        notFound();
    }

    return <SettingsClient project={project} />;
}
