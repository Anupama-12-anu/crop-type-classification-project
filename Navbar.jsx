import { NavLink } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Leaf, Image as ImageIcon, History, Home, LogOut, Award } from 'lucide-react';

const Navbar = () => {
  const { logout } = useContext(AuthContext);

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'About', path: '/about', icon: Award },
    { name: 'NDVI Predict', path: '/predict-ndvi', icon: Leaf },
    { name: 'Image Predict', path: '/predict-image', icon: ImageIcon },
    { name: 'History', path: '/history', icon: History },
  ];

  return (
    <div className="w-64 glass-dark text-white p-6 flex flex-col h-full rounded-r-2xl shadow-2xl">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <Leaf className="text-white" size={24} />
        </div>
        <h1 className="text-xl font-bold tracking-wider">AgroAI</h1>
      </div>
      
      <div className="flex-1 space-y-4">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </div>

      <button 
        onClick={logout}
        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors mt-auto"
      >
        <LogOut size={20} />
        <span className="font-medium">Logout</span>
      </button>
    </div>
  );
};

export default Navbar;
