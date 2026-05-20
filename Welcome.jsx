import { Link } from 'react-router-dom';
import { Leaf, LogIn, UserPlus } from 'lucide-react';

const Welcome = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-tr from-emerald-50 via-emerald-100/50 to-green-50/70 p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-green-200/30 rounded-full blur-3xl"></div>
      
      {/* Top Header/Logo area */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between py-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Leaf className="text-white" size={18} />
          </div>
          <span className="text-lg font-bold text-gray-800 tracking-wider">AgroAI</span>
        </div>
      </div>

      {/* Hero Content */}
      <main className="max-w-4xl mx-auto w-full flex-1 flex flex-col items-center justify-center text-center py-12 relative z-10">
        {/* Simple & elegant emblem */}
        <div className="w-24 h-24 bg-white/80 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-emerald-500/5 border border-white/60 animate-bounce duration-3000">
          <Leaf className="text-emerald-500" size={48} />
        </div>

        {/* The Exact Title */}
        <h1 className="text-5xl md:text-6xl font-black text-gray-800 tracking-tight leading-none mb-6">
          Crop Type Classification
        </h1>

        <p className="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed mb-10 opacity-90 font-medium">
          Accurate satellite time-series analysis and field imagery recognition to predict and monitor agricultural crop types effortlessly.
        </p>

        {/* Login and Register Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <Link 
            to="/login" 
            className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
          >
            Get Started / Login <LogIn size={20} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link 
            to="/register" 
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-bold text-lg rounded-2xl shadow-md border border-gray-200/80 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            Create Account <UserPlus size={20} />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full text-center py-4 relative z-10 text-gray-500 text-sm font-medium">
        &copy; {new Date().getFullYear()} AgroAI. Supporting Sustainable Agriculture.
      </footer>
    </div>
  );
};

export default Welcome;
