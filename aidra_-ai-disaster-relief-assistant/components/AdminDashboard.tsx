
import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  AlertOctagon, 
  Send, 
  ShieldAlert, 
  Activity,
  Users,
  Clock,
  X
} from 'lucide-react';

interface Incident {
  id: string;
  name: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Reported' | 'In-Progress' | 'Containment' | 'Resolved';
  lastUpdated: string;
  location: string;
}

const AdminDashboard: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([
    { id: '1', name: 'Lower Manhattan Flood', severity: 'Critical', status: 'In-Progress', lastUpdated: '2 mins ago', location: 'New York, NY' },
    { id: '2', name: 'Queens Power Outage', severity: 'Medium', status: 'Reported', lastUpdated: '14 mins ago', location: 'Queens, NY' },
    { id: '3', name: 'Brooklyn Gas Leak', severity: 'High', status: 'Containment', lastUpdated: '31 mins ago', location: 'Brooklyn, NY' }
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newIncident, setNewIncident] = useState<Partial<Incident>>({
    severity: 'Medium',
    status: 'Reported'
  });

  const [broadcastMessage, setBroadcastMessage] = useState('');

  const handleAddIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const incident: Incident = {
      id: Math.random().toString(36).substr(2, 9),
      name: newIncident.name || 'Unnamed Incident',
      severity: (newIncident.severity as any) || 'Medium',
      status: 'Reported',
      location: newIncident.location || 'Unknown',
      lastUpdated: 'Just now'
    };
    setIncidents([incident, ...incidents]);
    setIsFormOpen(false);
    setNewIncident({ severity: 'Medium', status: 'Reported' });
  };

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-700 font-bold';
      case 'High': return 'text-orange-700 font-bold';
      case 'Medium': return 'text-yellow-700 font-bold';
      default: return 'text-green-700 font-bold';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Incidents', value: incidents.length, icon: AlertOctagon, color: 'text-red-600' },
          { label: 'Agents', value: '1,284', icon: Users, color: 'text-blue-600' },
          { label: 'Response', value: '12m', icon: Clock, color: 'text-green-600' },
          { label: 'Supply', value: '62%', icon: Activity, color: 'text-orange-600' }
        ].map((stat, i) => (
          <div key={i} className="card-flat p-4 flex items-center gap-4">
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-sm">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900 leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-800 uppercase text-sm tracking-wider">Operational Queue</h3>
            <button 
              onClick={() => setIsFormOpen(true)}
              className="btn-primary px-4 py-2 text-xs font-bold uppercase flex items-center gap-2"
            >
              <Plus className="w-3 h-3" /> New Log
            </button>
          </div>

          <div className="card-flat overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-bold text-gray-600 uppercase text-[10px]">Title</th>
                  <th className="px-4 py-3 font-bold text-gray-600 uppercase text-[10px]">Severity</th>
                  <th className="px-4 py-3 font-bold text-gray-600 uppercase text-[10px]">Status</th>
                  <th className="px-4 py-3 font-bold text-gray-600 uppercase text-[10px]">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {incidents.map((incident) => (
                  <tr key={incident.id}>
                    <td className="px-4 py-3">
                      <p className="font-bold">{incident.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{incident.location} • {incident.lastUpdated}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] uppercase ${getSeverityClass(incident.severity)}`}>
                        {incident.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">{incident.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-flat overflow-hidden">
            <div className="bg-[#2c3e50] text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest">Global Dispatcher</div>
            <div className="p-4 space-y-4">
              <textarea 
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full bg-white border border-gray-300 p-3 text-xs focus:outline-none focus:border-blue-500 h-32"
                placeholder="Compose emergency broadcast..."
              />
              <button 
                disabled={!broadcastMessage}
                className="w-full btn-danger py-3 text-xs font-bold uppercase flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3 h-3" /> Execute Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-2xl w-full max-w-md">
            <div className="bg-gray-100 p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 uppercase text-sm">System Log Entry</h3>
              <button onClick={() => setIsFormOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleAddIncident} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Incident Label</label>
                <input required type="text" className="w-full border border-gray-300 p-3 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Severity</label>
                  <select className="w-full border border-gray-300 p-3 text-sm">
                    <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Zone</label>
                  <input required type="text" className="w-full border border-gray-300 p-3 text-sm" />
                </div>
              </div>
              <button type="submit" className="w-full btn-primary py-3 font-bold uppercase text-sm">Save & Broadcast</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
