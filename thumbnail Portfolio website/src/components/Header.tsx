import React, { useState } from 'react';
import { Menu, X, PhoneCall, Shield, LogOut, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useBranding } from '../context/BrandingContext';

interface HeaderProps {
  isAdmin: boolean;
  onAdminToggle: () => void;
  onNavigate: (sectionId: string) => void;
  activeSection: string;
}

export default function Header({ isAdmin, onAdminToggle, onNavigate, activeSection }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { branding } = useBranding();

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'gallery', label: 'Portfolio' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'faq', label: 'FAQ' },
    { id: 'stats', label: 'Stats' },
    { id: 'contact', label: 'Contact' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'tracker', label: 'Track Order' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
      // Wait for the exit transition of the mobile menu height (0.2s) to complete.
      // This ensures the page layout is completely stabilized before calculating scroll positions.
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 250);
    } else {
      setMobileMenuOpen(false);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const getWhatsAppHeaderUrl = () => {
    const text = encodeURIComponent(`Hello ${branding.companyName || 'Rohan'}! I am interested in ordering some custom high-CTR YouTube thumbnails for my channel. Can you help me?`);
    return `https://wa.me/${branding.whatsappNumber || '919041489449'}?text=${text}`;
  };

  return (
    <>
      {/* Top Banner */}
      <div className="w-full bg-zinc-950 border-b border-white/5 py-2 px-4 relative overflow-hidden">
        {/* Subtle Indian Flag Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-white/5 to-emerald-600/10 opacity-70 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl flex items-center justify-center gap-2.5 text-[11px] font-mono tracking-wide text-zinc-300">
          <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 bg-white/5 border border-white/10 font-bold shadow-sm">
            <span className="w-2.5 h-1.5 bg-[#FF9933] rounded-xs" />
            <span className="w-2.5 h-1.5 bg-white rounded-xs flex items-center justify-center"><span className="w-0.5 h-0.5 rounded-full bg-[#000080]" /></span>
            <span className="w-2.5 h-1.5 bg-[#138808] rounded-xs" />
          </span>
          <span>Proudly an <strong className="text-white">{branding.companyName || 'Indian'} Thumbnail Designer</strong> 🇮🇳 Serving Clients Worldwide with High-CTR Designs!</span>
        </div>
      </div>

      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/60 backdrop-blur-md">
        <div className="mx-auto flex min-h-[88px] py-3 px-4 sm:px-6 lg:px-8 max-w-7xl items-center justify-between gap-4 lg:gap-8">
          {/* Logo - Prominent, 3-4x larger, premium dark purple-blue theme */}
          <div 
            onClick={() => handleNavClick('home')} 
            className="group flex cursor-pointer items-center gap-3.5 sm:gap-4 shrink-0 transition-transform duration-200 hover:scale-[1.01]"
            id="header-logo"
          >
            {/* Logo Icon Container with Ambient Purple-Blue Glow */}
            <div className="relative flex shrink-0 items-center justify-center">
              {/* Ambient Purple/Blue Gradient Glow */}
              <div 
                className="absolute -inset-1 rounded-2xl opacity-75 blur-md group-hover:opacity-100 transition duration-300 animate-pulse"
                style={{ backgroundImage: `linear-gradient(135deg, ${branding.brandColor || '#8b5cf6'}, ${branding.secondaryColor || '#6366f1'})` }}
              />
              
              {/* Main Icon Box (300% larger icon container: 56px x 56px on mobile, 64px x 64px on sm+) */}
              <div 
                className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border-2 border-white/20 bg-zinc-950/90 shadow-2xl shadow-indigo-500/30 shrink-0 overflow-hidden"
                style={{ backgroundImage: `linear-gradient(135deg, ${branding.brandColor}33, ${branding.secondaryColor}33)` }}
              >
                {branding.websiteLogo ? (
                  <img src={branding.websiteLogo} alt="Logo" className="h-full w-full object-cover rounded-xl" referrerPolicy="no-referrer" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-violet-600 to-indigo-600">
                    <span className="font-display text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                      {(branding.websiteName || 'R')[0].toUpperCase()}
                    </span>
                  </div>
                )}
                {/* Active online status dot */}
                <div className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-zinc-950 shadow-sm shadow-emerald-500/50 animate-pulse z-10" />
              </div>
            </div>

            {/* Brand Name & Tagline */}
            <div className="flex flex-col justify-center">
              {/* Brand Name (Increased by 180%, text-2xl sm:text-3xl font-black) */}
              <span className="font-display text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-none drop-shadow-sm group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-purple-200 group-hover:to-indigo-200 transition-all">
                {branding.websiteName}
              </span>
              {/* Enlarged Tagline with clear readability */}
              <span className="font-mono text-[11px] sm:text-xs font-semibold tracking-wider text-purple-200/90 uppercase mt-1 leading-tight flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-[280px]">
                  {branding.businessDescription ? (branding.businessDescription.length > 38 ? branding.businessDescription.substring(0, 38) + '...' : branding.businessDescription) : 'CTR Booster Elite'}
                </span>
              </span>
            </div>
          </div>

          {/* Desktop Nav - Starts right after logo */}
          <nav className="hidden md:flex items-center gap-0.5 lg:gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`relative px-4 py-2 font-display text-xs uppercase tracking-wider font-semibold transition-colors ${
                activeSection === item.id 
                  ? 'text-white' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {item.label}
              {activeSection === item.id && (
                <motion.div 
                  layoutId="activeNavIndicator"
                  className="absolute bottom-0 left-4 right-4 h-0.5"
                  style={{ backgroundImage: `linear-gradient(to right, ${branding.brandColor}, ${branding.secondaryColor})` }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={onAdminToggle}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 font-display text-xs font-semibold transition-all duration-200 border ${
              isAdmin 
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20' 
                : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            {isAdmin ? (
              <>
                <LogOut className="h-3.5 w-3.5" />
                Logout Admin
              </>
            ) : (
              <>
                <Shield className="h-3.5 w-3.5" />
                Admin Portal
              </>
            )}
          </button>

          <a
            href={getWhatsAppHeaderUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded-full px-5 py-2.5 font-display text-xs uppercase tracking-wider font-black text-white shadow-lg hover:scale-[1.02] transition-all text-center"
            style={{ backgroundImage: `linear-gradient(to right, ${branding.brandColor}, ${branding.secondaryColor})` }}
          >
            <PhoneCall className="h-4 w-4 text-cyan-100 group-hover:animate-bounce" />
            WhatsApp Order
          </a>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={onAdminToggle}
            className={`flex items-center justify-center p-2 rounded-full border ${
              isAdmin 
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
                : 'bg-white/5 text-white/80 border-white/10'
            }`}
          >
            <Shield className="h-4 w-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b border-white/10 bg-black/95 md:hidden overflow-hidden"
          >
            <div className="space-y-1.5 px-4 pt-3 pb-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex w-full items-center rounded-xl px-4 py-3 font-display text-xs uppercase tracking-wider font-semibold ${
                    activeSection === item.id
                      ? 'text-white border-l-2'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                  style={activeSection === item.id ? { 
                    borderColor: branding.brandColor,
                    backgroundImage: `linear-gradient(to right, ${branding.brandColor}1a, ${branding.secondaryColor}1a)`
                  } : {}}
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (!isAdmin) {
                      // On mobile, wait for the menu to close so the scroll is precise and doesn't get aborted
                      setTimeout(() => {
                        const el = document.getElementById('admin');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 250);
                    } else {
                      onAdminToggle();
                    }
                  }}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-display text-xs uppercase tracking-wider font-semibold border ${
                    isAdmin 
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
                      : 'bg-white/5 text-white/80 border-white/10'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  {isAdmin ? 'Logout Admin Panel' : 'Admin Login'}
                </button>
                <a
                  href={getWhatsAppHeaderUrl()}
                  onClick={() => setMobileMenuOpen(false)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2.5 rounded-full px-4 py-3 font-display text-xs uppercase tracking-wider font-black text-white shadow-md text-center"
                  style={{ backgroundImage: `linear-gradient(to right, ${branding.brandColor}, ${branding.secondaryColor})` }}
                >
                  <PhoneCall className="h-4 w-4" />
                  WhatsApp Fast Order
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
    </>
  );
}
