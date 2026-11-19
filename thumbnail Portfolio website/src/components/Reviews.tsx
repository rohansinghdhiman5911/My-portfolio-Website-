import React, { useState, useEffect } from 'react';
import { Star, Send, CheckCircle, MessageSquare, Award } from 'lucide-react';
import { Review } from '../types';

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [channelName, setChannelName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [ctrBoost, setCtrBoost] = useState('');

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();

    const handleReviewsRealtime = () => {
      fetchReviews();
    };

    window.addEventListener('realtime:reviews', handleReviewsRealtime);
    return () => {
      window.removeEventListener('realtime:reviews', handleReviewsRealtime);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !reviewText.trim()) {
      setError('Name and Review text are required.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          channelName: channelName.trim(),
          rating,
          review: reviewText.trim(),
          ctrBoost: ctrBoost.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }

      setSuccess(true);
      setName('');
      setChannelName('');
      setRating(5);
      setReviewText('');
      setCtrBoost('');
      
      // Refresh the list
      await fetchReviews();

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="py-24 bg-zinc-950 border-t border-zinc-900 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            100% Genuine Feedback
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Client Success & Reviews
          </h2>
          <p className="mt-4 text-zinc-400 text-sm sm:text-base leading-relaxed">
            Real feedback from creators who elevated their click-through rate. No bots, no pre-filled reviews—just real results from real partnerships.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-12 items-start">
          {/* Reviews List Column */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-lg font-display font-bold text-white flex items-center gap-2 mb-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              Latest Client Reviews ({reviews.length})
            </h3>

            {loading ? (
              <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500 mx-auto mb-4"></div>
                <p className="text-zinc-500 text-sm font-mono">Syncing reviews from Cloud SQL database...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl p-12 text-center">
                <Award className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <h4 className="text-zinc-300 font-bold mb-1">No reviews posted yet</h4>
                <p className="text-zinc-500 text-xs sm:text-sm max-w-md mx-auto mb-6">
                  Be the first happy client to share your click-through rate (CTR) success story using our design service!
                </p>
                <div className="inline-block px-3 py-1 bg-zinc-900 rounded-lg text-zinc-400 font-mono text-[10px] uppercase border border-zinc-850">
                  Awaiting First Authentic Post
                </div>
              </div>
            ) : (
              <div className="grid gap-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {reviews.map((rev) => (
                  <div 
                    key={rev.id} 
                    className="bg-zinc-900/60 border border-zinc-850 p-6 rounded-2xl hover:border-zinc-700/80 transition-all shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-3.5">
                        <div>
                          <h4 className="font-bold text-white text-base leading-snug">{rev.name}</h4>
                          {rev.channelName && (
                            <p className="text-xs text-zinc-400 font-mono mt-0.5">{rev.channelName}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'
                                }`}
                              />
                            ))}
                          </div>
                          {rev.ctrBoost && (
                            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                              {rev.ctrBoost}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                        "{rev.review}"
                      </p>
                    </div>
                    {rev.createdAt && (
                      <div className="mt-4 pt-3 border-t border-zinc-850/50 flex justify-end">
                        <span className="text-[10px] font-mono text-zinc-500">
                          {new Date(rev.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submission Form Column */}
          <div className="lg:col-span-5 bg-zinc-900/40 border border-zinc-850 p-6 sm:p-8 rounded-3xl backdrop-blur-sm">
            <div className="mb-6">
              <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Leave Your Real Review
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Share your authentic feedback to motivate us and guide other creators!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Your Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Robin Peterson"
                  className="w-full text-sm bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Channel Name <span className="text-zinc-600">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    placeholder="e.g. RobinTech"
                    className="w-full text-sm bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    CTR Boost <span className="text-zinc-600">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={ctrBoost}
                    onChange={(e) => setCtrBoost(e.target.value)}
                    placeholder="e.g. +7.4% CTR"
                    className="w-full text-sm bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Your Star Rating <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2 bg-zinc-950/80 px-4 py-2.5 rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((starValue) => {
                      const isHighlighted = hoverRating !== null ? starValue <= hoverRating : starValue <= rating;
                      return (
                        <button
                          key={starValue}
                          type="button"
                          onClick={() => setRating(starValue)}
                          onMouseEnter={() => setHoverRating(starValue)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="focus:outline-none transition-transform active:scale-95"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              isHighlighted ? 'text-amber-400 fill-amber-400' : 'text-zinc-750'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-mono text-zinc-400 ml-auto">
                    {rating === 5 ? 'Excellent (5/5)' : rating === 4 ? 'Very Good (4/5)' : rating === 3 ? 'Good (3/5)' : rating === 2 ? 'Fair (2/5)' : 'Poor (1/5)'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Your Review <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share details of your click-through rate growth, design aesthetic, fast response times..."
                  className="w-full text-sm bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              {error && (
                <div className="p-3.5 bg-rose-950/30 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  Your authentic review has been saved in Cloud SQL successfully!
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/15 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                    Saving to Cloud SQL...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Genuine Review
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
