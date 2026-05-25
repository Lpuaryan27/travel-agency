# Travel with iQlipse - AI-Powered Travel Experiences

Travel with iQlipse is a full-stack, AI-powered travel agency platform. It creates personalized travel itineraries based on user preferences and budgets, provides interactive OpenStreetMap destination tracking, and integrates a persistent AI chatbot assistant.

## Live Deployment Link
👉 **[Open Live Application](https://travel-agency-lpuaryan27.onrender.com)** *(Or insert your customized Render deployment URL here)*

---

## 🌟 Key Features

1. **AI Trip Planner**: Generates personalized day-by-day travel schedules based on destination, dates, and budget.
2. **Interactive Map**: A visual exploration dashboard using Leaflet.js with marker cluster groupings and location search.
3. **AI Concierge Chat**: A persistent interactive messaging assistant that answers hotel, flight, local cuisine, and seasonal travel queries.
4. **User Auth & Profiles**: Secure sign-up/sign-in flows powered by password-hashing (`bcryptjs`) and JSON Web Tokens (`jsonwebtoken`).
5. **Lightweight Database**: A file-system-based JSON database ensuring zero native-dependency compilation issues on Windows environments.

---

## 🛠️ Technology Stack

* **Frontend**: HTML5, Tailwind CSS, Javascript (ES6), FontAwesome icons, Leaflet.js (OpenStreetMap)
* **Backend**: Node.js, Express.js, CORS middleware
* **Database**: Local JSON File-based DB (`db.js`)
* **Security**: `bcryptjs` (password hashing), `jsonwebtoken` (JWT Session storage)

---

## 🚀 Setup & Run Locally

### Prerequisites
* [Node.js](https://nodejs.org/) (v16 or higher recommended)
* NPM (included with Node.js)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Lpuaryan27/travel-agency.git
   cd travel-agency
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the environment configuration (create a `.env` file in the root directory):
   ```env
   PORT=5000
   JWT_SECRET=your_jwt_secret_key_here
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Open your browser and navigate to:
   [http://localhost:5000](http://localhost:5000)
