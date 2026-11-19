import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCircle, AlertTriangle, Info, X, Volume2, VolumeX, ShieldAlert } from 'lucide-react';

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: Date;
}

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  desktopEnabled: boolean;
  volume: number;
  muted: boolean;
}

interface RealtimeContextType {
  connected: boolean;
  settings: NotificationSettings;
  updateSettings: (newSettings: Partial<NotificationSettings>) => void;
  triggerTestNotification: () => void;
  toasts: Toast[];
  dismissToast: (id: string) => void;
  addToast: (title: string, message: string, type: Toast['type']) => void;
  notificationHistory: Toast[];
  clearHistory: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notificationHistory, setNotificationHistory] = useState<Toast[]>([]);
  
  // Load notification settings from localStorage
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    try {
      const stored = localStorage.getItem('booster_notification_settings');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading notification settings', e);
    }
    return {
      enabled: true,
      soundEnabled: true,
      desktopEnabled: false,
      volume: 0.8,
      muted: false,
    };
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectDelayRef = useRef(1000); // Start at 1s
  const settingsRef = useRef(settings);

  // Sync settings ref
  useEffect(() => {
    settingsRef.current = settings;
    try {
      localStorage.setItem('booster_notification_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Error writing settings to local storage', e);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Synthesize notification sound using Web Audio API (highly reliable, client-side, zero files)
  const playChime = (type: Toast['type']) => {
    const s = settingsRef.current;
    if (!s.enabled || !s.soundEnabled || s.muted || s.volume <= 0) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const playNode = (freq: number, start: number, duration: number, oscType: 'sine' | 'triangle' | 'sawtooth') => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = oscType;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime + start);
        gainNode.gain.linearRampToValueAtTime(s.volume * 0.15, ctx.currentTime + start + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
        
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      if (type === 'success') {
        // Professional rising dual-tone chime
        playNode(523.25, 0, 0.4, 'sine'); // C5
        playNode(659.25, 0.08, 0.4, 'sine'); // E5
        playNode(783.99, 0.16, 0.5, 'sine'); // G5
      } else if (type === 'warning') {
        // Notice alert tone
        playNode(587.33, 0, 0.25, 'triangle'); // D5
        playNode(587.33, 0.1, 0.35, 'triangle');
      } else if (type === 'error') {
        // Soft low flat cautionary chime
        playNode(329.63, 0, 0.3, 'sawtooth'); // E4
        playNode(311.13, 0.12, 0.4, 'sawtooth'); // D#4
      } else {
        // High soft bubble ping
        playNode(880, 0, 0.25, 'sine'); // A5
      }
    } catch (err) {
      console.warn('Audio Context block or error playing chime:', err);
    }
  };

  // Trigger HTML5 Desktop Notification
  const triggerDesktopNotification = (title: string, message: string) => {
    const s = settingsRef.current;
    if (!s.enabled || !s.desktopEnabled) return;

    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body: message, icon: '/favicon.ico' });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification(title, { body: message, icon: '/favicon.ico' });
          }
        });
      }
    }
  };

  // Add a Toast with Sound & Desktop Trigger
  const addToast = (title: string, message: string, type: Toast['type'] = 'info') => {
    if (!settingsRef.current.enabled) return;

    const id = 'toast_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    const newToast: Toast = {
      id,
      title,
      message,
      type,
      timestamp: new Date(),
    };

    setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5 visible toasts
    setNotificationHistory((prev) => [newToast, ...prev].slice(0, 100)); // Keep max 100 in history

    // Play sound and show desktop notification
    playChime(type);
    triggerDesktopNotification(title, message);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const clearHistory = () => {
    setNotificationHistory([]);
  };

  const triggerTestNotification = () => {
    addToast(
      '🔔 Notification Test Successful',
      'If you heard a sound and saw this alert, your real-time notification engine is working beautifully!',
      'success'
    );
  };

  // Setup WebSocket connection with auto reconnect using exponential backoff
  useEffect(() => {
    let isCurrent = true;

    const connectWS = () => {
      if (!isCurrent) return;

      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (e) {}
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      console.log(`[WebSocket] Connecting to ${wsUrl}`);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isCurrent) return;
        console.log('[WebSocket] Connected to production real-time update channel.');
        setConnected(true);
        reconnectDelayRef.current = 1000; // Reset exponential backoff
      };

      ws.onmessage = (event) => {
        if (!isCurrent) return;
        try {
          const data = JSON.parse(event.data);
          const { type, payload } = data;
          console.log(`[WebSocket] Received realtime broadcast: ${type}`, payload);

          // Standard browser CustomEvents dispatched so components can react
          if (type === 'THUMBNAILS_UPDATED') {
            window.dispatchEvent(new CustomEvent('realtime:thumbnails', { detail: payload }));
            if (payload && payload.title) {
              addToast(
                '🎨 New Thumbnail Uploaded',
                `"${payload.title}" has been published to the portfolio gallery in real-time!`,
                'success'
              );
            }
          } else if (type === 'INQUIRIES_UPDATED') {
            window.dispatchEvent(new CustomEvent('realtime:inquiries', { detail: payload }));
            
            if (payload && payload.action === 'created') {
              addToast(
                '🔔 New Booking Received',
                `A new order from "${payload.name}" (${payload.packageType}) was submitted.`,
                'success'
              );
            } else if (payload && payload.action === 'updated') {
              addToast(
                '🔄 Order Status Updated',
                `Order #${payload.id} was updated to "${payload.status}".`,
                'info'
              );
            }
          } else if (type === 'REVIEWS_UPDATED') {
            window.dispatchEvent(new CustomEvent('realtime:reviews', { detail: payload }));
            if (payload && payload.name) {
              addToast(
                '⭐ New Client Review Added',
                `"${payload.name}" left a rating of ${payload.rating} stars!`,
                'success'
              );
            }
          } else if (type === 'VISITORS_UPDATED') {
            window.dispatchEvent(new CustomEvent('realtime:visitors', { detail: payload }));
          } else if (type === 'BRANDING_UPDATED') {
            window.dispatchEvent(new CustomEvent('realtime:branding', { detail: payload }));
            addToast(
              '🎨 Branding Updated',
              `The website white-label branding was successfully updated in real-time!`,
              'info'
            );
          } else if (type === 'VIDEOS_UPDATED') {
            window.dispatchEvent(new CustomEvent('realtime:videos', { detail: payload }));
            if (payload && payload.title && !payload.deleted) {
              addToast(
                '🎬 New Video Reel Uploaded',
                `"${payload.title}" has been published to the video showcase!`,
                'success'
              );
            }
          }
        } catch (err) {
          console.warn('[WebSocket] Error parsing socket event:', err);
        }
      };

      ws.onclose = (event) => {
        if (!isCurrent) return;
        setConnected(false);
        wsRef.current = null;
        console.log(`[WebSocket] Disconnected. Reconnecting in ${reconnectDelayRef.current}ms...`, event);
        
        // Exponential backoff
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 1.5, 30000); // Cap at 30 seconds
          connectWS();
        }, reconnectDelayRef.current);
      };

      ws.onerror = (err) => {
        console.warn('[WebSocket] Connection error:', err);
        // Onerror will be followed by onclose, so we handle reconnection inside onclose
      };
    };

    // Request desktop permission safely on startup if setting is true
    if ('Notification' in window && settings.desktopEnabled && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    connectWS();

    return () => {
      isCurrent = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return (
    <RealtimeContext.Provider
      value={{
        connected,
        settings,
        updateSettings,
        triggerTestNotification,
        toasts,
        dismissToast,
        addToast,
        notificationHistory,
        clearHistory,
      }}
    >
      {children}

      {/* Beautiful Toast Notifications Overlay */}
      <div id="toast-overlay" className="fixed top-24 right-4 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isError = toast.type === 'error';
            const isWarning = toast.type === 'warning';
            
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                className={`pointer-events-auto w-full rounded-2xl border p-4 shadow-2xl backdrop-blur-md flex gap-3 relative overflow-hidden ${
                  isSuccess 
                    ? 'bg-zinc-950/95 border-emerald-500/30 shadow-emerald-500/5' 
                    : isError 
                      ? 'bg-zinc-950/95 border-rose-500/30 shadow-rose-500/5' 
                      : isWarning 
                        ? 'bg-zinc-950/95 border-amber-500/30 shadow-amber-500/5' 
                        : 'bg-zinc-950/95 border-indigo-500/30 shadow-indigo-500/5'
                }`}
              >
                {/* Visual Accent Ambient Glow */}
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 -mr-6 -mt-6 pointer-events-none ${
                  isSuccess ? 'bg-emerald-500' : isError ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-indigo-500'
                }`} />

                {/* Left Side Icon Container */}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                  isSuccess 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : isError 
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                      : isWarning 
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                        : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                }`}>
                  {isSuccess && <CheckCircle className="h-5 w-5" />}
                  {isError && <ShieldAlert className="h-5 w-5" />}
                  {isWarning && <AlertTriangle className="h-5 w-5" />}
                  {!isSuccess && !isError && !isWarning && <Info className="h-5 w-5" />}
                </div>

                {/* Central Body Context */}
                <div className="flex-grow space-y-1 pr-6">
                  <h4 className="font-display text-xs font-black uppercase tracking-wider text-white">
                    {toast.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                    {toast.message}
                  </p>
                  <span className="block font-mono text-[8.5px] text-zinc-600 uppercase tracking-widest pt-1">
                    {toast.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                {/* Dismiss Button */}
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="absolute top-3 right-3 text-zinc-500 hover:text-white transition-colors h-6 w-6 flex items-center justify-center rounded-lg hover:bg-white/5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </RealtimeContext.Provider>
  );
}
