"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Layout, Settings, LogOut, Plus, ChevronDown, ChevronRight, Folder } from "lucide-react";
import { logout } from "@/actions/auth";
import Button from "@/components/ui/Button";
import styles from "@/app/dashboard/layout.module.css";
import clsx from "clsx";
import CreateProjectModal from "@/components/board/CreateProjectModal";

interface Project {
  _id: string;
  name: string;
}

export default function Sidebar({ projects, user }: { projects: Project[]; user?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Header */}
      <header className={styles.mobileHeader}>
        <button onClick={toggleSidebar} className={styles.menuButton}>
          <Menu size={24} />
        </button>
        <span className={styles.brandName}>Flow</span>
        <div className={styles.placeholder} />
      </header>

      {/* Sidebar */}
      <aside className={clsx(styles.sidebar, { [styles.open]: isOpen })}>
        <div className={styles.sidebarHeader}>
          <div className={styles.brandContainer}>
             <div className={styles.logoBox}>F</div>
             <span className={styles.sidebarBrand}>Flow</span>
          </div>
          <button onClick={toggleSidebar} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav}>
          <Link
            href="/dashboard"
            className={clsx(styles.navItem, { [styles.active]: pathname === "/dashboard" })}
            onClick={() => setIsOpen(false)}
          >
            <Layout size={18} />
            <span>Overview</span>
          </Link>

          <div className={styles.group}>
             <div 
                className={styles.groupHeader} 
                onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
             >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isProjectsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span className={styles.groupTitle}>PROJECTS</span>
                </div>
                <button 
                    className={styles.addProjectButton}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsNewProjectModalOpen(true);
                    }}
                >
                    <Plus size={14} />
                </button>
             </div>
             
             {isProjectsExpanded && (
                 <div className={styles.groupContent}>
                    {projects.map(project => (
                        <Link
                            key={project._id}
                            href={`/dashboard/project/${project._id}`}
                            className={clsx(styles.subNavItem, { [styles.active]: pathname === `/dashboard/project/${project._id}` })}
                            onClick={() => setIsOpen(false)}
                        >
                            <Folder size={14} className={styles.projectIcon} />
                            <span>{project.name}</span>
                        </Link>
                    ))}
                    {projects.length === 0 && (
                        <div className={styles.emptyState}>No projects yet</div>
                    )}
                     <button 
                        className={styles.newProjectItem}
                        onClick={() => setIsNewProjectModalOpen(true)}
                    >
                        <Plus size={14} />
                        <span>Create Project</span>
                    </button>
                 </div>
             )}
          </div>

          <Link
            href="/dashboard/settings"
            className={clsx(styles.navItem, { [styles.active]: pathname === "/dashboard/settings" })}
            onClick={() => setIsOpen(false)}
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
            <div className={styles.userProfile}>
                <div className={styles.avatar}>
                    {user?.name?.[0] || 'U'}
                </div>
                <div className={styles.userInfo}>
                    <p className={styles.userName}>User</p>
                    <p className={styles.userEmail}>user@flow.app</p>
                </div>
            </div>
            <form action={logout}>
                <button className={styles.logoutButtonIcon} type="submit" title="Sign Out">
                    <LogOut size={18} />
                </button>
            </form>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div className={styles.overlay} onClick={toggleSidebar} />
      )}

      {isNewProjectModalOpen && (
          <CreateProjectModal onClose={() => setIsNewProjectModalOpen(false)} />
      )}
    </>
  );
}
