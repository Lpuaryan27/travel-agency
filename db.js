const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure db directory and file exist
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

if (!fs.existsSync(DB_FILE)) {
    const initialData = {
        users: [],
        trips: [],
        chats: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
}

// Read database
function readDb() {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading database:', error);
        return { users: [], trips: [], chats: [] };
    }
}

// Write database
function writeDb(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing database:', error);
        return false;
    }
}

module.exports = {
    // User Operations
    getUsers: () => readDb().users,
    
    getUserByEmail: (email) => {
        const users = readDb().users;
        return users.find(u => u.email.toLowerCase() === email.toLowerCase());
    },
    
    getUserById: (id) => {
        const users = readDb().users;
        return users.find(u => u.id === id);
    },
    
    saveUser: (user) => {
        const db = readDb();
        const existingIndex = db.users.findIndex(u => u.id === user.id);
        
        if (existingIndex !== -1) {
            db.users[existingIndex] = user;
        } else {
            db.users.push(user);
        }
        writeDb(db);
        return user;
    },

    // Trip Operations
    getTrips: (userId) => {
        const trips = readDb().trips;
        return trips.filter(t => t.userId === userId);
    },
    
    saveTrip: (trip) => {
        const db = readDb();
        const existingIndex = db.trips.findIndex(t => t.id === trip.id);
        
        if (existingIndex !== -1) {
            db.trips[existingIndex] = trip;
        } else {
            db.trips.push(trip);
        }
        writeDb(db);
        return trip;
    },
    
    deleteTrip: (tripId, userId) => {
        const db = readDb();
        db.trips = db.trips.filter(t => !(t.id === tripId && t.userId === userId));
        writeDb(db);
    },

    // Chat Operations
    getChatHistory: (userId, destName = null) => {
        const chats = readDb().chats;
        if (destName) {
            return chats.find(c => c.userId === userId && c.destName?.toLowerCase() === destName.toLowerCase());
        }
        // Return latest general/all chats for this user
        return chats.filter(c => c.userId === userId);
    },
    
    saveChatHistory: (userId, messages, destName = null) => {
        const db = readDb();
        // Check for existing chat entry for this destination or general chat
        const existingIndex = db.chats.findIndex(c => 
            c.userId === userId && 
            ((!destName && !c.destName) || (destName && c.destName?.toLowerCase() === destName.toLowerCase()))
        );
        
        const chatEntry = {
            userId,
            destName,
            messages,
            updatedAt: new Date().toISOString()
        };
        
        if (existingIndex !== -1) {
            chatEntry.id = db.chats[existingIndex].id;
            db.chats[existingIndex] = chatEntry;
        } else {
            chatEntry.id = 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            db.chats.push(chatEntry);
        }
        writeDb(db);
        return chatEntry;
    }
};
