require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'iqlipse_travel_agency_secret_key_2026_jwt';

// Helper function to send OTP via Email and SMS
async function sendOtp(email, phone, otp) {
    console.log(`\n==================================================`);
    console.log(`[OTP SYSTEM] Generated OTP: ${otp}`);
    console.log(`[OTP SYSTEM] Sending to Email: ${email}`);
    console.log(`[OTP SYSTEM] Sending to Phone: ${phone}`);
    console.log(`==================================================\n`);

    // 1. Email OTP Sending (Real SMTP if configured, else simulated)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });

            await transporter.sendMail({
                from: `"iQlipse Travel Security" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
                to: email,
                subject: 'Your iQlipse Travel Dashboard Verification Code',
                text: `Your login verification code is: ${otp}. It is valid for 5 minutes.`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                        <h2 style="color: #2563eb; text-align: center;">iQlipse Travel Dashboard</h2>
                        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                        <p>Hello,</p>
                        <p>We received a request to access your iQlipse Travel account. Please use the following One-Time Password (OTP) to complete your login:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; background-color: #f1f5f9; padding: 10px 20px; border-radius: 8px; border: 1px solid #cbd5e1; display: inline-block;">${otp}</span>
                        </div>
                        <p style="color: #64748b; font-size: 14px;">This code is valid for 5 minutes. If you did not initiate this request, please secure your account immediately.</p>
                        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                        <p style="color: #94a3b8; font-size: 12px; text-align: center;">&copy; 2026 iQlipse Travel Inc. All rights reserved.</p>
                    </div>
                `
            });
            console.log(`[OTP SYSTEM] Real Email sent successfully to ${email}`);
        } catch (mailError) {
            console.error('[OTP SYSTEM] Error sending real email:', mailError.message);
        }
    } else {
        console.log(`[OTP SYSTEM] [SIMULATED EMAIL] To: ${email} | Subject: iQlipse Verification Code | Code: ${otp}`);
    }

    // 2. SMS OTP Sending (Twilio if configured, else simulated)
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
        try {
            const twilio = require('twilio');
            const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

            await client.messages.create({
                body: `Your iQlipse Travel dashboard verification code is: ${otp}. Valid for 5 minutes.`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phone
            });
            console.log(`[OTP SYSTEM] Real SMS sent successfully to ${phone}`);
        } catch (smsError) {
            console.error('[OTP SYSTEM] Error sending real SMS:', smsError.message);
        }
    } else {
        console.log(`[OTP SYSTEM] [SIMULATED SMS] To: ${phone} | Body: Your iQlipse Travel dashboard verification code is: ${otp}`);
    }
}


// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from the client/dist production directory
app.use(express.static(path.join(__dirname, 'client', 'dist')));

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
        const { name, email, password, preference, phone } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: 'Name, email, password, and phone number are required.' });
        }

        // Check if user already exists
        const existingUser = db.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        // Check if phone number already exists
        const users = db.getUsers();
        const existingPhone = users.find(u => u.phone === phone);
        if (existingPhone) {
            return res.status(400).json({ message: 'User with this phone number already exists.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save new user
        const newUser = {
            id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name,
            email,
            phone,
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
                phone: newUser.phone,
                preference: newUser.preference
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error during registration.' });
    }
});

// User Login - Generates and sends OTP
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body; // 'email' field can contain email or phone number

        if (!email || !password) {
            return res.status(400).json({ message: 'Email/Phone and password are required.' });
        }

        const identifier = email.trim();
        // Find user by email or phone
        const user = db.getUserByEmail(identifier) || db.getUsers().find(u => u.phone === identifier);
        if (!user) {
            return res.status(400).json({ message: 'Invalid email/phone or password.' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email/phone or password.' });
        }

        // Generate 6-digit OTP code
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP with 5 mins expiration
        user.otp = {
            code: otpCode,
            expiresAt: Date.now() + 5 * 60 * 1000
        };
        db.saveUser(user);

        // Trigger SMS and Email sending asynchronously
        sendOtp(user.email, user.phone || 'Not Provided', otpCode).catch(err => {
            console.error('Error in sendOtp:', err);
        });

        // Return confirmation + phone details. Include demoOtp for easy testing
        res.status(200).json({
            message: 'OTP sent to your registered email and phone number.',
            requireOtp: true,
            email: user.email,
            phone: user.phone || 'Not Provided',
            demoOtp: otpCode
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error during login.' });
    }
});

// Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP code are required.' });
        }

        const user = db.getUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'User not found.' });
        }

        if (!user.otp || user.otp.code !== otp) {
            return res.status(400).json({ message: 'Invalid OTP code. Please try again.' });
        }

        if (Date.now() > user.otp.expiresAt) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        // Clean up OTP after success
        delete user.otp;
        db.saveUser(user);

        // Generate final JWT token
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
                phone: user.phone || '',
                preference: user.preference
            }
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Internal server error during verification.' });
    }
});

// Resend OTP
app.post('/api/auth/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        const user = db.getUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'User not found.' });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = {
            code: otpCode,
            expiresAt: Date.now() + 5 * 60 * 1000
        };
        db.saveUser(user);

        sendOtp(user.email, user.phone || 'Not Provided', otpCode).catch(err => {
            console.error('Error in sendOtp:', err);
        });

        res.status(200).json({
            message: 'A new OTP has been sent to your registered email and phone number.',
            email: user.email,
            phone: user.phone || 'Not Provided',
            demoOtp: otpCode
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ message: 'Internal server error while resending OTP.' });
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

// Helper functions for checklist & weather
function getDefaultPackingChecklist(type) {
    const style = (type || '').toLowerCase();
    if (style.includes('beach')) {
        return [
            { item: 'Swimwear & Beach towel', packed: false },
            { item: 'Sunscreen (SPF 50+)', packed: false },
            { item: 'Sunglasses & Sun hat', packed: false },
            { item: 'Waterproof phone pouch', packed: false },
            { item: 'Flip flops & Light clothes', packed: false },
            { item: 'Power bank & Charger', packed: false }
        ];
    } else if (style.includes('mountain') || style.includes('hiking')) {
        return [
            { item: 'Trekking boots & Thick socks', packed: false },
            { item: 'Windbreaker / Warm jacket', packed: false },
            { item: 'Refillable water flask', packed: false },
            { item: 'First aid kit & Bug spray', packed: false },
            { item: 'Flashlight or Headlamp', packed: false },
            { item: 'Backpack rain cover', packed: false }
        ];
    } else if (style.includes('adventure')) {
        return [
            { item: 'Comfortable sport shoes', packed: false },
            { item: 'Active wear & Quick-dry towels', packed: false },
            { item: 'Hydration bladder pack', packed: false },
            { item: 'Universal adapters & Chargers', packed: false },
            { item: 'Personal identification & Cash', packed: false },
            { item: 'Pocket knife / Multi-tool', packed: false }
        ];
    } else { // City / General / Family / Solo
        return [
            { item: 'Comfortable walking sneakers', packed: false },
            { item: 'Camera or Smartphone', packed: false },
            { item: 'Light umbrella or Rain coat', packed: false },
            { item: 'City map / Offline guide app', packed: false },
            { item: 'Hand sanitizer & Face mask', packed: false },
            { item: 'Credit cards & Local currency', packed: false }
        ];
    }
}

function getDefaultWeather(destination) {
    const dest = (destination || '').toLowerCase();
    if (dest.includes('goa') || dest.includes('bali') || dest.includes('maldives') || dest.includes('santorini')) {
        return { temp: '30°C', rain: '10%', wind: '14 km/h', cond: 'Sunny & Warm' };
    } else if (dest.includes('swiss') || dest.includes('banff') || dest.includes('mountain')) {
        return { temp: '12°C', rain: '25%', wind: '18 km/h', cond: 'Chilly & Clear' };
    } else if (dest.includes('paris') || dest.includes('tokyo') || dest.includes('york')) {
        return { temp: '19°C', rain: '40%', wind: '9 km/h', cond: 'Partly Cloudy' };
    }
    return { temp: '22°C', rain: '20%', wind: '10 km/h', cond: 'Clear Sky' };
}

// Save Itinerary / Book Trip
app.post('/api/trips', authenticateToken, (req, res) => {
    try {
        const { destination, checkIn, checkOut, duration, price, type, rating, itinerary, sourceCity, travelType, packingChecklist, weather, notes } = req.body;

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
            sourceCity: sourceCity || '',
            travelType: travelType || type || 'General',
            packingChecklist: packingChecklist || getDefaultPackingChecklist(travelType || type),
            weather: weather || getDefaultWeather(destination),
            notes: notes || '',
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

// Update Trip Notes / Checklist / Itinerary
app.put('/api/trips/:id', authenticateToken, (req, res) => {
    try {
        const tripId = req.params.id;
        const userId = req.user.id;
        const { notes, packingChecklist, itinerary } = req.body;

        const trips = db.getTrips(userId);
        const existingTrip = trips.find(t => t.id === tripId);
        
        if (!existingTrip) {
            return res.status(404).json({ message: 'Trip not found.' });
        }

        if (notes !== undefined) existingTrip.notes = notes;
        if (packingChecklist !== undefined) existingTrip.packingChecklist = packingChecklist;
        if (itinerary !== undefined) existingTrip.itinerary = itinerary;

        db.saveTrip(existingTrip);

        res.status(200).json({
            message: 'Trip updated successfully.',
            trip: existingTrip
        });
    } catch (error) {
        console.error('Error updating trip:', error);
        res.status(500).json({ message: 'Failed to update trip.' });
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

// ==================== AI CHAT CONCIERGE API ==================// Intelligent Chat Engine rules
function generateAiReply(message, destName, userPreference) {
    const msg = message.toLowerCase();
    const dest = destName || 'your travel adventure';
    
    // Goa / specific budget check
    if (msg.includes('goa') || (msg.includes('trip') && msg.includes('goa'))) {
        return `Here is a custom **Goa Adventure Itinerary** under ₹20,000 for 5 days:
        
* **Day 1: Arrival & North Goa Beaches**
  - Stay at: **Horizon Beach Resort** (Budget, ₹2,200/night)
  - Activity: Explore Calangute & Baga beach. Enjoy the sunset and shacks.
* **Day 2: Water Sports & Adventure**
  - Activity: Scuba diving or jet skiing at Anjuna. Dinner at Curlies.
* **Day 3: South Goa Cultural Tour**
  - Activity: Visit Old Goa Churches (Basilica of Bom Jesus), Mangueshi Temple.
* **Day 4: Dudhsagar Waterfalls Trek**
  - Activity: Day trek to the waterfalls, jeep safari.
* **Day 5: Spice Plantation Tour & Departure**
  - Activity: Visit Sahakari Spice Farm, lunch, and transfer to airport.

* **Recommended Hotels:**
  1. **Horizon Beach Resort** (Budget, 4.4★, ₹2,200/night) - Close to Calangute beach.
  2. **Goa Palms Villa** (Comfort, 4.6★, ₹4,500/night) - With swimming pool and garden.
  
* **Recommended Attractions:** Calangute Beach, Anjuna Water Sports, Old Goa Churches, Dudhsagar Waterfalls, Sahakari Spice Farm.

* **Estimated Cost Breakdown:**
  - Transport & Train/Flight: ₹6,500
  - Hotel Stays: ₹8,800
  - Food & Activities: ₹4,000
  - Total Package: ₹19,300 (Fully within your ₹20,000 budget!)
  
* **Best Visiting Time:** November to February (Pleasant winter weather with clear skies).
* **Weather Forecast:** 28°C · Rain: 5% · Wind: 10 km/h`;
    }

    // Generic Planner Query parser: "Plan a X-day trip to Y under Z" or prompt with budget/days
    if (msg.includes('plan a') || msg.includes('trip to') || msg.includes('days') || msg.includes('budget') || msg.includes('under') || msg.includes('₹') || msg.includes('$')) {
        let destination = destName || 'your destination';
        
        // Extract destination name
        const destMatch = msg.match(/(?:to|visit)\s+([a-zA-Z\s,]+)(?:\s+under|\s+for|\s+budget|$)/i);
        if (destMatch && destMatch[1]) {
            const tempDest = destMatch[1].trim();
            if (tempDest.length > 2) destination = tempDest;
        }

        // Extract days
        let days = 3;
        const dayMatch = msg.match(/(\d+)\s*-?\s*day/i);
        if (dayMatch && dayMatch[1]) {
            days = parseInt(dayMatch[1]);
        }
        
        // Extract budget
        let budget = '₹25,000';
        const budgetMatch = msg.match(/(under|budget|₹|rs\.?|\$)\s*([\d,]+)/i);
        if (budgetMatch && budgetMatch[2]) {
            const currency = msg.includes('$') ? '$' : '₹';
            budget = currency + budgetMatch[2];
        }

        let itineraryDays = '';
        for (let i = 1; i <= days; i++) {
            itineraryDays += `* **Day ${i}: Explore & Local Highlights**
  - Stay at: Recommended Local Inn
  - Activity: Morning breakfast walk, cultural heritage sightseeing, and evening food tour.\n`;
        }

        return `Here is your customized **${days}-Day Action Plan** for **${destination}** under **${budget}**:
        
${itineraryDays}
* **Recommended Hotels:**
  1. **Standard Comfort Inn** (Comfort, 4.5★, Budget-optimized)
  2. **The Grand Oasis Resort** (Luxury, 4.8★, Premium features)

* **Recommended Attractions:** Local cultural hotspots, central museum, scenic viewing points, and botanical gardens.

* **Estimated Cost Breakdown:**
  - Lodging & Stays (45%): Optimized for budget
  - Transport & Flights (35%): Standard transfers
  - Food & Activities (20%): Dining & local tours
  - Estimated Total: ${budget} (Fully Balanced)

* **Best Visiting Time:** Spring or Autumn for pleasant sightseeing conditions.
* **Weather Forecast:** 24°C · Rain: 12% · Wind: 9 km/h`;
    }
    
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
 
* **Estimated Cost Breakdown:**
  - Lodging: 40%
  - Flights/Transports: 35%
  - Dining & Local tours: 25%
  - Estimated Total: $850 (Fully Optimized)

* **Best Visiting Time:** Spring or Autumn.
* **Weather Forecast:** 21°C · Rain: 15% · Wind: 10 km/h

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

// Catch-all route to serve React client index.html for undefined routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` Travel with iQlipse backend running successfully!`);
    console.log(` Local URL: http://localhost:${PORT}`);
    console.log(`===============================================`);
});