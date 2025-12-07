import React, { useState, useEffect } from 'react';
import { Hero } from './components/Hero';
import { LoadingScreen } from './components/LoadingScreen';
import { PredictionForm } from './components/PredictionForm';
import { Dashboard } from './components/Dashboard';
import { PredictionResult, SoilData } from './types';
import { predictCropYield } from './services/geminiService';
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion';
import { Leaf, Sparkles, LogIn } from 'lucide-react';
import { useAuth, SignIn, UserButton } from './services/authContext';

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
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    // Wait for the LoadingScreen animation to finish (approx 4s based on LoadingScreen logic)
    // We can also just listen for a callback, but a timeout is simple for now. 
    // LoadingScreen has internal progress of ~4s. Let's match it + buffer.
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-agri-dark text-white overflow-hidden relative selection:bg-agri-green selection:text-white font-sans">

      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-agri-green/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-agri-water/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.1]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-agri-dark/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">

          {/* Logo */}
          <motion.div
            layoutId="logo"
            className="flex items-center gap-3 cursor-pointer group shrink-0"
            onClick={() => setView('hero')}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-agri-green/20 blur-lg rounded-full group-hover:bg-agri-green/40 transition-all" />
              <div className="relative p-2 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl group-hover:border-agri-green/30 transition-colors">
                <Leaf className="w-5 h-5 text-agri-green" />
              </div>
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-white group-hover:text-agri-green transition-colors hidden sm:inline-block">
              AgriVision <span className="text-agri-green">AI</span>
            </span>
          </motion.div>

          {/* Right Side: Navigation */}
          <div className="flex items-center gap-6">

            {/* Navigation Links */}
            <LayoutGroup>
              <div className="flex items-center gap-1 p-1 bg-white/5 rounded-full border border-white/5 backdrop-blur-sm overflow-x-auto no-scrollbar">
                {['hero', 'form', 'dashboard'].map((tab) => {
                  // Protected routes
                  if ((tab === 'form' || tab === 'dashboard') && !isSignedIn) return null;

                  // Dashboard visiblity: Only show if data exists or is loading
                  if (tab === 'dashboard' && !predictionData && !isLoading) return null;

                  const labels: Record<string, string> = { hero: 'Home', form: 'Predict', dashboard: 'Results' };
                  const isActive = view === tab;

                  return (
                    <button
                      key={tab}
                      onClick={() => setView(tab as any)}
                      className={`relative px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="nav-bg"
                          className="absolute inset-0 bg-white/10 rounded-full border border-white/5 shadow-sm"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span className="relative z-10">{labels[tab]}</span>
                    </button>
                  );
                })}
              </div>
            </LayoutGroup>

            {/* Auth Button */}
            <div className="pl-4 border-l border-white/10">
              {isSignedIn ? (
                <UserButton />
              ) : (
                <button
                  onClick={() => setView('login')}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-agri-green/10 text-agri-green border border-agri-green/20 hover:bg-agri-green/20 transition-all text-sm font-bold tracking-wide"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 pt-24 min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {isAppLoading && (
            <LoadingScreen key="loading" />
          )}

          {!isAppLoading && view === 'hero' && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.98 }}
              transition={{ duration: 0.5 }}
              className="flex-grow flex flex-col"
            >
              <Hero onStart={handleStart} />
            </motion.div>
          )}

          {view === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
              transition={{ duration: 0.5, ease: "circOut" }}
              className="flex-grow flex flex-col items-center justify-center p-6"
            >
              <PredictionForm onSubmit={handlePredictionSubmit} isSubmitting={isLoading} />
            </motion.div>
          )}

          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
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
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.4 }}
              className="flex-grow flex flex-col items-center justify-center p-6"
            >
              <SignIn />
            </motion.div>
          )}


        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-agri-dark/50 backdrop-blur-md mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-agri-green animate-pulse" />
            <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">System Operational</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-slate-600 hover:text-agri-green transition-colors cursor-pointer text-sm">Privacy</span>
            <span className="text-slate-600 hover:text-agri-green transition-colors cursor-pointer text-sm">Terms</span>

          </div>
        </div>
      </footer>
    </div>
  );
}