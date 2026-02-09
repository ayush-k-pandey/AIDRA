
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Phone, 
  MapPin, 
  Navigation, 
  Hospital, 
  Shield, 
  Warehouse, 
  Search, 
  Loader2, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { getEmergencyServicesInIndia, MapGroundingResult } from '../services/geminiService';

interface EmergencyServicesProps {
  initialLocation?: string;
  initialType?: string;
}

const EmergencyServices: React.FC<EmergencyServicesProps> = ({ initialLocation, initialType }) => {
  const [locationInput, setLocationInput] = useState(initialLocation || '');
  const [activeCategory, setActiveCategory] = useState<'Hospital' | 'Police' | 'Shelter'>((initialType as any) || 'Hospital');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MapGroundingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (e?: React.FormEvent, typeOverride?: string, locOverride?: string) => {
    if (e) e.preventDefault();
    const type = typeOverride || activeCategory;
    const location = locOverride || locationInput.trim();
    
    if (!location) {
      setError("Please specify a location in India.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getEmergencyServicesInIndia(location, type);
      setResults(data);
    } catch (err) {
      setError("Service lookup failed. Verify your location input.");
    } finally {
      setLoading(false);
    }
  }, [activeCategory, locationInput]);

  useEffect(() => {
    if (initialLocation) {
      setLocationInput(initialLocation);
      if (initialType) setActiveCategory(initialType as any);
      handleSearch(undefined, initialType, initialLocation);
    }
  }, [initialLocation, initialType, handleSearch]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="card-flat p-6">
        <h3 className="font-bold text-gray-800 uppercase text-xs mb-4 tracking-wider">Search Parameters</h3>
        <form onSubmit={(e) => handleSearch(e)} className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="Type city or area in India..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-sm text-sm focus:border-blue-500 focus:outline-none"
            />
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-8 py-3 text-xs font-bold uppercase flex items-center justify-center gap-2 min-w-[140px]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Find Facility
          </button>
        </form>

        {error && <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs font-bold border border-red-100">{error}</div>}

        <div className="flex gap-2 mt-6">
          {[
            { id: 'Hospital', label: 'Hospitals', icon: Hospital },
            { id: 'Police', label: 'Police', icon: Shield },
            { id: 'Shelter', label: 'Shelters', icon: Warehouse }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id as any);
                if (locationInput) handleSearch(undefined, cat.id);
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border transition-all ${activeCategory === cat.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
            >
              <cat.icon className="w-3 h-3" />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" />
          <span className="font-bold uppercase text-xs">Accessing Satellite Data...</span>
        </div>
      ) : results ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="card-flat p-6">
              <h4 className="font-bold text-sm uppercase text-blue-600 mb-4">Location Report</h4>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {results.text}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.links.map((link, i) => (
                <div key={i} className="card-flat p-5 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">{link.title}</h4>
                    <span className="inline-block bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 uppercase mb-4">{activeCategory}</span>
                  </div>
                  <div className="space-y-2">
                    <button 
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(link.title)}`, '_blank')}
                      className="w-full btn-primary py-2 text-[10px] font-bold uppercase flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-3 h-3" /> Get Directions
                    </button>
                    <a 
                      href={link.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2 bg-gray-100 text-gray-600 font-bold text-[10px] uppercase hover:bg-gray-200 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" /> Open in Maps
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-flat p-6 bg-blue-50 border-blue-200 h-fit">
            <h4 className="font-bold text-blue-800 uppercase text-xs mb-3">Service Guidelines</h4>
            <p className="text-xs text-blue-700 leading-normal mb-6">
              Official facilities are marked with verification markers. Contact authorities if you encounter closed or relocation notices.
            </p>
            <div className="bg-white border border-blue-200 p-4 rounded-sm">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Emergency Hotline</p>
              <p className="text-2xl font-black text-blue-900">112</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded text-gray-400">
          <MapPin className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p className="font-bold uppercase text-xs">Enter a location to find emergency infrastructure</p>
        </div>
      )}
    </div>
  );
};

export default EmergencyServices;
