import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import Sidebar from "@/components/dashboard/Sidebar";
import styles from "./layout.module.css";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) return notFound();

  await dbConnect();
  // Fetch only name and _id for the sidebar
  const projects = await Project.find({
    $or: [
      { owner: session.userId },
      { "members.user": session.userId }
    ]
  })
    .select("name _id")
    .lean();

  const serializedProjects = projects.map(p => ({
    ...p,
    _id: p._id.toString()
  }));

  return (
    <div className={styles.container}>
      <Sidebar projects={serializedProjects} user={{ name: session.userName, email: session.userEmail }} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
