
import React, { useState, useRef } from 'react';
import { Camera, ShieldAlert, CheckCircle2, Loader2, AlertCircle, FileText, Sparkles } from 'lucide-react';
import { analyzeIncidentImage, IncidentAnalysis } from '../services/geminiService';

const IncidentReporting: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<IncidentAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const result = await analyzeIncidentImage(image, "image/jpeg");
      setAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityStyle = (sev?: string) => {
    switch(sev) {
      case 'Critical': return 'bg-red-600 text-white';
      case 'High': return 'bg-orange-600 text-white';
      case 'Medium': return 'bg-yellow-500 text-white';
      default: return 'bg-green-600 text-white';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="card-flat p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider mb-4">Evidence Transmission</h3>
          
          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all"
            >
              <Camera className="w-10 h-10 text-gray-400 mb-3" />
              <p className="text-xs font-bold text-gray-500 uppercase">Capture Photographic Evidence</p>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
          ) : (
            <div className="relative aspect-video border border-gray-200">
              <img src={image} alt="Incident" className="w-full h-full object-cover" />
              <button 
                onClick={() => { setImage(null); setAnalysis(null); }}
                className="absolute top-2 right-2 bg-black/60 text-white p-2 hover:bg-red-600"
              >
                <AlertCircle className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            disabled={!image || loading}
            onClick={handleAnalyze}
            className="w-full btn-primary py-4 font-bold uppercase text-xs flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Execute Automated Analysis
          </button>
        </div>

        <div className="bg-gray-50 border border-gray-200 p-6 min-h-[400px]">
          {analysis ? (
            <div className="space-y-6 animate-in fade-in">
              <div className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${getSeverityStyle(analysis.severity)}`}>
                Severity: {analysis.severity}
              </div>

              <div>
                <h4 className="text-[9px] font-bold text-gray-400 uppercase mb-1">AI Intelligence Summary</h4>
                <p className="text-sm font-medium text-gray-700 leading-normal">{analysis.summary}</p>
              </div>

              <div>
                <h4 className="text-[9px] font-bold text-gray-400 uppercase mb-2">Protocol Checklist</h4>
                <div className="space-y-2">
                  {analysis.safetySteps.map((step, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs font-bold text-gray-600">
                      <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5" />
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-white border border-gray-200">
                <div className="flex items-center gap-2 mb-2 text-blue-800">
                  <FileText className="w-4 h-4" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Impact Metric</span>
                </div>
                <p className="text-xs font-bold text-gray-600">{analysis.estimatedImpact}</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 italic">
              <ShieldAlert className="w-12 h-12 mb-4 text-gray-400" />
              <p className="text-xs font-bold uppercase">Awaiting Data Upload</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentReporting;
