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
  DollarSign
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
    <div className="max-w-[1200px] mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
             <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Analyse de Rentabilité</h1>
        </div>
        <p className="text-sm font-medium text-slate-400 pl-15">Simulateur de revenus et surveillance des marges de change.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Interactive Simulator */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-8">
           <div className="bg-white rounded-[44px] p-8 md:p-12 shadow-2xl shadow-slate-200 border border-slate-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
              
              <div className="relative space-y-10">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Calculator className="w-5 h-5 text-indigo-600" />
                       <h3 className="text-xl font-black text-slate-900">Simulateur de Profit</h3>
                    </div>
                    <div className="px-4 py-1.5 bg-indigo-50 rounded-xl text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                       Spread Actuel: {(commission * 100).toFixed(1)}%
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Montant à simuler</label>
                       <div className="relative group">
                          <input 
                            type="number" 
                            value={simAmount}
                            onChange={(e) => setSimAmount(Number(e.target.value))}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] py-6 px-8 text-2xl font-black text-slate-900 focus:border-indigo-600 outline-none transition-all"
                          />
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Unité</div>
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Devise locale</label>
                       <select 
                        value={simCurrency}
                        onChange={(e) => setSimCurrency(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] py-6 px-8 text-xl font-black text-slate-900 appearance-none focus:border-indigo-600 outline-none transition-all cursor-pointer"
                       >
                          {ratesData?.toBSD && Object.keys(ratesData.toBSD).map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                       </select>
                    </div>
                 </div>

                 {/* Results Visualization */}
                 <div className="bg-slate-900 rounded-[36px] p-8 md:p-12 space-y-10 text-white shadow-2xl shadow-indigo-500/20">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                       <div className="text-center md:text-left space-y-1">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Valeur Marché Réelle</p>
                          <h4 className="text-2xl font-black">B$ {totalMarketValue.toFixed(4)}</h4>
                       </div>
                       <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center rotate-90 md:rotate-0">
                          <ArrowRight className="w-5 h-5 text-indigo-400" />
                       </div>
                       <div className="text-center md:text-right space-y-1">
                          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Attribué à l'Utilisateur</p>
                          <h4 className="text-2xl font-black text-emerald-400">B$ {userReceives.toFixed(4)}</h4>
                       </div>
                    </div>

                    <div className="h-px bg-white/10 w-full" />

                    <div className="flex items-center justify-between bg-white/5 rounded-3xl p-6 border border-white/5">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/40">
                             <Coins className="w-6 h-6 text-white" />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Profit Net Wallet</p>
                             <h3 className="text-3xl font-black text-white">+{platformProfit.toFixed(4)} B$</h3>
                          </div>
                       </div>
                       <Zap className="w-8 h-8 text-indigo-500 fill-indigo-500 opacity-20 hidden sm:block" />
                    </div>
                 </div>
              </div>
           </div>

           {/* Infographic/Explanation */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-4">
                 <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                    <Info className="w-5 h-5 text-orange-600" />
                 </div>
                 <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Comment optimiser ?</h4>
                 <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Plus le volume de transactions est élevé, plus le profit cumulé devient significatif. Augmenter le spread à **3%** doublerait le profit, mais pourrait réduire la satisfaction utilisateur.
                 </p>
              </div>
              <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-4">
                 <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <Target className="w-5 h-5 text-indigo-600" />
                 </div>
                 <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Objectif Financier</h4>
                 <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    En atteignant **10 000 B$** de volume quotidien, ce spread de 2% seul génère environ **200 B$** de profit passif par jour.
                 </p>
              </div>
           </div>
        </div>

        {/* Right: All Currencies ROI Table */}
        <div className="lg:col-span-12 xl:col-span-5">
           <div className="bg-white rounded-[44px] shadow-2xl shadow-slate-200 border border-slate-50 overflow-hidden h-full">
              <div className="p-8 border-b border-slate-50">
                 <h3 className="text-lg font-black text-slate-900">Analyse par Devise</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Rentabilité par unité (B$)</p>
              </div>
              <div className="divide-y divide-slate-50 overflow-y-auto max-h-[700px]">
                 {ratesData?.toBSD && Object.entries(ratesData.toBSD).sort((a: any, b: any) => b[1] - a[1]).map(([currency, pRate]: [string, any]) => {
                   const mRate = pRate / (1 - commission);
                   const isPromoted = ['EUR', 'GBP', 'USD', 'XOF'].includes(currency);
                   
                   return (
                    <div key={currency} className={`p-6 flex items-center justify-between group hover:bg-slate-50 transition-all ${isPromoted ? 'bg-indigo-50/20' : ''}`}>
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${isPromoted ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                             {currency.slice(0, 1)}
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-900">{currency}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase">ROI: +{(commission * 100).toFixed(0)}%</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-black text-indigo-600">+{(mRate - pRate).toFixed(currency === 'XOF' ? 6 : 4)}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Profit / Unité</p>
                       </div>
                    </div>
                   );
                 })}
              </div>
              <div className="p-6 bg-slate-50 flex items-center justify-center">
                 <button onClick={fetchRates} className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">
                    <RefreshCw className="w-3 h-3" />
                    Rafraichir les taux
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
