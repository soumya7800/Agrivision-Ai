import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Globe as GlobeIcon, Zap, Activity, Cpu } from 'lucide-react';
import { Globe } from './Globe'; // Use the shared 3D Globe
import { ErrorBoundary } from './ErrorBoundary';

interface HeroProps {
  onStart: () => void;
}

const StatTicker = () => (
  <div className="flex gap-12 items-center text-slate-500 font-mono text-[10px] uppercase tracking-widest border-t border-white/5 pt-8 mt-12">
    <div className="flex items-center gap-3">
      <div className="w-1.5 h-1.5 rounded-full bg-agri-green animate-pulse" />
      <span>System Online</span>
    </div>
    <div className="flex items-center gap-3">
      <Cpu className="w-3 h-3" />
      <span>Neural Engine: Active</span>
    </div>
    <div className="flex items-center gap-3">
      <Activity className="w-3 h-3" />
      <span>Latency: 45ms</span>
    </div>
    <div className="flex items-center gap-3 hidden sm:flex">
      <GlobeIcon className="w-3 h-3" />
      <span>Global Coverage: 99.8%</span>
    </div>
  </div>
);

export const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="relative min-h-screen flex items-center overflow-hidden bg-[#020617]">

      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-agri-green/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
        }}
      />

      <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center h-full pt-20">

        {/* Left Content */}
        <div className="lg:col-span-6 space-y-10 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-agri-green/20 bg-agri-green/5 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-agri-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-agri-green"></span>
              </span>
              <span className="text-[10px] font-mono font-bold text-agri-green uppercase tracking-[0.2em]">AgriVision AI v2.5</span>
            </div>

            <h1 className="text-6xl lg:text-8xl font-display font-bold text-white leading-[0.9] tracking-tight mb-6">
              Planetary <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-agri-green via-emerald-400 to-teal-500">Intelligence.</span>
            </h1>

            <p className="text-lg text-slate-400 max-w-lg leading-relaxed font-light border-l-2 border-white/10 pl-6">
              Synthesize global environmental data into actionable agricultural forecasts.
              The next evolution of yield prediction is here.
            </p>

            <div className="flex flex-wrap gap-5 pt-4">
              <button
                onClick={onStart}
                className="group relative px-8 py-4 bg-white text-black font-bold text-sm tracking-widest uppercase rounded-full overflow-hidden transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
              >
                <div className="absolute inset-0 bg-agri-green/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative flex items-center gap-2">
                  Launch Console <ArrowRight className="w-4 h-4" />
                </span>
              </button>


            </div>

            <StatTicker />
          </motion.div>
        </div>

        {/* Right Visual - 3D Globe Integration */}
        <div className="lg:col-span-6 relative z-10 lg:pointer-events-auto flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="relative w-[500px] h-[500px] lg:w-[600px] lg:h-[600px] flex-shrink-0"
          >
            {/* Decorative Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-white/5 rounded-full animate-[spin_60s_linear_infinite]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] border border-dashed border-white/5 rounded-full animate-[spin_120s_linear_infinite_reverse]" />

            {/* THE GLOBE */}
            <div className="absolute inset-0 z-10 rounded-full overflow-hidden">
              <ErrorBoundary variant="card">
                <Globe isRotating={true} />
              </ErrorBoundary>
            </div>

            {/* Floating UI Cards */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="absolute top-1/4 right-0 glass-card p-4 rounded-xl border-l-[3px] border-l-agri-green max-w-[200px] z-20 hidden lg:block"
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-agri-green" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Live Analysis</span>
              </div>
              <div className="space-y-1">
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-agri-green w-[75%] animate-pulse" />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-400">
                  <span>PROCESSING</span>
                  <span>75%</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};