import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Calendar, Gem, Search, Route, Shield, Globe, Star, MapPin, Tag } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Search state
  const [searchDest, setSearchDest] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  // Calculator state
  const [calcPref, setCalcPref] = useState('Beach');
  const [calcMultiplier, setCalcMultiplier] = useState(1.1);
  const [calcDays, setCalcDays] = useState(7);
  const [calcTier, setCalcTier] = useState('Comfort');
  const [calcRate, setCalcRate] = useState(180);
  const [calcFlight, setCalcFlight] = useState(750);

  const themeOptions = [
    { name: 'Beach', icon: '🏖️', multiplier: 1.1 },
    { name: 'Mountain', icon: '⛰️', multiplier: 1.0 },
    { name: 'City', icon: '🏙️', multiplier: 1.25 },
    { name: 'Adventure', icon: '🧗', multiplier: 1.3 }
  ];

  const tierOptions = [
    { name: 'Economy', icon: '🎒', rate: 80, flight: 350 },
    { name: 'Comfort', icon: '🏡', rate: 180, flight: 750 },
    { name: 'Luxury', icon: '👑', rate: 450, flight: 2000 }
  ];

  // Calculated costs
  const costs = useMemo(() => {
    const flightCost = calcFlight;
    const lodgingCost = Math.round(calcRate * calcDays * 0.7 * calcMultiplier);
    const foodActivities = Math.round(calcRate * calcDays * 0.5 * calcMultiplier);
    const total = flightCost + lodgingCost + foodActivities;
    return { flightCost, lodgingCost, foodActivities, total };
  }, [calcFlight, calcRate, calcDays, calcMultiplier]);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (!searchDest.trim()) {
      alert('Please enter a destination name.');
      return;
    }
    navigate(`/map?search=${encodeURIComponent(searchDest.trim())}`);
  };

  const handleBookCalculatedTrip = () => {
    if (!isAuthenticated) {
      alert('Please sign in to generate and save travel plans with your preferences!');
      navigate('/login');
      return;
    }
    
    // Set localStorage preloaded items for dashboard integration
    localStorage.setItem('preloadedCalcDays', calcDays.toString());
    localStorage.setItem('preloadedCalcBudget', calcTier + ' Plan');
    localStorage.setItem('preloadedCalcPref', calcPref);
    
    navigate('/dashboard');
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      {/* Hero Header */}
      <header className="relative pt-32 pb-44 text-white overflow-hidden flex items-center min-h-[85vh] bg-[linear-gradient(rgba(15,23,42,0.45),rgba(15,23,42,0.7)),url('https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-semibold tracking-wider text-teal-300">
              ✈️ GENERATIVE TRAVEL PLATFORM
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              AI-Powered <span className="bg-gradient-to-r from-teal-300 via-blue-300 to-indigo-200 bg-clip-text text-transparent">Travel Experiences</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto font-light leading-relaxed">
              Let our artificial intelligence craft your perfect custom vacation timeline based on your specific style, preference, and budget constraints.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <button onClick={() => navigate('/map')} className="px-8 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer">
                🗺️ Open Interactive Map
              </button>
              <a href="#calculator" className="px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 backdrop-blur-sm">
                📊 Calculate Travel Cost
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="max-w-5xl mx-4 md:mx-auto -mt-20 relative z-10 p-6 bg-white rounded-3xl shadow-xl border border-slate-100 glass-panel">
        <form onSubmit={handleHeroSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Destination</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={searchDest}
                onChange={(e) => setSearchDest(e.target.value)}
                placeholder="Where to? (e.g. Bali)" 
                className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-slate-800 bg-white/50"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Check In</label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="date" 
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-slate-800 bg-white/50"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Check Out</label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="date" 
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-slate-800 bg-white/50"
              />
            </div>
          </div>
          <div>
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm cursor-pointer">
              <Search className="w-4 h-4" /> Search map
            </button>
          </div>
        </form>
      </section>

      {/* Calculator Section */}
      <section className="py-20 bg-slate-50 border-b border-slate-100" id="calculator">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Pricing Tool</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Interactive Budget Estimator</h2>
            <p className="text-slate-500">Estimate your travel budget dynamically depending on your style and duration preferences.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Inputs (Left Pane) */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl shadow-md border border-slate-150 flex flex-col justify-between">
              <div className="space-y-6">
                {/* Theme Style */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-blue-500" /> Travel Theme Style
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {themeOptions.map((opt) => (
                      <button 
                        key={opt.name}
                        onClick={() => {
                          setCalcPref(opt.name);
                          setCalcMultiplier(opt.multiplier);
                        }}
                        className={`py-3 rounded-xl text-center text-xs font-bold transition flex flex-col items-center gap-1.5 border-2 cursor-pointer ${
                          calcPref === opt.name 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <span className="text-lg">{opt.icon}</span> {opt.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Days Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-700 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-500" /> Vacation Duration
                    </label>
                    <span className="text-sm font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                      {calcDays} Day{calcDays > 1 ? 's' : ''}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="14" 
                    value={calcDays} 
                    onChange={(e) => setCalcDays(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 pt-1 font-bold">
                    <span>1 Day</span>
                    <span>7 Days</span>
                    <span>14 Days</span>
                  </div>
                </div>

                {/* Class Tier */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                    <Gem className="w-4 h-4 text-blue-500" /> Luxury Class Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {tierOptions.map((opt) => (
                      <button 
                        key={opt.name}
                        onClick={() => {
                          setCalcTier(opt.name);
                          setCalcRate(opt.rate);
                          setCalcFlight(opt.flight);
                        }}
                        className={`py-3 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 border-2 cursor-pointer ${
                          calcTier === opt.name 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <span className="font-extrabold text-base">{opt.icon}</span> {opt.name === 'Luxury' ? 'Ultra VIP' : opt.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Results (Right Pane) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl shadow-xl text-white flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-teal-300 uppercase tracking-widest">Est. Cost Breakdown</span>
                <div className="py-6 border-b border-slate-800">
                  <span className="text-slate-400 text-xs font-semibold block uppercase">Total Estimated Package</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">${costs.total.toLocaleString()}</span>
                    <span className="text-slate-400 text-sm font-semibold">USD</span>
                  </div>
                </div>

                <div className="space-y-4 pt-6">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                      <span>🏨 Lodging & Stays (40%)</span>
                      <span>${costs.lodgingCost.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-400 h-full rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                      <span>✈️ Transports & Flights (35%)</span>
                      <span>${costs.flightCost.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-teal-400 h-full rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                      <span>🍽️ Foods & Local Activities (25%)</span>
                      <span>${costs.foodActivities.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-400 h-full rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <button onClick={handleBookCalculatedTrip} className="w-full bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-300 hover:to-blue-400 text-slate-900 font-extrabold py-3.5 rounded-xl shadow-lg transition duration-300 flex items-center justify-center gap-2 text-sm cursor-pointer">
                  ✈️ Compile AI Custom Itinerary
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Slogan & Smart Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 py-16 px-8 rounded-3xl shadow-xl relative overflow-hidden text-center max-w-5xl mx-auto text-white">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 space-y-4 max-w-3xl mx-auto">
              <span className="text-xs font-bold text-teal-400 tracking-widest uppercase">Travel Reimagined</span>
              <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">Discover Your Perfect Journey</h2>
              <p className="text-slate-300 font-light leading-relaxed max-w-2xl mx-auto text-sm md:text-base">
                Our customized generative AI coordinates with localized hotel directories and flight feeds to craft optimized, stress-free bookings in real time.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-slate-200">
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                  <Route className="w-6 h-6 text-teal-300 mx-auto mb-2" />
                  <h4 className="font-bold text-sm">Smart Itineraries</h4>
                  <p className="text-xs text-slate-400 mt-1">Schedules matching your budget style</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                  <Shield className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <h4 className="font-bold text-sm">Stress-Free Checks</h4>
                  <p className="text-xs text-slate-400 mt-1">Real-time alerts & checklist syncing</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                  <Globe className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                  <h4 className="font-bold text-sm">Global Coverage</h4>
                  <p className="text-xs text-slate-400 mt-1">Curated spots across 120+ regions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 bg-slate-50 border-t border-slate-100" id="destinations">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Handpicked Sights</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Popular Destinations</h2>
            <p className="text-slate-500 max-w-lg mx-auto">Explore some of our traveler's absolute favorite destinations worldwide.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Bali, Indonesia', price: '$899', days: '7 Days', img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&auto=format', rating: '4.8 (1.2k)' },
              { name: 'Paris, France', price: '$1,299', days: '5 Days', img: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600&auto=format', rating: '4.9 (1.5k)' },
              { name: 'Tokyo, Japan', price: '$1,599', days: '10 Days', img: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&auto=format', rating: '4.7 (980)' },
              { name: 'New York, USA', price: '$1,199', days: '6 Days', img: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=600&auto=format', rating: '4.8 (1.3k)' }
            ].map((dest) => (
              <div key={dest.name} className="destination-card bg-white rounded-2xl overflow-hidden shadow-md border border-slate-150 flex flex-col justify-between hover:-translate-y-2 transition-all duration-300">
                <div className="relative h-48 overflow-hidden">
                  <img src={dest.img} alt={dest.name} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h3 className="text-white font-bold text-lg">{dest.name}</h3>
                    <p className="text-teal-300 text-xs font-semibold">From {dest.price}</p>
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                    <span><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline-block mr-1 -mt-0.5" /> {dest.rating}</span>
                    <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{dest.days}</span>
                  </div>
                  <button 
                    onClick={() => navigate(`/map?search=${encodeURIComponent(dest.name.split(',')[0])}`)} 
                    className="w-full text-center bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Explore Map
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Deals */}
      <section className="py-16 bg-white" id="deals">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">Hot Offers</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Special AI-Recommended Deals</h2>
            <p className="text-slate-500">Curated by our neural algorithms for maximum value and optimal scheduling.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-50 rounded-3xl overflow-hidden shadow-sm border border-slate-150 flex flex-col md:flex-row hover:shadow-md transition">
              <div className="md:w-1/3 h-48 md:h-auto">
                <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format" alt="Rome" className="w-full h-full object-cover" />
              </div>
              <div className="p-6 md:w-2/3 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-slate-900">Rome & Florence</h3>
                    <span className="bg-teal-100 text-teal-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase">AI Top Pick</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">Experience historic Italy with an AI-curated itinerary including premium flights and luxury hotel packages.</p>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 line-through text-xs">$2,499</span>
                    <span className="text-lg font-black text-blue-600 block leading-none">$1,899</span>
                  </div>
                  <button onClick={() => navigate('/map?search=Rome')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer">Plan Trip</button>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-3xl overflow-hidden shadow-sm border border-slate-150 flex flex-col md:flex-row hover:shadow-md transition">
              <div className="md:w-1/3 h-48 md:h-auto">
                <img src="https://images.unsplash.com/photo-1533107862482-0e6974b06ec4?w=600&auto=format" alt="Santorini" className="w-full h-full object-cover" />
              </div>
              <div className="p-6 md:w-2/3 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-slate-900">Santorini Escape</h3>
                    <span className="bg-blue-100 text-blue-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase">Trending</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">Relax with stunning caldera views. The package features private infinity pools and boutique local restaurants.</p>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 line-through text-xs">$1,799</span>
                    <span className="text-lg font-black text-blue-600 block leading-none">$1,399</span>
                  </div>
                  <button onClick={() => navigate('/map?search=Santorini')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer">Plan Trip</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Reviews</span>
            <h2 class="text-3xl font-extrabold text-slate-900">What Our Travelers Say</h2>
            <p className="text-slate-500 max-w-md mx-auto">Verified feedbacks from tourists globally.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-150 space-y-4">
              <div className="flex items-center gap-3">
                <img src="https://randomuser.me/api/portraits/women/32.jpg" alt="Sarah J." className="w-10 h-10 rounded-full object-cover shadow-sm" />
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Sarah J.</h4>
                  <div className="flex text-amber-400 text-xs gap-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">"The AI trip planner created the perfect itinerary for my Japan trip. It knew exactly what I'd like based on my preferences - from hidden ramen shops to serene temples. Best travel experience ever!"</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-150 space-y-4">
              <div className="flex items-center gap-3">
                <img src="https://randomuser.me/api/portraits/men/45.jpg" alt="Michael T." className="w-10 h-10 rounded-full object-cover shadow-sm" />
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Michael T.</h4>
                  <div className="flex text-amber-400 text-xs gap-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">"I was skeptical about AI planning my honeymoon, but iQlipse nailed it! They found us a luxury villa in Bali within our budget that we never would have found on our own."</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-150 space-y-4">
              <div className="flex items-center gap-3">
                <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Priya K." className="w-10 h-10 rounded-full object-cover shadow-sm" />
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Priya K.</h4>
                  <div className="flex text-amber-400 text-xs gap-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <Star className="w-3 h-3 fill-amber-400/50 text-amber-400/50" />
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">"As a solo female traveler, safety is my top priority. iQlipse AI recommended accommodations perfect for solo travelers, and their 24/7 AI assistant gave me peace of mind."</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
