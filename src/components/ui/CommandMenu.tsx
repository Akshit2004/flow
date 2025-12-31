"use client";

import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Settings, 
  Sun, 
  Moon, 
  Search,
  Plus,
  Home
} from "lucide-react";
import { useTheme } from "@/components/ui/ThemeProvider";
import styles from "./CommandMenu.module.css";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === "Escape" && open) {
          setOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={() => setOpen(false)}>
      <div 
        onClick={(e) => e.stopPropagation()} 
        className={styles.contentWrapper}
        role="dialog"
        aria-modal="true"
        aria-label="Global Command Menu"
      >
        <Command 
            className={styles.commandBase}
            label="Global Command Menu"
        >
          <Command.Input 
            placeholder="Type a command or search..." 
            autoFocus 
          />
          
          <Command.List>
            <Command.Empty>No results found.</Command.Empty>

            <Command.Group heading="Navigation">
              <Command.Item onSelect={() => runCommand(() => router.push("/dashboard"))}>
                <Home />
                <span>Dashboard</span>
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => router.push("/dashboard/project"))}>
                <FolderKanban />
                <span>Projects</span>
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => router.push("/dashboard/settings"))}>
                <Settings />
                <span>Settings</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Actions">
              <Command.Item onSelect={() => runCommand(() => router.push("/dashboard?action=create-project"))}>
                <Plus />
                <span>Create New Project</span>
                <span className={styles.shortcut}>C P</span>
              </Command.Item>
              <Command.Item onSelect={() => runCommand(toggleTheme)}>
                {theme === 'dark' ? <Sun /> : <Moon />}
                <span>Toggle Theme</span>
                <span className={styles.shortcut}>T</span>
              </Command.Item>
            </Command.Group>

          </Command.List>
        </Command>
      </div>
    </div>
  );
}
