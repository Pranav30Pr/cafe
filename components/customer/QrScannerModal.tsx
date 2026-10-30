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
import QRCode from "qrcode";
import { CAFE_CONFIG, resolveTable } from "@/config/cafe";
import { setTableSessionByToken } from "@/lib/session";

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingItemId?: string | null;
  onSelectTable?: (token: string) => void;
}

export function QrScannerModal({
  isOpen,
  onClose,
  pendingItemId,
  onSelectTable,
}: QrScannerModalProps) {
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
  const isScanningRef = useRef<boolean>(false);

  // Real QR code map for Tab 3 (Demo / Stand preview)
  const [demoQrMap, setDemoQrMap] = useState<Record<string, string>>({});

  // Generate demo QR images on mount
  useEffect(() => {
    let isMounted = true;
    const generateDemoQrs = async () => {
      const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      const map: Record<string, string> = {};
      for (const table of CAFE_CONFIG.tables) {
        try {
          const url = `${origin}/order/${table.qrToken}`;
          const dataUrl = await QRCode.toDataURL(url, {
            width: 240,
            margin: 2,
            color: { dark: "#1B382B", light: "#FFFFFF" },
          });
          map[table.id] = dataUrl;
        } catch {}
      }
      if (isMounted) setDemoQrMap(map);
    };
    generateDemoQrs();
    return () => {
      isMounted = false;
    };
  }, []);  

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    isScanningRef.current = false;
    if (scanningLoopRef.current) {
      cancelAnimationFrame(scanningLoopRef.current);
      scanningLoopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      } catch {}
    }
    setCameraActive(false);
  }, []);

  // Handle successful QR detection
  const handleDetectedData = useCallback(
    (rawData: string) => {
      if (!rawData) return;
      const trimmed = rawData.trim();
      const matchedTable = resolveTable(trimmed);
      const matchedToken = matchedTable ? matchedTable.qrToken : null;

      if (matchedToken) {
        setScannedResult(matchedToken);
        setTableSessionByToken(matchedToken);
        stopCamera();

        setTimeout(() => {
          onClose();
          if (onSelectTable) {
            onSelectTable(matchedToken);
          } else {
            const dest = pendingItemId
              ? `/order/${matchedToken}?addItem=${encodeURIComponent(pendingItemId)}`
              : `/order/${matchedToken}`;
            router.push(dest);
          }
        }, 500);
      } else {
        setCameraError(`Scanned code "${trimmed.slice(0, 30)}..." is not an active Meeva Greens table QR.`);
      }
    },
    [onClose, onSelectTable, pendingItemId, router, stopCamera]
  );

  // Scan frame from video feed using BarcodeDetector if available, fallback to jsQR
  const scanFrame = useCallback(async () => {
    if (!isScanningRef.current) return;

    const video = videoRef.current;
    if (!video) {
      scanningLoopRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    // Only process when video has active frame data
    if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
      // 1. Try Native BarcodeDetector (Supported in modern Chrome Android & Safari)
      if (typeof window !== "undefined" && "BarcodeDetector" in window) {
        try {
          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: ["qr_code"],
          });
          const barcodes = await barcodeDetector.detect(video);
          if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
            handleDetectedData(barcodes[0].rawValue);
            return;
          }
        } catch {}
      }

      // 2. Robust fallback using jsQR with 2D Canvas
      try {
        let canvas = canvasRef.current;
        if (!canvas) {
          canvas = document.createElement("canvas");
          canvasRef.current = canvas;
        }

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const decodeFn = (jsQR as any).default || jsQR;
          const code = decodeFn(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth",
          });

          if (code && code.data) {
            handleDetectedData(code.data);
            return;
          }
        }
      } catch (err) {
        console.warn("jsQR frame scan error:", err);
      }
    }

    if (isScanningRef.current) {
      scanningLoopRef.current = requestAnimationFrame(scanFrame);
    }
  }, [handleDetectedData]);

  // Start camera stream with progressive fallbacks
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    setScannedResult(null);

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setCameraError(
        "Camera access is not supported by your browser or connection. You can pick your table directly from the list below."
      );
      return;
    }

    let stream: MediaStream | null = null;

    // Constraint attempt 1: Ideal facingMode and dimensions
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
    } catch {
      // Constraint attempt 2: Ideal facingMode without fixed dimensions
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode } },
          audio: false,
        });
      } catch {
        // Constraint attempt 3: Generic video device
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch (err: any) {
          console.warn("Camera init error:", err);
          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            setCameraError(
              "Camera permission was denied. Please allow camera permissions in your browser or select your table below."
            );
          } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
            setCameraError(
              "No camera device detected on this system. Please choose your table directly."
            );
          } else {
            setCameraError(
              "Could not start video stream. You can pick your table directly below."
            );
          }
          return;
        }
      }
    }

    if (stream) {
      streamRef.current = stream;
      if (videoRef.current) {
        const vid = videoRef.current;
        vid.srcObject = stream;
        vid.setAttribute("playsinline", "true");
        vid.setAttribute("webkit-playsinline", "true");
        vid.muted = true;
        try {
          await vid.play();
          setCameraActive(true);
          isScanningRef.current = true;
          scanningLoopRef.current = requestAnimationFrame(scanFrame);
        } catch (playErr) {
          console.warn("Video play error:", playErr);
          setCameraActive(true);
          isScanningRef.current = true;
          scanningLoopRef.current = requestAnimationFrame(scanFrame);
        }
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
      img.onload = async () => {
        // Check BarcodeDetector first
        if (typeof window !== "undefined" && "BarcodeDetector" in window) {
          try {
            const barcodeDetector = new (window as any).BarcodeDetector({
              formats: ["qr_code"],
            });
            const barcodes = await barcodeDetector.detect(img);
            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
              handleDetectedData(barcodes[0].rawValue);
              return;
            }
          } catch {}
        }

        // Canvas fallback
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const decodeFn = (jsQR as any).default || jsQR;
        const code = decodeFn(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth",
        });

        if (code && code.data) {
          handleDetectedData(code.data);
        } else {
          setCameraError(
            "Could not detect a QR code in the uploaded image. Please try another image or select your table below."
          );
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Switch camera front/back
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Manage camera on modal open/close or tab switch
  useEffect(() => {
    if (isOpen && activeTab === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
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
              <div className="w-9 h-9 rounded-full bg-[#1B382B] text-white flex items-center justify-center shadow-xs">
                <QrCode className="w-5 h-5 text-[#8EBA9D]" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1B382B]">
                  Dine-In Table Scanner
                </h3>
                <p className="text-[11px] text-[#55635B]">
                  Scan table stand QR or pick your table number
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
              <span>Select Table</span>
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
                  {/* Video Viewport */}
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                    autoPlay
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

                  {/* Success detection overlay */}
                  {scannedResult && (
                    <div className="absolute inset-0 bg-[#1B382B]/90 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4 text-center">
                      <CheckCircle2 className="w-12 h-12 text-[#8EBA9D] animate-bounce mb-2" />
                      <p className="font-serif font-bold text-lg">Table Recognized!</p>
                      <p className="text-xs text-[#8EBA9D]">Connecting table session...</p>
                    </div>
                  )}

                  {/* Camera switch control */}
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button
                      onClick={toggleFacingMode}
                      className="p-2.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-sm cursor-pointer shadow"
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
                        className="underline font-bold mt-1.5 text-[#1B382B] block cursor-pointer"
                      >
                        Choose your table directly from the list →
                      </button>
                    </div>
                  </div>
                )}

                {/* Photo upload action */}
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E6E1D5] bg-white text-[#151E19] hover:bg-[#F3EFE6] font-medium cursor-pointer transition-colors"
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
                        setTableSessionByToken(table.qrToken);
                        onClose();
                        if (onSelectTable) {
                          onSelectTable(table.qrToken);
                        } else {
                          const dest = pendingItemId
                            ? `/order/${table.qrToken}?addItem=${encodeURIComponent(pendingItemId)}`
                            : `/order/${table.qrToken}`;
                          router.push(dest);
                        }
                      }}
                      className="p-3.5 rounded-2xl bg-white border border-[#E6E1D5] hover:border-[#1B382B] hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
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
                        <span>Select This Table</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: QR STAND DEMO & REAL SCANNABLE CODES */}
            {activeTab === "demo" && (
              <div className="space-y-3">
                <p className="text-xs text-[#55635B]">
                  In the cafe, each table has an acrylic stand with a unique QR code. You can test live by pointing your smartphone camera at these codes:
                </p>

                <div className="grid grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
                  {CAFE_CONFIG.tables.map((table) => {
                    const qrUrl = demoQrMap[table.id];
                    return (
                      <div
                        key={table.id}
                        className="p-3 rounded-2xl bg-white border border-[#E6E1D5] flex flex-col items-center text-center space-y-2 shadow-xs"
                      >
                        <div className="w-28 h-28 bg-[#FBF9F4] rounded-xl flex items-center justify-center border border-[#E6E1D5] p-1.5">
                          {qrUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={qrUrl}
                              alt={`QR for ${table.label}`}
                              className="w-full h-full object-contain rounded-lg"
                            />
                          ) : (
                            <QrCode className="w-14 h-14 text-[#1B382B]" />
                          )}
                        </div>
                        <div>
                          <span className="font-serif font-bold text-xs text-[#1B382B] block">
                            {table.label}
                          </span>
                          <span className="text-[10px] text-[#55635B] block font-mono">
                            {table.capacity} Guests
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setTableSessionByToken(table.qrToken);
                            onClose();
                            if (onSelectTable) {
                              onSelectTable(table.qrToken);
                            } else {
                              const dest = pendingItemId
                                ? `/order/${table.qrToken}?addItem=${encodeURIComponent(pendingItemId)}`
                                : `/order/${table.qrToken}`;
                              router.push(dest);
                            }
                          }}
                          className="w-full py-1.5 text-[11px] font-semibold rounded-xl bg-[#1B382B] text-white hover:bg-[#12241C] cursor-pointer transition-colors"
                        >
                          Open Menu
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-[#E6E1D5] flex items-center justify-between">
                  <span className="text-xs text-[#55635B]">Staff printable stands?</span>
                  <button
                    onClick={() => {
                      onClose();
                      router.push("/admin");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B382B] hover:text-[#4E7A63] underline cursor-pointer"
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
