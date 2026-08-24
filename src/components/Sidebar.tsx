"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Briefcase, BookOpen, Moon, BarChart3, Settings } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/career", label: "Career", icon: Briefcase },
  { href: "/deen", label: "Qur'an", icon: BookOpen },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[245px] bg-[#111827] text-white px-[14px] py-[22px] sticky top-0 h-screen">
      <div className="font-extrabold text-lg px-3 pb-6">
        IQRA <span className="text-[#a78bfa]">OS</span>
      </div>

      <nav className="grid gap-1.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[10px] px-3 py-[11px] text-[15px] transition-colors",
                isActive
                  ? "bg-[#242b3a] text-white"
                  : "text-[#cbd5e1] hover:bg-[#242b3a] hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
