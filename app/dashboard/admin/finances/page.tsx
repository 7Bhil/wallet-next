"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Calculator, 
  ArrowRight, 
  Info, 
  Coins, 
  Target, 
  ChevronRight,
  RefreshCw,
  Zap,
  DollarSign,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { formatBSD } from "@/utils/currency";
import { useAuth } from "@/context/AuthContext";

export default function AdminFinances() {
  const { user } = useAuth();
  const [ratesData, setRatesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Simulator state
  const [simAmount, setSimAmount] = useState<number>(100);
  const [simCurrency, setSimCurrency] = useState<string>("EUR");

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/currency/rates", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRatesData(res.data);
    } catch (err) {
      console.error("Failed to fetch rates", err);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return <div className="p-8 text-center">Accès refusé</div>;
  }

  const commission = ratesData?.commission || 0.02;
  const platformRate = ratesData?.toBSD?.[simCurrency] || 1;
  const marketRate = platformRate / (1 - commission);
  
  const totalMarketValue = simAmount * marketRate;
  const userReceives = simAmount * platformRate;
  const platformProfit = totalMarketValue - userReceives;

  return (
    <div className="max-w-[1300px] mx-auto space-y-12 pb-20 animate-in fade-in duration-500">
      {/* Sober Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-10">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Analyse de Rentabilité</h1>
          <p className="text-sm font-medium text-slate-400">Simulation des marges opérationnelles et des profits de change.</p>
        </div>
        <button 
          onClick={fetchRates} 
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-sm"
        >
           <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
           Actualiser les taux
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Minimalist Simulator */}
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-white rounded-[32px] border border-slate-100 p-8 md:p-12 shadow-sm">
              <div className="flex items-center justify-between mb-12">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
                       <Calculator className="w-5 h-5 text-slate-900" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Simulateur de Profit</h3>
                 </div>
                 <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                    Commission Actuelle: {(commission * 100).toFixed(1)}%
                 </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Montant Entrant</label>
                    <div className="relative">
                       <input 
                         type="number" 
                         value={simAmount}
                         onChange={(e) => setSimAmount(Number(e.target.value))}
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-8 text-2xl font-black text-slate-900 focus:border-slate-300 outline-none transition-all placeholder:text-slate-300"
                        />
                       <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-slate-900 rounded-r-full" />
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Devise Locale</label>
                    <select 
                      value={simCurrency}
                      onChange={(e) => setSimCurrency(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-8 text-lg font-bold text-slate-900 focus:border-slate-300 outline-none transition-all appearance-none cursor-pointer"
                    >
                       {ratesData?.toBSD && Object.keys(ratesData.toBSD).map(c => (
                         <option key={c} value={c}>{c}</option>
                       ))}
                    </select>
                 </div>
              </div>

              {/* Data Breakdown */}
              <div className="mt-12 space-y-8 pt-10 border-t border-slate-50">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-1">
                       <p className="text-[10px] font-bold text-slate-400 uppercase">Valeur Réelle (Marché)</p>
                       <p className="text-2xl font-black text-slate-900">B$ {totalMarketValue.toFixed(4)}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-indigo-50/30 border border-indigo-100/50 space-y-1">
                       <p className="text-[10px] font-bold text-indigo-400 uppercase">Attribué Utilisateur</p>
                       <p className="text-2xl font-black text-indigo-600">B$ {userReceives.toFixed(4)}</p>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(userReceives / totalMarketValue) * 100}%` }}
                        className="h-full bg-slate-900" 
                       />
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(platformProfit / totalMarketValue) * 100}%` }}
                        className="h-full bg-indigo-500" 
                       />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter">
                       <span className="text-slate-400">Utilisateur ({( (userReceives / totalMarketValue) * 100 ).toFixed(1)}%)</span>
                       <span className="text-indigo-500">Wallet Yield ({( (platformProfit / totalMarketValue) * 100 ).toFixed(1)}%)</span>
                    </div>
                 </div>

                 <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900 rounded-3xl p-8 text-white">
                    <div className="flex items-center gap-5">
                       <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                          <Coins className="w-6 h-6 text-white" />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Profit Net Platform</p>
                          <h3 className="text-4xl font-black text-white">+{formatBSD(platformProfit)}</h3>
                       </div>
                    </div>
                    <button className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors">
                       Consulter l'Audit
                    </button>
                 </div>
              </div>
           </div>

           {/* Simple Cards */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "Projection Hebdomadaire", val: "+1,400", desc: "Volume Platform estimé", icon: TrendingUp },
                { label: "Objectif du mois", val: "5,000", desc: "45% complété", icon: Target },
              ].map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-[28px] border border-slate-100 shadow-sm flex items-start justify-between">
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</p>
                      <p className="text-2xl font-black text-slate-900">{item.val} B$</p>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                   </div>
                   <item.icon className="w-5 h-5 text-slate-300" />
                </div>
              ))}
           </div>
        </div>

        {/* Right: Clean Table */}
        <div className="lg:col-span-4">
           <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
              <div className="p-8 border-b border-slate-100">
                 <h3 className="text-lg font-bold text-slate-900">Index des Devises</h3>
                 <p className="text-[11px] font-medium text-slate-400 mt-1">Marges de profit par unité.</p>
              </div>
              <div className="flex-1 divide-y divide-slate-50 overflow-y-auto custom-scrollbar">
                 {ratesData?.toBSD && Object.entries(ratesData.toBSD).filter(([c]) => ['EUR', 'GBP', 'USD', 'XOF', 'JPY', 'CAD'].includes(c)).map(([currency, pRate]: [string, any]) => {
                   const mRate = pRate / (1 - commission);
                   return (
                    <div key={currency} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-xs text-slate-900">
                             {currency}
                          </div>
                          <span className="text-sm font-bold text-slate-700">{currency} / B$</span>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">+{ (mRate - pRate).toFixed(currency === 'XOF' ? 6 : 4) }</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Points / Unité</p>
                       </div>
                    </div>
                   );
                 })}
              </div>
              <div className="p-10 bg-slate-50/50">
                 <div className="p-6 bg-white rounded-2xl border border-slate-100 space-y-3">
                    <p className="text-[10px] font-bold text-slate-900 uppercase">Conseil Financier</p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                       Maintenir un spread constant de 2% assure une rentabilité stable sans décourager les gros transferts.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
