# Smart Bio Farm - Complete Project Documentation

**Project Name:** Smart Bio Farm  
**Version:** 0.1.0  
**Last Updated:** November 19, 2025  
**Status:** ✅ Production Ready

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Backend System](#5-backend-system)
6. [Frontend Application](#6-frontend-application)
7. [Firebase Integration](#7-firebase-integration)
8. [Notification System](#8-notification-system)
9. [Weather System](#9-weather-system)
10. [Database Schema](#10-database-schema)
11. [User Roles & Features](#11-user-roles--features)
12. [Setup & Installation](#12-setup--installation)
13. [Testing Guide](#13-testing-guide)
14. [Deployment](#14-deployment)
15. [Troubleshooting](#15-troubleshooting)

---


## 1. Project Overview

### What is Smart Bio Farm?

Smart Bio Farm is a comprehensive agricultural management system designed to connect farmers, veterinarians, and government officials in a unified platform. The application facilitates real-time communication, animal health management, and agricultural monitoring.

### Key Objectives

- **Animal Health Management:** Track livestock health and treatment records
- **Veterinary Services:** Connect farmers with veterinarians for timely treatment
- **Government Monitoring:** Enable officials to monitor agricultural activities and broadcast alerts
- **Real-time Communication:** Push notifications for urgent requests and updates
- **Weather Integration:** Provide real-time weather data for farming decisions
- **Multilingual Support:** Available in English, Hindi, and Marathi

### Target Users

1. **Farmers:** Manage livestock, request veterinary services, receive alerts
2. **Veterinarians:** Respond to treatment requests, maintain medical records
3. **Government Officials:** Monitor activities, broadcast alerts, view analytics

---


## 2. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Farmer     │  │     Vet      │  │  Government  │     │
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  React Frontend │
                    │  (Port 3000)    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│ Firebase Auth  │  │ Express Backend │  │ OpenWeatherMap │
│                │  │  (Port 5000)    │  │      API       │
└───────┬────────┘  └────────┬────────┘  └────────────────┘
        │                    │
        │           ┌────────▼────────┐
        │           │ Firebase Admin  │
        │           │      SDK        │
        │           └────────┬────────┘
        │                    │
        └────────────────────┼────────────────────┐
                             │                    │
                    ┌────────▼────────┐  ┌────────▼────────┐
                    │    Firestore    │  │  Firebase FCM   │
                    │    Database     │  │  (Push Notif)   │
                    └─────────────────┘  └─────────────────┘
```

### Component Interaction Flow

1. **User Authentication:** Firebase Auth handles login/signup
2. **Data Operations:** Frontend → Firestore (direct) for reads/writes
3. **Notifications:** Frontend → Backend → Firebase FCM → Users
4. **Weather Data:** Frontend → OpenWeatherMap API → Display
5. **Real-time Updates:** Firestore listeners push updates to frontend

---


## 3. Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI framework |
| React Router | 7.9.6 | Client-side routing |
| Firebase SDK | 12.6.0 | Authentication & Firestore |
| i18next | 25.6.3 | Internationalization |
| Recharts | 3.4.1 | Data visualization |
| Lucide React | 0.553.0 | Icon library |
| Tailwind CSS | 3.4.18 | Styling framework |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | Latest | Runtime environment |
| Express | 5.1.0 | Web server framework |
| Firebase Admin | 13.6.0 | Server-side Firebase SDK |
| CORS | 2.8.5 | Cross-origin resource sharing |

### External Services

| Service | Purpose | Status |
|---------|---------|--------|
| Firebase Authentication | User management | ✅ Active |
| Cloud Firestore | NoSQL database | ✅ Active |
| Firebase Cloud Messaging | Push notifications | ✅ Active |
| OpenWeatherMap API | Weather data | ✅ Active |

### Development Tools

- **Package Manager:** npm
- **Build Tool:** React Scripts (Create React App)
- **Version Control:** Git
- **Code Quality:** ESLint

---


## 4. Project Structure

### Root Directory Structure

```
smart-bio-farm/
├── backend/                    # Backend server
│   ├── server.js              # Express server entry point
│   ├── serviceAccountKey.json # Firebase Admin credentials
│   ├── .env                   # Backend environment variables
│   ├── package.json           # Backend dependencies
│   └── test-firebase-connection.js
│
├── public/                     # Static assets
│   ├── index.html             # HTML template
│   ├── manifest.json          # PWA manifest
│   ├── firebase-messaging-sw.js # Service worker for notifications
│   └── logo192.png            # App icons
│
├── src/                        # Frontend source code
│   ├── components/            # Reusable components
│   │   ├── AnimalChart.js
│   │   ├── ErrorBoundary.js
│   │   ├── OfflineIndicator.js
│   │   ├── ProtectedRoute.js
│   │   ├── ToastContainer.js
│   │   └── LanguageSwitcher.js
│   │
│   ├── contexts/              # React contexts
│   │   └── AuthContext.js     # Authentication state
│   │
│   ├── firebase/              # Firebase configuration
│   │   ├── authService.js     # Auth operations
│   │   └── firestoreService.js # Database operations
│   │
│   ├── hooks/                 # Custom React hooks
│   │   └── useFirestore.js    # Firestore data hooks
│   │
│   ├── pages/                 # Page components
│   │   ├── Welcome.js
│   │   ├── Profession.js
│   │   ├── Login.js
│   │   ├── Signup.js
│   │   ├── FarmerDashboard.js
│   │   ├── VetLogin.js
│   │   ├── VetSignup.js
│   │   ├── VetDashboard.js
│   │   ├── VetRequests.js
│   │   ├── FarmerMyRequests.js
│   │   ├── VetTreatmentHistory.js
│   │   ├── GovernmentLogin.js
│   │   ├── GovernmentSignup.js
│   │   └── GovernmentDashboard.js
│   │
│   ├── services/              # Service modules
│   │   └── notificationService.js # FCM integration
│   │
│   ├── utils/                 # Utility functions
│   │   ├── errorHandlers.js
│   │   └── weatherService.js  # Weather API integration
│   │
│   ├── App.js                 # Main app component
│   ├── index.js               # App entry point
│   ├── firebase.js            # Firebase initialization
│   ├── i18n.js                # Internationalization config
│   └── index.css              # Global styles
│
├── .env                        # Frontend environment variables
├── .firebaserc                 # Firebase project config
├── firebase.json               # Firebase services config
├── firestore.rules             # Firestore security rules
├── firestore.indexes.json      # Firestore indexes
├── package.json                # Frontend dependencies
├── tailwind.config.js          # Tailwind configuration
├── test-notifications.js       # Notification system tests
├── test-weather.js             # Weather system tests
└── PROJECT_DOCUMENTATION.md    # This file
```

---


## 5. Backend System

### Express Server (backend/server.js)

**Port:** 5000  
**Purpose:** Handle push notifications and admin operations

#### Server Configuration

```javascript
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(cors());
app.use(express.json());
```

#### Available Endpoints

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/` | GET | Health check | ✅ Working |
| `/validate-admin-code` | POST | Validate government signup code | ✅ Working |
| `/send-to-user` | POST | Send notification to single user | ✅ Working |
| `/send-to-vets` | POST | Send notification to multiple vets | ✅ Working |
| `/notify-vets-new-request` | POST | Notify all vets about new request | ✅ Working |
| `/notify-farmer-treatment` | POST | Notify farmer about treatment | ✅ Working |
| `/notify-farmers-new-alert` | POST | Broadcast alert to all farmers | ✅ Working |

#### Endpoint Details

**1. Health Check**
```javascript
GET /
Response: { status: "Server is running", timestamp: Date }
```

**2. Validate Admin Code**
```javascript
POST /validate-admin-code
Body: { code: "SMART_GOV_2025" }
Response: { valid: true/false, error?: string }
```

**3. Send to User**
```javascript
POST /send-to-user
Body: {
  token: "fcm_token",
  title: "Notification Title",
  body: "Notification Body",
  data: { key: "value" }
}
Response: { success: true, response: "..." }
```

**4. Notify Vets New Request**
```javascript
POST /notify-vets-new-request
Body: {
  requestId: "request_id",
  animalType: "Cow",
  category: "Illness"
}
Response: { success: true, successCount: X, failureCount: Y }
```

**5. Notify Farmer Treatment**
```javascript
POST /notify-farmer-treatment
Body: {
  farmerId: "user_id",
  animalType: "Cow",
  requestId: "request_id"
}
Response: { success: true, response: "..." }
```

**6. Notify Farmers New Alert**
```javascript
POST /notify-farmers-new-alert
Body: {
  alertType: "warning",
  alertMessage: "Alert message",
  createdByName: "Admin Name"
}
Response: { success: true, successCount: X, failureCount: Y }
```

### Environment Variables (backend/.env)

```env
PORT=5000
NODE_ENV=development
ADMIN_SETUP_CODE=SMART_GOV_2025
```

### How to Start Backend

```bash
cd backend
npm install
npm start
```

**Expected Output:**
```
🚀 Notification server running on port 5000
📡 Health check: http://localhost:5000/
```

---


## 6. Frontend Application

### React Application Structure

The frontend is built with React 19 and uses functional components with hooks.

### Key Components

#### 1. App.js - Main Application Router

```javascript
<Router>
  <AuthProvider>
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/profession" element={<Profession />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={
          <ProtectedRoute requiredRole="farmer">
            <FarmerDashboard />
          </ProtectedRoute>
        } />
        {/* More routes... */}
      </Routes>
    </ToastProvider>
  </AuthProvider>
</Router>
```

#### 2. AuthContext - Authentication State Management

**Purpose:** Manages user authentication state across the app

**Features:**
- User login/signup/logout
- Persistent authentication state
- Auto-request notification permissions
- User profile management

**Usage:**
```javascript
const { currentUser, signIn, signOut } = useAuth();
```

#### 3. ProtectedRoute - Route Protection

**Purpose:** Restrict access based on user roles

```javascript
<ProtectedRoute requiredRole="farmer">
  <FarmerDashboard />
</ProtectedRoute>
```

#### 4. ToastContainer - Notification Messages

**Purpose:** Display success/error/warning messages

**Usage:**
```javascript
const { showSuccess, showError, showWarning } = useToast();
showSuccess("Operation successful!");
```

#### 5. ErrorBoundary - Error Handling

**Purpose:** Catch and display React errors gracefully

#### 6. OfflineIndicator - Network Status

**Purpose:** Show indicator when user is offline

### Custom Hooks

#### useFirestore Hook

**Purpose:** Manage Firestore data with real-time updates

**Available Hooks:**
- `useLivestock(animalType)` - Manage livestock data
- `useEnvironmentalData()` - Get environmental sensor data
- `useAlerts()` - Manage global alerts

**Example:**
```javascript
const { data, loading, error, add, update, remove } = useLivestock('pigs');
```

### Internationalization (i18n)

**Supported Languages:**
- English (en)
- Hindi (hi)
- Marathi (mr)

**Usage:**
```javascript
const { t, i18n } = useTranslation();
<h1>{t('welcome')}</h1>
i18n.changeLanguage('hi');
```

### Styling

**Framework:** Tailwind CSS  
**Approach:** Utility-first CSS classes

**Example:**
```javascript
<div className="bg-white rounded-lg shadow-md p-6">
  <h2 className="text-2xl font-bold text-gray-800">Title</h2>
</div>
```

### Environment Variables (.env)

```env
REACT_APP_FIREBASE_API_KEY=AIzaSyAGpDMlQR6SzVtSQjcgS1FsuNT4dTftJqI
REACT_APP_FIREBASE_AUTH_DOMAIN=smartbiofarm.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=smartbiofarm
REACT_APP_FIREBASE_STORAGE_BUCKET=smartbiofarm.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=494318108784
REACT_APP_FIREBASE_APP_ID=1:494318108784:web:5eaebb70f86bf19e9db4b5
REACT_APP_FIREBASE_MEASUREMENT_ID=G-1DX6TYTZH8
```

### How to Start Frontend

```bash
npm install
npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view smart-bio-farm in the browser.
Local: http://localhost:3000
```

---


## 7. Firebase Integration

### Firebase Services Used

1. **Firebase Authentication** - User management
2. **Cloud Firestore** - NoSQL database
3. **Firebase Cloud Messaging** - Push notifications
4. **Firebase Analytics** - Usage tracking

### Firebase Configuration (src/firebase.js)

```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);
```

### Firestore Offline Persistence

**Feature:** Data available even when offline

```javascript
initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
```

### Authentication Service (src/firebase/authService.js)

#### Available Functions

| Function | Purpose | Parameters |
|----------|---------|------------|
| `signUp()` | Create new user | email, password, userData |
| `signIn()` | Login user | email, password |
| `signOut()` | Logout user | - |
| `onAuthStateChanged()` | Listen to auth changes | callback |

#### Example Usage

```javascript
// Sign up
await signUp('user@example.com', 'password123', {
  fullName: 'John Doe',
  role: 'farmer'
});

// Sign in
await signIn('user@example.com', 'password123');

// Sign out
await signOut();
```

### Firestore Service (src/firebase/firestoreService.js)

#### User Operations

```javascript
// Create user profile
await createUserProfile(userId, {
  email: 'user@example.com',
  fullName: 'John Doe',
  role: 'farmer'
});

// Get user profile
const profile = await getUserProfile(userId);
```

#### Livestock Operations

```javascript
// Add livestock
const docId = await addLivestock(userId, {
  animalType: 'pigs',
  date: '2025-11-19',
  category: 'Piglets',
  gender: 'Male',
  quantity: 10,
  price: 5000
});

// Get livestock
const livestock = await getLivestock(userId, 'pigs');

// Update livestock
await updateLivestock(docId, { quantity: 12 });

// Delete livestock
await deleteLivestock(docId);

// Subscribe to real-time updates
const unsubscribe = subscribeLivestock(userId, 'pigs', (data) => {
  console.log('Updated livestock:', data);
});
```

#### Animal Operations (Shared Collection)

```javascript
// Add animal
await addAnimal(ownerId, {
  type: 'pigs',
  category: 'Piglets',
  gender: 'Male',
  quantity: 10,
  price: 5000,
  date: '2025-11-19',
  healthStatus: 'Healthy'
});

// Get animals
const animals = await getAnimals(ownerId, 'pigs');

// Update animal
await updateAnimal(docId, { healthStatus: 'Sick' });
```

#### Alert Operations

```javascript
// Add alert
await addAlert(userId, {
  type: 'warning',
  message: 'Heavy rain expected',
  priority: 1,
  createdByName: 'Admin'
});

// Get alerts
const alerts = await getAlerts();

// Subscribe to alerts
const unsubscribe = subscribeAlerts((alerts) => {
  console.log('New alerts:', alerts);
});
```

#### Vet Report Operations

```javascript
// Add vet report
await addVetReport(vetId, {
  animalId: 'animal_id',
  farmerId: 'farmer_id',
  animalType: 'Cow',
  symptoms: 'Fever, loss of appetite',
  medicine: 'Antibiotic XYZ',
  dose: '10ml twice daily',
  nextVisit: '2025-11-26',
  notes: 'Monitor temperature'
});

// Get reports for farmer
const reports = await getFarmerVetReports(farmerId);
```

### Firestore Security Rules

**File:** `firestore.rules`

**Key Rules:**
- Users can only read/write their own data
- Veterinarians can read all animals
- Government officials can read all data
- Alerts are globally readable
- Medical records cannot be deleted

**Example Rule:**
```javascript
match /users/{userId} {
  allow read: if isOwner(userId) || isGovernment();
  allow create: if isAuthenticated() && request.auth.uid == userId;
  allow update: if isOwner(userId);
  allow delete: if false;
}
```

---


## 8. Notification System

### Architecture Overview

```
User Action → Frontend → Backend API → Firebase FCM → User Device
```

### Frontend Notification Service

**File:** `src/services/notificationService.js`

#### Key Functions

**1. Request Permission**
```javascript
const token = await requestNotificationPermission(userId);
// Requests browser permission and gets FCM token
// Saves token to Firestore user document
```

**2. Setup Foreground Listener**
```javascript
const unsubscribe = setupForegroundMessageListener((payload) => {
  console.log('Received:', payload);
  // Shows notification when app is open
});
```

**3. Check Support**
```javascript
const supported = areNotificationsSupported();
const permission = getNotificationPermission(); // "granted", "denied", "default"
```

### Service Worker (public/firebase-messaging-sw.js)

**Purpose:** Handle background notifications when app is closed

```javascript
// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title;
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/logo192.png',
    data: payload.data
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  clients.openWindow(event.notification.data?.url || '/');
});
```

### Backend Notification Handlers

#### 1. Notify Vets About New Request

**Trigger:** Farmer creates animal treatment request

**Flow:**
1. Farmer submits request form
2. Frontend calls backend endpoint
3. Backend queries all veterinarians from Firestore
4. Backend retrieves FCM tokens
5. Backend sends notification to each vet
6. Vets receive push notification

**Code:**
```javascript
// Frontend
const response = await fetch('http://localhost:5000/notify-vets-new-request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    requestId: 'req_123',
    animalType: 'Cow',
    category: 'Illness'
  })
});
```

#### 2. Notify Farmer About Treatment

**Trigger:** Vet completes treatment

**Flow:**
1. Vet submits treatment report
2. Frontend calls backend endpoint
3. Backend queries farmer document
4. Backend retrieves farmer's FCM token
5. Backend sends notification to farmer
6. Farmer receives push notification

#### 3. Broadcast Alert to Farmers

**Trigger:** Government creates alert

**Flow:**
1. Government official creates alert
2. Frontend calls backend endpoint
3. Backend queries all farmers
4. Backend retrieves all farmer FCM tokens
5. Backend sends notification to each farmer
6. All farmers receive push notification

### Notification Flow Diagram

```
┌─────────────┐
│   Farmer    │ Creates Request
│  Dashboard  │────────┐
└─────────────┘        │
                       ▼
              ┌─────────────────┐
              │ Backend Server  │
              │ /notify-vets... │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │   Firestore     │ Query all vets
              │ users collection│
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Firebase FCM   │ Send to tokens
              └────────┬────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   ┌────────┐    ┌────────┐    ┌────────┐
   │ Vet 1  │    │ Vet 2  │    │ Vet 3  │
   └────────┘    └────────┘    └────────┘
```

### Token Management

**Storage:** FCM tokens stored in Firestore user documents

```javascript
// User document structure
{
  userId: "abc123",
  email: "user@example.com",
  fullName: "John Doe",
  role: "farmer",
  fcmToken: "fcm_token_string_here",  // ← FCM token
  fcmTokenUpdatedAt: Timestamp
}
```

**Auto-Update:** Token automatically requested and saved on login

```javascript
// In AuthContext.js
useEffect(() => {
  if (user) {
    setTimeout(() => {
      requestNotificationPermission(user.uid);
    }, 2000);
  }
}, [user]);
```

### Notification Types

| Type | Title | Body | Click Action |
|------|-------|------|--------------|
| New Request | "New Animal Treatment Request" | "A farmer needs help with [animal]" | Opens /vet-requests |
| Treatment Complete | "Treatment Completed!" | "Your [animal] has been treated" | Opens /farmer/requests |
| Government Alert | "⚠️ Warning Alert" | "[Admin]: [Message]" | Opens /dashboard |

### Testing Notifications

**Test Script:** `test-notifications.js`

```bash
node test-notifications.js
```

**Manual Test:**
1. Start backend: `cd backend && npm start`
2. Start frontend: `npm start`
3. Login as farmer
4. Grant notification permission
5. Create a request
6. Check if vets receive notification

---


## 9. Weather System

### Architecture Overview

```
Frontend → OpenWeatherMap API → Display Weather Data
```

### Weather Service (src/utils/weatherService.js)

#### Functions

**1. Get Weather Data**
```javascript
const weather = await getWeather(lat, lon, apiKey);
// Returns: {
//   temperature: 32,
//   humidity: 65,
//   city: "Mumbai",
//   description: "clear sky",
//   icon: "01d",
//   feelsLike: 31,
//   pressure: 1013,
//   windSpeed: 2.5
// }
```

**2. Get User Location**
```javascript
const location = await getUserLocation();
// Returns: { lat: 19.0760, lon: 72.8777 }
// Uses browser geolocation or defaults to Mumbai, India
```

**3. Get Weather Icon URL**
```javascript
const iconUrl = getWeatherIconUrl('01d');
// Returns: "https://openweathermap.org/img/wn/01d@2x.png"
```

### OpenWeatherMap API Integration

**API Provider:** OpenWeatherMap  
**API Version:** 2.5  
**Endpoint:** `https://api.openweathermap.org/data/2.5/weather`  
**API Key:** `8f4980c2b086f0f5a64ebc8ba62d8326`  
**Units:** Metric (Celsius, m/s)

#### API Request Format

```
GET https://api.openweathermap.org/data/2.5/weather
  ?lat=19.0760
  &lon=72.8777
  &units=metric
  &appid=8f4980c2b086f0f5a64ebc8ba62d8326
```

#### API Response Example

```json
{
  "main": {
    "temp": 32,
    "feels_like": 31,
    "humidity": 65,
    "pressure": 1013
  },
  "weather": [{
    "description": "clear sky",
    "icon": "01d"
  }],
  "wind": {
    "speed": 2.5
  },
  "name": "Mumbai"
}
```

### Implementation in Components

#### FarmerDashboard.js

```javascript
const [weather, setWeather] = useState(null);
const [weatherLoading, setWeatherLoading] = useState(true);

useEffect(() => {
  const fetchWeather = async () => {
    try {
      setWeatherLoading(true);
      const location = await getUserLocation();
      const apiKey = "8f4980c2b086f0f5a64ebc8ba62d8326";
      const data = await getWeather(location.lat, location.lon, apiKey);
      setWeather(data);
      setWeatherLoading(false);
    } catch (error) {
      console.error("Error fetching weather:", error);
      setWeatherLoading(false);
    }
  };
  
  fetchWeather();
}, []);
```

#### Display Weather Widget

```javascript
{weather && (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600">{weather.city}</p>
        <p className="text-4xl font-bold">{weather.temperature}°C</p>
        <p className="text-gray-500">{weather.description}</p>
      </div>
      <div>
        <img 
          src={getWeatherIconUrl(weather.icon)} 
          alt="weather" 
        />
        <p className="text-gray-600">Humidity: {weather.humidity}%</p>
      </div>
    </div>
  </div>
)}
```

### Geolocation Features

**Browser API:** `navigator.geolocation`

**Permission Flow:**
1. Request user's location permission
2. If granted: Use actual coordinates
3. If denied: Use default location (Mumbai, India)
4. Fetch weather for coordinates

**Fallback Location:**
- City: Mumbai, India
- Latitude: 19.0760
- Longitude: 72.8777

### Error Handling

```javascript
try {
  const weather = await getWeather(lat, lon, apiKey);
  setWeather(weather);
} catch (error) {
  console.error("Error fetching weather:", error);
  // Display fallback or error message
  setWeather(null);
}
```

### Weather Data Displayed

| Data Point | Unit | Example |
|------------|------|---------|
| Temperature | °C | 32°C |
| Feels Like | °C | 31°C |
| Humidity | % | 65% |
| Wind Speed | m/s | 2.5 m/s |
| Pressure | hPa | 1013 hPa |
| Conditions | Text | Clear sky |
| City | Text | Mumbai |
| Icon | Image | ☀️ |

### Testing Weather System

**Test Script:** `test-weather.js`

```bash
node test-weather.js
```

**Expected Output:**
```
✅ API Connection: Working
✅ Mumbai: 32°C, 29% humidity
✅ New York: 5°C, 79% humidity
✅ London: 3°C, 91% humidity
✅ API Key: Valid
✅ Service Functions: All implemented
```

### Performance

- **Response Time:** < 1 second
- **Data Size:** ~1-2 KB per request
- **Update Frequency:** On component mount
- **Caching:** None (real-time data)

### Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Fetch API | ✅ | ✅ | ✅ | ✅ |
| Geolocation | ✅ | ✅ | ✅ | ✅ |
| Promises | ✅ | ✅ | ✅ | ✅ |

---


## 10. Database Schema

### Firestore Collections

#### 1. users Collection

**Purpose:** Store user profiles and authentication data

```javascript
{
  userId: "abc123",                    // Firebase Auth UID
  email: "farmer@example.com",         // User email
  fullName: "John Doe",                // Full name
  role: "farmer",                      // "farmer" | "veterinarian" | "government"
  fcmToken: "fcm_token_string",        // Push notification token
  fcmTokenUpdatedAt: Timestamp,        // Token update time
  createdAt: Timestamp,                // Account creation time
  updatedAt: Timestamp,                // Last update time
  profileComplete: true                // Profile completion status
}
```

**Indexes:** None required  
**Security:** Users can read/write own data, government can read all

---

#### 2. livestock Collection

**Purpose:** Store livestock records (legacy, being phased out)

```javascript
{
  userId: "abc123",                    // Owner's user ID
  animalType: "pigs",                  // "pigs" | "chickens"
  date: "2025-11-19",                  // Record date
  category: "Piglets",                 // Animal category
  gender: "Male",                      // "Male" | "Female"
  quantity: 10,                        // Number of animals
  price: 5000,                         // Price per unit
  createdAt: Timestamp,                // Creation time
  updatedAt: Timestamp                 // Last update time
}
```

**Indexes:**
- userId + animalType + date (descending)

**Security:** Users can read/write own data, government can read all

---

#### 3. animals Collection

**Purpose:** Shared animals collection for farmer-vet interaction

```javascript
{
  ownerId: "abc123",                   // Farmer's user ID
  type: "pigs",                        // Animal type
  category: "Piglets",                 // Category
  gender: "Male",                      // Gender
  quantity: 10,                        // Quantity
  price: 5000,                         // Price
  date: "2025-11-19",                  // Date
  healthStatus: "Healthy",             // "Healthy" | "Sick" | "Under Treatment"
  createdAt: Timestamp,                // Creation time
  lastUpdated: Timestamp               // Last update time
}
```

**Indexes:** None required  
**Security:** 
- Farmers can read/write own animals
- Vets can read all animals
- Government can read all animals

---

#### 4. environmentalData Collection

**Purpose:** Store environmental sensor data

```javascript
{
  temperature: 28,                     // Temperature in °C
  humidity: 65,                        // Humidity in %
  location: "Farm A",                  // Location name
  sensorId: "sensor_001",              // Sensor identifier
  timestamp: Timestamp                 // Data timestamp
}
```

**Document ID:** "current" (single document)  
**Security:** All authenticated users can read, sensors can write

---

#### 5. alerts Collection

**Purpose:** Store global alerts for farmers

```javascript
{
  createdBy: "gov_user_id",            // Creator's user ID
  createdByName: "Admin Name",         // Creator's name
  type: "warning",                     // "info" | "warning" | "alert"
  message: "Heavy rain expected",      // Alert message
  priority: 1,                         // Priority (1-5)
  isGlobal: true,                      // Global visibility flag
  timestamp: Timestamp                 // Creation time
}
```

**Indexes:**
- isGlobal + timestamp (descending)

**Security:** 
- All users can read global alerts
- Authenticated users can create alerts
- Creator and government can update/delete

---

#### 6. vetReports Collection

**Purpose:** Store veterinary treatment reports

```javascript
{
  vetId: "vet_user_id",                // Veterinarian's user ID
  animalId: "animal_doc_id",           // Animal document ID
  farmerId: "farmer_user_id",          // Farmer's user ID
  animalType: "Cow",                   // Animal type
  symptoms: "Fever, loss of appetite", // Symptoms
  medicine: "Antibiotic XYZ",          // Prescribed medicine
  dose: "10ml twice daily",            // Dosage instructions
  nextVisit: "2025-11-26",             // Next visit date
  notes: "Monitor temperature",        // Additional notes
  createdAt: Timestamp                 // Report creation time
}
```

**Indexes:** None required  
**Security:**
- Farmers can read own reports
- Vets can read all reports and create new ones
- Government can read all reports
- Cannot be deleted (medical records)

---

#### 7. vetRequests Collection

**Purpose:** Store farmer condition reports (treatment requests)

```javascript
{
  farmerId: "farmer_user_id",          // Farmer's user ID
  farmerName: "John Doe",              // Farmer's name
  animalType: "Cow",                   // Animal type
  category: "Illness",                 // Request category
  symptoms: "Not eating, fever",       // Symptoms description
  urgency: "High",                     // "Low" | "Medium" | "High"
  status: "Pending",                   // "Pending" | "In Progress" | "Completed"
  location: "Farm A, Village B",       // Location
  contactNumber: "+91-9876543210",     // Contact number
  createdAt: Timestamp,                // Request creation time
  updatedAt: Timestamp,                // Last update time
  treatedBy: "vet_user_id",            // Vet who treated (optional)
  treatmentDate: Timestamp             // Treatment date (optional)
}
```

**Indexes:** None required  
**Security:**
- Farmers can create and read own requests
- Vets can read all requests and update status
- Government can read all requests
- Cannot be deleted (medical records)

---

### Database Relationships

```
users (farmers)
  ↓
  ├─→ animals (owns)
  ├─→ livestock (owns)
  ├─→ vetRequests (creates)
  └─→ vetReports (receives)

users (veterinarians)
  ↓
  ├─→ animals (can view all)
  ├─→ vetRequests (responds to)
  └─→ vetReports (creates)

users (government)
  ↓
  ├─→ alerts (creates)
  └─→ all collections (can view)
```

### Data Flow Examples

**1. Farmer Creates Request:**
```
Farmer → vetRequests (create) → Backend → FCM → All Vets
```

**2. Vet Treats Animal:**
```
Vet → vetReports (create) → Backend → FCM → Farmer
```

**3. Government Creates Alert:**
```
Government → alerts (create) → Backend → FCM → All Farmers
```

---


## 11. User Roles & Features

### Role-Based Access Control

The application supports three distinct user roles, each with specific features and permissions.

---

### 1. Farmer Role

**Login Path:** `/login`  
**Dashboard:** `/dashboard`

#### Features

**Animal Management**
- Add new animals (pigs, chickens, cows, etc.)
- View animal inventory
- Update animal details
- Delete animal records
- Track animal health status

**Treatment Requests**
- Report animal conditions
- Request veterinary services
- Specify symptoms and urgency
- Track request status
- View treatment history

**Weather Information**
- View current weather conditions
- Check temperature and humidity
- Plan farming activities

**Alerts & Notifications**
- Receive government alerts
- Get treatment completion notifications
- View alert history

**Data Visualization**
- Animal statistics charts
- Inventory trends
- Health status overview

#### Farmer Dashboard Components

```javascript
<FarmerDashboard>
  ├─ Weather Widget
  ├─ Animal Statistics
  ├─ Animal Inventory Table
  ├─ Add Animal Form
  ├─ Report Condition Modal
  ├─ My Requests View
  ├─ Alerts Section
  └─ Profile Menu
</FarmerDashboard>
```

#### Farmer Workflow

1. **Login** → Enter credentials
2. **Grant Permissions** → Allow notifications and location
3. **View Dashboard** → See animals, weather, alerts
4. **Add Animals** → Click "Add Entry" button
5. **Report Condition** → Click "Report Condition" on animal
6. **Track Requests** → View "My Requests" page
7. **Receive Notifications** → Get treatment updates

---

### 2. Veterinarian Role

**Login Path:** `/vet/login`  
**Dashboard:** `/vet/dashboard`

#### Features

**Request Management**
- View all farmer requests
- Filter by status and urgency
- Accept treatment requests
- Update request status

**Treatment Records**
- Create treatment reports
- Record symptoms and diagnosis
- Prescribe medicines and dosage
- Schedule follow-up visits
- Add treatment notes

**Animal Viewing**
- View all animals in system
- Check animal health status
- Access animal history

**Treatment History**
- View all past treatments
- Search by farmer ID
- Filter by date and animal type
- Export treatment records

**Notifications**
- Receive new request alerts
- Get urgent request notifications

#### Vet Dashboard Components

```javascript
<VetDashboard>
  ├─ Statistics Overview
  ├─ Recent Requests
  ├─ Quick Actions
  ├─ Treatment History
  └─ Profile Menu
</VetDashboard>

<VetRequests>
  ├─ Filters (Status, Urgency)
  ├─ Request Cards
  ├─ Treat Modal
  └─ Treatment Form
</VetRequests>

<VetTreatmentHistory>
  ├─ Search Bar
  ├─ Filters
  ├─ Treatment Records Table
  └─ Export Options
</VetTreatmentHistory>
```

#### Veterinarian Workflow

1. **Login** → Enter vet credentials
2. **Grant Permissions** → Allow notifications
3. **View Dashboard** → See statistics and recent requests
4. **Check Requests** → Navigate to "Vet Requests"
5. **Treat Animal** → Click "Treat" button
6. **Fill Treatment Form** → Enter diagnosis, medicine, etc.
7. **Submit Report** → Farmer gets notified
8. **View History** → Check past treatments

---

### 3. Government Official Role

**Login Path:** `/government-login`  
**Dashboard:** `/government-dashboard`  
**Signup Code:** `SMART_GOV_2025`

#### Features

**Monitoring & Analytics**
- View total farmers count
- View total veterinarians count
- Monitor treatment requests
- Track system usage

**Alert Broadcasting**
- Create global alerts
- Set alert type (info, warning, critical)
- Broadcast to all farmers
- View alert history

**Weather Monitoring**
- View current weather conditions
- Monitor environmental data

**Data Overview**
- View all farmers
- View all veterinarians
- View all treatment requests
- View all vet reports

**System Administration**
- Validate admin codes
- Monitor system health
- Access all data (read-only)

#### Government Dashboard Components

```javascript
<GovernmentDashboard>
  ├─ Statistics Cards
  │  ├─ Total Farmers
  │  ├─ Total Veterinarians
  │  ├─ Total Requests
  │  └─ Completed Treatments
  ├─ Weather Widget
  ├─ Create Alert Section
  ├─ Recent Alerts
  ├─ Farmers List
  ├─ Veterinarians List
  └─ Profile Menu
</GovernmentDashboard>
```

#### Government Workflow

1. **Signup** → Enter admin code (`SMART_GOV_2025`)
2. **Login** → Enter credentials
3. **View Dashboard** → See system statistics
4. **Monitor Activity** → Check farmers, vets, requests
5. **Create Alert** → Click "Create Alert" button
6. **Broadcast** → All farmers receive notification
7. **View Reports** → Access treatment data

---

### Permission Matrix

| Feature | Farmer | Veterinarian | Government |
|---------|--------|--------------|------------|
| Add Animals | ✅ | ❌ | ❌ |
| View Own Animals | ✅ | ❌ | ❌ |
| View All Animals | ❌ | ✅ | ✅ |
| Create Requests | ✅ | ❌ | ❌ |
| View Own Requests | ✅ | ❌ | ❌ |
| View All Requests | ❌ | ✅ | ✅ |
| Create Treatment Reports | ❌ | ✅ | ❌ |
| View Own Reports | ✅ | ❌ | ❌ |
| View All Reports | ❌ | ✅ | ✅ |
| Create Alerts | ❌ | ❌ | ✅ |
| View Alerts | ✅ | ✅ | ✅ |
| View Statistics | ❌ | ✅ | ✅ |
| View All Users | ❌ | ❌ | ✅ |

---

### Navigation Structure

```
/ (Welcome)
├─ /profession (Choose Role)
│
├─ Farmer Path
│  ├─ /login
│  ├─ /signup
│  ├─ /dashboard
│  └─ /farmer/requests
│
├─ Veterinarian Path
│  ├─ /vet/login
│  ├─ /vet/signup
│  ├─ /vet/dashboard
│  ├─ /vet-requests
│  └─ /vet/history
│
└─ Government Path
   ├─ /government-login
   ├─ /government-signup
   └─ /government-dashboard
```

---


## 12. Setup & Installation

### Prerequisites

Before setting up the project, ensure you have:

- **Node.js:** v16 or higher
- **npm:** v8 or higher
- **Git:** For version control
- **Firebase Account:** For backend services
- **OpenWeatherMap API Key:** For weather data
- **Code Editor:** VS Code recommended

---

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd smart-bio-farm
```

---

### Step 2: Install Dependencies

#### Frontend Dependencies

```bash
npm install
```

**Installs:**
- React 19.2.0
- Firebase SDK 12.6.0
- React Router 7.9.6
- i18next 25.6.3
- Tailwind CSS 3.4.18
- Recharts 3.4.1
- Lucide React 0.553.0

#### Backend Dependencies

```bash
cd backend
npm install
```

**Installs:**
- Express 5.1.0
- Firebase Admin 13.6.0
- CORS 2.8.5
- dotenv 17.2.3

---

### Step 3: Firebase Setup

#### 3.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `smartbiofarm`
4. Enable Google Analytics (optional)
5. Create project

#### 3.2 Enable Firebase Services

**Authentication:**
1. Go to Authentication → Get Started
2. Enable Email/Password sign-in method

**Firestore Database:**
1. Go to Firestore Database → Create Database
2. Start in production mode
3. Choose location (closest to users)

**Cloud Messaging:**
1. Go to Project Settings → Cloud Messaging
2. Enable Cloud Messaging API
3. Generate VAPID key pair
4. Copy VAPID key

#### 3.3 Get Firebase Configuration

1. Go to Project Settings → General
2. Scroll to "Your apps"
3. Click "Web" icon (</>) to add web app
4. Register app with nickname
5. Copy configuration object

#### 3.4 Download Service Account Key

1. Go to Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save as `backend/serviceAccountKey.json`
4. **Keep this file secure!**

---

### Step 4: Environment Configuration

#### 4.1 Frontend Environment (.env)

Create `.env` file in root directory:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

#### 4.2 Backend Environment (backend/.env)

Create `backend/.env` file:

```env
PORT=5000
NODE_ENV=development
ADMIN_SETUP_CODE=SMART_GOV_2025
```

#### 4.3 Update VAPID Key

Edit `src/firebase.js`:

```javascript
export const VAPID_KEY = "your_vapid_key_here";
```

Edit `public/firebase-messaging-sw.js`:

```javascript
firebase.initializeApp({
  apiKey: "your_api_key",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project.firebasestorage.app",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id"
});
```

---

### Step 5: Deploy Firestore Rules

```bash
firebase login
firebase init firestore
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

---

### Step 6: OpenWeatherMap API Setup

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for free account
3. Get API key from dashboard
4. Update API key in:
   - `src/pages/FarmerDashboard.js` (line 245)
   - `src/pages/GovernmentDashboard.js` (line 112)

**Or better:** Add to `.env`:

```env
REACT_APP_WEATHER_API_KEY=your_weather_api_key
```

Then update code to use:
```javascript
const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
```

---

### Step 7: Start Development Servers

#### Terminal 1: Backend Server

```bash
cd backend
npm start
```

**Expected Output:**
```
🚀 Notification server running on port 5000
📡 Health check: http://localhost:5000/
```

#### Terminal 2: Frontend Application

```bash
npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view smart-bio-farm in the browser.
Local: http://localhost:3000
```

---

### Step 8: Verify Installation

#### 8.1 Test Backend Connection

```bash
node backend/test-firebase-connection.js
```

**Expected:**
```
✅ Firebase Admin SDK initialized successfully
✅ Firestore connection successful!
```

#### 8.2 Test Notification System

```bash
node test-notifications.js
```

**Expected:**
```
✅ All notification endpoints working
```

#### 8.3 Test Weather System

```bash
node test-weather.js
```

**Expected:**
```
✅ OpenWeatherMap API: Working
✅ Weather data fetched successfully
```

#### 8.4 Test Frontend Build

```bash
npm run build
```

**Expected:**
```
Compiled successfully.
File sizes after gzip:
  364.14 kB  build/static/js/main.*.js
```

---

### Step 9: Create Test Users

#### Farmer Account
1. Go to `http://localhost:3000`
2. Click "Get Started"
3. Select "Farmer"
4. Click "Sign Up"
5. Enter details and create account

#### Veterinarian Account
1. Go to `http://localhost:3000`
2. Click "Get Started"
3. Select "Veterinarian"
4. Click "Sign Up"
5. Enter details and create account

#### Government Account
1. Go to `http://localhost:3000`
2. Click "Get Started"
3. Select "Government Official"
4. Click "Sign Up"
5. Enter admin code: `SMART_GOV_2025`
6. Enter details and create account

---

### Step 10: Test Complete Flow

1. **Login as Farmer**
   - Grant notification permission
   - Add an animal
   - Report condition

2. **Login as Vet** (different browser/incognito)
   - Check if notification received
   - View request
   - Submit treatment

3. **Login as Farmer** (original browser)
   - Check if treatment notification received
   - View treatment report

4. **Login as Government** (another browser)
   - View statistics
   - Create alert
   - Check if farmers receive notification

---

### Common Setup Issues

**Issue:** Firebase connection fails  
**Solution:** Check `.env` file has correct values

**Issue:** Notifications not working  
**Solution:** Ensure service worker is registered and VAPID key is correct

**Issue:** Weather not loading  
**Solution:** Check OpenWeatherMap API key is valid

**Issue:** Backend won't start  
**Solution:** Ensure `serviceAccountKey.json` exists in backend folder

**Issue:** Build fails  
**Solution:** Run `npm install` again and check for errors

---


## 13. Testing Guide

### Automated Testing

#### Test Scripts Available

| Script | Purpose | Command |
|--------|---------|---------|
| `test-firebase-connection.js` | Test backend Firebase connection | `node backend/test-firebase-connection.js` |
| `test-notifications.js` | Test notification endpoints | `node test-notifications.js` |
| `test-weather.js` | Test weather API integration | `node test-weather.js` |

---

### Manual Testing Scenarios

#### Scenario 1: Farmer Creates Request → Vet Receives Notification

**Objective:** Test end-to-end notification flow

**Steps:**

1. **Setup:**
   - Start backend: `cd backend && npm start`
   - Start frontend: `npm start`
   - Open two browsers (Chrome and Firefox)

2. **Browser 1 - Farmer:**
   ```
   → Go to http://localhost:3000
   → Click "Get Started"
   → Select "Farmer"
   → Login or Signup
   → Grant notification permission
   → Go to Dashboard
   → Click "Add Entry" to add an animal
   → Click "Report Condition" on the animal
   → Fill form:
      - Animal Type: Cow
      - Category: Illness
      - Symptoms: Not eating, fever
      - Urgency: High
   → Click "Submit Request"
   ```

3. **Browser 2 - Veterinarian:**
   ```
   → Go to http://localhost:3000
   → Click "Get Started"
   → Select "Veterinarian"
   → Login or Signup
   → Grant notification permission
   → Wait for notification (should appear within seconds)
   → Click notification or go to "Vet Requests"
   → Find the request
   → Click "Treat"
   → Fill treatment form:
      - Diagnosis: Bacterial infection
      - Medicines: Antibiotic XYZ
      - Follow-up Date: [future date]
      - Notes: Monitor temperature
   → Click "Submit Treatment"
   ```

4. **Browser 1 - Farmer:**
   ```
   → Wait for notification (should appear within seconds)
   → Click notification or go to "My Requests"
   → Verify treatment details are visible
   → Check status changed to "Completed"
   ```

**Expected Results:**
- ✅ Vet receives push notification
- ✅ Request appears in vet's request list
- ✅ Farmer receives treatment completion notification
- ✅ Treatment report visible to farmer
- ✅ Request status updated to "Completed"

---

#### Scenario 2: Government Broadcasts Alert → Farmers Receive

**Objective:** Test alert broadcasting system

**Steps:**

1. **Browser 1 - Government:**
   ```
   → Go to http://localhost:3000
   → Click "Get Started"
   → Select "Government Official"
   → Signup with code: SMART_GOV_2025
   → Login
   → Go to Dashboard
   → Click "Create Alert"
   → Fill form:
      - Alert Type: Warning
      - Message: Heavy rain expected tomorrow
   → Click "Send Alert"
   ```

2. **Browser 2 - Farmer:**
   ```
   → Should receive push notification
   → Notification title: "⚠️ Warning Alert"
   → Notification body: "[Admin Name]: Heavy rain expected tomorrow"
   → Click notification
   → Should open farmer dashboard
   → Alert visible in alerts section
   ```

**Expected Results:**
- ✅ All farmers receive push notification
- ✅ Alert appears in farmer dashboard
- ✅ Alert stored in Firestore
- ✅ Backend logs show successful sends

---

#### Scenario 3: Weather Data Display

**Objective:** Test weather integration

**Steps:**

1. **Farmer Dashboard:**
   ```
   → Login as farmer
   → Go to Dashboard
   → Check weather widget
   → Verify displays:
      - Temperature
      - Humidity
      - City name
      - Weather icon
      - Conditions
   ```

2. **Government Dashboard:**
   ```
   → Login as government
   → Go to Dashboard
   → Check weather widget
   → Verify same data displayed
   ```

**Expected Results:**
- ✅ Weather data loads within 1 second
- ✅ Temperature displayed in Celsius
- ✅ Humidity displayed as percentage
- ✅ Weather icon matches conditions
- ✅ City name correct (or default Mumbai)

---

#### Scenario 4: Offline Functionality

**Objective:** Test offline data persistence

**Steps:**

1. **Online:**
   ```
   → Login as farmer
   → Add several animals
   → View dashboard data
   ```

2. **Go Offline:**
   ```
   → Open DevTools (F12)
   → Go to Network tab
   → Select "Offline" from throttling dropdown
   → Refresh page
   ```

3. **Verify:**
   ```
   → Check if data still visible
   → Try to add new animal (should queue)
   → Check offline indicator appears
   ```

4. **Go Online:**
   ```
   → Change throttling back to "Online"
   → Verify queued operations sync
   → Check offline indicator disappears
   ```

**Expected Results:**
- ✅ Data visible when offline
- ✅ Offline indicator shows
- ✅ Operations queue when offline
- ✅ Data syncs when back online

---

#### Scenario 5: Multilingual Support

**Objective:** Test language switching

**Steps:**

1. **Test Language Switch:**
   ```
   → Login to any dashboard
   → Click language switcher
   → Select "हिंदी" (Hindi)
   → Verify UI text changes to Hindi
   → Select "मराठी" (Marathi)
   → Verify UI text changes to Marathi
   → Select "English"
   → Verify UI text changes back to English
   ```

**Expected Results:**
- ✅ All UI text translates correctly
- ✅ No missing translations
- ✅ Language persists on refresh
- ✅ Smooth transition between languages

---

### Performance Testing

#### Load Time Testing

**Metrics to Check:**
- Initial page load: < 3 seconds
- Dashboard load: < 2 seconds
- Weather API response: < 1 second
- Notification delivery: < 5 seconds
- Firestore query: < 1 second

**Tools:**
- Chrome DevTools → Network tab
- Lighthouse audit
- React DevTools Profiler

---

### Security Testing

#### Authentication Testing

**Test Cases:**
1. **Unauthorized Access:**
   ```
   → Try accessing /dashboard without login
   → Should redirect to /login
   ```

2. **Role-Based Access:**
   ```
   → Login as farmer
   → Try accessing /vet/dashboard
   → Should be blocked or redirected
   ```

3. **Token Expiration:**
   ```
   → Login
   → Wait for token to expire
   → Try to perform action
   → Should prompt re-authentication
   ```

#### Firestore Rules Testing

**Test Cases:**
1. **User Data Privacy:**
   ```
   → Login as Farmer A
   → Try to read Farmer B's data
   → Should be denied
   ```

2. **Vet Access:**
   ```
   → Login as vet
   → Try to read all animals
   → Should succeed
   → Try to delete animal
   → Should be denied
   ```

3. **Government Access:**
   ```
   → Login as government
   → Try to read all data
   → Should succeed
   → Try to modify farmer data
   → Should be denied (read-only)
   ```

---

### Browser Compatibility Testing

**Test Browsers:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Test Features:**
- Login/Signup
- Dashboard loading
- Notifications
- Geolocation
- Service Worker
- Offline mode

---

### Mobile Testing

**Test Devices:**
- Android phone
- iPhone
- Tablet

**Test Features:**
- Responsive layout
- Touch interactions
- Push notifications
- Geolocation
- Camera (if used)

---

### Regression Testing Checklist

After any code changes, verify:

- [ ] All users can login
- [ ] Dashboards load correctly
- [ ] Notifications work
- [ ] Weather displays
- [ ] Data saves to Firestore
- [ ] Real-time updates work
- [ ] Offline mode functions
- [ ] Language switching works
- [ ] No console errors
- [ ] Build completes successfully

---


## 14. Deployment

### Production Build

#### Step 1: Prepare for Production

**Update Environment Variables:**

```env
# Frontend .env
NODE_ENV=production
REACT_APP_FIREBASE_API_KEY=your_production_key
# ... other production Firebase config

# Backend .env
NODE_ENV=production
PORT=5000
ADMIN_SETUP_CODE=your_secure_production_code
```

**Security Checklist:**
- [ ] Change admin setup code
- [ ] Use production Firebase project
- [ ] Enable Firestore security rules
- [ ] Secure service account key
- [ ] Use HTTPS for all connections
- [ ] Enable CORS only for production domain

---

#### Step 2: Build Frontend

```bash
npm run build
```

**Output:**
```
Creating an optimized production build...
Compiled successfully.

File sizes after gzip:
  364.14 kB  build/static/js/main.*.js
  5.63 kB    build/static/css/main.*.css

The build folder is ready to be deployed.
```

---

### Deployment Options

#### Option 1: Firebase Hosting (Recommended)

**Advantages:**
- Free tier available
- Automatic SSL
- CDN included
- Easy integration with Firebase services

**Steps:**

1. **Install Firebase CLI:**
```bash
npm install -g firebase-tools
```

2. **Login to Firebase:**
```bash
firebase login
```

3. **Initialize Hosting:**
```bash
firebase init hosting
```

**Configuration:**
- Public directory: `build`
- Single-page app: `Yes`
- Automatic builds: `No`

4. **Deploy:**
```bash
npm run build
firebase deploy --only hosting
```

5. **Access:**
```
https://your-project.web.app
https://your-project.firebaseapp.com
```

---

#### Option 2: Vercel

**Advantages:**
- Free tier
- Automatic deployments from Git
- Serverless functions support

**Steps:**

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
vercel
```

3. **Configure:**
- Framework: Create React App
- Build command: `npm run build`
- Output directory: `build`

4. **Production:**
```bash
vercel --prod
```

---

#### Option 3: Netlify

**Advantages:**
- Free tier
- Continuous deployment
- Form handling

**Steps:**

1. **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Deploy:**
```bash
netlify deploy
```

3. **Production:**
```bash
netlify deploy --prod
```

**Or use Netlify Dashboard:**
1. Connect Git repository
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Deploy

---

### Backend Deployment

#### Option 1: Heroku

**Steps:**

1. **Create Heroku App:**
```bash
heroku create smart-bio-farm-backend
```

2. **Add Procfile:**
```
web: node backend/server.js
```

3. **Set Environment Variables:**
```bash
heroku config:set NODE_ENV=production
heroku config:set PORT=5000
heroku config:set ADMIN_SETUP_CODE=your_code
```

4. **Deploy:**
```bash
git push heroku main
```

---

#### Option 2: Google Cloud Run

**Steps:**

1. **Create Dockerfile:**
```dockerfile
FROM node:16
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
EXPOSE 5000
CMD ["node", "server.js"]
```

2. **Build and Deploy:**
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/backend
gcloud run deploy --image gcr.io/PROJECT_ID/backend --platform managed
```

---

#### Option 3: AWS EC2

**Steps:**

1. **Launch EC2 Instance**
2. **Install Node.js:**
```bash
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Clone and Setup:**
```bash
git clone <repository>
cd smart-bio-farm/backend
npm install
```

4. **Use PM2 for Process Management:**
```bash
npm install -g pm2
pm2 start server.js
pm2 startup
pm2 save
```

5. **Configure Nginx:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### Post-Deployment Checklist

#### Frontend

- [ ] Application loads correctly
- [ ] All routes accessible
- [ ] Firebase connection working
- [ ] Notifications functional
- [ ] Weather data loading
- [ ] Images and assets loading
- [ ] No console errors
- [ ] SSL certificate valid
- [ ] Custom domain configured (if applicable)

#### Backend

- [ ] Server responding to health check
- [ ] All endpoints working
- [ ] Firebase Admin SDK connected
- [ ] Notifications sending successfully
- [ ] CORS configured for production domain
- [ ] Environment variables set
- [ ] Logs accessible
- [ ] Auto-restart configured
- [ ] SSL/HTTPS enabled

#### Firebase

- [ ] Firestore rules deployed
- [ ] Indexes deployed
- [ ] Authentication enabled
- [ ] Cloud Messaging configured
- [ ] Quotas sufficient
- [ ] Billing alerts set (if applicable)

---

### Monitoring & Maintenance

#### Application Monitoring

**Firebase Console:**
- Authentication usage
- Firestore reads/writes
- Cloud Messaging deliveries
- Hosting bandwidth

**Backend Monitoring:**
- Server uptime
- API response times
- Error rates
- Memory usage

**Tools:**
- Google Analytics (already integrated)
- Firebase Performance Monitoring
- Sentry (for error tracking)
- LogRocket (for session replay)

#### Regular Maintenance Tasks

**Weekly:**
- Check error logs
- Monitor API usage
- Review user feedback

**Monthly:**
- Update dependencies
- Review security rules
- Check quota usage
- Backup database

**Quarterly:**
- Security audit
- Performance optimization
- Feature updates
- User survey

---

### Scaling Considerations

#### When to Scale

**Indicators:**
- Response time > 3 seconds
- Error rate > 1%
- CPU usage > 80%
- Memory usage > 80%
- Firestore quota exceeded

#### Scaling Strategies

**Frontend:**
- Use CDN for static assets
- Implement code splitting
- Lazy load components
- Optimize images
- Enable caching

**Backend:**
- Horizontal scaling (multiple instances)
- Load balancer
- Database connection pooling
- Caching layer (Redis)
- Queue system for notifications

**Database:**
- Optimize queries
- Add composite indexes
- Implement pagination
- Archive old data
- Use Firestore bundles

---

### Backup & Recovery

#### Automated Backups

**Firestore:**
```bash
gcloud firestore export gs://your-bucket/backups
```

**Schedule with Cloud Scheduler:**
- Daily backups
- Retain for 30 days
- Store in Cloud Storage

#### Recovery Procedure

1. **Identify Issue:**
   - Check error logs
   - Identify affected data

2. **Restore from Backup:**
```bash
gcloud firestore import gs://your-bucket/backups/[BACKUP_ID]
```

3. **Verify:**
   - Test application
   - Verify data integrity
   - Check user access

4. **Communicate:**
   - Notify users if needed
   - Document incident
   - Update procedures

---


## 15. Troubleshooting

### Common Issues & Solutions

---

### Frontend Issues

#### Issue: Application Won't Start

**Symptoms:**
```
Error: Cannot find module 'react'
```

**Solutions:**
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install`
3. Run `npm start`

---

#### Issue: Firebase Connection Failed

**Symptoms:**
```
Firebase: Error (auth/invalid-api-key)
```

**Solutions:**
1. Check `.env` file exists
2. Verify all Firebase environment variables are set
3. Ensure no extra spaces in `.env` values
4. Restart development server after changing `.env`

---

#### Issue: Notifications Not Working

**Symptoms:**
- No notification permission prompt
- Notifications not appearing

**Solutions:**

**Check Permission:**
```javascript
console.log(Notification.permission); // Should be "granted"
```

**Check Service Worker:**
```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Registered:', regs.length);
});
```

**Check FCM Token:**
- Open browser console
- Look for "FCM Token:" log
- Verify token saved in Firestore

**Reset Permissions:**
1. Open browser settings
2. Go to Site Settings
3. Clear site data for localhost:3000
4. Reload page

---

#### Issue: Weather Not Loading

**Symptoms:**
- Weather widget shows loading forever
- "Error fetching weather" in console

**Solutions:**

1. **Check API Key:**
```javascript
// Verify API key is correct
const apiKey = "8f4980c2b086f0f5a64ebc8ba62d8326";
```

2. **Check Network:**
- Open DevTools → Network tab
- Look for OpenWeatherMap API call
- Check response status

3. **Check Geolocation:**
```javascript
navigator.geolocation.getCurrentPosition(
  pos => console.log('Location:', pos.coords),
  err => console.log('Error:', err)
);
```

4. **Test API Directly:**
```bash
curl "https://api.openweathermap.org/data/2.5/weather?lat=19.0760&lon=72.8777&units=metric&appid=8f4980c2b086f0f5a64ebc8ba62d8326"
```

---

#### Issue: Build Fails

**Symptoms:**
```
Failed to compile.
```

**Solutions:**

1. **Check for Syntax Errors:**
```bash
npm run build 2>&1 | grep "Error"
```

2. **Clear Cache:**
```bash
rm -rf node_modules/.cache
npm run build
```

3. **Check Dependencies:**
```bash
npm audit
npm audit fix
```

---

### Backend Issues

#### Issue: Backend Won't Start

**Symptoms:**
```
Error: Cannot find module 'express'
```

**Solutions:**
1. Navigate to backend folder: `cd backend`
2. Install dependencies: `npm install`
3. Start server: `npm start`

---

#### Issue: Firebase Admin SDK Error

**Symptoms:**
```
Error: Could not load the default credentials
```

**Solutions:**

1. **Check Service Account Key:**
```bash
ls backend/serviceAccountKey.json
```

2. **Verify JSON Format:**
```bash
cat backend/serviceAccountKey.json | python -m json.tool
```

3. **Re-download Key:**
- Go to Firebase Console
- Project Settings → Service Accounts
- Generate new private key
- Replace `serviceAccountKey.json`

---

#### Issue: Notifications Not Sending

**Symptoms:**
- Backend logs show errors
- Users not receiving notifications

**Solutions:**

1. **Check FCM Tokens:**
```javascript
// In Firestore, verify users have fcmToken field
```

2. **Check Backend Logs:**
```bash
# Look for FCM errors
Error sending message: ...
```

3. **Test Endpoint:**
```bash
curl -X POST http://localhost:5000/send-to-user \
  -H "Content-Type: application/json" \
  -d '{"token":"test","title":"Test","body":"Test"}'
```

4. **Verify Firebase Project:**
- Ensure Cloud Messaging API is enabled
- Check project quotas

---

### Database Issues

#### Issue: Firestore Permission Denied

**Symptoms:**
```
FirebaseError: Missing or insufficient permissions
```

**Solutions:**

1. **Check Security Rules:**
```bash
firebase deploy --only firestore:rules
```

2. **Verify User Authentication:**
```javascript
console.log('Current User:', auth.currentUser);
```

3. **Check Rule Conditions:**
- Ensure user role matches required role
- Verify document ownership

---

#### Issue: Data Not Syncing

**Symptoms:**
- Changes not appearing in real-time
- Stale data displayed

**Solutions:**

1. **Check Network:**
- Open DevTools → Network tab
- Look for WebSocket connections
- Verify not offline

2. **Check Listeners:**
```javascript
// Ensure unsubscribe is called properly
useEffect(() => {
  const unsubscribe = subscribeData(callback);
  return () => unsubscribe(); // Important!
}, []);
```

3. **Clear Cache:**
```javascript
// In browser console
indexedDB.deleteDatabase('firestore/[PROJECT_ID]/[DATABASE]');
```

---

### Authentication Issues

#### Issue: Can't Login

**Symptoms:**
```
FirebaseError: auth/wrong-password
FirebaseError: auth/user-not-found
```

**Solutions:**

1. **Verify Credentials:**
- Check email format
- Verify password

2. **Check Firebase Console:**
- Go to Authentication
- Verify user exists
- Check if account is disabled

3. **Reset Password:**
- Use "Forgot Password" feature
- Or manually reset in Firebase Console

---

#### Issue: Session Expires Too Quickly

**Symptoms:**
- User logged out unexpectedly
- Need to login frequently

**Solutions:**

1. **Check Token Refresh:**
```javascript
// Firebase automatically refreshes tokens
// Check for errors in console
```

2. **Verify Persistence:**
```javascript
// In firebase.js
setPersistence(auth, browserLocalPersistence);
```

---

### Performance Issues

#### Issue: Slow Page Load

**Symptoms:**
- Pages take > 5 seconds to load
- Laggy interactions

**Solutions:**

1. **Check Network:**
- Open DevTools → Network tab
- Look for slow requests
- Check file sizes

2. **Optimize Images:**
```bash
# Use image optimization tools
npm install -g imagemin-cli
imagemin public/*.png --out-dir=public/optimized
```

3. **Code Splitting:**
```javascript
// Use React.lazy for route-based splitting
const FarmerDashboard = React.lazy(() => import('./pages/FarmerDashboard'));
```

4. **Analyze Bundle:**
```bash
npm run build
npx source-map-explorer build/static/js/*.js
```

---

#### Issue: High Memory Usage

**Symptoms:**
- Browser tab crashes
- "Out of memory" errors

**Solutions:**

1. **Check for Memory Leaks:**
```javascript
// Ensure cleanup in useEffect
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe(); // Cleanup!
}, []);
```

2. **Limit Data Fetching:**
```javascript
// Use pagination
const q = query(collection, limit(50));
```

3. **Clear Unused Data:**
```javascript
// Clear state when component unmounts
useEffect(() => {
  return () => setData([]);
}, []);
```

---

### Browser-Specific Issues

#### Chrome

**Issue:** Service Worker not updating

**Solution:**
1. Open DevTools
2. Application → Service Workers
3. Check "Update on reload"
4. Click "Unregister" and reload

---

#### Firefox

**Issue:** Notifications not showing

**Solution:**
1. Check Firefox settings
2. Ensure notifications allowed for localhost
3. Check "Do Not Disturb" mode is off

---

#### Safari

**Issue:** Push notifications not supported

**Solution:**
- Safari has limited FCM support
- Use alternative notification method
- Or test on Chrome/Firefox

---

### Development Tools

#### Useful Commands

**Clear All Caches:**
```bash
rm -rf node_modules/.cache
rm -rf build
npm cache clean --force
```

**Reset Firebase Emulators:**
```bash
firebase emulators:start --clear-data
```

**Check Port Usage:**
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :3000
lsof -i :5000
```

**Kill Process on Port:**
```bash
# Windows
taskkill /PID <PID> /F

# Mac/Linux
kill -9 <PID>
```

---

### Getting Help

#### Resources

**Documentation:**
- [React Docs](https://react.dev/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

**Community:**
- Stack Overflow
- Firebase Community
- React Community Discord

**Project-Specific:**
- Check `PROJECT_DOCUMENTATION.md`
- Run test scripts
- Check browser console
- Review backend logs

---

### Debug Mode

#### Enable Verbose Logging

**Frontend:**
```javascript
// In firebase.js
firebase.setLogLevel('debug');
```

**Backend:**
```javascript
// In server.js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

#### Browser DevTools

**Useful Panels:**
- Console: Errors and logs
- Network: API calls
- Application: Storage, Service Workers
- Performance: Profiling
- Lighthouse: Audits

---


---

## Appendix

### A. Quick Reference

#### Essential Commands

```bash
# Start Development
npm start                              # Start frontend (port 3000)
cd backend && npm start                # Start backend (port 5000)

# Build
npm run build                          # Production build

# Testing
node backend/test-firebase-connection.js  # Test Firebase
node test-notifications.js                # Test notifications
node test-weather.js                      # Test weather

# Firebase
firebase login                         # Login to Firebase
firebase deploy --only firestore:rules # Deploy rules
firebase deploy --only hosting         # Deploy frontend

# Cleanup
rm -rf node_modules                    # Remove dependencies
npm install                            # Reinstall dependencies
npm cache clean --force                # Clear npm cache
```

---

### B. Environment Variables Reference

#### Frontend (.env)

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Optional
REACT_APP_WEATHER_API_KEY=your_weather_key
```

#### Backend (backend/.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Admin Code
ADMIN_SETUP_CODE=SMART_GOV_2025

# Optional
JWT_SECRET=your_jwt_secret
```

---

### C. API Endpoints Reference

#### Backend API

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/` | GET | - | `{ status, timestamp }` |
| `/validate-admin-code` | POST | `{ code }` | `{ valid, error? }` |
| `/send-to-user` | POST | `{ token, title, body, data? }` | `{ success, response }` |
| `/send-to-vets` | POST | `{ tokens[], title, body, data? }` | `{ success, successCount, failureCount }` |
| `/notify-vets-new-request` | POST | `{ requestId, animalType, category }` | `{ success, successCount, failureCount }` |
| `/notify-farmer-treatment` | POST | `{ farmerId, animalType, requestId }` | `{ success, response }` |
| `/notify-farmers-new-alert` | POST | `{ alertType, alertMessage, createdByName }` | `{ success, successCount, failureCount }` |

#### OpenWeatherMap API

```
GET https://api.openweathermap.org/data/2.5/weather
  ?lat={latitude}
  &lon={longitude}
  &units=metric
  &appid={api_key}
```

---

### D. Firestore Collections Reference

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| `users` | User profiles | userId, email, fullName, role, fcmToken |
| `livestock` | Livestock records (legacy) | userId, animalType, date, quantity |
| `animals` | Shared animals | ownerId, type, healthStatus, quantity |
| `environmentalData` | Sensor data | temperature, humidity, timestamp |
| `alerts` | Global alerts | type, message, isGlobal, timestamp |
| `vetReports` | Treatment reports | vetId, farmerId, animalId, medicine |
| `vetRequests` | Treatment requests | farmerId, animalType, status, urgency |

---

### E. User Roles & Permissions

| Feature | Farmer | Vet | Government |
|---------|--------|-----|------------|
| View own animals | ✅ | ❌ | ❌ |
| View all animals | ❌ | ✅ | ✅ |
| Create requests | ✅ | ❌ | ❌ |
| View all requests | ❌ | ✅ | ✅ |
| Create reports | ❌ | ✅ | ❌ |
| View all reports | ❌ | ✅ | ✅ |
| Create alerts | ❌ | ❌ | ✅ |
| View statistics | ❌ | ✅ | ✅ |

---

### F. Technology Versions

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI Framework |
| Node.js | 16+ | Runtime |
| Express | 5.1.0 | Backend Server |
| Firebase SDK | 12.6.0 | Frontend Firebase |
| Firebase Admin | 13.6.0 | Backend Firebase |
| React Router | 7.9.6 | Routing |
| Tailwind CSS | 3.4.18 | Styling |
| i18next | 25.6.3 | Internationalization |
| Recharts | 3.4.1 | Charts |

---

### G. Project Statistics

**Lines of Code:** ~15,000+  
**Components:** 20+  
**Pages:** 14  
**API Endpoints:** 7  
**Database Collections:** 7  
**Supported Languages:** 3 (English, Hindi, Marathi)  
**User Roles:** 3 (Farmer, Veterinarian, Government)

---

### H. Performance Benchmarks

| Metric | Target | Current |
|--------|--------|---------|
| Initial Load | < 3s | ~2s |
| Dashboard Load | < 2s | ~1.5s |
| Weather API | < 1s | ~0.5s |
| Notification Delivery | < 5s | ~2s |
| Firestore Query | < 1s | ~0.3s |
| Build Time | < 2min | ~1min |

---

### I. Security Checklist

- [x] Firebase Authentication enabled
- [x] Firestore security rules configured
- [x] Role-based access control
- [x] Service account key secured
- [x] Environment variables protected
- [x] CORS configured
- [x] HTTPS enforced (production)
- [x] Input validation
- [x] XSS protection
- [x] CSRF protection

---

### J. Future Enhancements

**Planned Features:**
- [ ] 5-day weather forecast
- [ ] SMS notifications
- [ ] Email notifications
- [ ] Export data to PDF/Excel
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Voice commands
- [ ] AI-powered disease detection
- [ ] Marketplace for livestock
- [ ] Integration with IoT sensors

**Technical Improvements:**
- [ ] Unit tests (Jest)
- [ ] E2E tests (Cypress)
- [ ] CI/CD pipeline
- [ ] Docker containerization
- [ ] Kubernetes orchestration
- [ ] Redis caching
- [ ] GraphQL API
- [ ] WebSocket for real-time updates
- [ ] Progressive Web App (PWA)
- [ ] Server-side rendering (SSR)

---

### K. License & Credits

**Project:** Smart Bio Farm  
**Version:** 0.1.0  
**License:** MIT (or your chosen license)

**Technologies Used:**
- React - Facebook
- Firebase - Google
- Tailwind CSS - Tailwind Labs
- OpenWeatherMap - OpenWeather
- Lucide Icons - Lucide
- Recharts - Recharts Team

**Special Thanks:**
- Firebase team for excellent documentation
- React community for helpful resources
- OpenWeatherMap for free weather API
- All open-source contributors

---

### L. Contact & Support

**Project Repository:** [Your GitHub URL]  
**Documentation:** This file  
**Issues:** [GitHub Issues URL]  
**Discussions:** [GitHub Discussions URL]

**For Support:**
1. Check this documentation
2. Run test scripts
3. Check browser console
4. Review backend logs
5. Search existing issues
6. Create new issue with details

---

## Document Information

**Document Version:** 1.0  
**Last Updated:** November 19, 2025  
**Author:** Smart Bio Farm Team  
**Status:** Complete

**Changelog:**
- v1.0 (Nov 19, 2025): Initial comprehensive documentation

---

## End of Documentation

Thank you for using Smart Bio Farm! 🌾🐄🐖🐔

For the latest updates and information, please refer to the project repository.

---
