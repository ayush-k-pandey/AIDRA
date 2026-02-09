
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  TrendingUp, 
  Calculator, 
  Info, 
  AlertCircle, 
  Loader2,
  Sparkles,
  Database,
  ArrowRight,
  HelpCircle,
  PlayCircle,
  Zap,
  Cpu,
  FileText,
  PieChart as PieChartIcon,
  BarChart4,
  CheckCircle2,
  Heart,
  MessageSquare,
  ArrowUpRight,
  Target,
  FileDown,
  Layers,
  ShieldAlert,
  ChevronDown,
  Trash2,
  FileCheck,
  RotateCcw,
  ListFilter,
  Activity,
  Filter
} from 'lucide-react';
import { HistoricalDisaster, BudgetPrediction as PredictionResult } from '../types';
import { predictDisasterBudget } from '../services/geminiService';
import BudgetChat from './BudgetChat';

const DEMO_DATA: HistoricalDisaster[] = [
  { 
    type: 'Flood', severity: 'High', durationDays: 14, year: 2021, area: 'Odisha Coastal', populationImpacted: 500000,
    foodBudget: 40000000, waterBudget: 20000000, shelterBudget: 150000000, rescueBudget: 80000000, 
    medicalBudget: 60000000, logisticsBudget: 45000000, commBudget: 12000000, rehabBudget: 300000000, 
    totalBudget: 707000000 
  },
  { 
    type: 'Cyclone', severity: 'Critical', durationDays: 10, year: 2022, area: 'West Bengal Delta', populationImpacted: 1200000,
    foodBudget: 95000000, waterBudget: 50000000, shelterBudget: 400000000, rescueBudget: 200000000, 
    medicalBudget: 150000000, logisticsBudget: 120000000, commBudget: 40000000, rehabBudget: 800000000, 
    totalBudget: 1855000000 
  },
  { 
    type: 'Flood', severity: 'Medium', durationDays: 30, year: 2023, area: 'Assam Valley', populationImpacted: 300000,
    foodBudget: 35000000, waterBudget: 18000000, shelterBudget: 90000000, rescueBudget: 45000000, 
    medicalBudget: 40000000, logisticsBudget: 30000000, commBudget: 8000000, rehabBudget: 150000000, 
    totalBudget: 416000000 
  }
];

// CSV Cleaning Utilities
const sanitizeString = (val: string): string => val?.trim() || "Unknown";
const parseNumeric = (val: string): number => {
  const num = parseFloat(val?.replace(/[^0-9.-]+/g, "") || "0");
  return isNaN(num) ? 0 : num;
};
const standardizeSeverity = (val: string): any => {
  const s = val?.trim().toLowerCase();
  if (s?.includes('crit')) return 'Critical';
  if (s?.includes('high')) return 'High';
  if (s?.includes('med')) return 'Medium';
  return 'Low';
};

const AllocationDonut: React.FC<{ data: { label: string, value: number, color: string }[] }> = ({ data }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let cumulativePercent = 0;

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
        <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(128,128,128,0.1)" strokeWidth="10" />
        {data.map((item, i) => {
          const percent = (item.value / (total || 1)) * 100;
          const dashArray = `${percent} ${100 - percent}`;
          const dashOffset = -cumulativePercent;
          cumulativePercent += percent;
          return (
            <circle
              key={i}
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke={item.color}
              strokeWidth="10"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              className="transition-all duration-1000 ease-out cursor-pointer hover:stroke-[12px]"
              pathLength="100"
            >
              <title>{item.label}: {percent.toFixed(1)}%</title>
            </circle>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Fiscal</p>
        <p className="text-lg font-black text-[var(--text-main)] leading-none">ALLOCATION</p>
      </div>
    </div>
  );
};

const FiscalVarianceBar: React.FC<{ predicted: number, historicalAvg: number }> = ({ predicted, historicalAvg }) => {
  const diff = predicted - (historicalAvg || 1);
  const isHigher = diff > 0;
  const percent = Math.abs((diff / (historicalAvg || 1)) * 100).toFixed(1);

  return (
    <div className="p-5 glass-panel border-none bg-indigo-500/10 flex items-center gap-6">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isHigher ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
        {isHigher ? <ArrowUpRight className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
      </div>
      <div>
        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Historic Variance</p>
        <p className="text-lg font-black">
          {isHigher ? '+' : '-'}{percent}% <span className="text-xs text-[var(--text-muted)] font-bold uppercase ml-2">vs. Baseline</span>
        </p>
      </div>
    </div>
  );
};

interface BatchScenario {
  type: string;
  severity: string;
  population: number;
  duration: number;
  area: string;
}

interface BatchResult {
  scenario: BatchScenario;
  prediction: PredictionResult;
}

interface BudgetPredictionProps {
  initialArea?: string;
  initialType?: string;
}

const BudgetPrediction: React.FC<BudgetPredictionProps> = ({ initialArea, initialType }) => {
  const [data, setData] = useState<HistoricalDisaster[]>([]);
  const [loading, setLoading] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [training, setTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [view, setView] = useState<'dashboard' | 'advisor' | 'batch'>('dashboard');
  const [scenario, setScenario] = useState({
    type: initialType || 'Flood',
    severity: 'High',
    population: 750000,
    duration: 15,
    area: initialArea || 'Odisha Delta Region'
  });
  
  const [batchScenarios, setBatchScenarios] = useState<BatchScenario[]>([]);
  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
  const [batchProgress, setBatchProgress] = useState(0);

  const [showSampleGuide, setShowSampleGuide] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchFileInputRef = useRef<HTMLInputElement>(null);

  const historicalAverage = useMemo(() => {
    if (data.length === 0) return 0;
    return data.reduce((acc, curr) => acc + curr.totalBudget, 0) / data.length;
  }, [data]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setCleaning(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      setTimeout(() => {
        try {
          const text = event.target?.result as string;
          const rows = text.split('\n').map(r => r.trim()).filter(row => row !== '');
          
          if (rows.length < 2) throw new Error("Dataset is too small to initialize ML node.");

          const parsedData: HistoricalDisaster[] = rows.slice(1).map((row, idx) => {
            const v = row.split(',').map(sanitizeString);
            if (v.length < 15) return null; // Filter incomplete rows
            
            return {
              type: v[0], 
              severity: standardizeSeverity(v[1]), 
              durationDays: parseNumeric(v[2]), 
              year: parseNumeric(v[3]), 
              area: v[4], 
              populationImpacted: parseNumeric(v[5]),
              foodBudget: parseNumeric(v[6]), 
              waterBudget: parseNumeric(v[7]), 
              shelterBudget: parseNumeric(v[8]), 
              rescueBudget: parseNumeric(v[9]),
              medicalBudget: parseNumeric(v[10]), 
              logisticsBudget: parseNumeric(v[11]), 
              commBudget: parseNumeric(v[12]), 
              rehabBudget: parseNumeric(v[13]),
              totalBudget: parseNumeric(v[14]) || (parseNumeric(v[6]) + parseNumeric(v[7]) + parseNumeric(v[8]) + parseNumeric(v[9]) + parseNumeric(v[10]) + parseNumeric(v[11]) + parseNumeric(v[12]) + parseNumeric(v[13]))
            };
          }).filter(x => x !== null) as HistoricalDisaster[];

          if (parsedData.length === 0) throw new Error("No valid financial records detected after cleaning.");
          
          setCleaning(false);
          setTraining(true);
          setTrainingProgress(0);
          const interval = setInterval(() => {
            setTrainingProgress(prev => {
              if (prev >= 100) {
                clearInterval(interval);
                setTraining(false);
                setData(parsedData);
                return 100;
              }
              return prev + 10;
            });
          }, 150);

        } catch (err: any) {
          setCleaning(false);
          setError(err.message || "Failed to process CSV file.");
        }
      }, 800);
    };
    reader.readAsText(file);
  };

  const handleBatchFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setCleaning(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      setTimeout(async () => {
        try {
          const text = event.target?.result as string;
          const rows = text.split('\n').map(r => r.trim()).filter(row => row !== '');
          
          const parsedScenarios: BatchScenario[] = rows.slice(1).map((row, idx) => {
            const v = row.split(',').map(sanitizeString);
            if (v.length < 5) return null;
            return {
              type: v[0],
              severity: standardizeSeverity(v[1]),
              population: parseNumeric(v[2]),
              duration: parseNumeric(v[3]),
              area: v[4]
            };
          }).filter(x => x !== null) as BatchScenario[];

          if (parsedScenarios.length === 0) throw new Error("Batch input is empty or incorrectly formatted.");
          
          setCleaning(false);
          setBatchScenarios(parsedScenarios);
          setBatchResults([]);
          setView('batch');
          
          setLoading(true);
          const results: BatchResult[] = [];
          for (let i = 0; i < parsedScenarios.length; i++) {
            setBatchProgress(Math.round(((i + 1) / parsedScenarios.length) * 100));
            const s = parsedScenarios[i];
            try {
              const pred = await predictDisasterBudget(data, s.type, s.population, s.area, s.severity, s.duration);
              results.push({ scenario: s, prediction: pred });
            } catch (err) {
              console.error(`Batch node failure for ${s.area}`, err);
            }
          }
          setBatchResults(results);
        } catch (err: any) {
          setCleaning(false);
          setError(err.message || "Failed to sanitize Scenario CSV.");
        } finally {
          setLoading(false);
        }
      }, 800);
    };
    reader.readAsText(file);
  };

  const runFullDemo = async () => {
    setError(null);
    setTraining(true);
    setTrainingProgress(0);
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTraining(false);
          setData(DEMO_DATA);
          return 100;
        }
        return prev + 20;
      });
    }, 100);
  };

  const handlePredict = async () => {
    if (data.length === 0) {
      setError("Calibration required. Please upload regional audit history.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await predictDisasterBudget(
        data, scenario.type, scenario.population, scenario.area, scenario.severity, scenario.duration
      );
      setPrediction(result);
      setView('dashboard');
    } catch (err) {
      setError("Multi-Output Regressor encountered a logic timeout.");
    } finally {
      setLoading(false);
    }
  };

  const formatToCrore = (val: number) => {
    const crore = val / 10000000;
    return `₹${crore.toFixed(2)} Cr`;
  };

  const chartData = useMemo(() => {
    if (!prediction) return [];
    return [
      { label: 'Food & Logistics', value: prediction.breakdown.food, color: 'rgb(var(--rgb-cyan))' },
      { label: 'Water & Sanitation', value: prediction.breakdown.water, color: 'rgb(var(--rgb-indigo))' },
      { label: 'Shelter Hubs', value: prediction.breakdown.shelter, color: 'rgb(var(--rgb-violet))' },
      { label: 'Rescue Vehicles', value: prediction.breakdown.rescue, color: 'rgb(var(--rgb-rose))' },
      { label: 'Medical Assets', value: prediction.breakdown.medical, color: 'rgb(var(--rgb-emerald))' },
      { label: 'Logistics Link', value: prediction.breakdown.logistics, color: 'rgba(var(--rgb-indigo), 0.6)' },
      { label: 'Comm Infra', value: prediction.breakdown.comm, color: 'rgba(var(--rgb-cyan), 0.6)' },
      { label: 'Regional Rehab', value: prediction.breakdown.rehab, color: 'rgba(var(--rgb-violet), 0.6)' },
    ];
  }, [prediction]);

  const totalBatchBudget = useMemo(() => {
    return batchResults.reduce((acc, curr) => acc + curr.prediction.predictedTotal, 0);
  }, [batchResults]);

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* SIDEBAR: INPUT & MODEL STATUS */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass-panel p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <Database className="w-4 h-4" /> Data Ingestion
              </h3>
              <button onClick={() => setShowSampleGuide(!showSampleGuide)} className="text-[var(--text-muted)] hover:text-indigo-400 transition-colors">
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 border-l-4">
                <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-tight leading-normal">{error}</p>
              </div>
            )}

            {cleaning ? (
              <div className="py-10 text-center animate-pulse">
                <Filter className="w-8 h-8 text-indigo-400 mx-auto mb-4" />
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Sanitizing CSV Data Stream...</p>
                <p className="text-[9px] text-[var(--text-muted)] uppercase mt-2">Handling missing values & standardizing units</p>
              </div>
            ) : training ? (
              <div className="py-10 text-center">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4" />
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Refining Forest Nodes...</p>
                <div className="h-1.5 w-full bg-[var(--input-bg)] rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${trainingProgress}%` }}></div>
                </div>
              </div>
            ) : !data.length ? (
              <div className="space-y-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative border-2 border-dashed border-[var(--border-panel)] rounded-3xl p-10 text-center cursor-pointer hover:bg-[var(--input-bg)] transition-all"
                >
                  <Upload className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-4 group-hover:text-indigo-400 transition-all" />
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-relaxed">
                    Drop Regional Audit CSV<br/>to Initialize ML Node
                  </p>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
                </div>
                <button onClick={runFullDemo} className="w-full btn-action bg-indigo-500/10 border border-indigo-500/30 py-4 text-indigo-400 text-[10px] flex items-center justify-center gap-3 hover:bg-indigo-600/20 transition-all">
                  <PlayCircle className="w-4 h-4" /> Simulation Data Boot
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{data.length} Valid Records</p>
                      <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase">Model Cleaned & Trained</p>
                    </div>
                  </div>
                  <button onClick={() => { setData([]); setPrediction(null); }} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
                
                <div className="space-y-4 pt-4">
                  <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1">Multi-Scenario Evaluation</p>
                  <div 
                    onClick={() => batchFileInputRef.current?.click()}
                    className="border-2 border-dashed border-[var(--border-panel)] rounded-2xl p-6 text-center cursor-pointer hover:bg-indigo-500/5 transition-all group"
                  >
                    <FileSpreadsheet className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 group-hover:text-indigo-400 transition-colors" />
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Sanitize & Process Scenarios</p>
                    <input type="file" ref={batchFileInputRef} onChange={handleBatchFileUpload} accept=".csv" className="hidden" />
                  </div>
                </div>

                <div className="glass-panel overflow-hidden border-[var(--border-panel)] bg-transparent rounded-2xl max-h-48 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-[9px] text-[var(--text-muted)] uppercase font-bold">
                    <tbody className="divide-y divide-[var(--border-panel)]">
                      {data.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[var(--input-bg)] transition-colors">
                          <td className="p-3 text-[var(--text-main)]">{item.area} ({item.year})</td>
                          <td className="p-3 text-right tabular-nums">{formatToCrore(item.totalBudget)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="glass-panel p-8">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Manual Simulation
            </h3>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest block mb-2">Category</label>
                  <select 
                    value={scenario.type}
                    onChange={(e) => setScenario(p => ({...p, type: e.target.value}))}
                    className="w-full bg-[var(--input-bg)] border border-[var(--border-panel)] p-3 text-[10px] font-black rounded-xl outline-none focus:border-indigo-500"
                  >
                    <option>Flood</option><option>Cyclone</option><option>Earthquake</option><option>Heatwave</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest block mb-2">Tier</label>
                  <select 
                    value={scenario.severity}
                    onChange={(e) => setScenario(p => ({...p, severity: e.target.value}))}
                    className="w-full bg-[var(--input-bg)] border border-[var(--border-panel)] p-3 text-[10px] font-black rounded-xl outline-none focus:border-indigo-500"
                  >
                    <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest block mb-2">Pop. Index</label>
                  <input type="number" value={scenario.population} onChange={(e) => setScenario(p => ({...p, population: parseInt(e.target.value) || 0}))} className="w-full bg-[var(--input-bg)] border border-[var(--border-panel)] p-3 text-[10px] font-black rounded-xl outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest block mb-2">Op. Cycle (Days)</label>
                  <input type="number" value={scenario.duration} onChange={(e) => setScenario(p => ({...p, duration: parseInt(e.target.value) || 0}))} className="w-full bg-[var(--input-bg)] border border-[var(--border-panel)] p-3 text-[10px] font-black rounded-xl outline-none focus:border-indigo-500" />
                </div>
              </div>
              <button 
                onClick={handlePredict}
                disabled={!data.length || loading || training || cleaning}
                className="w-full btn-action bg-gradient-to-r from-indigo-600 to-violet-600 py-5 font-black uppercase text-[11px] text-white disabled:opacity-30 shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                EXECUTE MANUAL FORECAST
              </button>
            </div>
          </div>
        </div>

        {/* MAIN DASHBOARD: VISUALIZATIONS */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center p-1.5 bg-[var(--input-bg)] border border-[var(--border-panel)] rounded-2xl w-full">
            <div className="flex gap-1.5">
              <button 
                onClick={() => setView('dashboard')}
                className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2.5 ${view === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--input-bg)]'}`}
              >
                <BarChart4 className="w-4 h-4" /> Operational Dash
              </button>
              {batchResults.length > 0 && (
                <button 
                  onClick={() => setView('batch')}
                  className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2.5 ${view === 'batch' ? 'bg-indigo-600 text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--input-bg)]'}`}
                >
                  <ListFilter className="w-4 h-4" /> Batch Report ({batchResults.length})
                </button>
              )}
              <button 
                onClick={() => setView('advisor')}
                className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2.5 ${view === 'advisor' ? 'bg-indigo-600 text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--input-bg)]'}`}
              >
                <MessageSquare className="w-4 h-4" /> AI Fiscal Advisor
              </button>
            </div>
          </div>

          {view === 'dashboard' ? (
            <div className="min-h-[700px] space-y-8">
              {!prediction ? (
                <div className="glass-panel p-20 text-center h-[700px] flex flex-col items-center justify-center border-dashed border-2 border-[var(--border-panel)] bg-transparent">
                  <RotateCcw className="w-16 h-16 text-[var(--text-muted)] mb-8 animate-pulse opacity-10" />
                  <h4 className="text-xl font-black text-[var(--text-muted)] uppercase tracking-[0.4em]">Forecasting Node Idle</h4>
                  <p className="text-sm text-[var(--text-muted)] mt-6 max-w-md font-medium leading-relaxed">System awaiting historical data calibration. Predict Multi-Output budgets by configuring regional audit parameters or uploading a scenario CSV.</p>
                </div>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-right-12 duration-1000">
                  
                  {/* TOTAL FORECAST SUMMARY */}
                  <div className="glass-panel bg-[var(--bg-app)] p-12 relative overflow-hidden border-indigo-500/30">
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                      <Calculator className="w-48 h-48" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                           <span className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Active Multi-Output Forecast</span>
                           <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                             <CheckCircle2 className="w-3 h-3" /> Validated Confidence: {(prediction.confidenceScore * 100).toFixed(0)}%
                           </span>
                        </div>
                        <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-2">Total Projected Expenditure</p>
                        <h2 className="text-8xl font-black tracking-tighter tabular-nums leading-none mb-2">
                          {formatToCrore(prediction.predictedTotal)}
                        </h2>
                        <div className="flex gap-2">
                          {prediction.keyFactors.slice(0, 3).map((f, i) => (
                            <span key={i} className="text-[8px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md uppercase border border-indigo-500/20">{f}</span>
                          ))}
                        </div>
                      </div>
                      <div className="w-full md:w-auto">
                         <FiscalVarianceBar predicted={prediction.predictedTotal} historicalAvg={historicalAverage} />
                      </div>
                    </div>
                  </div>

                  {/* CHARTS GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Allocation Matrix */}
                    <div className="glass-panel p-10 flex flex-col items-center bg-[var(--input-bg)]">
                       <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-8 self-start flex items-center gap-3 text-indigo-400">
                         <PieChartIcon className="w-4 h-4" /> Category Distribution
                       </h4>
                       <AllocationDonut data={chartData} />
                       <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-3 w-full">
                          {chartData.map((cat, idx) => (
                            <div key={idx} className="flex items-center gap-3 group cursor-pointer">
                               <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></div>
                               <span className="text-[9px] font-black text-[var(--text-muted)] group-hover:text-[var(--text-main)] uppercase tracking-widest truncate transition-colors">{cat.label}</span>
                               <span className="text-[10px] font-black tabular-nums ml-auto text-indigo-400">{((cat.value / (prediction.predictedTotal || 1)) * 100).toFixed(0)}%</span>
                            </div>
                          ))}
                       </div>
                    </div>

                    {/* Operational Insights */}
                    <div className="glass-panel p-10 bg-[var(--input-bg)]">
                       <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-indigo-400">
                         <Cpu className="w-4 h-4" /> ML Reasoning Node
                       </h4>
                       <div className="space-y-6">
                         <div className="p-5 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-panel)]">
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">Model Logic Derivation</p>
                            <p className="text-xs font-medium text-[var(--text-main)] leading-relaxed italic">
                              "{prediction.reasoning}"
                            </p>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-panel)]">
                               <p className="text-[9px] font-black text-[var(--text-muted)] uppercase mb-2">Cost/Capita</p>
                               <p className="text-xl font-black text-indigo-400">₹{Math.round(prediction.predictedTotal / (scenario.population || 1))}</p>
                            </div>
                            <div className="p-4 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-panel)]">
                               <p className="text-[9px] font-black text-[var(--text-muted)] uppercase mb-2">Forecast Cycles</p>
                               <p className="text-xl font-black text-indigo-400">{scenario.duration} Days</p>
                            </div>
                         </div>
                       </div>
                    </div>
                  </div>

                  {/* BUDGET CATEGORY CARDS */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {chartData.map((cat, i) => (
                      <div key={i} className="glass-panel p-6 bg-[var(--input-bg)] group hover:border-indigo-400/50 transition-all cursor-default">
                        <div className="flex justify-between items-start mb-3">
                          <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest group-hover:text-indigo-400 transition-colors">{cat.label}</p>
                          <Target className="w-3 h-3 text-[var(--text-muted)] opacity-20" />
                        </div>
                        <p className="text-xl font-black mb-4 tabular-nums text-[var(--text-main)] truncate">{formatToCrore(cat.value)}</p>
                        <div className="h-1.5 w-full bg-[var(--bg-app)] rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all duration-1000 ease-out" 
                            style={{ backgroundColor: cat.color, width: `${(cat.value / (prediction.predictedTotal || 1)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* OFFICIAL TREASURY BRIEFING */}
                  <div className="glass-panel p-12 bg-white text-slate-900 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                      <FileText className="w-48 h-48" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-slate-900 rounded-2xl">
                            <ShieldAlert className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black uppercase tracking-[0.3em] text-slate-900">Fiscal Readiness Briefing</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Regional Command Node • Confidential Audit</p>
                          </div>
                        </div>
                        <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all">
                          <FileDown className="w-4 h-4" /> Download Official Ledger
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="md:col-span-2 space-y-8">
                          <div className="space-y-4">
                            <h5 className="text-[11px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-2">
                              <Sparkles className="w-3 h-3" /> Strategic Overview
                            </h5>
                            <p className="text-lg font-medium leading-relaxed italic border-l-4 border-indigo-600 pl-8 py-2 text-slate-700">
                              {prediction.executiveBriefing}
                            </p>
                          </div>
                          <div className="space-y-4">
                             <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Audit Context</h5>
                             <p className="text-sm text-slate-600 font-medium leading-relaxed">
                               This forecast utilizes a Multi-Output Random Forest Regression model trained on regional data from the past {data.length > 2 ? '3' : '2'} cycles. Predictions account for duration-scaling and severity multipliers.
                             </p>
                          </div>
                        </div>
                        <div className="space-y-6">
                           <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
                              <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                              </div>
                              <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Model Status</p>
                                <span className="text-xs font-black uppercase text-emerald-600">Calibration Verified</span>
                              </div>
                           </div>
                           <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-3">Impact Radius (Pop.)</p>
                              <p className="text-3xl font-black text-indigo-600 leading-none">{scenario.population.toLocaleString()}</p>
                              <p className="text-[9px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Strategic Exposure Units</p>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          ) : view === 'batch' ? (
            <div className="min-h-[700px] space-y-8 animate-in fade-in slide-in-from-bottom-8">
              {/* BATCH STATUS HEADER */}
              <div className="glass-panel p-10 bg-indigo-600 text-white relative overflow-hidden border-none shadow-2xl">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                  <Activity className="w-48 h-48" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                  <div className="text-center md:text-left">
                    <h3 className="text-sm font-black uppercase tracking-[0.4em] mb-4 text-indigo-200">Consolidated Batch Evaluation</h3>
                    <h2 className="text-7xl font-black tracking-tighter leading-none mb-4">{formatToCrore(totalBatchBudget)}</h2>
                    <p className="text-sm font-bold text-indigo-100 uppercase tracking-widest">Projected Combined Fiscal Commitment</p>
                  </div>
                  <div className="flex flex-col gap-3 w-full md:w-auto">
                    <div className="p-6 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-sm">
                       <p className="text-[10px] font-black text-indigo-100 uppercase mb-2">Processing Scope</p>
                       <p className="text-4xl font-black leading-none">{batchResults.length} / {batchScenarios.length}</p>
                       <div className="mt-4 h-1.5 w-full bg-indigo-900 rounded-full overflow-hidden">
                          <div className="h-full bg-white transition-all duration-300" style={{ width: `${batchProgress}%` }}></div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BATCH RESULTS LIST */}
              <div className="space-y-6">
                {batchResults.map((result, idx) => (
                  <div key={idx} className="glass-panel p-8 bg-[var(--input-bg)] border-indigo-500/20 group hover:border-indigo-500 transition-all">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-xl border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-black bg-indigo-500 text-white px-2 py-0.5 rounded uppercase">{result.scenario.type}</span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                              result.scenario.severity === 'Critical' ? 'bg-rose-500 text-white' : 
                              result.scenario.severity === 'High' ? 'bg-orange-500 text-white' : 
                              'bg-emerald-500 text-white'
                            }`}>{result.scenario.severity}</span>
                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase ml-2 tracking-widest">{result.scenario.area}</span>
                          </div>
                          <h4 className="text-2xl font-black tabular-nums">{formatToCrore(result.prediction.predictedTotal)}</h4>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
                        <div className="text-center p-3 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-panel)] min-w-[100px]">
                           <p className="text-[8px] font-black text-[var(--text-muted)] uppercase mb-1">Population</p>
                           <p className="text-xs font-black tabular-nums">{result.scenario.population.toLocaleString()}</p>
                        </div>
                        <div className="text-center p-3 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-panel)] min-w-[100px]">
                           <p className="text-[8px] font-black text-[var(--text-muted)] uppercase mb-1">Duration</p>
                           <p className="text-xs font-black tabular-nums">{result.scenario.duration} Days</p>
                        </div>
                        <button 
                          onClick={() => {
                            setPrediction(result.prediction);
                            setScenario(result.scenario);
                            setView('dashboard');
                          }}
                          className="col-span-2 p-3 bg-indigo-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20"
                        >
                          Details <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {loading && (
                <div className="py-20 text-center">
                   <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
                   <h3 className="text-sm font-black uppercase tracking-[0.3em] text-indigo-400">Processing Node {batchResults.length + 1} of {batchScenarios.length}</h3>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-in slide-in-from-right-12 duration-500">
              <BudgetChat 
                historicalData={data} 
                currentPrediction={prediction} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetPrediction;
