import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Leaf, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);
    
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/', { replace: true });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Unable to connect to the login server. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
      <div className="glass p-8 rounded-3xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 shadow-lg shadow-primary/40">
            <Leaf className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Sign in to continue to AgroAI</p>
        </div>

        {successMessage && (
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl mb-4 text-sm border border-emerald-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm border border-red-100 flex items-center gap-2 animate-shake">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/50"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/50"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Signing In...
              </>
            ) : "Sign In"}
          </button>
        </form>
        
        <p className="text-center mt-6 text-gray-600 text-sm">
          Don't have an account? <Link to="/register" className="text-primary font-semibold hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
