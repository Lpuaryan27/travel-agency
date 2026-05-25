require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'iqlipse_travel_agency_secret_key_2026_jwt';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from the workspace directory
app.use(express.static(path.join(__dirname)));

// JWT Verification Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Access denied. Token missing.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }
        req.user = user;
        next();
    });
}

// ==================== AUTHENTICATION API ====================

// User Signup
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password, preference } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        // Check if user already exists
        const existingUser = db.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save new user
        const newUser = {
            id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name,
            email,
            password: hashedPassword,
            preference: preference || 'General',
            createdAt: new Date().toISOString()
        };

        db.saveUser(newUser);

        res.status(201).json({
            message: 'User registered successfully.',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                preference: newUser.preference
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error during registration.' });
    }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Find user
        const user = db.getUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Login successful.',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                preference: user.preference
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error during login.' });
    }
});

// Get User Profile
app.get('/api/user/profile', authenticateToken, (req, res) => {
    const user = db.getUserById(req.user.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            preference: user.preference,
            createdAt: user.createdAt
        }
    });
});

// ==================== TRIPS & ITINERARIES API ====================

// Get Saved Trips
app.get('/api/trips', authenticateToken, (req, res) => {
    try {
        const trips = db.getTrips(req.user.id);
        res.status(200).json({ trips });
    } catch (error) {
        console.error('Error fetching trips:', error);
        res.status(500).json({ message: 'Failed to fetch saved trips.' });
    }
});

// Save Itinerary / Book Trip
app.post('/api/trips', authenticateToken, (req, res) => {
    try {
        const { destination, checkIn, checkOut, duration, price, type, rating, itinerary } = req.body;

        if (!destination) {
            return res.status(400).json({ message: 'Destination is required.' });
        }

        const newTrip = {
            id: 'trip_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            userId: req.user.id,
            destination,
            checkIn: checkIn || '',
            checkOut: checkOut || '',
            duration: duration || 'Custom',
            price: price || '$0',
            type: type || 'Custom',
            rating: rating || 5.0,
            itinerary: itinerary || '',
            createdAt: new Date().toISOString()
        };

        db.saveTrip(newTrip);

        res.status(201).json({
            message: 'Trip saved successfully.',
            trip: newTrip
        });
    } catch (error) {
        console.error('Error saving trip:', error);
        res.status(500).json({ message: 'Failed to save trip.' });
    }
});

// Delete Saved Trip
app.delete('/api/trips/:id', authenticateToken, (req, res) => {
    try {
        db.deleteTrip(req.params.id, req.user.id);
        res.status(200).json({ message: 'Trip deleted successfully.' });
    } catch (error) {
        console.error('Error deleting trip:', error);
        res.status(500).json({ message: 'Failed to delete trip.' });
    }
});

// ==================== AI CHAT CONCIERGE API ====================

// Intelligent Chat Engine rules
function generateAiReply(message, destName, userPreference) {
    const msg = message.toLowerCase();
    const dest = destName || 'your travel adventure';
    
    // Custom replies depending on keyword triggers
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
        return `Hello! I'm your iQlipse AI Travel Concierge. I specialize in crafting vacations. How can I assist you with planning your trip to **${dest}** today?`;
    }
    
    if (msg.includes('itinerary') || msg.includes('plan') || msg.includes('schedule') || msg.includes('day by day')) {
        return `Here is a custom **3-Day Action Plan** for **${dest}** tailored for a **${userPreference}** traveler:
        
* **Day 1: Arrival & Local Flavor** 
  - Morning: Arrive in style, check into your boutique accommodations.
  - Afternoon: Guided orientation tour of the iconic landmarks, capturing beautiful photographs.
  - Evening: Dinner at a highly rated local tavern, tasting signature dishes.
* **Day 2: Deep Exploration**
  - Morning: Visit local cultural spots (temples, museums, or coastal cliffs depending on destination).
  - Afternoon: Participatory adventure activity (hiking, cooking class, or historic walking tour).
  - Evening: Relax at a sunset viewpoint followed by fine dining.
* **Day 3: Hidden Gems & Departure**
  - Morning: Off-the-beaten-path excursion away from crowds.
  - Afternoon: Souvenir shopping, exploring local craft markets, and final café stop.
  - Evening: Prepare for departure.

*Would you like to lock this itinerary and save it to your trips?*`;
    }
    
    if (msg.includes('hotel') || msg.includes('stay') || msg.includes('resort') || msg.includes('hostel')) {
        return `For your trip to **${dest}**, here are our top AI-recommended accommodations based on guest reviews:
        
1. **The iQlipse Grand Resort** (Luxury, 5★) - Overlooking key vistas with private pools and full spa.
2. **Horizon Eco-Lodge** (Mid-range, 4.6★) - Sustainable, beautifully integrated, and close to nature.
3. **Urban Nest Suites** (Budget/Boutique, 4.4★) - Excellent walkability score, clean rooms, and free local tours.

Would you like me to check average nightly rates or check-in options for your dates?`;
    }
    
    if (msg.includes('budget') || msg.includes('cost') || msg.includes('price') || msg.includes('cheap')) {
        return `Planning a budget for **${dest}** is easy! Here is a rough daily breakdown:
        
* **Economy Plan**: $90 - $130 / day (budget stays, local transit, street dining).
* **Comfort Plan**: $180 - $280 / day (3-4 star hotels, rental car/taxis, mid-tier restaurants).
* **Luxury Plan**: $500+ / day (5-star resorts, private guided tours, fine dining).

Let me know your target budget, and I can generate an itinerary that matches it exactly!`;
    }

    if (msg.includes('food') || msg.includes('eat') || msg.includes('restaurant') || msg.includes('dish')) {
        return `Food is one of the best parts of exploring **${dest}**! Don't miss these authentic dishes:
        
* **Signature Dish**: Ask for the local specialty at native family restaurants.
* **Desserts**: Sample standard street market sweets.
* **Drinks**: Enjoy locally harvested beverages.

I can compile a custom food tour itinerary for you. Do you have any dietary restrictions?`;
    }
    
    if (msg.includes('weather') || msg.includes('best time') || msg.includes('season')) {
        return `The absolute best time to explore **${dest}** is during the shoulder season (spring or autumn), when temperatures are moderate, flights are cheaper, and landmarks are less crowded. 
        
Would you like a month-by-month temperature review?`;
    }
    
    // Default reply
    return `That sounds like an amazing plan! **${dest}** has so much to offer. As your AI Travel Assistant, I can help you secure hotel deals, coordinate travel dates, or compile custom activity guides. 
    
Tell me: how many days are you planning to visit, and what activities sound the most fun to you?`;
}

// Chat API Endpoint
app.post('/api/chat', authenticateToken, (req, res) => {
    try {
        const { message, destName } = req.body;
        const userId = req.user.id;

        if (!message) {
            return res.status(400).json({ message: 'Message is required.' });
        }

        // Get user for preference
        const user = db.getUserById(userId);
        const preference = user ? user.preference : 'General';

        // Get existing chat or empty array
        const chatHistory = db.getChatHistory(userId, destName) || { messages: [] };
        
        // Add user message
        const userMsg = {
            sender: 'user',
            text: message,
            timestamp: new Date().toISOString()
        };
        chatHistory.messages.push(userMsg);

        // Generate AI reply
        const replyText = generateAiReply(message, destName, preference);
        const aiMsg = {
            sender: 'ai',
            text: replyText,
            timestamp: new Date().toISOString()
        };
        chatHistory.messages.push(aiMsg);

        // Save back to DB
        db.saveChatHistory(userId, chatHistory.messages, destName);

        res.status(200).json({
            reply: replyText,
            history: chatHistory.messages
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ message: 'Chat engine failed.' });
    }
});

// Fetch Chat History
app.get('/api/chat/history', authenticateToken, (req, res) => {
    try {
        const { destName } = req.query;
        const chats = db.getChatHistory(req.user.id, destName);
        res.status(200).json({ chat: chats || { messages: [] } });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ message: 'Failed to fetch chat logs.' });
    }
});

// Catch-all route to serve tavel.html (homepage) for undefined routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'tavel.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` Travel with iQlipse backend running successfully!`);
    console.log(` Local URL: http://localhost:${PORT}`);
    console.log(`===============================================`);
});