import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Plane, Bed, Phone } from 'lucide-react';
import travelGraphic from '../assets/glowing_world_travel.png';

export default function Signup() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [preference, setPreference] = useState('General');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !email.trim() || !password.trim() || !phone.trim()) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (!termsAccepted) {
      setErrorMsg('Please agree to the terms and conditions.');
      return;
    }

    const res = await register(name, email, password, preference, phone);
    if (res.success) {
      alert('Account created successfully! Redirecting to login...');
      navigate('/login');
    } else {
      setErrorMsg(res.message || 'Registration failed. Try again.');
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen flex items-center justify-center bg-[linear-gradient(rgba(15,23,42,0.55),rgba(15,23,42,0.75)),url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center p-4 sm:p-6 lg:p-8">
      <div className="glass-panel w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row transition-all duration-300 transform hover:scale-[1.005]">
        
        {/* Left Side Graphics */}
        <div className="hidden md:flex md:w-1/2 p-12 text-white flex-col justify-between relative overflow-hidden text-left bg-slate-950">
          {/* Background image with overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity hover:opacity-40 transition-opacity duration-700" 
            style={{ backgroundImage: `url(${travelGraphic})` }}
          />
          {/* Neon glow elements */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <Link to="/" className="flex items-center space-x-2 text-2xl font-bold tracking-tight text-white decoration-transparent">
              <Bed className="w-6 h-6 text-teal-300" />
              <span className="bg-gradient-to-r from-teal-300 to-blue-200 bg-clip-text text-transparent">iQlipse Travel</span>
            </Link>
          </div>
          
          <div className="my-auto relative z-10 space-y-6 text-left">
            <h1 className="text-4xl font-extrabold leading-tight text-white">AI-Powered Travel Planning</h1>
            <p className="text-blue-100 text-lg leading-relaxed font-light">
              Create a free account today and let our smart algorithms design your custom, stress-free dream vacation in seconds.
            </p>
          </div>
          
          <div className="relative z-10 text-xs text-blue-200 text-left">
            &copy; 2026 iQlipse Inc. All rights reserved.
          </div>
        </div>

        {/* Right Side Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white/95 text-left">
          <div className="flex md:hidden items-center space-x-2 text-xl font-bold mb-6 text-slate-800">
            <Bed className="w-6 h-6 text-blue-600" />
            <span>iQlipse Travel</span>
          </div>
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h2>
            <p className="text-slate-500 text-sm">Plan and save your dream travel itineraries for free.</p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-55 text-red-650 rounded-xl border border-red-200 text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullname" className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  id="fullname" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe" 
                  required
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-white/50 text-slate-800 text-sm"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="email" 
                  id="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com" 
                  required
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-white/50 text-slate-800 text-sm"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="tel" 
                  id="phone" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1234567890" 
                  required
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-white/50 text-slate-800 text-sm"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="password" 
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-white/50 text-slate-800 text-sm"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="travelPreference" className="block text-sm font-semibold text-slate-700 mb-1">Travel Style Preference</label>
              <div className="relative font-semibold">
                <Plane className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  id="travelPreference"
                  value={preference}
                  onChange={(e) => setPreference(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-white/50 text-slate-850 text-sm appearance-none"
                >
                  <option value="Adventure">🧗 Adventure &amp; Outdoors</option>
                  <option value="Beach">🏖️ Beach &amp; Relaxation</option>
                  <option value="City">🏙️ City &amp; Culture</option>
                  <option value="Mountain">⛰️ Mountain &amp; Hiking</option>
                  <option value="General">🌍 General Explorer</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-start gap-2 pt-2">
              <input 
                type="checkbox" 
                id="terms" 
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                required 
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
              />
              <label htmlFor="terms" className="text-xs text-slate-500 select-none">
                I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" class="text-blue-600 hover:underline">Privacy Policy</a>
              </label>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="signup-btn w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50 border-0"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <p className="login-link text-center text-sm text-slate-500 mt-6">
            Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
