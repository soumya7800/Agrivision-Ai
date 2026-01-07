import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Cpu, Activity, Globe as GlobeIcon, Zap } from 'lucide-react';
import { Globe } from './Globe'; // Use the shared 3D Globe
import { ErrorBoundary } from './ErrorBoundary';

interface HeroProps {
  onStart: () => void;
}

const StatTicker = () => (
  <div className="flex flex-wrap gap-8 items-center text-white/30 font-mono text-[9px] uppercase tracking-[0.2em] border-t border-white/5 pt-8 mt-12 backdrop-blur-sm">
    <div className="flex items-center gap-3">
      <div className="w-1 h-1 rounded-full bg-agri-green animate-pulse shadow-[0_0_10px_#10b981]" />
      <span>System Nominal</span>
    </div>
    <div className="flex items-center gap-3">
      <Cpu className="w-3 h-3" />
      <span>Gemini 2.5 Flash</span>
    </div>
    <div className="flex items-center gap-3">
      <Activity className="w-3 h-3" />
      <span>Latency: 45ms</span>
    </div>
    <div className="flex items-center gap-3 hidden sm:flex">
      <GlobeIcon className="w-3 h-3" />
      <span>Global Coverage</span>
    </div>
  </div>
);

export const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="relative min-h-[85vh] flex items-center overflow-hidden">

      <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center h-full pt-10">

        {/* Left Content */}
        <div className="lg:col-span-6 space-y-10 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
              <span className="text-[10px] font-mono font-medium text-agri-green/80 uppercase tracking-[0.2em]">Crop-Yield-Prediction</span>
            </div>

            <h1 className="text-6xl lg:text-8xl font-display font-bold text-white leading-[0.9] tracking-tighter mb-8">
              Planetary <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/40">Prediction</span>
            </h1>

            <p className="text-lg text-slate-400 max-w-lg leading-relaxed font-light pl-1">
              Synthesize global environmental data into actionable agricultural forecasts.
              The next evolution of yield prediction is here.
            </p>

            <div className="flex flex-wrap gap-5 pt-8">
              <button
                onClick={onStart}
                className="group relative px-10 py-5 bg-white text-black font-bold text-xs tracking-[0.2em] uppercase rounded-full overflow-hidden transition-all hover:scale-105 shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_80px_-20px_rgba(255,255,255,0.5)]"
              >
                <div className="absolute inset-0 bg-agri-green/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
                <span className="relative flex items-center gap-3">
                  Initialize Console <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>

            <StatTicker />
          </motion.div>
        </div>

        {/* Right Visual - 3D Globe Integration */}
        <div className="lg:col-span-6 relative z-10 lg:pointer-events-auto flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="relative w-[500px] h-[500px] lg:w-[700px] lg:h-[700px] flex-shrink-0 grayscale-[20%] hover:grayscale-0 transition-all duration-1000"
          >
            {/* THE GLOBE */}
            <div className="absolute inset-0 z-10 rounded-full overflow-hidden mask-image-radial">
              <ErrorBoundary variant="card">
                <Globe isRotating={true} />
              </ErrorBoundary>
            </div>

            {/* Soft Glow Behind */}
            <div className="absolute inset-0 bg-agri-green/10 blur-[100px] rounded-full z-0" />

            {/* Floating UI Cards */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="absolute top-[20%] right-[5%] glass-premium p-5 rounded-2xl max-w-[220px] z-20 hidden lg:block"
            >
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-agri-green" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Analysis Active</span>
              </div>
              <div className="space-y-2">
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-agri-green w-[75%] animate-shimmer" />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-white/40">
                  <span>PROCESSING</span>
                  <span className="text-agri-green">COMPLETE</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};