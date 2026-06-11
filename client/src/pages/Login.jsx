import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Bed, Phone, KeyRound, ArrowLeft } from 'lucide-react';
import travelGraphic from '../assets/glowing_world_travel.png';

export default function Login() {
  const navigate = useNavigate();
  const { login, verifyOtp, resendOtp, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // OTP Verification States
  const [requireOtp, setRequireOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setResendMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      if (res.requireOtp) {
        setRequireOtp(true);
        setMaskedPhone(res.phone || '');
        setDemoOtp(res.demoOtp || '');
        setErrorMsg('');
      } else {
        alert('Login Successful');
        navigate('/dashboard');
      }
    } else {
      setErrorMsg(res.message || 'Invalid email/phone or password.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setResendMessage('');

    if (!otpCode.trim() || otpCode.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit verification code.');
      return;
    }

    const res = await verifyOtp(email, otpCode);
    if (res.success) {
      alert('Login Successful');
      navigate('/dashboard');
    } else {
      setErrorMsg(res.message || 'Invalid verification code.');
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    setErrorMsg('');
    setResendMessage('');
    
    const res = await resendOtp(email);
    if (res.success) {
      setResendMessage('A new code has been sent!');
      setDemoOtp(res.demoOtp || '');
      setResendCooldown(60);
      
      // Start cooldown timer
      const timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setErrorMsg(res.message || 'Failed to resend verification code.');
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen flex items-center justify-center bg-[linear-gradient(rgba(15,23,42,0.55),rgba(15,23,42,0.75)),url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center p-4 sm:p-6 lg:p-8">
      <div className="glass-panel w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row transition-all duration-300 transform hover:scale-[1.005]">
        
        {/* Left Graphics */}
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
              <Bed className="w-6 h-6 text-teal-305" />
              <span className="bg-gradient-to-r from-teal-300 to-blue-200 bg-clip-text text-transparent">iQlipse Travel</span>
            </Link>
          </div>
          
          <div className="my-auto relative z-10 space-y-6">
            <h1 className="text-4xl font-extrabold leading-tight text-white">Welcome Back to iQlipse</h1>
            <p className="text-blue-100 text-lg leading-relaxed font-light">
              Sign in to access your saved itineraries, consult the AI Concierge, and manage your upcoming adventures.
            </p>
            
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-300">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="font-medium text-slate-100 text-sm">Review Interactive Custom Routes</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-300">
                  <Lock className="w-5 h-5" />
                </div>
                <span className="font-medium text-slate-100 text-sm">Access Previous AI Chats &amp; Stays</span>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 text-xs text-blue-200">
            &copy; 2026 iQlipse Inc. All rights reserved.
          </div>
        </div>

        {/* Right Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white/95 text-left transition-all duration-500">
          <div className="flex md:hidden items-center space-x-2 text-xl font-bold mb-6 text-slate-800">
            <Bed className="w-6 h-6 text-blue-600" />
            <span>iQlipse Travel</span>
          </div>
          
          {!requireOtp ? (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Sign In</h2>
                <p className="text-slate-500 text-sm">Access your personalized AI travel planner.</p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-55 text-red-650 rounded-xl border border-red-200 text-xs font-semibold">
                  ⚠️ {errorMsg}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">Email or Phone Number</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      id="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com or +1234567890" 
                      required
                      className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-white/50 text-slate-800 text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="password" className="block text-sm font-semibold text-slate-700">Password</label>
                    <a href="#" className="text-xs text-blue-650 hover:underline">Forgot password?</a>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      id="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      required
                      className="w-full pl-11 pr-12 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-white/50 text-slate-800 text-sm"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-500 cursor-pointer border-0 bg-transparent"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 mt-6 cursor-pointer disabled:opacity-50 border-0"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
              
              <p className="text-center text-sm text-slate-500 mt-6">
                Don't have an account yet? <Link to="/signup" className="text-blue-600 font-bold hover:underline">Sign up</Link>
              </p>
            </>
          ) : (
            <>
              <div className="mb-6 text-left">
                <button 
                  onClick={() => { setRequireOtp(false); setErrorMsg(''); setResendMessage(''); }} 
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium mb-4 bg-transparent border-0 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </button>
                
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Enter Verification Code</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  We've sent a 6-digit OTP code to:
                </p>
                <div className="mt-2 space-y-1 text-xs font-semibold text-blue-800 bg-blue-50/70 border border-blue-100 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                    <span>{email}</span>
                  </div>
                  {maskedPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-blue-500" />
                      <span>{maskedPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-55 text-red-650 rounded-xl border border-red-200 text-xs font-semibold">
                  ⚠️ {errorMsg}
                </div>
              )}

              {resendMessage && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl border border-green-200 text-xs font-semibold">
                  ✓ {resendMessage}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-semibold text-slate-700 mb-1">One-Time Password (OTP)</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      id="otp" 
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit code" 
                      maxLength={6}
                      required
                      className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-white/50 text-slate-800 text-lg font-bold tracking-widest text-center"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 mt-6 cursor-pointer disabled:opacity-50 border-0"
                >
                  {loading ? 'Verifying...' : 'Verify & Dashboard Login'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-slate-500">Didn't receive the code? </span>
                {resendCooldown > 0 ? (
                  <span className="text-slate-400 font-semibold">Resend in {resendCooldown}s</span>
                ) : (
                  <button 
                    onClick={handleResendOtp}
                    className="text-blue-650 font-bold hover:underline bg-transparent border-0 cursor-pointer p-0"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              {/* DEMO MODE VERIFICATION HELPER */}
              {demoOtp && (
                <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-left">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wide block mb-1">Developer Mode OTP Helper</span>
                  <p className="text-xs text-amber-700 mb-2.5">
                    For direct testing on Render / production environment without checking logs or SMTP, you can copy the generated code below:
                  </p>
                  <div className="flex items-center justify-between bg-white border border-amber-300 rounded-xl px-3.5 py-2">
                    <span className="text-base font-mono font-extrabold text-slate-800 tracking-wider">{demoOtp}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(demoOtp);
                        alert('Demo OTP copied!');
                      }}
                      className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-850 px-2.5 py-1 rounded-lg font-bold transition border-0 cursor-pointer"
                    >
                      Copy Code
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
