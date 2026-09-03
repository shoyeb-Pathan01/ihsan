"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, BookOpen, BarChart3 } from "lucide-react";

const mobileNavItems = [
  { href: "/", label: "Today", icon: Home },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/review", label: "Review", icon: BarChart3 },
];

export function MobileNav() {
  const pathname = usePathname();
  const isSunday = new Date().getDay() === 0;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto px-2 py-1.5">
        {mobileNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const showSundayNudge = item.href === "/review" && isSunday && !isActive;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-4 py-2 text-[10px] font-medium transition-colors relative min-w-[64px]",
                isActive
                  ? "text-[var(--color-career)]"
                  : "text-[var(--color-muted)]"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-[var(--color-career)]" : "text-[var(--color-muted)]"
                )}
              />
              <span>{item.label}</span>
              {showSundayNudge && (
                <span className="absolute -top-0.5 right-2 w-2 h-2 bg-[var(--color-warning)] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
