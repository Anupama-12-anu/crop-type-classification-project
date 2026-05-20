import { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const setAuthData = useCallback((newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser({ token: newToken });
    } else {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
    setLoading(false);
  }, []);

  // Use interceptor for more reliable header management
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
          config.headers.Authorization = `Bearer ${savedToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    return () => axios.interceptors.request.eject(interceptor);
  }, []);

  // Handle 401 Unauthorized globally
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  useEffect(() => {
    const initAuth = () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        setToken(savedToken);
        setUser({ token: savedToken });
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await axios.post(`${apiUrl}/login`, { email, password });
      const { access_token } = response.data;
      setAuthData(access_token);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        error: error.response?.data?.detail || "Login failed. Please check your credentials." 
      };
    }
  };

  const register = async (email, password) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      await axios.post(`${apiUrl}/register`, { email, password });
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return { 
        success: false, 
        error: error.response?.data?.detail || "Registration failed. Email might already be taken." 
      };
    }
  };

  const logout = () => {
    setAuthData(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
