
import React, { useState, useEffect } from 'react';
import { getAIGeneratedAlerts } from '../services/geminiService';
import { NewsUpdate } from '../types';
import { RefreshCw, Radio } from 'lucide-react';

const NewsFeed: React.FC = () => {
  const [news, setNews] = useState<NewsUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    setLoading(true);
    const data = await getAIGeneratedAlerts("New York Metro Area");
    setNews(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 60000 * 5);
    return () => clearInterval(interval);
  }, []);

  const getCategoryStyles = (cat: string) => {
    switch(cat) {
      case 'URGENT': return 'bg-red-600 text-white';
      case 'ADVISORY': return 'bg-blue-600 text-white';
      case 'UPDATE': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="card-flat">
      <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <h2 className="font-bold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-2">
          <Radio className="w-4 h-4 text-red-600" />
          Live Announcements
        </h2>
        <button 
          onClick={fetchNews}
          disabled={loading}
          className="text-gray-400 hover:text-blue-600 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {loading && news.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs italic">
            Updating news wire...
          </div>
        ) : (
          news.map((item) => (
            <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase ${getCategoryStyles(item.category)}`}>
                  {item.category}
                </span>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">{item.timestamp}</span>
              </div>
              <h3 className="font-bold text-sm text-gray-900 mb-1">{item.title}</h3>
              <p className="text-xs text-gray-600 leading-normal">{item.content}</p>
            </div>
          ))
        )}
      </div>
      
      <div className="p-2 bg-gray-100 text-[9px] text-gray-500 font-bold text-center border-t border-gray-200">
        VERIFIED OFFICIAL CHANNEL
      </div>
    </div>
  );
};

export default NewsFeed;
