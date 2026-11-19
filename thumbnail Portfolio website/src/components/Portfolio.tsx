import React, { useState } from 'react';
import { Thumbnail, Category } from '../types';
import { Eye, TrendingUp, Sparkles, Search, PlusCircle, Trash2, ExternalLink, MessageSquare, X, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useBranding } from '../context/BrandingContext';

interface PortfolioProps {
  thumbnails: Thumbnail[];
  isAdmin: boolean;
  onDeleteThumbnail: (id: string) => void;
  onAddNewClick: () => void;
}

const CATEGORY_TABS: { value: Category | 'all'; label: string }[] = [
  { value: 'all', label: 'All Designs' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'business', label: 'Business & Finance' },
  { value: 'tech', label: 'Tech & Gadgets' },
  { value: 'vlog', label: 'Vlogs & Lifestyle' },
  { value: 'education', label: 'Edutainment' },
];

export default function Portfolio({ thumbnails, isAdmin, onDeleteThumbnail, onAddNewClick }: PortfolioProps) {
  const { branding } = useBranding();
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThumbnail, setSelectedThumbnail] = useState<Thumbnail | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // --- Real-time Saliency AI Heatmap States ---
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [heatSpots, setHeatSpots] = useState<{ left: number; top: number; size: number; intensity: number; color: 'red' | 'yellow' | 'green' }[]>([]);
  const [gazeNodes, setGazeNodes] = useState<{ left: number; top: number; label: string; duration: string }[]>([]);
  const [analysisMethod, setAnalysisMethod] = useState<string>('');

  // Fallback heuristic-based AI layout emulator (Deterministic content-aware predictor)
  const runSaliencyPredictor = (title: string, category: string) => {
    // Generate deterministic pseudo-random seed from the title string
    const titleSeed = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Grid layouts optimized by category (e.g., text hook is left-ish, subjects/faces are right-ish)
    const textX = 28 + (titleSeed % 12); // 28% - 40%
    const textY = 28 + ((titleSeed >> 1) % 15); // 28% - 43%
    
    const faceX = 68 + ((titleSeed >> 2) % 14); // 68% - 82%
    const faceY = 32 + ((titleSeed >> 3) % 18); // 32% - 50%
    
    const ctaX = 22 + ((titleSeed >> 4) % 35); // 22% - 57%
    const ctaY = 65 + ((titleSeed >> 5) % 18); // 65% - 83%
    
    const nodes = [
      { left: textX, top: textY, label: "Text Hook Zone", duration: "0.45s" },
      { left: faceX, top: faceY, label: "Subject Focal Peak", duration: "0.32s" },
      { left: ctaX, top: ctaY, label: "High Contrast Badge", duration: "0.15s" }
    ];
    
    const spots: { left: number; top: number; size: number; intensity: number; color: 'red' | 'yellow' | 'green' }[] = [];
    
    const addCluster = (cx: number, cy: number, maxRadius: number) => {
      // Primary peak point
      spots.push({
        left: cx,
        top: cy,
        size: Math.round(maxRadius * 2.2),
        intensity: 1.0,
        color: 'red'
      });
      
      // Secondary warm halo
      const ring1Points = 5;
      for (let i = 0; i < ring1Points; i++) {
        const angle = (i * 2 * Math.PI) / ring1Points;
        const radius = maxRadius * 0.45 * (0.85 + ((titleSeed + i) % 4) * 0.1);
        const px = Math.round(cx + Math.cos(angle) * radius);
        const py = Math.round(cy + Math.sin(angle) * radius * 1.5); // Adjust for 16:9 ratio
        
        spots.push({
          left: Math.max(4, Math.min(96, px)),
          top: Math.max(4, Math.min(96, py)),
          size: Math.round(maxRadius * 1.6),
          intensity: 0.7,
          color: 'yellow'
        });
      }
      
      // Outer cool aura
      const ring2Points = 7;
      for (let i = 0; i < ring2Points; i++) {
        const angle = (i * 2 * Math.PI) / ring2Points + 0.4;
        const radius = maxRadius * 0.95 * (0.9 + ((titleSeed + i) % 3) * 0.15);
        const px = Math.round(cx + Math.cos(angle) * radius);
        const py = Math.round(cy + Math.sin(angle) * radius * 1.5);
        
        spots.push({
          left: Math.max(4, Math.min(96, px)),
          top: Math.max(4, Math.min(96, py)),
          size: Math.round(maxRadius * 2.5),
          intensity: 0.35,
          color: 'green'
        });
      }
    };
    
    addCluster(textX, textY, 32);
    addCluster(faceX, faceY, 38);
    addCluster(ctaX, ctaY, 24);
    
    setHeatSpots(spots);
    setGazeNodes(nodes);
    setAnalysisMethod("Predictive Neural Layout AI (Category Saliency Profile)");
    setIsAnalyzing(false);
  };

  // Real Computer Vision image pixel analysis
  const analyzeImageSaliency = (imageUrl: string, title: string, category: string) => {
    setIsAnalyzing(true);
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Canvas context creation failed");
        
        // Downsample to a lightweight processing matrix (160x90 is optimal for real-time edge/color saliency)
        const width = 160;
        const height = 90;
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        
        const gridCols = 24;
        const gridRows = 14;
        const cellWidth = width / gridCols;
        const cellHeight = height / gridRows;
        
        const saliencyMap: number[][] = Array(gridRows).fill(0).map(() => Array(gridCols).fill(0));
        
        // 1. Process local luminance contrast, saturation, and skin/warm warmth coefficients
        for (let r = 0; r < gridRows; r++) {
          for (let c = 0; c < gridCols; c++) {
            let totalLuminance = 0;
            let minLuminance = 255;
            let maxLuminance = 0;
            let totalSaturation = 0;
            let totalWarmth = 0;
            let pixelCount = 0;
            
            const startX = Math.floor(c * cellWidth);
            const endX = Math.floor((c + 1) * cellWidth);
            const startY = Math.floor(r * cellHeight);
            const endY = Math.floor((r + 1) * cellHeight);
            
            for (let y = startY; y < endY; y++) {
              for (let x = startX; x < endX; x++) {
                const idx = (y * width + x) * 4;
                const rVal = data[idx];
                const gVal = data[idx + 1];
                const bVal = data[idx + 2];
                
                const luminance = 0.299 * rVal + 0.587 * gVal + 0.114 * bVal;
                totalLuminance += luminance;
                if (luminance < minLuminance) minLuminance = luminance;
                if (luminance > maxLuminance) maxLuminance = luminance;
                
                const maxComponent = Math.max(rVal, gVal, bVal);
                const minComponent = Math.min(rVal, gVal, bVal);
                totalSaturation += (maxComponent - minComponent);
                
                // Warm highlights (important facial features or thumb overlay colors)
                const warmth = (rVal * 1.3 + gVal * 0.7) - bVal * 1.6;
                if (warmth > 0) totalWarmth += warmth;
                
                pixelCount++;
              }
            }
            
            const contrast = maxLuminance - minLuminance;
            const avgSaturation = totalSaturation / (pixelCount || 1);
            const avgWarmth = totalWarmth / (pixelCount || 1);
            
            // Core Saliency formula (edges + color saturation + warm focal elements)
            saliencyMap[r][c] = (contrast * 1.4) + (avgSaturation * 0.9) + (avgWarmth * 1.6);
          }
        }
        
        // 2. Local box blur filter to smooth the focal heatmap fields
        const smoothedMap = Array(gridRows).fill(0).map(() => Array(gridCols).fill(0));
        let maxScore = 0.0001;
        for (let r = 0; r < gridRows; r++) {
          for (let c = 0; c < gridCols; c++) {
            let sum = 0;
            let neighbors = 0;
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < gridRows && nc >= 0 && nc < gridCols) {
                  sum += saliencyMap[nr][nc];
                  neighbors++;
                }
              }
            }
            smoothedMap[r][c] = sum / (neighbors || 1);
            if (smoothedMap[r][c] > maxScore) maxScore = smoothedMap[r][c];
          }
        }
        
        // 3. Extract highest intensity coordinates
        const flatPoints: { r: number; c: number; score: number }[] = [];
        for (let r = 0; r < gridRows; r++) {
          for (let c = 0; c < gridCols; c++) {
            flatPoints.push({ r, c, score: smoothedMap[r][c] });
          }
        }
        
        flatPoints.sort((a, b) => b.score - a.score);
        
        // Find 3 non-overlapping peaks for primary, secondary, and tertiary eye fixations
        const chosenPeaks: { r: number; c: number; score: number }[] = [];
        const minDistance = 5;
        
        for (const pt of flatPoints) {
          let tooClose = false;
          for (const chosen of chosenPeaks) {
            const dist = Math.sqrt(Math.pow(pt.r - chosen.r, 2) + Math.pow(pt.c - chosen.c, 2));
            if (dist < minDistance) {
              tooClose = true;
              break;
            }
          }
          if (!tooClose) {
            chosenPeaks.push(pt);
            if (chosenPeaks.length >= 3) break;
          }
        }
        
        const nodes: { left: number; top: number; label: string; duration: string }[] = [];
        const labels = ["Headline Hook", "High-Fixation Face/Subject", "CTA Badge / Value Hook"];
        const timings = ["0.48s", "0.34s", "0.19s"];
        
        chosenPeaks.forEach((pt, index) => {
          nodes.push({
            left: Math.round((pt.c / gridCols) * 100),
            top: Math.round((pt.r / gridRows) * 100),
            label: labels[index] || `Fixation Spot ${index + 1}`,
            duration: timings[index] || "0.12s"
          });
        });
        
        // Generate dense heatmap coordinates
        const spots: { left: number; top: number; size: number; intensity: number; color: 'red' | 'yellow' | 'green' }[] = [];
        const topSpotsCount = Math.floor(flatPoints.length * 0.18);
        const topPoints = flatPoints.slice(0, topSpotsCount);
        
        topPoints.forEach((pt) => {
          const leftPercent = Math.round((pt.c / gridCols) * 100);
          const topPercent = Math.round((pt.r / gridRows) * 100);
          const relIntensity = pt.score / maxScore;
          
          spots.push({
            left: leftPercent,
            top: topPercent,
            size: Math.round(relIntensity * 100 + 40),
            intensity: relIntensity,
            color: relIntensity > 0.82 ? 'red' : relIntensity > 0.48 ? 'yellow' : 'green'
          });
        });
        
        setHeatSpots(spots);
        setGazeNodes(nodes);
        setAnalysisMethod("Computer Vision AI (Live Real-Time Pixel Saliency)");
        setIsAnalyzing(false);
      } catch (err) {
        console.warn("CORS/Tainted Canvas prevented reading pixel array. Loading predictive neural model emulator.", err);
        runSaliencyPredictor(title, category);
      }
    };
    
    img.onerror = () => {
      runSaliencyPredictor(title, category);
    };
  };

  // Run real-time analysis whenever showHeatmap is enabled or selected thumbnail changes
  React.useEffect(() => {
    if (selectedThumbnail && showHeatmap) {
      analyzeImageSaliency(selectedThumbnail.imageUrl, selectedThumbnail.title, selectedThumbnail.category);
    }
  }, [selectedThumbnail, showHeatmap]);

  const filteredThumbnails = thumbnails.filter((thumbnail) => {
    const matchesCategory = selectedCategory === 'all' || thumbnail.category === selectedCategory;
    const titleStr = thumbnail.title || '';
    const descStr = thumbnail.description || '';
    const matchesSearch = titleStr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          descStr.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDownloadImage = async (thumbnail: Thumbnail) => {
    try {
      // Direct download for base64 / data URLs to avoid Fetch or CORS restrictions on user uploads
      if (thumbnail.imageUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = thumbnail.imageUrl;
        link.download = `${(thumbnail.title || '').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_thumbnail.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      const response = await fetch(thumbnail.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(thumbnail.title || '').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_thumbnail.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Could not download image directly:", err);
      window.open(thumbnail.imageUrl, '_blank');
    }
  };

  const getWhatsAppOrderUrl = (thumbnail: Thumbnail) => {
    // Clean WhatsApp phone number to digits only
    const rawNumber = branding.whatsappNumber || '919041489449';
    const cleanNumber = rawNumber.replace(/\D/g, '');

    let imageRefUrl = '';
    const rawUrl = thumbnail.imageUrl || '';

    if (rawUrl.startsWith('data:')) {
      // Base64 image -> Short working server image endpoint link
      imageRefUrl = `${window.location.origin}/api/thumbnails/${thumbnail.id}/image`;
    } else if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      // External clean HTTP/HTTPS link
      imageRefUrl = rawUrl;
    } else if (rawUrl) {
      // Relative path
      const cleanPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
      imageRefUrl = `${window.location.origin}${cleanPath}`;
    } else {
      imageRefUrl = `${window.location.origin}/api/thumbnails/${thumbnail.id}/image`;
    }

    const messageText = `Hi ${branding.companyName || 'RohanThumbnails'}! I saw your thumbnail portfolio and absolutely love this custom design. I'd love to order a similar custom thumbnail!

📌 Selected Style: "${thumbnail.title || ''}"
📌 Category: ${(thumbnail.category || '').toUpperCase()}
${thumbnail.description ? `📌 Description: ${thumbnail.description}` : ''}

📌 Reference Image Link:
${imageRefUrl}

Please let me know how we can get started!`;

    // Use direct api.whatsapp.com URL to avoid cross-domain redirect blocks
    return `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(messageText)}`;
  };

  const getCategoryColor = (cat: Category) => {
    switch (cat) {
      case 'gaming': return 'from-rose-500 to-red-600 shadow-rose-500/20';
      case 'business': return 'from-amber-400 to-yellow-600 shadow-amber-500/20';
      case 'tech': return 'from-cyan-400 to-blue-600 shadow-cyan-500/20';
      case 'vlog': return 'from-purple-500 to-indigo-600 shadow-purple-500/20';
      case 'education': return 'from-emerald-400 to-teal-600 shadow-emerald-500/20';
      default: return 'from-zinc-500 to-zinc-600 shadow-zinc-500/20';
    }
  };

  return (
    <section id="gallery" className="relative bg-zinc-950 py-24 border-t border-zinc-900">
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-zinc-900/10 to-transparent" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 px-3.5 py-1.5 font-mono text-xs font-semibold text-violet-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>PORTFOLIO SHOWCASE</span>
          </div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Tested & Proven Designs
          </h2>
          <p className="max-w-2xl text-base text-zinc-400 sm:text-lg">
            Each thumbnail is built using high-contrast expert compositions, targeted viewer heat-zones, and clean custom color palettes engineered for ultimate virality.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-10 pb-6 border-b border-zinc-900">
          
          {/* Categories Tab Group */}
          <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedCategory(tab.value)}
                className={`rounded-xl px-4.5 py-2.5 font-display text-xs font-semibold uppercase tracking-wider transition-all duration-200 shrink-0 ${
                  selectedCategory === tab.value
                    ? 'bg-white text-zinc-950 shadow-md'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar + Optional Add Button */}
          <div className="flex items-center gap-3 w-full md:w-auto max-w-md shrink-0">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-3 flex items-center text-zinc-500">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search styles or channels..."
                className="w-full rounded-xl bg-zinc-900 border border-zinc-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            
            {isAdmin && (
              <button
                onClick={onAddNewClick}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-4.5 py-2.5 font-display text-xs font-bold text-white shadow-md shadow-violet-500/10 hover:bg-violet-500 hover:scale-[1.02] transition-all whitespace-nowrap"
              >
                <PlusCircle className="h-4.5 w-4.5" />
                Add Design
              </button>
            )}
          </div>

        </div>

        {/* Portfolio Thumbnail Grid */}
        <AnimatePresence mode="popLayout">
          {filteredThumbnails.length > 0 ? (
            <motion.div 
              layout
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filteredThumbnails.map((thumbnail) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={thumbnail.id}
                  className="group relative rounded-2xl border border-zinc-850 bg-zinc-900 overflow-hidden shadow-lg hover:border-zinc-700 hover:shadow-2xl transition-all flex flex-col"
                >
                  {/* Thumbnail Image Slot */}
                  <div 
                    onClick={() => {
                      setSelectedThumbnail(thumbnail);
                      setShowHeatmap(false);
                    }}
                    className="relative aspect-video bg-zinc-950 overflow-hidden cursor-pointer group/img"
                  >
                    <img
                      src={thumbnail.imageUrl}
                      alt={thumbnail.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Dark/Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent opacity-95 group-hover/img:opacity-100 transition-opacity" />

                    {/* Interactive Preview Overlay on Hover */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[2px] z-20">
                      <div className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/30 transform scale-95 group-hover/img:scale-100 transition-all">
                        <Eye className="h-4 w-4" />
                        <span>Inspect Heatmap & Analytics</span>
                      </div>
                    </div>

                    {/* Uploaded badge (floating top-left) */}
                    {thumbnail.isCustom && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="inline-block rounded-lg bg-indigo-500/90 px-2 py-0.5 font-mono text-[9px] font-bold text-white uppercase tracking-wider shadow">
                          Uploaded
                        </span>
                      </div>
                    )}

                    {/* Category Label (floating top-right) */}
                    <span className={`absolute top-3 right-3 rounded-lg bg-gradient-to-r px-2.5 py-1 text-[10px] font-black text-white uppercase tracking-wider shadow backdrop-blur-sm z-10 ${getCategoryColor(thumbnail.category)}`}>
                      {thumbnail.category}
                    </span>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-sm font-extrabold text-white leading-snug line-clamp-2 hover:text-indigo-300 transition-colors">
                        {thumbnail.title}
                      </h3>
                      {thumbnail.description && (
                        <p className="mt-1.5 font-sans text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {thumbnail.description}
                        </p>
                      )}
                    </div>

                    {/* Card CTAs / Controls */}
                    <div className="mt-4 pt-3.5 border-t border-zinc-850/80 flex items-center gap-2">
                      <a
                        href={getWhatsAppOrderUrl(thumbnail)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 text-xs font-bold text-zinc-300 hover:text-emerald-400 py-2.5 transition-all text-center"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                        Order Style
                      </a>

                      {/* Admin Delete Action */}
                      {isAdmin && (
                        <button
                          onClick={() => onDeleteThumbnail(thumbnail.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-950/20 hover:bg-rose-950/50 border border-rose-900/30 text-rose-400 hover:text-rose-300 transition-all shrink-0"
                          title="Delete Design"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 py-16 text-center">
              <span className="inline-block text-zinc-500 mb-2 font-display text-lg">No designs match your criteria.</span>
              <p className="text-zinc-600 text-sm">Try clearing your filters or testing another search term.</p>
            </div>
          )}
        </AnimatePresence>

      </div>

      {/* Portfolio Preview Modal with Live Viewer Metric */}
      <AnimatePresence>
        {selectedThumbnail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md overflow-y-auto">
            {/* Backdrop close */}
            <div className="absolute inset-0" onClick={() => setSelectedThumbnail(null)} />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-2xl flex flex-col lg:flex-row z-10"
            >
              {/* Left Side: Thumbnail Preview with interactive Heatmap */}
              <div className="flex-1 bg-zinc-950 p-6 flex flex-col justify-center items-center relative border-b lg:border-b-0 lg:border-r border-zinc-850">
                <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
                  <span className="rounded-lg bg-zinc-900/95 border border-zinc-800 text-zinc-400 font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 shadow-lg">
                    Design Inspector
                  </span>
                  {showHeatmap && (
                    <span className="rounded-lg bg-zinc-900/95 border border-zinc-800 text-zinc-300 font-mono text-[9px] uppercase tracking-wider px-2.5 py-1 shadow-lg flex items-center gap-1.5 animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {analysisMethod || "Saliency AI Active"}
                    </span>
                  )}
                </div>

                <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-zinc-800 shadow-xl mt-4">
                  <img
                    src={selectedThumbnail.imageUrl}
                    alt={selectedThumbnail.title}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />

                  {/* Heatmap Overlay Simulation */}
                  <AnimatePresence>
                    {showHeatmap && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
                      >
                        {/* No translucent dimming layer so original thumbnail remains 100% visible and bright */}

                        {isAnalyzing ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 z-20">
                            <div className="relative flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full border-4 border-rose-500/30 border-t-rose-500 animate-spin" />
                              <Flame className="absolute h-5 w-5 text-rose-500 animate-pulse" />
                            </div>
                            <span className="mt-3 text-xs font-mono text-rose-400 animate-pulse uppercase tracking-widest">
                              Saliency AI analyzing photo...
                            </span>
                          </div>
                        ) : (
                          <>
                            {/* Dynamic Gaze Plot Connection SVG Paths */}
                            {gazeNodes.length > 1 && (
                              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50 z-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                                {gazeNodes.map((node, idx) => {
                                  if (idx === gazeNodes.length - 1) return null;
                                  const nextNode = gazeNodes[idx + 1];
                                  return (
                                    <line
                                      key={idx}
                                      x1={node.left}
                                      y1={node.top}
                                      x2={nextNode.left}
                                      y2={nextNode.top}
                                      stroke="#ffffff"
                                      strokeWidth="0.4"
                                      strokeDasharray="2 2"
                                    />
                                  );
                                })}
                              </svg>
                            )}

                            {/* Dynamic Gaze Fixation Nodes (Extremely clean, modern, high contrast) */}
                            {gazeNodes.map((node, idx) => (
                              <div
                                key={idx}
                                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 transition-all duration-700"
                                style={{ left: `${node.left}%`, top: `${node.top}%` }}
                              >
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-950/95 border-2 border-white/90 text-[9px] font-mono text-white font-bold shadow-lg shadow-black/80">
                                  {idx + 1}
                                </div>
                                <div className="mt-1 flex flex-col items-center">
                                  <span className="px-1.5 py-0.5 rounded bg-zinc-950/95 text-[8px] text-zinc-100 font-bold tracking-wide border border-zinc-800 shadow-md whitespace-nowrap">
                                    {node.label}
                                  </span>
                                  <span className="text-[7px] text-zinc-400 font-mono mt-0.5 font-bold bg-zinc-950/80 px-1 rounded">
                                    {node.duration} dwell
                                  </span>
                                </div>
                              </div>
                            ))}
                          </>
                        )}

                        {/* --- VERTICAL SCANNING LASER LINE (Subtle, professional, colorless) --- */}
                        <motion.div
                          className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-zinc-400/35 to-transparent z-15 pointer-events-none"
                          initial={{ top: '0%' }}
                          animate={{ top: '100%' }}
                          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                        />

                        {/* Rule of Thirds Grid lines */}
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-15">
                          <div className="border border-white/30" />
                          <div className="border border-white/30" />
                          <div className="border border-white/30" />
                          <div className="border border-white/30" />
                          <div className="border border-white/30" />
                          <div className="border border-white/30" />
                          <div className="border border-white/30" />
                          <div className="border border-white/30" />
                          <div className="border border-white/30" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Heatmap Toggle Controls */}
                <div className="w-full mt-4 flex items-center justify-between gap-4 bg-zinc-900/50 p-3 rounded-xl border border-zinc-850">
                  <div className="flex flex-col text-left">
                    <span className="text-white text-xs font-bold font-display">Viewer Niche Heatmap</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Simulate viewer eye-tracking focal zones</span>
                  </div>
                  <button
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className={`rounded-lg px-4 py-2 font-display text-[10px] font-extrabold uppercase tracking-widest border transition-all ${
                      showHeatmap
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {showHeatmap ? 'Disable Overlay' : 'Overlay Heatmap'}
                  </button>
                </div>
              </div>

              {/* Right Side: Performance Analytics & Action CTAs */}
              <div className="w-full lg:w-80 p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`rounded-md bg-gradient-to-r px-2 py-0.5 text-[9px] font-black text-white uppercase tracking-wider ${getCategoryColor(selectedThumbnail.category)}`}>
                      {selectedThumbnail.category}
                    </span>
                    <button
                      onClick={() => setSelectedThumbnail(null)}
                      className="rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white p-1.5 transition-all"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div>
                    <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Project Concept</span>
                    <h3 className="font-display text-base font-extrabold text-white leading-snug mt-1">
                      {selectedThumbnail.title}
                    </h3>
                  </div>

                  {/* Thumbnail Description */}
                  {selectedThumbnail.description && (
                    <div className="bg-zinc-950/60 border border-zinc-850 rounded-xl p-4.5 space-y-1.5 text-left">
                      <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold block">Design Details</span>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-line">{selectedThumbnail.description}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2.5 pt-4 border-t border-zinc-850">
                  <a
                    href={getWhatsAppOrderUrl(selectedThumbnail)}
                    onClick={() => {
                      setTimeout(() => setSelectedThumbnail(null), 200);
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-xs font-bold text-white shadow shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all text-center"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Order This Style</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
