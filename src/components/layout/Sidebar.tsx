"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  PlusCircle,
  List,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/entry", label: "New Entry", icon: PlusCircle },
  { href: "/entity", label: "Transactions", icon: List },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  currentPage: string;
  userEmail?: string;
}

export function Sidebar({ currentPage, userEmail }: SidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-background border"
        onClick={() => setCollapsed(!collapsed)}
        aria-label="Toggle sidebar"
      >
        {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-background border-r flex flex-col transition-transform duration-200 lg:translate-x-0",
          collapsed && "-translate-x-full lg:translate-x-0 lg:w-16"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b">
          <span className={cn("text-xl font-bold text-primary", collapsed && "lg:hidden")}>
            Financier
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.href;
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className={cn("truncate", collapsed && "lg:hidden")}>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t">
          <div className={cn("flex items-center gap-3", collapsed && "lg:justify-center")}>
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold shrink-0">
              {userEmail?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className={cn("flex-1 min-w-0", collapsed && "lg:hidden")}>
              <p className="text-sm font-medium truncate">{userEmail ?? "User"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setCollapsed(true)}
        />
      )}
    </>
  );
}
