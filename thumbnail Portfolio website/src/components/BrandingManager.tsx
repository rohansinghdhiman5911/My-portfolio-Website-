import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useBranding } from '../context/BrandingContext';
import { Save, RefreshCw, Upload, Sparkles, AlertTriangle, Eye, Globe, MessageSquare, Mail, MapPin, CheckCircle, Key } from 'lucide-react';

export default function BrandingManager() {
  const { branding, updateBrandingState } = useBranding();

  // Settings State
  const [websiteName, setWebsiteName] = useState(branding.websiteName);
  const [websiteLogo, setWebsiteLogo] = useState(branding.websiteLogo);
  const [browserTabTitle, setBrowserTabTitle] = useState(branding.browserTabTitle);
  const [browserFavicon, setBrowserFavicon] = useState(branding.browserFavicon);
  const [heroHeading, setHeroHeading] = useState(branding.heroHeading);
  const [heroSubtitle, setHeroSubtitle] = useState(branding.heroSubtitle);
  const [footerCopyright, setFooterCopyright] = useState(branding.footerCopyright);
  const [companyName, setCompanyName] = useState(branding.companyName);
  const [brandColor, setBrandColor] = useState(branding.brandColor);
  const [secondaryColor, setSecondaryColor] = useState(branding.secondaryColor);
  const [contactEmail, setContactEmail] = useState(branding.contactEmail);
  const [whatsappNumber, setWhatsappNumber] = useState(branding.whatsappNumber);
  const [supportEmail, setSupportEmail] = useState(branding.supportEmail);
  const [address, setAddress] = useState(branding.address);
  const [businessDescription, setBusinessDescription] = useState(branding.businessDescription);

  // Package 1 Pricing & Details State
  const [pkg1Name, setPkg1Name] = useState(branding.pkg1Name || 'Starter Booster Pack');
  const [pkg1Price, setPkg1Price] = useState(branding.pkg1Price || '₹49');
  const [pkg1OriginalPrice, setPkg1OriginalPrice] = useState(branding.pkg1OriginalPrice || '₹99');
  const [pkg1Tag, setPkg1Tag] = useState(branding.pkg1Tag || 'Limited Offer');
  const [pkg1Description, setPkg1Description] = useState(branding.pkg1Description || 'Special discounted offer! Prices start from ₹49. Final price depends on design complexity and delivery time. You can order at any time, but normal working hours are 4:00 PM to 10:00 PM (Evening to Night).');
  const [pkg1Features, setPkg1Features] = useState(branding.pkg1Features || '1 Custom High-CTR Thumbnail\nUltra High Resolution (1080p)\n24-Hour Delivery Time\nOrder anytime (Normal Hours: 4:00 PM - 10:00 PM Evening to Night)\nEmergency Delivery of Thumbnail Available');

  // Status State
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [logoDragActive, setLogoDragActive] = useState(false);
  const [faviconDragActive, setFaviconDragActive] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passStatusMsg, setPassStatusMsg] = useState({ type: '', text: '' });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassStatusMsg({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPassStatusMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 4) {
      setPassStatusMsg({ type: 'error', text: 'New password must be at least 4 characters long.' });
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update password.');
      }

      await response.json();
      
      // Update local storage credentials so the owner remains authorized
      localStorage.setItem('booster_admin_password', newPassword);
      sessionStorage.setItem('booster_admin_password', newPassword);
      
      setPassStatusMsg({ type: 'success', text: '🎉 Password changed successfully! Your session is updated.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error(error);
      setPassStatusMsg({ type: 'error', text: error.message || 'Failed to update password.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // Sync state if branding changes (e.g. updated on another client/reloaded)
  useEffect(() => {
    setWebsiteName(branding.websiteName);
    setWebsiteLogo(branding.websiteLogo);
    setBrowserTabTitle(branding.browserTabTitle);
    setBrowserFavicon(branding.browserFavicon);
    setHeroHeading(branding.heroHeading);
    setHeroSubtitle(branding.heroSubtitle);
    setFooterCopyright(branding.footerCopyright);
    setCompanyName(branding.companyName);
    setBrandColor(branding.brandColor);
    setSecondaryColor(branding.secondaryColor);
    setContactEmail(branding.contactEmail);
    setWhatsappNumber(branding.whatsappNumber);
    setSupportEmail(branding.supportEmail);
    setAddress(branding.address);
    setBusinessDescription(branding.businessDescription);
    setPkg1Name(branding.pkg1Name || 'Starter Booster Pack');
    setPkg1Price(branding.pkg1Price || '₹49');
    setPkg1OriginalPrice(branding.pkg1OriginalPrice || '₹99');
    setPkg1Tag(branding.pkg1Tag || 'Limited Offer');
    setPkg1Description(branding.pkg1Description || 'Special discounted offer! Prices start from ₹49. Final price depends on design complexity and delivery time. You can order at any time, but normal working hours are 4:00 PM to 10:00 PM (Evening to Night).');
    setPkg1Features(branding.pkg1Features || '1 Custom High-CTR Thumbnail\nUltra High Resolution (1080p)\n24-Hour Delivery Time\nOrder anytime (Normal Hours: 4:00 PM - 10:00 PM Evening to Night)\nEmergency Delivery of Thumbnail Available');
  }, [branding]);

  // Color Preset Palettes
  const presets = [
    { name: 'Neon Cyber', primary: '#06b6d4', secondary: '#9333ea' },
    { name: 'Vibrant Emerald', primary: '#10b981', secondary: '#06b6d4' },
    { name: 'Crimson Fury', primary: '#ef4444', secondary: '#f97316' },
    { name: 'Classic Indigo', primary: '#6366f1', secondary: '#ec4899' },
    { name: 'Sunset Amber', primary: '#f59e0b', secondary: '#ef4444' },
    { name: 'Fierce Gold', primary: '#eab308', secondary: '#10b981' },
  ];

  // Helper to compress and convert images to Base64
  const processImageFile = (file: File, type: 'logo' | 'favicon') => {
    if (!file.type.startsWith('image/')) {
      setStatusMsg({ type: 'error', text: 'Please upload a valid image file.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const base64 = e.target?.result as string;
          if (type === 'logo') setWebsiteLogo(base64);
          else setBrowserFavicon(base64);
          return;
        }

        // Specific sizes for performance
        const targetWidth = type === 'logo' ? 250 : 48;
        const targetHeight = type === 'logo' ? 250 : 48;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > targetWidth) {
            height = Math.round((height * targetWidth) / width);
            width = targetWidth;
          }
        } else {
          if (height > targetHeight) {
            width = Math.round((width * targetHeight) / height);
            height = targetHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/png');

        if (type === 'logo') {
          setWebsiteLogo(compressedBase64);
          setStatusMsg({ type: 'success', text: 'Logo uploaded and optimized successfully!' });
        } else {
          setBrowserFavicon(compressedBase64);
          setStatusMsg({ type: 'success', text: 'Favicon uploaded and optimized successfully!' });
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg({ type: '', text: '' });

    try {
      let adminPassword = localStorage.getItem('booster_admin_password') || sessionStorage.getItem('booster_admin_password');

      if (!adminPassword && localStorage.getItem('booster_admin_logged') === 'true') {
        adminPassword = prompt('Please enter your Admin Password to authorize saving branding:');
        if (adminPassword) {
          localStorage.setItem('booster_admin_password', adminPassword);
        }
      }

      if (!adminPassword) {
        setStatusMsg({ type: 'error', text: 'Saving cancelled or unauthorized. Admin Password is required.' });
        setIsSaving(false);
        return;
      }

      const response = await fetch('/api/branding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword
        },
        body: JSON.stringify({
          websiteName,
          websiteLogo,
          browserTabTitle,
          browserFavicon,
          heroHeading,
          heroSubtitle,
          footerCopyright,
          companyName,
          brandColor,
          secondaryColor,
          contactEmail,
          whatsappNumber,
          supportEmail,
          address,
          businessDescription,
          pkg1Name,
          pkg1Price,
          pkg1OriginalPrice,
          pkg1Tag,
          pkg1Description,
          pkg1Features
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          localStorage.removeItem('booster_admin_password');
        }
        throw new Error(errorData.error || 'Failed to update branding settings');
      }

      const updated = await response.json();
      updateBrandingState(updated);
      setStatusMsg({ type: 'success', text: '🎉 Website settings and package pricing updated globally in real-time!' });
    } catch (error: any) {
      console.error(error);
      setStatusMsg({ type: 'error', text: error.message || 'Failed to save white-label settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefault = () => {
    if (window.confirm('Are you sure you want to revert settings back to default RohanThumbnails branding?')) {
      setWebsiteName('RohanThumbnails.com');
      setWebsiteLogo('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80');
      setBrowserTabTitle('RohanThumbnails - Double Your YouTube CTR');
      setBrowserFavicon('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=32&h=32&q=80');
      setHeroHeading('Thumbnails That Get Clicked.');
      setHeroSubtitle('High-converting custom thumbnails. We combine audience psychology, bold contrast framing, and pixel-perfect clarity to double your click-through rates.');
      setFooterCopyright('RohanThumbnails.com. All rights reserved. Not affiliated with YouTube.');
      setCompanyName('RohanThumbnails');
      setBrandColor('#06b6d4');
      setSecondaryColor('#9333ea');
      setContactEmail('contact@rohanthumbnails.com');
      setWhatsappNumber('919041489449');
      setSupportEmail('support@rohanthumbnails.com');
      setAddress('Mumbai, India');
      setBusinessDescription('Premium thumbnail design studio focused on maximizing YouTube CTR for professional creators.');
      setPkg1Name('Starter Booster Pack');
      setPkg1Price('₹49');
      setPkg1OriginalPrice('₹99');
      setPkg1Tag('Limited Offer');
      setPkg1Description('Special discounted offer! Prices start from ₹49. Final price depends on design complexity and delivery time. You can order at any time, but normal working hours are 4:00 PM to 10:00 PM (Evening to Night).');
      setPkg1Features('1 Custom High-CTR Thumbnail\nUltra High Resolution (1080p)\n24-Hour Delivery Time\nOrder anytime (Normal Hours: 4:00 PM - 10:00 PM Evening to Night)\nEmergency Delivery of Thumbnail Available');
      setStatusMsg({ type: 'info', text: 'Reverted settings to default. Don\'t forget to click "Save Branding Configuration" to publish!' });
    }
  };

  return (
    <div id="branding-manager" className="space-y-8 pb-12 text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-display font-black tracking-wider uppercase text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" /> White-Label Branding Manager
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Personalize public texts, logo imagery, colors, and browser settings instantly without code.
          </p>
        </div>
        <button
          type="button"
          onClick={resetToDefault}
          className="text-xs bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-400 hover:text-white py-2 px-3 rounded-lg flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className="h-3 w-3" /> Revert Defaults
        </button>
      </div>

      {statusMsg.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border flex gap-3 text-xs leading-relaxed ${
            statusMsg.type === 'success' 
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' 
              : statusMsg.type === 'error'
                ? 'bg-rose-950/20 border-rose-500/30 text-rose-400'
                : 'bg-indigo-950/20 border-indigo-500/30 text-indigo-400'
          }`}
        >
          <div className="mt-0.5">
            {statusMsg.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : statusMsg.type === 'error' ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <Globe className="h-4 w-4" />
            )}
          </div>
          <div>{statusMsg.text}</div>
        </motion.div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Package 1 Pricing & Details Section */}
        <div className="bg-zinc-950 border border-indigo-500/30 p-5 rounded-2xl space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <h3 className="text-sm font-display font-bold text-emerald-400 flex items-center gap-2">
              🏷️ Package 1 Pricing & Offer Details
            </h3>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
              Live Price Editor
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400">Package Price (Offer)</label>
              <input
                type="text"
                value={pkg1Price}
                onChange={(e) => setPkg1Price(e.target.value)}
                placeholder="₹49"
                className="w-full bg-zinc-900 border border-emerald-500/40 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-400 transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400">Original Price (Strikethrough)</label>
              <input
                type="text"
                value={pkg1OriginalPrice}
                onChange={(e) => setPkg1OriginalPrice(e.target.value)}
                placeholder="₹99"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-400 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400">Package Title</label>
              <input
                type="text"
                value={pkg1Name}
                onChange={(e) => setPkg1Name(e.target.value)}
                placeholder="Starter Booster Pack"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400">Badge Tag</label>
              <input
                type="text"
                value={pkg1Tag}
                onChange={(e) => setPkg1Tag(e.target.value)}
                placeholder="Limited Offer"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400">Package Description</label>
            <textarea
              value={pkg1Description}
              onChange={(e) => setPkg1Description(e.target.value)}
              placeholder="Package description details..."
              rows={2}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400">Included Features (1 feature per line)</label>
            <textarea
              value={pkg1Features}
              onChange={(e) => setPkg1Features(e.target.value)}
              placeholder="1 Custom High-CTR Thumbnail&#10;Ultra High Resolution (1080p)..."
              rows={4}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors font-mono"
            />
          </div>
        </div>

        {/* Row 1: Core Website Identity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-display font-bold text-cyan-400 border-b border-zinc-900 pb-2 flex items-center gap-2">
              🏢 Website Identity
            </h3>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400">Website Name</label>
              <input
                type="text"
                value={websiteName}
                onChange={(e) => setWebsiteName(e.target.value)}
                placeholder="RohanThumbnails.com"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-white transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400">Company Legal Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="RohanThumbnails"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-white transition-colors"
                required
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400">Logo Upload / URL</label>
              
              <div className="flex items-center gap-4">
                {websiteLogo && (
                  <div className="h-14 w-14 shrink-0 bg-zinc-900 border border-zinc-800 rounded-xl p-2 flex items-center justify-center overflow-hidden">
                    <img src={websiteLogo} alt="Logo Preview" className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                )}
                <div className="flex-grow space-y-2">
                  <input
                    type="text"
                    value={websiteLogo}
                    onChange={(e) => setWebsiteLogo(e.target.value)}
                    placeholder="Logo URL (or Drag and Drop below)"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-[11px] focus:outline-none focus:border-cyan-500 text-white transition-colors"
                  />
                </div>
              </div>

              {/* Drag and drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setLogoDragActive(true); }}
                onDragLeave={() => setLogoDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setLogoDragActive(false);
                  if (e.dataTransfer.files?.[0]) {
                    processImageFile(e.dataTransfer.files[0], 'logo');
                  }
                }}
                onClick={() => logoInputRef.current?.click()}
                className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  logoDragActive ? 'border-cyan-500 bg-cyan-950/10' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/40'
                }`}
              >
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      processImageFile(e.target.files[0], 'logo');
                    }
                  }}
                  className="hidden"
                />
                <Upload className="h-4 w-4 mx-auto text-zinc-500 mb-1" />
                <p className="text-[10px] text-zinc-400 font-medium">Click to upload or Drag & Drop Logo here</p>
                <p className="text-[9px] text-zinc-600 mt-0.5">Recommended: Square PNG with transparent background</p>
              </div>
            </div>
          </div>

          {/* Browser SEO Identity */}
          <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-display font-bold text-cyan-400 border-b border-zinc-900 pb-2 flex items-center gap-2">
              <Globe className="h-4 w-4 text-cyan-400" /> Browser Settings & SEO
            </h3>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400">Browser Tab Title</label>
              <input
                type="text"
                value={browserTabTitle}
                onChange={(e) => setBrowserTabTitle(e.target.value)}
                placeholder="RohanThumbnails - Double Your YouTube CTR"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-white transition-colors"
                required
              />
              <span className="block text-[9px] text-zinc-500 leading-tight">Displayed on browser tabs and search engine listings.</span>
            </div>

            <div className="space-y-3 pt-1">
              <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400">Browser Favicon Upload / URL</label>
              
              <div className="flex items-center gap-4">
                {browserFavicon && (
                  <div className="h-10 w-10 shrink-0 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center p-2">
                    <img src={browserFavicon} alt="Favicon" className="h-6 w-6 object-contain" referrerPolicy="no-referrer" />
                  </div>
                )}
                <div className="flex-grow space-y-1">
                  <input
                    type="text"
                    value={browserFavicon}
                    onChange={(e) => setBrowserFavicon(e.target.value)}
                    placeholder="Favicon URL"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-[11px] focus:outline-none focus:border-cyan-500 text-white transition-colors"
                  />
                </div>
              </div>

              {/* Favicon Drag Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setFaviconDragActive(true); }}
                onDragLeave={() => setFaviconDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setFaviconDragActive(false);
                  if (e.dataTransfer.files?.[0]) {
                    processImageFile(e.dataTransfer.files[0], 'favicon');
                  }
                }}
                onClick={() => faviconInputRef.current?.click()}
                className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  faviconDragActive ? 'border-cyan-500 bg-cyan-950/10' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/40'
                }`}
              >
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      processImageFile(e.target.files[0], 'favicon');
                    }
                  }}
                  className="hidden"
                />
                <Upload className="h-4 w-4 mx-auto text-zinc-500 mb-1" />
                <p className="text-[10px] text-zinc-400 font-medium">Click or Drag Favicon here</p>
                <p className="text-[9px] text-zinc-600 mt-0.5">Best at 32x32 or 48x48 pixel square size</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Styling and Color Control */}
        <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl space-y-5">
          <h3 className="text-sm font-display font-bold text-cyan-400 border-b border-zinc-900 pb-2 flex items-center gap-2">
            🎨 Color Scheme & Theme Customization
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400">Brand Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="h-10 w-12 bg-transparent border border-zinc-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    placeholder="#06b6d4"
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono w-28 focus:outline-none focus:border-cyan-500"
                  />
                  <div className="h-6 w-6 rounded-full border border-zinc-800 shadow-inner" style={{ backgroundColor: brandColor }} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400">Secondary Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-10 w-12 bg-transparent border border-zinc-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    placeholder="#9333ea"
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono w-28 focus:outline-none focus:border-cyan-500"
                  />
                  <div className="h-6 w-6 rounded-full border border-zinc-800 shadow-inner" style={{ backgroundColor: secondaryColor }} />
                </div>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="space-y-3 bg-zinc-900/30 p-4 rounded-xl border border-zinc-900">
              <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-500">Preset Premium Palettes</label>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setBrandColor(preset.primary);
                      setSecondaryColor(preset.secondary);
                    }}
                    className="bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 p-2 rounded-xl text-left transition-all flex items-center justify-between group"
                  >
                    <div className="space-y-0.5">
                      <span className="block text-[10px] text-zinc-300 group-hover:text-white transition-colors">{preset.name}</span>
                      <div className="flex gap-1.5">
                        <div className="h-2 w-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                        <div className="h-2 w-4 rounded-full" style={{ backgroundColor: preset.secondary }} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-zinc-500">Selecting a preset automatically overrides current hex selections. Saving publishes instantly.</p>
            </div>
          </div>
        </div>

        {/* Hero Copy Settings */}
        <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-display font-bold text-cyan-400 border-b border-zinc-900 pb-2 flex items-center gap-2">
            ⚡ Hero Section Personalization
          </h3>

          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400">Hero Main Title (Heading)</label>
            <input
              type="text"
              value={heroHeading}
              onChange={(e) => setHeroHeading(e.target.value)}
              placeholder="Thumbnails That Get Clicked."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-white transition-colors"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400">Hero Subtitle</label>
            <textarea
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              placeholder="Enter hero descriptive caption..."
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs focus:outline-none focus:border-cyan-500 text-white transition-colors resize-none"
              required
            />
          </div>
        </div>

        {/* Business and Contact Settings */}
        <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-display font-bold text-cyan-400 border-b border-zinc-900 pb-2 flex items-center gap-2">
            📞 Contact Information & Company Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400">Contact Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contact@company.com"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-white transition-colors"
                  required
                />
                <Mail className="h-3.5 w-3.5 text-zinc-500 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400">Support Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="support@company.com"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-white transition-colors"
                  required
                />
                <Mail className="h-3.5 w-3.5 text-zinc-500 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400">WhatsApp Phone Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="919041489449"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-white transition-colors"
                  required
                />
                <MessageSquare className="h-3.5 w-3.5 text-zinc-500 absolute left-3 top-2.5" />
              </div>
              <span className="block text-[8.5px] text-zinc-500">Include country code, no spaces or special symbols (e.g. 919041489449).</span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400">Physical / Head Office Address</label>
              <div className="relative">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Mumbai, India"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-white transition-colors"
                  required
                />
                <MapPin className="h-3.5 w-3.5 text-zinc-500 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400">Business Description</label>
            <textarea
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              placeholder="Describe your studio's mission..."
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs focus:outline-none focus:border-cyan-500 text-white transition-colors resize-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400">Footer Copyright Text</label>
            <input
              type="text"
              value={footerCopyright}
              onChange={(e) => setFooterCopyright(e.target.value)}
              placeholder="RohanThumbnails.com. All rights reserved."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-white transition-colors"
              required
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-display uppercase font-black tracking-widest text-xs px-8 py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Saving Settings...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Branding Configuration
              </>
            )}
          </button>
        </div>
      </form>

      {/* Change Author/Admin Password Section */}
      <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl space-y-4 mt-6">
        <h3 className="text-sm font-display font-bold text-cyan-400 border-b border-zinc-900 pb-2 flex items-center gap-2">
          <Key className="h-4 w-4" /> Change Author / Admin Password
        </h3>
        
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-white transition-colors"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-white transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-white transition-colors"
                required
              />
            </div>
          </div>

          {passStatusMsg.text && (
            <div className={`text-xs font-semibold px-3 py-2 rounded-xl border ${
              passStatusMsg.type === 'success' 
                ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400' 
                : 'bg-rose-950/20 border-rose-900/40 text-rose-400'
            }`}>
              {passStatusMsg.text}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-display uppercase font-black tracking-widest text-[10px] px-6 py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChangingPassword ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin" /> Updating Password...
                </>
              ) : (
                <>
                  <Key className="h-3.5 w-3.5 text-cyan-400" /> Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
