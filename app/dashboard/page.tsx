"use client";

import React from "react";
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wifi, 
  Smartphone,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { formatAmount } from "@/utils/currency";

export default function Dashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/transactions/my", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTransactions(response.data.slice(0, 3)); // Only show last 3
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };
    fetchTransactions();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'TOPUP': return ArrowDownLeft;
      case 'PAYMENT': return Smartphone;
      case 'FEE': return CheckCircle2;
      default: return ArrowUpRight;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'TOPUP': return "bg-emerald-50";
      case 'PAYMENT': return "bg-slate-100";
      case 'FEE': return "bg-orange-50";
      default: return "bg-blue-50";
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Balance Section */}
        <div className="lg:col-span-8 bg-[#F1F4FF] rounded-[32px] p-8 flex flex-col justify-between min-h-[220px]">
          <div>
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Solde Global</p>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none">
                {formatAmount(user?.balance || 0, user?.currency)}
              </h2>
          </div>
          
          <div className="flex gap-3 mt-8">
            <Link href="/dashboard/topup" className="flex items-center justify-center gap-2 bg-[#065F46] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#047857] transition-all group">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              Recharger
            </Link>
            <button className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">
              Virer
            </button>
          </div>
        </div>
        {/* ... Card Section stays the same ... */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="lg:col-span-4 bg-[#0F172A] rounded-[32px] p-8 text-white relative overflow-hidden flex flex-col justify-between aspect-square lg:aspect-auto"
        >
          {/* Active Card content remains */}
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Carte Active</p>
              <h3 className="text-xl font-bold">Premium</h3>
              <p className="text-[9px] font-bold text-emerald-400 uppercase mt-0.5">(3% frais)</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-sm border border-white/10">
              <Wifi className="w-5 h-5 rotate-90 text-slate-400" />
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex gap-3 text-lg tracking-[0.2em] font-mono text-slate-300 mb-5">
              <span>••••</span>
              <span>••••</span>
              <span>••••</span>
              <span>8824</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[9px] uppercase text-slate-500 font-bold mb-0.5">Exp</p>
                <p className="text-xs font-semibold">12/26</p>
              </div>
              <div className="flex gap-1">
                 <div className="w-5 h-5 rounded-full bg-red-500/80" />
                 <div className="w-5 h-5 rounded-full bg-orange-400/80 -ml-2" />
              </div>
            </div>
          </div>
          <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-blue-600/10 rounded-full blur-[100px]" />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          <div className="flex justify-between items-end mb-1">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Dernières Transactions</h3>
            <Link href="/dashboard/transactions" className="text-emerald-600 font-bold text-xs hover:underline">Voir tout</Link>
          </div>
          
          <div className="space-y-3">
            {transactions.map((t) => {
              const Icon = getIcon(t.type);
              return (
                <motion.div 
                  key={t._id}
                  whileHover={{ x: 5 }}
                  className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all cursor-pointer border border-slate-50/50"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl ${getColor(t.type)} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-slate-900" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-900">{t.description}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {new Date(t.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} • {t.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-base ${t.type === 'TOPUP' ? "text-emerald-600" : "text-slate-900"}`}>
                      {t.type === 'TOPUP' ? `+ ${formatAmount(t.amount, user?.currency)}` : `- ${formatAmount(Math.abs(t.amount), user?.currency)}`}
                    </p>
                  </div>
                </motion.div>
              );
            })}
            {transactions.length === 0 && (
              <p className="text-center text-slate-400 py-10 text-sm italic">Aucune transaction pour le moment.</p>
            )}
          </div>
        </div>

        {/* Stats & Quick Recharge */}
        <div className="lg:col-span-4 space-y-6">
          {/* Stats Bar Chart Mockup */}
          <div className="bg-[#E9EDFF] rounded-[32px] p-6">
             <h4 className="text-sm font-bold text-slate-900 mb-6">Statistiques Mensuelles</h4>
             <div className="flex items-end justify-between h-20 gap-2 mb-6">
                {[40, 65, 30, 95, 55].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className={`w-full rounded-md ${i === 3 ? "bg-[#064E3B]" : "bg-slate-300/40"}`}
                  />
                ))}
             </div>
             <div className="flex justify-between items-center">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Croissance ce mois</p>
                <p className="text-emerald-600 font-black text-base">+12.4%</p>
             </div>
          </div>

          {/* Quick Recharge */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-50">
             <h4 className="text-sm font-bold text-slate-900 mb-6">Recharge Rapide</h4>
             <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between mb-6 group cursor-pointer hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-200" />
                  <p className="text-[12px] font-bold text-slate-700">BNP Paribas</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
             </div>
             <button className="w-full bg-[#065F46] text-white py-3.5 rounded-xl text-sm font-bold hover:bg-[#047857] transition-all">
                Recharger {formatAmount(500, user?.currency)}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
