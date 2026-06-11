import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import MapView from './pages/MapView';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Chatbot from './components/Chatbot';
import { Bed, Menu, X, Mail } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatContext, setChatContext] = useState('');

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Navigation bar, hidden on auth pages */}
      {!isAuthPage && (
        <nav className="bg-white/95 backdrop-blur-md shadow-sm fixed w-full z-50 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center space-x-8">
                <Link to="/" className="flex items-center space-x-2 text-decoration-none">
                  <Bed className="text-blue-600 text-2xl" />
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-indigo-600 bg-clip-text text-transparent">iQlipse Travel</span>
                </Link>
                <div className="hidden md:flex space-x-6 text-sm font-medium">
                  <Link to="/" className={`pb-1 text-decoration-none ${location.pathname === '/' ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-800 transition'}`}>Home</Link>
                  <Link to="/map" className={`pb-1 text-decoration-none ${location.pathname === '/map' ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-800 transition'}`}>Interactive Map</Link>
                  <Link to="/dashboard" className={`pb-1 text-decoration-none ${location.pathname === '/dashboard' ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-800 transition'}`}>Dashboard</Link>
                </div>
              </div>
              
              {/* Dynamic Auth Section */}
              <div className="hidden md:flex items-center space-x-4">
                {isAuthenticated && user ? (
                  <div className="flex items-center space-x-3">
                    <Link to="/dashboard" className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-1.5 px-3 rounded-xl transition text-decoration-none">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-inner">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{user.name}</span>
                    </Link>
                    <button onClick={() => { logout(); navigate('/'); }} className="text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-xl transition cursor-pointer border-0">
                      Logout
                    </button>
                  </div>
                ) : (
                  <>
                    <Link to="/login" className="text-slate-600 hover:text-blue-600 transition font-semibold text-sm text-decoration-none">Sign In</Link>
                    <Link to="/signup" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition text-decoration-none">Get Started</Link>
                  </>
                )}
              </div>
              
              <div className="flex md:hidden">
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600 text-xl focus:outline-none bg-transparent border-0 cursor-pointer">
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t px-4 py-3 space-y-2">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 hover:text-blue-600 font-medium text-decoration-none">Home</Link>
              <Link to="/map" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 hover:text-blue-600 font-medium text-decoration-none">Interactive Map</Link>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 hover:text-blue-600 font-medium text-decoration-none">Dashboard</Link>
              <div className="border-t border-slate-100 my-2 pt-2">
                {isAuthenticated && user ? (
                  <>
                    <div className="py-2 text-slate-800 font-bold">Hello, {user.name}</div>
                    <button onClick={() => { logout(); setMobileMenuOpen(false); navigate('/'); }} className="w-full text-left py-2 text-red-500 bg-transparent border-0 cursor-pointer">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 text-decoration-none">Sign In</Link>
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-blue-600 font-semibold text-decoration-none">Get Started</Link>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>
      )}

      {/* Main Content Area */}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapView onOpenChatContext={setChatContext} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>

      {/* Footer, hidden on auth pages */}
      {!isAuthPage && (
        <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-sm mt-auto text-left">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-white">
                  <Bed className="text-blue-450 text-xl" />
                  <span className="font-extrabold text-lg">iQlipse Travel</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">Premium AI-based itineraries, booking systems, and concierge travel tools.</p>
              </div>
              <div>
                <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-wider">Features</h4>
                <ul className="space-y-2 text-xs list-none p-0">
                  <li><Link to="/map" className="text-slate-400 hover:text-white text-decoration-none">Interactive Leaflet Map</Link></li>
                  <li><Link to="/dashboard" className="text-slate-400 hover:text-white text-decoration-none">AI Plan Generator</Link></li>
                  <li><Link to="/dashboard" className="text-slate-400 hover:text-white font-semibold text-decoration-none">User Dashboard</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-wider">Contact</h4>
                <ul className="space-y-2 text-xs text-slate-550 list-none p-0">
                  <li><Mail className="w-4 h-4 inline mr-2 text-slate-400" /> info@iqlipsetravel.com</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-wider">Newsletter</h4>
                <p className="text-xs text-slate-500 mb-3">Join us for top travel tips and hotel deals.</p>
                <div className="flex">
                  <input type="email" placeholder="Email Address" className="px-3 py-2 rounded-l-xl text-slate-850 w-full text-xs outline-none bg-white border-0" />
                  <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-xl text-white text-xs border-0 cursor-pointer">Join</button>
                </div>
              </div>
            </div>
            
            <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
              <p>© 2026 iQlipse Inc. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-slate-500 hover:text-white text-decoration-none">Privacy Policy</a>
                <a href="#" className="text-slate-500 hover:text-white text-decoration-none">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Floating chatbot */}
      <Chatbot chatContext={chatContext} setChatContext={setChatContext} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
