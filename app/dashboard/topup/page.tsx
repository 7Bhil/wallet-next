"use client";

import React, { useState } from "react";
import { 
  ArrowUpRight, 
  ShieldCheck, 
  CreditCard,
  Crown,
  Zap,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { CURRENCY_SYMBOLS, convertToBSD, formatBSD } from "@/utils/currency";

export default function TopUp() {
  const { user, refreshUser } = useAuth();
  const [amount, setAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState(user?.currency || "USD");
  const [method, setMethod] = useState("Bank Transfer");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  React.useEffect(() => {
    if (user?.currency) setSelectedCurrency(user.currency);
  }, [user]);

  const fees = {
    "Bank Transfer": 0.01,
    "Credit Card": 0.03,
    "Crypto": 0.05
  };

  const currentFee = fees[method as keyof typeof fees];
  const calculatedFee = (parseFloat(amount) || 0) * currentFee;
  const netLocalAmount = (parseFloat(amount) || 0) - calculatedFee;
  const bsdAmount = convertToBSD(netLocalAmount, selectedCurrency);

  const handleRecharge = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    setLoading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/transactions/recharge", {
        amount: parseFloat(amount),
        currency: selectedCurrency,
        description: `Top-up via ${method}`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await refreshUser();
      setMessage({ type: 'success', text: `Recharge de ${amount} ${selectedCurrency} → ${formatBSD(bsdAmount)} crédités !` });
      setAmount("");
    } catch (error) {
      console.error("Recharge failed:", error);
      setMessage({ type: 'error', text: "Erreur lors de la recharge. Réessayez." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Recharger votre Compte</h1>
        <p className="text-sm text-slate-500">Ajoutez des fonds instantanément à votre portefeuille sécurisé.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-12 space-y-8">
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}
            >
              {message.text}
            </motion.div>
          )}

          <div className="bg-white p-8 lg:p-10 rounded-[40px] shadow-sm border border-slate-50 space-y-10">
            {/* Amount Input */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Montant à ajouter</label>
              <div className="relative flex items-center justify-between border-b-2 border-slate-100 focus-within:border-emerald-500 transition-colors pb-2">
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 text-5xl lg:text-6xl font-bold bg-transparent border-none focus:ring-0 text-slate-900 placeholder:text-slate-100 p-0"
                />
                <select 
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="bg-slate-100 px-4 py-2 rounded-xl text-lg font-bold text-slate-900 border-none focus:ring-0 cursor-pointer"
                >
                  {Object.keys(CURRENCY_SYMBOLS).map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 lg:gap-3">
               {[50, 100, 500, 1000].map((val) => (
                 <button 
                  key={val}
                  onClick={() => setAmount(prev => (parseFloat(prev || "0") + val).toString())}
                  className="px-4 lg:px-6 py-2 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold hover:bg-slate-900 hover:text-white transition-all outline-none"
                 >
                   +{val}{CURRENCY_SYMBOLS[selectedCurrency]}
                 </button>
               ))}
            </div>

            <div className="h-px bg-slate-100" />

            {/* Method Selector */}
            <div className="space-y-4">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Méthode de paiement</label>
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.keys(fees).map((m) => {
                    const isSelected = method === m;
                    return (
                      <button 
                        key={m}
                        onClick={() => setMethod(m)}
                        className={`p-5 rounded-3xl border-2 flex flex-col gap-3 transition-all text-left ${isSelected ? "border-emerald-600 bg-emerald-50/30" : "border-slate-50 hover:border-slate-200"}`}
                      >
                        <span className="text-xs font-bold text-slate-900">{m}</span>
                        <span className="text-[10px] text-slate-400 font-medium">Frais: {(fees[m as keyof typeof fees] * 100)}%</span>
                      </button>
                    );
                  })}
               </div>
            </div>

            <div className="bg-slate-50/50 p-6 rounded-3xl space-y-3">
               <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>Frais de traitement ({(currentFee * 100).toFixed(0)}%)</span>
                  <span>- {calculatedFee.toFixed(2)} {selectedCurrency}</span>
               </div>
               <div className="h-px bg-slate-100" />
               <div className="flex justify-between text-lg font-bold text-slate-900">
                  <span>Vous recevrez</span>
                  <span className="text-emerald-600">{formatBSD(bsdAmount)}</span>
               </div>
               <p className="text-[10px] text-slate-400 font-medium">
                 {netLocalAmount.toFixed(2)} {selectedCurrency} converti au taux 1 {selectedCurrency} = {formatBSD(convertToBSD(1, selectedCurrency))}
               </p>
            </div>

            <button 
              onClick={handleRecharge}
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="w-full bg-[#065F46] text-white py-5 rounded-2xl text-base font-bold shadow-xl shadow-emerald-900/10 hover:bg-[#047857] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? "Traitement..." : "Confirmer la Recharge"}
              <ArrowUpRight className="w-5 h-5" />
            </button>
            
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
               <ShieldCheck className="w-3.5 h-3.5" />
               Transaction Sécurisée par Wallora
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
