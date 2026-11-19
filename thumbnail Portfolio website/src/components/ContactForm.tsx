import React, { useState, useEffect } from 'react';
import { Inquiry } from '../types';
import { Mail, User, Phone, Tv, Compass, MessageSquare, Send, CheckCircle2, PhoneCall, Copy, Check, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useBranding } from '../context/BrandingContext';

interface ContactFormProps {
  onAddInquiry: (inquiry: Omit<Inquiry, 'id' | 'status' | 'createdAt'>) => Promise<Inquiry>;
  selectedPackage: string;
}

export default function ContactForm({ onAddInquiry, selectedPackage }: ContactFormProps) {
  const { branding } = useBranding();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [channelName, setChannelName] = useState('');
  const [category, setCategory] = useState('gaming');
  const [packageType, setPackageType] = useState('Starter Booster Pack');
  const [details, setDetails] = useState('');
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState('');
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState('');

  // Auto-fill selected package from pricing cards
  useEffect(() => {
    if (selectedPackage) {
      setPackageType(selectedPackage);
    }
  }, [selectedPackage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!name || !email || !channelName || !details) {
      setFormError('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const inquiry = await onAddInquiry({
        name,
        email,
        whatsapp: whatsapp || undefined,
        channelName,
        category,
        packageType,
        details,
      });
      setSubmittedOrderId(inquiry.id);
      
      // Auto register for background notifications and ensure it's not dismissed
      try {
        const dismissedIdsRaw = localStorage.getItem('rohan_dismissed_order_ids') || '[]';
        let dismissedIds: string[] = [];
        try {
          dismissedIds = JSON.parse(dismissedIdsRaw);
        } catch (e) {
          dismissedIds = [];
        }
        if (Array.isArray(dismissedIds)) {
          const updatedDismissed = dismissedIds.filter(id => id.toLowerCase() !== inquiry.id.toLowerCase());
          localStorage.setItem('rohan_dismissed_order_ids', JSON.stringify(updatedDismissed));
        }
      } catch (err) {
        console.error('Error managing dismissed status in local storage:', err);
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      setFormError('Submission failed. Database connection could be initializing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setWhatsapp('');
    setChannelName('');
    setCategory('gaming');
    setPackageType('Starter Booster Pack');
    setDetails('');
    setIsSubmitted(false);
    setSubmittedOrderId('');
    setCopied(false);
    setFormError('');
  };

  const handleCopyId = () => {
    if (!submittedOrderId) return;
    navigator.clipboard.writeText(submittedOrderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTrackScroll = () => {
    const el = document.getElementById('tracker');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getWhatsAppContactUrl = () => {
    const text = encodeURIComponent(
      `Hello ${branding.companyName || 'Rohan'}! I just submitted a custom booking inquiry on your portfolio:\n\n` +
      `*Name:* ${name}\n` +
      `*Channel:* ${channelName}\n` +
      `*Niche:* ${category}\n` +
      `*Pack:* ${packageType}\n` +
      `*WhatsApp:* ${whatsapp || 'N/A'}\n` +
      `*Details:* ${details}`
    );
    return `https://wa.me/${branding.whatsappNumber || '919041489449'}?text=${text}`;
  };

  return (
    <section id="contact" className="relative bg-zinc-950 py-24 border-t border-zinc-900">
      
      {/* Background decorations */}
      <div className="absolute top-1/2 left-0 h-96 w-96 rounded-full bg-violet-600/[0.01] blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col items-center text-center mb-14 space-y-4">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Book a Custom Design
          </h2>
          <p className="max-w-2xl text-base text-zinc-400 sm:text-lg">
            Ready to scale your channel? Send us your video concept and category, and we will get back to you within 12 hours.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="contact-form-card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-zinc-850 bg-zinc-900 p-6 sm:p-10 shadow-xl"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {formError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex items-center gap-2.5 font-sans"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse shrink-0"></span>
                    <span>{formError}</span>
                  </motion.div>
                )}
                
                {/* 2 Column inputs */}
                <div className="grid gap-6 sm:grid-cols-2">
                  
                  {/* Your Name */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-zinc-500 tracking-wider mb-2">
                      Full Name (Required)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3.5 flex items-center text-zinc-500">
                        <User className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-850 py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-650 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-zinc-500 tracking-wider mb-2">
                      Email Address (Required)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3.5 flex items-center text-zinc-500">
                        <Mail className="h-4 w-4" />
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. john@example.com"
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-850 py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-650 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* YouTube Channel Name */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-zinc-500 tracking-wider mb-2">
                      YouTube Channel Name (Required)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3.5 flex items-center text-zinc-500">
                        <Tv className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        value={channelName}
                        onChange={(e) => setChannelName(e.target.value)}
                        placeholder="e.g. Shutter Tech"
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-850 py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-650 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* WhatsApp Number */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-zinc-500 tracking-wider mb-2">
                      WhatsApp Number (Highly Recommended)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3.5 flex items-center text-zinc-500">
                        <Phone className="h-4 w-4" />
                      </span>
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="e.g. +1 555-0199"
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-850 py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-650 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Category Niche Dropdown */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-zinc-500 tracking-wider mb-2">
                      Your Channel Niche
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3.5 flex items-center text-zinc-500">
                        <Compass className="h-4 w-4" />
                      </span>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-850 py-3 pl-11 pr-4 text-sm text-zinc-300 outline-none focus:border-indigo-500 transition-all"
                      >
                        <option value="gaming">Gaming</option>
                        <option value="business">Business & Finance</option>
                        <option value="tech">Tech & Gadgets</option>
                        <option value="vlog">Vlogs & Lifestyle</option>
                        <option value="education">Edutainment</option>
                      </select>
                    </div>
                  </div>

                  {/* Package Choice */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-zinc-500 tracking-wider mb-2">
                      Selected Design Package
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3.5 flex items-center text-zinc-500">
                        <MessageSquare className="h-4 w-4" />
                      </span>
                      <select
                        value={packageType}
                        onChange={(e) => setPackageType(e.target.value)}
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-850 py-3 pl-11 pr-4 text-sm text-zinc-300 outline-none focus:border-indigo-500 transition-all"
                      >
                        <option value="Starter Booster Pack">Starter Booster Pack (₹49)</option>
                        <option value="Custom Special Order">Custom Special Order</option>
                      </select>
                    </div>
                  </div>

                </div>

                {/* Project details / references */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-zinc-500 tracking-wider mb-2">
                    Video Concept, Title, or Inspiration Links (Required)
                  </label>
                  <textarea
                    rows={4}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Tell us what your next video is about! Include reference links to other videos whose thumbnail styles you love."
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-850 py-3.5 px-4 text-sm text-white placeholder-zinc-650 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none leading-relaxed"
                    required
                  />
                </div>                 {/* Action Row */}
                <div className="pt-4 flex items-center justify-between">
                  <span className="hidden sm:inline font-mono text-[10px] text-zinc-500">
                    *We protect your ideas. Design briefs are strictly confidential.
                  </span>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6.5 py-3.5 font-display text-sm font-bold text-white shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 transition-all disabled:opacity-55"
                  >
                    {submitting ? 'Sending Brief...' : 'Send Booking Brief'}
                    <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>

              </form>
            </motion.div>
          ) : (
            <motion.div
              key="contact-success-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center space-y-6 max-w-lg mx-auto"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <div className="space-y-2">
                <h3 className="font-display text-xl font-bold text-white">Project Brief Received!</h3>
                <p className="text-xs text-zinc-400 leading-relaxed px-2">
                  Your project details have been successfully logged to our server system. Our administrator will review your concept and reach out via email shortly.
                </p>
              </div>

              {/* Order ID display block with Copy and Track buttons */}
              {submittedOrderId && (
                <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-xl space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-zinc-500">
                      Your Unique Tracking ID
                    </span>
                    <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-emerald-400 bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      Saved to SQL
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg justify-between">
                    <span className="font-mono text-xs sm:text-sm font-bold text-indigo-400 select-all">
                      {submittedOrderId}
                    </span>
                    <button
                      onClick={handleCopyId}
                      className="flex items-center justify-center p-1.5 rounded bg-zinc-950 border border-zinc-850 hover:border-zinc-700 hover:text-white text-zinc-400 transition-all text-xs gap-1"
                      title="Copy Order ID"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400 font-mono">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-mono">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <button
                    onClick={handleTrackScroll}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/15 py-2 font-display text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-all"
                  >
                    <Search className="h-3.5 w-3.5" />
                    Track Live Design Status
                  </button>
                </div>
              )}

              {/* Instant WhatsApp forward option */}
              <div className="rounded-xl bg-zinc-950/60 border border-zinc-850 p-4 space-y-3.5">
                <div className="space-y-1">
                  <h4 className="font-display text-xs font-bold text-zinc-300">Want an Instant Reply?</h4>
                  <p className="text-[10px] font-mono text-zinc-500 leading-normal">
                    Forward your pre-filled inquiry directly to our designer's WhatsApp for priority review!
                  </p>
                </div>
                <a
                  href={getWhatsAppContactUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 font-display text-xs font-bold text-white hover:scale-[1.01] transition-all text-center"
                >
                  <PhoneCall className="h-4 w-4" />
                  Send Instant WhatsApp Message
                </a>
              </div>

              <button
                onClick={handleReset}
                className="font-mono text-[10px] text-zinc-500 hover:text-white uppercase font-bold tracking-wider transition-colors"
              >
                Submit another request
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
