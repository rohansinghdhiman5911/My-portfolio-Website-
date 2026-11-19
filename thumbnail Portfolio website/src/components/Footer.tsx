import React from 'react';
import { PhoneCall, Heart } from 'lucide-react';
import { useBranding } from '../context/BrandingContext';

export default function Footer() {
  const { branding } = useBranding();

  const getWhatsAppFooterUrl = () => {
    const text = encodeURIComponent(`Hello ${branding.companyName || 'Rohan'}! I want to inquire about designing some custom YouTube thumbnails. Can we discuss?`);
    const num = branding.whatsappNumber || "919041489449";
    return `https://wa.me/${num}?text=${text}`;
  };

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-6 sm:flex-row">
        
        {/* Logo and Tag */}
        <div className="flex flex-col items-center sm:items-start gap-1">
          <div className="flex items-center gap-2">
            <div 
              className="relative flex h-8 w-8 items-center justify-center rounded-lg shadow"
              style={{ backgroundImage: `linear-gradient(to top right, ${branding.brandColor}, ${branding.secondaryColor})` }}
            >
              {branding.websiteLogo ? (
                <img src={branding.websiteLogo} alt="Logo" className="h-full w-full object-cover rounded-lg" referrerPolicy="no-referrer" />
              ) : (
                <span className="font-display text-sm font-bold text-white">
                  {(branding.websiteName || 'R')[0].toUpperCase()}
                </span>
              )}
            </div>
            <span className="font-display text-base font-bold text-white">
              {branding.websiteName}
            </span>
          </div>
          <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest mt-1">
            Double Your Click-Through Rate
          </p>
        </div>
 
        {/* Action WhatsApp support */}
        <div className="flex flex-col items-center sm:items-end gap-1.5">
          <a
            href={getWhatsAppFooterUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-xs font-semibold text-zinc-300 px-4.5 py-2.5 transition-all hover:border-zinc-700 text-center"
            style={{ '--hover-color': branding.brandColor } as React.CSSProperties}
          >
            <PhoneCall className="h-3.5 w-3.5 group-hover:animate-bounce" style={{ color: branding.brandColor }} />
            24/7 WhatsApp Hotline
          </a>
          <span className="font-mono text-[9px] text-zinc-600 tracking-wider">Average response: 15 mins</span>
        </div>

      </div>

      {/* Under copyright */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-zinc-600 text-[11px] font-mono">
          {branding.footerCopyright ? branding.footerCopyright.replace('{year}', new Date().getFullYear().toString()) : `\u00A9 ${new Date().getFullYear()} ${branding.websiteName}. All rights reserved. Not affiliated with YouTube.`}
        </p>
        
        <div className="flex items-center gap-1 text-zinc-600 text-[11px] font-mono">
          <span>Crafted with</span>
          <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
          <span>for YouTube Creators</span>
        </div>
      </div>

    </footer>
  );
}
