"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, BookOpen, BarChart3 } from "lucide-react";

const navItems = [
  { href: "/", label: "Today", icon: Home },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/review", label: "Review", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const isSunday = new Date().getDay() === 0;

  return (
    <aside className="hidden lg:flex flex-col w-[200px] xl:w-[220px] bg-[var(--color-surface)] border-r border-[var(--color-border)] px-3 py-5 sticky top-0 h-screen shrink-0">
      <div className="font-extrabold text-lg px-3 pb-8 tracking-tight">
        <span className="text-[var(--color-career)]">IQ</span>
        <span className="text-[var(--color-deen)]">RA</span>
      </div>

      <nav className="grid gap-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const showSundayNudge = item.href === "/review" && isSunday && !isActive;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors",
                isActive
                  ? "bg-[var(--color-surface-elevated)] text-[var(--color-foreground)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-elevated)]"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
              {showSundayNudge && (
                <span className="ml-auto text-[10px] bg-[var(--color-warning)] text-white px-1.5 py-0.5 rounded-full font-semibold">
                  review
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
