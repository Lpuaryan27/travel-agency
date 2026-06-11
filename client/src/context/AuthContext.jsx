import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        if (data.requireOtp) {
          return { 
            success: true, 
            requireOtp: true, 
            email: data.email, 
            phone: data.phone, 
            demoOtp: data.demoOtp 
          };
        }
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (err) {
      return { success: false, message: 'Server connectivity issues.' };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email, otp) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Verification failed' };
      }
    } catch (err) {
      return { success: false, message: 'Server connectivity issues.' };
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (email) => {
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, demoOtp: data.demoOtp, message: data.message };
      } else {
        return { success: false, message: data.message || 'Failed to resend OTP' };
      }
    } catch (err) {
      return { success: false, message: 'Server connectivity issues.' };
    }
  };

  const register = async (name, email, password, preference, phone) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, preference, phone })
      });
      const data = await res.json();

      if (res.ok) {
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (err) {
      return { success: false, message: 'Server connectivity issues.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Helper fetch method with JWT authorization header injected
  const fetchWithAuth = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const finalOptions = {
      ...options,
      headers
    };
    const res = await fetch(url, finalOptions);
    if (res.status === 401 || res.status === 403) {
      // Auto logout on unauthorized
      logout();
    }
    return res;
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, loading, login, verifyOtp, resendOtp, register, logout, fetchWithAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
