import React, { useState } from 'react';
import { MessageSquare, X, Phone, ShieldCheck, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useBranding } from '../context/BrandingContext';

export default function WhatsAppFloating() {
  const { branding } = useBranding();
  const [isOpen, setIsOpen] = useState(false);

  // Phone number of the developer or support channel (using Indian format as seen in seed inquiries, or general)
  const WHATSAPP_NUMBER = branding.whatsappNumber || '919041489449'; 
  const DEFAULT_MESSAGE = encodeURIComponent(`Hello ${branding.companyName || 'Rohan'}! I'm interested in ordering high-CTR custom thumbnails. Can you help me get started?`);

  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${DEFAULT_MESSAGE}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
      
      {/* Expanded Support Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-80 rounded-2xl border border-zinc-850 bg-zinc-900/95 p-4.5 shadow-2xl backdrop-blur-md pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-850/60">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Phone className="h-4.5 w-4.5" />
                  <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-zinc-900"></span>
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-white">Booster Support</h4>
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] text-zinc-400 font-mono">Typically replies in minutes</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-950/80 border border-zinc-850 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Body Info */}
            <div className="py-4 space-y-3.5">
              <div className="p-3 bg-zinc-950/60 border border-zinc-850/60 rounded-xl space-y-2">
                <p className="text-zinc-300 text-xs leading-relaxed font-sans">
                  Hey! Feel free to ask about custom layouts, specific package requests, or delivery timescales.
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                  <Clock className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Normal Hours: 4:00 PM - 10:00 PM IST</span>
                </div>
              </div>

              {/* Secure / Verified badge */}
              <div className="flex items-center gap-2 px-1 text-[10.5px] font-mono text-zinc-500">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Verified Direct Creator WhatsApp Line</span>
              </div>
            </div>

            {/* Direct WhatsApp Call to Action */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm py-3 px-4 rounded-xl transition-all shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 flex items-center justify-center gap-2 font-sans"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              Open WhatsApp Chat
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto flex h-13 w-13 items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-xl hover:scale-105 active:scale-95 transition-all relative group"
        whileTap={{ scale: 0.95 }}
      >
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-600 border border-zinc-950"></span>
        </span>
        
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageSquare className="h-6 w-6 fill-zinc-950" />
        )}

        {/* Hover label for non-touch desktops */}
        {!isOpen && (
          <span className="absolute right-15 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-zinc-900 text-white border border-zinc-800 text-[11px] font-mono tracking-wider font-bold uppercase px-3 py-1.5 rounded-xl shadow-lg pointer-events-none">
            Chat on WhatsApp
          </span>
        )}
      </motion.button>

    </div>
  );
}
