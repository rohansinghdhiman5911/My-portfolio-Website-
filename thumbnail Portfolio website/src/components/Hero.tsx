import React, { useState } from 'react';
import { Sparkles, ArrowRight, TrendingUp, Youtube, Zap, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useBranding } from '../context/BrandingContext';

interface HeroProps {
  onNavigate: (sectionId: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  const [activeTeaser, setActiveTeaser] = useState<'gaming' | 'tech'>('gaming');
  const { branding } = useBranding();

  const teasers = {
    gaming: {
      title: "I Survived 100 Days in Hardcore Cyberpunk",
      channel: "ShroudPlay",
      ctr: "12.4% CTR",
      badge: "Gaming viral trend",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
    },
    tech: {
      title: "Is this the ultimate $5,000 Apple setup?",
      channel: "MKBHD Tech",
      ctr: "14.1% CTR",
      badge: "Clean tech hyper-hype",
      image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80",
    }
  };

  const handleScroll = (id: string) => {
    onNavigate(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative overflow-hidden bg-[#050505] py-20 lg:py-32">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />

      {/* Decorative Blur Orbs */}
      <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full blur-[120px]" style={{ backgroundColor: `${branding.secondaryColor}1a` }} />
      <div className="absolute top-1/2 right-1/4 h-96 w-96 rounded-full blur-[120px]" style={{ backgroundColor: `${branding.brandColor}1a` }} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-12">
          
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-8">
            {/* Tagline Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <div 
                className="inline-flex items-center gap-2 rounded-full bg-white/5 border px-3.5 py-1.5 font-mono text-[10px] tracking-widest uppercase font-semibold text-cyan-400"
                style={{ borderColor: `${branding.brandColor}33`, color: branding.brandColor }}
              >
                <Sparkles className="h-3.5 w-3.5 animate-pulse" style={{ color: branding.brandColor }} />
                <span>HIGH-CTR CUSTOM THUMBNAIL DESIGN</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 border border-orange-500/20 px-3.5 py-1.5 font-mono text-[10px] tracking-widest uppercase font-semibold text-orange-400">
                <span className="inline-flex items-center gap-0.5 select-none">
                  <span className="w-2.5 h-1.5 bg-[#FF9933] rounded-xs" />
                  <span className="w-2.5 h-1.5 bg-white rounded-xs flex items-center justify-center"><span className="w-0.5 h-0.5 rounded-full bg-[#000080]" /></span>
                  <span className="w-2.5 h-1.5 bg-[#138808] rounded-xs" />
                </span>
                <span>{branding.companyName ? branding.companyName.toUpperCase() : 'INDIAN'} DESIGNER 🇮🇳</span>
              </div>
            </div>

            {/* Display Header */}
            <h1 className="font-display text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
              {branding.heroHeading.split('.').slice(0, -1).join('.') || branding.heroHeading}
              <span 
                className="relative inline-block bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(to right, ${branding.brandColor}, ${branding.secondaryColor})` }}
              >
                {branding.heroHeading.includes('.') ? '.' + branding.heroHeading.split('.').pop() : ''}
              </span>
            </h1>

            {/* Subtext */}
            <p className="max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
              {branding.heroSubtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => handleScroll('contact')}
                className="group flex items-center justify-center gap-2 rounded-full px-7 py-4 font-display text-xs uppercase tracking-wider font-black text-white shadow-lg hover:scale-[1.02] transition-all"
                style={{ backgroundImage: `linear-gradient(to right, ${branding.brandColor}, ${branding.secondaryColor})` }}
              >
                Start Custom Project
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              
              <button
                onClick={() => handleScroll('gallery')}
                className="flex items-center justify-center gap-2 rounded-full bg-white/5 border border-white/10 px-7 py-4 font-display text-xs uppercase tracking-wider font-bold text-white/80 hover:bg-white/10 hover:text-white transition-all"
              >
                Browse Gallery
              </button>
            </div>

          </div>

          {/* Interactive Mockup Container */}
          <div className="lg:col-span-5">
            <div className="relative">
              {/* Outer Neon Glow Case */}
              <div 
                className="absolute -inset-1 rounded-2xl opacity-20 blur-lg" 
                style={{ backgroundImage: `linear-gradient(to top right, ${branding.brandColor}, ${branding.secondaryColor})` }}
              />
              
              {/* YouTube Video Mockup Card */}
              <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-3 shadow-2xl backdrop-blur-xl">
                
                {/* Mock Browser Header */}
                <div className="mb-3.5 flex items-center justify-between border-b border-white/10 pb-3 px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-0.5 border border-white/5 font-mono text-[9px] text-white/40 uppercase">
                    <Youtube className="h-3 w-3 text-red-500" />
                    <span>CTR Simulator</span>
                  </div>
                </div>

                {/* Simulated YouTube Video Frame */}
                <div className="group relative overflow-hidden rounded-xl bg-[#0a0a0a] aspect-video shadow-inner border border-white/5">
                  {/* Actual Thumbnail Image */}
                  <img
                    src={teasers[activeTeaser].image}
                    alt={teasers[activeTeaser].title}
                    className="h-full w-full object-cover object-center transition-all duration-350"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Accent elements making it look like YouTube video */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                    <span className="rounded-md bg-black/80 border border-white/10 px-2 py-0.5 font-mono text-[10px] font-bold text-white shadow">
                      {teasers[activeTeaser].ctr}
                    </span>
                    <span 
                      className="rounded-md border border-white/10 px-2 py-0.5 font-mono text-[9px] font-bold text-white shadow uppercase tracking-wide"
                      style={{ backgroundColor: `${branding.secondaryColor}e6` }}
                    >
                      {teasers[activeTeaser].badge}
                    </span>
                  </div>

                  <span className="absolute bottom-2 right-2 rounded bg-black/80 border border-white/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-white">
                    10:42
                  </span>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity bg-radial from-transparent to-black/30">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 border border-white/25 backdrop-blur-sm text-white">
                      <Zap className="h-6 w-6 text-yellow-400 fill-yellow-400 animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Video Info Panel */}
                <div className="mt-4 px-1 pb-1">
                  <h4 className="font-display text-sm font-bold text-white line-clamp-1">
                    {teasers[activeTeaser].title}
                  </h4>
                  <div className="mt-1 flex items-center justify-between text-xs text-white/40">
                    <span className="font-medium text-white/60">{teasers[activeTeaser].channel}</span>
                    <div 
                      className="flex items-center gap-1.5 font-mono font-semibold px-1.5 py-0.5 rounded border"
                      style={{ 
                        color: branding.brandColor, 
                        borderColor: `${branding.brandColor}33`,
                        backgroundColor: `${branding.brandColor}11`
                      }}
                    >
                      <TrendingUp className="h-3 w-3" />
                      <span>Best CTR Style</span>
                    </div>
                  </div>
                </div>

                {/* Simulator Controls */}
                <div className="mt-4.5 pt-3.5 border-t border-white/10">
                  <div className="mb-2 text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest text-center">
                    Switch Niche to Preview CTR Boost
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['gaming', 'tech'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setActiveTeaser(type)}
                        className={`rounded-full py-2 text-center font-display text-[10px] tracking-wider uppercase font-semibold transition-all ${
                          activeTeaser === type
                            ? 'text-white shadow-md'
                            : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
                        }`}
                        style={activeTeaser === type ? {
                          backgroundImage: `linear-gradient(to right, ${branding.brandColor}, ${branding.secondaryColor})`
                        } : {}}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
