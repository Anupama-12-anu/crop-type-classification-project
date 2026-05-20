import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Leaf, Loader2 } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await register(email, password);
      if (result.success) {
        // Success! Redirect to login
        navigate('/login', { state: { message: "Account created successfully! Please log in." } });
      } else {
        setError(result.error || "Failed to register. Please try again.");
      }
    } catch (err) {
      setError("A network error occurred. Is the backend running?");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="glass p-8 rounded-3xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 shadow-lg shadow-primary/40">
            <Leaf className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Create Account</h2>
          <p className="text-gray-500 mt-2">Join AgroAI today</p>
        </div>

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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/50"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
                Creating Account...
              </>
            ) : "Sign Up"}
          </button>
        </form>
        
        <p className="text-center mt-6 text-gray-600 text-sm">
          Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
