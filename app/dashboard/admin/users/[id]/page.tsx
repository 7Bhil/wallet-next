"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  CreditCard,
  Lock,
  Unlock,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { formatLocal } from "@/utils/currency";
import { useAuth } from "@/context/AuthContext";

export default function AdminUserAuditPage() {
  const { user: adminUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const fetchUserDetails = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch user details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const handleToggleStatus = async () => {
    if (!data?.user) return;
    setToggling(true);
    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        `http://localhost:5000/admin/users/${userId}/toggle-status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchUserDetails();
    } catch (err) {
      console.error("Toggle failed", err);
    } finally {
      setToggling(false);
    }
  };

  if (adminUser?.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Lock className="w-12 h-12 text-slate-200" />
        <p className="text-slate-500 font-bold">Accès refusé.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { user, cards, transactions } = data || {};
  const isBlocked = user?.status === "BLOCKED";
  const totalCardBalance = (cards || []).reduce((acc: number, c: any) => acc + (c.cardBalance || 0), 0);
  const totalAssets = (user?.balance || 0) + totalCardBalance;

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500">
      {/* Back Button + Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au Terminal
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-xl font-black text-slate-500 uppercase">
              {user?.fullName?.slice(0, 2)}
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{user?.fullName}</h1>
              <p className="text-sm text-slate-400 font-medium">{user?.email}</p>
            </div>
            <span className={`ml-2 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${isBlocked ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
              {user?.status}
            </span>
          </div>
        </div>

        {/* Toggle Block Button */}
        {adminUser?.id !== userId && (
          <button
            onClick={handleToggleStatus}
            disabled={toggling}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
              isBlocked
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                : "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
            }`}
          >
            {isBlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {isBlocked ? "Débloquer l'utilisateur" : "Bloquer l'utilisateur"}
          </button>
        )}
      </div>

      {/* Asset Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Coffre-fort (Principal)", value: formatLocal(user?.balance || 0, user?.currency || 'USD'), icon: Shield, highlight: true },
          { label: "Total des Cartes", value: formatLocal(totalCardBalance, user?.currency || 'USD'), icon: CreditCard },
          { label: "Actifs Totaux", value: formatLocal(totalAssets, user?.currency || 'USD'), icon: Wallet },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`p-8 rounded-[32px] border flex flex-col justify-between h-44 ${
              item.highlight
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-100 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className={`text-[10px] font-bold uppercase tracking-widest ${item.highlight ? "text-slate-400" : "text-slate-400"}`}>
                {item.label}
              </p>
              <div className={`p-2 rounded-xl ${item.highlight ? "bg-white/10" : "bg-slate-50"}`}>
                <item.icon className={`w-4 h-4 ${item.highlight ? "text-white" : "text-slate-400"}`} />
              </div>
            </div>
            <p className="text-2xl font-black tracking-tight">{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Cards List */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Cartes de l'utilisateur</h2>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">{cards?.length || 0} carte(s) active(s)</p>
        </div>
        {cards?.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold">Aucune carte créée.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {cards.map((card: any, i: number) => (
              <div key={card._id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-600 rounded-2xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{card.name || `Carte ${i + 1}`}</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                      {card.isDefault ? "Carte principale" : "Secondaire"} •{" "}
                      {card.isFrozen ? (
                        <span className="text-red-400">Gelée</span>
                      ) : (
                        <span className="text-emerald-500">Active</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">{formatLocal(card.cardBalance || 0, user?.currency || 'USD')}</p>
                  <p className="text-[10px] text-slate-400">Solde</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Historique des Transactions</h2>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Les 50 dernières transactions</p>
        </div>
        {transactions?.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold">Aucune transaction.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
            {transactions.map((tx: any) => {
              const isCredit = ["TOPUP", "TRANSFER_IN"].includes(tx.type);
              return (
                <div key={tx._id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCredit ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"}`}>
                      {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{tx.description}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {tx.type} • {new Date(tx.createdAt).toLocaleString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${isCredit ? "text-emerald-600" : "text-slate-700"}`}>
                      {isCredit ? "+" : "-"}{formatLocal(tx.amount, tx.targetCurrency || user?.currency || 'USD')}
                    </p>
                    <span className={`text-[9px] font-bold uppercase ${tx.status === "SUCCESS" ? "text-emerald-500" : "text-red-400"}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
