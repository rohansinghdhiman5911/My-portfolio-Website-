import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Portfolio from './components/Portfolio';
import Pricing from './components/Pricing';
import Faq from './components/Faq';
import BusinessDashboard from './components/BusinessDashboard';
import ContactForm from './components/ContactForm';
import Reviews from './components/Reviews';
import DeliveryTracker from './components/DeliveryTracker';
import WhatsAppFloating from './components/WhatsAppFloating';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import DatabaseSetup from './components/DatabaseSetup';
import VideoSection from './components/VideoSection';

import { Thumbnail, Inquiry, VideoItem } from './types';
import { INITIAL_THUMBNAILS } from './data';

const SEED_INQUIRIES: Inquiry[] = [
  {
    id: 'seed_inq_1',
    name: 'GamerPro YT',
    email: 'contact@gamerpro.com',
    whatsapp: '919876543210',
    channelName: 'GamerPro',
    category: 'gaming',
    packageType: 'Starter Booster Pack',
    details: 'Looking for an ultra-aggressive high-CTR gaming thumbnail for my Cyberpunk 2077 playthrough video. Need neon text and character focus.',
    status: 'completed',
    createdAt: 'Jul 10, 2026, 02:45 PM'
  },
  {
    id: 'seed_inq_2',
    name: 'Sarah Chen',
    email: 'sarah@gearunboxed.com',
    whatsapp: '919876543211',
    channelName: 'GearUnboxed',
    category: 'tech',
    packageType: 'Weekly Creator Pack',
    details: 'Need 12 custom thumbnails for our next smart VR glasses series. Sleek, high-contrast, modern layout with real device highlights.',
    status: 'completed',
    createdAt: 'Jul 12, 2026, 11:15 AM'
  },
  {
    id: 'seed_inq_3',
    name: 'WealthMind Creator',
    email: 'info@wealthmind.com',
    whatsapp: '919876543212',
    channelName: 'WealthMind',
    category: 'business',
    packageType: 'Custom Special Order',
    details: 'Requesting a business/finance thumbnail. "The Real Reason the Financial System is Changing This Year". Use elegant styling, high-contrast charts, and clear typography.',
    status: 'new',
    createdAt: 'Jul 16, 2026, 06:20 PM'
  },
  {
    id: 'seed_inq_4',
    name: 'Science Pulse Team',
    email: 'hello@sciencepulse.org',
    whatsapp: '919876543213',
    channelName: 'Science Pulse',
    category: 'education',
    packageType: 'Starter Booster Pack',
    details: 'Edutainment thumbnail for a nuclear fusion video. Dynamic graphic showing molecules joining, clean mono-spaced accent tags.',
    status: 'contacted',
    createdAt: 'Jul 17, 2026, 08:30 AM'
  }
];

export default function App() {
  // State variables
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('booster_admin_logged') === 'true';
  });

  const [thumbnails, setThumbnails] = useState<Thumbnail[]>(INITIAL_THUMBNAILS);
  const [inquiries, setInquiries] = useState<Inquiry[]>(SEED_INQUIRIES);
  const [videos, setVideos] = useState<VideoItem[]>([]);

  const [activeSection, setActiveSection] = useState('home');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [totalVisitors, setTotalVisitors] = useState<number | null>(null);
  const [dbConfigured, setDbConfigured] = useState<boolean | null>(null);

  // Check database configuration status on mount
  useEffect(() => {
    fetch('/api/db-setup/status')
      .then((res) => {
        if (!res.ok) throw new Error("Status API failed");
        return res.json();
      })
      .then((data) => {
        setDbConfigured(data.configured);
        
        // Detect database transitions to clear stale local caches and admin credentials
        const currentDbId = data.dbInstanceId;
        const storedDbId = localStorage.getItem('booster_db_instance_id');
        
        if (storedDbId && currentDbId && storedDbId !== currentDbId) {
          console.log("DB transition detected! Clearing stale local cached states and admin sessions.");
          localStorage.removeItem('booster_admin_logged');
          localStorage.removeItem('booster_admin_password');
          localStorage.removeItem('booster_db_instance_id');
          setIsAdmin(false);
        }
        
        if (currentDbId) {
          localStorage.setItem('booster_db_instance_id', currentDbId);
        }
      })
      .catch((err) => {
        console.warn("DB setup check failed, defaulting to configured:", err);
        setDbConfigured(true); // Don't block if API fails
      });
  }, []);

  const fetchThumbnails = () => {
    fetch('/api/thumbnails')
      .then((res) => {
        if (!res.ok) throw new Error("API failed");
        return res.json();
      })
      .then((data) => {
        if (data) {
          setThumbnails(data);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch thumbnails from API:", err);
      });
  };

  const fetchInquiries = () => {
    fetch('/api/inquiries')
      .then((res) => {
        if (!res.ok) throw new Error("API failed");
        return res.json();
      })
      .then((data) => setInquiries(data || []))
      .catch((err) => {
        console.warn("Could not fetch inquiries from API:", err);
      });
  };

  const fetchVideos = () => {
    fetch('/api/videos')
      .then((res) => {
        if (!res.ok) throw new Error("API failed");
        return res.json();
      })
      .then((data) => {
        if (data) setVideos(data);
      })
      .catch((err) => {
        console.warn("Could not fetch videos from API:", err);
      });
  };

  const handleAddVideo = async (newVideo: Omit<VideoItem, 'id'>) => {
    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVideo),
      });
      if (!response.ok) throw new Error("Failed to save video");
      const saved = await response.json();
      setVideos((prev) => [saved, ...prev]);
    } catch (err) {
      console.error("Error adding video:", err);
      const fallback: VideoItem = {
        ...newVideo,
        id: 'vid_' + Date.now(),
      };
      setVideos((prev) => [fallback, ...prev]);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this video reel?')) {
      try {
        await fetch(`/api/videos/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.error("Failed to delete video on server:", err);
      }
      setVideos((prev) => prev.filter((v) => v.id !== id));
    }
  };

  // Load from backend API on mount and subscribe to real-time events
  useEffect(() => {
    fetchThumbnails();
    fetchInquiries();
    fetchVideos();

    // Visitor analytics registration
    let visitorId = localStorage.getItem('booster_visitor_id');
    if (!visitorId) {
      visitorId = 'visitor_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
      localStorage.setItem('booster_visitor_id', visitorId);
    }

    fetch('/api/analytics/hit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Analytics hit failed");
        return res.json();
      })
      .then((data) => {
        if (data && typeof data.totalVisitors === 'number') {
          setTotalVisitors(data.totalVisitors);
        }
      })
      .catch((err) => {
        console.error("Error logging visitor hit:", err);
      });

    // Real-time Event Subscriptions
    const handleThumbnailsRealtime = () => {
      fetchThumbnails();
    };

    const handleInquiriesRealtime = () => {
      fetchInquiries();
    };

    const handleVideosRealtime = () => {
      fetchVideos();
    };

    const handleVisitorsRealtime = (e: Event) => {
      const payload = (e as CustomEvent).detail;
      if (payload && typeof payload.totalVisitors === 'number') {
        setTotalVisitors(payload.totalVisitors);
      }
    };

    window.addEventListener('realtime:thumbnails', handleThumbnailsRealtime);
    window.addEventListener('realtime:inquiries', handleInquiriesRealtime);
    window.addEventListener('realtime:videos', handleVideosRealtime);
    window.addEventListener('realtime:visitors', handleVisitorsRealtime);

    return () => {
      window.removeEventListener('realtime:thumbnails', handleThumbnailsRealtime);
      window.removeEventListener('realtime:inquiries', handleInquiriesRealtime);
      window.removeEventListener('realtime:videos', handleVideosRealtime);
      window.removeEventListener('realtime:visitors', handleVisitorsRealtime);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('booster_admin_logged', String(isAdmin));
    } catch (e) {
      console.warn("Could not save admin status to localStorage:", e);
    }
  }, [isAdmin]);

  // Section scroll tracker
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'gallery', 'pricing', 'testimonials', 'faq', 'stats', 'contact', 'admin'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handlers
  const handleAdminLogin = async (password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        const data = await response.json();
        setIsAdmin(true);
        if (data.dbInstanceId) {
          localStorage.setItem('booster_db_instance_id', data.dbInstanceId);
        }
        localStorage.setItem('booster_admin_password', password);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Admin login API error:", err);
      return false;
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('booster_admin_password');
  };

  const handleAddThumbnail = async (newThumbnail: Omit<Thumbnail, 'id' | 'isCustom'>) => {
    try {
      const response = await fetch('/api/thumbnails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newThumbnail),
      });
      if (!response.ok) throw new Error("Failed to add thumbnail to database");
      const savedThumbnail = await response.json();
      setThumbnails((prev) => [savedThumbnail, ...prev]);
    } catch (err) {
      console.error("API error adding thumbnail, falling back:", err);
      const id = 'custom_' + Date.now();
      const thumbnailWithId: Thumbnail = {
        ...newThumbnail,
        id,
        isCustom: true,
      };
      setThumbnails((prev) => [thumbnailWithId, ...prev]);
    }
  };

  const handleDeleteThumbnail = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this thumbnail design from your portfolio?')) {
      try {
        const response = await fetch(`/api/thumbnails/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error("Delete API failed");
      } catch (err) {
        console.error("Failed to delete thumbnail on server:", err);
      }
      setThumbnails((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleAddInquiry = async (newInquiry: Omit<Inquiry, 'id' | 'status' | 'createdAt'>): Promise<Inquiry> => {
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInquiry),
      });
      if (!response.ok) throw new Error("Failed to save inquiry to database");
      const savedInquiry = await response.json();
      setInquiries((prev) => [savedInquiry, ...prev]);
      return savedInquiry;
    } catch (err) {
      console.error("API error adding inquiry, falling back:", err);
      const id = 'inq_' + Date.now();
      const today = new Date();
      const formattedDate = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const inquiryWithMeta: Inquiry = {
        ...newInquiry,
        id,
        status: 'new',
        createdAt: formattedDate,
      };

      setInquiries((prev) => [inquiryWithMeta, ...prev]);
      return inquiryWithMeta;
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client inquiry?')) {
      try {
        const response = await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error("Delete API failed");
      } catch (err) {
        console.error("Failed to delete inquiry on server:", err);
      }
      setInquiries((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleUpdateInquiryStatus = async (id: string, status: 'new' | 'contacted' | 'completed') => {
    try {
      const response = await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Update status API failed");
    } catch (err) {
      console.error("Failed to update inquiry status on server:", err);
    }
    setInquiries((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    );
  };

  const handleUpdateInquiryLiveInfo = async (id: string, liveInfo: string) => {
    try {
      const response = await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liveInfo }),
      });
      if (!response.ok) throw new Error("Update liveInfo API failed");
    } catch (err) {
      console.error("Failed to update inquiry liveInfo on server:", err);
    }
    setInquiries((prev) =>
      prev.map((i) => (i.id === id ? { ...i, liveInfo } : i))
    );
  };

  const handleNavigation = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      const el = document.getElementById('admin');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (dbConfigured === null) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 font-mono text-xs">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500 border-r-2 border-transparent"></div>
          <span className="tracking-widest uppercase text-[10px] text-zinc-500 font-bold">Verifying environment configurations...</span>
        </div>
      </div>
    );
  }

  if (dbConfigured === false) {
    return (
      <DatabaseSetup
        onSetupSuccess={() => {
          localStorage.removeItem('booster_portfolio_thumbnails');
          localStorage.removeItem('booster_client_inquiries');
          localStorage.removeItem('booster_admin_logged');
          setIsAdmin(false);
          setDbConfigured(true);
          window.location.reload();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white antialiased">
      {/* Real-time Google Analytics Verified Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-indigo-950/40 to-zinc-900 border-b border-indigo-500/20 py-2.5 px-4 text-center z-50 backdrop-blur-md relative shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-zinc-400 uppercase tracking-wider text-[10px]">Real-Time Active Tracking</span>
          </div>
          <div className="flex items-center gap-2 bg-zinc-950/90 px-3.5 py-1 rounded-full border border-indigo-500/30 shadow-inner">
            <span className="text-zinc-300 font-sans">Google Analytics Verified Visitors:</span>
            <span className="font-mono font-extrabold text-emerald-400 text-sm tracking-widest bg-emerald-950/40 px-1.5 rounded">
              {totalVisitors !== null ? totalVisitors.toLocaleString() : "Syncing..."}
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
            Live Persons Verified
          </span>
        </div>
      </div>

      {/* Top Banner Navigation */}
      <Header
        isAdmin={isAdmin}
        onAdminToggle={handleAdminToggle}
        onNavigate={handleNavigation}
        activeSection={activeSection}
      />

      <main className="flex-grow">
        {/* Hero Section */}
        <Hero onNavigate={handleNavigation} />

        {/* Portfolio Gallery Showcase */}
        <Portfolio
          thumbnails={thumbnails}
          isAdmin={isAdmin}
          onDeleteThumbnail={handleDeleteThumbnail}
          onAddNewClick={() => {
            const el = document.getElementById('admin');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Short Video Reels Showreel */}
        <VideoSection videos={videos} />

        {/* Pricing & Offer Tiers */}
        <Pricing onSelectPackage={setSelectedPackage} />

        {/* FAQ Accordion Section */}
        <Faq />

        {/* Business Statistics Dashboard */}
        <BusinessDashboard inquiries={inquiries} />

        {/* Booking Form */}
        <ContactForm
          onAddInquiry={handleAddInquiry}
          selectedPackage={selectedPackage}
        />

        {/* Client Reviews Section */}
        <Reviews />

        {/* Live Delivery Tracker Section */}
        <DeliveryTracker />

        {/* Admin Dashboard Controls */}
        <AdminPanel
          isAdmin={isAdmin}
          onLogin={handleAdminLogin}
          onLogout={handleAdminLogout}
          inquiries={inquiries}
          onDeleteInquiry={handleDeleteInquiry}
          onUpdateInquiryStatus={handleUpdateInquiryStatus}
          onUpdateInquiryLiveInfo={handleUpdateInquiryLiveInfo}
          onAddThumbnail={handleAddThumbnail}
          thumbnails={thumbnails}
          onDeleteThumbnail={handleDeleteThumbnail}
          videos={videos}
          onAddVideo={handleAddVideo}
          onDeleteVideo={handleDeleteVideo}
        />
      </main>

      {/* Footer Details */}
      <Footer />

      {/* Floating WhatsApp Support Tool */}
      <WhatsAppFloating />
    </div>
  );
}
