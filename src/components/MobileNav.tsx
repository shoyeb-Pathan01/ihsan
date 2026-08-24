"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Briefcase, BookOpen, BarChart3, Settings } from "lucide-react";

const mobileNavItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/career", label: "Career", icon: Briefcase },
  { href: "/deen", label: "Qur'an", icon: BookOpen },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/settings", label: "More", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e8eaf0] bg-white/95 backdrop-blur-lg lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-[#635bff]"
                  : "text-[#6b7280] hover:text-[#172033]"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-[#635bff]" : "text-[#6b7280]"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
