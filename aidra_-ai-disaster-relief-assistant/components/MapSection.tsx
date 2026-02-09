
import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet';
import { DisasterZone, ZoneType } from '../types';
import { MapPin, Info, AlertTriangle, Search, Loader2 } from 'lucide-react';
import { generateAreaRiskZones } from '../services/geminiService';

const RecenterMap: React.FC<{ coords: [number, number] }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 13);
  }, [coords, map]);
  return null;
};

interface MapSectionProps {
  initialQuery?: string;
}

const MapSection: React.FC<MapSectionProps> = ({ initialQuery }) => {
  const [zones, setZones] = useState<DisasterZone[]>([]);
  const [activeZone, setActiveZone] = useState<DisasterZone | null>(null);
  const [center, setCenter] = useState<[number, number]>([19.0760, 72.8777]); // Default Mumbai
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [loading, setLoading] = useState(false);

  const performSurveillance = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const result = await generateAreaRiskZones(query);
      setCenter(result.center);
      setZones(result.zones);
      setActiveZone(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      performSurveillance(initialQuery);
    }
  }, [initialQuery, performSurveillance]);

  const getZoneColor = (type: ZoneType) => {
    switch (type) {
      case ZoneType.RED: return '#ef4444';
      case ZoneType.YELLOW: return '#eab308';
      case ZoneType.GREEN: return '#22c55e';
      default: return '#6b7280';
    }
  };

  const handleAreaSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    performSurveillance(searchQuery);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAreaSearch} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Input area for strategic surveillance (e.g. South Mumbai, North Delhi)..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-sm text-sm focus:border-blue-500 focus:outline-none"
          />
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary px-6 py-3 text-xs font-bold uppercase flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Deploy Surveillance
        </button>
      </form>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 rounded-sm overflow-hidden shadow-sm relative min-h-[600px] border border-gray-200">
          <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: '600px' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {zones.map((zone) => (
              <Circle
                key={zone.id}
                center={zone.coordinates}
                radius={zone.radius}
                pathOptions={{
                  fillColor: getZoneColor(zone.type),
                  color: getZoneColor(zone.type),
                  weight: 2,
                  opacity: 0.8,
                  fillOpacity: 0.35,
                }}
                eventHandlers={{
                  click: () => setActiveZone(zone),
                }}
              >
                <Popup>
                  <div className="p-1">
                    <h3 className="font-bold text-sm uppercase">{zone.name}</h3>
                    <p className="text-xs text-gray-600">{zone.description}</p>
                  </div>
                </Popup>
              </Circle>
            ))}
            <RecenterMap coords={center} />
          </MapContainer>
          
          <div className="absolute bottom-4 left-4 z-[1000] bg-white p-3 rounded-sm shadow border border-gray-200">
            <div className="flex flex-col gap-2 text-[10px] font-bold uppercase">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span> Red: High Risk Zone
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span> Yellow: Caution / Relief Zone
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span> Green: Safe Assembly Point
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-80 flex flex-col gap-4">
          <div className="card-flat p-6 flex-1 overflow-y-auto">
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-gray-800">
              <Info className="w-4 h-4 text-blue-500" />
              Intelligence Feed
            </h2>
            
            {activeZone ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className={`p-3 border-l-4 rounded-sm flex items-start gap-2 ${
                  activeZone.type === ZoneType.RED ? 'bg-red-50 border-red-500 text-red-700' : 
                  activeZone.type === ZoneType.YELLOW ? 'bg-yellow-50 border-yellow-500 text-yellow-700' : 
                  'bg-green-50 border-green-500 text-green-700'
                }`}>
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-black uppercase">{activeZone.name}</h4>
                    <p className="text-[11px] font-medium leading-relaxed mt-1">{activeZone.description}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Safety Protocols</h4>
                  <ul className="space-y-2">
                    {activeZone.instructions.map((inst, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11px] font-medium text-gray-700">
                        <span className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[9px] font-black flex-shrink-0 mt-0.5">{i+1}</span>
                        {inst}
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={() => setActiveZone(null)}
                  className="w-full py-2 text-[10px] font-bold text-gray-400 hover:text-gray-600 uppercase border border-gray-100 hover:bg-gray-50 mt-4"
                >
                  Dismiss Report
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-10">
                <MapPin className="w-10 h-10 mb-3 opacity-10" />
                <p className="text-[11px] font-medium">Select a colored zone on the map to access site-specific safety protocols and live data.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapSection;
