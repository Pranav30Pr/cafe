"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Camera,
  QrCode,
  Sparkles,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Users,
} from "lucide-react";
import jsQR from "jsqr";
import { CAFE_CONFIG } from "@/config/cafe";

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QrScannerModal({ isOpen, onClose }: QrScannerModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"camera" | "picker" | "demo">("camera");

  // Camera state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningLoopRef = useRef<number | null>(null);

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    if (scanningLoopRef.current) {
      cancelAnimationFrame(scanningLoopRef.current);
      scanningLoopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Handle successful QR detection
  const handleDetectedData = useCallback(
    (rawData: string) => {
      const trimmed = rawData.trim();
      let matchedToken: string | null = null;

      // 1. Direct match with table token
      const byToken = CAFE_CONFIG.tables.find((t) => t.qrToken === trimmed);
      if (byToken) {
        matchedToken = byToken.qrToken;
      }

      // 2. Extract from URL if scanned a full URL
      if (!matchedToken) {
        try {
          const url = new URL(trimmed);
          const pathSegments = url.pathname.split("/").filter(Boolean);
          // e.g. /order/token-mg-t01-dinein
          const lastSegment = pathSegments[pathSegments.length - 1];
          const matchedByUrl = CAFE_CONFIG.tables.find((t) => t.qrToken === lastSegment);
          if (matchedByUrl) {
            matchedToken = matchedByUrl.qrToken;
          }
        } catch {
          // Not a URL
        }
      }

      // 3. Fallback: match by table number/label (e.g. "T1", "1", "Table 1")
      if (!matchedToken) {
        const numOnly = trimmed.replace(/\D/g, "");
        if (numOnly) {
          const tableNum = parseInt(numOnly, 10);
          const matchedByNum = CAFE_CONFIG.tables.find((t) => t.id === `tbl-${String(tableNum).padStart(2, "0")}`);
          if (matchedByNum) {
            matchedToken = matchedByNum.qrToken;
          }
        }
      }

      if (matchedToken) {
        setScannedResult(matchedToken);
        stopCamera();
        setTimeout(() => {
          onClose();
          router.push(`/order/${matchedToken}`);
        }, 600);
      } else {
        setCameraError(`Scanned code "${trimmed.slice(0, 35)}" is not a valid table QR.`);
      }
    },
    [onClose, router, stopCamera]
  );

  // Scan frame from video feed
  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code && code.data) {
        handleDetectedData(code.data);
        return; // Pause scanning loop on detection
      }
    }

    scanningLoopRef.current = requestAnimationFrame(scanFrame);
  }, [handleDetectedData]);

  // Start camera stream
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    setScannedResult(null);

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access is not supported by your browser. Please select your table below.");
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        setCameraActive(true);
        scanningLoopRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: any) {
      console.warn("Camera init error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Camera permission was denied. You can select your table directly from the list.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError("No camera device found on this system. Please use the table selector.");
      } else {
        setCameraError("Could not access camera. Please select your table from the list.");
      }
    }
  }, [facingMode, scanFrame, stopCamera]);

  // Handle image file upload for scanning
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          handleDetectedData(code.data);
        } else {
          setCameraError("Could not detect a QR code in the uploaded image. Please try another image or select your table.");
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Toggle camera switch
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Manage camera on modal open/close
  useEffect(() => {
    if (isOpen && activeTab === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, activeTab, startCamera, stopCamera]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#1B382B]/60 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 16 }}
          className="relative w-full max-w-lg bg-[#FBF9F4] rounded-3xl shadow-2xl border border-[#E6E1D5] overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-white border-b border-[#E6E1D5] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#1B382B] text-white flex items-center justify-center">
                <QrCode className="w-5 h-5 text-[#8EBA9D]" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1B382B]">
                  Scan Table QR Code
                </h3>
                <p className="text-[11px] text-[#55635B]">
                  Point at your table acrylic stand or pick your table
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F3EFE6] text-[#55635B] hover:text-[#1B382B] flex items-center justify-center transition-colors"
              aria-label="Close scanner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-[#E6E1D5] bg-[#F3EFE6]/60 p-1.5 gap-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("camera")}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === "camera"
                  ? "bg-white text-[#1B382B] shadow-sm font-bold"
                  : "text-[#55635B] hover:text-[#151E19]"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera Scan</span>
            </button>
            <button
              onClick={() => setActiveTab("picker")}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === "picker"
                  ? "bg-white text-[#1B382B] shadow-sm font-bold"
                  : "text-[#55635B] hover:text-[#151E19]"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Table Selector</span>
            </button>
            <button
              onClick={() => setActiveTab("demo")}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === "demo"
                  ? "bg-white text-[#1B382B] shadow-sm font-bold"
                  : "text-[#55635B] hover:text-[#151E19]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>QR Stands</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-4">
            {/* TAB 1: CAMERA SCANNER */}
            {activeTab === "camera" && (
              <div className="space-y-4">
                <div className="relative aspect-square max-w-[320px] mx-auto rounded-3xl overflow-hidden bg-black shadow-inner border-2 border-[#1B382B]">
                  {/* Hidden processing canvas */}
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Video Viewport */}
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />

                  {/* Overlay scanning viewfinder */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                    <div className="relative w-full h-full border-2 border-[#8EBA9D]/80 rounded-2xl">
                      {/* Corner accents */}
                      <span className="absolute -top-1 -left-1 w-5 h-5 border-t-3 border-l-3 border-[#8EBA9D] rounded-tl-lg" />
                      <span className="absolute -top-1 -right-1 w-5 h-5 border-t-3 border-r-3 border-[#8EBA9D] rounded-tr-lg" />
                      <span className="absolute -bottom-1 -left-1 w-5 h-5 border-b-3 border-l-3 border-[#8EBA9D] rounded-bl-lg" />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 border-b-3 border-r-3 border-[#8EBA9D] rounded-br-lg" />

                      {/* Moving laser scan line */}
                      {cameraActive && (
                        <motion.div
                          animate={{ y: ["0%", "100%", "0%"] }}
                          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                          className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#2D8A4E] to-transparent shadow-[0_0_8px_#2D8A4E]"
                        />
                      )}
                    </div>
                  </div>

                  {/* Success detection flash */}
                  {scannedResult && (
                    <div className="absolute inset-0 bg-[#1B382B]/90 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4 text-center">
                      <CheckCircle2 className="w-12 h-12 text-[#8EBA9D] animate-bounce mb-2" />
                      <p className="font-serif font-bold text-lg">Table Recognized!</p>
                      <p className="text-xs text-[#8EBA9D]">Opening menu...</p>
                    </div>
                  )}

                  {/* Camera control buttons on viewfinder */}
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button
                      onClick={toggleFacingMode}
                      className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
                      title="Switch Camera"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Error alert */}
                {cameraError && (
                  <div className="p-3.5 rounded-2xl bg-[#FFF4F2] border border-[#FAD2CF] text-[#99221B] text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">{cameraError}</p>
                      <button
                        onClick={() => setActiveTab("picker")}
                        className="underline font-bold mt-1 text-[#1B382B] block"
                      >
                        Choose your table from list →
                      </button>
                    </div>
                  </div>
                )}

                {/* Secondary upload action */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[#55635B]">Can&apos;t scan? Upload photo:</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E6E1D5] bg-white text-[#151E19] hover:bg-[#F3EFE6] font-medium"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#4E7A63]" />
                    <span>Upload QR Image</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: TABLE SELECTOR */}
            {activeTab === "picker" && (
              <div className="space-y-3">
                <p className="text-xs text-[#55635B]">
                  Select the table number printed on your table stand to open the dine-in menu:
                </p>
                <div className="grid grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                  {CAFE_CONFIG.tables.map((table) => (
                    <button
                      key={table.id}
                      onClick={() => {
                        onClose();
                        router.push(`/order/${table.qrToken}`);
                      }}
                      className="p-3 rounded-2xl bg-white border border-[#E6E1D5] hover:border-[#1B382B] hover:shadow-md transition-all text-left flex flex-col justify-between group"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-serif font-bold text-sm text-[#1B382B] group-hover:text-[#4E7A63]">
                          {table.label}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F3EFE6] text-[#55635B]">
                          {table.capacity} Seats
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3 text-[11px] text-[#4E7A63] font-semibold">
                        <span>Tap to Order</span>
                        <span>→</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: QR STAND DEMO & PRINT PREVIEW */}
            {activeTab === "demo" && (
              <div className="space-y-3">
                <p className="text-xs text-[#55635B]">
                  In the cafe, each table has an acrylic stand with a unique QR code. You can test by scanning these or print all sheets in the Admin console:
                </p>

                <div className="grid grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
                  {CAFE_CONFIG.tables.slice(0, 4).map((table) => (
                    <div
                      key={table.id}
                      className="p-3 rounded-2xl bg-white border border-[#E6E1D5] flex flex-col items-center text-center space-y-2"
                    >
                      <div className="w-24 h-24 bg-[#FBF9F4] rounded-xl flex items-center justify-center border border-[#E6E1D5] p-2">
                        <QrCode className="w-16 h-16 text-[#1B382B]" />
                      </div>
                      <div>
                        <span className="font-serif font-bold text-xs text-[#1B382B] block">
                          {table.label}
                        </span>
                        <span className="text-[10px] text-[#55635B] block">
                          Token: {table.qrToken.slice(0, 14)}...
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          onClose();
                          router.push(`/order/${table.qrToken}`);
                        }}
                        className="w-full py-1 text-[11px] font-semibold rounded-lg bg-[#1B382B] text-white hover:bg-[#12241C]"
                      >
                        Open Menu
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#E6E1D5] flex items-center justify-between">
                  <span className="text-xs text-[#55635B]">Looking for staff printouts?</span>
                  <button
                    onClick={() => {
                      onClose();
                      router.push("/admin");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B382B] hover:text-[#4E7A63] underline"
                  >
                    <span>Admin QR Stand Sheets</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
