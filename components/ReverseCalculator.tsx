"use client";

import React, { useState, useEffect } from "react";
import { Calculator, ArrowRight, Info, Copy } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

interface ReverseCalculatorProps {
  onCalculate?: (amount: number) => void;
}

export default function ReverseCalculator({ onCalculate }: ReverseCalculatorProps) {
  const [targetCurrency, setTargetCurrency] = useState("XOF");
  const [targetAmount, setTargetAmount] = useState<number>(1000);
  const [requiredBSD, setRequiredBSD] = useState<number | null>(null);
  const [rates, setRates] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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
    if (rates && rates.toBSD && rates.toBSD[targetCurrency]) {
      const platformRate = rates.toBSD[targetCurrency];
      const result = targetAmount / platformRate;
      setRequiredBSD(result);
    }
  }, [targetCurrency, targetAmount, rates]);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          <Calculator className="w-4 h-4 text-white" />
        </div>
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Simulateur d'envoi</h4>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Recevoir (Local)</label>
            <input 
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold focus:border-slate-300 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Devise cible</label>
            <select 
              value={targetCurrency}
              onChange={(e) => setTargetCurrency(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold outline-none"
            >
              <option value="XOF">XOF - Franc CFA</option>
              <option value="EUR">EUR - Euro</option>
              <option value="USD">USD - Dollar</option>
              <option value="GBP">GBP - Livre</option>
              <option value="CAD">CAD - Dollar Canadien</option>
            </select>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {requiredBSD !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between"
            >
              <div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase">Vous devez envoyer</p>
                <p className="text-xl font-black text-emerald-700">{requiredBSD.toFixed(2)} B$</p>
              </div>
              <button 
                onClick={() => onCalculate?.(Number(requiredBSD.toFixed(2)))}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-bold hover:bg-emerald-700 transition-colors uppercase"
              >
                Utiliser ce montant
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 p-3 bg-slate-50 rounded-xl">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
            Ce calcul inclut déjà les frais de conversion de la plateforme (2%). Le destinataire recevra exactement le montant local indiqué.
          </p>
        </div>
      </div>
    </div>
  );
}
