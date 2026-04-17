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
    <div className="max-w-[1400px] mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100">
             <Zap className="w-3 h-3 text-indigo-600 fill-indigo-600" />
             <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Financial Intelligence v2.0</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
            Analyse de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Rentabilité</span>
          </h1>
          <p className="text-sm font-medium text-slate-400 max-w-xl">
            Surveillez et simulez vos marges de change en temps réel. Optimisez vos profits grâce à notre moteur de calcul prédictif.
          </p>
        </div>
        
        <button onClick={fetchRates} className="group flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl transition-all font-bold text-xs text-slate-600 hover:text-slate-900">
           <RefreshCw className={`w-4 h-4 transition-transform duration-700 group-hover:rotate-180 ${loading ? 'animate-spin' : ''}`} />
           Actualiser les Marchés
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: The Mega-Simulator (Dark Theme) */}
        <div className="lg:col-span-8">
           <div className="bg-[#0F172A] rounded-[48px] p-1 shadow-2xl shadow-indigo-500/20 overflow-hidden relative">
              {/* Background Glows */}
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-500/10 blur-[100px] rounded-full" />

              <div className="relative bg-slate-900/40 backdrop-blur-3xl rounded-[46px] p-8 md:p-14 border border-white/5 space-y-12">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                          <Calculator className="w-6 h-6 text-indigo-400" />
                       </div>
                       <div>
                          <h3 className="text-xl font-black text-white tracking-tight">Financial Simulator</h3>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Calculateur de Spread en temps réel</p>
                       </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Marge Actuelle</span>
                       <span className="text-2xl font-black text-indigo-400">{(commission * 100).toFixed(1)}%</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Montant Entrant</label>
                       <div className="relative">
                          <input 
                            type="number" 
                            value={simAmount}
                            onChange={(e) => setSimAmount(Number(e.target.value))}
                            className="w-full bg-white/5 border-2 border-white/5 rounded-3xl py-8 px-10 text-4xl font-black text-white focus:border-indigo-500/50 focus:bg-white/[0.07] outline-none transition-all placeholder:text-white/10"
                          />
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-indigo-500 rounded-full" />
                       </div>
                       <p className="text-[10px] font-bold text-slate-600 ml-4 italic">*Entrez la valeur en devise locale pour simuler la conversion.</p>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Devise Sélectionnée</label>
                       <div className="relative">
                          <select 
                            value={simCurrency}
                            onChange={(e) => setSimCurrency(e.target.value)}
                            className="w-full bg-white/5 border-2 border-white/5 rounded-3xl py-8 px-10 text-2xl font-black text-white focus:border-indigo-500/50 focus:bg-white/[0.07] outline-none transition-all appearance-none cursor-pointer"
                          >
                             {ratesData?.toBSD && Object.keys(ratesData.toBSD).map(c => (
                               <option key={c} value={c} className="bg-slate-900 text-white">{c} - {c === 'EUR' ? 'Euro' : c === 'XOF' ? 'Franc CFA' : c === 'GBP' ? 'Livre' : 'Devise'}</option>
                             ))}
                          </select>
                          <ChevronRight className="absolute right-8 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-600 rotate-90" />
                       </div>
                    </div>
                 </div>

                 {/* Results Visualization (The "Wow" Part) */}
                 <div className="space-y-8 pt-6">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                       <div className="flex-1 space-y-2 text-center md:text-left">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                             <TrendingUp className="w-3 h-3" /> Valeur Réelle du Marché
                          </p>
                          <h4 className="text-4xl font-black text-white tracking-tighter">B$ {totalMarketValue.toFixed(4)}</h4>
                       </div>
                       <div className="w-px h-16 bg-white/10 hidden md:block" />
                       <div className="flex-1 space-y-2 text-center md:text-right">
                          <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest flex items-center justify-center md:justify-end gap-2">
                             Attribué Utilisateur <CheckCircle2 className="w-3 h-3" />
                          </p>
                          <h4 className="text-4xl font-black text-indigo-400 tracking-tighter">B$ {userReceives.toFixed(4)}</h4>
                       </div>
                    </div>

                    {/* Visual Distribution Bar */}
                    <div className="space-y-4">
                        <div className="h-6 w-full bg-white/5 rounded-full overflow-hidden flex p-1 border border-white/5">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(userReceives / totalMarketValue) * 100}%` }}
                              transition={{ duration: 1, ease: "circOut" }}
                              className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full" 
                            />
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(platformProfit / totalMarketValue) * 100}%` }}
                              transition={{ duration: 1, ease: "circOut", delay: 0.2 }}
                              className="h-full bg-emerald-500/40 ml-1 rounded-full" 
                            />
                        </div>
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                           <span className="text-indigo-400">User Share ({( (userReceives / totalMarketValue) * 100 ).toFixed(1)}%)</span>
                           <span className="text-emerald-400">Platform Yield ({( (platformProfit / totalMarketValue) * 100 ).toFixed(1)}%)</span>
                        </div>
                    </div>

                    {/* Final Profit Card */}
                    <motion.div 
                      key={platformProfit}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-indigo-600/30"
                    >
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/30">
                             <Coins className="w-8 h-8" />
                          </div>
                          <div className="text-center md:text-left">
                             <p className="text-[11px] font-black text-indigo-100 uppercase tracking-[0.2em]">Net Capital Gain</p>
                             <h3 className="text-5xl font-black text-white tracking-tighter">+{platformProfit.toFixed(4)} <span className="text-2xl opacity-50">B$</span></h3>
                          </div>
                       </div>
                       <button className="px-8 py-4 bg-white rounded-2xl text-indigo-600 font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-xl">
                          Optimiser le Spread
                       </button>
                    </motion.div>
                 </div>
              </div>
           </div>
        </div>

        {/* Right: Modern Market Table */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[48px] shadow-xl shadow-slate-200/60 border border-slate-50 overflow-hidden">
              <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                 <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Market Analysis</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global conversion ROI</p>
                 </div>
                 <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                 </div>
              </div>
              <div className="divide-y divide-slate-50 overflow-y-auto max-h-[640px] custom-scrollbar">
                 {ratesData?.toBSD && Object.entries(ratesData.toBSD).filter(([c]) => ['EUR', 'GBP', 'USD', 'XOF', 'JPY', 'CAD'].includes(c)).sort((a: any, b: any) => b[1] - a[1]).map(([currency, pRate]: [string, any]) => {
                   const mRate = pRate / (1 - commission);
                   const prof = mRate - pRate;
                   
                   return (
                    <div key={currency} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all cursor-default group">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 font-black text-xs group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300">
                             {currency}
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-900">{currency} / B$</p>
                             <p className="text-[9px] font-bold text-emerald-500 uppercase">Rentable</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-black text-slate-900">+{prof.toFixed(currency === 'XOF' ? 6 : 4)}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Profit Direct</p>
                       </div>
                    </div>
                   );
                 })}
              </div>
              <div className="p-8 bg-slate-50/80 border-t border-slate-100">
                 <div className="bg-indigo-600 rounded-3xl p-6 text-white space-y-4 shadow-lg shadow-indigo-200">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 underline underline-offset-4">Insight du jour</p>
                    <p className="text-xs font-bold leading-relaxed">
                       "Le volume transactionnel en EUR a augmenté de 12%. Envisagez de réduire le spread à 1.8% pour attirer plus de baleines."
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
