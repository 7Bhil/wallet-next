"use client";

import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Users, 
  Activity, 
  Database, 
  Search, 
  Filter, 
  MoreVertical, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Zap, 
  Lock, 
  Unlock,
  Terminal,
  RefreshCcw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/utils/api";
import { formatLocal, formatBSD } from "@/utils/currency";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [ratesData, setRatesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    
    // Fake system logs simulation
    const initialLogs = [
      `[${new Date().toISOString()}] AUTH: Admin logged in via JWT successfully.`,
      `[${new Date().toISOString()}] SYSTEM: Garbage collection cycle completed in 4ms.`,
      `[${new Date().toISOString()}] SECURITY: Database sync initialized.`,
      `[${new Date().toISOString()}] API: Endpoint /admin/stats connected.`
    ];
    setLogs(initialLogs);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, feedRes, ratesRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/feed"),
        api.get("/currency/rates"),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setFeed(feedRes.data);
      setRatesData(ratesRes.data);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-status`);
      setLogs(prev => [`[${new Date().toISOString()}] USER: Status toggled for user ${userId}`, ...prev]);
      fetchData();
    } catch (err) {
      console.error("Toggle failed", err);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Lock className="w-16 h-16 text-slate-200" />
        <h1 className="text-xl font-bold text-slate-900">Accès Refusé</h1>
        <p className="text-sm text-slate-400">Vous n'avez pas les autorisations nécessaires pour accéder au terminal administrateur.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
             </div>
             <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Terminal</h1>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-13">System Administrator Control Center</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => fetchData(token)} className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all text-slate-400 hover:text-slate-900">
             <RefreshCcw className="w-4 h-4" />
          </button>
          <div className="h-10 w-px bg-slate-100 mx-2 hidden md:block" />
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-soft)] rounded-2xl border border-[var(--accent)]/20">
             <div className="w-2 h-2 bg-[var(--accent-soft)]0 rounded-full animate-pulse" />
             <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">Network: Live</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Value Locked", value: formatLocal(stats?.totalValueLocked || 0, user?.currency || 'USD'), desc: "+12.4%", icon: Database, color: "bg-black text-white" },
          { label: "Active Users", value: stats?.activeUsers || "0", desc: "+4.1%", icon: Users, color: "bg-white text-slate-900" },
          { label: "Daily Volume", value: formatLocal(stats?.dailyVolume || 0, user?.currency || 'USD'), desc: "-0.8%", icon: Activity, color: "bg-white text-slate-900" },
          { label: "System Health", value: stats?.systemHealth || "Healthy", desc: "Latency: 14ms", icon: Zap, color: "bg-white text-slate-900" },
        ].map((s, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-8 rounded-[40px] shadow-sm border border-slate-50 flex flex-col justify-between h-[200px] ${s.color}`}
          >
            <div className="flex justify-between items-start">
               <p className={`text-[10px] font-bold uppercase tracking-widest ${s.color === "bg-black text-white" ? "text-slate-400" : "text-slate-400"}`}>{s.label}</p>
               <div className={`p-2 rounded-xl ${s.color === "bg-black text-white" ? "bg-white/10" : "bg-slate-50 text-slate-400"}`}>
                  <s.icon className="w-4 h-4" />
               </div>
            </div>
            <div className="space-y-1">
               <h3 className="text-3xl font-black tracking-tighter">{s.value}</h3>
               <p className={`text-[11px] font-bold ${s.desc.startsWith('+') ? 'text-[var(--accent)]' : 'text-slate-400'}`}>{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Currency Exchange Monitor */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[44px] shadow-sm border border-slate-100 p-8"
      >
        <div className="flex items-center justify-between mb-8">
           <div>
              <h3 className="text-lg font-black text-slate-900 leading-tight">Currency Market Monitor</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live exchange rates & spread analysis</p>
           </div>
           <div className="px-4 py-2 bg-[var(--accent-soft)] rounded-2xl border border-[var(--accent)]/20">
              <span className="text-[9px] font-black text-[var(--accent)] uppercase tracking-widest">Platform Spread: {((ratesData?.commission || 0) * 100).toFixed(1)}%</span>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {ratesData?.toBSD && Object.entries(ratesData.toBSD).filter(([c]) => ['EUR', 'GBP', 'XOF'].includes(c)).map(([currency, platformRate]: [string, any]) => {
             const commission = ratesData.commission || 0.02;
             const realRate = platformRate / (1 - commission);
             const profit = realRate - platformRate;
             
             return (
              <div key={currency} className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100 space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs">{currency.slice(0, 1)}</div>
                    <span className="text-sm font-black text-slate-900">{currency} / B$</span>
                 </div>
                 <div className="space-y-3">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-bold text-slate-400 uppercase">Market Rate</span>
                       <span className="text-xs font-bold text-slate-900">{realRate.toFixed(currency === 'XOF' ? 6 : 4)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-bold text-[var(--accent)] uppercase">Platform Rate</span>
                       <span className="text-xs font-black text-[var(--accent)]">{platformRate.toFixed(currency === 'XOF' ? 6 : 4)}</span>
                    </div>
                    <div className="h-px bg-slate-200" />
                    <div className="flex justify-between items-center text-[var(--accent)]">
                       <span className="text-[10px] font-bold uppercase">Our Profit</span>
                       <span className="text-xs font-black">+{profit.toFixed(currency === 'XOF' ? 6 : 4)} B$</span>
                    </div>
                 </div>
              </div>
             );
           })}
        </div>
      </motion.div>

      {/* Main Grid: Users & Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: User Management */}
        <div className="lg:col-span-8 bg-white rounded-[44px] shadow-xl shadow-slate-200/50 border border-slate-50 overflow-hidden min-h-[600px]">
           <div className="p-8 border-b border-slate-50 flex flex-col gap-6 sm:flex-row sm:items-center justify-between">
              <div>
                 <h3 className="text-lg font-black text-slate-900">Recent User Activity</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live management dashboard</p>
              </div>
              <div className="flex items-center gap-3">
                 <button className="text-xs font-bold text-[var(--accent)] hover:underline">View All Users</button>
                 <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <Filter className="w-4 h-4" />
                 </div>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="text-left px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">User</th>
                       <th className="text-left px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Balance</th>
                       <th className="text-left px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                       <th className="text-right px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {users.map((u) => (
                      <tr key={u._id} className="group hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/admin/users/${u._id}`)}>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                                 {u.fullName.slice(0, 2)}
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-slate-900">{u.fullName}</p>
                                 <p className="text-[10px] text-slate-400 font-medium">{u.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <p className="text-sm font-black text-slate-900">{formatLocal(u.balance || 0, u.currency || 'USD')}</p>
                           <p className="text-[10px] text-slate-400">Wallet Balance ({u.currency})</p>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${u.status === 'ACTIVE' ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'bg-red-50 text-red-600'}`}>
                              {u.status}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           {u._id !== user?.id && (
                             <button 
                              onClick={(e) => { e.stopPropagation(); handleToggleStatus(u._id); }}
                              className="p-2.2 rounded-xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-slate-900 transition-all"
                             >
                                {u.status === 'ACTIVE' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                             </button>
                           )}
                        </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Right: Global Feed */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-[#101827] rounded-[44px] p-8 space-y-8 min-h-[500px] relative overflow-hidden">
              <div className="flex items-center justify-between">
                 <h3 className="text-lg font-black text-white">Global Feed</h3>
                 <div className="w-2 h-2 bg-[var(--accent-soft)]0 rounded-full animate-ping" />
              </div>

              <div className="space-y-6">
                 {feed.map((t, i) => {
                   const isCredit = ['TOPUP', 'TRANSFER_IN'].includes(t.type);
                   return (
                    <motion.div 
                      key={t._id} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex gap-4 items-start group"
                    >
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/10 ${isCredit ? 'text-[var(--accent)]' : 'text-slate-400'}`}>
                          {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                       </div>
                       <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                             <p className="text-[13px] font-bold text-white group-hover:text-[var(--accent)] transition-colors uppercase tracking-tight">{t.type.replace('_', ' ')}</p>
                             <span className="text-sm font-black text-white">{isCredit ? '+' : '-'}{formatLocal(t.amount, t.targetCurrency || user?.currency || 'USD')}</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <p className="text-[10px] text-slate-500 font-medium">ID: {t._id.slice(-8).toUpperCase()} | {t.userId?.fullName || 'System'}</p>
                             <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">2m ago</span>
                          </div>
                       </div>
                    </motion.div>
                   );
                 })}
              </div>

              <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all mt-4">
                 Explore All Transactions
              </button>
           </div>

           {/* System Health Mini-Terminal */}
           <div className="bg-[#0A0F1B] rounded-[44px] p-1 shadow-2xl shadow-indigo-500/10 overflow-hidden">
              <div className="bg-[#101827]/40 p-6 rounded-[40px] border border-white/5 space-y-4">
                 <div className="flex items-center gap-3">
                    <Terminal className="w-4 h-4 text-[var(--accent)]" />
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">System Engine Logs</span>
                 </div>
                 <div className="h-40 overflow-y-auto space-y-2 font-mono text-[10px] custom-scrollbar pr-2">
                    {logs.map((log, i) => (
                      <div key={i} className="flex gap-3 text-white/70">
                         <span className="text-white/20">[{i}]</span>
                         <span className={log.includes('SECURITY') ? 'text-red-400' : log.includes('AUTH') ? 'text-[var(--accent)]' : 'text-white/60'}>
                            {log}
                         </span>
                      </div>
                    ))}
                 </div>
                 <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                       <div className="w-1.5 h-1.5 bg-[var(--accent-soft)]0 rounded-full" />
                       <span className="text-[8px] font-bold text-white/30 uppercase">DB Master</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <div className="w-1.5 h-1.5 bg-[var(--accent-soft)]0 rounded-full" />
                       <span className="text-[8px] font-bold text-white/30 uppercase">API Gateway</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
