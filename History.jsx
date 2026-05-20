import { useState, useEffect } from 'react';
import axios from 'axios';
import { History as HistoryIcon, Leaf, Image as ImageIcon, Calendar } from 'lucide-react';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const res = await axios.get(`${apiUrl}/history`);
        setHistory(res.data);
      } catch (err) {
        console.error("Error fetching history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gray-800 tracking-tight flex items-center gap-3">
          <HistoryIcon className="text-blue-500" size={36} /> Prediction History
        </h1>
        <p className="text-gray-500 mt-2">View all your past crop classification predictions.</p>
      </header>

      <div className="glass rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        {history.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <HistoryIcon size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-600">No predictions yet</p>
            <p className="text-sm">Start by making an NDVI or Image prediction.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Prediction</th>
                  <th className="px-6 py-4 font-semibold">Confidence</th>
                  <th className="px-6 py-4 font-semibold">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {item.input_type === 'ndvi' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            <Leaf size={14} /> NDVI
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                            <ImageIcon size={14} /> Image
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      {item.prediction}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-[100px] bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${item.confidence > 0.8 ? 'bg-green-500' : item.confidence > 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${item.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">{(item.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 flex items-center gap-2">
                      <Calendar size={14} /> {new Date(item.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
