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
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { CURRENCY_SYMBOLS, formatBSD } from "@/utils/currency";

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

  const handleCurrencyChange = async (newCurrency: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch("http://localhost:5000/users/profile", { currency: newCurrency }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      refreshUser();
    } catch (error) {
      console.error("Failed to update currency:", error);
    }
  };

  const sections: ProfileSection[] = [
    {
      title: "Identité",
      items: [
        { label: "Nom complet", value: user?.fullName, icon: User },
        { label: "Email", value: user?.email, icon: Mail },
        { label: "Rôle", value: user?.role, icon: Shield },
        { label: "Devise de retrait", value: user?.currency, icon: Globe, action: "Changer" },
      ]
    },
    {
      title: "Sécurité & Accès",
      items: [
        { label: "Mot de passe", value: "••••••••", icon: Key, action: "Modifier" },
        { label: "Double authentification", value: "Désactivé", icon: Smartphone, action: "Activer" },
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 lg:p-10 space-y-12">
      <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-10 rounded-[48px] border border-slate-50 shadow-sm relative overflow-hidden group">
        <div className="relative">
           <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-slate-100 flex items-center justify-center p-1.5 border-4 border-slate-50 overflow-hidden group-hover:border-emerald-500 transition-all duration-500">
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
           <p className="text-sm font-bold text-emerald-600 uppercase tracking-[0.2em]">{user?.role} PRO</p>
           <p className="text-xs text-slate-400 font-medium max-w-sm">
             Gérez vos informations personnelles et configurez la sécurité de votre compte Wallet.
           </p>
        </div>
        <div className="absolute top-[-20%] right-[-10%] w-60 h-60 bg-emerald-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         <div className="lg:col-span-8 space-y-10">
            {sections.map((section, idx) => (
              <div key={idx} className="space-y-6">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">{section.title}</h3>
                 <div className="bg-white rounded-[32px] overflow-hidden border border-slate-50 shadow-sm">
                     {section.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-b-0 group">
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
                         {item.action && item.label !== "Devise de retrait" ? (
                           <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">{item.action}</button>
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
              <p className="text-3xl font-black text-slate-900 tracking-tight">{formatBSD(user?.balance || 0)}</p>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                Fonds disponibles pour alimenter vos cartes ou envoyer à des tiers.
              </p>
            </div>

            <div className="bg-black rounded-[32px] p-8 text-white relative overflow-hidden group">
               <h4 className="text-sm font-bold mb-4">Besoin d'aide ?</h4>
               <p className="text-xs text-slate-400 leading-relaxed mb-6">Notre support VIP est disponible 24/7 pour nos membres Premium.</p>
               <button className="w-full bg-white text-black py-3 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all relative z-10">Contacter Wallet</button>
               <div className="absolute bottom-[-20%] left-[-10%] w-32 h-32 bg-emerald-500/20 rounded-full blur-[60px]" />
            </div>

            <div className="bg-[#FEF2F2] rounded-[32px] p-8 border border-red-50">
               <h4 className="text-sm font-bold text-red-900 mb-4">Zone de Danger</h4>
               <p className="text-[11px] text-red-600/70 mb-6">Supprimer votre compte est irréversible. Toutes vos données seront effacées.</p>
               <button className="text-xs font-black text-red-600 uppercase tracking-widest hover:underline">Fermer le compte</button>
            </div>
         </div>
      </div>
    </div>
  );
}
