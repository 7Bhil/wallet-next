"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Smartphone, 
  CheckCircle2, 
  CreditCard,
  Plus,
  Search,
  ChevronDown,
  ArrowLeftRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { formatLocal } from "@/utils/currency";

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/transactions/my", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTransactions(response.data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const totalFees = transactions.filter(t => t.type === 'FEE' || (t.type === 'TOPUP' && t.fee)).reduce((acc, t) => acc + (t.fee || 0), 0);
  const netCashflow = transactions.reduce((acc, t) => {
    const isCredit = ['TOPUP', 'TRANSFER_IN', 'CARD_TRANSFER'].includes(t.type); // Simplifié pour la démo
    return acc + (isCredit ? t.amount : -Math.abs(t.amount));
  }, 0);

  const stats = [
    { label: "Cashflow Net", value: formatLocal(netCashflow, user?.currency || 'USD'), color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Volume Total", value: formatLocal(transactions.reduce((acc, t) => acc + t.amount, 0), user?.currency || 'USD'), color: "text-slate-500", bg: "bg-slate-50" },
    { label: "Solde Actuel", value: formatLocal(user?.balance || 0, user?.currency || 'USD'), color: "text-white", bg: "bg-black" },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'TOPUP': 
      case 'TRANSFER_IN': return ArrowDownLeft;
      case 'PAYMENT': 
      case 'TRANSFER_OUT':
      case 'CARD_TOPUP': return ArrowUpRight;
      case 'FEE': return CheckCircle2;
      default: return ArrowLeftRight;
    }
  };

  return (
    <div className="space-y-10 py-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Historique des Transactions</h1>
           <p className="text-sm text-slate-500">Consultez l'ensemble de votre activité financière en temps réel.</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
           {["All", "In", "Out"].map(tab => (
             <button key={tab} className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${tab === "All" ? "bg-black text-white" : "text-slate-400 hover:text-slate-900"}`}>
                {tab}
             </button>
           ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {stats.map((s, i) => (
           <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className={`${s.bg} p-8 rounded-[32px] border border-transparent hover:border-white transition-all shadow-sm`}
           >
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
              <p className={`text-2xl font-black ${s.color} tracking-tight`}>{s.value}</p>
           </motion.div>
         ))}
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-50 overflow-hidden">
         <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-bold text-slate-900">Activité Récente</h3>
            <div className="flex items-center gap-2">
               <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input type="text" placeholder="Filtrer..." className="bg-white border-transparent focus:border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs transition-all w-48 shadow-inner" />
               </div>
            </div>
         </div>
         
         <div className="divide-y divide-slate-50">
            {loading ? (
              <div className="p-20 text-center text-slate-400 italic flex flex-col items-center gap-4">
                 <div className="w-8 h-8 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin" />
                 Chargement des données sécurisées...
              </div>
            ) : transactions.map((t) => {
              const Icon = getIcon(t.type);
              const isCredit = ['TOPUP', 'TRANSFER_IN'].includes(t.type);
              
              return (
                <div key={t._id} className="p-6 hover:bg-slate-50/50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm ${isCredit ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{t.description}</p>
                      <p className="text-[11px] text-slate-400 font-medium tracking-tight">
                        {new Date(t.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} • {t.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-base ${isCredit ? "text-emerald-600" : "text-slate-900"}`}>
                      {isCredit ? `+ ${formatLocal(t.amount, t.targetCurrency || user?.currency || 'USD')}` : `- ${formatLocal(Math.abs(t.amount), user?.currency || 'USD')}`}
                    </p>
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1 bg-emerald-50 px-2 py-0.5 rounded inline-block">Validé</p>
                  </div>
                </div>
              );
            })}
            {!loading && transactions.length === 0 && (
              <div className="p-20 text-center text-slate-400 italic">
                 Vous n'avez pas encore effectué de transactions.
              </div>
            )}
         </div>
      </div>
    </div>
  );
}
