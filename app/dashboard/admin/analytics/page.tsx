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
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/utils/api";
import { useAuth } from "@/context/AuthContext";

export default function AdminAnalyticsPage() {
  const { user: adminUser } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const fetchStats = async () => {
    try {
      const res = await api.get("/audit/stats");
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, []);

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

  const { topSections, recentConnections, activeUsersCountToday } = data || {};

  const filteredConnections = recentConnections?.filter((c: any) => 
    c.userId?.fullName?.toLowerCase().includes(query.toLowerCase()) || 
    c.userId?.email?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Analytics & Audit</h1>
          <p className="text-slate-500 font-medium mt-2">Surveillance en temps réel de l&apos;activité utilisateur.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm text-[11px] font-bold text-slate-400 uppercase tracking-widest">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           Live Update actif
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
          className="bg-slate-900 rounded-[32px] p-8 text-white flex flex-col justify-between h-48 border border-slate-800 shadow-2xl">
          <div className="flex justify-between items-start">
             <div className="p-3 bg-white/10 rounded-2xl">
                <Users className="w-5 h-5 text-white" />
             </div>
             <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Utilisateurs Actifs (24h)</p>
             <p className="text-4xl font-black">{activeUsersCountToday || 0}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-[32px] p-8 flex flex-col justify-between h-48 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
             <div className="p-3 bg-slate-50 rounded-2xl">
                <Eye className="w-5 h-5 text-slate-400" />
             </div>
             <BarChart3 className="w-4 h-4 text-blue-500" />
          </div>
          <div>
             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Sections les plus visitées</p>
             <p className="text-4xl font-black">{topSections?.length || 0}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-[32px] p-8 flex flex-col justify-between h-48 border border-slate-100 shadow-sm text-slate-400/50">
          <div className="flex justify-between items-start">
             <div className="p-3 bg-slate-50 rounded-2xl">
                <Clock className="w-5 h-5 text-slate-300" />
             </div>
          </div>
          <p className="text-xs font-bold leading-tight">D&apos;autres métriques<br/>bientôt disponibles.</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Sections Table */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
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
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${(section.count / topSections[0].count) * 100}%` }}
                           className="h-full bg-blue-500 rounded-full"
                         />
                      </div>
                   </div>
                </div>
             ))}
             {(!topSections || topSections.length === 0) && (
               <p className="text-center py-10 text-slate-400 text-sm font-bold">Aucune donnée disponible.</p>
             )}
          </div>
        </div>

        {/* Recent Connections */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-emerald-600" />
               </div>
               <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter text-sm">Connexions Récentes</h2>
            </div>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher un utilisateur..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-white border border-slate-100 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-bold outline-none focus:border-slate-200 transition-all w-full sm:w-64"
              />
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest uppercase text-sm">Utilisateur</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest uppercase text-sm">Heure</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest uppercase text-sm">Info Système</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {filteredConnections?.map((conn: any) => (
                     <tr key={conn._id} className="hover:bg-slate-50/50 transition-colors group">
                       <td className="px-8 py-6">
                         <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white text-[10px] font-black">
                              {conn.userId?.fullName?.slice(0, 2).toUpperCase()}
                           </div>
                           <div>
                              <p className="text-[13px] font-black text-slate-900">{conn.userId?.fullName}</p>
                              <p className="text-[10px] font-medium text-slate-400">{conn.userId?.email}</p>
                           </div>
                         </div>
                       </td>
                       <td className="px-8 py-6">
                         <div className="flex flex-col">
                            <p className="text-[13px] font-bold text-slate-900">
                               {new Date(conn.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-[10px] font-medium text-slate-400">
                               {new Date(conn.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                         </div>
                       </td>
                       <td className="px-8 py-6">
                         <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                               <Monitor className="w-3.5 h-3.5 text-slate-300" />
                               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                  {conn.userAgent?.includes("Mobi") ? "Mobile" : "Desktop"}
                               </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                               <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                               <span className="text-[10px] font-bold text-slate-400">{conn.ip || '---'}</span>
                            </div>
                         </div>
                       </td>
                     </tr>
                   ))}
                   {(!filteredConnections || filteredConnections.length === 0) && (
                     <tr>
                       <td colSpan={3} className="py-20 text-center text-slate-400 text-sm font-bold">
                          Aucune connexion trouvée.
                       </td>
                     </tr>
                   )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
