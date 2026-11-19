import React, { createContext, useContext, useState, useEffect } from 'react';
import { Branding } from '../types';

interface BrandingContextType {
  branding: Branding;
  updateBrandingState: (updated: Partial<Branding>) => void;
  loading: boolean;
}

const defaultBranding: Branding = {
  id: 'main',
  websiteName: 'RohanThumbnails.com',
  websiteLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
  browserTabTitle: 'RohanThumbnails - Double Your YouTube CTR',
  browserFavicon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=32&h=32&q=80',
  heroHeading: 'Thumbnails That Get Clicked.',
  heroSubtitle: 'High-converting custom thumbnails. We combine audience psychology, bold contrast framing, and pixel-perfect clarity to double your click-through rates.',
  footerCopyright: 'RohanThumbnails.com. All rights reserved. Not affiliated with YouTube.',
  companyName: 'RohanThumbnails',
  brandColor: '#06b6d4',
  secondaryColor: '#9333ea',
  contactEmail: 'contact@rohanthumbnails.com',
  whatsappNumber: '919041489449',
  supportEmail: 'support@rohanthumbnails.com',
  address: 'Mumbai, India',
  businessDescription: 'Premium thumbnail design studio focused on maximizing YouTube CTR for professional creators.',
  pkg1Name: 'Starter Booster Pack',
  pkg1Price: '₹49',
  pkg1OriginalPrice: '₹99',
  pkg1Tag: 'Limited Offer',
  pkg1Description: 'Special discounted offer! Prices start from ₹49. Final price depends on design complexity and delivery time. You can order at any time, but normal working hours are 4:00 PM to 10:00 PM (Evening to Night).',
  pkg1Features: '1 Custom High-CTR Thumbnail\nUltra High Resolution (1080p)\n24-Hour Delivery Time\nOrder anytime (Normal Hours: 4:00 PM - 10:00 PM Evening to Night)\nEmergency Delivery of Thumbnail Available',
};

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<Branding>(defaultBranding);
  const [loading, setLoading] = useState(true);

  // Apply colors to document body or documentElement style variables
  const applyBrandingEffects = (brand: Branding) => {
    // Inject brand and secondary colors as CSS Custom Properties (Variables)
    document.documentElement.style.setProperty('--brand-primary', brand.brandColor);
    document.documentElement.style.setProperty('--brand-secondary', brand.secondaryColor);

    // Update browser tab title
    if (brand.browserTabTitle) {
      document.title = brand.browserTabTitle;
    }

    // Update browser favicon dynamically
    if (brand.browserFavicon) {
      let faviconLink = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        document.head.appendChild(faviconLink);
      }
      faviconLink.href = brand.browserFavicon;
    }
  };

  const fetchBranding = async () => {
    try {
      const response = await fetch('/api/branding');
      if (response.ok) {
        const data = await response.json();
        if (data && typeof data === 'object' && !data.error) {
          const merged = { ...defaultBranding, ...data };
          setBranding(merged);
          applyBrandingEffects(merged);
        } else {
          applyBrandingEffects(defaultBranding);
        }
      } else {
        applyBrandingEffects(defaultBranding);
      }
    } catch (error) {
      console.warn('Failed to load branding from database, using defaults:', error);
      applyBrandingEffects(defaultBranding);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranding();

    // Listen for real-time update events via WebSocket CustomEvent
    const handleBrandingRealtime = (e: Event) => {
      const payload = (e as CustomEvent).detail;
      if (payload && typeof payload === 'object' && !payload.error) {
        setBranding((prev) => {
          const next = { ...defaultBranding, ...prev, ...payload };
          applyBrandingEffects(next);
          return next;
        });
      }
    };

    window.addEventListener('realtime:branding', handleBrandingRealtime);
    return () => {
      window.removeEventListener('realtime:branding', handleBrandingRealtime);
    };
  }, []);

  const updateBrandingState = (updated: Partial<Branding>) => {
    setBranding((prev) => {
      const next = { ...defaultBranding, ...prev, ...updated };
      applyBrandingEffects(next);
      return next;
    });
  };

  return (
    <BrandingContext.Provider value={{ branding, updateBrandingState, loading }}>
      {children}
    </BrandingContext.Provider>
  );
}
