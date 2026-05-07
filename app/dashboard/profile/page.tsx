"use client";

import React from "react";
import { 
  User, 
  Mail, 
  Shield, 
  Key, 
  Smartphone, 
  Globe, 
  LogOut,
  ChevronRight,
  Wallet
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import api from "@/utils/api";
import { Moon, Sun } from "lucide-react";
import { CURRENCY_SYMBOLS, formatLocal } from "@/utils/currency";

interface ProfileItem {
  label: string;
  value: string | undefined;
  icon: any;
  action?: string;
}

interface ProfileSection {
  title: string;
  items: ProfileItem[];
}

export default function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [isNameModalOpen, setIsNameModalOpen] = React.useState(false);
  const [newName, setNewName] = React.useState(user?.fullName || "");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
  const [passwordData, setPasswordData] = React.useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleUpdateName = async () => {
    try {
      await api.patch("/users/profile", { fullName: newName });
      await refreshUser();
      setIsNameModalOpen(false);
      setFeedback({ type: "success", msg: "Nom mis à jour !" });
    } catch (e) {
      setFeedback({ type: "error", msg: "Erreur lors de la mise à jour." });
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setFeedback({ type: "error", msg: "Les mots de passe ne correspondent pas." });
      return;
    }
    try {
      await api.patch("/users/password", { 
        oldPassword: passwordData.oldPassword, 
        newPassword: passwordData.newPassword 
      });
      setIsPasswordModalOpen(false);
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setFeedback({ type: "success", msg: "Mot de passe modifié !" });
    } catch (e: any) {
      setFeedback({ type: "error", msg: e?.response?.data?.message || "Échec de modification." });
    }
  };

  const handleCurrencyChange = async (newCurrency: string) => {
    try {
      await api.patch("/users/profile", { currency: newCurrency });
      refreshUser();
    } catch (error) {
      console.error("Failed to update currency:", error);
    }
  };

  const sections: ProfileSection[] = [
    {
      title: "Identité",
      items: [
        { label: "Nom complet", value: user?.fullName, icon: User, action: "ModifierNom" },
        { label: "Email", value: user?.email, icon: Mail },
        { label: "Rôle", value: user?.role, icon: Shield },
        { label: "Devise de retrait", value: user?.currency, icon: Globe, action: "Changer" },
      ]
    },
    {
      title: "Sécurité & Accès",
      items: [
        { label: "Mot de passe", value: "••••••••", icon: Key, action: "ModifierPassword" },
        { label: "Double authentification", value: "Désactivé", icon: Smartphone, action: "Activer" },
      ]
    },
    {
      title: "Préférences",
      items: [
        { label: "Mode Sombre", value: theme === "dark" ? "Activé" : "Désactivé", icon: theme === "dark" ? Moon : Sun, action: "Bascule" },
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 lg:p-10 space-y-12">
      {feedback && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`fixed top-24 right-8 z-[110] px-6 py-4 rounded-2xl shadow-xl font-bold text-sm ${feedback.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
        >
          {feedback.msg}
          <button onClick={() => setFeedback(null)} className="ml-4 opacity-70 hover:opacity-100">✕</button>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-10 rounded-[48px] border border-slate-50 shadow-sm relative overflow-hidden group">
        <div className="relative">
           <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-slate-100 flex items-center justify-center p-1.5 border-4 border-slate-50 overflow-hidden group-hover:border-[var(--accent)] transition-all duration-500">
             <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center text-slate-400 text-4xl font-black italic">
                {user?.fullName ? user.fullName.split(" ").map(n => n[0]).join("") : "??"}
             </div>
           </div>
           <button 
             onClick={() => logout()}
             className="absolute bottom-2 right-2 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
           >
              <LogOut className="w-4 h-4" />
           </button>
        </div>
        
        <div className="text-center md:text-left flex-1 space-y-2">
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">{user?.fullName}</h1>
           <p className="text-sm font-bold text-[var(--accent)] uppercase tracking-[0.2em]">{user?.role} PRO</p>
           <p className="text-xs text-slate-400 font-medium max-w-sm">
             Gérez vos informations personnelles et configurez la sécurité de votre compte Wallet.
           </p>
        </div>
        <div className="absolute top-[-20%] right-[-10%] w-60 h-60 bg-[var(--accent-soft)]0/5 rounded-full blur-[100px]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         <div className="lg:col-span-8 space-y-10">
            {sections.map((section, idx) => (
              <div key={idx} className="space-y-6">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">{section.title}</h3>
                 <div className="bg-white rounded-[32px] overflow-hidden border border-slate-50 shadow-sm">
                     {section.items.map((item, i) => (
                      <div 
                        key={i} 
                        onClick={() => {
                          if (item.action === "Bascule") toggleTheme();
                          if (item.action === "ModifierNom") setIsNameModalOpen(true);
                          if (item.action === "ModifierPassword") setIsPasswordModalOpen(true);
                        }}
                        className={`flex items-center justify-between p-6 border-b border-slate-50 last:border-b-0 group cursor-pointer hover:bg-slate-50/50 transition-colors`}
                      >
                         <div className="flex items-center gap-5">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors">
                               <item.icon className="w-5 h-5" />
                            </div>
                            <div>
                               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                               {item.label === "Devise de retrait" ? (
                                 <select 
                                   value={user?.currency} 
                                   onChange={(e) => handleCurrencyChange(e.target.value)}
                                   onClick={(e) => e.stopPropagation()}
                                   className="text-sm font-bold text-slate-900 bg-transparent border-none p-0 focus:ring-0 cursor-pointer outline-none"
                                 >
                                   {Object.keys(CURRENCY_SYMBOLS).map(curr => (
                                     <option key={curr} value={curr}>{curr} ({CURRENCY_SYMBOLS[curr]})</option>
                                   ))}
                                 </select>
                               ) : (
                                 <p className="text-sm font-bold text-slate-900">{item.value}</p>
                               )}
                            </div>
                         </div>
                         {item.action === "Bascule" ? (
                           <div className="flex items-center p-1">
                             <button 
                               onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
                               className={`w-12 h-6 rounded-full p-1 transition-colors ${theme === "dark" ? "bg-[var(--accent)]" : "bg-slate-200"}`}
                             >
                               <div 
                                 className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${theme === "dark" ? "translate-x-6" : "translate-x-0"}`}
                               />
                             </button>
                           </div>
                         ) : item.action && item.label !== "Devise de retrait" ? (
                           <button className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest hover:underline">
                             {item.action === "ModifierNom" || item.action === "ModifierPassword" ? "Modifier" : item.action}
                           </button>
                         ) : item.label !== "Devise de retrait" && (
                           <ChevronRight className="w-4 h-4 text-slate-200" />
                         )}
                      </div>
                    ))}
                 </div>
              </div>
            ))}
         </div>

         <div className="lg:col-span-4 space-y-6">
            {/* Wallet Balance Widget */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-50 shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-slate-400">
                  <Wallet className="w-4 h-4" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest">Solde Coffre-Fort</h4>
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">
                {formatLocal(user?.balance || 0, user?.currency || 'USD')}
              </p>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                Fonds disponibles pour alimenter vos cartes ou envoyer à des tiers.
              </p>
            </div>

            <div className="bg-black rounded-[32px] p-8 text-white relative overflow-hidden group">
               <h4 className="text-sm font-bold mb-4">Besoin d'aide ?</h4>
               <p className="text-xs text-slate-400 leading-relaxed mb-6">Notre support VIP est disponible 24/7 pour nos membres Premium.</p>
               <button className="w-full bg-white text-black py-3 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all relative z-10">Contacter Wallet</button>
               <div className="absolute bottom-[-20%] left-[-10%] w-32 h-32 bg-[var(--accent-soft)]0/20 rounded-full blur-[60px]" />
            </div>

            <div className="bg-[#FEF2F2] rounded-[32px] p-8 border border-red-50">
               <h4 className="text-sm font-bold text-red-900 mb-4">Zone de Danger</h4>
               <p className="text-[11px] text-red-600/70 mb-6">Supprimer votre compte est irréversible. Toutes vos données seront effacées.</p>
               <button className="text-xs font-black text-red-600 uppercase tracking-widest hover:underline">Fermer le compte</button>
            </div>
         </div>
      </div>

      {/* MODAL : MODIFIER NOM */}
      <AnimatePresence>
        {isNameModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsNameModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl relative z-10">
               <h4 className="text-xl font-black text-slate-900 mb-6">Modifier votre nom</h4>
               <div className="space-y-4 mb-8">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nouveau Nom Complet</label>
                  <input 
                    type="text" 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-[var(--accent)] rounded-2xl px-5 py-4 text-slate-900 font-bold outline-none transition-all"
                    placeholder="Jean Dupont"
                  />
               </div>
               <div className="flex gap-3">
                  <button onClick={() => setIsNameModalOpen(false)} className="flex-1 py-4 rounded-2xl bg-slate-50 text-slate-900 font-bold text-sm hover:bg-slate-100 transition-colors">Annuler</button>
                  <button onClick={handleUpdateName} className="flex-1 py-4 rounded-2xl bg-[var(--accent)] text-white font-bold text-sm hover:bg-[var(--accent-hover)] transition-all shadow-lg shadow-[var(--accent)]/10">Sauvegarder</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL : MODIFIER MOT DE PASSE */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPasswordModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl relative z-10">
               <h4 className="text-xl font-black text-slate-900 mb-6">Changer le mot de passe</h4>
               <div className="space-y-4 mb-8">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ancien Mot de Passe</label>
                    <input 
                      type="password" 
                      value={passwordData.oldPassword} 
                      onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-[var(--accent)] rounded-2xl px-5 py-4 text-slate-900 font-bold outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nouveau Mot de Passe</label>
                    <input 
                      type="password" 
                      value={passwordData.newPassword} 
                      onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-[var(--accent)] rounded-2xl px-5 py-4 text-slate-900 font-bold outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confirmer le Nouveau</label>
                    <input 
                      type="password" 
                      value={passwordData.confirmPassword} 
                      onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-[var(--accent)] rounded-2xl px-5 py-4 text-slate-900 font-bold outline-none transition-all"
                    />
                  </div>
               </div>
               <div className="flex gap-3">
                  <button onClick={() => setIsPasswordModalOpen(false)} className="flex-1 py-4 rounded-2xl bg-slate-50 text-slate-900 font-bold text-sm hover:bg-slate-100 transition-colors">Annuler</button>
                  <button onClick={handleChangePassword} className="flex-1 py-4 rounded-2xl bg-black text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-xl">Mettre à jour</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
