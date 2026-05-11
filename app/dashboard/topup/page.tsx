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
import api from "@/utils/api";
import { CURRENCY_SYMBOLS, convertToBSD, formatBSD, formatLocal } from "@/utils/currency";

export default function TopUp() {
  const { user, refreshUser } = useAuth();
  const [amount, setAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState(user?.currency || "USD");
  const [method, setMethod] = useState("Bank Transfer");
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  React.useEffect(() => {
    if (user?.currency) setSelectedCurrency(user.currency);
    
    // Fetch rates for preview
    const fetchRates = async () => {
      try {
        const res = await axios.get("http://localhost:5000/currency/rates");
        setRates(res.data);
      } catch (e) {
        console.error("Rates fetch failed", e);
      }
    };
    fetchRates();
  }, [user]);

  const [phoneNumber, setPhoneNumber] = useState("");

  const fees = {
    "MTN Mobile Money": 0.01,
    "Moov Money": 0.01,
    "Bank Transfer": 0.01,
    "Credit Card": 0.03,
  };

  const isMobileMoney = method.includes("Mobile Money") || method.includes("Moov");

  const currentFee = fees[method as keyof typeof fees];
  const inputAmount = parseFloat(amount) || 0;
  const calculatedFee = inputAmount * currentFee;
  const netLocalAmount = inputAmount - calculatedFee;
  
  // Calculate what user will receive in their NATIVE currency
  const userCurrency = user?.currency || 'USD';
  const getArrivalAmount = () => {
    if (!rates || !rates.fiatRates) return netLocalAmount;
    const rateFrom = rates.fiatRates[selectedCurrency] || 1;
    const rateTo = rates.fiatRates[userCurrency] || 1;
    return (netLocalAmount / rateFrom) * rateTo;
  };

  const arrivalAmount = getArrivalAmount();

  const handleRecharge = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    if (isMobileMoney) {
      // @ts-ignore
      const { openKkiapayWidget } = await import("kkiapay-react");
      openKkiapayWidget({
        amount: parseInt(amount),
        api_key: process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY,
        sandbox: true,
        phone: phoneNumber || undefined,
        data: `Recharge via ${method}`,
        callback: async (response: any) => {
          if (response.status === "SUCCESS") {
            setLoading(true);
            try {
              const token = localStorage.getItem("token");
              await axios.post("http://localhost:5000/transactions/recharge/verify", {
                transactionId: response.transactionId,
                amount: parseFloat(amount),
                currency: selectedCurrency,
              }, {
                headers: { Authorization: `Bearer ${token}` }
              });
              await refreshUser();
              setMessage({ type: 'success', text: "Paiement Kkiapay réussi ! Votre compte a été crédité." });
              setAmount("");
              setPhoneNumber("");
            } catch (e) {
              setMessage({ type: 'error', text: "Erreur lors de la validation du paiement." });
            } finally {
              setLoading(false);
            }
          }
        }
      });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/transactions/recharge", {
        amount: parseFloat(amount),
        currency: selectedCurrency,
        description: `Recharge via ${method}`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await refreshUser();
      setMessage({ type: 'success', text: `Recharge de ${amount} ${selectedCurrency} réussie !` });
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
        <p className="text-sm text-slate-500">Ajoutez des fonds instantanément via Mobile Money ou Carte.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-12 space-y-8">
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'bg-red-50 text-red-600'}`}
            >
              {message.text}
            </motion.div>
          )}

          <div className="bg-white p-8 lg:p-10 rounded-[40px] shadow-sm border border-slate-50 space-y-10">
            {/* Amount Input */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Montant à ajouter</label>
              <div className="relative flex items-center justify-between border-b-2 border-slate-100 focus-within:border-[var(--accent)] transition-colors pb-2">
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 text-3xl sm:text-5xl lg:text-6xl font-bold bg-transparent border-none focus:ring-0 text-slate-900 placeholder:text-slate-100 p-0 min-w-0"
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
               {[500, 2000, 5000, 10000].map((val) => (
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
               <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { name: "MTN Mobile Money", color: "bg-[#FFCC00]", text: "text-blue-900", logo: "MTN" },
                    { name: "Moov Money", color: "bg-[#005DA4]", text: "text-white", logo: "Moov" },
                    { name: "Bank Transfer", color: "bg-slate-100", text: "text-slate-900", logo: "🏦" },
                    { name: "Credit Card", color: "bg-slate-900", text: "text-white", logo: "💳" }
                  ].map((m) => {
                    const isSelected = method === m.name;
                    return (
                      <button 
                        key={m.name}
                        onClick={() => setMethod(m.name)}
                        className={`p-4 rounded-2xl border-2 flex flex-col gap-2 transition-all text-left relative overflow-hidden ${isSelected ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/10" : "border-slate-50 hover:border-slate-200"}`}
                      >
                        <div className={`w-8 h-8 rounded-lg ${m.color} ${m.text} flex items-center justify-center font-black text-[8px] mb-1 shadow-sm`}>
                          {m.logo}
                        </div>
                        <span className="text-[10px] font-black text-slate-900 truncate">{m.name}</span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Frais: {(fees[m.name as keyof typeof fees] * 100)}%</span>
                        {isSelected && <div className="absolute top-2 right-2 w-2 h-2 bg-[var(--accent)] rounded-full" />}
                      </button>
                    );
                  })}
               </div>
            </div>

            {/* Phone Number Input for Mobile Money */}
            {isMobileMoney && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-3 pt-4 border-t border-slate-50"
              >
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Numéro de téléphone Bénin</label>
                <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">+229</div>
                   <input 
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="Numéro à 8 chiffres"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-[var(--accent)] rounded-2xl px-16 py-4 text-slate-900 font-bold outline-none transition-all"
                   />
                </div>
                <p className="text-[9px] text-slate-400 font-medium ml-1">Une demande de confirmation sera envoyée sur ce numéro.</p>
              </motion.div>
            )}

            {/* Summary Block */}
            <div className="rounded-3xl border border-[var(--card-border)] overflow-hidden">
               {/* Fees row */}
               <div className="flex justify-between items-center px-6 py-4 bg-[var(--nav-active)]">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Frais de traitement</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-[var(--card-border)] text-[var(--muted)] font-bold">{(currentFee * 100).toFixed(0)}%</span>
                  </div>
                  <span className="text-sm font-bold text-[var(--muted)]">- {calculatedFee.toFixed(2)} {selectedCurrency}</span>
               </div>

               {/* Divider */}
               <div className="h-px bg-[var(--card-border)]" />

               {/* You receive row */}
               <div className="flex justify-between items-center px-6 py-5 bg-[var(--card-bg)]">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] mb-0.5">Vous recevrez</p>
                    <span className="text-2xl font-black text-[var(--accent)] tracking-tight">{formatLocal(arrivalAmount, userCurrency)}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-[var(--muted)] font-medium">{netLocalAmount.toFixed(2)} {selectedCurrency}</p>
                    <p className="text-[9px] text-[var(--muted)] font-medium">spread plateforme: 2%</p>
                  </div>
               </div>
            </div>

            <button 
              onClick={handleRecharge}
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="w-full bg-[var(--accent)] text-white py-5 rounded-2xl text-base font-bold shadow-xl shadow-[var(--accent)]/10 hover:bg-[var(--accent-hover)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? "Traitement..." : "Confirmer la Recharge"}
              <ArrowUpRight className="w-5 h-5" />
            </button>
            
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
               <ShieldCheck className="w-3.5 h-3.5" />
               Transaction Sécurisée par Wallet
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
