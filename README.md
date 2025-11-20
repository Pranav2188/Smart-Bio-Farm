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
# Frontend
npm install

# Backend
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

4. **Start development servers**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
npm start
```

5. **Open application**
```
http://localhost:3000
```

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

### Frontend
```bash
npm start          # Start development server
npm run build      # Create production build
npm test           # Run tests
```

### Backend
```bash
cd backend
npm start          # Start backend server
```

### Testing
```bash
node test-notifications.js              # Test notification system
node test-weather.js                    # Test weather integration
node backend/test-firebase-connection.js # Test Firebase connection
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
