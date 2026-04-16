"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Wifi, 
  Settings, 
  Lock, 
  Eye, 
  EyeOff, 
  Smartphone,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Trash2,
  X,
  ToggleLeft as Toggle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { formatBSD, convertToBSD, CURRENCY_SYMBOLS } from "@/utils/currency";
import { useAuth } from "@/context/AuthContext";

export default function VirtualCards() {
  const { user } = useAuth();
  const [privacyMode, setPrivacyMode] = useState(true);
  const [freezeAll, setFreezeAll] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showSelector, setShowSelector] = useState(false);

  React.useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/cards/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCards(res.data);
    } catch (e) {
      console.error("Error fetching cards", e);
    }
  };

  const createCard = async (type: string) => {
    if (cards.length >= 3) return;
    setIsCreating(true);
    setShowSelector(false);
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/cards", { type }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchCards();
    } catch (e) {
      console.error("Error creating card", e);
    } finally {
      setIsCreating(false);
    }
  };

  const deleteCard = async () => {
    if (!deleteId) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/cards/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchCards();
      setDeleteId(null);
    } catch (e) {
      console.error("Error deleting card", e);
    }
  };

  // Keep fake activity for now as it will be another step
  const cardActivity = [
    { id: 1, name: "Apple Store Online", detail: "VIRTUAL CARD • 2 HOURS AGO", amount: -1299.00, status: "SUCCESS" },
    { id: 2, name: "The Gilded Fork", detail: "VIRTUAL CARD • YESTERDAY", amount: -245.50, status: "SUCCESS" },
  ];


  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Virtual Cards</h1>
          <p className="text-sm text-slate-500 max-w-md">
            Gérez vos actifs numériques avec la sécurité Wallora. Génération instantanée, contrôle total.
          </p>
        </div>
        <button 
          onClick={() => setShowSelector(true)}
          disabled={isCreating || cards.length >= 3}
          className="flex items-center justify-center gap-2 bg-[#065F46] text-white px-6 py-4 rounded-2xl font-bold hover:bg-[#047857] transition-all group shadow-xl shadow-emerald-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className={`w-5 h-5 transition-transform ${isCreating ? "animate-spin" : "group-hover:rotate-90"}`} />
          {isCreating ? "Génération..." : "Nouvelle Carte"}
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 py-10 flex flex-col items-center justify-center text-slate-400 bg-white rounded-[24px] border border-dashed border-slate-200">
             <CreditCard className="w-12 h-12 mb-4 opacity-50" />
             <p className="text-sm font-bold">Vous n'avez pas encore de carte virtuelle.</p>
             <p className="text-xs">Créez-en une en cliquant sur le bouton ci-dessous ou en haut à droite.</p>
          </div>
        )}
        {cards.map((card) => {
          // Robust fallback for colors if data is legacy or missing
          const cardColor = card.color || (card.type === 'STANDARD' ? 'from-white to-slate-50' : card.type === 'PREMIUM' ? 'from-blue-600 to-blue-900' : 'from-slate-800 to-slate-950');
          const cardTextColor = card.text || (card.type === 'STANDARD' ? 'text-slate-900' : 'text-white');
          
          return (
            <div key={card._id} className="space-y-4">
              <motion.div 
                whileHover={{ y: -5 }}
                className={`aspect-[1.58/1] rounded-[24px] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between bg-gradient-to-br ${cardColor} ${cardTextColor} ${card.border || ""}`}
              >
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <p className="text-[9px] font-bold opacity-50 uppercase tracking-widest mb-0.5">{card.type}</p>
                    <h3 className="text-lg font-bold">{card.name}</h3>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDeleteId(card._id); }}
                      className={`p-1.5 rounded-lg transition-colors ${card.type === 'STANDARD' ? 'bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-900' : 'bg-black/10 hover:bg-black/20 text-white/70 hover:text-white'}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {card.type === "STANDARD" ? (
                      <CreditCard className="w-5 h-5 text-slate-300" />
                    ) : (
                       <Wifi className="w-5 h-5 rotate-90 opacity-50" />
                    )}
                  </div>
                </div>

                <div className="relative z-10 pt-4">
                  <div className="flex gap-3 text-lg tracking-[0.2em] font-mono opacity-80 mb-4">
                    <span>••••</span>
                    <span>••••</span>
                    <span>••••</span>
                    <span>{privacyMode ? "****" : card.number.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between items-end gap-4">
                    <div className="flex gap-6">
                      <div>
                        <p className="text-[8px] uppercase opacity-40 font-bold mb-0.5">Exp</p>
                        <p className="text-[11px] font-semibold">{card.exp}</p>
                      </div>
                      <div>
                        <p className="text-[8px] uppercase opacity-40 font-bold mb-0.5">CVV</p>
                        <p className="text-[11px] font-semibold">{card.cvv}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[8px] uppercase opacity-40 font-bold mb-0.5 text-right font-bold">Available</p>
                      <div className="flex gap-0.5 justify-end">
                         <span className="w-4 h-4 rounded-full bg-slate-300/20" />
                         <span className="w-4 h-4 rounded-full bg-slate-300/20 -ml-2" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Background Glow */}
                {card.type === "VIP MEMBER" && <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-blue-500/10 rounded-full blur-[60px]" />}
                {card.type === "PREMIUM" && <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-white/5 rounded-full blur-[60px]" />}
              </motion.div>

              <div className="bg-white p-4 rounded-[20px] flex justify-between items-center shadow-sm border border-slate-50">
                <div className="flex gap-8">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Plafond Mensuel</p>
                    <p className="text-sm font-bold text-slate-900">{card.limitValue ? formatBSD(card.limitValue) : card.limit}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Taux d'intérêt</p>
                    <p className="text-sm font-bold text-emerald-600">{card.interestRate || 0}%</p>
                  </div>
                </div>
                <span className={`text-[9px] font-bold px-2 py-1 rounded-md ${card.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                  {card.status}
                </span>
              </div>
            </div>
          );
        })}

        {/* Create New Card Dash */}
        {cards.length < 3 && (
          <button onClick={() => setShowSelector(true)} className="aspect-[1.58/1] rounded-[24px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 group hover:border-emerald-600/50 hover:bg-emerald-50/10 transition-all">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all text-slate-400">
               <Plus className="w-6 h-6" />
            </div>
            <div className="text-center px-6">
              <p className="text-[13px] font-bold text-slate-900">Create New Card</p>
              <p className="text-[10px] text-slate-400 font-medium">Instant activation</p>
            </div>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Card Activity */}
        <div className="lg:col-span-8 space-y-5">
           <div className="flex justify-between items-end">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Recent Card Activity</h3>
              <button className="text-emerald-700 font-bold text-xs hover:underline">See All</button>
           </div>
           
           <div className="space-y-3">
              {cardActivity.map((activity) => (
                <div key={activity.id} className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-slate-50/50">
                   <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900">
                         <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-900">{activity.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium tracking-tight uppercase tracking-wider">{activity.detail}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-6">
                      <p className="text-[15px] font-bold text-slate-900">-${activity.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</p>
                      <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm">{activity.status}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Card Security Toggles */}
        <div className="lg:col-span-4 space-y-6">
           <h3 className="text-xl font-bold text-slate-900 tracking-tight">Card Security</h3>
           <div className="space-y-4">
              <div className="bg-white p-5 rounded-[24px] border border-slate-50 shadow-sm flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Freeze All Cards</p>
                      <p className="text-[10px] text-slate-400">Instantly disable spending</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => setFreezeAll(!freezeAll)}
                  className={`w-10 h-6 rounded-full p-1 transition-colors ${freezeAll ? "bg-emerald-600" : "bg-slate-200"}`}
                 >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${freezeAll ? "translate-x-4" : "translate-x-0"}`} />
                 </button>
              </div>

              <div className="bg-white p-5 rounded-[24px] border border-slate-50 shadow-sm flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <EyeOff className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Privacy Mode</p>
                      <p className="text-[10px] text-slate-400">Hide numbers on display</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => setPrivacyMode(!privacyMode)}
                  className={`w-10 h-6 rounded-full p-1 transition-colors ${privacyMode ? "bg-emerald-600" : "bg-slate-200"}`}
                 >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${privacyMode ? "translate-x-4" : "translate-x-0"}`} />
                 </button>
              </div>

              {/* Security Banner */}
              <div className="bg-black rounded-[24px] p-8 text-white relative overflow-hidden group cursor-pointer">
                 <div className="relative z-10 space-y-4">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Next-Gen Protection</p>
                    <h4 className="text-lg font-bold leading-tight">Enable Biometric<br />Approvals</h4>
                    <button className="bg-white text-black px-5 py-2.5 rounded-xl text-[11px] font-black hover:bg-slate-100 transition-colors uppercase tracking-tight">
                       Configure Now
                    </button>
                 </div>
                 <div className="absolute right-[-10px] bottom-[-20px] opacity-20 group-hover:scale-110 transition-transform">
                    <div className="w-24 h-24 border-[10px] border-white rounded-3xl" />
                 </div>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              </div>
           </div>
        </div>
      </div>

      {/* Premium Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6">
                 <Trash2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-2">Supprimer la carte ?</h4>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                Cette action est irréversible. Toutes les données associées à cette carte virtuelle seront effacées.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-4 rounded-2xl bg-slate-50 text-slate-900 font-bold text-sm hover:bg-slate-100 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={deleteCard}
                  className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                >
                  Supprimer
                </button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Card Selection Modal */}
      <AnimatePresence>
        {showSelector && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSelector(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-4xl bg-[#F8FAFC] rounded-[40px] p-8 md:p-10 shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h4 className="text-3xl font-black text-slate-900 tracking-tight">Choisir votre carte</h4>
                  <p className="text-slate-500 font-medium text-sm mt-1">Sélectionnez le palier qui correspond à vos ambitions.</p>
                </div>
                <button onClick={() => setShowSelector(false)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors shadow-sm">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { 
                    type: 'STANDARD', 
                    name: 'Everyday Virtual', 
                    limitValue: 5000, 
                    rate: '5%', 
                    color: 'from-white to-slate-100', 
                    text: 'text-slate-900',
                    desc: 'Idéal pour vos dépenses quotidiennes sécurisées.'
                  },
                  { 
                    type: 'PREMIUM', 
                    name: 'Sky Digital', 
                    limitValue: 25000, 
                    rate: '12%', 
                    color: 'from-blue-600 to-blue-900', 
                    text: 'text-white',
                    desc: 'Liberté accrue et plafonds élevés pour voyageurs.'
                  },
                  { 
                    type: 'VIP MEMBER', 
                    name: 'The Fluid Black', 
                    limitValue: 100000, 
                    rate: '18%', 
                    color: 'from-slate-800 to-slate-950', 
                    text: 'text-white',
                    desc: 'Le summum de l\'exclusivité Wallora Platinum.'
                  }
                ].map((tier) => (
                  <motion.div 
                    key={tier.type}
                    whileHover={{ y: -8 }}
                    onClick={() => createCard(tier.type)}
                    className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 cursor-pointer group hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-900/5 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className={`aspect-[1.58/1] rounded-2xl mb-6 bg-gradient-to-br ${tier.color} ${tier.text} p-4 flex flex-col justify-between shadow-md`}>
                        <p className="text-[8px] font-bold opacity-50 uppercase tracking-widest">{tier.type}</p>
                        <div className="flex justify-between items-end">
                           <div className="text-[10px] font-mono tracking-widest opacity-80">•••• 8888</div>
                           <div className="w-6 h-6 rounded-full bg-white/10" />
                        </div>
                      </div>
                      <h5 className="font-black text-slate-900 text-lg mb-2">{tier.name}</h5>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">{tier.desc}</p>
                    </div>
                    
                    <div className="space-y-3 pt-6 border-t border-slate-50">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plafond</span>
                        <span className="text-sm font-black text-slate-900">{formatBSD(tier.limitValue)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Taux d'intérêt</span>
                        <span className="text-sm font-black text-emerald-600">{tier.rate}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="absolute bottom-[-10%] right-[-5%] w-60 h-60 bg-emerald-500/5 rounded-full blur-[100px]" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
