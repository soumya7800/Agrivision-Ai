import React, { useState, useEffect } from 'react';
import { DEFAULT_SOIL_DATA, MAX_VALUES, CROP_OPTIONS, COUNTRIES } from '../constants';
import { SoilData } from '../types';
import { Loader2, MapPin, ChevronDown, Sprout, Wind, Droplets, Thermometer, FlaskConical, Gauge, Zap, Search, CheckCircle2 } from 'lucide-react';
import { Globe } from './Globe';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from './ErrorBoundary';

interface PredictionFormProps {
  onSubmit: (data: SoilData) => void;
  isSubmitting?: boolean;
}

export const PredictionForm: React.FC<PredictionFormProps> = ({ onSubmit, isSubmitting = false }) => {
  const [formData, setFormData] = useState<SoilData>(DEFAULT_SOIL_DATA);
  const [selectedCountryObj, setSelectedCountryObj] = useState(COUNTRIES[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const country = COUNTRIES.find(c => c.name === formData.country) || COUNTRIES[0];
    setSelectedCountryObj(country);
  }, [formData.country]);

  const handleInputChange = (field: keyof SoilData, value: number | string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const SliderField = ({ label, field, min, max, unit, colorClass }: any) => {
    const percent = (Number(formData[field as keyof SoilData]) / max) * 100;
    return (
      <div className="group pt-4 pb-2">
        <div className="flex justify-between items-center mb-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">
            {label}
          </label>
          <span className="text-xs font-mono text-slate-300">
            {formData[field as keyof SoilData]} <span className="text-slate-600">{unit}</span>
          </span>
        </div>

        <div className="relative w-full h-1 bg-white/5 rounded-full overflow-visible group-hover:bg-white/10 transition-colors">
          <div
            className={`absolute top-0 left-0 h-full rounded-full ${colorClass.replace('text-', 'bg-')} opacity-80 group-hover:opacity-100 transition-all`}
            style={{ width: `${percent}%` }}
          />
          {/* Thumb */}
          <div
            className="absolute top-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1/2 pointer-events-none"
            style={{ left: `${percent}%`, transform: `translate(-50%, -50%)` }}
          />
          <input
            type="range"
            min={min}
            max={max}
            value={formData[field as keyof SoilData]}
            onChange={(e) => handleInputChange(field, Number(e.target.value))}
            disabled={isSubmitting}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    );
  };

  const HolographicGrid = () => (
    <div
      className="absolute inset-0 z-0 opacity-20 pointer-events-none"
      style={{
        backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.05) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
      }}
    />
  );

  return (
    <div className="max-w-7xl mx-auto px-6 pb-24 w-full pt-12 relative">

      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-agri-green/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 glass-panel overflow-hidden rounded-[2.5rem] shadow-2xl border-0 ring-1 ring-white/10"
      >
        <HolographicGrid />

        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[650px]">

          {/* LEFT: VISUAL CONTEXT (Globe + Region) */}
          <div className="lg:col-span-5 relative bg-[#020617]/40 border-r border-white/5 flex flex-col backdrop-blur-sm">

            {/* Ambient Glow for Globe */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="absolute inset-x-0 top-0 bottom-24 z-0">
              <ErrorBoundary variant="card">
                <Globe targetLat={selectedCountryObj.lat} targetLng={selectedCountryObj.lng} isRotating={false} />
              </ErrorBoundary>
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Region Selector Overlay */}
            <div className="relative z-10 p-10 mt-auto">
              <div className="mb-8 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-agri-green/10 border border-agri-green/20 backdrop-blur-md w-fit">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-agri-green opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-agri-green"></span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-agri-green tracking-widest uppercase">Target Vector</span>
                </div>

                {/* Custom Minimal Dropdown */}
                <div className="relative group">
                  <button
                    onClick={() => !isSubmitting && setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full text-left relative py-4 group-hover:scale-[1.01] transition-transform origin-left"
                  >
                    <span className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-agri-green/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                    <div className="flex justify-between items-baseline">
                      <span className="text-4xl font-display font-medium text-white group-hover:text-agri-green transition-colors tracking-tight">
                        {formData.country}
                      </span>
                      <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-agri-green' : ''}`} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full left-0 w-full mb-4 max-h-[280px] overflow-y-auto bg-[#0a0f1d]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50 scrollbar-thin scrollbar-thumb-agri-green/20"
                      >
                        <div className="p-2 space-y-1">
                          {COUNTRIES.map(c => (
                            <button
                              key={c.name}
                              onClick={() => {
                                handleInputChange('country', c.name);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 text-xs font-mono rounded-xl transition-all flex justify-between items-center group/item ${formData.country === c.name
                                ? 'bg-agri-green/10 text-agri-green shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                              <span className="tracking-wide">{c.name}</span>
                              {formData.country === c.name && <CheckCircle2 className="w-3 h-3 text-agri-green" />}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                <div className="group/stat">
                  <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider mb-1 group-hover/stat:text-blue-400 transition-colors">Avg Temp</p>
                  <p className="text-xl font-display font-bold text-white group-hover/stat:text-shadow-glow transition-all">{selectedCountryObj.avgTemp}°C</p>
                </div>
                <div className="group/stat">
                  <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider mb-1 group-hover/stat:text-blue-400 transition-colors">Avg Rain</p>
                  <p className="text-xl font-display font-bold text-white group-hover/stat:text-shadow-glow transition-all">{selectedCountryObj.avgRain}mm</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: CONTROL PANEL */}
          <motion.div
            className="lg:col-span-7 bg-[#050505]/60 backdrop-blur-xl p-10 lg:p-14 flex flex-col relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            variants={{
              visible: { transition: { staggerChildren: 0.15 } }
            }}
          >
            {/* Subtle internal grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none opacity-50" />

            <motion.div
              variants={{
                hidden: { opacity: 0, x: 10 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] } }
              }}
              className="flex justify-between items-start mb-12 relative z-10"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-px w-8 bg-agri-green/50" />
                  <h2 className="text-2xl font-display font-bold text-white tracking-tight">System Configuration</h2>
                </div>
                <p className="text-slate-500 text-sm font-light pl-11 max-w-sm">
                  Calibrate environmental parameters for predictive synthesis.
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center animate-pulse-glow">
                <Zap className="w-5 h-5 text-agri-green" />
              </div>
            </motion.div>

            <form onSubmit={handleSubmit} className="flex-grow flex flex-col gap-10 relative z-10">

              {/* Crop Selection - Minimal Tags */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] } }
                }}
                className="space-y-4"
              >
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 pl-1">
                  <Sprout className="w-3 h-3 text-agri-green" /> Target Biomass
                </label>
                <div className="flex flex-wrap gap-3">
                  {CROP_OPTIONS.slice(0, 5).map((crop) => (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => handleInputChange('cropType', crop)}
                      className={`relative group px-5 py-2.5 rounded-xl text-xs font-bold transition-all overflow-hidden ${formData.cropType === crop
                        ? 'bg-agri-green text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                        : 'bg-white/5 text-slate-400 border border-white/5 hover:border-white/20 hover:text-white'
                        }`}
                    >
                      <span className="relative z-10">{crop}</span>
                      {formData.cropType !== crop && <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />}
                    </button>
                  ))}
                  <div className="relative">
                    <select
                      value={formData.cropType && CROP_OPTIONS.slice(0, 5).includes(formData.cropType) ? "" : formData.cropType}
                      onChange={(e) => handleInputChange('cropType', e.target.value)}
                      className="appearance-none bg-[#0a0f1d] text-slate-400 text-xs font-bold px-5 py-2.5 rounded-xl border border-white/5 hover:border-white/20 focus:outline-none cursor-pointer transition-colors"
                    >
                      <option value="" disabled>Extensions...</option>
                      {CROP_OPTIONS.slice(5).map(crop => (
                        <option key={crop} value={crop} className="bg-slate-900">{crop}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
                  </div>
                </div>
              </motion.div>

              {/* Parameters Grid */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.1, ease: [0.25, 0.4, 0.25, 1] } }
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4"
              >
                {/* Column 1 */}
                <div className="space-y-6">
                  <div className="mb-2 pb-2 border-b border-white/5 flex justify-between items-end">
                    <span className="text-[10px] font-bold text-agri-green uppercase tracking-widest">Soil Matrix</span>
                    <span className="text-[9px] font-mono text-slate-600">N-P-K-pH</span>
                  </div>
                  <SliderField label="Nitrogen" field="nitrogen" min={0} max={MAX_VALUES.nitrogen} unit="mg" colorClass="text-blue-400" />
                  <SliderField label="Phosphorus" field="phosphorus" min={0} max={MAX_VALUES.phosphorus} unit="mg" colorClass="text-purple-400" />
                  <SliderField label="Potassium" field="potassium" min={0} max={MAX_VALUES.potassium} unit="mg" colorClass="text-pink-400" />
                  <SliderField label="Acidity (pH)" field="ph" min={0} max={MAX_VALUES.ph} unit="pH" colorClass="text-teal-400" />
                </div>

                {/* Column 2 */}
                <div className="space-y-6">
                  <div className="mb-2 pb-2 border-b border-white/5 flex justify-between items-end">
                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Atmosphere</span>
                    <span className="text-[9px] font-mono text-slate-600">T-H-R</span>
                  </div>
                  <SliderField label="Temperature" field="temperature" min={0} max={MAX_VALUES.temperature} unit="°C" colorClass="text-orange-400" />
                  <SliderField label="Humidity" field="humidity" min={0} max={MAX_VALUES.humidity} unit="%" colorClass="text-cyan-400" />
                  <SliderField label="Rainfall" field="rainfall" min={0} max={MAX_VALUES.rainfall} unit="mm" colorClass="text-blue-500" />
                </div>
              </motion.div>

              {/* Action Footer */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] } }
                }}
                className="mt-auto pt-10"
              >
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="relative group w-full h-16 bg-gradient-to-r from-agri-green to-emerald-500 rounded-2xl overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_40px_rgba(16,185,129,0.2)] hover:shadow-[0_0_60px_rgba(16,185,129,0.4)]"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_2s_italic_infinite] opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative flex items-center justify-center gap-3 text-black font-bold text-sm tracking-widest uppercase h-full">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing Vector...</span>
                      </>
                    ) : (
                      <>
                        <span>Initialize Simulation</span>
                        <Zap className="w-5 h-5 fill-black" />
                      </>
                    )}
                  </div>
                </button>
              </motion.div>

            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};