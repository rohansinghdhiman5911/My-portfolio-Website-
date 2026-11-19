import React from 'react';
import { PricingTier } from '../types';
import { PRICING_TIERS } from '../data';
import { Check, PhoneCall, Sparkles, Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { useBranding } from '../context/BrandingContext';

interface PricingProps {
  onSelectPackage: (packageName: string) => void;
}

export default function Pricing({ onSelectPackage }: PricingProps) {
  const { branding } = useBranding();

  const pkg1FeaturesList = branding.pkg1Features
    ? branding.pkg1Features.split('\n').map((f) => f.trim()).filter(Boolean)
    : PRICING_TIERS[0].features;

  const dynamicPricingTiers: PricingTier[] = [
    {
      id: 'tier1',
      name: branding.pkg1Name || PRICING_TIERS[0].name,
      price: branding.pkg1Price || PRICING_TIERS[0].price,
      originalPrice: branding.pkg1OriginalPrice !== undefined && branding.pkg1OriginalPrice !== '' ? branding.pkg1OriginalPrice : PRICING_TIERS[0].originalPrice,
      description: branding.pkg1Description || PRICING_TIERS[0].description,
      features: pkg1FeaturesList,
      isPopular: true,
      tag: branding.pkg1Tag !== undefined && branding.pkg1Tag !== '' ? branding.pkg1Tag : PRICING_TIERS[0].tag,
    },
    ...PRICING_TIERS.slice(1),
  ];
  
  const getWhatsAppPricingUrl = (tier: PricingTier) => {
    const text = encodeURIComponent(
      `Hello ${branding.companyName || 'Rohan'}! I am viewing your thumbnail design portfolio and would like to order the "${tier.name}" pack (${tier.price}). Can we discuss the requirements for my channel?`
    );
    return `https://wa.me/${branding.whatsappNumber || '919041489449'}?text=${text}`;
  };

  return (
    <section id="pricing" className="relative bg-zinc-950 py-24 border-t border-zinc-900">
      
      {/* Visual lighting background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3.5 py-1.5 font-mono text-xs font-semibold text-cyan-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>TRANSPARENT PACKAGES</span>
          </div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Flexible Pricing for Growing Channels
          </h2>
          <p className="max-w-2xl text-base text-zinc-400 sm:text-lg">
            Choose a package that matches your uploading frequency. All layouts are custom designed for high CTR and pristine channel branding.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid gap-8 max-w-md mx-auto items-stretch">
          {dynamicPricingTiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative rounded-2xl border bg-zinc-900 p-6 flex flex-col justify-between shadow-xl transition-all ${
                tier.isPopular
                  ? 'border-indigo-500 shadow-indigo-500/5 z-10'
                  : 'border-zinc-850 hover:border-zinc-700'
              }`}
            >
              {/* Highlight Ribbon for Popular Package */}
              {tier.isPopular && (
                <div className="absolute top-0 right-6 -translate-y-1/2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1 font-mono text-[9px] font-extrabold text-white uppercase tracking-wider shadow">
                  <Flame className="h-3 w-3 fill-white" />
                  <span>Most Popular Choice</span>
                </div>
              )}

              {/* Package Meta Info */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-display text-xl font-black text-white">{tier.name}</h3>
                  {tier.tag && (
                    <span className={`rounded bg-zinc-950/80 px-2.5 py-0.5 font-mono text-[10px] font-bold border ${
                      tier.isPopular ? 'border-indigo-500/30 text-indigo-400' : 'border-zinc-850 text-zinc-500'
                    }`}>
                      {tier.tag}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 pt-1 flex-wrap">
                  {tier.originalPrice && (
                    <span className="font-display text-2xl font-medium text-zinc-500 line-through">
                      {tier.originalPrice}
                    </span>
                  )}
                  {tier.originalPrice && (
                    <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850 uppercase tracking-wider">
                      only
                    </span>
                  )}
                  <span className="font-display text-4xl font-extrabold text-white">{tier.price}</span>
                  <span className="font-mono text-xs text-zinc-500">
                    flat
                  </span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed min-h-[40px]">
                  {tier.description}
                </p>

                {/* Features Checklist */}
                <div className="pt-6 border-t border-zinc-850 space-y-3">
                  <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2.5">
                    What's Included:
                  </div>
                  {tier.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 shrink-0">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-zinc-300 leading-normal">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="mt-8 pt-6 border-t border-zinc-850/50 space-y-2.5">
                <a
                  href={getWhatsAppPricingUrl(tier)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full flex items-center justify-center gap-2.5 rounded-xl py-3 font-display text-xs font-bold transition-all shadow text-center ${
                    tier.isPopular
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/10 hover:shadow-emerald-500/20'
                      : 'bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  Order on WhatsApp
                </a>

                <button
                  onClick={() => {
                    onSelectPackage(tier.name);
                    const el = document.getElementById('contact');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full text-center text-zinc-500 hover:text-indigo-400 font-mono text-[10px] uppercase font-bold py-1.5 transition-colors"
                >
                  Inquire via form instead
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
