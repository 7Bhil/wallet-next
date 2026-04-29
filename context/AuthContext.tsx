"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, CheckCircle2 } from "lucide-react";
import { updateRates } from "@/utils/currency";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  balance: number;
  cryptoBalance: number;
  currency: string;
  defaultCardId: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  notifications: Notification[];
  persistentNotifications: Notification[];
  clearPersistentNotifications: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [persistentNotifications, setPersistentNotifications] = useState<Notification[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const router = useRouter();

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get("http://localhost:5000/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
      initSocket(token);

      // Fetch real-time currency rates
      try {
        const ratesRes = await axios.get("http://localhost:5000/currency/rates");
        updateRates(ratesRes.data.toBSD, ratesRes.data.fromBSD);
      } catch (e) {
        console.warn("Could not fetch real-time rates", e);
      }
    } catch (error: any) {
      console.error("Failed to fetch user:", error);
      localStorage.removeItem("token");
      setUser(null);
      if (error?.response?.status === 401) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const initSocket = (token: string) => {
    if (socketRef.current) return;

    const socket = io("http://localhost:5000", {
      auth: { token }
    });

    socket.on("notification", (data) => {
      const newNotif = { ...data, id: Date.now().toString() };
      setNotifications(prev => [newNotif, ...prev]);
      setPersistentNotifications(prev => [newNotif, ...prev].slice(0, 50));
      
      // Auto refresh user balance on notification
      fetchUser();

      // Auto remove after 5s
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
      }, 5000);
    });

    socketRef.current = socket;
  };

  useEffect(() => {
    // Global interceptor for 401 handling
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // If not already on login page, force logout
          if (window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    fetchUser();
    return () => {
      axios.interceptors.response.eject(interceptor);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    fetchUser();
  };

  const logout = () => {
    localStorage.removeItem("token");
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setUser(null);
    router.push("/login");
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearPersistentNotifications = () => setPersistentNotifications([]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser: fetchUser, notifications, persistentNotifications, clearPersistentNotifications }}>
      {children}
      
      {/* Real-time Notifications Toast */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-[380px]">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl shadow-emerald-900/10 border border-slate-50 p-5 flex gap-4 overflow-hidden relative group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                 <Bell className="w-5 h-5 text-emerald-600 animate-bounce" />
              </div>
              <div className="flex-1 space-y-1">
                 <div className="flex justify-between items-start">
                    <h5 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">{n.title}</h5>
                    <button onClick={() => removeNotification(n.id)} className="text-slate-300 hover:text-slate-600">
                       <X className="w-3.5 h-3.5" />
                    </button>
                 </div>
                 <p className="text-sm font-bold text-slate-900 leading-tight">{n.message}</p>
                 <div className="flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Instantané</span>
                 </div>
              </div>
              <div className="absolute left-0 bottom-0 h-1 bg-emerald-500 w-full origin-left animate-shrink" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
