"use client";

import React, { useState, useEffect } from "react";
import { Calculator, ArrowLeftRight, Info } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

interface ReverseCalculatorProps {
  onCalculate?: (amount: number) => void;
}

import { useAuth } from "@/context/AuthContext";

export default function ReverseCalculator({ onCalculate }: ReverseCalculatorProps) {
  const { user } = useAuth();
  const [targetCurrency, setTargetCurrency] = useState("XOF");
  const [inputValue, setInputValue] = useState<number>(1000);
  const [mode, setMode] = useState<"TARGET" | "SOURCE">("TARGET");
  
  const [result, setResult] = useState<number | null>(null);
  const [rates, setRates] = useState<any>(null);

  const sourceCurrency = user?.currency || "USD";

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const res = await axios.get("http://localhost:5000/currency/rates");
      setRates(res.data);
    } catch (err) {
      console.error("Failed to fetch rates", err);
    }
  };

  useEffect(() => {
    if (rates && rates.fiatRates) {
      const rateSource = rates.fiatRates[sourceCurrency] || 1;
      const rateTarget = rates.fiatRates[targetCurrency] || 1;
      const commission = rates.commission || 0.02;
      
      if (mode === "TARGET") {
        // I want them to receive "inputValue" [targetCurrency]. 
        // How much [sourceCurrency] do I need?
        // amtTarget = (amtSource / rateSource) * rateTarget * (1 - comm)
        // => amtSource = (amtTarget * rateSource) / (rateTarget * (1 - comm))
        const neededSource = (inputValue * rateSource) / (rateTarget * (1 - commission));
        setResult(neededSource);
      } else {
        // I send "inputValue" [sourceCurrency]. 
        // How many [targetCurrency] will they receive?
        const receivedTarget = (inputValue / rateSource) * rateTarget * (1 - commission);
        setResult(receivedTarget);
      }
    }
  }, [targetCurrency, inputValue, rates, mode, sourceCurrency]);

  return (
    <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg shadow-slate-900/20">
            <Calculator className="w-4 h-4 text-white" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Calculateur de Frais</h4>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-slate-50 p-1 rounded-xl">
          <button 
            onClick={() => setMode("TARGET")}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all uppercase tracking-wider ${mode === "TARGET" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400"}`}
          >
            Objectif (Cible)
          </button>
          <button 
            onClick={() => setMode("SOURCE")}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all uppercase tracking-wider ${mode === "SOURCE" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}
          >
            Montant (Source)
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Input Form */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">
                {mode === "TARGET" ? "Il (Elle) doit recevoir" : "Vous envoyez"}
              </label>
              <div className="relative">
                <input 
                  type="number"
                  value={inputValue || ""}
                  onChange={(e) => setInputValue(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-5 pr-12 text-xl font-black text-slate-900 focus:border-slate-300 outline-none transition-all placeholder:text-slate-300"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  {mode === "TARGET" ? targetCurrency : sourceCurrency}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Devise du destinataire</label>
              <select 
                value={targetCurrency}
                onChange={(e) => setTargetCurrency(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 text-sm font-bold focus:border-slate-300 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="XOF">XOF - Franc CFA</option>
                <option value="EUR">EUR - Euro</option>
                <option value="USD">USD - Dollar</option>
                <option value="GBP">GBP - Livre</option>
                <option value="CAD">CAD - Dollar Canadien</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Display of Result */}
        <AnimatePresence mode="popLayout">
          {result !== null && (
            <motion.div 
              key={mode}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-6 rounded-2xl border flex items-center justify-between shadow-inner ${
                mode === "TARGET" 
                  ? "bg-emerald-50 border-emerald-100" 
                  : "bg-indigo-50 border-indigo-100"
              }`}
            >
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${mode === "TARGET" ? "text-emerald-500" : "text-indigo-500"}`}>
                  {mode === "TARGET" ? `Montant à débiter (${sourceCurrency})` : `Le destinataire recevra (${targetCurrency})`}
                </p>
                <p className={`text-3xl font-black tracking-tight ${mode === "TARGET" ? "text-emerald-700" : "text-indigo-700"}`}>
                  {result.toFixed(2)} {mode === "TARGET" ? sourceCurrency : targetCurrency}
                </p>
              </div>
              
              {mode === "TARGET" && (
                <button 
                  onClick={() => onCalculate?.(Number(result.toFixed(2)))}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all uppercase tracking-wider shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:-translate-y-0.5"
                >
                  Appliquer
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-start gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
            Note: Transfert direct de {sourceCurrency} vers {targetCurrency}. 
            Le taux inclut une commission de plateforme de {rates?.commission ? rates.commission * 100 : 2}%.
          </p>
        </div>
      </div>
    </div>
  );
}
