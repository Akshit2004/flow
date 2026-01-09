"use client";

import { useState } from "react";
import styles from "./ProjectOnboarding.module.css";
import { Plus, Users, Settings, CheckCircle, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { dismissProjectOnboarding } from "@/actions/project";

interface ProjectOnboardingProps {
  onCreateTask: () => void;
  projectId: string;
  showOnboarding?: boolean;
}

export default function ProjectOnboarding({
  onCreateTask,
  projectId,
  showOnboarding = true,
}: ProjectOnboardingProps) {
  const [isDismissing, setIsDismissing] = useState(false);

  const handleDismiss = async () => {
    setIsDismissing(true);
    await dismissProjectOnboarding(projectId);
  };

  if (!showOnboarding && !isDismissing) return null; // Should be handled by parent, but safety check

  return (
    <div className={`${styles.container} ${!showOnboarding ? "hidden" : ""}`}>
      <button
        onClick={handleDismiss}
        className={styles.dismissButton}
        title="Dismiss Guide"
        disabled={isDismissing}
      >
        <X size={20} />
      </button>

      <div className={styles.header}>
        <div className={styles.progressContainer}>
          <span className={styles.progressLabel}>Get Started</span>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: "15%" }}></div>
          </div>
        </div>
        <h3 className={styles.title}>Welcome to your new project!</h3>
        <p className={styles.description}>
          Here are a few steps to help you get the most out of Flow. Complete
          these to set up your workspace.
        </p>
      </div>

      <div className={styles.steps}>
        {/* Step 1: Create Task */}
        <div className={styles.stepCard}>
          <div className={styles.completedBadge}>
            <CheckCircle size={24} />
          </div>
          <div className={styles.iconWrapper}>
            <Plus size={24} strokeWidth={2.5} />
          </div>
          <h4 className={styles.stepTitle}>Create your first task</h4>
          <p className={styles.stepDesc}>
            Start building your backlog by adding a task to your board.
          </p>
          <Button
            size="sm"
            onClick={onCreateTask}
            className={styles.actionButton}
          >
            Add Task
          </Button>
        </div>

        {/* Step 2: Invite Team (Link) */}
        <div className={styles.stepCard}>
          <div className={styles.completedBadge}>
            <CheckCircle size={24} />
          </div>
          <div className={styles.iconWrapper}>
            <Users size={24} strokeWidth={2.5} />
          </div>
          <h4 className={styles.stepTitle}>Invite your team</h4>
          <p className={styles.stepDesc}>
            Collaborate with your team by adding members to this project.
          </p>
          <Link
            href={`/dashboard/project/${projectId}/settings`}
            className={styles.linkButton}
          >
            Invite Members
          </Link>
        </div>

        {/* Step 3: Customize (Link) */}
        <div className={styles.stepCard}>
          <div className={styles.completedBadge}>
            <CheckCircle size={24} />
          </div>
          <div className={styles.iconWrapper}>
            <Settings size={24} strokeWidth={2.5} />
          </div>
          <h4 className={styles.stepTitle}>Customize Board</h4>
          <p className={styles.stepDesc}>
            Edit columns and labels to match your team's workflow.
          </p>
          <Link
            href={`/dashboard/project/${projectId}/settings`}
            className={styles.linkButton}
          >
            Project Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
