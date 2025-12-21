import { getTasks } from "@/actions/task";
import KanbanBoard from "@/components/board/KanbanBoard";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import { getSession } from "@/lib/auth";

type Params = Promise<{ id: string }>;

export default async function ProjectPage({ params }: { params: Params }) {
  const { id } = await params;
  const session = await getSession();

  if (!session) return notFound();

  await dbConnect();
  const project = await Project.findOne({ _id: id, owner: session.userId });

  if (!project) {
    return notFound();
  }

  const tasks = await getTasks(id);

  return (
    <div style={{ height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{project.name}</h1>
        {project.description && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{project.description}</p>
        )}
      </div>
      <KanbanBoard projectId={id} initialTasks={tasks} />
    </div>
  );
}
