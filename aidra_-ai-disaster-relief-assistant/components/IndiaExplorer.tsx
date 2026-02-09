
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Globe, 
  Cloud, 
  Hospital, 
  Shield, 
  Landmark, 
  AlertCircle, 
  Loader2, 
  TrendingUp,
  Map as MapIcon,
  Navigation,
  Database,
  ArrowRight,
  History,
  Calculator,
  Zap
} from 'lucide-react';
import { getIndiaLocationDetails, IndiaLocationData } from '../services/geminiService';

interface IndiaExplorerProps {
  onDeploy?: (location: string) => void;
  onFindServices?: (location: string, type: string) => void;
  onAuditBudget?: (area: string, type: string) => void;
}

const IndiaExplorer: React.FC<IndiaExplorerProps> = ({ onDeploy, onFindServices, onAuditBudget }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<IndiaLocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('aidra_explorer_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const addToHistory = (name: string) => {
    const newHistory = [name, ...history.filter(h => h !== name)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('aidra_explorer_history', JSON.stringify(newHistory));
  };

  const SUGGESTIONS = ["Mumbai", "Bhubaneswar", "Joshimath", "Guwahati", "Chennai"];

  const handleSearch = async (e: React.FormEvent | string) => {
    const searchTerm = typeof e === 'string' ? e : query;
    if (typeof e !== 'string') e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await getIndiaLocationDetails(searchTerm);
      setData(result);
      if (typeof e === 'string') setQuery(e);
      addToHistory(result.name);
    } catch (err) {
      setError("Location query failed. Use specific Indian administrative names.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Search Console */}
      <div className="glass-panel p-10 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
        <div className="flex items-center justify-center gap-3 mb-4">
          <Database className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em]">Satellite Intelligence Node</h2>
        </div>
        <p className="text-[var(--text-muted)] text-sm mb-8 font-medium">Retrieving high-fidelity geospatial data for Indian administrative sectors</p>
        
        <form onSubmit={handleSearch} className="max-w-3xl mx-auto flex gap-3 mb-8">
          <div className="flex-1 relative group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Query city, district or taluka..."
              className="w-full pl-12 pr-6 py-4 bg-[var(--input-bg)] border border-[var(--border-panel)] rounded-2xl text-sm focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-600 text-[var(--text-main)]"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-action bg-indigo-600 px-10 py-4 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-600/20"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "EXECUTE"}
          </button>
        </form>

        <div className="flex flex-wrap justify-center gap-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSearch(s)}
              className="px-4 py-2 bg-[var(--input-bg)] border border-[var(--border-panel)] rounded-xl text-[10px] font-black text-[var(--text-muted)] hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all uppercase tracking-widest"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-32 text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
            <Zap className="absolute inset-0 m-auto w-8 h-8 text-indigo-400 animate-pulse" />
          </div>
          <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em] animate-pulse">Syncing with Regional Data Mesh...</p>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          
          <div className="lg:col-span-8 space-y-8">
            <div className="glass-panel p-10 relative overflow-hidden group">
              <div className="absolute -right-20 -top-20 opacity-5 group-hover:opacity-10 transition-opacity">
                <Globe className="w-80 h-80" />
              </div>
              
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-400 font-black uppercase text-[10px] mb-3 tracking-[0.3em]">
                      <MapPin className="w-3.5 h-3.5" /> Identity Locked
                    </div>
                    <h3 className="text-6xl font-black tracking-tighter leading-tight">{data.name}</h3>
                    <p className="text-lg font-bold text-[var(--text-muted)] mt-2 uppercase tracking-wide">{data.district}, {data.state}</p>
                  </div>
                  <div className="flex flex-col gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => onDeploy?.(data.name)}
                      className="btn-action bg-rose-600 px-8 py-4 text-xs text-white flex items-center justify-center gap-2 hover:bg-rose-500 shadow-xl shadow-rose-600/20"
                    >
                      <Zap className="w-4 h-4" /> DEPLOY SURVEILLANCE
                    </button>
                    <button 
                      onClick={() => onAuditBudget?.(data.name, "Flood")}
                      className="btn-action bg-[var(--input-bg)] px-8 py-4 text-xs text-[var(--text-main)] border border-[var(--border-panel)] hover:bg-[var(--input-bg)] transition-all flex items-center justify-center gap-2"
                    >
                      <Calculator className="w-4 h-4" /> AUDIT BUDGET.AI
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-[var(--border-panel)]">
                  {[
                    { label: 'PIN', val: data.pinCode || '---' },
                    { label: 'POPULATION', val: data.population || '---' },
                    { label: 'LANGUAGE', val: data.languages?.[0] || '---' },
                    { label: 'TIMEZONE', val: 'IST (UTC+5:30)' }
                  ].map((stat, i) => (
                    <div key={i}>
                      <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-lg font-black">{stat.val}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex items-start gap-4 bg-indigo-500/5 p-6 rounded-3xl border border-indigo-500/20">
                  <Cloud className="w-6 h-6 text-indigo-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-2">Meteorological Profile</h4>
                    <p className="text-[var(--text-muted)] text-sm leading-relaxed font-medium">{data.weatherOverview}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-panel p-8">
                <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-orange-500" /> Strategic Landmarks
                </h4>
                <div className="space-y-3">
                  {data.famousPlaces.map((place, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-[var(--input-bg)] rounded-2xl border border-[var(--border-panel)] hover:border-indigo-500/30 transition-all group cursor-pointer">
                       <div className="flex items-center gap-4">
                         <span className="w-6 h-6 bg-indigo-500/20 text-indigo-400 flex items-center justify-center rounded-lg text-[10px] font-black">{i+1}</span>
                         <span className="text-sm font-bold text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors">{place}</span>
                       </div>
                       <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition-all" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-8">
                <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Hospital className="w-4 h-4 text-emerald-500" /> Health Grid
                </h4>
                <div className="space-y-4">
                  {data.nearbyHospitals.map((h, i) => (
                    <div key={i} className="flex justify-between items-center group">
                      <span className="text-sm font-bold text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors">{h}</span>
                      <button 
                        onClick={() => onFindServices?.(data.name, 'Hospital')}
                        className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Navigation className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => onFindServices?.(data.name, 'Hospital')}
                    className="w-full mt-4 py-4 bg-[var(--input-bg)] rounded-2xl text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] border border-[var(--border-panel)] hover:bg-[var(--input-bg)] transition-all"
                  >
                    Full Grid Audit
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="glass-panel bg-indigo-600 p-8 text-white relative overflow-hidden group border-none shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                <Shield className="w-40 h-40" />
              </div>
              <div className="relative z-10">
                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] mb-8 text-indigo-200">Operations Center</h4>
                <div className="space-y-6">
                  <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                     <p className="text-[10px] font-black text-indigo-200 uppercase mb-2">Administrative HQ</p>
                     <p className="text-lg font-black">{data.state} Bureau</p>
                  </div>
                  <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                     <p className="text-[10px] font-black text-indigo-200 uppercase mb-2">Tactical Command</p>
                     <p className="text-lg font-black truncate">{data.nearbyPoliceStations?.[0] || 'Unit 01'}</p>
                  </div>
                </div>
                <div className="mt-10 pt-6 border-t border-white/10">
                  <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span> Live Link: Active
                  </p>
                  <p className="text-xs font-medium text-indigo-100">Regional sensors reporting nominal telemetry. All clear.</p>
                </div>
              </div>
            </div>

            <div className="glass-panel p-8">
               <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-6 flex items-center gap-2">
                 <TrendingUp className="w-4 h-4 text-indigo-400" /> Hazard Metrics
               </h4>
               <div className="space-y-6">
                  {[
                    { label: 'Seismic Risk', val: 'Low', percent: 15, color: 'bg-indigo-500' },
                    { label: 'Hydro Risk', val: 'Moderate', percent: 45, color: 'bg-orange-500' }
                  ].map((risk, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-[11px] font-black uppercase">
                        <span className="text-[var(--text-muted)]">{risk.label}</span>
                        <span className="">{risk.val}</span>
                      </div>
                      <div className="h-2 w-full bg-[var(--input-bg)] rounded-full overflow-hidden">
                        <div className={`h-full ${risk.color} transition-all duration-1000`} style={{ width: `${risk.percent}%` }}></div>
                      </div>
                    </div>
                  ))}
               </div>
               <button 
                 onClick={() => onAuditBudget?.(data.name, "Flood")}
                 className="w-full mt-10 py-4 bg-[var(--input-bg)] rounded-2xl text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border border-[var(--border-panel)] hover:text-indigo-400 transition-all flex items-center justify-center gap-2"
               >
                 View Risk Matrix <ArrowRight className="w-3 h-3" />
               </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-40 text-center glass-panel border-dashed border-2 border-[var(--border-panel)] bg-transparent flex flex-col items-center justify-center">
          <Globe className="w-20 h-20 mb-6 text-[var(--text-muted)] animate-pulse opacity-20" />
          <h4 className="text-lg font-black text-[var(--text-muted)] uppercase tracking-[0.4em]">Initialize Node Scan</h4>
          <p className="text-xs text-[var(--text-muted)] mt-4 font-bold uppercase tracking-widest">Awaiting spatial coordinate input...</p>
        </div>
      )}
    </div>
  );
};

export default IndiaExplorer;
