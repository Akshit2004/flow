import { getTasks } from "@/actions/task";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import { getSession } from "@/lib/auth";
import { Settings } from 'lucide-react';
import Link from 'next/link';
import ProjectView from "@/components/project/ProjectView";

type Params = Promise<{ id: string }>;

export default async function ProjectPage({ params }: { params: Params }) {
  const { id } = await params;
  const session = await getSession();

  if (!session) return notFound();

  await dbConnect();
  const project = await Project.findOne({
    _id: id,
    $or: [
      { owner: session.userId },
      { "members.user": session.userId }
    ]
  }).lean();

  if (!project) {
    return notFound();
  }

  const tasks = await getTasks(id);

  return (
    <div style={{ height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>
       <div style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{project.name}</h1>
          {project.description && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{project.description}</p>
          )}
        </div>
        <Link href={`/dashboard/project/${id}/settings`} style={{ color: 'var(--text-secondary)', padding: '8px', borderRadius: '6px' }} className="hover:bg-gray-100">
            <Settings size={20} />
        </Link>
      </div>
      <ProjectView 
        projectId={id} 
        initialTasks={tasks} 
        columns={project.columns?.map((c: any) => ({ 
            id: c.id, 
            title: c.title, 
            order: c.order,
            _id: c._id ? c._id.toString() : undefined 
        }))} 
      />
    </div>
  );
}
