"use client";

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import api from "@/utils/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isFormValid = formData.email && formData.password;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await api.post("/auth/login", formData);
      const token = response.data.access_token;
      login(token); // Update global state
      setMessage("Connexion réussie ! Redirection...");
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Identifiants invalides.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <motion.div 
        layout
        transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-[1050px] bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row-reverse relative"
      >
        {/* Right Side - Dark Panel */}
        <motion.div 
          layoutId="dark-panel"
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
          className="md:w-[48%] bg-[#0F172A] p-10 md:p-14 flex flex-col justify-between text-white relative overflow-hidden"
        >
          <div className="relative z-10">
            <h2 className="text-4xl md:text-[44px] font-bold leading-[1.15] mb-8 tracking-tight">
              Ravi de vous<br />revoir.
            </h2>
            <p className="text-slate-400 text-base md:text-lg max-w-[320px] leading-relaxed">
              Accédez à votre espace sécurisé Wallet en un clic.
            </p>
          </div>

          <div className="relative z-10 mt-16 group opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="w-full max-w-[380px] aspect-[1.58/1] bg-gradient-to-br from-[#1E293B] to-[#010614] p-8 rounded-[28px] border border-white/10 shadow-2xl flex flex-col justify-between relative">
              <div className="flex justify-between items-start">
                <span className="text-[10px] tracking-[0.25em] text-slate-500 font-bold uppercase">Wallet Platinum</span>
                <div className="w-10 h-10 rounded-full bg-emerald-400/10 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)]" />
                </div>
              </div>
              <div className="mt-auto">
                 <div className="text-[20px] tracking-[0.25em] font-mono text-slate-200">•••• •••• •••• 8888</div>
              </div>
            </div>
          </div>
          <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-blue-600/10 rounded-full blur-[120px]" />
        </motion.div>

        {/* Left Side - Form */}
        <motion.div 
          layoutId="form-panel"
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
          className="md:w-[52%] p-10 md:p-14 flex flex-col justify-center bg-white"
        >
          <div className="max-w-[400px] mx-auto w-full">
            <h3 className="text-3xl font-bold mb-3 tracking-tight text-slate-900">Connexion</h3>
            <p className="text-slate-500 text-sm md:text-base mb-10 leading-relaxed">Entrez vos identifiants pour continuer.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] block ml-1">Email</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-slate-900">
                    <Mail className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jean.dupont@aura.com"
                    className="w-full bg-[#F0F2FD] border-2 border-transparent rounded-[20px] py-[18px] pl-12 pr-4 focus:bg-white focus:border-slate-100 focus:ring-0 transition-all placeholder:text-slate-300 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] block">Mot de passe</label>
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest cursor-pointer hover:underline">Oublié ?</span>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-slate-900">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-[#F0F2FD] border-2 border-transparent rounded-[20px] py-[18px] pl-12 pr-12 focus:bg-white focus:border-slate-100 focus:ring-0 transition-all placeholder:text-slate-300 font-medium text-slate-900"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {message && (
                <p className={`text-sm font-medium ${message.includes("réussie") ? "text-emerald-500" : "text-red-500"}`}>
                  {message}
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className="w-full bg-black text-white rounded-[20px] py-5 font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 hover:shadow-2xl transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none active:scale-[0.99]"
                >
                  {loading ? "Chargement..." : "Se connecter"}
                </button>
              </div>

              <p className="text-center text-sm text-slate-500 pt-6">
                Pas encore membre ? <Link href="/signup" className="text-emerald-600 font-bold cursor-pointer hover:underline">Créer un compte</Link>
              </p>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
