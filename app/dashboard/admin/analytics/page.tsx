"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Users, 
  Eye, 
  Clock, 
  TrendingUp, 
  ArrowUpRight, 
  BarChart3,
  Search,
  Monitor,
  Calendar,
  Lock,
  AlertTriangle,
  X,
  ChevronRight,
  ShieldCheck,
  History
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/utils/api";
import { useAuth } from "@/context/AuthContext";

export default function AdminAnalyticsPage() {
  const { user: adminUser } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  
  // States for resetting
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState("");

  // States for User Details
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userLogs, setUserLogs] = useState<any[]>([]);
  const [loadingUserLogs, setLoadingUserLogs] = useState(false);

  const fetchStats = async () => {
    try {
      const [auditRes, adminRes] = await Promise.all([
        api.get("/audit/stats"),
        api.get("/admin/stats")
      ]);
      setData({ ...auditRes.data, ...adminRes.data });
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const openUserAudit = async (user: any) => {
    setSelectedUser(user);
    setLoadingUserLogs(true);
    try {
      const res = await api.get(`/audit/user/${user._id}`);
      setUserLogs(res.data);
    } catch (err) {
      console.error("Failed to fetch user logs", err);
    } finally {
      setLoadingUserLogs(false);
    }
  };

  const handleExecuteReset = async () => {
    setResetError("");
    if (resetPassword !== "Bhil123") {
      setResetError("Code de sécurité incorrect.");
      return;
    }
    try {
      setIsResetting(true);
      await api.post("/audit/reset");
      await api.post("/admin/reset-stats");
      setIsResetModalOpen(false);
      window.location.reload();
    } catch (err) {
      setResetError("Erreur lors de la réinitialisation.");
    } finally {
      setIsResetting(false);
    }
  };

  if (adminUser?.role !== "ADMIN" && adminUser?.role !== "SUPER_ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Activity className="w-12 h-12 text-slate-200" />
        <p className="text-slate-500 font-bold">Accès réservé aux administrateurs.</p>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { 
    topSections, 
    recentActivities, 
    activeUsersCountToday, 
    totalVolume, 
    systemRevenue, 
    successRate, 
    topUsers,
    totalValueLocked
  } = data || {};

  const filteredActivities = recentActivities?.filter((c: any) => 
    c.userId?.fullName?.toLowerCase().includes(query.toLowerCase()) || 
    c.userId?.email?.toLowerCase().includes(query.toLowerCase()) ||
    c.action?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">Analytics & Finance</h1>
          <p className="text-slate-500 font-medium mt-2">Pilotage complet de l&apos;infrastructure et de la trésorerie.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsResetModalOpen(true)}
            className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100 flex items-center gap-2"
          >
            <Activity className="w-3.5 h-3.5" />
            Réinitialiser
          </button>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm text-[11px] font-bold text-slate-400 uppercase tracking-widest px-4 py-3">
             <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
             Live Update actif
          </div>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
          className="bg-slate-900 rounded-[32px] p-8 text-white flex flex-col justify-between h-48 border border-slate-800 shadow-2xl">
          <div className="flex justify-between items-start">
             <div className="p-3 bg-white/10 rounded-2xl">
                <Users className="w-5 h-5 text-[#D4AF37]" />
             </div>
             <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div>
             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Activité (24h)</p>
             <p className="text-4xl font-black italic">{activeUsersCountToday || 0}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-[32px] p-8 flex flex-col justify-between h-48 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
             <div className="p-3 bg-[#D4AF37]/10 rounded-2xl">
                <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
             </div>
             <div className="text-[10px] font-bold text-[#D4AF37] px-2 py-1 bg-[#D4AF37]/10 rounded-full">+{successRate?.toFixed(1)}%</div>
          </div>
          <div>
             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Volume Global</p>
             <p className="text-3xl font-black italic">{(totalVolume || 0).toLocaleString()} <span className="text-sm font-medium">B$</span></p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-[#D4AF37] rounded-[32px] p-8 text-white flex flex-col justify-between h-48 border border-[#D4AF37] shadow-xl shadow-[#D4AF37]/20">
          <div className="flex justify-between items-start">
             <div className="p-3 bg-white/20 rounded-2xl">
                <TrendingUp className="w-5 h-5 text-white" />
             </div>
             <Activity className="w-4 h-4 text-white/50" />
          </div>
          <div>
             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 mb-1 text-slate-900 font-black">Revenus Système</p>
             <p className="text-3xl font-black italic text-slate-900">{(systemRevenue || 0).toLocaleString()} <span className="text-sm font-medium text-slate-800">B$</span></p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-[32px] p-8 flex flex-col justify-between h-48 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
             <div className="p-3 bg-slate-50 rounded-2xl">
                <Lock className="w-5 h-5 text-slate-400" />
             </div>
          </div>
          <div>
             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">TVL (Fonds Total)</p>
             <p className="text-3xl font-black italic text-slate-900">{(totalValueLocked || 0).toLocaleString()} <span className="text-xs font-bold text-slate-400">B$</span></p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
             </div>
             <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter text-sm">Sections Populaires</h2>
          </div>
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden p-6 space-y-4">
             {topSections?.map((section: any, i: number) => (
                <div key={section._id} className="flex items-center gap-4 group">
                   <span className="text-xs font-black text-slate-300 w-4">{i + 1}</span>
                   <div className="flex-1">
                      <div className="flex justify-between items-end mb-1.5">
                         <p className="text-[13px] font-bold text-slate-800 truncate max-w-[140px]">{section._id || 'Inconnu'}</p>
                         <p className="text-[11px] font-black text-slate-900">{section.count} v.</p>
                      </div>
                      <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                         <motion.div initial={{ width: 0 }} animate={{ width: `${(section.count / (topSections[0]?.count || 1)) * 100}%` }} className="h-full bg-[#D4AF37] rounded-full" />
                      </div>
                   </div>
                </div>
             ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-[#D4AF37]" />
               </div>
               <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter text-sm">Flux d'Activité Global</h2>
            </div>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input type="text" placeholder="Rechercher..." value={query} onChange={(e) => setQuery(e.target.value)} className="bg-white border border-slate-100 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-bold outline-none w-64" />
            </div>
          </div>
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Utilisateur</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Heure</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Action</th>
                  </tr>
                </thead>
                 <tbody className="divide-y divide-slate-50">
                    {filteredActivities?.map((conn: any) => (
                      <tr key={conn._id} className="hover:bg-[#D4AF37]/5 transition-colors cursor-pointer group" onClick={() => openUserAudit(conn.userId)}>
                        <td className="px-8 py-6 flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white text-[10px] font-black group-hover:bg-[#D4AF37] transition-colors">{conn.userId?.fullName?.slice(0, 2).toUpperCase() || "GU"}</div>
                           <div>
                              <p className="text-[13px] font-black">{conn.userId?.fullName || "Visiteur"}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{conn.userId?.email || "Anonyme"}</p>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <p className="text-[11px] font-black uppercase text-slate-900">{conn.action}</p>
                           <p className="text-[10px] text-slate-400 font-medium">{conn.target || 'N/A'}</p>
                        </td>
                        <td className="px-8 py-6 text-right">
                            <p className="text-[11px] font-bold text-slate-600 mb-1">{new Date(conn.createdAt).toLocaleTimeString()}</p>
                            <div className="flex items-center justify-end gap-2 text-[#D4AF37] text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                               Détails <ChevronRight className="w-3 h-3" />
                            </div>
                        </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-10">
                 <div>
                    <h3 className="text-xl font-black text-slate-900 italic uppercase">Flux Transactionnel</h3>
                    <p className="text-slate-400 text-xs font-bold">Volume cumulé des 30 derniers jours.</p>
                 </div>
                 <div className="px-3 py-1 bg-[#D4AF37] text-slate-900 rounded-lg text-[9px] font-black uppercase italic">Vitch Network</div>
              </div>
              <div className="h-48 flex items-end gap-2 px-4 border-b border-dashed border-slate-100">
                 {[40, 70, 45, 90, 65, 80, 100, 85, 60, 95, 75, 110].map((h, i) => (
                    <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.05 }} className="flex-1 bg-slate-900 rounded-t-xl group relative">
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">{(totalVolume/(12 - i + 1)).toFixed(0)}</div>
                    </motion.div>
                 ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
           <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden border border-slate-800 shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-10 text-[#D4AF37]">
                 <TrendingUp className="w-32 h-32" />
              </div>
              <h3 className="text-xl font-black italic uppercase mb-8">Leaderboard TrX</h3>
              <div className="space-y-6">
                 {topUsers?.map((u: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black text-[#D4AF37]">0{i+1}</span>
                          <span className="text-xs font-black truncate max-w-[100px]">{u.name}</span>
                       </div>
                       <span className="text-xs font-black text-[#D4AF37] font-mono">{u.volume.toLocaleString()} B$</span>
                    </div>
                 ))}
              </div>
           </div>
           <div className="bg-[#D4AF37] rounded-[40px] p-8 text-slate-900 shadow-xl shadow-[#D4AF37]/20">
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Santé Réseau</p>
              <div className="flex justify-between items-end">
                 <p className="text-3xl font-black italic">OPTIMAL</p>
                 <ShieldCheck className="w-6 h-6" />
              </div>
           </div>
        </div>
      </div>

      {/* MODAL AUDIT UTILISATEUR */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[150] flex items-center justify-end">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedUser(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
             <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
               className="relative w-full max-w-[480px] h-full bg-white shadow-2xl overflow-y-auto p-12 border-l border-slate-100"
             >
                <div className="flex justify-between items-start mb-12">
                   <div className="w-16 h-16 rounded-[24px] bg-slate-900 flex items-center justify-center text-white text-xl font-black">
                      {selectedUser.fullName.slice(0, 2).toUpperCase()}
                   </div>
                   <button onClick={() => setSelectedUser(null)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="mb-12">
                   <h2 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">{selectedUser.fullName}</h2>
                   <p className="text-slate-400 font-bold text-sm mt-1">{selectedUser.email}</p>
                   <div className="flex gap-2 mt-4">
                      <span className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-black rounded-lg uppercase tracking-widest">ID {selectedUser._id.slice(-6)}</span>
                      <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black rounded-lg uppercase tracking-widest">Audit Logs</span>
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="flex items-center gap-3">
                      <History className="w-5 h-5 text-[#D4AF37]" />
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Historique d&apos;accès</h3>
                   </div>

                   <div className="relative pl-6 space-y-8 before:absolute before:left-[1px] before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-100">
                      {loadingUserLogs ? (
                        <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /></div>
                      ) : userLogs.map((log, i) => (
                        <div key={log._id} className="relative">
                           <div className="absolute -left-[29px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2 border-[#D4AF37]" />
                           <div className="flex justify-between items-start">
                              <div>
                                 <p className="text-xs font-black text-slate-900 uppercase">{log.target || 'Section inconnue'}</p>
                                 <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{log.action}</p>
                              </div>
                              <p className="text-[10px] font-black text-slate-300">{new Date(log.createdAt).toLocaleTimeString()}</p>
                           </div>
                        </div>
                      ))}
                      {!loadingUserLogs && userLogs.length === 0 && <p className="text-slate-400 text-xs font-bold italic">Aucun log trouvé pour cet utilisateur.</p>}
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE RÉINITIALISATION */}
      <AnimatePresence>
        {isResetModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsResetModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-[420px] bg-white rounded-[40px] p-12 text-center shadow-2xl">
                <div className="w-20 h-20 bg-red-50 rounded-[30px] flex items-center justify-center mx-auto mb-8"><AlertTriangle className="w-10 h-10 text-red-500" /></div>
                <h3 className="text-2xl font-black italic uppercase mb-4 text-slate-900 tracking-tighter">Security Cleanup</h3>
                <p className="text-slate-500 text-sm mb-8 font-medium">Réinitialisation des serveurs. Mot de passe Bhil123 requis.</p>
                <div className="relative mb-6">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input type="password" placeholder="Passphrase" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} className="w-full bg-slate-50 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold outline-none focus:bg-white border-2 border-transparent focus:border-slate-100 transition-all font-mono" />
                </div>
                {resetError && <p className="text-red-500 text-[10px] font-black uppercase mb-4">{resetError}</p>}
                <div className="flex gap-4">
                   <button onClick={() => setIsResetModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors">Annuler</button>
                   <button onClick={handleExecuteReset} className="flex-[2] py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-200 active:scale-95 transition-all">Confirmer</button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
