import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin, Tag, Clock, Compass, Star, Sparkles, Headset, XCircle, Heart, CloudRain, Thermometer, Wind } from 'lucide-react';

const destinations = [
  { 
    id: 1, name: "Bali, Indonesia", type: "beach", lat: -8.4095, lng: 115.1889, 
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&auto=format", 
    description: "Lush jungles, stunning rice terraces, vibrant culture, and world-class surf breaks.", 
    price: "$899", duration: "7-14 days", rating: 4.9,
    weather: { temp: "29°C", rain: "15%", wind: "12 km/h", cond: "Tropical Humid" },
    hotels: [
      { name: "The Bali Grand Oasis", latOffset: 0.03, lngOffset: -0.02 },
      { name: "Seminyak Coco Lodge", latOffset: -0.02, lngOffset: 0.04 }
    ],
    attractions: [
      { name: "Ubud Monkey Forest", latOffset: 0.05, lngOffset: 0.01 },
      { name: "Tanah Lot Sea Temple", latOffset: -0.04, lngOffset: -0.03 }
    ]
  },
  { 
    id: 2, name: "Paris, France", type: "city", lat: 48.8566, lng: 2.3522, 
    image: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600&auto=format", 
    description: "The City of Light: Eiffel Tower, Louvre, charming cafés, and romantic Seine cruises.", 
    price: "$1,299", duration: "5-7 days", rating: 4.8,
    weather: { temp: "18°C", rain: "35%", wind: "8 km/h", cond: "Partly Cloudy" },
    hotels: [
      { name: "Hotel Eiffel Splendide", latOffset: 0.01, lngOffset: -0.015 },
      { name: "Boutique Le Marais Stay", latOffset: 0.005, lngOffset: 0.02 }
    ],
    attractions: [
      { name: "Louvre Art Museum", latOffset: 0.001, lngOffset: 0.008 },
      { name: "Arc de Triomphe", latOffset: 0.009, lngOffset: -0.02 }
    ]
  },
  { 
    id: 3, name: "Swiss Alps, Switzerland", type: "mountain", lat: 46.7986, lng: 8.2320, 
    image: "https://images.unsplash.com/photo-1476231682828-37e571bc172f?w=600&auto=format", 
    description: "Breathtaking peaks, scenic train rides, skiing, and charming alpine villages.", 
    price: "$1,499", duration: "7-10 days", rating: 4.9,
    weather: { temp: "10°C", rain: "20%", wind: "16 km/h", cond: "Chilly & Sunny" },
    hotels: [
      { name: "Alps Ridge Eco Lodge", latOffset: 0.02, lngOffset: -0.03 },
      { name: "Chalet Summit Village", latOffset: -0.015, lngOffset: 0.01 }
    ],
    attractions: [
      { name: "Matterhorn Peak viewpoint", latOffset: 0.04, lngOffset: -0.02 },
      { name: "Zermatt Glacier Hiking trail", latOffset: -0.025, lngOffset: 0.03 }
    ]
  },
  { 
    id: 4, name: "Santorini, Greece", type: "beach", lat: 36.3932, lng: 25.4615, 
    image: "https://images.unsplash.com/photo-1533107862482-0e6974b06ec4?w=600&auto=format", 
    description: "Iconic white & blue domes, volcanic beaches, and unforgettable sunsets.", 
    price: "$1,199", duration: "5-7 days", rating: 4.9,
    weather: { temp: "26°C", rain: "5%", wind: "14 km/h", cond: "Sunny Breeze" },
    hotels: [
      { name: "Caldera Cliff Resort", latOffset: 0.01, lngOffset: -0.01 },
      { name: "Oia Sunset Suites", latOffset: 0.025, lngOffset: 0.005 }
    ],
    attractions: [
      { name: "Akrotiri Ancient Ruins", latOffset: -0.03, lngOffset: -0.015 },
      { name: "Red Beach Trail", latOffset: -0.02, lngOffset: 0.02 }
    ]
  },
  { 
    id: 5, name: "Tokyo, Japan", type: "city", lat: 35.6762, lng: 139.6503, 
    image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&auto=format", 
    description: "Futuristic city meets ancient temples, incredible sushi, and vibrant pop culture.", 
    price: "$1,599", duration: "7-10 days", rating: 4.9,
    weather: { temp: "22°C", rain: "25%", wind: "10 km/h", cond: "Clear Skies" },
    hotels: [
      { name: "Shibuya Sky Tower Hotel", latOffset: -0.01, lngOffset: -0.02 },
      { name: "The Asakusa Heritage Inn", latOffset: 0.03, lngOffset: 0.02 }
    ],
    attractions: [
      { name: "Senso-ji Temple grounds", latOffset: 0.035, lngOffset: 0.025 },
      { name: "Meiji Jingu Shrine forest", latOffset: -0.005, lngOffset: -0.03 }
    ]
  },
  { 
    id: 6, name: "Patagonia, Chile", type: "adventure", lat: -51.6226, lng: -72.3407, 
    image: "https://images.unsplash.com/photo-1582972236019-ea9eaf1f6ddb?w=600&auto=format", 
    description: "Glaciers, jagged mountains, pristine lakes – a trekker's paradise.", 
    price: "$1,899", duration: "10-14 days", rating: 4.8,
    weather: { temp: "8°C", rain: "45%", wind: "24 km/h", cond: "Windy / Cold" },
    hotels: [
      { name: "Patagonia Vista Lodge", latOffset: 0.04, lngOffset: -0.04 },
      { name: "EcoCamp Dome Village", latOffset: -0.03, lngOffset: 0.02 }
    ],
    attractions: [
      { name: "Torres del Paine Peak", latOffset: 0.01, lngOffset: 0.01 },
      { name: "Grey Glacier lookout", latOffset: -0.02, lngOffset: -0.05 }
    ]
  },
  { 
    id: 12, name: "Goa, India", type: "beach", lat: 15.2993, lng: 74.1240, 
    image: "https://images.unsplash.com/photo-1512916193707-4527e406f56b?w=600&auto=format", 
    description: "Golden sand beaches, active night life, water sports, historic churches, and spice farms.", 
    price: "₹19,300", duration: "5 days", rating: 4.8,
    weather: { temp: "30°C", rain: "10%", wind: "9 km/h", cond: "Sunny & Pleasant" },
    hotels: [
      { name: "Horizon Beach Resort (Goa)", latOffset: 0.02, lngOffset: -0.02 },
      { name: "Goa Palms Villa", latOffset: -0.03, lngOffset: 0.03 }
    ],
    attractions: [
      { name: "Basilica of Bom Jesus (Old Goa)", latOffset: 0.05, lngOffset: -0.01 },
      { name: "Anjuna Beach Water Sports", latOffset: 0.03, lngOffset: -0.04 }
    ]
  }
];

export default function MapView({ onOpenChatContext }) {
  const navigate = useNavigate();
  const { token, user, isAuthenticated, fetchWithAuth } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const [selectedDest, setSelectedDest] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [savingTrip, setSavingTrip] = useState(false);

  // Get Custom SVG Leaflet Icon based on category
  const getMarkerIcon = (type) => {
    const iconColors = {
      beach: '#3B82F6',
      mountain: '#10B981',
      city: '#F59E0B',
      adventure: '#8B5CF6'
    };
    const color = iconColors[type] || '#3B82F6';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="30" height="36">
        <path fill="${color}" stroke="#fff" stroke-width="1.5" d="M12 0C5.4 0 0 5.4 0 12c0 7.5 12 24 12 24s12-16.5 12-24c0-6.6-5.4-12-12-12z"/>
        <circle fill="#fff" cx="12" cy="12" r="4"/>
    </svg>`;
    return L.icon({
      iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
      iconSize: [28, 36],
      iconAnchor: [14, 36],
      popupAnchor: [0, -30]
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      const map = L.map(mapContainerRef.current).setView([20, 10], 2);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CartoDB',
        subdomains: 'abcd',
        maxZoom: 19,
        minZoom: 2
      }).addTo(map);

      mapRef.current = map;
    }

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Sync Markers & Filters
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Filtered list
    const filtered = destinations.filter(d => filterType === 'all' || d.type === filterType);

    // Render new markers
    filtered.forEach(dest => {
      const marker = L.marker([dest.lat, dest.lng], { icon: getMarkerIcon(dest.type) });
      
      marker.bindPopup(`
        <div style="font-family: inherit; min-width: 180px;">
          <h4 style="font-weight: 850; font-size: 0.9rem; margin-bottom: 2px; color: #0f172a;">${dest.name}</h4>
          <p style="font-size: 0.7rem; color: #64748b; margin-bottom: 6px;">${dest.type.toUpperCase()} · ${dest.price}</p>
        </div>
      `);

      marker.on('click', () => {
        setSelectedDest(dest);
        mapRef.current.flyTo([dest.lat, dest.lng], 7, { duration: 1.0 });
      });

      marker.addTo(mapRef.current);
      markersRef.current.push(marker);
    });
  }, [filterType]);

  // Handle URL searches
  useEffect(() => {
    const query = searchParams.get('search');
    if (query && mapRef.current) {
      setSearchText(query);
      const found = destinations.find(d => d.name.toLowerCase().includes(query.toLowerCase()));
      if (found) {
        setSelectedDest(found);
        mapRef.current.flyTo([found.lat, found.lng], 7, { duration: 1.2 });
      }
    }
  }, [searchParams]);

  // Selected Destination Sub-Markers (Hotels & Attractions)
  const subMarkersRef = useRef([]);
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old sub-markers
    subMarkersRef.current.forEach(m => m.remove());
    subMarkersRef.current = [];

    if (!selectedDest) return;

    // Render hotels
    if (selectedDest.hotels) {
      selectedDest.hotels.forEach(hotel => {
        const hotelLat = selectedDest.lat + hotel.latOffset;
        const hotelLng = selectedDest.lng + hotel.lngOffset;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#0284c7" stroke="#fff" stroke-width="1.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>`;
        const icon = L.icon({
          iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
          iconSize: [24, 24],
          iconAnchor: [12, 24],
          popupAnchor: [0, -20]
        });
        const marker = L.marker([hotelLat, hotelLng], { icon })
          .bindPopup(`<div style="font-family: inherit; font-size: 11px; font-weight: bold; color: #0284c7;">🏨 Hotel: ${hotel.name}</div>`)
          .addTo(mapRef.current);
        subMarkersRef.current.push(marker);
      });
    }

    // Render attractions
    if (selectedDest.attractions) {
      selectedDest.attractions.forEach(attr => {
        const attrLat = selectedDest.lat + attr.latOffset;
        const attrLng = selectedDest.lng + attr.lngOffset;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#ea580c" stroke="#fff" stroke-width="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>`;
        const icon = L.icon({
          iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
          iconSize: [24, 24],
          iconAnchor: [12, 24],
          popupAnchor: [0, -20]
        });
        const marker = L.marker([attrLat, attrLng], { icon })
          .bindPopup(`<div style="font-family: inherit; font-size: 11px; font-weight: bold; color: #ea580c;">⭐ Attraction: ${attr.name}</div>`)
          .addTo(mapRef.current);
        subMarkersRef.current.push(marker);
      });
    }
  }, [selectedDest]);

  // Clean sub-markers on unmount
  useEffect(() => {
    return () => {
      subMarkersRef.current.forEach(m => m.remove());
    };
  }, []);

  const handleToggleFavorite = () => {
    if (!selectedDest) return;
    let favs = [];
    try {
      const stored = localStorage.getItem('favorites');
      favs = stored ? JSON.parse(stored) : [];
    } catch (e) {}

    if (favs.includes(selectedDest.name)) {
      favs = favs.filter(f => f !== selectedDest.name);
      alert(`${selectedDest.name} removed from favorites.`);
    } else {
      favs.push(selectedDest.name);
      alert(`${selectedDest.name} added to favorites! Visit your Dashboard to view them.`);
    }
    localStorage.setItem('favorites', JSON.stringify(favs));
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!searchText.trim()) return;
    setSearchParams({ search: searchText.trim() });
  };

  const handleSaveItinerary = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to save itineraries directly to your account!');
      navigate('/login');
      return;
    }

    if (!selectedDest) return;

    setSavingTrip(true);
    try {
      // Step 1: Query AI Chat to generate detailed itinerary
      const prompt = `Generate a detailed 3-day travel itinerary for ${selectedDest.name} with a ${user.preference || 'General'} theme and Comfort Plan budget. Output in structured markdown with day-by-day highlights.`;
      
      const chatRes = await fetchWithAuth('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: prompt,
          destName: selectedDest.name
        })
      });
      const chatData = await chatRes.json();
      if (!chatRes.ok) throw new Error(chatData.message || 'Itinerary generation failed.');

      // Step 2: Post to Save Trip API
      const today = new Date();
      const checkInDate = new Date(today.setDate(today.getDate() + 14)).toISOString().split('T')[0];
      const checkOutDate = new Date(today.setDate(today.getDate() + 3)).toISOString().split('T')[0];

      const saveRes = await fetchWithAuth('/api/trips', {
        method: 'POST',
        body: JSON.stringify({
          destination: selectedDest.name,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          duration: '3 Days',
          price: '$850',
          type: user.preference || 'General Explorer',
          rating: selectedDest.rating,
          itinerary: chatData.reply
        })
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.message || 'Failed to save trip.');

      alert(`Successfully generated and saved a customized 3-day itinerary for ${selectedDest.name} to your dashboard!`);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert(`Error saving trip: ${err.message}`);
    } finally {
      setSavingTrip(false);
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'beach', label: '🏖️ Beach' },
    { value: 'mountain', label: '⛰️ Mountain' },
    { value: 'city', label: '🏙️ City' },
    { value: 'adventure', label: '🧗 Adventure' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex flex-col gap-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-xl pt-24">
        <div>
          <h1 className="text-3xl font-extrabold mb-1">Explore Your Next Adventure</h1>
          <p className="text-blue-100">Click on any marker to discover travel details, generate AI itineraries, and chat with experts.</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="bg-white hover:bg-slate-100 text-indigo-700 font-bold px-5 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2 self-start md:self-auto text-sm cursor-pointer">
          📂 View Saved Trips
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-stretch min-h-[580px]">
        {/* Map Container */}
        <div className="lg:w-2/3 w-full rounded-2xl overflow-hidden shadow-lg bg-white border border-slate-200 flex flex-col min-h-[450px] lg:min-h-0">
          <div ref={mapContainerRef} className="flex-grow w-full h-full" style={{ minHeight: '480px', zIndex: 1 }}></div>
        </div>

        {/* Side Panel */}
        <div className="lg:w-1/3 w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-5 flex flex-col justify-between glass-panel">
          <div className="flex flex-col">
            {/* Search & Filter */}
            <div className="mb-4">
              <form onSubmit={handleSearch} className="relative mb-3">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search destination (e.g. Bali, Paris)..." 
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white/50 text-sm shadow-sm text-slate-800"
                />
              </form>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs font-bold text-slate-500 mr-1 self-center uppercase tracking-wider">Filter:</span>
                {filterOptions.map((opt) => (
                  <button 
                    key={opt.value}
                    onClick={() => {
                      setFilterType(opt.value);
                      setSelectedDest(null);
                    }}
                    className={`px-3 py-1 text-xs rounded-full font-semibold transition cursor-pointer ${
                      filterType === opt.value 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Empty State */}
            {!selectedDest && (
              <div className="flex flex-col items-center justify-center text-center py-16 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                <Globe className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
                <p className="text-slate-600 font-bold">Select a destination on the map</p>
                <p className="text-slate-400 text-xs mt-1">Click any pin for dynamic details & deals</p>
              </div>
            )}

            {/* Details Panel */}
            {selectedDest && (
              <div className="flex flex-col animate-fade-in">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">{selectedDest.name}</h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleToggleFavorite}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition border-0 cursor-pointer"
                      title="Favorite Place"
                    >
                      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    </button>
                    <button 
                      onClick={() => setSelectedDest(null)}
                      className="text-slate-400 hover:text-red-500 transition cursor-pointer border-0 bg-transparent"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <img src={selectedDest.image} alt={selectedDest.name} className="w-full h-40 object-cover rounded-xl shadow-sm mb-3" />
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{selectedDest.description}</p>
                
                {/* Weather widget inside map detail panel */}
                {selectedDest.weather && (
                  <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-2xl mb-4 grid grid-cols-3 gap-2 text-center text-[10px] shadow-sm">
                    <div>
                      <Thermometer className="w-4 h-4 text-orange-500 mx-auto mb-0.5" />
                      <span className="text-slate-400 block font-semibold uppercase">Temp</span>
                      <strong className="text-slate-700">{selectedDest.weather.temp}</strong>
                    </div>
                    <div>
                      <CloudRain className="w-4 h-4 text-blue-500 mx-auto mb-0.5" />
                      <span className="text-slate-400 block font-semibold uppercase">Rain</span>
                      <strong className="text-slate-700">{selectedDest.weather.rain}</strong>
                    </div>
                    <div>
                      <Wind className="w-4 h-4 text-teal-500 mx-auto mb-0.5" />
                      <span className="text-slate-400 block font-semibold uppercase">Wind</span>
                      <strong className="text-slate-700">{selectedDest.weather.wind}</strong>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 text-xs font-semibold">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Tag className="w-4 h-4 text-emerald-500" />
                    <span>Price: {selectedDest.price}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>Duration: {selectedDest.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Compass className="w-4 h-4 text-indigo-500" />
                    <span className="capitalize">Type: {selectedDest.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Rating: {selectedDest.rating} ★</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions panel */}
          {selectedDest && (
            <div className="flex flex-col gap-2 mt-4">
              <button 
                onClick={handleSaveItinerary}
                disabled={savingTrip}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${savingTrip ? 'animate-spin' : ''}`} />
                <span>{savingTrip ? 'Creating AI Itinerary...' : 'Plan & Save to Dashboard'}</span>
              </button>
              <button 
                onClick={() => onOpenChatContext(selectedDest.name)}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Headset className="w-4 h-4" />
                <span>Ask AI Concierge</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
