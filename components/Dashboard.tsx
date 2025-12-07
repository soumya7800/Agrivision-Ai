import React, { useState, useEffect } from 'react';
import { PredictionResult, Recommendation } from '../types';
import { COUNTRIES } from '../constants';
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
import { TrendingUp, AlertTriangle, CheckCircle, RotateCcw, Droplets, Sprout, Activity, Layers, Database, Loader2, ArrowUpRight, ArrowDownRight, Globe as GlobeIcon, BarChart3, Play, Pause, FastForward, ClipboardCheck, FileText, AlertOctagon, XCircle, CheckCircle2, Beaker, ChevronDown, RotateCw, Scan, Zap } from 'lucide-react';
import { Globe } from './Globe';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


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
  <div className="relative h-full min-h-[500px] glass-panel rounded-3xl overflow-hidden flex flex-col items-center justify-center perspective-1000">
    <div className="absolute inset-0 bg-gradient-to-t from-agri-dark via-transparent to-transparent opacity-80" />
    <div className="w-32 h-32 rounded-full bg-gradient-to-t from-white/5 to-transparent animate-pulse-glow flex items-center justify-center backdrop-blur-sm border border-white/5">
      <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="glass-card p-6 rounded-3xl flex flex-col justify-between h-40">
    <div className="flex justify-between items-start">
      <SkeletonPulse className="h-4 w-24" />
      <div className="h-8 w-8 rounded-full bg-white/5 animate-pulse" />
    </div>
    <div className="space-y-2">
      <SkeletonPulse className="h-8 w-32" />
      <SkeletonPulse className="h-2 w-full rounded-full" />
    </div>
  </div>
);

// --- Visual Components ---

const CropHologram = ({ data }: { data: PredictionResult }) => {
  const isHealthy = data.sustainabilityScore > 70;
  const themeColor = isHealthy ? 'text-agri-green' : 'text-yellow-400';
  const glowShadow = isHealthy ? '0 0 50px rgba(16,185,129,0.2)' : '0 0 50px rgba(250,204,21,0.2)';

  return (
    <div className="relative h-full min-h-[500px] glass-panel rounded-3xl overflow-hidden flex flex-col items-center justify-center group perspective-1000">

      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gradient-to-br from-agri-green/10 to-blue-500/10 rounded-full blur-[100px] opacity-60" />

      {/* Grid Floor */}
      <div
        className="absolute bottom-[-50px] w-[200%] h-[200%] bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"
        style={{ transform: 'rotateX(70deg) translateY(0px)' }}
      />

      <div className="relative w-full h-full flex items-center justify-center perspective-1000 z-10">
        <motion.div
          className="relative w-64 h-64 preserve-3d flex items-center justify-center"
          animate={{ rotateY: 360 }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        >
          {/* Floating Rings */}
          <div className={`absolute inset-[-40px] border border-dashed border-white/10 rounded-full opacity-40`} style={{ transform: 'rotateX(75deg)' }} />
          <div className={`absolute inset-[-20px] border border-white/5 rounded-full`} style={{ transform: 'rotateX(75deg)' }} />

          {/* Core */}
          <motion.div
            className="preserve-3d flex items-center justify-center"
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            {[0, 120, 240].map((deg, i) => (
              <div
                key={deg}
                className={`absolute flex items-center justify-center ${themeColor} drop-shadow-[0_0_10px_rgba(0,0,0,1)]`}
                style={{ transform: `rotateY(${deg}deg) translateZ(40px)` }}
              >
                <Sprout size={120} strokeWidth={1} className="opacity-90" style={{ filter: `drop-shadow(${glowShadow})` }} />
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute top-6 left-6 flex flex-col gap-2 z-20">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-agri-green/20 text-[10px] text-agri-green font-mono tracking-widest backdrop-blur-md">
          <Activity className="w-3 h-3" /> LIVE SIMULATION
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`flex w-2 h-2 rounded-full ${isHealthy ? 'bg-agri-green' : 'bg-yellow-400'} animate-pulse shadow-[0_0_8px_currentColor]`} />
              <p className="text-xs text-slate-400 font-bold tracking-[0.2em] uppercase">Target Crop</p>
            </div>
            <h3 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-none">{data.inputSummary.cropType}</h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-1 font-medium tracking-wide">EST. YIELD</p>
            <p className={`text-3xl font-bold font-mono ${themeColor} drop-shadow-lg`}>{data.yieldPrediction.toFixed(1)} <span className="text-sm text-slate-500">t/ha</span></p>
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
    transition={{ delay }}
    className="h-full"
  >
    <div className={`glass-card p-6 h-full flex flex-col justify-between rounded-3xl relative overflow-hidden group border-l-4 border-l-${colorClass}/50`}>
      <div className={`absolute -right-10 -top-10 w-32 h-32 bg-${colorClass}/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500`} />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <p className="text-slate-400 text-xs font-bold tracking-wider uppercase mb-1">{label}</p>
          <h3 className="text-3xl font-display font-bold text-white tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-${colorClass}/20 transition-colors`}>
          <Icon className={`w-5 h-5 text-${colorClass}`} />
        </div>
      </div>

      {subtext && (
        <div className="flex items-center gap-2 mt-auto relative z-10">
          {trend === 'up' && <ArrowUpRight className="w-3 h-3 text-agri-green" />}
          {trend === 'down' && <ArrowDownRight className="w-3 h-3 text-red-400" />}
          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[90%]">{subtext}</p>
        </div>
      )}
    </div>
  </motion.div>
);

const AnomalyGauge = ({ label, value, baseline, unit, color, icon: Icon, interval }: any) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [variance, setVariance] = useState(0);

  useEffect(() => {
    // Animate the value slightly to simulate sensor noise
    const update = () => {
      const noise = (Math.random() - 0.5) * (value * 0.05);
      setVariance(noise);
    };

    const timer = setInterval(update, Math.max(1000, interval || 2000));
    return () => clearInterval(timer);
  }, [value, interval]);

  const currentVal = value + variance;
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

  const generateReport = () => {
    if (!data) return;
    const doc = new jsPDF();

    // Header
    doc.setFillColor(2, 6, 23); // bg-slate-950
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(16, 185, 129); // text-agri-green
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("AgriVision AI", 14, 20);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Yield Optimization Report", 14, 30);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 140, 30);

    let yPos = 50;

    // 1. Executive Summary
    doc.setTextColor(2, 6, 23);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", 14, yPos);
    yPos += 10;

    const summaryData = [
      ['Target Region', data.inputSummary.country],
      ['Crop Selection', data.inputSummary.cropType || 'N/A'],
      ['Predicted Yield', `${data.yieldPrediction.toFixed(2)} tons/ha`],
      ['Sustainability Score', `${data.sustainabilityScore}/100`],
      ['Confidence Level', `${data.confidenceScore}%`]
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 10 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // 2. Input Parameters
    doc.text("Environmental Input Vector", 14, yPos);
    yPos += 10;

    const inputData = [
      ['Nitrogen (N)', `${data.inputSummary.nitrogen} mg/kg`],
      ['Phosphorus (P)', `${data.inputSummary.phosphorus} mg/kg`],
      ['Potassium (K)', `${data.inputSummary.potassium} mg/kg`],
      ['Temperature', `${data.inputSummary.temperature}°C`],
      ['Humidity', `${data.inputSummary.humidity}%`],
      ['pH Level', `${data.inputSummary.ph}`],
      ['Rainfall', `${data.inputSummary.rainfall} mm`]
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Parameter', 'Value']],
      body: inputData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }, // Blue
      styles: { fontSize: 10 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // 3. Market Analysis
    doc.text("Market Analysis", 14, yPos);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      head: [['Indicator', 'Status']],
      body: [
        ['Price Trend', data.marketAnalysis.trend],
        ['Estimated Price', data.marketAnalysis.estimatedPrice],
        ['Demand Level', data.marketAnalysis.demandLevel]
      ],
      theme: 'grid',
      headStyles: { fillColor: [168, 85, 247] }, // Purple
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Check page break
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    // 4. Strategic Recommendations
    doc.text("S.M.A.R.T Recommendations", 14, yPos);
    yPos += 10;

    const recData = data.recommendations.map(r => [r.type.toUpperCase(), r.impact, r.title, r.description]);

    autoTable(doc, {
      startY: yPos,
      head: [['Type', 'Impact', 'Action', 'Details']],
      body: recData,
      theme: 'grid',
      headStyles: { fillColor: [2, 6, 23] },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { textColor: [239, 68, 68] } // Red text for impact placeholder, logic could be refined
      }
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text('Page ' + i + ' of ' + pageCount, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: 'right' });
      doc.text('AgriVision AI - Confidential', 14, doc.internal.pageSize.height - 10);
    }

    doc.save(`AgriVision_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
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

      const newMarketData = Array.from({ length: 11 }, (_, i) => {
        const volatility = Math.random() * 0.2 - 0.1;
        // Logic to make past data (before 2025) slightly more stable/linear if desired, but random is fine for now
        const yearMultiplier = Math.pow(trendMultiplier, i);
        return {
          year: startYear + i,
          value: Math.floor(basePrice * yearMultiplier * (1 + volatility))
        };
      });

      const baseYield = data.yieldPrediction;
      const newYieldData = Array.from({ length: 11 }, (_, i) => {
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

  const nutrientData = [
    { subject: 'N', A: data.inputSummary.nitrogen, fullMark: 140 },
    { subject: 'P', A: data.inputSummary.phosphorus, fullMark: 145 },
    { subject: 'K', A: data.inputSummary.potassium, fullMark: 205 },
    { subject: 'pH', A: (data.inputSummary.ph / 14) * 100, fullMark: 100 },
    { subject: 'H2O', A: data.inputSummary.humidity, fullMark: 100 },
    { subject: 'Rain', A: (data.inputSummary.rainfall / 300) * 100, fullMark: 100 },
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
                  value={data.inputSummary.temperature}
                  baseline={countryStats.avgTemp}
                  unit="°C"
                  color="orange"
                  icon={Zap}
                  interval={updateInterval}
                />

                {/* Rainfall Gauge */}
                <AnomalyGauge
                  label="Precipitation"
                  value={data.inputSummary.rainfall}
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
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar name="Soil Stats" dataKey="A" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.4} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }} />
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
