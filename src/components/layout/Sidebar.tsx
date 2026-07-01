"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageCircle,
  PlusCircle,
  List,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  SunMoon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { setApiAccessToken } from "@/lib/api/client";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/entry", label: "New Entry", icon: PlusCircle },
  { href: "/entity", label: "Entity", icon: List },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  currentPage: string;
  userEmail?: string;
}

export function Sidebar({ currentPage, userEmail }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setApiAccessToken(null);
        window.location.href = "/login";
      }
    } catch {
      // Logout failed — user stays on current page
    }
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="fixed left-4 top-4 z-50 rounded-full border border-chat-border bg-card p-2 shadow-card lg:hidden"
        onClick={() => setMobileOpen((open) => !open)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-chat-border bg-surface-container-lowest transition-transform duration-200 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-chat-border px-6">
          <span className="text-xl font-bold text-primary">
            Financier
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = currentPage === item.href;
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-full px-3 py-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-primary-container text-on-primary-container"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="px-4 pb-4">
          <a
            href="/entry"
            className="flex h-10 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white shadow-float hover:no-underline"
            style={{ color: "var(--on-primary)" }}
          >
            <PlusCircle className="h-4 w-4" />
            New Entry
          </a>
        </div>

        {/* User */}
        <div className="border-t border-chat-border p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg transition-colors hover:bg-accent">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-sm font-semibold text-on-primary-fixed">
                  {userEmail?.[0]?.toUpperCase() ?? "U"}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-sm font-medium truncate">{userEmail ?? "User"}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" sideOffset={8} className="w-[--radix-dropdown-menu-trigger-width]">
              <DropdownMenuItem onClick={() => window.toggleTheme?.()} className="gap-2 cursor-pointer">
                <SunMoon className="h-4 w-4" />
                <span>Change appearance</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-chat-border bg-surface-container-lowest px-2 py-2 shadow-card lg:hidden">
        {navItems.filter((item) => item.href !== "/entry").slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md px-1 py-1 text-[11px] font-semibold",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="truncate">{item.label}</span>
            </a>
          );
        })}
      </nav>
    </>
  );
}
