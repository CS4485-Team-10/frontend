"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type NotificationCtx = {
  notifHighRisk: boolean;
  notifMediumRisk: boolean;
  setNotifHighRisk: (v: boolean) => void;
  setNotifMediumRisk: (v: boolean) => void;
};

const NotificationContext = createContext<NotificationCtx | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifHighRisk, setNotifHighRiskState] = useState(true);
  const [notifMediumRisk, setNotifMediumRiskState] = useState(false);

  const setNotifHighRisk = useCallback((v: boolean) => setNotifHighRiskState(v), []);
  const setNotifMediumRisk = useCallback((v: boolean) => setNotifMediumRiskState(v), []);

  const value = useMemo(
    () => ({ notifHighRisk, notifMediumRisk, setNotifHighRisk, setNotifMediumRisk }),
    [notifHighRisk, notifMediumRisk, setNotifHighRisk, setNotifMediumRisk],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationProvider");
  return ctx;
}
