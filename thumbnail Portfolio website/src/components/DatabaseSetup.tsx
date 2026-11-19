import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Database, Key, Server, CheckCircle2, AlertTriangle, Loader2, ShieldCheck, HelpCircle } from 'lucide-react';

interface DatabaseSetupProps {
  onSetupSuccess: () => void;
}

export default function DatabaseSetup({ onSetupSuccess }: DatabaseSetupProps) {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('5432');
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [database, setDatabase] = useState('');
  const [ssl, setSsl] = useState(true);

  const [loading, setLoading] = useState(false);
  const [statusSteps, setStatusSteps] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!host || !user || !password || !database) {
      setError('Please fill in all required fields.');
      return;
    }

    setError('');
    setLoading(true);
    setStatusSteps(['1. Connecting to PostgreSQL database...']);

    try {
      // Small artificial delays to make the setup feel robust and display steps clearly
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      const response = await fetch('/api/db-setup/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host, port, user, password, database, ssl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Setup failed. Please check credentials.');
      }

      await delay(800);
      setStatusSteps(prev => [...prev, '2. Database connection verified successfully! ✔']);
      
      await delay(800);
      setStatusSteps(prev => [...prev, '3. Initializing tables (users, thumbnails, inquiries, visitors, reviews)...']);
      
      await delay(800);
      setStatusSteps(prev => [...prev, '4. Seeding default demo inquiry items...']);

      await delay(800);
      setStatusSteps(prev => [...prev, '5. Saving db-config.json and re-initializing server pool...']);

      await delay(1000);
      setStatusSteps(prev => [...prev, '6. All systems successfully online! 🚀']);
      
      setSuccess(true);
      setLoading(false);

      // Call success handler after showing complete status
      setTimeout(() => {
        onSetupSuccess();
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during database setup.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 flex items-center justify-center overflow-y-auto px-4 py-8">
      {/* Background radial highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-zinc-900/90 border-2 border-indigo-500/20 rounded-2xl p-6 sm:p-8 shadow-2xl relative backdrop-blur-xl"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 bg-indigo-500/10 rounded-xl border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3 shadow-inner">
            <Database className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="text-xl sm:text-2xl font-sans font-bold text-white tracking-tight">
            Database Setup Wizard
          </h2>
          <p className="text-xs text-zinc-400 mt-1.5 max-w-md mx-auto leading-relaxed">
            Configure your independent PostgreSQL database. This white-label system secures your data separately from other deployments.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex items-start gap-3"
          >
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400" />
            <div>
              <span className="font-bold">Database Connection Failed:</span>
              <p className="mt-0.5 text-zinc-300">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Loading / Active Progress */}
        {loading || success ? (
          <div className="space-y-4 py-8">
            <div className="flex flex-col items-center justify-center text-center space-y-3 mb-6">
              {success ? (
                <CheckCircle2 className="h-12 w-12 text-emerald-400 animate-bounce" />
              ) : (
                <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
              )}
              <h3 className="text-sm font-semibold text-zinc-200">
                {success ? 'Configuration Complete!' : 'Setting up Database...'}
              </h3>
            </div>
            
            <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 font-mono text-[11px] text-zinc-300 space-y-2">
              {statusSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-2 animate-fadeIn">
                  <span className="text-indigo-400 font-bold">&gt;</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSetup} className="space-y-4 text-xs sm:text-sm">
            {/* Host & Port */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-zinc-400 font-medium mb-1.5 flex items-center gap-1.5">
                  <Server className="h-3.5 w-3.5 text-zinc-500" /> Host *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 127.0.0.1 or db.provider.com"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 rounded-lg px-3.5 py-2 text-white outline-none font-mono text-xs transition"
                />
              </div>
              <div>
                <label className="block text-zinc-400 font-medium mb-1.5">
                  Port
                </label>
                <input
                  type="text"
                  required
                  placeholder="5432"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 rounded-lg px-3.5 py-2 text-white outline-none font-mono text-xs transition"
                />
              </div>
            </div>

            {/* Database Name */}
            <div>
              <label className="block text-zinc-400 font-medium mb-1.5 flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-zinc-500" /> Database Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. thumbnail_booster_db"
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 rounded-lg px-3.5 py-2 text-white outline-none font-mono text-xs transition"
              />
            </div>

            {/* User & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 font-medium mb-1.5 flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-zinc-500" /> Username *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. postgres"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 rounded-lg px-3.5 py-2 text-white outline-none font-mono text-xs transition"
                />
              </div>
              <div>
                <label className="block text-zinc-400 font-medium mb-1.5">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 rounded-lg px-3.5 py-2 text-white outline-none font-mono text-xs transition"
                />
              </div>
            </div>

            {/* SSL & Security info */}
            <div className="flex items-center justify-between bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/80 mt-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={ssl}
                  onChange={(e) => setSsl(e.target.checked)}
                  className="rounded border-zinc-800 text-indigo-500 focus:ring-0 focus:ring-offset-0 bg-zinc-950 h-4 w-4"
                />
                <span className="text-xs text-zinc-300 font-medium">Enable SSL Security</span>
              </label>
              <div className="flex items-center gap-1 text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-semibold uppercase tracking-wider">
                <ShieldCheck className="h-3 w-3" /> Secure SSL
              </div>
            </div>

            {/* Setup Button */}
            <button
              type="submit"
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 border border-indigo-500/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              Test & Initialize Database ⚡
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-zinc-800/50 flex items-center justify-center gap-2 text-[10px] text-zinc-500 font-mono">
          <HelpCircle className="h-3 w-3 text-zinc-600" />
          <span>Independent Setup Wizard • Powered by Rohan Booster Pack</span>
        </div>
      </motion.div>
    </div>
  );
}
