import { useState } from 'react';
import axios from 'axios';
import { Leaf, Activity, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const NDVIPredict = () => {
  const [ndviValues, setNdviValues] = useState(['', '', '', '', '', '']);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (index, value) => {
    const newValues = [...ndviValues];
    newValues[index] = value;
    setNdviValues(newValues);
  };

  const handleRandomize = () => {
    // Generate random values between 0.1 and 0.9 for testing
    const randomVals = Array(6).fill(0).map(() => (Math.random() * 0.8 + 0.1).toFixed(2));
    setNdviValues(randomVals);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    const parsedValues = ndviValues.map(v => parseFloat(v));
    if (parsedValues.some(isNaN)) {
      setError("Please enter valid numbers for all 6 months");
      setLoading(false);
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const res = await axios.post(`${apiUrl}/predict-ndvi`, {
        ndvi_values: parsedValues
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred during prediction");
    } finally {
      setLoading(false);
    }
  };

  const chartData = result ? Object.keys(result.probabilities).map(key => ({
    name: key,
    probability: result.probabilities[key] * 100
  })) : [];

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gray-800 tracking-tight flex items-center gap-3">
          <Leaf className="text-primary" size={36} /> NDVI Prediction
        </h1>
        <p className="text-gray-500 mt-2">Enter 6 months of NDVI values to classify the crop type using our LSTM model.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-3xl shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Activity size={24} className="text-blue-500" /> Time-Series Data
            </h2>
            <button 
              type="button" 
              onClick={handleRandomize}
              className="text-sm text-primary hover:text-secondary font-medium px-3 py-1 bg-primary/10 rounded-lg transition-colors"
            >
              Fill Random Data
            </button>
          </div>
          
          {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-sm border border-red-100">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {ndviValues.map((val, idx) => (
                <div key={idx}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Month {idx + 1}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white font-mono text-gray-700"
                    value={val}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              ))}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full font-bold py-4 px-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 flex justify-center items-center gap-2 ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-secondary text-white shadow-primary/30'
              }`}
            >
              {loading ? (
                <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Analyzing Sequence...</>
              ) : (
                <>Predict Crop Type <Activity size={20} /></>
              )}
            </button>
          </form>
        </div>

        <div>
          {result ? (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
              <div className="glass p-8 rounded-3xl shadow-lg border border-green-100 mb-8 bg-gradient-to-br from-white to-green-50">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-500 rounded-2xl shadow-lg shadow-green-500/30 text-white mt-1">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Prediction Result</h3>
                    <div className="text-4xl font-black text-gray-800 tracking-tight mb-2">{result.crop_type}</div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold border border-green-200">
                      Confidence: {(result.confidence * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass p-6 rounded-3xl shadow-lg border border-gray-100 h-[300px]">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Probability Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{fill: '#6b7280', fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill: '#6b7280', fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="probability" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === result.crop_type ? '#10b981' : '#d1d5db'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center p-8 bg-gray-50/50">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <Activity size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-600">Awaiting Data</h3>
                <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">Enter NDVI values and run prediction to see the results and probability distribution here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NDVIPredict;
