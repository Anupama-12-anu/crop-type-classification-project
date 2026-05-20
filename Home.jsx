import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Leaf, Image as ImageIcon, Activity, Award, User, Target, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { user } = useContext(AuthContext);
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
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Home Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Home Page</h1>
          <p className="text-gray-600 mt-2">Welcome back to Crop Type Classification portal.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm self-start">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <User size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold">Logged In User</p>
            <p className="text-sm font-bold text-gray-700">{user?.email || 'Active User'}</p>
          </div>
        </div>
      </header>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
          <Activity size={20} className="text-red-400" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* About Section - Unified on Home */}
      <div className="p-8 rounded-3xl shadow-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-600 via-emerald-500 to-green-500 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-4xl">
          <div className="flex items-center gap-2 mb-4 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold w-fit uppercase tracking-wider border border-white/20">
            <Award size={14} /> About the Project
          </div>
          <h2 className="text-3xl font-extrabold mb-3">AgroAI: Crop Type Classification</h2>
          <p className="text-white text-lg leading-relaxed opacity-95">
            This project leverages satellite time-series observations and advanced classification systems to revolutionize crop monitoring. 
            By fusing Normalized Difference Vegetation Index (NDVI) temporal graphs and high-resolution spatial photos, AgroAI accurately distinguishes 
            between key agricultural crops, empowering researchers and agricultural bodies with reliable crop statistics.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-medium border border-white/30">
              6-Month Time Series Analysis
            </div>
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-medium border border-white/30">
              Satellite Photo Classification
            </div>
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-medium border border-white/30">
              Out-of-Distribution Crop Safeguard
            </div>
          </div>
        </div>
        <Leaf className="absolute -right-8 -bottom-8 text-white/10" size={240} />
      </div>

      {/* Dashboard Stats Section */}
      <section className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-800">Dashboard Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-4 bg-primary/10 rounded-xl text-primary">
              <Activity size={32} />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-semibold">Total Classifications</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
          
          <div className="glass p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-4 bg-blue-500/10 rounded-xl text-blue-500">
              <Leaf size={32} />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-semibold">NDVI Inputs Evaluated</p>
              <p className="text-3xl font-bold text-gray-900">{stats.ndviCount}</p>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-4 bg-purple-500/10 rounded-xl text-purple-500">
              <ImageIcon size={32} />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-semibold">Images Uploaded</p>
              <p className="text-3xl font-bold text-gray-900">{stats.imageCount}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Prediction Inputs Section */}
      <section className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-800">Prediction Input Channels</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass p-8 rounded-3xl shadow-lg border border-gray-100 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
            <h4 className="text-2xl font-bold text-gray-900 mb-4">1. NDVI Time-Series Input</h4>
            <p className="text-gray-700 mb-6 relative z-10 leading-relaxed">
              Enter 6 months of consecutive Normalized Difference Vegetation Index (NDVI) values to analyze the crop growth cycles and classify the crop type.
            </p>
            <Link to="/predict-ndvi" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-secondary transition-colors relative z-10 shadow-lg shadow-primary/20">
              Open NDVI Input Section <Leaf size={18} />
            </Link>
          </div>

          <div className="glass p-8 rounded-3xl shadow-lg border border-gray-100 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
            <h4 className="text-2xl font-bold text-gray-900 mb-4">2. Satellite Image Input</h4>
            <p className="text-gray-700 mb-6 relative z-10 leading-relaxed">
              Upload a satellite image of the crop plot. Our OOD filter catches untrained crops (like mango or banana) and classifies supported crop types.
            </p>
            <Link to="/predict-image" className="inline-flex items-center gap-2 bg-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-600 transition-colors relative z-10 shadow-lg shadow-purple-500/20">
              Open Image Input Section <ImageIcon size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
