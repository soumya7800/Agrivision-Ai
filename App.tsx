import React, { useState, useEffect } from 'react';
import { Hero } from './components/Hero';
import { LoadingScreen } from './components/LoadingScreen';
import { PredictionForm } from './components/PredictionForm';
import { Dashboard } from './components/Dashboard';
import { PredictionResult, SoilData } from './types';
import { predictCropYield } from './services/geminiService';
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion';
import { Leaf, LogIn, Hexagon, Sprout } from 'lucide-react';
import { useAuth, SignIn, UserButton } from './services/authContext';
import { SoilParticles } from './components/SoilParticles';

export default function App() {
  console.log("App: Rendering");
  const [view, setView] = useState<'hero' | 'form' | 'dashboard' | 'login'>('hero');
  const [predictionData, setPredictionData] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();


  // Redirect to home if accessing protected routes while signed out
  useEffect(() => {
    if (isLoaded && !isSignedIn && (view === 'form' || view === 'dashboard')) {
      setView('hero');
    }
  }, [isSignedIn, isLoaded, view]);

  // Redirect to form if signed in and on login page
  useEffect(() => {
    if (isSignedIn && view === 'login') {
      setView('form');
    }
  }, [isSignedIn, view]);

  const handleStart = () => {
    if (isSignedIn) {
      setView('form');
    } else {
      setView('login');
    }
  };

  const handlePredictionSubmit = async (formData: SoilData) => {
    setIsLoading(true);
    setView('dashboard');
    setPredictionData(null);

    try {
      const result = await predictCropYield(formData);
      setPredictionData(result);
    } catch (error) {
      console.error("Prediction failed", error);
      setView('form');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPredictionData(null);
    setView('form');
  };

  // Clear data on sign out
  useEffect(() => {
    if (!isSignedIn) {
      setPredictionData(null);
    }
  }, [isSignedIn]);

  // Initial App Load
  const [isAppLoading, setIsAppLoading] = useState(() => {
    // @ts-ignore
    return !window.agriAppLoaded;
  });

  useEffect(() => {
    if (!isAppLoading) return;
    const timer = setTimeout(() => {
      setIsAppLoading(false);
      // @ts-ignore
      window.agriAppLoaded = true;
    }, 4500);
    return () => clearTimeout(timer);
  }, [isAppLoading]);

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden relative selection:bg-agri-green/30 selection:text-white font-sans">

      {/* --- Phase 3: Futuristic Background Layers --- */}
      <SoilParticles />

      {/* --- Premium Dynamic Background --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Deep, slowly moving aurora blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-agri-green/5 rounded-full blur-[150px] animate-float opacity-40" />
        <div className="absolute top-[40%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[150px] animate-float opacity-30" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px] animate-pulse opacity-20" />

        {/* Subtle Grain Overlay is in global CSS */}

        {/* Tech Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.4]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4">
        <div className="glass-premium rounded-full px-6 py-3 flex items-center justify-between shadow-2xl shadow-black/50">

          {/* Logo */}
          <motion.div
            layoutId="logo"
            className="flex items-center gap-3 cursor-pointer group shrink-0"
            onClick={() => setView('hero')}
          >
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setView('hero')}>
              <div className="relative w-8 h-8 flex items-center justify-center bg-agri-green/10 rounded-md border border-agri-green/20 group-hover:border-agri-green/50 transition-colors">
                <Sprout className="w-4 h-4 text-agri-green" />
                <div className="absolute inset-0 bg-agri-green/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-sm font-mono font-bold text-white tracking-[0.25em] uppercase leading-none">
                  AI<span className="text-agri-green">.</span>CROP<span className="text-agri-green">.</span>YIELD<span className="text-agri-green">.</span>PREDICTION
                </h1>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Navigation */}
          <div className="flex items-center gap-4">

            {/* Navigation Links */}
            <LayoutGroup>
              <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/5 backdrop-blur-sm">
                {['hero', 'form', 'dashboard'].map((tab) => {
                  if ((tab === 'form' || tab === 'dashboard') && !isSignedIn) return null;
                  if (tab === 'dashboard' && !predictionData && !isLoading) return null;

                  const labels: Record<string, string> = { hero: 'Nexus', form: 'Predict', dashboard: 'Intel' };
                  const isActive = view === tab;

                  return (
                    <button
                      key={tab}
                      onClick={() => setView(tab as any)}
                      className={`relative px-5 py-1.5 text-xs font-bold tracking-wide transition-colors uppercase ${isActive ? 'text-black' : 'text-slate-400 hover:text-white'}`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute inset-0 bg-agri-green rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                          transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                        />
                      )}
                      <span className="relative z-10">{labels[tab]}</span>
                    </button>
                  );
                })}
              </div>
            </LayoutGroup>

            {/* Auth Button */}
            <div className="pl-4 border-l border-white/10 hidden sm:block">
              {isSignedIn ? (
                <UserButton />
              ) : (
                <button
                  onClick={() => setView('login')}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-xs font-bold uppercase tracking-wider text-agri-green"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Access</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 pt-32 min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {isAppLoading && (
            <LoadingScreen key="loading" />
          )}

          {!isAppLoading && view === 'hero' && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, filter: 'blur(20px)', scale: 0.95 }}
              animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
              exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.05 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex-grow flex flex-col"
            >
              <Hero onStart={handleStart} />
            </motion.div>
          )}

          {view === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -50, filter: 'blur(10px)' }}
              transition={{ duration: 0.6, ease: "circOut" }}
              className="flex-grow flex flex-col items-center justify-center p-6"
            >
              <PredictionForm onSubmit={handlePredictionSubmit} isSubmitting={isLoading} />
            </motion.div>
          )}

          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
              transition={{ duration: 0.6, ease: "backOut" }}
              className="flex-grow"
            >
              <Dashboard
                data={predictionData}
                isLoading={isLoading}
                onReset={handleReset}
              />
            </motion.div>
          )}

          {view === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex-grow flex flex-col items-center justify-center p-6"
            >
              <SignIn />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 py-6 text-center">
        <p className="text-[10px] text-white/20 font-mono uppercase tracking-[0.2em] mix-blend-overlay">
          AgriVision AI // Planetary Prediction System
        </p>
      </footer>
    </div>
  );
}