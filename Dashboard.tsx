import React, { useState, useEffect } from 'react';
import { PredictionResult, Recommendation } from '../types';
import { COUNTRIES, CROP_NUTRIENT_PROFILES } from '../constants';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, CheckCircle, RotateCcw, Droplets, Sprout, Activity, Layers, Database, Loader2, ArrowUpRight, ArrowDownRight, Globe as GlobeIcon, BarChart3, Play, Pause, FastForward, ClipboardCheck, FileText, AlertOctagon, XCircle, CheckCircle2, Beaker, ChevronDown, RotateCw, Scan, Zap, Wheat, Cloud, Sun, Coffee, Flower2, Circle, Nut } from 'lucide-react';
import { Globe } from './Globe';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveTrainingData, getDataset } from '../services/xgboostService';


interface DashboardProps {
  data: PredictionResult | null;
  isLoading: boolean;
  onReset: () => void;
}

// --- Skeleton Components ---

const SkeletonPulse = ({ className }: { className: string }) => (
  <div className={`bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] animate-pulse rounded-xl ${className}`} />
);

const SkeletonHologram = () => (
  <div className="relative h-full min-h-[500px] glass-panel rounded-3xl overflow-hidden flex flex-col items-center justify-center perspective-1000 border-0 ring-1 ring-white/5">
    <div className="absolute inset-0 bg-[#050505]/80" />
    <div className="w-32 h-32 rounded-full bg-white/5 animate-pulse-glow flex items-center justify-center backdrop-blur-md border border-white/10">
      <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
    </div>
    <p className="mt-8 text-xs font-mono text-slate-500 uppercase tracking-widest animate-pulse">Initializing Neural Core...</p>
  </div>
);

const SkeletonCard = () => (
  <div className="glass-card p-6 rounded-3xl flex flex-col justify-between h-40 border-0 bg-white/[0.02]">
    <div className="flex justify-between items-start">
      <SkeletonPulse className="h-4 w-24" />
      <div className="h-8 w-8 rounded-full bg-white/5 animate-pulse" />
    </div>
    <div className="space-y-3">
      <SkeletonPulse className="h-8 w-32" />
      <SkeletonPulse className="h-2 w-full rounded-full opacity-50" />
    </div>
  </div>
);

// --- Visual Components ---

const CROP_STYLES: any = {
  Rice: { icon: Wheat, color: 'text-yellow-400', shadow: 'rgba(250, 204, 21, 0.5)', structure: 'grain' },
  Maize: { icon: Wheat, color: 'text-yellow-500', shadow: 'rgba(234, 179, 8, 0.5)', structure: 'grain' },
  Wheat: { icon: Wheat, color: 'text-amber-400', shadow: 'rgba(251, 191, 36, 0.5)', structure: 'grain' },
  Cotton: { icon: Cloud, color: 'text-slate-100', shadow: 'rgba(241, 245, 249, 0.5)', structure: 'cloud' },
  Coffee: { icon: Coffee, color: 'text-amber-800', shadow: 'rgba(146, 64, 14, 0.5)', structure: 'orb' },
  Apple: { icon: Circle, color: 'text-red-500', shadow: 'rgba(239, 68, 68, 0.5)', structure: 'orb' },
  Banana: { icon: Sun, color: 'text-yellow-300', shadow: 'rgba(253, 224, 71, 0.5)', structure: 'orb' },
  Mango: { icon: Sun, color: 'text-orange-400', shadow: 'rgba(251, 146, 60, 0.5)', structure: 'orb' },
  Grapes: { icon: Circle, color: 'text-purple-500', shadow: 'rgba(168, 85, 247, 0.5)', structure: 'orb' },
  Watermelon: { icon: Circle, color: 'text-green-500', shadow: 'rgba(34, 197, 94, 0.5)', structure: 'orb' },
  Jute: { icon: Flower2, color: 'text-amber-700', shadow: 'rgba(180, 83, 9, 0.5)', structure: 'grain' },
  Default: { icon: Sprout, color: 'text-agri-green', shadow: 'rgba(16, 185, 129, 0.5)', structure: 'rings' }
};

const CropHologram = ({ data }: { data: PredictionResult }) => {
  const cropType = data.inputSummary.cropType || 'Default';
  // Fallback to direct match or Default
  const style = CROP_STYLES[cropType] || (Object.keys(CROP_STYLES).find(k => cropType.includes(k)) ? CROP_STYLES[Object.keys(CROP_STYLES).find(k => cropType.includes(k))!] : CROP_STYLES.Default);

  const Icon = style.icon;
  const themeColor = style.color;
  const glowShadow = `0 0 50px ${style.shadow}`;
  const isCloud = style.structure === 'cloud';

  return (
    <div className="relative h-full min-h-[500px] glass-panel rounded-[2.5rem] overflow-hidden flex flex-col items-center justify-center group perspective-1000 border-0 ring-1 ring-white/5 bg-[#050505]/40 backdrop-blur-2xl">

      {/* Ambient Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full blur-[120px] opacity-100 transition-colors duration-1000`}
        style={{ backgroundColor: style.shadow.replace('0.5', '0.1') }} />

      {/* Grid Floor */}
      <div
        className="absolute bottom-[-100px] w-[200%] h-[200%] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30"
        style={{ transform: 'rotateX(70deg) translateY(0px)' }}
      />

      <div className="relative w-full h-full flex items-center justify-center perspective-1000 z-10">
        <motion.div
          className="relative w-72 h-72 preserve-3d flex items-center justify-center"
          animate={{ rotateY: 360 }}
          transition={{ duration: isCloud ? 120 : 60, repeat: Infinity, ease: "linear" }}
        >
          {/* Floating Rings (Different styles based on structure) */}
          {!isCloud && (
            <>
              <div className={`absolute inset-[-40px] border border-dashed border-white/5 rounded-full opacity-60 ${style.structure === 'grain' ? 'border-amber-500/20' : ''}`} style={{ transform: 'rotateX(75deg)' }} />
              <div className={`absolute inset-[-20px] border border-white/5 rounded-full`} style={{ transform: 'rotateX(75deg)' }} />
            </>
          )}

          {isCloud && (
            <div className="absolute inset-[-60px] bg-white/5 blur-xl rounded-full opacity-20 animate-pulse" />
          )}

          <div className={`absolute inset-[20px] border border-white/5 rounded-full opacity-30 animate-pulse`} style={{ transform: 'rotateX(75deg)' }} />

          {/* Core */}
          <motion.div
            className="preserve-3d flex items-center justify-center"
            animate={{ y: [-15, 15, -15] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Orbiting Elements */}
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <div
                key={deg}
                className={`absolute flex items-center justify-center ${themeColor}`}
                style={{ transform: `rotateY(${deg}deg) translateZ(${isCloud ? 80 : 60}px)`, opacity: 0.8 }}
              >
                {style.structure === 'cloud' ? (
                  <Cloud size={40} className="opacity-50 blur-[2px]" />
                ) : style.structure === 'grain' ? (
                  <div className="w-1 h-12 bg-current opacity-50 blur-[1px] rounded-full" />
                ) : (
                  <div className="w-3 h-3 bg-current rounded-full shadow-[0_0_10px_currentColor]" />
                )}
              </div>
            ))}

            {/* Center Piece */}
            <div className={`absolute flex items-center justify-center ${themeColor}`} style={{ transform: 'translateZ(0)' }}>
              <Icon size={140} strokeWidth={1} style={{ filter: `drop-shadow(${glowShadow})` }} />
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute top-8 left-8 flex flex-col gap-2 z-20">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] text-white font-bold uppercase tracking-widest backdrop-blur-md">
          <Activity className="w-3 h-3" /> Live Simulation
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-10 z-20 bg-gradient-to-t from-[#050505] to-transparent">
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className={`flex w-1.5 h-1.5 rounded-full ${themeColor.replace('text-', 'bg-')} animate-pulse shadow-[0_0_8px_currentColor]`} />
              <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase">Target Biomass</p>
            </div>
            <h3 className="text-5xl font-display font-medium text-white tracking-tighter leading-none">{data.inputSummary.cropType}</h3>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 mb-1 font-bold tracking-[0.2em] uppercase">Predicted Yield</p>
            <p className={`text-4xl font-bold font-mono ${themeColor} drop-shadow-lg tracking-tight`}>{data.yieldPrediction.toFixed(1)} <span className="text-sm text-slate-500 font-sans tracking-normal">t/ha</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ label, value, subtext, icon: Icon, trend, colorClass, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="h-full"
  >
    <div className={`glass-card p-6 h-full flex flex-col justify-between rounded-[1.5rem] relative overflow-hidden group bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all active:scale-[0.98]`}>

      {/* Dynamic Background Gradient */}
      <div className={`absolute -right-20 -top-20 w-48 h-48 bg-${colorClass}/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700`} />

      <div className="flex justify-between items-start mb-6 relative z-10 hidden-scrollbar">
        <div>
          <p className="text-slate-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-2">{label}</p>
          <h3 className="text-3xl font-display font-medium text-white tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-${colorClass}/10 transition-colors`}>
          <Icon className={`w-5 h-5 text-${colorClass}`} />
        </div>
      </div>

      {subtext && (
        <div className="flex items-center gap-2 mt-auto relative z-10 pt-4 border-t border-white/5">
          {trend === 'up' && <ArrowUpRight className="w-3 h-3 text-agri-green" />}
          {trend === 'down' && <ArrowDownRight className="w-3 h-3 text-red-400" />}
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-[90%] uppercase tracking-wide">{subtext}</p>
        </div>
      )}
    </div>
  </motion.div>
);

const AnomalyGauge = ({ label, value, baseline, unit, color, icon: Icon, interval }: any) => {
  // State removed, now controlled by parent
  const currentVal = value;


  const percentage = Math.min(100, Math.max(0, (currentVal / (baseline * 1.5)) * 100)); // Normalize roughly
  const deviation = ((currentVal - baseline) / baseline) * 100;
  const isHigh = deviation > 0;

  return (
    <div className="relative">
      <div className="flex justify-between items-end mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-${color}-500/20`}>
            <Icon className={`w-4 h-4 text-${color}-400`} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{label}</p>
            <p className="text-white font-mono text-sm">
              {currentVal.toFixed(1)} <span className="text-slate-500">{unit}</span>
              <span className="text-[10px] text-slate-500 ml-2">Norm: {baseline} {unit}</span>
            </p>
          </div>
        </div>
        <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isHigh ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-agri-green/10 border-agri-green/20 text-agri-green'}`}>
          {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}% {deviation > 10 ? 'ANOMALY' : 'NOMINAL'}
        </div>
      </div>

      {/* Bar Track */}
      <div className="h-4 bg-black/40 rounded-full w-full relative overflow-hidden border border-white/5">
        {/* Baseline Marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/30 z-20"
          style={{ left: `${(100 / 1.5)}%` }} // Normalized baseline approx position
        />

        {/* Fill Bar */}
        <motion.div
          className={`absolute top-0 bottom-0 left-0 bg-gradient-to-r from-${color}-900 to-${color}-500 rounded-full`}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 10 }}
        />

        {/* Glow Effect */}
        <motion.div
          className={`absolute top-0 bottom-0 width-2 bg-white/50 blur-md z-10`}
          animate={{ left: [`${percentage - 5}%`, `${percentage + 5}%`] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      <div className="flex justify-between mt-1 text-[9px] text-slate-600 font-mono">
        <span>0</span>
        <span>AVG</span>
        <span>MAX</span>
      </div>
    </div>
  )
}

const AdvisorySection = ({ recommendations, limitingFactors, onExport }: { recommendations: Recommendation[], limitingFactors: string[], onExport: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="mt-12 border-t border-white/10 pt-12"
    >
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <ClipboardCheck className="w-6 h-6 text-agri-green" />
            Strategic Implementation
          </h3>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl">
            AI-generated agronomy report detailing critical constraints and optimized strategies.
          </p>
        </div>

        <motion.button
          onClick={onExport}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group relative px-6 py-3 bg-black/40 rounded-xl overflow-hidden border border-agri-green/30"
        >
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-agri-green/0 via-agri-green/10 to-agri-green/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

          <div className="relative flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-agri-green/20 text-agri-green group-hover:bg-agri-green group-hover:text-black transition-colors">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Export Analysis</span>
              <span className="text-[10px] text-agri-green/80 font-mono group-hover:text-agri-green transition-colors">PDF REPORT</span>
            </div>
            <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-white transition-colors" />
          </div>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Limiting Factors Panel */}
        <div className="lg:col-span-1 glass-panel rounded-3xl p-6 h-full relative overflow-hidden group">
          <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors" />
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertOctagon className="w-5 h-5 text-red-400" />
            </div>
            <h4 className="text-lg font-bold text-white">Yield Constraints</h4>
          </div>

          <div className="relative z-10 space-y-3">
            {limitingFactors.length > 0 ? limitingFactors.map((factor, i) => (
              <div key={i} className="flex gap-3 items-start p-4 bg-red-950/20 rounded-2xl border border-red-500/10 hover:border-red-500/30 transition-colors">
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-200 font-medium text-sm">{factor}</p>
                  <p className="text-red-400/60 text-xs mt-1">Critical impact detected.</p>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-40 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                <CheckCircle2 className="w-8 h-8 text-agri-green mb-3" />
                <p className="text-slate-300 font-medium text-xs">No constraints detected.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300 group flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${rec.type === 'nutrient' ? 'bg-purple-500/20 text-purple-400' :
                  rec.type === 'irrigation' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>
                  {rec.type === 'nutrient' ? <Beaker className="w-4 h-4" /> :
                    rec.type === 'irrigation' ? <Droplets className="w-4 h-4" /> :
                      <Sprout className="w-4 h-4" />
                  }
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded border tracking-wider ${rec.impact === 'High' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                  rec.impact === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                    'bg-green-500/10 border-green-500/20 text-green-400'
                  }`}>
                  {rec.impact.toUpperCase()}
                </span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2 group-hover:text-agri-green transition-colors">{rec.title}</h4>
              <p className="text-slate-400 text-xs leading-relaxed flex-grow">{rec.description}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export const Dashboard: React.FC<DashboardProps> = ({ data, isLoading, onReset }) => {
  const [marketData, setMarketData] = useState<any[]>([]);
  const [yieldData, setYieldData] = useState<any[]>([]);
  const [updateInterval, setUpdateInterval] = useState<number>(5000);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [marketChartType, setMarketChartType] = useState<'line' | 'bar'>('line');
  const [countryStats, setCountryStats] = useState<any>(null);

  const [isGlobeRotating, setIsGlobeRotating] = useState(true);

  // Feedback Data State
  const [userYield, setUserYield] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [trainingData, setTrainingData] = useState<any[]>([]);

  // Simulation Noise State
  const [tempNoise, setTempNoise] = useState(0);
  const [rainNoise, setRainNoise] = useState(0);

  useEffect(() => {
    if (!data) return;
    const interval = setInterval(() => {
      const tNoise = (Math.random() - 0.5) * (data.inputSummary.temperature * 0.05);
      const rNoise = (Math.random() - 0.5) * (data.inputSummary.rainfall * 0.05);
      setTempNoise(tNoise);
      setRainNoise(rNoise);
    }, 2000);
    return () => clearInterval(interval);
  }, [data]);

  const fetchDataset = async () => {
    const data = await getDataset();
    setTrainingData(data);
  };


  const handleSaveData = async () => {
    if (!userYield || isNaN(Number(userYield)) || !data) return;
    setSaveStatus('saving');
    // Map inputSummary to SoilData structure
    const soilData: any = {
      country: data.inputSummary.country,
      cropType: data.inputSummary.cropType,
      temperature: data.inputSummary.temperature,
      rainfall: data.inputSummary.rainfall,
      humidity: data.inputSummary.humidity, // Note: Model doesn't strictly use humidity/N/P/K yet but we save what we have
      nitrogen: data.inputSummary.nitrogen,
      phosphorus: data.inputSummary.phosphorus,
      potassium: data.inputSummary.potassium,
      ph: data.inputSummary.ph,
      pesticides: data.inputSummary.pesticides
    };

    const success = await saveTrainingData(soilData, Number(userYield));
    if (success) {
      setSaveStatus('saved');
      fetchDataset(); // Refresh the table
      setUserYield(''); // Clear the input field
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
    }
  };

  const generateReport = () => {
    if (!data) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // --- Helper: Professional Header ---
    const drawHeader = () => {
      doc.setFillColor(10, 15, 30); // Dark Blue/Black
      doc.rect(0, 0, pageWidth, 40, 'F');

      doc.setTextColor(16, 185, 129); // Agri-Green
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("AgriVision AI", 14, 25);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("INTELLIGENT YIELD SYNTHESIS REPORT", pageWidth - 14, 25, { align: "right" });
    };

    // --- Helper: Professional Footer ---
    const drawFooter = (pageNo: number) => {
      doc.setFillColor(245, 247, 250);
      doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`Page ${pageNo}`, pageWidth - 14, pageHeight - 8, { align: "right" });
      doc.text(`Generated: ${new Date().toLocaleString()} | Confidential Agrivision Document`, 14, pageHeight - 8);
    };

    drawHeader();

    let yPos = 55;

    // --- Section 1: Strategic Summary ---
    doc.setTextColor(10, 20, 40);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("1. Strategic Summary", 14, yPos);

    // Status Badge
    const isHealthy = data.sustainabilityScore > 70;
    doc.setFillColor(isHealthy ? 220 : 255, isHealthy ? 255 : 240, isHealthy ? 220 : 220); // Light Green or Light Red/Yellow
    doc.roundedRect(140, yPos - 8, 55, 12, 2, 2, 'F');
    doc.setTextColor(isHealthy ? 0 : 180, isHealthy ? 100 : 50, 0);
    doc.setFontSize(10);
    doc.text(isHealthy ? "SUSTAINABILITY: OPTIMAL" : "SUSTAINABILITY: ATTENTION", 167, yPos, { align: "center" });

    yPos += 15;

    const summaryData = [
      ['Target Region', data.inputSummary.country],
      ['Crop Selection', data.inputSummary.cropType || 'N/A'],
      ['Analysis Year', `${data.inputSummary.year || new Date().getFullYear()}`],
      ['Confidence Score', `${data.confidenceScore}% (High Accuracy)`],
      ['Predicted Yield', `${data.yieldPrediction.toFixed(2)} tons/ha`],
      ['Total Cycles', '1 (Current Season)']
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Parameter', 'Specification']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [44, 62, 80], fontSize: 10, halign: 'left' },
      bodyStyles: { fontSize: 10, textColor: [50, 50, 60] },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // --- Section 2: Environmental Matrix ---
    doc.setTextColor(10, 20, 40);
    doc.setFontSize(16);
    doc.text("2. Environmental Matrix", 14, yPos);
    yPos += 10;

    const envData = [
      ['Nitrogen (N)', `${data.inputSummary.nitrogen} mg/kg`, 'Phosphorus (P)', `${data.inputSummary.phosphorus} mg/kg`],
      ['Potassium (K)', `${data.inputSummary.potassium} mg/kg`, 'pH Level', `${data.inputSummary.ph}`],
      ['Temperature', `${data.inputSummary.temperature}°C`, 'Humidity', `${data.inputSummary.humidity}%`],
      ['Rainfall', `${data.inputSummary.rainfall} mm`, 'Pesticides', `${data.inputSummary.pesticides || 100} tonnes`]
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value', 'Metric', 'Value']],
      body: envData,
      theme: 'striped',
      headStyles: { fillColor: [52, 152, 219], fontSize: 10 },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        2: { fontStyle: 'bold', cellWidth: 40 }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // --- Section 3: 12-Year Projection Matrix ---
    doc.setTextColor(10, 20, 40);
    doc.setFontSize(16);
    doc.text("3. 12-Year Projection Model (2018-2029)", 14, yPos);
    yPos += 10;

    // Reconstruct the logic used in the charts to match data exactly
    const basePrice = parseInt(data.marketAnalysis.estimatedPrice.replace(/[^0-9]/g, '')) || 500;
    const trendMultiplier = data.marketAnalysis.trend === 'Up' ? 1.05 : data.marketAnalysis.trend === 'Down' ? 0.95 : 1.0;
    const baseYield = data.yieldPrediction;

    const projectionData = Array.from({ length: 12 }, (_, i) => {
      const year = 2018 + i;
      const yearMultiplier = Math.pow(trendMultiplier, i);
      const projPrice = Math.floor(basePrice * yearMultiplier);
      const variation = (i * 0.2); // Simplified "trend" component from the chart
      const projYield = Number(Math.max(0, baseYield + variation).toFixed(2));

      return [year, `${projYield} t/ha`, `$${projPrice}/ton`, i === 0 ? "Historical" : i > (new Date().getFullYear() - 2018) ? "Forecast" : "Actual"];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['Fiscal Year', 'Proj. Yield', 'Est. Market Price', 'Status']],
      body: projectionData,
      theme: 'grid',
      headStyles: { fillColor: [142, 68, 173], fontSize: 10 },
      styles: { fontSize: 9, halign: 'center' },
      columnStyles: {
        0: { fontStyle: 'bold' },
        3: { fontStyle: 'italic' }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 20;

    // Page Break Check
    if (yPos > 240) {
      doc.addPage();
      drawHeader();
      yPos = 55;
    }

    // --- Section 4: Critical Limiting Factors ---
    doc.setTextColor(10, 20, 40);
    doc.setFontSize(16);
    doc.text("4. Critical Limiting Factors", 14, yPos);
    yPos += 10;

    if (data.limitingFactors && data.limitingFactors.length > 0) {
      data.limitingFactors.forEach((factor: string) => {
        doc.setFillColor(255, 230, 230);
        doc.rect(14, yPos - 6, 180, 10, 'F');
        doc.setTextColor(192, 57, 43);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`• ${factor}`, 20, yPos);
        yPos += 12;
      });
    } else {
      doc.setTextColor(39, 174, 96);
      doc.setFontSize(11);
      doc.text("No critical limiting factors detected. Conditions are optimal.", 14, yPos);
      yPos += 10;
    }

    yPos += 10;

    // --- Section 5: Strategic Recommendations ---
    doc.setTextColor(10, 20, 40);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("5. Strategic Action Plan", 14, yPos);
    yPos += 10;

    const recData = data.recommendations.map(r => [
      r.type.toUpperCase(),
      r.impact.toUpperCase(),
      r.title,
      r.description
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Category', 'Impact', 'Action Item', 'Details']],
      body: recData,
      theme: 'grid',
      headStyles: { fillColor: [44, 62, 80] },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 25 },
        1: { fontStyle: 'bold', textColor: [200, 0, 0], cellWidth: 25 },
        2: { fontStyle: 'bold', cellWidth: 40 }
      },
      styles: { fontSize: 9, cellPadding: 3 }
    });

    // Apply Footer to all pages
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      drawFooter(i);
    }

    doc.save(`AgriVision_Pro_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  useEffect(() => {
    if (!data) return;
    const currentRegionName = selectedRegion || data.inputSummary.country;
    const cData = COUNTRIES.find(c => c.name === currentRegionName) || COUNTRIES[0];
    setCountryStats(cData);

    const generateData = () => {
      const startYear = 2018;
      const basePrice = parseInt(data.marketAnalysis.estimatedPrice.replace(/[^0-9]/g, '')) || 500;
      const trendMultiplier = data.marketAnalysis.trend === 'Up' ? 1.05 : data.marketAnalysis.trend === 'Down' ? 0.95 : 1.0;

      const newMarketData = Array.from({ length: 12 }, (_, i) => {
        const volatility = Math.random() * 0.2 - 0.1;
        // Logic to make past data (before 2025) slightly more stable/linear if desired, but random is fine for now
        const yearMultiplier = Math.pow(trendMultiplier, i);
        return {
          year: startYear + i,
          value: Math.floor(basePrice * yearMultiplier * (1 + volatility))
        };
      });

      const baseYield = data.yieldPrediction;
      const newYieldData = Array.from({ length: 12 }, (_, i) => {
        const variation = (Math.random() * 1.5) - 0.5;
        return {
          year: startYear + i,
          value: Number(Math.max(0, baseYield + variation + (i * 0.2)).toFixed(1))
        };
      });

      setMarketData(newMarketData);
      setYieldData(newYieldData);
    };

    generateData();
    if (updateInterval > 0) {
      const interval = setInterval(generateData, updateInterval);
      return () => clearInterval(interval);
    }
  }, [data, updateInterval, selectedRegion]);

  if (isLoading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-6 pb-20 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          <div className="lg:col-span-5 xl:col-span-4 h-full min-h-[500px]">
            <SkeletonHologram />
          </div>
          <div className="lg:col-span-7 xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 content-start">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  const cropProfile = CROP_NUTRIENT_PROFILES[data.inputSummary.cropType] || CROP_NUTRIENT_PROFILES.Default;

  // Normalized scaling for Radar Chart visualization
  // pH scaled x10 (e.g., 6.5 -> 65)
  // Rain scaled /2 (e.g., 200 -> 100)
  const nutrientData = [
    { subject: 'N', A: data.inputSummary.nitrogen, B: cropProfile.nitrogen, fullMark: 150 },
    { subject: 'P', A: data.inputSummary.phosphorus, B: cropProfile.phosphorus, fullMark: 150 },
    { subject: 'K', A: data.inputSummary.potassium, B: cropProfile.potassium, fullMark: 150 },
    { subject: 'pH', A: data.inputSummary.ph * 10, B: cropProfile.ph * 10, fullMark: 150 },
    { subject: 'H2O', A: data.inputSummary.humidity, B: cropProfile.humidity, fullMark: 100 },
    { subject: 'Rain', A: data.inputSummary.rainfall / 2, B: cropProfile.rainfall / 2, fullMark: 150 },
  ];

  const comparativeData = countryStats ? [
    { name: 'Temp (°C)', local: data.inputSummary.temperature, regional: countryStats.avgTemp },
    { name: 'Rain (mm/10)', local: data.inputSummary.rainfall / 10, regional: countryStats.avgRain / 10 },
  ] : [];

  return (
    <div className="max-w-[1400px] mx-auto px-6 pb-20 pt-6">

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
        <div>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl lg:text-5xl font-display font-bold text-white mb-4 tracking-tight"
          >
            Yield <span className="text-transparent bg-clip-text bg-gradient-to-r from-agri-green to-blue-400">Intelligence</span>
          </motion.h2>

          <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-slate-300">
              <GlobeIcon className="w-4 h-4 text-agri-green" /> {data.inputSummary.country}
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-slate-300">
              <Sprout className="w-4 h-4 text-agri-green" /> {data.inputSummary.cropType}
            </div>
          </div>
        </div>

        <motion.button
          onClick={onReset}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl text-sm font-bold flex items-center gap-2 backdrop-blur-md transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </motion.button>
      </div>

      {/* Primary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">

        {/* Left: 3D Hologram */}
        <div className="lg:col-span-5 xl:col-span-4 h-full min-h-[500px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="h-full"
          >
            <CropHologram data={data} />
          </motion.div>
        </div>

        {/* Right: Metrics Grid */}
        <div className="lg:col-span-7 xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 content-start">

          <StatCard
            label="Confidence"
            value={`${data.confidenceScore}%`}
            icon={Scan}
            subtext="Predicted accuracy based on historical models."
            colorClass="blue-500"
            delay={0.1}
          />

          <StatCard
            label="Sustainability"
            value={`${data.sustainabilityScore}/100`}
            icon={GlobeIcon}
            subtext={data.sustainabilityScore > 75 ? "Optimal long-term viability." : "Intervention recommended."}
            colorClass={data.sustainabilityScore > 75 ? "agri-green" : "yellow-500"}
            delay={0.2}
          />

          <StatCard
            label="Market Trend"
            value={data.marketAnalysis.trend}
            icon={TrendingUp}
            trend={data.marketAnalysis.trend === 'Up' ? 'up' : 'down'}
            subtext={`Demand Est: ${data.marketAnalysis.demandLevel}`}
            colorClass={data.marketAnalysis.trend === 'Up' ? 'green-400' : 'orange-400'}
            delay={0.3}
          />

          <StatCard
            label="Market Price"
            value={data.marketAnalysis.estimatedPrice}
            icon={Database}
            subtext="Global Average / Ton"
            colorClass="purple-500"
            delay={0.4}
          />

          {/* Limiting Factors - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="md:col-span-2 glass-panel rounded-3xl p-6 flex items-start gap-4 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-24 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="p-3 bg-red-500/20 rounded-xl relative z-10">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div className="relative z-10">
              <h4 className="font-bold text-white text-lg mb-2">Critical Factors</h4>
              <div className="flex flex-wrap gap-2">
                {data.limitingFactors.length > 0 ? (
                  data.limitingFactors.map((factor, idx) => (
                    <span key={idx} className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-300 font-medium">
                      {factor}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-sm">No critical limitations detected for this cycle.</span>
                )}
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Global Context & Comparatives */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* 3D Rotating Earth Context */}
        <div className="lg:col-span-1 glass-panel rounded-3xl p-6 overflow-hidden relative group">
          <div className="flex justify-between items-start mb-6 relative z-10">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <GlobeIcon className="w-4 h-4 text-agri-green" /> Regional Analysis
            </h3>

            <div className="flex gap-2">
              <button
                onClick={() => setIsGlobeRotating(true)}
                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-white transition-colors"
              >
                <RotateCw className={`w-3 h-3 ${isGlobeRotating ? 'animate-spin' : ''}`} />
              </button>
              <div className="relative w-36">
                <select
                  value={selectedRegion || data.inputSummary.country}
                  onChange={(e) => {
                    setSelectedRegion(e.target.value);
                    setIsGlobeRotating(false);
                  }}
                  className="bg-black/40 border border-white/10 text-white text-xs font-bold rounded-lg py-1.5 pl-2 pr-6 w-full appearance-none focus:outline-none focus:border-agri-green cursor-pointer"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.name} value={c.name} className="bg-slate-900 text-white">{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-agri-green absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="h-[250px] w-full z-0">
            <Globe
              isRotating={isGlobeRotating}
              targetLat={countryStats?.lat}
              targetLng={countryStats?.lng}
              height={250}
              width={300}
              weather={{
                rain: Math.min(data.inputSummary.rainfall / 300, 1),
                clouds: Math.min(data.inputSummary.humidity / 100, 1),
                temp: data.inputSummary.temperature
              }}
            />
          </div>
        </div>

        {/* Climatic Anomaly Chart */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-8 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-grid-pattern opacity-10" />
          <div className="mb-8 relative z-10 flex justify-between items-end">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-orange-400" /> Climate Anomaly
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Real-time deviation from regional baseline.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-slate-500">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" /> Live Sensors
            </div>
          </div>

          <div className="flex-grow flex flex-col justify-center gap-8 relative z-10">
            {countryStats && (
              <>
                {/* Temp Gauge */}
                <AnomalyGauge
                  label="Temperature"
                  value={data.inputSummary.temperature + tempNoise}
                  baseline={countryStats.avgTemp}
                  unit="°C"
                  color="orange"
                  icon={Zap}
                  interval={updateInterval}
                />

                {/* Rainfall Gauge */}
                <AnomalyGauge
                  label="Precipitation"
                  value={data.inputSummary.rainfall + rainNoise}
                  baseline={countryStats.avgRain}
                  unit="mm"
                  color="blue"
                  icon={Droplets}
                  interval={updateInterval}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- Continuous Learning / Data Contribution --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8 p-6 glass-panel rounded-2xl border border-agri-green/20 bg-agri-green/5 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-agri-green" /> Model Training Loop
            </h3>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Contribute to the "Planetary Prediction" network. If you have ground truth data for this vector, submit it below to automatically retrain the global model.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-black/40 p-2 rounded-xl border border-white/5">
            <div className="flex flex-col">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Actual Yield (Tons/Ha)</label>
              <input
                type="number"
                value={userYield}
                onChange={(e) => setUserYield(e.target.value)}
                placeholder="Enter value..."
                className="bg-transparent text-white font-mono font-bold outline-none w-32 placeholder:text-slate-700"
              />
            </div>
            <button
              onClick={handleSaveData}
              disabled={saveStatus === 'saving' || saveStatus === 'saved' || !userYield}
              className={`px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-wide transition-all shadow-lg flex items-center gap-2 ${saveStatus === 'saved' ? 'bg-green-500 text-black' :
                saveStatus === 'error' ? 'bg-red-500 text-white' :
                  'bg-agri-green text-black hover:bg-white'
                }`}
            >
              {saveStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> :
                saveStatus === 'saved' ? <CheckCircle2 className="w-4 h-4" /> :
                  <Database className="w-4 h-4" />}

              {saveStatus === 'saving' ? 'Processing...' :
                saveStatus === 'saved' ? 'Model Retrained' :
                  'Verify & Retrain'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* --- Live Dataset Stream --- */}
      {/* --- Environmental Data Matrix (Live Stream) --- */}
      {trainingData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-agri-green animate-pulse" />
            <h3 className="text-xl font-bold text-white">Environmental Data Matrix</h3>
            <span className="text-xs text-slate-500 font-mono">({trainingData.length} records)</span>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 h-[400px] flex flex-col relative">
            {/* Header Background Blur */}
            <div className="absolute top-0 left-0 right-0 h-10 bg-black/40 backdrop-blur-md z-10 pointer-events-none" />

            <div className="overflow-y-auto h-full scroll-smooth">
              <table className="w-full text-left text-sm relative border-collapse">
                <thead className="text-slate-400 font-mono text-[10px] uppercase tracking-wider sticky top-0 z-20 bg-[#050505]/90 backdrop-blur-xl shadow-lg">
                  <tr>
                    <th className="p-4 font-bold border-b border-white/10">Year</th>
                    <th className="p-4 font-bold border-b border-white/10">Region</th>
                    <th className="p-4 font-bold border-b border-white/10">Crop</th>
                    <th className="p-4 font-bold text-right border-b border-white/10">Rain (mm)</th>
                    <th className="p-4 font-bold text-right border-b border-white/10">Temp (°C)</th>
                    <th className="p-4 font-bold text-right border-b border-white/10">Yield (t/ha)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {trainingData.map((row, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-agri-green/5 transition-colors group"
                    >
                      <td className="p-4 font-mono text-slate-300 border-r border-white/5 bg-white/[0.01]">{row.Year}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-medium">
                          <GlobeIcon className="w-3 h-3" /> {selectedRegion || row.Area}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-agri-green/10 text-agri-green border border-agri-green/20 text-xs font-medium">
                          <Sprout className="w-3 h-3" /> {row.Item}
                        </span>
                      </td>
                      <td className="p-4 text-right text-slate-300 font-mono">{(row?.average_rain + rainNoise)?.toFixed(1)}</td>
                      <td className="p-4 text-right text-slate-300 font-mono">{(row?.avg_temp + tempNoise)?.toFixed(1)}</td>
                      <td className="p-4 text-right">
                        <span className="px-3 py-1 bg-white/10 rounded-lg text-white font-bold font-mono tracking-tight border border-white/10 shadow-sm group-hover:bg-agri-green group-hover:text-black group-hover:border-agri-green transition-all duration-300">
                          {row['hg/ha_yield']?.toFixed(2)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Simulation Control Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="mb-8 glass-card rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Zap className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Simulation Speed</h3>
            <p className="text-xs text-slate-400">Control real-time projection</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-black/40 rounded-lg p-1 border border-white/5">
          <button onClick={() => setUpdateInterval(2000)} className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-xs font-bold transition-all ${updateInterval === 2000 ? 'bg-agri-green text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <FastForward className="w-3 h-3" /> Fast
          </button>
          <button onClick={() => setUpdateInterval(5000)} className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-xs font-bold transition-all ${updateInterval === 5000 ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Play className="w-3 h-3" /> Normal
          </button>
          <button onClick={() => setUpdateInterval(0)} className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-xs font-bold transition-all ${updateInterval === 0 ? 'bg-red-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Pause className="w-3 h-3" /> Pause
          </button>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-panel rounded-3xl p-8 relative overflow-hidden flex flex-col"
        >
          <div className="absolute top-0 right-0 p-32 bg-agri-green/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
            <Layers className="w-5 h-5 text-agri-green" /> Nutrient Profile
          </h3>
          <div className="h-[250px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={nutrientData}>
                <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 200]} tick={false} axisLine={false} />
                <Radar name="Actual Soil" dataKey="A" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.4} />
                <Radar name="Optimal Profile" dataKey="B" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.1} strokeDasharray="4 4" />
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }} itemStyle={{ fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Forecast Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="glass-panel rounded-3xl p-8 relative overflow-hidden flex flex-col"
        >
          <div className="absolute top-0 left-0 p-32 bg-purple-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" /> Yield Forecast
            </h3>
          </div>
          <div className="h-[250px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yieldData}>
                <defs>
                  <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c084fc" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="value" stroke="#c084fc" strokeWidth={3} fillOpacity={1} fill="url(#colorYield)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Line Chart - Market Pulse */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-panel rounded-3xl p-8 relative overflow-hidden"
        >
          <div className={`absolute top-0 left-0 p-32 ${marketChartType === 'line' ? 'bg-blue-500/5' : 'bg-green-500/5'} rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 transition-colors duration-500`} />

          <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className={`w-5 h-5 ${marketChartType === 'line' ? 'text-blue-400' : 'text-green-400'} transition-colors`} /> Market Projection
            </h3>

            <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
              <button
                onClick={() => setMarketChartType('line')}
                className={`p-1.5 rounded-md transition-all ${marketChartType === 'line' ? 'bg-blue-500/20 text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                title="Line Graph"
              >
                <Activity size={14} />
              </button>
              <button
                onClick={() => setMarketChartType('bar')}
                className={`p-1.5 rounded-md transition-all ${marketChartType === 'bar' ? 'bg-green-500/20 text-green-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                title="Bar Graph"
              >
                <BarChart3 size={14} />
              </button>
            </div>
          </div>

          <div className="h-[250px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              {marketChartType === 'line' ? (
                <LineChart data={marketData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    isAnimationActive={true}
                    animationDuration={updateInterval > 0 ? updateInterval : 1000}
                  />
                </LineChart>
              ) : (
                <BarChart data={marketData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }} />
                  <Bar
                    dataKey="value"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={updateInterval > 0 ? updateInterval : 1000}
                  >
                    {marketData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fillOpacity={0.6 + (index * 0.1)} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <AdvisorySection
        recommendations={data.recommendations}
        limitingFactors={data.limitingFactors}
        onExport={generateReport}
      />

    </div>
  );
}
