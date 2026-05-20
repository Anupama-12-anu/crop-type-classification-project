import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import NDVIPredict from './pages/NDVIPredict';
import ImagePredict from './pages/ImagePredict';
import History from './pages/History';
import About from './pages/About';
import Navbar from './components/Navbar';

const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
    <p className="text-gray-600 font-medium animate-pulse">Initializing AgroAI...</p>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <LoadingScreen />;
  
  if (!user) return <Navigate to="/" replace />;
  
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <LoadingScreen />;
  
  if (user) return <Navigate to="/" replace />;
  
  return children;
};

const RootRoute = () => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <LoadingScreen />;
  
  if (!user) return <Welcome />;
  
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Home />
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />

          {/* Root / Main Route */}
          <Route path="/" element={<RootRoute />} />
          <Route path="/predict-ndvi" element={
            <ProtectedRoute>
              <NDVIPredict />
            </ProtectedRoute>
          } />
          <Route path="/predict-image" element={
            <ProtectedRoute>
              <ImagePredict />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          } />
          <Route path="/about" element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
