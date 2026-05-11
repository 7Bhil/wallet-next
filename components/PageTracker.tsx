"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import api from "@/utils/api";
import { useAuth } from "@/context/AuthContext";

export function PageTracker() {
  const pathname = usePathname();
  const { user } = useAuth();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (user && pathname !== lastTrackedPath.current) {
      // Track page visit
      api.post("/audit/track", { section: pathname }).catch((err) => {
        console.warn("Failed to track page visit", err);
      });
      lastTrackedPath.current = pathname;
    }
  }, [pathname, user]);

  return null;
}

export default PageTracker;
