import React from 'react';
import { Inquiry } from '../types';
import { ClipboardList, CheckCircle2, Clock, Smile, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface BusinessDashboardProps {
  inquiries: Inquiry[];
}

// Custom hook / component for smooth rolling number animation
function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;

    const duration = 800; // miliseconds
    const incrementTime = Math.max(Math.floor(duration / Math.abs(end - start || 1)), 16);
    
    const startTime = performance.now();

    let animationFrameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quad formula
      const easeProgress = progress * (2 - progress);
      const currentCount = Math.round(start + (end - start) * easeProgress);
      
      setDisplayValue(currentCount);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(end);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value]);

  return <span>{displayValue}</span>;
}

export default function BusinessDashboard({ inquiries }: BusinessDashboardProps) {
  // Live calculations based on single-source-of-truth inquiries list
  const totalInquiries = inquiries.length;
  
  const completedProjects = inquiries.filter((i) => i.status === 'completed').length;
  
  const pendingOrders = inquiries.filter((i) => i.status !== 'completed').length;
  
  // Unique clients with completed status
  const completedInquiries = inquiries.filter((i) => i.status === 'completed');
  const uniqueHappyClients = new Set(
    completedInquiries.map((i) => {
      const channel = i.channelName ? i.channelName.trim().toLowerCase() : '';
      const email = i.email ? i.email.trim().toLowerCase() : '';
      return channel || email;
    }).filter(Boolean)
  );
  const happyClientsCount = uniqueHappyClients.size;

  // Stats Card data
  const statCards = [
    {
      id: 'total_inquiries',
      title: 'Total Client Inquiries',
      value: totalInquiries,
      description: 'Submitted order briefs',
      icon: ClipboardList,
      color: 'from-violet-500/20 to-indigo-500/10 border-indigo-500/20 text-indigo-400',
      glow: 'shadow-indigo-500/5',
    },
    {
      id: 'completed_projects',
      title: 'Completed Projects',
      value: completedProjects,
      description: 'Thumbnails delivered',
      icon: CheckCircle2,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/20 text-emerald-400',
      glow: 'shadow-emerald-500/5',
    },
    {
      id: 'pending_orders',
      title: 'Pending Orders',
      value: pendingOrders,
      description: 'Active design briefs',
      icon: Clock,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/20 text-amber-400',
      glow: 'shadow-amber-500/5',
    },
    {
      id: 'happy_clients',
      title: 'Happy Clients',
      value: happyClientsCount,
      description: 'Satisfied creators',
      icon: Smile,
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/20 text-cyan-400',
      glow: 'shadow-cyan-500/5',
    },
  ];

  return (
    <section id="stats" className="relative bg-zinc-950 py-16 border-t border-zinc-900 scroll-mt-20 overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 h-80 w-80 rounded-full bg-violet-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Section Heading */}
        <div className="flex flex-col items-center text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-400 font-mono tracking-wider uppercase">
            <TrendingUp className="h-3 w-3" /> Live Operations Tracker
          </div>
          <h2 className="font-display text-3xl font-black tracking-tight text-white sm:text-5xl">
            Business <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">Statistics</span> Dashboard
          </h2>
          <p className="max-w-2xl text-sm text-zinc-400 sm:text-base leading-relaxed">
            Real-time insights of our thumbnail creation pipeline. Watch the metrics change dynamically as orders are submitted and completed.
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, idx) => {
            const IconComponent = card.icon;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${card.color} p-6 shadow-lg ${card.glow} hover:border-white/10 hover:bg-zinc-900/60 transition-all duration-300 group`}
              >
                {/* Background Grid Accent */}
                <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

                {/* Card Header Info */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">
                    {card.title}
                  </span>
                  <div className={`p-2.5 rounded-xl bg-zinc-950/80 border border-white/5 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                </div>

                {/* Big Number Accent */}
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-display text-4xl sm:text-5xl font-black text-white tracking-tight">
                    <AnimatedNumber value={card.value} />
                  </span>
                  <span className="text-xs font-mono text-zinc-400 font-bold">
                    units
                  </span>
                </div>

                {/* Interactive progress minibar */}
                <div className="mt-5 w-full bg-zinc-950/80 rounded-full h-1.5 overflow-hidden border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: totalInquiries > 0 
                        ? `${(card.value / totalInquiries) * 100}%` 
                        : '0%' 
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full bg-gradient-to-r ${
                      card.id === 'total_inquiries' ? 'from-violet-500 to-indigo-500' :
                      card.id === 'completed_projects' ? 'from-emerald-500 to-teal-500' :
                      card.id === 'pending_orders' ? 'from-amber-500 to-orange-500' :
                      'from-cyan-500 to-blue-500'
                    }`}
                  />
                </div>

                {/* Card Subtitle Description */}
                <div className="mt-3 flex items-center justify-between font-mono text-[11px] text-zinc-500">
                  <span>{card.description}</span>
                  <span className="font-bold">
                    {totalInquiries > 0 
                      ? `${Math.round((card.value / totalInquiries) * 100)}%` 
                      : '0%'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
