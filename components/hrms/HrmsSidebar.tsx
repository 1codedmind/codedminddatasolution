"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, CalendarDays, Banknote, Clock,
  TrendingUp, Monitor, Megaphone, CircleUser, ChevronLeft, Menu, Building2,
} from "lucide-react";
import { useState } from "react";
import type { HrmsPermission } from "@/lib/hrms/access";

const ICONS: Record<string, React.ElementType> = {
  LayoutDashboard, Users, CalendarDays, Banknote, Clock,
  TrendingUp, Monitor, Megaphone, CircleUser, Building2,
};

type NavItem = {
  label: string;
  href: string;
  icon: string;
  permission?: HrmsPermission;
};

type Props = {
  role: string;
  email: string;
  permissions: HrmsPermission[];
  navItems: NavItem[];
};

export default function HrmsSidebar({ role, email, navItems, permissions }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = navItems.filter(
    (item) => !item.permission || permissions.includes(item.permission),
  );

  // Hide "My Profile" for admins (they use Employees list)
  const filtered = visibleItems.filter((item) => {
    if (item.href === "/hrms/employees/me" && (role === "superadmin" || role === "admin")) return false;
    if (item.href === "/hrms/employees" && role === "employee") return false;
    return true;
  });

  return (
    <aside
      className={`shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] flex flex-col bg-stone-950 border-r border-stone-800 transition-all duration-200 ${collapsed ? "w-16" : "w-56"}`}
    >
      {/* Collapse toggle */}
      <div className="flex items-center justify-end px-3 py-3 border-b border-stone-800">
        <button
          onClick={() => setCollapsed((p) => !p)}
          className="p-1.5 rounded-lg text-stone-500 hover:text-stone-300 hover:bg-stone-800 transition-colors"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <Menu size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {filtered.map((item) => {
          const Icon = ICONS[item.icon] ?? LayoutDashboard;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                active
                  ? "bg-[#C87660]/15 text-[#C87660]"
                  : "text-stone-400 hover:text-stone-100 hover:bg-stone-800/60"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className={`border-t border-stone-800 px-3 py-3 ${collapsed ? "text-center" : ""}`}>
        {collapsed ? (
          <div className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center mx-auto">
            <span className="text-[10px] font-bold text-stone-400 uppercase">
              {email.charAt(0)}
            </span>
          </div>
        ) : (
          <div>
            <p className="text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-0.5">{role}</p>
            <p className="text-xs text-stone-400 truncate">{email}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
