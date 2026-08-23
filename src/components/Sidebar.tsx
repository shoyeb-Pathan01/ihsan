"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Cloud,
  BookOpen,
  MessageCircle,
  Target,
  RefreshCw,
  FolderKanban,
  BarChart3,
  Bell,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/azure", label: "Azure", icon: Cloud },
  { href: "/quran-journey", label: "Qur'an Journey", icon: BookOpen },
  { href: "/communication", label: "Communication", icon: MessageCircle },
  { href: "/focus", label: "Focus Mode", icon: Zap },
  { href: "/daily-mission", label: "Daily Mission", icon: Target },
  { href: "/revision", label: "Revision", icon: RefreshCw },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/reminders", label: "Reminders", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-border bg-surface transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-border">
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-widest text-azure-light">IHSAN</span>
            <span className="text-[10px] text-muted">60-DAY MISSION</span>
          </div>
        )}
        {collapsed && (
          <span className="text-sm font-bold text-azure-light mx-auto">I</span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-azure/10 text-azure-light"
                  : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-azure-light" : "text-muted")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center border-t border-border py-3 text-muted hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
