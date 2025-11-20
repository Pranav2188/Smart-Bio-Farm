# Smart Bio Farm 🌾🐄🐖🐔

A comprehensive agricultural management system connecting farmers, veterinarians, and government officials for better livestock health management and agricultural monitoring.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- npm v8+
- Firebase account
- OpenWeatherMap API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd smart-bio-farm
```

2. **Install dependencies**
```bash
# Install root dependencies (includes frontend)
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

3. **Configure environment variables**
```bash
# Copy and edit .env files
cp .env.example .env
cp backend/.env.example backend/.env
```

Edit the `.env` files with your Firebase and OpenWeatherMap credentials.

### Running the Application

**Single Command Startup (Recommended):**

Start both frontend and backend servers with one command:

```bash
npm start
```

This will automatically start:
- **Frontend React app** on http://localhost:3000
- **Backend notification server** on http://localhost:5000

Both servers will run concurrently with color-coded output:
- `[FRONTEND]` - React development server logs (cyan)
- `[BACKEND]` - Backend server logs (magenta)

**Alternative: Start Servers Separately**

If you prefer to run servers in separate terminals:

```bash
# Terminal 1 - Backend
npm run start:backend

# Terminal 2 - Frontend
npm run start:frontend
```

**Development Mode with Auto-Restart:**

For stricter error handling (stops all servers if one fails):

```bash
npm run dev
```

### Troubleshooting

#### Port Already in Use

If you see an error like `EADDRINUSE` or "port already in use":

**For port 5000 (backend):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

**For port 3000 (frontend):**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

Or use the kill-port utility:
```bash
npx kill-port 5000 3000
```

#### Backend Fails to Start

**Missing serviceAccountKey.json:**
```
Error: Cannot find module './serviceAccountKey.json'
```

**Solution:** Ensure `backend/serviceAccountKey.json` exists with your Firebase service account credentials. Download it from Firebase Console → Project Settings → Service Accounts.

**Firebase Connection Error:**
```
Error: Failed to initialize Firebase Admin SDK
```

**Solution:** 
1. Verify `serviceAccountKey.json` has valid credentials
2. Check your Firebase project ID matches
3. Run the connection test: `node backend/test-firebase-connection.js`

#### Frontend Fails to Start

**Missing dependencies:**
```bash
npm install
```

**React Scripts Error:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Both Servers Won't Stop

If Ctrl+C doesn't stop the servers:

**Windows:**
```bash
taskkill /F /IM node.exe
```

**macOS/Linux:**
```bash
pkill -f node
```

#### Environment Variables Not Loading

Ensure `.env` files are in the correct locations:
- Root `.env` for frontend variables
- `backend/.env` for backend variables

Restart the servers after editing `.env` files.

---

## 📚 Complete Documentation

**For detailed documentation, see:** [`PROJECT_DOCUMENTATION.md`](./PROJECT_DOCUMENTATION.md)

The comprehensive documentation includes:
- Complete system architecture
- Technology stack details
- Setup & installation guide
- API reference
- Database schema
- User roles & features
- Testing procedures
- Deployment guide
- Troubleshooting tips
- And much more!

---

## 🎯 Key Features

### For Farmers 👨‍🌾
- Manage livestock inventory
- Request veterinary services
- Track animal health
- Receive weather updates
- Get government alerts

### For Veterinarians 👨‍⚕️
- View treatment requests
- Create medical reports
- Track treatment history
- Receive urgent notifications

### For Government Officials 🏛️
- Monitor agricultural activities
- Broadcast alerts to farmers
- View system analytics
- Access all data for oversight

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Tailwind CSS, i18next
- **Backend:** Node.js, Express
- **Database:** Cloud Firestore
- **Authentication:** Firebase Auth
- **Notifications:** Firebase Cloud Messaging
- **Weather:** OpenWeatherMap API

---

## 📱 Available Scripts

### Development
```bash
npm start              # Start both frontend and backend servers (recommended)
npm run start:frontend # Start only frontend React app
npm run start:backend  # Start only backend notification server
npm run dev            # Start both with strict error handling (stops all if one fails)
```

### Build & Test
```bash
npm run build          # Create production build
npm test               # Run frontend tests
```

### Testing
```bash
node test-notifications.js              # Test notification system
node test-weather.js                    # Test weather integration
node backend/test-firebase-connection.js # Test Firebase connection
```

### Firebase
```bash
npm run emulators      # Start Firebase emulators
npm run deploy:rules   # Deploy Firestore security rules
npm run deploy:indexes # Deploy Firestore indexes
npm run test:security  # Test security rules
```

---

## 🌍 Multilingual Support

The application supports:
- 🇬🇧 English
- 🇮🇳 Hindi (हिंदी)
- 🇮🇳 Marathi (मराठी)

---

## 🔐 User Roles

1. **Farmer** - Manage animals, request treatments
2. **Veterinarian** - Respond to requests, create reports
3. **Government** - Monitor system, broadcast alerts

**Government Signup Code:** `SMART_GOV_2025`

---

## 📊 Project Status

✅ **Production Ready**

- Backend & Firebase: Connected
- Notification System: Working
- Weather Integration: Active
- All Features: Implemented
- Build: Successful (zero warnings)

---

## 🧪 Testing

Run automated tests:
```bash
# Test all systems
node backend/test-firebase-connection.js && \
node test-notifications.js && \
node test-weather.js
```

For manual testing procedures, see the [Testing Guide](./PROJECT_DOCUMENTATION.md#13-testing-guide) in the documentation.

---

## 🚀 Deployment

The application can be deployed to:
- Firebase Hosting (recommended)
- Vercel
- Netlify
- Heroku (backend)
- Google Cloud Run (backend)
- AWS EC2 (backend)

See [Deployment Guide](./PROJECT_DOCUMENTATION.md#14-deployment) for detailed instructions.

---

## 📞 Support

For issues, questions, or contributions:
1. Check [`PROJECT_DOCUMENTATION.md`](./PROJECT_DOCUMENTATION.md)
2. Run test scripts to diagnose issues
3. Check browser console and backend logs
4. Review troubleshooting section in documentation

---

## 📄 License

[Your License Here]

---

## 🙏 Acknowledgments

- Firebase team for excellent services
- OpenWeatherMap for weather API
- React community for helpful resources
- All open-source contributors

---

**For complete documentation, please refer to [`PROJECT_DOCUMENTATION.md`](./PROJECT_DOCUMENTATION.md)**
