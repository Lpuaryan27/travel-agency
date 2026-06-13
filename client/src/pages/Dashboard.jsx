import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Sparkles, Map, Eye, Trash2, Send, Loader2, Award, Calendar, CheckCircle, Mic, MicOff, Heart, FileText, Download, Edit3, Clock, Thermometer, CloudRain, Wind, Tag, ListTodo, Phone } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, token, fetchWithAuth } = useAuth();
  
  // Redirect if guest
  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
    }
  }, [token, user, navigate]);

  // Planner states
  const [plannerDest, setPlannerDest] = useState('');
  const [plannerSourceCity, setPlannerSourceCity] = useState('');
  const [plannerTravelType, setPlannerTravelType] = useState('General');
  const [plannerDays, setPlannerDays] = useState(5);
  const [plannerBudget, setPlannerBudget] = useState('Comfort Plan');
  const [plannerCheckIn, setPlannerCheckIn] = useState('');
  const [plannerCheckOut, setPlannerCheckOut] = useState('');
  const [generating, setGenerating] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);

  // Trips & Chat state
  const [trips, setTrips] = useState([]);
  const [chats, setChats] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef(null);

  // Modal State
  const [modalTrip, setModalTrip] = useState(null);
  const [modalActiveTab, setModalActiveTab] = useState('timeline'); // 'timeline', 'checklist', 'budget', 'weather', 'notes'
  const [modalNotes, setModalNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [modalChecklist, setModalChecklist] = useState([]);

  // Wishlist / Favorites from LocalStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem('favorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Preloading inputs from calculator
  useEffect(() => {
    const preloadedDays = localStorage.getItem('preloadedCalcDays');
    const preloadedBudget = localStorage.getItem('preloadedCalcBudget');
    
    if (preloadedDays || preloadedBudget) {
      if (preloadedBudget) setPlannerBudget(preloadedBudget);

      const today = new Date();
      const checkInDate = new Date(today.setDate(today.getDate() + 14));
      setPlannerCheckIn(checkInDate.toISOString().split('T')[0]);

      const checkOutDate = new Date(checkInDate.setDate(checkInDate.getDate() + parseInt(preloadedDays || 7)));
      setPlannerCheckOut(checkOutDate.toISOString().split('T')[0]);

      localStorage.removeItem('preloadedCalcDays');
      localStorage.removeItem('preloadedCalcBudget');
      localStorage.removeItem('preloadedCalcPref');
    }
  }, []);

  // Sync modal states with current trip
  useEffect(() => {
    if (modalTrip) {
      setModalNotes(modalTrip.notes || '');
      setModalChecklist(modalTrip.packingChecklist || []);
    }
  }, [modalTrip]);

  // Fetch Trips
  const fetchTrips = async () => {
    try {
      const res = await fetchWithAuth('/api/trips');
      const data = await res.json();
      if (res.ok) {
        setTrips(data.trips);
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
    }
  };

  // Fetch Chat logs
  const fetchChatLogs = async () => {
    try {
      const res = await fetchWithAuth('/api/chat/history?destName=your%20custom%20trip');
      const data = await res.json();
      if (res.ok && data.chat && data.chat.messages) {
        setChats(data.chat.messages);
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTrips();
      fetchChatLogs();
    }
  }, [token]);

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  // Voice Input Speech recognition
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setVoiceListening(true);
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setPlannerDest(speechToText);
      // Basic phrase parsing (e.g., "Paris for 5 days")
      const dayMatch = speechToText.match(/(\d+)\s*-?\s*day/i);
      if (dayMatch && dayMatch[1]) {
        setPlannerDays(parseInt(dayMatch[1]));
      }
    };

    recognition.onerror = (event) => {
      console.error(event);
      setVoiceListening(false);
    };

    recognition.onend = () => {
      setVoiceListening(false);
    };

    recognition.start();
  };

  // Submit Itinerary Form
  const handleGenerateItinerary = async (e) => {
    e.preventDefault();
    if (!plannerDest.trim() || !plannerCheckIn || !plannerCheckOut) {
      alert('Please fill out all fields.');
      return;
    }

    setGenerating(true);
    try {
      // Step 1: Send message to generate itinerary
      const prompt = `Plan a ${plannerDays}-day trip to ${plannerDest} from ${plannerSourceCity || 'my city'} under budget style ${plannerBudget} for a ${plannerTravelType} traveler. Output in structured markdown with day-by-day highlights.`;
      
      const chatRes = await fetchWithAuth('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: prompt,
          destName: plannerDest
        })
      });
      const chatData = await chatRes.json();
      if (!chatRes.ok) throw new Error(chatData.message || 'Itinerary generation failed.');

      // Step 2: Post to Save Trip API
      const priceVal = plannerBudget.includes('Economy') ? '₹15,000' : plannerBudget.includes('Comfort') ? '₹35,000' : '₹90,000';
      const saveRes = await fetchWithAuth('/api/trips', {
        method: 'POST',
        body: JSON.stringify({
          destination: plannerDest,
          checkIn: plannerCheckIn,
          checkOut: plannerCheckOut,
          duration: `${plannerDays} Days`,
          price: priceVal,
          type: plannerTravelType,
          rating: 4.8,
          itinerary: chatData.reply,
          sourceCity: plannerSourceCity,
          travelType: plannerTravelType
        })
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.message || 'Failed to save trip.');

      alert(`Successfully created and saved your customized itinerary to ${plannerDest}!`);
      setPlannerDest('');
      setPlannerSourceCity('');
      setPlannerDays(5);
      setPlannerCheckIn('');
      setPlannerCheckOut('');
      
      // Refresh
      fetchTrips();
      fetchChatLogs();
    } catch (err) {
      console.error(err);
      alert(`Error creating plan: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  // Send message
  const handleSendChatMessage = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const message = chatInput.trim();
    // Instantly append user message
    setChats(prev => [...prev, { sender: 'user', text: message }]);
    setChatInput('');

    try {
      const res = await fetchWithAuth('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message,
          destName: 'your custom trip'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setChats(prev => [...prev, { sender: 'ai', text: data.reply }]);
      }
    } catch (err) {
      console.error(err);
      setChats(prev => [...prev, { sender: 'ai', text: 'Sorry, I am facing server connectivity issues.' }]);
    }
  };

  // Delete Trip
  const handleDeleteTrip = async (tripId) => {
    if (!confirm('Are you sure you want to delete this trip itinerary?')) return;
    
    try {
      const res = await fetchWithAuth(`/api/trips/${tripId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('Trip deleted successfully.');
        fetchTrips();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save travel notes back to DB
  const handleSaveNotes = async () => {
    if (!modalTrip) return;
    setSavingNotes(true);
    try {
      const res = await fetchWithAuth(`/api/trips/${modalTrip.id}`, {
        method: 'PUT',
        body: JSON.stringify({ notes: modalNotes })
      });
      if (res.ok) {
        const data = await res.json();
        setTrips(prev => prev.map(t => t.id === modalTrip.id ? { ...t, notes: modalNotes } : t));
        setModalTrip(data.trip);
        alert('Trip journal notes saved successfully!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  // Toggle checklist packed status
  const handleToggleChecklist = async (index) => {
    if (!modalTrip) return;
    const updatedChecklist = modalChecklist.map((item, idx) => 
      idx === index ? { ...item, packed: !item.packed } : item
    );
    setModalChecklist(updatedChecklist);
    
    try {
      const res = await fetchWithAuth(`/api/trips/${modalTrip.id}`, {
        method: 'PUT',
        body: JSON.stringify({ packingChecklist: updatedChecklist })
      });
      if (res.ok) {
        const data = await res.json();
        setTrips(prev => prev.map(t => t.id === modalTrip.id ? { ...t, packingChecklist: updatedChecklist } : t));
        setModalTrip(data.trip);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Compile and print PDF summary
  const handleDownloadPDF = () => {
    if (!modalTrip) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to generate the PDF.');
      return;
    }
    
    const checklistHtml = modalChecklist.map(item => 
      `<li>[${item.packed ? '✔' : ' '}] ${item.item}</li>`
    ).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>${modalTrip.destination} - iQlipse Itinerary</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 30px; color: #334155; line-height: 1.5; }
            h1 { color: #2563eb; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; font-size: 26px; }
            h2 { color: #0f172a; margin-top: 25px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; font-size: 18px; }
            .meta-box { background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 15px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
            .meta-item { font-size: 13px; }
            .meta-label { font-weight: bold; color: #475569; }
            .itinerary { white-space: pre-wrap; font-size: 13px; color: #475569; }
            .checklist { list-style: none; padding-left: 0; }
            .checklist li { margin-bottom: 6px; font-size: 12px; }
            .notes { background: #fffbeb; padding: 15px; border-left: 4px solid #d97706; border-radius: 6px; font-style: italic; margin-top: 15px; font-size: 13px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1>iQlipse Travel Itinerary - ${modalTrip.destination}</h1>
          <div class="meta-box">
            <div class="meta-item"><span class="meta-label">Destination:</span> ${modalTrip.destination}</div>
            <div class="meta-item"><span class="meta-label">Travel Preference:</span> ${modalTrip.type}</div>
            <div class="meta-item"><span class="meta-label">Travel Dates:</span> ${formatDate(modalTrip.checkIn)} - ${formatDate(modalTrip.checkOut)} (${modalTrip.duration})</div>
            <div class="meta-item"><span class="meta-label">Estimated Budget:</span> ${modalTrip.price}</div>
            ${modalTrip.sourceCity ? `<div class="meta-item"><span class="meta-label">Source City:</span> ${modalTrip.sourceCity}</div>` : ''}
          </div>
          
          <h2>AI Travel Roadmap &amp; Schedule</h2>
          <div class="itinerary">${modalTrip.itinerary}</div>
          
          ${modalChecklist.length > 0 ? `
            <h2>Packing list</h2>
            <ul class="checklist">${checklistHtml}</ul>
          ` : ''}
          
          ${modalNotes ? `
            <h2>My Trip Notes</h2>
            <div class="notes">${modalNotes}</div>
          ` : ''}
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!user) return null;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 w-full">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-6 md:p-8 shadow-xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold mb-2">Welcome back, {user.name}!</h1>
          <p className="text-blue-100 text-lg">Explore custom itineraries, manage active bookings, and chat with your AI travel agent.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="inline-flex items-center px-3.5 py-1 bg-white/20 rounded-full text-sm font-medium border border-white/10">
              <Award className="w-4 h-4 mr-1.5 text-teal-300" /> Preference: {user.preference || 'General'}
            </div>
            {user.phone && (
              <div className="inline-flex items-center px-3.5 py-1 bg-white/20 rounded-full text-sm font-medium border border-white/10">
                <Phone className="w-4 h-4 mr-1.5 text-teal-300" /> Phone: {user.phone}
              </div>
            )}
          </div>
        </div>
        <button onClick={() => navigate('/map')} className="bg-white hover:bg-slate-100 text-indigo-700 font-bold px-6 py-3 rounded-xl shadow-lg transition flex items-center gap-2 self-start md:self-auto cursor-pointer">
          <Map className="w-5 h-5" /> Interactive Map
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Itinerary Form + Trips List */}
        <div className="lg:col-span-2 space-y-8">
          {/* AI Planner Form */}
          <div className="glass-panel rounded-2xl p-6 shadow-md bg-white border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Start AI Trip Planner</h2>
                <p className="text-slate-500 text-sm">Input your dates and let AI create and save your itinerary</p>
              </div>
            </div>

            <form onSubmit={handleGenerateItinerary} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex justify-between items-center">
                  <span>Destination</span>
                  <button 
                    type="button" 
                    onClick={handleVoiceInput}
                    className={`p-1 py-0.5 rounded-lg border-0 transition cursor-pointer flex items-center gap-1 text-[10px] font-bold ${
                      voiceListening ? 'bg-red-100 text-red-650 animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                    title="Speak Destination"
                  >
                    {voiceListening ? <MicOff className="w-3 h-3 text-red-500" /> : <Mic className="w-3 h-3 text-blue-500" />}
                    <span>{voiceListening ? 'Listening...' : 'Voice input'}</span>
                  </button>
                </label>
                <input 
                  type="text" 
                  value={plannerDest}
                  onChange={(e) => setPlannerDest(e.target.value)}
                  placeholder="e.g., Paris, France" 
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-white/50 text-slate-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Source City</label>
                <input 
                  type="text" 
                  value={plannerSourceCity}
                  onChange={(e) => setPlannerSourceCity(e.target.value)}
                  placeholder="e.g., New Delhi, India" 
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-white/50 text-slate-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Travel Type</label>
                <select 
                  value={plannerTravelType}
                  onChange={(e) => setPlannerTravelType(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-white/50 text-slate-850 text-sm"
                >
                  <option value="Solo Travel">Solo Travel</option>
                  <option value="Family Vacation">Family Vacation</option>
                  <option value="Adventure Trip">Adventure &amp; Outdoors</option>
                  <option value="Couple Getaway">Couple Getaway</option>
                  <option value="General Explorer">General Explorer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Number of Days ({plannerDays})</label>
                <div className="flex gap-4 items-center pt-1">
                  <input 
                    type="range" 
                    min="1"
                    max="14"
                    value={plannerDays}
                    onChange={(e) => setPlannerDays(parseInt(e.target.value))}
                    className="flex-grow h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Budget Level</label>
                <select 
                  value={plannerBudget}
                  onChange={(e) => setPlannerBudget(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-white/50 text-slate-850 text-sm"
                >
                  <option value="Economy Plan">Economy Budget (e.g. under ₹20,000 / $300)</option>
                  <option value="Comfort Plan">Comfort Class (e.g. under ₹50,000 / $800)</option>
                  <option value="Luxury Plan">Ultra Luxury (5-star Resorts / VIP)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Check-in</label>
                  <input 
                    type="date" 
                    value={plannerCheckIn}
                    onChange={(e) => setPlannerCheckIn(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-white/50 text-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Check-out</label>
                  <input 
                    type="date" 
                    value={plannerCheckOut}
                    onChange={(e) => setPlannerCheckOut(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-white/50 text-slate-800 text-xs"
                  />
                </div>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button 
                  type="submit" 
                  disabled={generating}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 w-full md:w-auto cursor-pointer disabled:opacity-50 border-0"
                >
                  {generating && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{generating ? 'Consulting iQlipse AI...' : 'Generate & Save Itinerary'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Saved Trips List */}
          <div className="glass-panel rounded-2xl p-6 shadow-md bg-white border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">My Saved Itineraries</h2>
                <p className="text-slate-500 text-sm">Manage your custom AI trips and planned getaways</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trips.length === 0 ? (
                <div className="col-span-full py-8 text-center text-slate-400 flex flex-col items-center justify-center">
                  <Briefcase className="w-12 h-12 text-slate-350 mb-2" />
                  <p>No saved trips yet. Generate your first plan above!</p>
                </div>
              ) : (
                trips.map((trip) => (
                  <div key={trip.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-slate-800 leading-snug">{trip.destination}</h3>
                        <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold">{trip.type}</span>
                      </div>
                      <div className="text-xs text-slate-500 space-y-1.5 mb-4">
                        <p className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(trip.checkIn)} - {formatDate(trip.checkOut)} ({trip.duration})</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-slate-400" />
                          <span>Est. Cost: <span className="text-indigo-600 font-semibold">{trip.price}</span></span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 border-t border-slate-100 pt-4 mt-2">
                      <button 
                        onClick={() => setModalTrip(trip)}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Itinerary
                      </button>
                      <button 
                        onClick={() => handleDeleteTrip(trip.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 p-2.5 rounded-xl transition flex items-center justify-center cursor-pointer"
                        title="Delete Trip"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Wishlist & Favorites */}
          <div className="glass-panel rounded-2xl p-6 shadow-md bg-white border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center text-xl">
                <Heart className="w-5 h-5 fill-red-500 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold">My Wishlist &amp; Favorites</h2>
                <p className="text-slate-500 text-sm">Destinations you bookmarked for later</p>
              </div>
            </div>

            {favorites.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs font-bold border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                No favorited destinations yet. Bookmark spots in the Map Explorer!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {favorites.map((fav, index) => (
                  <div key={index} className="bg-white border border-slate-150 p-3 rounded-xl flex items-center justify-between shadow-sm">
                    <span className="text-xs font-bold text-slate-800">{fav}</span>
                    <button 
                      onClick={() => {
                        const updated = favorites.filter(f => f !== fav);
                        setFavorites(updated);
                        localStorage.setItem('favorites', JSON.stringify(updated));
                      }}
                      className="text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mock Booking Receipts / History */}
          <div className="glass-panel rounded-2xl p-6 shadow-md bg-white border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Recent Booking History</h2>
                <p className="text-slate-500 text-sm">Receipts and active flight/stay confirmations</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { type: 'Flight Confirm', provider: 'Air India AI-402', price: '₹7,200', date: 'Jul 15, 2026', status: 'Confirmed' },
                { type: 'Resort Stay', provider: 'Horizon Beach Villa (Goa)', price: '₹8,800', date: 'Jul 16, 2026', status: 'Paid' }
              ].map((booking, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mr-2 uppercase">{booking.type}</span>
                    <strong className="text-xs text-slate-800">{booking.provider}</strong>
                    <span className="text-[10px] text-slate-400 block font-semibold mt-1">Date: {booking.date}</span>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="text-xs font-bold text-slate-700">{booking.price}</span>
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">{booking.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Chatbot Concierge Widget */}
        <div className="glass-panel rounded-2xl p-6 shadow-md flex flex-col h-[600px] bg-white border border-slate-200">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl relative">
              <Sparkles className="w-5 h-5" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h2 className="font-bold">AI Travel Concierge</h2>
              <span className="text-[10px] text-green-600 font-bold">Online &amp; ready to plan</span>
            </div>
          </div>

          {/* Chats panel */}
          <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-2 chat-scroll">
            {chats.length === 0 ? (
              <div className="flex items-start">
                <div className="bg-indigo-50 border border-indigo-100 text-slate-700 p-3 rounded-2xl rounded-tl-none max-w-[90%] text-sm">
                  Hi! I am your <strong>iQlipse AI Assistant</strong>. Ask me anything about hotels, weather, restaurants, or general tips for your destinations.
                </div>
              </div>
            ) : (
              chats.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-[85%] text-xs shadow-sm whitespace-pre-line ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-indigo-50 border border-indigo-100 text-slate-700 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Form chat input */}
          <form onSubmit={handleSendChatMessage} className="flex gap-2">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask travel advice..." 
              className="flex-grow border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 text-xs"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition shadow flex items-center justify-center cursor-pointer">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Modal */}
      {modalTrip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 flex justify-between items-center shadow-md">
              <div>
                <h3 className="text-xl font-bold">{modalTrip.destination} AI Planner</h3>
                <p className="text-xs text-blue-100">{formatDate(modalTrip.checkIn)} - {formatDate(modalTrip.checkOut)} ({modalTrip.duration})</p>
              </div>
              <button 
                onClick={() => setModalTrip(null)}
                className="text-white/80 hover:text-white text-lg transition cursor-pointer border-0 bg-transparent"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs Selector */}
            <div className="bg-slate-50 border-b border-slate-150 px-4 py-2 flex flex-wrap gap-1.5">
              {[
                { id: 'timeline', label: 'Timeline', icon: FileText },
                { id: 'checklist', label: 'Packing Check', icon: ListTodo },
                { id: 'weather', label: 'Weather Widget', icon: CloudRain },
                { id: 'budget', label: 'Visual Budget', icon: Tag },
                { id: 'notes', label: 'Trip Journal', icon: Edit3 }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setModalActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1 border-0 ${
                    modalActiveTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              ))}
              <button
                onClick={handleDownloadPDF}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-1 border-0 ml-auto"
                title="Download budget PDF"
              >
                <Download className="w-3.5 h-3.5 text-teal-300" />
                <span>PDF Export</span>
              </button>
            </div>

            {/* Tab content container */}
            <div className="p-6 overflow-y-auto flex-1 text-slate-700 leading-relaxed text-sm bg-slate-50/50">
              {modalActiveTab === 'timeline' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5 mb-2">
                    <Clock className="w-4 h-4 text-blue-500" /> Travel Roadmap
                  </h4>
                  <div className="relative border-l-2 border-blue-100 ml-4 space-y-5 py-2">
                    {modalTrip.itinerary.split('\n').map((line, idx) => {
                      if (line.trim().startsWith('* **Day') || line.trim().startsWith('**Day')) {
                        const dayText = line.replace(/[*#]/g, '').trim();
                        return (
                          <div key={idx} className="relative pl-6">
                            <div className="absolute -left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-sm"></div>
                            <h4 className="font-bold text-blue-600 text-sm">{dayText}</h4>
                          </div>
                        );
                      }
                      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                        const itemText = line.replace(/^[-*]\s*/, '').replace(/[*#]/g, '').trim();
                        return (
                          <div key={idx} className="pl-6 text-xs text-slate-600 font-medium">
                            {itemText}
                          </div>
                        );
                      }
                      if (line.trim()) {
                        return (
                          <div key={idx} className="pl-6 text-xs text-slate-500 font-light italic">
                            {line.replace(/[*#]/g, '').trim()}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}

              {modalActiveTab === 'checklist' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5 mb-3">
                    <ListTodo className="w-4 h-4 text-emerald-500" /> Dynamic Packing Checklist
                  </h4>
                  {modalChecklist.length === 0 ? (
                    <p className="text-xs text-slate-400">No packing checklist available for this trip style.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {modalChecklist.map((item, idx) => (
                        <label key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-slate-150 hover:bg-slate-100 transition cursor-pointer select-none bg-white">
                          <input 
                            type="checkbox" 
                            checked={item.packed} 
                            onChange={() => handleToggleChecklist(idx)}
                            className="w-4 h-4 rounded text-blue-600 border-slate-350 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className={`text-xs ${item.packed ? 'line-through text-slate-400 font-medium' : 'text-slate-700 font-bold'}`}>
                            {item.item}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {modalActiveTab === 'weather' && (() => {
                const weather = modalTrip.weather || { temp: '28°C', rain: '10%', wind: '12 km/h', cond: 'Sunny & Warm' };
                return (
                  <div className="space-y-4">
                    <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                      <CloudRain className="w-4 h-4 text-teal-500" /> Real-time Weather Estimates
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl text-center shadow-sm">
                        <Thermometer className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                        <span className="text-[10px] text-slate-500 font-bold block uppercase">Temp</span>
                        <span className="text-base font-black text-orange-700">{weather.temp || '28°C'}</span>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-center shadow-sm">
                        <CloudRain className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                        <span className="text-[10px] text-slate-500 font-bold block uppercase">Rain Chance</span>
                        <span className="text-base font-black text-blue-700">{weather.rain || '10%'}</span>
                      </div>
                      <div className="bg-teal-50 border border-teal-100 p-4 rounded-2xl text-center shadow-sm">
                        <Wind className="w-6 h-6 text-teal-500 mx-auto mb-1" />
                        <span className="text-[10px] text-slate-500 font-bold block uppercase">Wind</span>
                        <span className="text-base font-black text-teal-700">{weather.wind || '12 km/h'}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold text-center bg-white border border-slate-150 py-2.5 rounded-xl shadow-inner">
                      Current Conditions: <strong className="text-slate-800">{weather.cond || 'Sunny & Clear'}</strong>
                    </p>
                  </div>
                );
              })()}

              {modalActiveTab === 'budget' && (() => {
                const isGoa = modalTrip.destination.toLowerCase().includes('goa');
                const stays = isGoa ? 8800 : 15750;
                const transport = isGoa ? 6500 : 12250;
                const activities = isGoa ? 4000 : 7000;
                return (
                  <div className="space-y-4">
                    <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-indigo-500" /> Cost Breakdown Summary ({modalTrip.price})
                    </h4>
                    <div className="space-y-4 pt-2">
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                          <span>🏨 Lodging & Stays (45%)</span>
                          <span>{modalTrip.price.startsWith('₹') ? `₹${stays.toLocaleString()}` : `$${(stays/80).toFixed(0)}`}</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full" style={{ width: '45%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                          <span>✈️ Transports & Flights (35%)</span>
                          <span>{modalTrip.price.startsWith('₹') ? `₹${transport.toLocaleString()}` : `$${(transport/80).toFixed(0)}`}</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-teal-500 h-full rounded-full" style={{ width: '35%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                          <span>🍽️ Foods & Activities (20%)</span>
                          <span>{modalTrip.price.startsWith('₹') ? `₹${activities.toLocaleString()}` : `$${(activities/80).toFixed(0)}`}</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full rounded-full" style={{ width: '20%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {modalActiveTab === 'notes' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-amber-500" /> Notepad & Trip Journal
                  </h4>
                  <textarea 
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    placeholder="Write down flight numbers, reservation codes, local spots, or packing notes..."
                    className="w-full h-40 p-4 border border-amber-200 bg-amber-50/15 rounded-2xl text-slate-800 text-xs focus:ring-2 focus:ring-amber-500 outline-none leading-relaxed shadow-inner"
                  />
                  <div className="flex justify-end pt-1">
                    <button 
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition border-0 cursor-pointer disabled:opacity-50"
                    >
                      {savingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 text-amber-300" />}
                      <span>{savingNotes ? 'Saving journal...' : 'Save Notes'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-150">
              <button 
                onClick={() => {
                  alert('Booking systems initialized! Connecting to regional airline & hotel engines...');
                  setModalTrip(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer text-xs border-0"
              >
                <CheckCircle className="w-4 h-4 text-emerald-250" /> Proceed to Booking
              </button>
              <button 
                onClick={() => setModalTrip(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2.5 rounded-xl transition cursor-pointer text-xs border-0"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

const XCircle = ({ className, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
