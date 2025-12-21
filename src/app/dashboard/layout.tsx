"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Layout, Settings, LogOut, PlusSquare } from "lucide-react";
import { logout } from "@/actions/auth";
import Button from "@/components/ui/Button";
import styles from "./layout.module.css";
import clsx from "clsx";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navItems = [
    { name: "Projects", href: "/dashboard", icon: Layout },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className={styles.container}>
      {/* Mobile Header */}
      <header className={styles.mobileHeader}>
        <button onClick={toggleSidebar} className={styles.menuButton}>
          <Menu size={24} />
        </button>
        <span className={styles.brandName}>Flow</span>
        <div className={styles.placeholder} />
      </header>

      {/* Sidebar */}
      <aside
        className={clsx(styles.sidebar, { [styles.open]: isSidebarOpen })}
      >
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarBrand}>Flow</span>
          <button onClick={toggleSidebar} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav}>
          <div className={styles.sectionHeader}>WORKSPACE</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(styles.navItem, { [styles.active]: isActive })}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
            <form action={logout}>
                <Button variant="ghost" className={styles.logoutButton} type="submit">
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </Button>
            </form>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div className={styles.overlay} onClick={toggleSidebar} />
      )}

      {/* Main Content */}
      <main className={styles.main}>{children}</main>
    </div>
  );
}
