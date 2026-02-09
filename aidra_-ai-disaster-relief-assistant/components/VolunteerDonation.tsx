
import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Users, 
  DollarSign, 
  Package, 
  CheckCircle, 
  Search, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface ActivityLog {
  id: string;
  type: 'volunteer' | 'donation';
  name: string;
  description: string;
  time: string;
}

const VolunteerDonation: React.FC = () => {
  // Fix: changed 'donate' to 'donation' to match ActivityLog interface and resolve type mismatch
  const [tab, setTab] = useState<'volunteer' | 'donation'>('volunteer');
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  
  // Tracking State
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingResult, setTrackingResult] = useState<{status: string, message: string} | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    skills: [] as string[],
    availability: 'Available Immediately',
    donationType: 'funds',
    donationDetails: '',
    amount: ''
  });

  // Mock Activity Feed
  const [activity, setActivity] = useState<ActivityLog[]>([
    { id: '1', type: 'volunteer', name: 'Amit S.', description: 'Registered as Medical Volunteer', time: '5 mins ago' },
    { id: '2', type: 'donation', name: 'Priya K.', description: 'Donated 50 Emergency Kits', time: '12 mins ago' },
    { id: '3', type: 'donation', name: 'Rahul M.', description: 'Pledged ₹5,000 for Relief', time: '45 mins ago' }
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) 
        ? prev.skills.filter(s => s !== skill) 
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = 'RN-' + Math.floor(1000 + Math.random() * 9000);
    setApplicationId(newId);
    setSubmitted(true);
    
    // Add to mock activity
    // Fix: Using the updated tab state which is now compatible with ActivityLog['type']
    const newEntry: ActivityLog = {
      id: Date.now().toString(),
      type: tab,
      name: formData.name,
      description: tab === 'volunteer' ? `Registered as ${formData.skills[0] || 'General'} Volunteer` : `Donated to Relief efforts`,
      time: 'Just now'
    };
    setActivity([newEntry, ...activity.slice(0, 4)]);
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingCode.startsWith('RN-')) {
      setTrackingResult({
        status: 'Under Review',
        message: 'Your application has been received and is currently being verified by our regional coordinators.'
      });
    } else {
      setTrackingResult({
        status: 'Not Found',
        message: 'The provided tracking code does not match our records. Please verify and try again.'
      });
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({
      name: '',
      phone: '',
      email: '',
      skills: [],
      availability: 'Available Immediately',
      donationType: 'funds',
      donationDetails: '',
      amount: ''
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Application Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex border-b-2 border-gray-200 bg-white">
            <button 
              onClick={() => { setTab('volunteer'); setSubmitted(false); }}
              className={`flex-1 px-4 py-4 text-sm font-bold uppercase transition-all flex items-center justify-center gap-2 ${tab === 'volunteer' ? 'bg-[#337ab7] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Users className="w-4 h-4" />
              Volunteer Registration
            </button>
            <button 
              // Fix: setTab updated to use 'donation'
              onClick={() => { setTab('donation'); setSubmitted(false); }}
              className={`flex-1 px-4 py-4 text-sm font-bold uppercase transition-all flex items-center justify-center gap-2 ${tab === 'donation' ? 'bg-[#d9534f] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Heart className="w-4 h-4" />
              Donation Portal
            </button>
          </div>

          <div className="card-flat p-8 min-h-[500px]">
            {submitted ? (
              <div className="py-20 text-center space-y-6 animate-in zoom-in">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto border-4 border-green-50">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 uppercase">Submission Successful</h3>
                  <p className="text-gray-500 mt-2">Your application code is: <span className="font-black text-blue-600 select-all">{applicationId}</span></p>
                  <p className="text-xs text-gray-400 mt-1 italic">Please save this code to track your status later.</p>
                </div>
                <div className="pt-6">
                  <button 
                    onClick={resetForm}
                    className="btn-primary px-8 py-3 text-xs font-bold uppercase"
                  >
                    Submit Another Application
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-gray-50 p-4 border-l-4 border-blue-500 mb-6">
                  <p className="text-xs font-bold text-gray-700">
                    {tab === 'volunteer' 
                      ? "Join our rapid response network. Volunteers are the backbone of disaster recovery." 
                      : "Your contributions provide life-saving supplies to impacted regions immediately."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Full Legal Name</label>
                    <input 
                      required 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      type="text" 
                      className="w-full border border-gray-300 p-3 text-sm rounded-sm" 
                      placeholder="e.g., Rajesh Kumar" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Email Address</label>
                    <input 
                      required 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      type="email" 
                      className="w-full border border-gray-300 p-3 text-sm rounded-sm" 
                      placeholder="name@example.com" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Primary Contact No.</label>
                    <input 
                      required 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      type="tel" 
                      className="w-full border border-gray-300 p-3 text-sm rounded-sm" 
                      placeholder="+91 XXXXX XXXXX" 
                    />
                  </div>
                  {tab === 'volunteer' && (
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Deployment Readiness</label>
                      <select 
                        name="availability"
                        value={formData.availability}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 p-3 text-sm rounded-sm"
                      >
                        <option>Available Immediately</option>
                        <option>Within 24 Hours</option>
                        <option>Weekends Only</option>
                        <option>Remote/Virtual Support</option>
                      </select>
                    </div>
                  )}
                </div>

                {tab === 'volunteer' ? (
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Expertise & Skillsets (Select all that apply)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {['First Aid', 'SAR (Search/Rescue)', 'Cooking', 'Heavy Vehicle', 'Data Entry', 'Language Support', 'Counseling', 'Electrical'].map(skill => (
                        <label 
                          key={skill} 
                          className={`flex items-center gap-2 p-3 border rounded-sm text-xs font-bold cursor-pointer transition-all ${formData.skills.includes(skill) ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                        >
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 hidden" 
                            checked={formData.skills.includes(skill)}
                            onChange={() => handleSkillToggle(skill)}
                          />
                          <span>{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-3">Contribution Category</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'funds', label: 'Financial', icon: DollarSign },
                          { id: 'items', label: 'Material', icon: Package },
                          { id: 'other', label: 'Services', icon: Users }
                        ].map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setFormData(prev => ({...prev, donationType: type.id}))}
                            className={`p-4 border text-center transition-all ${formData.donationType === type.id ? 'bg-red-50 border-red-400 text-red-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                          >
                            <type.icon className="w-5 h-5 mx-auto mb-2" />
                            <p className="text-[9px] font-bold uppercase">{type.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    {formData.donationType === 'funds' ? (
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Pledge Amount (₹)</label>
                        <input 
                          required
                          name="amount"
                          value={formData.amount}
                          onChange={handleInputChange}
                          type="number" 
                          className="w-full border border-gray-300 p-3 text-sm rounded-sm" 
                          placeholder="e.g., 1000" 
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Details of Items / Provisions</label>
                        <textarea 
                          required
                          name="donationDetails"
                          value={formData.donationDetails}
                          onChange={handleInputChange}
                          rows={3} 
                          className="w-full border border-gray-300 p-3 text-sm rounded-sm" 
                          placeholder="List quantities, types (e.g., 50 blankets, dry rations for 10 people)..."
                        ></textarea>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                  <button 
                    type="submit" 
                    className={`w-full py-4 text-white font-black uppercase text-sm tracking-widest shadow-lg active:scale-[0.98] transition-all ${tab === 'volunteer' ? 'btn-primary' : 'btn-danger'}`}
                  >
                    Confirm & Dispatch Data
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-3 font-medium">
                    By submitting, you agree to the RescueNet Privacy Policy and Terms of Disaster Response Engagement.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar Tracking & Activity */}
        <div className="space-y-6">
          
          {/* Track Application */}
          <div className="card-flat overflow-hidden">
            <div className="bg-[#2c3e50] text-white px-4 py-3 font-bold text-xs uppercase flex items-center gap-2 tracking-wider">
              <Search className="w-4 h-4" />
              Track Registration
            </div>
            <div className="p-5 space-y-4">
              <p className="text-[10px] text-gray-500 font-bold uppercase leading-tight">Enter your application code to see real-time verification status.</p>
              <form onSubmit={handleTrack} className="flex gap-1">
                <input 
                  type="text" 
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="RN-XXXX" 
                  className="flex-1 border border-gray-300 px-3 py-2 text-sm uppercase placeholder:lowercase focus:outline-none focus:border-blue-500"
                />
                <button type="submit" className="bg-[#2c3e50] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-black transition-colors">GO</button>
              </form>
              
              {trackingResult && (
                <div className={`p-4 border animate-in slide-in-from-top-2 duration-300 ${trackingResult.status === 'Not Found' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {trackingResult.status === 'Not Found' ? <AlertCircle className="w-3 h-3 text-red-600" /> : <Clock className="w-3 h-3 text-blue-600" />}
                    <span className={`text-[10px] font-black uppercase ${trackingResult.status === 'Not Found' ? 'text-red-600' : 'text-blue-600'}`}>{trackingResult.status}</span>
                  </div>
                  <p className="text-[10px] font-bold text-gray-600 leading-normal">{trackingResult.message}</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity Wall */}
          <div className="card-flat">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-bold text-xs uppercase flex items-center gap-2 tracking-wider text-gray-700">
              <ActivityIcon className="w-4 h-4 text-blue-600" />
              Community Response
            </div>
            <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
              {activity.map((act) => (
                <div key={act.id} className="flex gap-3 items-start border-b border-gray-50 pb-3 last:border-0 last:pb-0 group">
                  <div className={`mt-1 p-2 rounded-sm border ${act.type === 'volunteer' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                    {act.type === 'volunteer' ? <Users className="w-3 h-3" /> : <Heart className="w-3 h-3" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-[11px] font-black text-gray-900">{act.name}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">{act.time}</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 leading-tight group-hover:text-gray-700 transition-colors">{act.description}</p>
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <button className="w-full py-2 bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-100 transition-colors border border-gray-100">View Global Registry</button>
              </div>
            </div>
          </div>

          {/* Why it Matters */}
          <div className="card-flat p-5 bg-blue-600 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <ShieldCheck className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <h4 className="text-sm font-black uppercase mb-2 tracking-tighter">Certified Coordination</h4>
              <p className="text-[10px] font-bold leading-normal opacity-90 mb-4">
                All data submitted is encrypted and vetted by the National Disaster Response Force (NDRF) and partnered NGOs.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase bg-white/10 p-2 rounded-sm w-fit">
                Learn More <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const ActivityIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

export default VolunteerDonation;
