"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Menu, X, Layout, Settings, LogOut, Plus, ChevronDown, ChevronRight, Folder, MoreHorizontal, Trash2 } from "lucide-react";
import { logout } from "@/actions/auth";
import { deleteProject } from "@/actions/project";
import { useContextMenu } from "@/context/ContextMenuContext";
import styles from "@/app/dashboard/layout.module.css";
import clsx from "clsx";
import CreateProjectModal from "@/components/board/CreateProjectModal";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface Project {
  _id: string;
  name: string;
}

export default function Sidebar({ projects, user }: { projects: Project[]; user?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { showContextMenu } = useContextMenu();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleProjectContextMenu = (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    e.stopPropagation();

    showContextMenu(e, [
        {
            label: 'Settings',
            icon: <Settings size={16} />,
            action: () => router.push(`/dashboard/project/${project._id}/settings`)
        },
        { variant: 'separator', label: '', action: () => {} },
        {
            label: 'Delete Project',
            icon: <Trash2 size={16} />,
            variant: 'destructive',
            action: async () => {
                const confirmed = window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`);
                if (confirmed) {
                    await deleteProject(project._id);
                    if (pathname.includes(project._id)) {
                        router.push('/dashboard');
                    }
                }
            }
        }
    ]);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className={styles.mobileHeader}>
        <button onClick={toggleSidebar} className={styles.menuButton}>
          <Menu size={24} />
        </button>
        <span className={styles.brandName}>Flow</span>
        <ThemeToggle />
      </header>

      {/* Sidebar */}
      <aside className={clsx(styles.sidebar, { [styles.open]: isOpen })}>
        <div className={styles.sidebarHeader}>
          <div className={styles.brandContainer}>
             <Image src="/logo.svg" alt="F" width={32} height={32} />
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
                        <div 
                            key={project._id}
                            className={clsx(styles.subNavItem, { [styles.active]: pathname === `/dashboard/project/${project._id}` })}
                            style={{ paddingRight: '4px' }}
                            onContextMenu={(e) => handleProjectContextMenu(e, project)}
                        >
                            <Link
                                href={`/dashboard/project/${project._id}`}
                                className="flex-1 flex items-center gap-3 overflow-hidden"
                                onClick={() => setIsOpen(false)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, overflow: 'hidden' }}
                            >
                                <Folder size={14} className={styles.projectIcon} />
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.name}</span>
                            </Link>
                            
                            <button
                                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => handleProjectContextMenu(e, project)}
                                style={{ 
                                    padding: '2px', 
                                    display: 'flex', 
                                    borderRadius: '4px',
                                    color: 'var(--text-muted)'
                                }}
                            >
                                <MoreHorizontal size={14} />
                            </button>
                        </div>
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
            {/* Theme Toggle */}
            <div className={styles.themeRow}>
                <span className={styles.themeLabel}>Theme</span>
                <ThemeToggle />
            </div>
            
            <div className={styles.footerBottom}>
                <div className={styles.userProfile}>
                    <div className={styles.avatar}>
                        {user?.name?.[0] || 'U'}
                    </div>
                    <div className={styles.userInfo}>
                        <p className={styles.userName}>{user?.name || 'User'}</p>
                        <p className={styles.userEmail}>{user?.email || 'user@flow.app'}</p>
                    </div>
                </div>
                <form action={logout}>
                    <button className={styles.logoutButtonIcon} type="submit" title="Sign Out">
                        <LogOut size={18} />
                    </button>
                </form>
            </div>
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

// Extracted component to cleaner handle the mapping and active state logic if needed, 
// but primarily to keep the main render clean.

