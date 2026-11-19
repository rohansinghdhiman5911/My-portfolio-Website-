import React, { useState } from 'react';
import { VideoItem } from '../types';
import { Play, Video as VideoIcon, Clock, Sparkles, X, Film, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VideoSectionProps {
  videos: VideoItem[];
}

export default function VideoSection({ videos }: VideoSectionProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [videoErrors, setVideoErrors] = useState<Record<string, boolean>>({});

  const getVideoSrc = (video: VideoItem) => {
    if (video.id && video.id.startsWith('vid_')) {
      return `/api/videos/${video.id}/stream`;
    }
    return video.videoUrl;
  };

  return (
    <section id="videos" className="py-24 bg-zinc-950 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5">
            <Film className="h-4 w-4 text-indigo-400" />
            <span className="font-mono text-xs font-bold text-indigo-300 uppercase tracking-wider">
              Short Video Reels & Clips
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Up-to-1-Minute <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400">High-Impact Videos</span>
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Explore our curated 60-second video clips, motion hooks, and teaser reels. Uploaded and managed directly through the Locked Author Section.
          </p>
        </div>

        {/* Videos Grid or Empty State */}
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl hover:border-indigo-500/50 transition-all flex flex-col justify-between"
              >
                {/* Video Player / Thumbnail Preview */}
                <div 
                  className="relative aspect-video bg-zinc-950 overflow-hidden cursor-pointer" 
                  onClick={() => setSelectedVideo(video)}
                >
                  {!videoErrors[video.id] ? (
                    <video
                      src={getVideoSrc(video)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 transform-gpu"
                      muted
                      loop
                      playsInline
                      preload="auto"
                      onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                      onError={() => {
                        setVideoErrors(prev => ({ ...prev, [video.id]: true }));
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 p-4 text-center">
                      <Film className="h-8 w-8 text-zinc-600 mb-1" />
                      <span className="text-[11px] text-zinc-400 font-mono">Stream preview unavailable</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 group-hover:scale-110 transition-transform">
                      <Play className="h-6 w-6 ml-0.5 fill-current" />
                    </div>
                  </div>

                  {/* Duration Badge (Max 1 min) */}
                  <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-mono font-bold text-white shadow-md">
                    <Clock className="h-3 w-3 text-indigo-400" />
                    {video.duration || '0:60'} max
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-5 space-y-2.5 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {video.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500 font-mono">
                    <span>Author Verified Clip</span>
                    <button
                      onClick={() => setSelectedVideo(video)}
                      className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                    >
                      Watch Full <Play className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-zinc-850 bg-zinc-900/50 py-20 text-center max-w-xl mx-auto space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
              <Film className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-lg font-bold text-white">No Video Reels Published Yet</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Unlock the Author Section in the footer to upload short video reels, clips, or motion hooks (up to 1 minute).
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Video Modal Player */}
      <AnimatePresence>
        {selectedVideo && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <VideoIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">{selectedVideo.title}</h3>
                    <span className="font-mono text-xs text-indigo-400">Duration: {selectedVideo.duration || '0:60'} (Up to 1 min limit)</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="h-10 w-10 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="relative aspect-video bg-black flex items-center justify-center">
                <video
                  src={getVideoSrc(selectedVideo)}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                />
              </div>

              {selectedVideo.description && (
                <div className="p-5 bg-zinc-950 border-t border-zinc-800 text-sm text-zinc-300 font-sans">
                  {selectedVideo.description}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
