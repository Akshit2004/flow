import { getProjects } from "@/actions/project";
import { getDashboardInvitations } from "@/actions/invite";
import ProjectsView from "@/components/board/ProjectsView";
import PendingInvites from "@/components/dashboard/PendingInvites";
import DashboardAnalytics from "@/components/dashboard/DashboardAnalytics";

export default async function DashboardPage() {
  const [projects, invitations] = await Promise.all([
    getProjects(),
    getDashboardInvitations()
  ]);

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <DashboardAnalytics />
      <PendingInvites initialInvites={invitations} />
      <ProjectsView projects={projects} />
    </div>
  );
}
