"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  ArrowUpCircle,
  History,
  Bell,
  Search,
  User,
  Send,
  Menu,
  X,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { formatBSD } from "@/utils/currency";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, persistentNotifications, clearPersistentNotifications } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  let menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Cards", icon: CreditCard, href: "/dashboard/cards" },
    { name: "Top-up", icon: ArrowUpCircle, href: "/dashboard/topup" },
    { name: "Envoyer", icon: Send, href: "/dashboard/send" },
    { name: "Transactions", icon: History, href: "/dashboard/transactions" },
    { name: "Profile", icon: User, href: "/dashboard/profile" },
  ];

  if (user?.role === "ADMIN") {
    menuItems.push({ name: "Admin Terminal", icon: LayoutDashboard, href: "/dashboard/admin" });
    menuItems.push({ name: "Analyses", icon: TrendingUp, href: "/dashboard/admin/finances" });
  }

  const getInitials = (name: string) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "??";

  const unreadCount = persistentNotifications.length;

  return (
    <div className="flex min-h-screen bg-[var(--background)] transition-colors duration-300">
      {/* Mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Notification Panel */}
      <AnimatePresence>
        {isNotifOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsNotifOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: "100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full max-w-[380px] bg-[var(--card-bg)] border-l border-[var(--card-border)] shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-[var(--card-border)] flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[var(--foreground)]">Notifications</h2>
                  <p className="text-[11px] text-[var(--muted)] font-medium mt-0.5">{unreadCount} nouvelle(s)</p>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={clearPersistentNotifications}
                      className="p-2 rounded-xl bg-[var(--nav-active)] hover:bg-red-500/10 text-[var(--muted)] hover:text-red-400 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => setIsNotifOpen(false)}
                    className="p-2 rounded-xl bg-[var(--nav-active)] text-[var(--muted)] hover:text-[var(--foreground)] transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-[var(--card-border)]">
                {persistentNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-[var(--muted)]">
                    <Bell className="w-10 h-10 opacity-30" />
                    <p className="text-sm font-bold">Aucune notification pour l&apos;instant.</p>
                    <p className="text-xs opacity-50">Vous serez notifié lors de vos transactions.</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {persistentNotifications.map((n, i) => {
                      const isCredit = n.type === "TRANSFER_IN" || n.type === "TOPUP";
                      return (
                        <motion.div key={n.id}
                          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="p-5 flex gap-4 items-start hover:bg-[var(--nav-active)] transition-colors">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${isCredit ? "bg-[var(--accent-soft)]" : "bg-[var(--nav-active)]"}`}>
                            {isCredit
                              ? <ArrowDownLeft className="w-4 h-4 text-[var(--accent)]" />
                              : <ArrowUpRight className="w-4 h-4 text-[var(--muted)]" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[11px] font-black uppercase tracking-wider ${isCredit ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}>{n.title}</p>
                            <p className="text-sm font-bold text-[var(--foreground)] leading-tight mt-0.5">{n.message}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── SIDEBAR ── */}
      <aside className={`w-[260px] bg-[var(--sidebar-bg)] border-r border-[var(--card-border)] flex flex-col p-6 fixed h-screen z-50 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Logo */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/dashboard" className="flex flex-col px-2">
            <span className="text-xl font-black tracking-tight text-[var(--foreground)]">
              Wallet<span className="text-[var(--accent)]">.</span>
            </span>
            <span className="text-[9px] font-bold text-[var(--accent)] uppercase tracking-[0.25em] mt-0.5 opacity-70">Premium Concierge</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative ${
                  isActive
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--muted)] hover:bg-[var(--nav-active)] hover:text-[var(--foreground)]"
                }`}>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[var(--accent)] rounded-r-full" />
                )}
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold text-[13px]">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="pt-6 border-t border-[var(--card-border)]">
          <div className="flex items-center gap-3">
            <button onClick={() => logout()} className="w-9 h-9 rounded-full flex-shrink-0 hover:opacity-80 transition-opacity">
              <div className="w-full h-full bg-[var(--accent-soft)] border border-[var(--accent)]/30 rounded-full flex items-center justify-center">
                <span className="text-[var(--accent)] font-bold text-[11px]">{getInitials(user?.fullName || "")}</span>
              </div>
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[var(--foreground)] truncate">{user?.fullName || "Chargement..."}</p>
              <p className="text-[10px] text-[var(--muted)] font-medium capitalize">{user?.role || "Membre"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 lg:ml-[260px] w-full min-w-0">
        {/* Top Bar */}
        <header className="h-[68px] flex items-center justify-between px-4 lg:px-8 sticky top-0 bg-[var(--background)]/90 backdrop-blur-md z-30 border-b border-[var(--card-border)] transition-colors">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-[var(--foreground)]">
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative w-full max-w-[280px] group hidden xs:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors" />
              <input type="text" placeholder="Rechercher..."
                className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl py-2.5 pl-10 pr-4 focus:border-[var(--accent)] focus:outline-none transition-all font-medium text-xs text-[var(--foreground)] placeholder:text-[var(--muted)]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-4">
            {/* Crypto Balance */}
            <div className="hidden sm:flex items-center gap-2 bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-[var(--accent)] px-3 py-1.5 rounded-xl">
              <div className="w-4 h-4 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[10px] font-black italic">B</div>
              <span className="text-[11px] font-bold tracking-tight">{formatBSD(user?.cryptoBalance || 0)}</span>
            </div>

            {/* Bell */}
            <button onClick={() => setIsNotifOpen(true)}
              className="relative w-9 h-9 flex items-center justify-center bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl hover:border-[var(--accent)]/40 transition-all text-[var(--muted)] hover:text-[var(--accent)]">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-0.5 bg-[var(--accent)] border-2 border-[var(--background)] rounded-full text-[9px] font-black text-black flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Avatar */}
            <div className="flex items-center gap-3 pl-3 lg:pl-4 border-l border-[var(--card-border)]">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-[var(--foreground)]">{user?.fullName}</p>
              </div>
              <Link href="/dashboard/profile"
                className="w-9 h-9 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/30 overflow-hidden hover:scale-105 transition-transform flex items-center justify-center">
                <span className="text-[var(--accent)] font-bold text-sm">{getInitials(user?.fullName || "")}</span>
              </Link>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
