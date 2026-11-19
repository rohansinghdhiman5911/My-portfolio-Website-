import React, { useState, useRef } from 'react';
import { Inquiry, Thumbnail, Category, VideoItem } from '../types';
import { 
  Lock, Key, Users, BarChart3, FolderPlus, Trash2, Mail, Check, 
  Clock, Phone, ShieldCheck, Upload, AlertTriangle, Eye, TrendingUp, X, Copy,
  Bell, Volume2, VolumeX, Sparkles, Tag, Film, Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRealtime } from '../context/RealtimeContext';
import BrandingManager from './BrandingManager';

interface InquiryCardProps {
  key?: string | number;
  inquiry: Inquiry;
  onDeleteInquiry: (id: string) => void;
  onUpdateInquiryStatus: (id: string, status: 'new' | 'contacted' | 'completed') => void;
  onUpdateInquiryLiveInfo?: (id: string, liveInfo: string) => void;
}

function InquiryCard({
  inquiry,
  onDeleteInquiry,
  onUpdateInquiryStatus,
  onUpdateInquiryLiveInfo,
}: InquiryCardProps) {
  const [localLiveInfo, setLocalLiveInfo] = useState(inquiry.liveInfo || '');
  const [liveInfoSaved, setLiveInfoSaved] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const handleSaveLiveInfo = () => {
    if (onUpdateInquiryLiveInfo) {
      onUpdateInquiryLiveInfo(inquiry.id, localLiveInfo);
      setLiveInfoSaved(true);
      setTimeout(() => setLiveInfoSaved(false), 2000);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(inquiry.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-zinc-850 bg-zinc-900 p-5 space-y-4 shadow-sm hover:border-zinc-800 transition-all flex flex-col justify-between">
      <div>
        {/* Inquiry Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-display text-base font-extrabold text-white">{inquiry.name}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-[10px] text-zinc-500 font-semibold uppercase">ID:</span>
              <button
                type="button"
                onClick={handleCopyId}
                className="font-mono text-[10px] font-bold text-indigo-400 bg-indigo-950/30 hover:bg-indigo-950/50 border border-indigo-500/10 px-1.5 py-0.5 rounded flex items-center gap-1"
                title="Copy Client Tracking ID"
              >
                {inquiry.id}
                {copiedId ? (
                  <span className="text-[8px] text-emerald-400 font-mono">Copied!</span>
                ) : (
                  <Copy className="h-2.5 w-2.5" />
                )}
              </button>
            </div>
            <span className="font-mono text-[10px] text-zinc-600 mt-0.5">{inquiry.createdAt}</span>
          </div>
          
          {/* Status badging */}
          <div className="flex items-center gap-1.5">
            {inquiry.status === 'new' ? (
              <span className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 font-mono text-[9px] font-extrabold text-amber-400 uppercase tracking-wider">
                New Booking
              </span>
            ) : inquiry.status === 'contacted' ? (
              <span className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 font-mono text-[9px] font-extrabold text-indigo-400 uppercase tracking-wider">
                Contacted
              </span>
            ) : (
              <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 font-mono text-[9px] font-extrabold text-emerald-400 uppercase tracking-wider">
                Completed
              </span>
            )}
          </div>
        </div>

        {/* Client Channels */}
        <div className="grid grid-cols-2 gap-2 mt-4 bg-zinc-950 p-3 rounded-xl border border-zinc-850 font-mono text-xs">
          <div className="space-y-1">
            <div className="text-zinc-500 uppercase text-[9px] tracking-wider font-bold">Creator Channel</div>
            <div className="text-white font-semibold truncate">{inquiry.channelName || 'N/A'}</div>
          </div>
          <div className="space-y-1">
            <div className="text-zinc-500 uppercase text-[9px] tracking-wider font-bold">Pricing Package</div>
            <div className="text-indigo-400 font-semibold truncate">{inquiry.packageType}</div>
          </div>
        </div>

        {/* Message Content */}
        <div className="mt-4">
          <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Details</div>
          <p className="text-sm text-zinc-300 bg-zinc-950/40 p-3 rounded-xl border border-zinc-850/50 whitespace-pre-line leading-relaxed">
            {inquiry.details}
          </p>
        </div>

        {/* Live Tracking Information Input (Connected to SQL) */}
        <div className="mt-4 pt-4 border-t border-zinc-850/60 space-y-2 bg-zinc-950/20 p-3 rounded-xl border border-zinc-850/30">
          <div className="flex items-center justify-between">
            <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500 tracking-wider">
              Live Delivery Tracking Info (SQL)
            </label>
            {liveInfoSaved && (
              <span className="text-[9px] text-emerald-400 font-mono font-bold animate-pulse">Saved to Database!</span>
            )}
          </div>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={localLiveInfo}
              onChange={(e) => setLocalLiveInfo(e.target.value)}
              placeholder="e.g., Working on sketch / Completed delivery!"
              className="flex-grow rounded-lg bg-zinc-950 border border-zinc-850 px-3 py-1.5 text-xs text-white placeholder-zinc-700 outline-none focus:border-indigo-500 transition-all font-sans"
            />
            <button
              type="button"
              onClick={handleSaveLiveInfo}
              className="bg-zinc-800 hover:bg-indigo-600 hover:text-white border border-zinc-750 hover:border-indigo-500 text-zinc-300 rounded-lg px-3 py-1.5 text-xs font-bold transition-all shrink-0 font-sans"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Action buttons & Delivery Tracker (SQL connected) */}
      <div className="pt-4 border-t border-zinc-850/80 space-y-3">
        {/* Direct Delivery Tracker Stage Selector */}
        <div className="bg-zinc-950 border border-zinc-850 p-2 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-zinc-500">
              Delivery Tracker Step (SQL)
            </span>
            <span className="text-[9px] font-mono font-medium text-indigo-400">
              Change status anytime
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => onUpdateInquiryStatus(inquiry.id, 'new')}
              className={`py-1.5 px-2 rounded-lg font-mono text-[10px] font-bold transition-all border text-center ${
                inquiry.status === 'new'
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  : 'bg-zinc-900 border-zinc-850/40 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-850/50'
              }`}
              title="Stage 1: Order Received"
            >
              1. Received
            </button>
            <button
              type="button"
              onClick={() => onUpdateInquiryStatus(inquiry.id, 'contacted')}
              className={`py-1.5 px-2 rounded-lg font-mono text-[10px] font-bold transition-all border text-center ${
                inquiry.status === 'contacted'
                  ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
                  : 'bg-zinc-900 border-zinc-850/40 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-850/50'
              }`}
              title="Stage 2: Custom Designing"
            >
              2. Designing
            </button>
            <button
              type="button"
              onClick={() => onUpdateInquiryStatus(inquiry.id, 'completed')}
              className={`py-1.5 px-2 rounded-lg font-mono text-[10px] font-bold transition-all border text-center ${
                inquiry.status === 'completed'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-zinc-900 border-zinc-850/40 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-850/50'
              }`}
              title="Stage 3: Ready for Delivery"
            >
              3. Ready
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-850/40">
          <div className="flex items-center gap-1.5">
            <a
              href={`mailto:${inquiry.email}`}
              className="flex items-center gap-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white px-3 py-1.5 font-display text-[10px] font-semibold transition-all"
            >
              <Mail className="h-3 w-3" />
              Email
            </a>
            {inquiry.whatsapp && (
              <a
                href={`https://wa.me/${inquiry.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 hover:text-emerald-300 px-3 py-1.5 font-display text-[10px] font-semibold transition-all"
              >
                <Phone className="h-3 w-3" />
                WhatsApp
              </a>
            )}
          </div>

          <button
            type="button"
            onClick={() => onDeleteInquiry(inquiry.id)}
            className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-950/20 hover:bg-rose-950/50 border border-rose-900/30 text-rose-400 hover:text-rose-300 transition-all ml-auto"
            title="Delete Inquiry"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface AdminPanelProps {
  isAdmin: boolean;
  onLogin: (password: string) => Promise<boolean>;
  onLogout: () => void;
  inquiries: Inquiry[];
  onDeleteInquiry: (id: string) => void;
  onUpdateInquiryStatus: (id: string, status: 'new' | 'contacted' | 'completed') => void;
  onUpdateInquiryLiveInfo?: (id: string, liveInfo: string) => void;
  onAddThumbnail: (thumbnail: Omit<Thumbnail, 'id' | 'isCustom'>) => void;
  thumbnails: Thumbnail[];
  onDeleteThumbnail: (id: string) => void;
  videos: VideoItem[];
  onAddVideo: (video: Omit<VideoItem, 'id'>) => void;
  onDeleteVideo: (id: string) => void;
}

export default function AdminPanel({
  isAdmin,
  onLogin,
  onLogout,
  inquiries,
  onDeleteInquiry,
  onUpdateInquiryStatus,
  onUpdateInquiryLiveInfo,
  onAddThumbnail,
  thumbnails,
  onDeleteThumbnail,
  videos,
  onAddVideo,
  onDeleteVideo
}: AdminPanelProps) {
  // Login State
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const { settings, updateSettings, triggerTestNotification } = useRealtime();

  // Active view: 'inquiries' | 'add_thumbnail' | 'manage_gallery' | 'add_video' | 'manage_videos' | 'notifications' | 'branding'
  const [activeTab, setActiveTab] = useState<'inquiries' | 'add_thumbnail' | 'manage_gallery' | 'add_video' | 'manage_videos' | 'notifications' | 'branding'>('inquiries');

  // Form State for new thumbnail
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('gaming');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formMsg, setFormMsg] = useState({ type: '', text: '' });

  // Form State for new video (up to 1 minute)
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoDuration, setVideoDuration] = useState('0:45');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFilePreview, setVideoFilePreview] = useState<string | null>(null);
  const [videoFormMsg, setVideoFormMsg] = useState({ type: '', text: '' });
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  
  // Drag and drop state
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const success = await onLogin(password);
      if (success) {
        setPassword('');
        setLoginError('');
      } else {
        setLoginError('Incorrect Author password. Access denied.');
      }
    } catch (err) {
      setLoginError('Authentication service offline. Please try again.');
    }
  };

  // Convert uploaded image to base64 with canvas compression
  const processFile = (file: File) => {
    setFormMsg({ type: '', text: '' });
    if (!file.type.startsWith('image/')) {
      setFormMsg({ type: 'error', text: 'Please upload a valid image file (png, jpg, jpeg)' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback if canvas is not supported
          const base64 = e.target?.result as string;
          setImageUrl(base64);
          setImagePreview(base64);
          return;
        }

        // Set maximum dimensions for thumbnails (YouTube standard is 1280x720)
        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 720;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image to canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Compress image as JPEG with 0.7 quality
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setImageUrl(compressedBase64);
        setImagePreview(compressedBase64);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleAddThumbnailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg({ type: '', text: '' });
    if (!title || !imageUrl) {
      setFormMsg({ type: 'error', text: 'Please fill out all required fields and upload an image.' });
      return;
    }

    onAddThumbnail({
      title,
      category,
      imageUrl,
      description,
    });

    // Reset Form
    setTitle('');
    setCategory('gaming');
    setDescription('');
    setImageUrl('');
    setImagePreview(null);
    setFormMsg({ type: 'success', text: 'Design added to portfolio successfully!' });
    
    // Smooth transition back after a small delay
    setTimeout(() => {
      setActiveTab('inquiries'); // Back to bookings panel
      setFormMsg({ type: '', text: '' });
    }, 1200);
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFormMsg({ type: '', text: '' });
    if (!file.type.startsWith('video/')) {
      setVideoFormMsg({ type: 'error', text: 'Please upload a valid video file (mp4, webm, mov)' });
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setVideoFormMsg({ type: 'error', text: 'Video file size must be under 50MB.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setVideoUrl(result);
        setVideoFilePreview(result);
        setVideoFormMsg({ type: 'success', text: 'Video loaded successfully! Click publish below.' });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVideoFormMsg({ type: '', text: '' });
    if (!videoTitle.trim() || !videoUrl.trim()) {
      setVideoFormMsg({ type: 'error', text: 'Please provide a title and video file or URL.' });
      return;
    }

    onAddVideo({
      title: videoTitle.trim(),
      description: videoDescription.trim(),
      videoUrl: videoUrl.trim(),
      duration: videoDuration || '0:60',
    });

    setVideoTitle('');
    setVideoDescription('');
    setVideoUrl('');
    setVideoFilePreview(null);
    setVideoFormMsg({ type: 'success', text: 'Short video uploaded and published successfully!' });
    setActiveTab('manage_videos');
  };

  // Stats Counters
  const thumbnailsCount = thumbnails.length;
  const customCount = thumbnails.filter(t => t.isCustom).length;
  const pendingInquiriesCount = inquiries.filter(i => i.status === 'new').length;

  if (!isAdmin) {
    return (
      <section id="admin" className="mx-auto max-w-xl px-4 py-24">
        <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl sm:p-10">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="font-display text-2xl font-bold text-white">Locked Author Section</h2>
            <p className="text-sm text-zinc-400">
              This upload portal is reserved strictly for the portfolio author to publish custom designed thumbnails to showcase in the portfolio.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-zinc-500 tracking-wider mb-2">
                Author Secret Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-zinc-500">
                  <Key className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secret author password..."
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-850 py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-650 outline-none focus:border-indigo-500 transition-all"
                  required
                />
              </div>
              {loginError && (
                <div className="mt-2.5 flex items-center gap-1.5 font-mono text-xs text-rose-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>{loginError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 font-display text-sm font-bold text-white shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 transition-all"
            >
              Unlock Author Panel
            </button>
          </form>

          {/* Secure indicator */}
          <div className="mt-6 rounded-xl bg-zinc-950/60 border border-zinc-850 p-4">
            <div className="flex gap-2.5">
              <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-display text-xs font-bold text-zinc-300">Protected Upload Gate</h4>
                <p className="font-mono text-[11px] text-zinc-500 leading-relaxed">
                  Only the portfolio owner has credentials to modify live gallery elements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="admin" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Admin Panel Header */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl mb-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-white sm:text-2xl">Admin Dashboard</h2>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                  Live
                </span>
              </div>
              <p className="text-xs text-zinc-400">Manage inquiries, upload new thumbnail items, and monitor metrics</p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={onLogout}
              className="rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 px-4 py-2.5 font-display text-xs font-semibold transition-all"
            >
              Sign Out Panel
            </button>
          </div>
        </div>

        {/* Quick Stats Summary Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-zinc-800">
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Inquiries</span>
              <Users className="h-4 w-4 text-violet-400" />
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="font-display text-2xl font-black text-white">{inquiries.length}</span>
              {pendingInquiriesCount > 0 && (
                <span className="font-mono text-[10px] font-bold text-amber-400">({pendingInquiriesCount} new)</span>
              )}
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Seeded Designs</span>
              <BarChart3 className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="mt-2.5">
              <span className="font-display text-2xl font-black text-white">8</span>
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Custom Uploads</span>
              <FolderPlus className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2.5">
              <span className="font-display text-2xl font-black text-white">{customCount < 0 ? 0 : customCount}</span>
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Total Gallery</span>
              <ShieldCheck className="h-4 w-4 text-yellow-400" />
            </div>
            <div className="mt-2.5">
              <span className="font-display text-2xl font-black text-white">{thumbnailsCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-2 border-b border-zinc-900 pb-4 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`flex items-center gap-2 rounded-xl px-4.5 py-2.5 font-display text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'inquiries'
              ? 'bg-indigo-600 text-white'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850'
          }`}
        >
          <Users className="h-4 w-4" />
          Client Inquiries ({inquiries.length})
        </button>

        <button
          onClick={() => setActiveTab('add_thumbnail')}
          className={`flex items-center gap-2 rounded-xl px-4.5 py-2.5 font-display text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'add_thumbnail'
              ? 'bg-indigo-600 text-white'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850'
          }`}
        >
          <FolderPlus className="h-4 w-4" />
          Add Portfolio Design
        </button>

        <button
          onClick={() => setActiveTab('manage_gallery')}
          className={`flex items-center gap-2 rounded-xl px-4.5 py-2.5 font-display text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'manage_gallery'
              ? 'bg-indigo-600 text-white'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850'
          }`}
        >
          <Trash2 className="h-4 w-4" />
          Delete / Manage Uploads ({customCount})
        </button>

        <button
          onClick={() => setActiveTab('add_video')}
          className={`flex items-center gap-2 rounded-xl px-4.5 py-2.5 font-display text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'add_video'
              ? 'bg-indigo-600 text-white'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850'
          }`}
        >
          <Film className="h-4 w-4" />
          Add Short Video (Up to 1m)
        </button>

        <button
          onClick={() => setActiveTab('manage_videos')}
          className={`flex items-center gap-2 rounded-xl px-4.5 py-2.5 font-display text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'manage_videos'
              ? 'bg-indigo-600 text-white'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850'
          }`}
        >
          <Video className="h-4 w-4" />
          Manage Videos ({videos.length})
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 rounded-xl px-4.5 py-2.5 font-display text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'bg-indigo-600 text-white'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850'
          }`}
        >
          <Bell className="h-4 w-4" />
          Notification Settings
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 rounded-xl px-4.5 py-2.5 font-display text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'branding'
              ? 'bg-indigo-600 text-white'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850'
          }`}
        >
          <Tag className="h-4 w-4 text-emerald-400" />
          Branding & Package Pricing
        </button>
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        {activeTab === 'inquiries' && (
          <motion.div
            key="inquiries-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {inquiries.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {inquiries.map((inquiry) => (
                  <InquiryCard
                    key={inquiry.id}
                    inquiry={inquiry}
                    onDeleteInquiry={onDeleteInquiry}
                    onUpdateInquiryStatus={onUpdateInquiryStatus}
                    onUpdateInquiryLiveInfo={onUpdateInquiryLiveInfo}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-850 bg-zinc-900/40 py-16 text-center">
                <Users className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                <span className="inline-block text-zinc-500 mb-2 font-display text-lg">No customer bookings yet</span>
                <p className="text-zinc-600 text-sm">When clients submit the contact form, inquiries will pop up here.</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'add_thumbnail' && (
          <motion.div
            key="add-thumbnail-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="max-w-2xl mx-auto rounded-2xl border border-zinc-850 bg-zinc-900 p-6 shadow-md"
          >
            <h3 className="font-display text-lg font-bold text-white mb-6">Upload Custom Designed Thumbnail</h3>

            <form onSubmit={handleAddThumbnailSubmit} className="space-y-6">
              {formMsg.text && (
                <div className={`p-3 text-xs rounded-xl border font-sans ${
                  formMsg.type === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}>
                  {formMsg.text}
                </div>
              )}
              
              {/* Drag and Drop File Upload Area */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold uppercase text-zinc-500 tracking-wider">
                  Thumbnail Canvas Image (Required)
                </label>
                
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                  className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    isDragActive 
                      ? 'border-indigo-500 bg-indigo-500/5' 
                      : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {imagePreview ? (
                    <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border border-zinc-800 shadow">
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImagePreview(null);
                          setImageUrl('');
                        }}
                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-950/80 border border-zinc-850 text-zinc-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 flex flex-col items-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-display text-xs font-bold text-zinc-300">
                          Drag and drop file here, or click to browse
                        </span>
                        <p className="text-[10px] font-mono text-zinc-600">Supports PNG, JPG, JPEG (Max 5MB)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Grid Inputs */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono font-bold uppercase text-zinc-500 tracking-wider mb-2">
                    Video Title (Required)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 10 Mistakes in Freelancing"
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-850 py-2.5 px-4 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500 transition-all"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono font-bold uppercase text-zinc-500 tracking-wider mb-2">
                    Category Niche
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-850 py-2.5 px-4 text-sm text-zinc-300 outline-none focus:border-indigo-500 transition-all"
                  >
                    <option value="gaming">Gaming</option>
                    <option value="business">Business & Finance</option>
                    <option value="tech">Tech & Gadgets</option>
                    <option value="vlog">Vlogs & Lifestyle</option>
                    <option value="education">Edutainment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-zinc-500 tracking-wider mb-2">
                  Thumbnail Description (Required)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. High contrast composition highlighting the dynamic background details and face expression overlays..."
                  rows={4}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-850 py-2.5 px-4 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500 transition-all resize-none"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 font-display text-xs font-bold text-white shadow hover:shadow-indigo-500/10 transition-all"
                >
                  Publish to Portfolio Gallery
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('inquiries')}
                  className="rounded-xl bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white px-5 py-3 font-display text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>

            </form>
          </motion.div>
        )}

        {activeTab === 'manage_gallery' && (
          <motion.div
            key="manage-gallery-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="rounded-2xl border border-zinc-850 bg-zinc-900 p-6 shadow-md space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <h3 className="font-display text-lg font-bold text-white">Delete / Manage Portfolio Gallery</h3>
                <p className="text-xs text-zinc-400">Review all uploaded layouts in your gallery and remove outdated designs permanently.</p>
              </div>
              <span className="shrink-0 bg-indigo-500/10 text-indigo-400 font-mono text-[10px] font-bold px-3 py-1.5 rounded-lg border border-indigo-500/20 uppercase tracking-wider">
                {thumbnails.length} Total Designs ({thumbnails.filter(t => t.isCustom).length} Uploaded)
              </span>
            </div>

            {thumbnails.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {thumbnails.map((t) => (
                  <div key={t.id} className="group relative rounded-xl border border-zinc-850 bg-zinc-950 p-3 hover:border-zinc-800 transition-all flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-900">
                        <img src={t.imageUrl} alt={t.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {t.isCustom ? (
                            <span className="bg-indigo-600 text-white font-mono text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">
                              Author Uploaded
                            </span>
                          ) : (
                            <span className="bg-zinc-800 text-zinc-400 font-mono text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">
                              Seeded Default
                            </span>
                          )}
                        </div>
                        <span className="absolute bottom-2 right-2 bg-zinc-950/90 text-zinc-300 font-mono text-[8.5px] px-1.5 py-0.5 rounded uppercase tracking-wider border border-zinc-800">
                          {t.category}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-display text-xs font-bold text-white line-clamp-1 group-hover:text-indigo-400 transition-colors">
                          {t.title}
                        </h4>
                        {t.description && (
                          <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                            {t.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteThumbnail(t.id)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-rose-950/20 hover:bg-rose-950/45 border border-rose-900/30 text-rose-400 hover:text-rose-300 py-2 font-display text-[11px] font-bold transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{t.isCustom ? 'Delete Uploaded Design' : 'Delete Seeded Design'}</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-850 bg-zinc-950 py-16 text-center">
                <Trash2 className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                <span className="inline-block text-zinc-500 mb-1 font-display text-base">Your portfolio is empty</span>
                <p className="text-zinc-600 text-xs">Publish new thumbnail cards to see them listed in this manager.</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'add_video' && (
          <motion.div
            key="add-video-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="max-w-3xl mx-auto rounded-2xl border border-zinc-850 bg-zinc-900 p-6 sm:p-8 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md">
                <Film className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white">Upload Short Video (Up to 1 Minute)</h3>
                <p className="text-xs text-zinc-400">Add any video type (MP4, WebM, MOV) up to 60 seconds into the Locked Author Section & Showreel.</p>
              </div>
            </div>

            {videoFormMsg.text && (
              <div className={`mb-6 p-4 rounded-xl border text-xs font-mono font-medium flex items-center gap-2.5 ${
                videoFormMsg.type === 'error'
                  ? 'bg-rose-950/40 border-rose-900/50 text-rose-300'
                  : 'bg-emerald-950/40 border-emerald-900/50 text-emerald-300'
              }`}>
                {videoFormMsg.type === 'error' ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <Check className="h-4 w-4 shrink-0" />}
                <span>{videoFormMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleVideoSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block font-display text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Video Title *
                </label>
                <input
                  type="text"
                  required
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="e.g. High-Impact Gaming Hook Reel (45s)"
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block font-display text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Duration (Max 1 min)
                  </label>
                  <select
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value)}
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
                  >
                    <option value="0:30">30 Seconds</option>
                    <option value="0:45">45 Seconds</option>
                    <option value="0:55">55 Seconds</option>
                    <option value="0:60">60 Seconds (1 Min Max)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block font-display text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Or Direct Video URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={videoUrl.startsWith('data:') ? '' : videoUrl}
                    onChange={(e) => {
                      setVideoUrl(e.target.value);
                      setVideoFilePreview(null);
                    }}
                    placeholder="https://example.com/video.mp4"
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-display text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Upload Video File (Up to 50MB, MP4/WebM/MOV)
                </label>
                <div
                  onClick={() => videoFileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 bg-zinc-950 rounded-2xl p-6 text-center cursor-pointer transition-all group"
                >
                  <input
                    type="file"
                    ref={videoFileInputRef}
                    onChange={handleVideoFileChange}
                    accept="video/*"
                    className="hidden"
                  />
                  <div className="flex flex-col items-center space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="font-display text-sm font-bold text-white">Click to upload video file</span>
                      <p className="text-xs text-zinc-500 mt-1">Supports MP4, WebM, MOV up to 1 minute duration</p>
                    </div>
                  </div>
                </div>

                {videoFilePreview && (
                  <div className="mt-4 relative aspect-video rounded-xl bg-black overflow-hidden border border-zinc-800">
                    <video src={videoFilePreview} className="w-full h-full object-contain" controls />
                    <span className="absolute top-2 right-2 bg-emerald-600 text-white font-mono text-[10px] font-bold px-2 py-1 rounded">
                      Ready to Publish
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block font-display text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Description / Creator Note
                </label>
                <textarea
                  rows={3}
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  placeholder="Describe the video clip purpose, hook strategy, or target audience..."
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 font-display text-xs font-bold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all"
                >
                  Publish Video Reel (Up to 1m)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('inquiries')}
                  className="rounded-xl bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white px-6 py-3.5 font-display text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {activeTab === 'manage_videos' && (
          <motion.div
            key="manage-videos-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="rounded-2xl border border-zinc-850 bg-zinc-900 p-6 shadow-md space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <h3 className="font-display text-lg font-bold text-white">Manage & Delete Short Videos</h3>
                <p className="text-xs text-zinc-400">Review all uploaded short video reels and remove clips instantly from the showreel.</p>
              </div>
              <span className="shrink-0 bg-indigo-500/10 text-indigo-400 font-mono text-[10px] font-bold px-3 py-1.5 rounded-lg border border-indigo-500/20 uppercase tracking-wider">
                {videos.length} Total Video Reels
              </span>
            </div>

            {videos.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {videos.map((v) => (
                  <div key={v.id} className="group relative rounded-xl border border-zinc-850 bg-zinc-950 p-3 hover:border-zinc-800 transition-all flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-950">
                        <video src={v.videoUrl} className="w-full h-full object-cover" muted loop playsInline />
                        <div className="absolute top-2 left-2">
                          <span className="bg-indigo-600 text-white font-mono text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">
                            {v.duration || '0:60'} max
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-display text-xs font-bold text-white line-clamp-1 group-hover:text-indigo-400 transition-colors">
                          {v.title}
                        </h4>
                        {v.description && (
                          <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                            {v.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteVideo(v.id)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-rose-950/20 hover:bg-rose-950/45 border border-rose-900/30 text-rose-400 hover:text-rose-300 py-2 font-display text-[11px] font-bold transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete Video Reel</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-850 bg-zinc-950 py-16 text-center">
                <Film className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                <span className="inline-block text-zinc-500 mb-1 font-display text-base">No video reels uploaded yet</span>
                <p className="text-zinc-600 text-xs">Use the "Add Short Video" tab to upload clips up to 1 minute.</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'notifications' && (
          <motion.div
            key="notifications-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="max-w-2xl mx-auto rounded-2xl border border-zinc-850 bg-zinc-900 p-6 shadow-md"
          >
            <div className="flex items-center gap-2.5 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">Notification Control Panel</h3>
                <p className="text-xs text-zinc-500">Configure real-time browser chimes, desktop pushes, and volume indicators</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Enable Notifications Switch */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-850">
                <div className="space-y-1 pr-4">
                  <h4 className="font-display text-sm font-bold text-white">Enable Real-Time Alerts</h4>
                  <p className="text-xs text-zinc-400">Receive instant visual toasts for custom inquiries, bookings, and reviews.</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings({ enabled: !settings.enabled })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                    settings.enabled ? 'bg-indigo-600' : 'bg-zinc-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      settings.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Sound Settings */}
              <div className="space-y-4 p-4 rounded-xl bg-zinc-950 border border-zinc-850">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 pr-4">
                    <h4 className="font-display text-sm font-bold text-white">Synthesized Sound Alerts</h4>
                    <p className="text-xs text-zinc-400">Play professional rising chimes on system updates (Web Audio API).</p>
                  </div>
                  <button
                    type="button"
                    disabled={!settings.enabled}
                    onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                      settings.soundEnabled && settings.enabled ? 'bg-indigo-600' : 'bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        settings.soundEnabled && settings.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {settings.soundEnabled && settings.enabled && (
                  <div className="space-y-3 pt-3 border-t border-zinc-900">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Volume & Mute Control</span>
                      <button
                        type="button"
                        onClick={() => updateSettings({ muted: !settings.muted })}
                        className="text-zinc-400 hover:text-white transition-colors"
                      >
                        {settings.muted ? <VolumeX className="h-4.5 w-4.5 text-rose-400" /> : <Volume2 className="h-4.5 w-4.5 text-indigo-400" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-zinc-600 font-bold">0%</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={settings.muted ? 0 : settings.volume}
                        disabled={settings.muted}
                        onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
                        className="flex-grow accent-indigo-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      />
                      <span className="text-[10px] font-mono text-indigo-400 font-bold w-12 text-right">
                        {settings.muted ? 'MUTED' : `${Math.round(settings.volume * 100)}%`}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop Push Notifications */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-850">
                <div className="space-y-1 pr-4">
                  <h4 className="font-display text-sm font-bold text-white">Browser Desktop Notifications</h4>
                  <p className="text-xs text-zinc-400">Receive system-native overlays even when looking at other browser tabs.</p>
                </div>
                <button
                  type="button"
                  disabled={!settings.enabled}
                  onClick={async () => {
                    if (!settings.desktopEnabled) {
                      if ('Notification' in window) {
                        const permission = await Notification.requestPermission();
                        if (permission === 'granted') {
                          updateSettings({ desktopEnabled: true });
                        } else {
                          alert('Notification permission denied or blocked by browser.');
                        }
                      } else {
                        alert('Your browser does not support desktop notifications.');
                      }
                    } else {
                      updateSettings({ desktopEnabled: false });
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                    settings.desktopEnabled && settings.enabled ? 'bg-indigo-600' : 'bg-zinc-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      settings.desktopEnabled && settings.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Testing suite action */}
              <div className="pt-4 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={triggerTestNotification}
                  disabled={!settings.enabled}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 hover:border-zinc-800 hover:text-white text-zinc-300 font-display text-xs font-bold py-3.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Bell className="h-4 w-4" />
                  <span>Send Test Notification</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'branding' && (
          <motion.div
            key="branding-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <BrandingManager />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
