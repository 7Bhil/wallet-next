"use client";

import React from "react";
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wifi, 
  Smartphone,
  CheckCircle2,
  Wallet,
  ShieldCheck,
  CreditCard as CardIcon
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import { formatBSD, formatLocal } from "@/utils/currency";

export default function Dashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [cards, setCards] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [txnRes, cardRes] = await Promise.all([
          api.get("/transactions/my"),
          api.get("/cards/my")
        ]);
        
        setTransactions(txnRes.data.slice(0, 3));
        setCards(cardRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const vaultFiat = user?.balance || 0;
  const cardsFiat = cards.reduce((acc, c) => acc + (c.cardBalance || 0), 0);
  const totalFiat = vaultFiat + cardsFiat;
  const userCurrency = user?.currency || 'USD';

  const getIcon = (type: string) => {
    switch (type) {
      case 'TOPUP': return ArrowDownLeft;
      case 'PAYMENT': return Smartphone;
      case 'FEE': return CheckCircle2;
      case 'TRANSFER_IN': return ArrowDownLeft;
      case 'TRANSFER_OUT': return ArrowUpRight;
      case 'CRYPTO_BUY': return Wallet;
      case 'CRYPTO_SELL': return Wallet;
      default: return ArrowUpRight;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'TOPUP': return "bg-[var(--accent-soft)]";
      case 'PAYMENT': return "bg-slate-100";
      case 'FEE': return "bg-orange-50";
      case 'TRANSFER_IN': return "bg-[var(--accent-soft)]";
      case 'CRYPTO_BUY': return "bg-[var(--nav-active)]";
      default: return "bg-slate-50";
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Balance Section */}
        <div className="lg:col-span-8 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[32px] p-8 flex flex-col justify-between shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Solde Disponible ({userCurrency})</p>
              <h2 className="text-4xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight leading-none">
                {formatLocal(totalFiat, userCurrency)}
              </h2>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard/topup" className="flex items-center justify-center gap-2 bg-[var(--accent)] text-white px-5 py-3 rounded-xl text-xs font-bold hover:bg-[var(--accent-hover)] transition-all group shadow-lg shadow-[var(--accent)]/10">
                <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
                Recharger
              </Link>
              <Link href="/dashboard/send" className="flex items-center justify-center gap-2 bg-black text-white px-5 py-3 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
                <ArrowUpRight className="w-3.5 h-3.5" />
                Envoyer
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vos Portefeuilles</h4>
            <div className="flex flex-wrap gap-4">
               {/* Crypto Wallet (B$) */}
               <div className="bg-[#1e293b] p-4 rounded-2xl min-w-[160px] flex-1 border border-slate-800 shadow-xl">
                  <div className="flex items-center gap-2 text-[var(--accent)] mb-2">
                     <div className="w-4 h-4 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[10px] font-bold italic text-[var(--accent)]">B</div>
                     <span className="text-[9px] font-black uppercase tracking-tighter">Crypto Wallet</span>
                  </div>
                  <p className="text-lg font-black text-white">{formatBSD(user?.cryptoBalance || 0)}</p>
               </div>

               {/* Vault Wallet (Local) */}
               <div className="bg-[var(--accent-soft)] p-4 rounded-2xl min-w-[160px] flex-1 border border-[var(--card-border)] shadow-sm">
                  <div className="flex items-center gap-2 text-[var(--accent)] mb-2">
                     <ShieldCheck className="w-4 h-4" />
                     <span className="text-[9px] font-black uppercase tracking-tighter">Coffre-fort ({userCurrency})</span>
                  </div>
                  <p className="text-lg font-black text-[var(--foreground)]">{formatLocal(vaultFiat, userCurrency)}</p>
               </div>

               {/* Card Wallets */}
               {cards.map(card => (
                 <div key={card._id} className="bg-[var(--nav-active)] p-4 rounded-2xl min-w-[160px] flex-1 border border-[var(--card-border)]">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                       <CardIcon className="w-4 h-4" />
                       <span className="text-[9px] font-black uppercase tracking-tighter truncate max-w-[100px]">{card.name}</span>
                    </div>
                    <p className="text-lg font-black text-[var(--foreground)]">{formatLocal(card.cardBalance || 0, userCurrency)}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
        {/* ... Card Section stays the same ... */}
        {/* Featured Card */}
        {(() => {
          const defaultCard = cards.find(c => c._id === user?.defaultCardId) || cards[0];
          const hasCard = !!defaultCard;
          
          const isLegacy = hasCard && (!defaultCard.color || defaultCard.color.startsWith('from-'));
          const cardColor = hasCard 
            ? (isLegacy ? (defaultCard.type === 'STANDARD' ? 'card-premium-blue' : defaultCard.type === 'PREMIUM' ? 'card-lustrous-gold' : 'card-glossy-black') : defaultCard.color)
            : 'card-glossy-black';
          
          const cardTextColor = hasCard 
            ? (isLegacy ? (defaultCard.type === 'PREMIUM' ? 'text-amber-950' : 'text-white') : defaultCard.text)
            : 'text-white';

          return (
            <motion.div 
              whileHover={{ y: -5 }}
              className={`lg:col-span-4 ${cardColor} rounded-[32px] p-8 ${cardTextColor} relative overflow-hidden flex flex-col justify-between aspect-square lg:aspect-auto shadow-xl`}
            >
              {hasCard && defaultCard.type === 'VIP MEMBER' && <div className="glossy-reflection" />}
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-[9px] font-bold opacity-60 uppercase tracking-widest mb-0.5">
                    {hasCard ? "Carte Par Défaut" : "Aucune Carte"}
                  </p>
                  <h3 className="text-xl font-black tracking-tight">{hasCard ? defaultCard.name : "Wallet Shield"}</h3>
                  {hasCard && <p className="text-[9px] font-bold opacity-80 uppercase mt-0.5">{defaultCard.type}</p>}
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <Wifi className="w-5 h-5 rotate-90 opacity-60" />
                </div>
              </div>

              <div className="relative z-10 pt-4">
                <div className="flex gap-3 text-lg tracking-[0.2em] font-mono opacity-80 mb-5">
                  <span>••••</span>
                  <span>••••</span>
                  <span>••••</span>
                  <span>{hasCard ? defaultCard.number.slice(-4) : "0000"}</span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[9px] uppercase opacity-40 font-bold mb-0.5">Exp</p>
                    <p className="text-xs font-semibold">{hasCard ? defaultCard.exp : "00/00"}</p>
                  </div>
                  {hasCard && (
                    <div className="text-right">
                       <p className="text-[8px] uppercase opacity-40 font-bold mb-0.5">Solde</p>
                       <p className="text-sm font-black">{formatLocal(defaultCard.cardBalance || 0, userCurrency)}</p>
                    </div>
                  )}
                  {!hasCard && (
                    <div className="flex gap-1">
                      <div className="w-5 h-5 rounded-full bg-slate-400/20" />
                      <div className="w-5 h-5 rounded-full bg-slate-400/20 -ml-2" />
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-white/5 rounded-full blur-[100px]" />
            </motion.div>
          );
        })()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          <div className="flex justify-between items-end mb-1">
            <h3 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Dernières Transactions</h3>
            <Link href="/dashboard/transactions" className="text-[var(--accent)] font-bold text-xs hover:underline">Voir tout</Link>
          </div>
          
          <div className="space-y-3">
            {transactions.map((t) => {
              const Icon = getIcon(t.type);
              return (
                <motion.div 
                  key={t._id}
                  whileHover={{ x: 5 }}
                  className="bg-[var(--card-bg)] p-4 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all cursor-pointer border border-[var(--card-border)]/50"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl ${getColor(t.type)} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-slate-900" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-[var(--foreground)]">{t.description}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {new Date(t.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} • {t.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-base ${t.type === 'TOPUP' || t.type === 'TRANSFER_IN' ? "text-[var(--accent)]" : "text-slate-900"}`}>
                      {t.type === 'TOPUP' || t.type === 'TRANSFER_IN' ? "+" : "-"} {formatLocal(Math.abs(t.amount), t.targetCurrency || userCurrency)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
            {transactions.length === 0 && (
              <p className="text-center text-slate-400 py-10 text-sm italic">Aucune transaction pour le moment.</p>
            )}
          </div>
        </div>

        {/* Stats & Quick Recharge */}
        <div className="lg:col-span-4 space-y-6">
          {/* Stats Bar Chart Mockup */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[32px] p-6">
             <h4 className="text-sm font-bold text-[var(--foreground)] mb-6">Statistiques Mensuelles</h4>
             <div className="flex items-end justify-between h-20 gap-2 mb-6">
                {[40, 65, 30, 95, 55].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className={`w-full rounded-md ${i === 3 ? "bg-[#064E3B]" : "bg-slate-300/40"}`}
                  />
                ))}
             </div>
             <div className="flex justify-between items-center">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Croissance ce mois</p>
                <p className="text-[var(--accent)] font-black text-base">+12.4%</p>
             </div>
          </div>

          {/* Quick Recharge */}
          <div className="bg-[var(--card-bg)] rounded-[32px] p-6 shadow-sm border border-[var(--card-border)]">
             <h4 className="text-sm font-bold text-[var(--foreground)] mb-6">Recharge Rapide</h4>
             <div className="bg-[var(--nav-active)] p-3 rounded-xl flex items-center justify-between mb-6 group cursor-pointer hover:bg-[var(--card-border)] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--card-border)]" />
                  <p className="text-[12px] font-bold text-[var(--foreground)]">BNP Paribas</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors" />
             </div>
             <button className="w-full bg-[var(--accent)] text-white py-3.5 rounded-xl text-sm font-bold hover:bg-[var(--accent-hover)] transition-all">
                Recharger 500 {userCurrency}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
