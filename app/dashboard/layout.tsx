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
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  let menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Cards", icon: CreditCard, href: "/dashboard/cards" },
    { name: "Top-up", icon: ArrowUpCircle, href: "/dashboard/topup" },
    { name: "Envoyer", icon: Send, href: "/dashboard/send" },
    { name: "Transactions", icon: History, href: "/dashboard/transactions" },
    { name: "Profile", icon: User, href: "/dashboard/profile" },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push({ name: "Admin Terminal", icon: LayoutDashboard, href: "/dashboard/admin" });
    menuItems.push({ name: "Analyses", icon: TrendingUp, href: "/dashboard/admin/finances" });
  }

  const getInitials = (name: string) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "??";
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`w-[280px] bg-white border-r border-slate-100 flex flex-col p-6 fixed h-screen z-50 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between mb-10">
          <Link href="/dashboard" className="flex flex-col px-2">
            <span className="text-xl font-bold tracking-tight text-slate-900">Wallet</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Premium Concierge</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                  isActive 
                    ? "bg-black text-white shadow-lg shadow-black/10" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon className="w-4.5 h-4.5" />
                <span className="font-semibold text-[13px]">{item.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="ml-auto w-1 h-4 bg-white/20 rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
          <button onClick={() => logout()} className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-full h-full border-2 border-white bg-slate-100 rounded-full p-1">
                <div className="w-full h-full bg-slate-400 rounded-full flex items-center justify-center text-white text-[10px] font-bold lowercase tracking-widest">
                  {getInitials(user?.fullName || "")}
                </div>
            </div>
          </button>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-bold text-slate-900 truncate">{user?.fullName || "Chargement..."}</p>
            <p className="text-[10px] text-slate-500 font-medium capitalize">{user?.role || "Membre"}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-[280px] w-full min-w-0">
        {/* Top Bar */}
        <header className="h-[72px] flex items-center justify-between px-4 lg:px-8 sticky top-0 bg-[#F8FAFC]/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-white rounded-xl shadow-sm text-slate-900">
               <Menu className="w-5 h-5" />
            </button>
            <div className="relative w-full max-w-[320px] group hidden xs:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="w-full bg-white border border-transparent rounded-xl py-2.5 pl-11 pr-4 focus:border-slate-200 transition-all font-medium text-xs shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-5">
            <button className="relative w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-slate-500 hover:text-slate-900">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
            </button>
            <div className="flex items-center gap-3 pl-3 lg:pl-6 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{user?.fullName}</p>
              </div>
              <Link href="/dashboard/profile" className="w-10 h-10 rounded-full bg-emerald-100 overflow-hidden hover:scale-110 transition-transform flex items-center justify-center">
                  <span className="text-emerald-700 font-bold text-sm tracking-widest">{getInitials(user?.fullName || "")}</span>
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
