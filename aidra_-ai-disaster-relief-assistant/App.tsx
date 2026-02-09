
import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Map as MapIcon, 
  Heart, 
  PhoneCall, 
  MoreHorizontal, 
  Languages,
  AlertTriangle,
  Menu,
  X,
  Camera,
  Globe,
  TrendingUp,
  Activity,
  Zap,
  LayoutDashboard,
  Coins,
  Sun,
  Moon
} from 'lucide-react';
import MapSection from './components/MapSection';
import NewsFeed from './components/NewsFeed';
import EmergencyServices from './components/EmergencyServices';
import VolunteerDonation from './components/VolunteerDonation';
import PlaceSearch from './components/PlaceSearch';
import IndiaExplorer from './components/IndiaExplorer';
import AdminDashboard from './components/AdminDashboard';
import BudgetPrediction from './components/BudgetPrediction';
import { LANGUAGES, EMERGENCY_CONTACTS } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'explorer' | 'services' | 'support' | 'admin' | 'budget'>('map');
  const [showSOS, setShowSOS] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  const [sharedLocation, setSharedLocation] = useState<string | null>(null);
  const [sharedServiceConfig, setSharedServiceConfig] = useState<{location: string, type: string} | null>(null);
  const [sharedBudgetContext, setSharedBudgetContext] = useState<{area: string, type: string} | null>(null);

  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  useEffect(() => {
    let timer: any;
    if (showSOS && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [showSOS, countdown]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSOS = () => {
    setShowSOS(true);
    setCountdown(5);
  };

  const handleDeployTacticalMap = (location: string) => {
    setSharedLocation(location);
    setActiveTab('map');
  };

  const handleFindServices = (location: string, type: string) => {
    setSharedServiceConfig({ location, type });
    setActiveTab('services');
  };

  const handleAuditBudget = (area: string, type: string) => {
    setSharedBudgetContext({ area, type });
    setActiveTab('budget');
  };

  const navItems = [
    { id: 'map', label: 'Surveillance', icon: Zap },
    { id: 'explorer', label: 'Explorer', icon: Globe },
    { id: 'services', label: 'Facilities', icon: Activity },
    { id: 'budget', label: 'Budget AI', icon: Coins },
    { id: 'support', label: 'Community', icon: Heart },
    { id: 'admin', label: 'Console', icon: LayoutDashboard }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* High-Tech Header */}
      <nav className="sticky top-0 z-[100] bg-[var(--bg-header)] backdrop-blur-xl border-b border-[var(--border-panel)]">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-6">
              <div className="p-2 bg-indigo-600 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter uppercase">AIDRA<span className="text-indigo-500">.OS</span></span>
                <span className="text-[9px] uppercase font-black text-indigo-400/60 tracking-[0.2em]">Operational Command</span>
              </div>
              
              <div className="hidden lg:flex ml-12 gap-1 bg-[var(--input-bg)] p-1 rounded-2xl border border-[var(--border-panel)]">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      activeTab === item.id 
                      ? 'bg-indigo-600 text-white shadow-lg' 
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--input-bg)]'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-3 bg-[var(--input-bg)] border border-[var(--border-panel)] rounded-xl hover:text-indigo-500 transition-all text-[var(--text-muted)]"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[var(--input-bg)] rounded-xl border border-[var(--border-panel)]">
                <Languages className="w-3.5 h-3.5 text-indigo-400" />
                <select 
                  className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {LANGUAGES.map(l => <option key={l.code} value={l.code} className="bg-slate-900">{l.name}</option>)}
                </select>
              </div>
              <button 
                onClick={handleSOS}
                className="btn-action btn-sos px-8 py-3.5 text-xs text-white"
              >
                SOS SIGNAL
              </button>
              <button className="lg:hidden text-[var(--text-main)]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* SOS Modal */}
      {showSOS && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/60">
          <div className="glass-panel p-12 max-w-sm w-full text-center border-rose-500/50">
            <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-rose-500 animate-pulse" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">SIGNAL ACTIVE</h2>
            <div className="text-6xl font-black text-rose-500 mb-6 tabular-nums">{countdown}</div>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">Broadcast sequence initiated. Geolocation packets streaming to emergency mesh nodes.</p>
            <button 
              onClick={() => setShowSOS(false)}
              className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all"
            >
              Abort Signal
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full p-8 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-9 space-y-10">
            <div>
              <div className="section-header">
                <Activity className="w-3.5 h-3.5" /> 
                Live Feed Intelligence
              </div>
              <h1 className="text-4xl font-black tracking-tighter">
                {activeTab === 'map' && "Surveillance Network"}
                {activeTab === 'explorer' && "Regional Intelligence"}
                {activeTab === 'services' && "Infrastructure Status"}
                {activeTab === 'budget' && "Financial Forecasting AI"}
                {activeTab === 'support' && "Community Resilience"}
                {activeTab === 'admin' && "Operations Console"}
              </h1>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              {activeTab === 'map' && (
                <div className="space-y-8">
                  <div className="glass-panel p-2">
                    <PlaceSearch />
                  </div>
                  <div className="glass-panel overflow-hidden">
                    <MapSection initialQuery={sharedLocation || undefined} />
                  </div>
                </div>
              )}
              {activeTab === 'explorer' && (
                <IndiaExplorer 
                  onDeploy={handleDeployTacticalMap} 
                  onFindServices={handleFindServices}
                  onAuditBudget={handleAuditBudget}
                />
              )}
              {activeTab === 'services' && (
                <EmergencyServices 
                  initialLocation={sharedServiceConfig?.location} 
                  initialType={sharedServiceConfig?.type}
                />
              )}
              {activeTab === 'budget' && (
                <BudgetPrediction 
                  initialArea={sharedBudgetContext?.area} 
                  initialType={sharedBudgetContext?.type}
                />
              )}
              {activeTab === 'support' && <VolunteerDonation />}
              {activeTab === 'admin' && <AdminDashboard />}
            </div>
          </div>

          <aside className="lg:col-span-3 space-y-8">
            <div className="glass-panel overflow-hidden border-indigo-500/20">
              <div className="bg-indigo-600/10 px-6 py-4 border-b border-indigo-500/20">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Global Comms</span>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <NewsFeed />
            </div>
            
            <div className="glass-panel p-6">
              <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4">Direct Lines</h3>
              <div className="space-y-4">
                {EMERGENCY_CONTACTS.map((contact, i) => (
                  <div key={i} className="flex justify-between items-center group">
                    <span className="text-xs font-bold text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors">{contact.label}</span>
                    <a href={`tel:${contact.number}`} className="text-sm font-black text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/5 px-3 py-1 rounded-lg">
                      {contact.number}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-8 text-center bg-gradient-to-br from-indigo-600/10 to-transparent">
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Shelter Load</h3>
              <div className="relative pt-1">
                <div className="overflow-hidden h-3 text-xs flex rounded-full bg-[var(--input-bg)] mb-4">
                  <div style={{ width: "84%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                </div>
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-[var(--text-muted)] uppercase">Current Capacity</span>
                  <span className="text-[var(--text-main)]">84%</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="border-t border-[var(--border-panel)] py-12 bg-[var(--bg-header)] mt-20">
        <div className="max-w-screen-2xl mx-auto px-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[var(--text-muted)]">
            <div className="flex gap-8 text-[11px] font-black uppercase">
              <a href="#" className="hover:text-indigo-400 transition-colors">Privacy.OS</a>
              <a href="#" className="hover:text-indigo-400 transition-colors">Mesh Protocols</a>
              <a href="#" className="hover:text-indigo-400 transition-colors">Developer Console</a>
            </div>
            <span className="text-[11px] font-bold">AIDRA.OS v4.2.0 • BUILT FOR RESILIENCE</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
