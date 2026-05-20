import { useState, useRef } from 'react';
import axios from 'axios';
import { Image as ImageIcon, UploadCloud, CheckCircle2, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ImagePredict = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError('');
      setResult(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (!droppedFile.type.startsWith('image/')) {
        setError('Please drop an image file');
        return;
      }
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setError('');
      setResult(null);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an image first");
      return;
    }

    setError('');
    setResult(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const res = await axios.post(`${apiUrl}/predict-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
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
          <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
            <ImageIcon size={32} />
          </div>
          Image Prediction
        </h1>
        <p className="text-gray-500 mt-2">Upload a satellite image of the field to classify the crop type using our CNN model.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <UploadCloud size={24} className="text-purple-500" /> Image Upload
            </h2>
          </div>
          
          {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-sm border border-red-100">{error}</div>}

          <div className="flex-1 flex flex-col">
            {!preview ? (
              <div 
                className="flex-1 border-2 border-dashed border-purple-200 rounded-2xl flex flex-col items-center justify-center p-8 bg-purple-50/50 hover:bg-purple-50 transition-colors cursor-pointer min-h-[300px]"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <div className="w-20 h-20 bg-purple-100 text-purple-500 rounded-full flex items-center justify-center mb-4 shadow-inner">
                  <UploadCloud size={40} />
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-1">Click or drag image to upload</h3>
                <p className="text-gray-500 text-sm text-center max-w-xs">Supports JPG, PNG formats representing satellite field imagery.</p>
              </div>
            ) : (
              <div className="flex-1 relative rounded-2xl overflow-hidden shadow-inner border border-gray-200 bg-gray-100 min-h-[300px] flex items-center justify-center group">
                <img src={preview} alt="Preview" className="max-h-[300px] object-contain z-10" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center">
                  <button 
                    onClick={clearSelection}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-3 rounded-full transition-colors"
                    title="Remove image"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileSelect} 
            />
            
            <button
              onClick={handleSubmit}
              disabled={loading || !file}
              className={`w-full mt-6 font-bold py-4 px-4 rounded-xl shadow-lg transition-all transform flex justify-center items-center gap-2 ${
                loading || !file 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' 
                  : 'bg-purple-500 hover:bg-purple-600 text-white shadow-purple-500/30 hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Processing Image...</>
              ) : (
                <>Analyze Image <ImageIcon size={20} /></>
              )}
            </button>
          </div>
        </div>

        <div>
          {result ? (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
              <div className="glass p-8 rounded-3xl shadow-lg border border-purple-100 mb-8 bg-gradient-to-br from-white to-purple-50">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-500 rounded-2xl shadow-lg shadow-purple-500/30 text-white mt-1">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Prediction Result</h3>
                    <div className="text-4xl font-black text-gray-800 tracking-tight mb-2">{result.crop_type}</div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold border border-purple-200">
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
                        <Cell key={`cell-${index}`} fill={entry.name === result.crop_type ? '#a855f7' : '#d1d5db'} />
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
                  <ImageIcon size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-600">Awaiting Image</h3>
                <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">Upload a satellite image and run prediction to see the results here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImagePredict;
