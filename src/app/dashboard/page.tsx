import { getProjects } from "@/actions/project";
import ProjectsView from "@/components/board/ProjectsView";

export default async function DashboardPage() {
  const projects = await getProjects();

  return <ProjectsView projects={projects} />;
}
