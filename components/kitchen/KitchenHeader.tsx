"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Radio,
  Wifi,
  WifiOff,
  Sliders,
  BellRing,
  ArrowLeft,
} from "lucide-react";
import { CAFE_CONFIG } from "@/config/cafe";
import { kitchenAudio } from "@/lib/utils/audio";
import { wakeLockManager } from "@/lib/utils/wakelock";

interface KitchenHeaderProps {
  isOnline: boolean;
  isStreamConnected: boolean;
  activeCount: number;
  placedCount: number;
  preparingCount: number;
  readyCount: number;
  onOpenStockModal: () => void;
}

export function KitchenHeader({
  isOnline,
  isStreamConnected,
  activeCount,
  placedCount,
  preparingCount,
  readyCount,
  onOpenStockModal,
}: KitchenHeaderProps) {
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleAudio = async () => {
    if (!audioUnlocked) {
      const success = await kitchenAudio.unlock();
      if (success) {
        setAudioUnlocked(true);
        kitchenAudio.playNewOrderChime();
      }
    } else {
      setAudioUnlocked(false);
    }
  };

  const handleToggleWakeLock = async () => {
    if (!wakeLockActive) {
      const success = await wakeLockManager.requestLock();
      if (success) setWakeLockActive(true);
    } else {
      await wakeLockManager.releaseLock();
      setWakeLockActive(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#121A15] border-b border-[#233128] text-white px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Branding & Station Info */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            title="Return to Home"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-lg font-bold tracking-wide text-white">
                {CAFE_CONFIG.identity.name}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#C4623F] text-white">
                KDS Station
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8EBA9D] font-mono mt-0.5">
              <span>{currentTime}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                {isOnline ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{isStreamConnected ? "Realtime Live" : "Polling Active"}</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-red-400">Offline Reconnecting</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Order Counter Pills */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-xl bg-[#1B2720] border border-[#2D3E34] text-xs">
            <span className="text-[#8EBA9D] text-[10px] block uppercase font-medium">To Accept</span>
            <span className="font-bold font-mono text-sm text-[#E0533C]">
              {placedCount}
            </span>
          </div>

          <div className="px-3 py-1 rounded-xl bg-[#1B2720] border border-[#2D3E34] text-xs">
            <span className="text-[#8EBA9D] text-[10px] block uppercase font-medium">Preparing</span>
            <span className="font-bold font-mono text-sm text-[#D99B52]">
              {preparingCount}
            </span>
          </div>

          <div className="px-3 py-1 rounded-xl bg-[#1B2720] border border-[#2D3E34] text-xs">
            <span className="text-[#8EBA9D] text-[10px] block uppercase font-medium">Ready</span>
            <span className="font-bold font-mono text-sm text-emerald-400">
              {readyCount}
            </span>
          </div>
        </div>

        {/* Right: Operational Controls */}
        <div className="flex items-center gap-2">
          {/* Audio Chime Trigger */}
          <button
            onClick={handleToggleAudio}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              audioUnlocked
                ? "bg-emerald-600/30 border border-emerald-500 text-emerald-300"
                : "bg-[#C4623F] text-white animate-pulse"
            }`}
          >
            {audioUnlocked ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{audioUnlocked ? "Audio Active" : "Start Shift (Audio)"}</span>
          </button>

          {/* Test Chime */}
          {audioUnlocked && (
            <button
              onClick={() => kitchenAudio.playNewOrderChime()}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#8EBA9D] transition-colors"
              title="Test Kitchen Chime"
            >
              <BellRing className="w-4 h-4" />
            </button>
          )}

          {/* Wake Lock Screen On */}
          <button
            onClick={handleToggleWakeLock}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              wakeLockActive
                ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
            }`}
            title="Screen Wake Lock keeps display awake during service"
          >
            {wakeLockActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="hidden sm:inline">
              {wakeLockActive ? "Wake Lock ON" : "Wake Lock OFF"}
            </span>
          </button>

          {/* 86 Out of Stock Drawer Trigger */}
          <button
            onClick={onOpenStockModal}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors border border-white/10"
          >
            <Sliders className="w-4 h-4 text-[#D99B52]" />
            <span className="hidden sm:inline">86 Items</span>
          </button>
        </div>
      </div>
    </header>
  );
}
