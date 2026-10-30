"use client";

import { CAFE_CONFIG, TableConfig, resolveTable } from "@/config/cafe";

export interface ActiveSession {
  orderType: "dine_in" | "takeaway";
  tableToken?: string;
  tableLabel?: string;
  tableId?: string;
}

const SESSION_STORAGE_KEY = "meeva_active_session";

export function getActiveSession(): ActiveSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setActiveSession(session: ActiveSession) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn("Failed to store active session:", err);
  }
}

export function clearActiveSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {}
}

export function setTableSessionByToken(token: string): ActiveSession | null {
  const table = resolveTable(token);
  if (!table) return null;
  const session: ActiveSession = {
    orderType: "dine_in",
    tableToken: table.qrToken,
    tableLabel: table.label,
    tableId: table.id,
  };
  setActiveSession(session);
  return session;
}

export function setTakeawaySession(): ActiveSession {
  const session: ActiveSession = {
    orderType: "takeaway",
  };
  setActiveSession(session);
  return session;
}
