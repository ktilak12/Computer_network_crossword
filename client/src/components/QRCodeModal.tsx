import React from 'react';
import { X, Copy, Check, QrCode, ExternalLink } from 'lucide-react';
import { sound } from '../utils/sound.js';

interface QRCodeModalProps {
  roomCode: string;
  qrCodeUrl?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  roomCode,
  qrCodeUrl,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);
  const joinUrl = `${window.location.origin}/join/${roomCode}`;

  if (!isOpen) return null;

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl text-center animate-pop-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30 text-xs font-mono font-bold mb-3">
          <QrCode className="w-3.5 h-3.5 text-violet-400" />
          <span>JOIN CLASSROOM GAME</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-100 font-sans">
          Scan to Enter Race
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1 mb-5">
          Scan with phone camera to join instantly
        </p>

        {/* QR Code Container */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/40 inline-block shadow-2xl hud-glow-cyan mb-5">
          {qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt={`QR Code for Room ${roomCode}`}
              className="w-56 h-56 rounded-xl mx-auto"
            />
          ) : (
            <div className="w-56 h-56 rounded-xl flex items-center justify-center bg-slate-900 text-slate-400 font-mono text-xs">
              Generating QR Code...
            </div>
          )}
        </div>

        {/* Room Code Badge */}
        <div className="mb-4">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest block">
            OR ENTER ROOM CODE MANUALLY
          </span>
          <span className="font-mono text-3xl font-black text-cyan-400 tracking-widest">
            {roomCode}
          </span>
        </div>

        {/* Copy Join Link Button */}
        <button
          onClick={handleCopy}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-200 font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
          <span>{copied ? 'LINK COPIED TO CLIPBOARD' : 'COPY JOIN URL'}</span>
        </button>
      </div>
    </div>
  );
};
