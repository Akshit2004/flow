"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import CreateProjectModal from "@/components/board/CreateProjectModal";
import { Plus, Folder } from "lucide-react";
import styles from "./ProjectsView.module.css";
import Link from "next/link";

interface Project {
  _id: string;
  name: string;
  description?: string;
  updatedAt: string;
}

export default function ProjectsView({ projects }: { projects: Project[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Projects</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Folder size={48} strokeWidth={1} />
          </div>
          <h3 className={styles.emptyTitle}>No projects yet</h3>
          <p className={styles.emptyDesc}>Create your first project to get started.</p>
          <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
            Create Project
          </Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {projects.map((project) => (
            <Link href={`/dashboard/project/${project._id}`} key={project._id} className={styles.card}>
              <div className={styles.cardIcon}>
                <Folder size={24} />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{project.name}</h3>
                <p className={styles.cardDesc}>{project.description || "No description"}</p>
                <span className={styles.cardDate}>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isModalOpen && <CreateProjectModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
