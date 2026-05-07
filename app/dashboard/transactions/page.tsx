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
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import { formatLocal } from "@/utils/currency";

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedTx, setSelectedTx] = useState<any>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await api.get("/transactions/my");
        setTransactions(response.data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(t => {
    if (activeTab === "All") return true;
    const isCredit = ['TOPUP', 'TRANSFER_IN', 'CARD_TRANSFER'].includes(t.type);
    if (activeTab === "In") return isCredit;
    if (activeTab === "Out") return !isCredit;
    return true;
  });

  const totalFees = transactions.filter(t => t.type === 'FEE' || (t.type === 'TOPUP' && t.fee)).reduce((acc, t) => acc + (t.fee || 0), 0);
  const netCashflow = transactions.reduce((acc, t) => {
    const isCredit = ['TOPUP', 'TRANSFER_IN', 'CARD_TRANSFER'].includes(t.type); 
    return acc + (isCredit ? t.amount : -Math.abs(t.amount));
  }, 0);

  const stats = [
    { label: "Cashflow Net", value: formatLocal(netCashflow, user?.currency || 'USD'), color: "text-[var(--accent)]", bg: "bg-[var(--accent-soft)]" },
    { label: "Volume Total", value: formatLocal(transactions.reduce((acc, t) => acc + t.amount, 0), user?.currency || 'USD'), color: "text-white", bg: "bg-slate-50" },
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
             <button 
               key={tab} 
               onClick={() => setActiveTab(tab)}
               className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? "bg-black text-white" : "text-slate-400 hover:text-slate-900"}`}
             >
                {tab === "In" ? "Entrées" : tab === "Out" ? "Sorties" : "Tout"}
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
                 <div className="w-8 h-8 border-4 border-slate-100 border-t-[var(--accent)] rounded-full animate-spin" />
                 Chargement des données sécurisées...
              </div>
            ) : filteredTransactions.map((t) => {
              const Icon = getIcon(t.type);
              const isCredit = ['TOPUP', 'TRANSFER_IN', 'CARD_TRANSFER'].includes(t.type);
              
              return (
                <div 
                  key={t._id} 
                  onClick={() => setSelectedTx(t)}
                  className="p-6 hover:bg-slate-50/50 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm ${isCredit ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "bg-slate-50 text-slate-400"}`}>
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
                    <p className={`font-bold text-base ${isCredit ? "text-[var(--accent)]" : "text-slate-900"}`}>
                      {isCredit ? `+ ${formatLocal(t.amount, t.targetCurrency || user?.currency || 'USD')}` : `- ${formatLocal(Math.abs(t.amount), user?.currency || 'USD')}`}
                    </p>
                    <p className="text-[9px] font-black text-[var(--accent)] uppercase tracking-[0.2em] mt-1 bg-[var(--accent-soft)] px-2 py-0.5 rounded inline-block">Validé</p>
                  </div>
                </div>
              );
            })}
            {!loading && filteredTransactions.length === 0 && (
              <div className="p-20 text-center text-slate-400 italic font-medium">
                 Aucune transaction trouvée pour ce filtre.
              </div>
            )}
         </div>
      </div>

      {/* Transaction Details Modal */}
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTx(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="w-full max-w-md bg-white rounded-[40px] overflow-hidden shadow-2xl relative z-10">
               <div className={`p-10 text-center ${['TOPUP', 'TRANSFER_IN', 'CARD_TRANSFER'].includes(selectedTx.type) ? "bg-[var(--accent-soft)]" : "bg-slate-50"}`}>
                  <div className={`w-20 h-20 rounded-[32px] mx-auto flex items-center justify-center mb-6 shadow-xl ${['TOPUP', 'TRANSFER_IN', 'CARD_TRANSFER'].includes(selectedTx.type) ? "bg-[var(--accent)] text-white" : "bg-white text-slate-900"}`}>
                     {React.createElement(getIcon(selectedTx.type), { className: "w-10 h-10" })}
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-1">{selectedTx.description}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedTx.type}</p>
               </div>
               
               <div className="p-10 space-y-6">
                  <div className="flex justify-between items-center pb-6 border-b border-slate-50">
                     <p className="text-sm font-bold text-slate-400">Montant</p>
                     <p className={`text-2xl font-black ${['TOPUP', 'TRANSFER_IN', 'CARD_TRANSFER'].includes(selectedTx.type) ? "text-[var(--accent)]" : "text-slate-900"}`}>
                        {['TOPUP', 'TRANSFER_IN', 'CARD_TRANSFER'].includes(selectedTx.type) ? "+" : "-"} {formatLocal(Math.abs(selectedTx.amount), selectedTx.targetCurrency || user?.currency || 'USD')}
                     </p>
                  </div>
                  
                  <div className="space-y-4">
                     <div className="flex justify-between text-[11px]">
                        <span className="font-bold text-slate-400 uppercase tracking-wider">Date</span>
                        <span className="font-black text-slate-900">{new Date(selectedTx.createdAt).toLocaleString('fr-FR')}</span>
                     </div>
                     <div className="flex justify-between text-[11px]">
                        <span className="font-bold text-slate-400 uppercase tracking-wider">Statut</span>
                        <span className="font-black text-green-500 uppercase tracking-widest">Complété</span>
                     </div>
                     <div className="flex justify-between text-[11px]">
                        <span className="font-bold text-slate-400 uppercase tracking-wider">ID Transaction</span>
                        <span className="font-mono text-slate-400">#{selectedTx._id.slice(-8).toUpperCase()}</span>
                     </div>
                  </div>

                  <div className="pt-8">
                     <button onClick={() => setSelectedTx(null)} className="w-full bg-black text-white py-4 rounded-2xl font-bold text-sm hover:scale-[1.02] transition-all shadow-xl">Fermer</button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
