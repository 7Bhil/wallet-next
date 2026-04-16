"use client";

import React, { useState, useEffect } from "react";
import {
  Send,
  ArrowRight,
  ArrowLeftRight,
  User,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { formatBSD } from "@/utils/currency";
import { useAuth } from "@/context/AuthContext";

type Tab = "user" | "card";
type Feedback = { type: "success" | "error"; text: string } | null;

export default function SendPage() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState<Tab>("user");

  // --- User transfer state ---
  const [recipientEmail, setRecipientEmail] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendNote, setSendNote] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [sendFeedback, setSendFeedback] = useState<Feedback>(null);

  // --- Card transfer state ---
  const [cards, setCards] = useState<any[]>([]);
  const [fromCard, setFromCard] = useState("");
  const [toCard, setToCard] = useState("");
  const [cardAmount, setCardAmount] = useState("");
  const [cardLoading, setCardLoading] = useState(false);
  const [cardFeedback, setCardFeedback] = useState<Feedback>(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/cards/my", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCards(res.data);
        if (res.data.length >= 1) setFromCard(res.data[0]._id);
        if (res.data.length >= 2) setToCard(res.data[1]._id);
      } catch (e) {
        console.error("Error fetching cards", e);
      }
    };
    fetchCards();
  }, []);

  const handleUserTransfer = async () => {
    if (!recipientEmail || !sendAmount) return;
    setSendLoading(true);
    setSendFeedback(null);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/transactions/transfer",
        { recipientEmail, amount: parseFloat(sendAmount), note: sendNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await refreshUser();
      setSendFeedback({
        type: "success",
        text: `${formatBSD(parseFloat(sendAmount))} envoyés avec succès à ${recipientEmail} !`
      });
      setRecipientEmail("");
      setSendAmount("");
      setSendNote("");
    } catch (err: any) {
      setSendFeedback({
        type: "error",
        text: err?.response?.data?.message || "Erreur lors du transfert."
      });
    } finally {
      setSendLoading(false);
    }
  };

  const handleCardTransfer = async () => {
    if (!fromCard || !toCard || !cardAmount) return;
    setCardLoading(true);
    setCardFeedback(null);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/cards/transfer",
        { fromCardId: fromCard, toCardId: toCard, amount: parseFloat(cardAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const res = await axios.get("http://localhost:5000/cards/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCards(res.data);
      setCardFeedback({ type: "success", text: `Transfert de ${formatBSD(parseFloat(cardAmount))} effectué !` });
      setCardAmount("");
    } catch (err: any) {
      setCardFeedback({
        type: "error",
        text: err?.response?.data?.message || "Erreur lors du transfert entre cartes."
      });
    } finally {
      setCardLoading(false);
    }
  };

  const getCardName = (id: string) => cards.find(c => c._id === id)?.name || "—";
  const getCardBalance = (id: string) => {
    const c = cards.find(c => c._id === id);
    return c ? formatBSD(c.cardBalance || 0) : "—";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Envoyer</h1>
        <p className="text-sm text-slate-500">Transférez des B$ à un autre utilisateur ou entre vos propres cartes.</p>
      </div>

      {/* Solde rapide */}
      <div className="bg-[#F1F4FF] rounded-[28px] px-8 py-5 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Votre Solde Disponible</p>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{formatBSD(user?.balance || 0)}</p>
        </div>
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
          <Send className="w-5 h-5 text-emerald-600" />
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="bg-slate-100 rounded-2xl p-1.5 flex gap-1.5">
        <button
          onClick={() => setTab("user")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
            tab === "user" ? "bg-white shadow-sm text-slate-900" : "text-slate-400"
          }`}
        >
          <User className="w-4 h-4" />
          Envoyer à un utilisateur
        </button>
        <button
          onClick={() => setTab("card")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
            tab === "card" ? "bg-white shadow-sm text-slate-900" : "text-slate-400"
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          Entre mes cartes
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {tab === "user" && (
          <motion.div
            key="user"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-[40px] p-8 md:p-10 space-y-8 border border-slate-50 shadow-sm"
          >
            {/* Feedback */}
            <AnimatePresence>
              {sendFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${
                    sendFeedback.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                  }`}
                >
                  {sendFeedback.type === "success" ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                  {sendFeedback.text}
                  <button onClick={() => setSendFeedback(null)} className="ml-auto"><X className="w-4 h-4" /></button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email du destinataire</label>
              <input
                type="email"
                value={recipientEmail}
                onChange={e => setRecipientEmail(e.target.value)}
                placeholder="user@exemple.com"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-5 py-4 text-slate-900 font-bold text-sm placeholder:text-slate-300 outline-none transition-colors"
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Montant (B$)</label>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-black text-slate-300">B$</span>
                <input
                  type="number"
                  value={sendAmount}
                  onChange={e => setSendAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 text-4xl font-black bg-transparent border-none focus:ring-0 text-slate-900 placeholder:text-slate-100 outline-none p-0"
                />
              </div>
              <div className="flex gap-2 flex-wrap mt-2">
                {[10, 50, 100, 500].map(v => (
                  <button key={v} onClick={() => setSendAmount(v.toString())}
                    className="px-4 py-1.5 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold hover:bg-slate-900 hover:text-white transition-all">
                    +B${v}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Note (optionnel)</label>
              <input
                type="text"
                value={sendNote}
                onChange={e => setSendNote(e.target.value)}
                placeholder="Remboursement repas, cadeau…"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-5 py-4 text-slate-900 font-bold text-sm placeholder:text-slate-300 outline-none transition-colors"
              />
            </div>

            <button
              onClick={handleUserTransfer}
              disabled={sendLoading || !recipientEmail || !sendAmount}
              className="w-full bg-[#065F46] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#047857] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-emerald-900/10"
            >
              {sendLoading ? "Envoi en cours…" : <>Envoyer <ArrowRight className="w-5 h-5" /></>}
            </button>
          </motion.div>
        )}

        {tab === "card" && (
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-[40px] p-8 md:p-10 space-y-8 border border-slate-50 shadow-sm"
          >
            <AnimatePresence>
              {cardFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${
                    cardFeedback.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                  }`}
                >
                  {cardFeedback.type === "success" ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                  {cardFeedback.text}
                  <button onClick={() => setCardFeedback(null)} className="ml-auto"><X className="w-4 h-4" /></button>
                </motion.div>
              )}
            </AnimatePresence>

            {cards.length < 2 ? (
              <div className="py-10 text-center text-slate-400 flex flex-col items-center gap-3">
                <CreditCard className="w-10 h-10 opacity-40" />
                <p className="font-bold text-sm">Vous avez besoin d'au moins 2 cartes pour effectuer un transfert entre cartes.</p>
              </div>
            ) : (
              <>
                {/* From card */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Depuis la carte</label>
                  <div className="relative">
                    <select
                      value={fromCard}
                      onChange={e => setFromCard(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-5 py-4 text-slate-900 font-bold text-sm outline-none transition-colors"
                    >
                      {cards.map(c => (
                        <option key={c._id} value={c._id} disabled={c._id === toCard}>
                          {c.name} — Solde: {formatBSD(c.cardBalance || 0)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <ArrowLeftRight className="w-5 h-5" />
                  </div>
                </div>

                {/* To card */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vers la carte</label>
                  <div className="relative">
                    <select
                      value={toCard}
                      onChange={e => setToCard(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-5 py-4 text-slate-900 font-bold text-sm outline-none transition-colors"
                    >
                      {cards.map(c => (
                        <option key={c._id} value={c._id} disabled={c._id === fromCard}>
                          {c.name} — Solde: {formatBSD(c.cardBalance || 0)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Montant (B$)</label>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-black text-slate-300">B$</span>
                    <input
                      type="number"
                      value={cardAmount}
                      onChange={e => setCardAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 text-4xl font-black bg-transparent border-none focus:ring-0 text-slate-900 placeholder:text-slate-100 outline-none p-0"
                    />
                  </div>
                </div>

                {/* Summary */}
                {fromCard && toCard && cardAmount && parseFloat(cardAmount) > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-slate-50 rounded-2xl p-5 space-y-2"
                  >
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>De</span><span>{getCardName(fromCard)} ({getCardBalance(fromCard)})</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>Vers</span><span>{getCardName(toCard)} ({getCardBalance(toCard)})</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-100 pt-2 mt-2">
                      <span>Montant</span><span className="text-emerald-600">{formatBSD(parseFloat(cardAmount))}</span>
                    </div>
                  </motion.div>
                )}

                <button
                  onClick={handleCardTransfer}
                  disabled={cardLoading || !fromCard || !toCard || !cardAmount || fromCard === toCard}
                  className="w-full bg-[#065F46] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#047857] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-emerald-900/10"
                >
                  {cardLoading ? "Transfert en cours…" : <>Transférer <ArrowRight className="w-5 h-5" /></>}
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
