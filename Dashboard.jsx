import { useState, useEffect } from 'react';
import axios from 'axios';
import { Leaf, Image as ImageIcon, Activity, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({ ndviCount: 0, imageCount: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setError('');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const res = await axios.get(`${apiUrl}/history`);
        const data = res.data || [];
        const ndvi = data.filter(d => d.input_type === 'ndvi').length;
        const image = data.filter(d => d.input_type === 'image').length;
        setStats({ ndviCount: ndvi, imageCount: image, total: data.length });
      } catch (err) {
        console.error("Error fetching history", err);
        setError("Unable to connect to the server. Please ensure the backend is running on port 8080.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome to AgroAI. Monitor your crop classification statistics and manage your farm data.</p>
      </header>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl mb-8 flex items-center gap-3 animate-in fade-in duration-300">
          <Activity size={20} className="text-red-400" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* About Section */}
      <div className="p-8 rounded-3xl shadow-xl border border-emerald-500/20 mb-10 bg-gradient-to-br from-emerald-600 via-emerald-500 to-green-500 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold mb-3">AgroAI: Crop Type Classification</h2>
          <p className="text-white text-lg leading-relaxed max-w-3xl opacity-95">
            This project leverages <strong>Satellite Time Series</strong> and <strong>Deep Learning</strong> to revolutionize how we identify crop types. 
            By analyzing NDVI (Normalized Difference Vegetation Index) patterns and high-resolution satellite imagery, AgroAI provides 
            accurate, real-time classifications to support sustainable farming and agricultural management.
          </p>
          <div className="flex gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-medium border border-white/30">
              LSTM Time-Series Model
            </div>
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-medium border border-white/30">
              CNN Image Recognition
            </div>
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-medium border border-white/30">
              Satellite Data Fusion
            </div>
          </div>
        </div>
        <Leaf className="absolute -right-8 -bottom-8 text-white/10" size={240} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-primary/10 rounded-xl text-primary">
            <Activity size={32} />
          </div>
          <div>
            <p className="text-gray-600 text-sm font-semibold">Total Predictions</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
        
        <div className="glass p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-blue-500/10 rounded-xl text-blue-500">
            <Leaf size={32} />
          </div>
          <div>
            <p className="text-gray-600 text-sm font-semibold">NDVI Classifications</p>
            <p className="text-3xl font-bold text-gray-900">{stats.ndviCount}</p>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-purple-500/10 rounded-xl text-purple-500">
            <ImageIcon size={32} />
          </div>
          <div>
            <p className="text-gray-600 text-sm font-semibold">Image Classifications</p>
            <p className="text-3xl font-bold text-gray-900">{stats.imageCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-3xl shadow-lg border border-gray-100 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">NDVI Analysis</h2>
          <p className="text-gray-700 mb-6 relative z-10 leading-relaxed">Use time-series NDVI data (Normalized Difference Vegetation Index) from 6 months to predict crop types using our LSTM Neural Network.</p>
          <Link to="/predict-ndvi" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-secondary transition-colors relative z-10 shadow-lg shadow-primary/20">
            Start NDVI Prediction <Leaf size={18} />
          </Link>
        </div>

        <div className="glass p-8 rounded-3xl shadow-lg border border-gray-100 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Satellite Image Analysis</h2>
          <p className="text-gray-700 mb-6 relative z-10 leading-relaxed">Upload a satellite image of the field to predict the crop type using our Convolutional Neural Network (CNN).</p>
          <Link to="/predict-image" className="inline-flex items-center gap-2 bg-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-600 transition-colors relative z-10 shadow-lg shadow-purple-500/20">
            Start Image Prediction <ImageIcon size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
