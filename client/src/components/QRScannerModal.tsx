import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Camera, RefreshCw, Upload, AlertCircle, Sparkles } from 'lucide-react';
import jsQR from 'jsqr';
import { sound } from '../utils/sound.js';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (roomCode: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isScanning, setIsScanning] = useState(false);

  // Helper to extract room code from scanned QR text
  const extractRoomCode = (rawText: string): string => {
    const trimmed = rawText.trim();

    // Check if it's a URL like .../join/ABCDEF
    try {
      const url = new URL(trimmed);
      const pathParts = url.pathname.split('/').filter(Boolean);
      const joinIndex = pathParts.findIndex((p) => p.toLowerCase() === 'join');
      if (joinIndex !== -1 && pathParts[joinIndex + 1]) {
        return pathParts[joinIndex + 1].toUpperCase();
      }
      const codeParam = url.searchParams.get('code') || url.searchParams.get('room');
      if (codeParam) {
        return codeParam.toUpperCase();
      }
    } catch {
      // Not a valid full URL, treat as raw text or path
    }

    const match = trimmed.match(/join\/([a-zA-Z0-9]+)/i);
    if (match && match[1]) {
      return match[1].toUpperCase();
    }

    // Default: strip non-alphanumeric and truncate to max length
    return trimmed.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase();
  };

  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  const handleDetectedCode = useCallback(
    (codeText: string) => {
      const code = extractRoomCode(codeText);
      if (code) {
        sound.playCorrect();
        if ('vibrate' in navigator) {
          try {
            navigator.vibrate(100);
          } catch {
            // Ignore vibration errors
          }
        }
        stopCamera();
        onScanSuccess(code);
      }
    },
    [onScanSuccess, stopCamera]
  );

  // Scan frame from video loop
  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
    });

    if (code && code.data) {
      handleDetectedCode(code.data);
      return;
    }

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  }, [handleDetectedCode]);

  // Start Camera
  const startCamera = useCallback(async () => {
    stopCamera();
    setErrorMessage(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasPermission(false);
      setErrorMessage('Camera access is not supported by your current browser.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setHasPermission(true);
      setIsScanning(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play().catch(() => {});
        animationFrameRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setHasPermission(false);
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera permissions or upload a QR image below.'
          : 'Unable to start camera. You can upload a photo of the QR code instead.'
      );
    }
  }, [facingMode, scanFrame, stopCamera]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Flip Camera between front & back
  const handleToggleFacingMode = () => {
    sound.playClick();
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Decode uploaded image
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playClick();
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const qr = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });
          if (qr && qr.data) {
            handleDetectedCode(qr.data);
          } else {
            setErrorMessage('No valid QR code was detected in that image. Try another photo.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-5 sm:p-7 border border-white/10 shadow-2xl text-center flex flex-col">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            stopCamera();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold mb-3 self-center">
          <Camera className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>SCAN ROOM QR CODE</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-100 font-sans tracking-tight">
          Point at Teacher's Screen
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1 mb-4">
          Align the QR code within the frame to join automatically
        </p>

        {/* Viewfinder Area */}
        <div className="relative w-full aspect-square max-h-[300px] rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/30 shadow-2xl flex items-center justify-center mb-4">
          {/* Hidden Canvas for Decoding */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Video Stream */}
          <video
            ref={videoRef}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isScanning ? 'opacity-100' : 'opacity-0'
            }`}
            autoPlay
            playsInline
            muted
          />

          {/* Fallback error overlay */}
          {errorMessage && (
            <div className="absolute inset-0 p-4 bg-slate-950/95 flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
              <p className="text-xs text-amber-200 font-mono px-3 mb-3 leading-relaxed">
                {errorMessage}
              </p>
              <button
                type="button"
                onClick={startCamera}
                className="py-1.5 px-3 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono flex items-center gap-1 hover:bg-cyan-500/30"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Camera</span>
              </button>
            </div>
          )}

          {/* Animated Scanning Laser & Target Frame */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Corner reticles */}
              <div className="w-48 h-48 sm:w-56 sm:h-56 relative border-2 border-dashed border-cyan-400/40 rounded-2xl flex items-center justify-center">
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br-lg" />

                {/* Sweeping Laser Line */}
                <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-pulse" style={{
                  animation: 'scanLaser 2s ease-in-out infinite alternate',
                }} />
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex gap-2">
          {hasPermission && (
            <button
              type="button"
              onClick={handleToggleFacingMode}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Flip Camera</span>
            </button>
          )}

          {/* Upload Image Option */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-violet-400" />
            <span>Upload Photo</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </div>
    </div>
  );
};
