# Smart Bio Farm - Notification Backend

## Overview
This is a Node.js Express server that handles push notifications for the Smart Bio Farm application using Firebase Cloud Messaging (FCM).

## Features
- ✅ Send notifications to individual users
- ✅ Send notifications to multiple veterinarians
- ✅ Notify vets when farmers submit requests
- ✅ Notify farmers when treatment is completed
- ✅ No Firebase Blaze plan required (runs locally or on any hosting)

## Setup Instructions

### 1. Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **smartbiofarm**
3. Click the gear icon ⚙️ → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the downloaded JSON file as `serviceAccountKey.json` in the `backend` folder

⚠️ **IMPORTANT**: Never commit `serviceAccountKey.json` to Git! It contains sensitive credentials.

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Start the Server

#### Option A: Using PM2 (Recommended for Production)

PM2 is a process manager that keeps your server running continuously and restarts it automatically if it crashes.

```bash
# Start with PM2
pm2 start backend/ecosystem.config.js

# View status
pm2 status

# View logs
pm2 logs smart-bio-farm-backend

# Stop server
pm2 stop smart-bio-farm-backend

# Restart server
pm2 restart smart-bio-farm-backend
```

See [PM2_GUIDE.md](./PM2_GUIDE.md) for complete PM2 documentation.

#### Option B: Using npm (Development)

```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /
```
Returns server status and timestamp.

### Send Notification to Single User
```
POST /send-to-user
Content-Type: application/json

{
  "token": "user_fcm_token",
  "title": "Notification Title",
  "body": "Notification message",
  "data": {
    "key": "value"
  }
}
```

### Send Notification to Multiple Vets
```
POST /send-to-vets
Content-Type: application/json

{
  "tokens": ["token1", "token2", "token3"],
  "title": "Notification Title",
  "body": "Notification message",
  "data": {
    "key": "value"
  }
}
```

### Notify Vets About New Request
```
POST /notify-vets-new-request
Content-Type: application/json

{
  "requestId": "abc123",
  "animalType": "pigs",
  "category": "Boar"
}
```
This endpoint automatically fetches all veterinarians from Firestore and sends notifications.

### Notify Farmer About Treatment
```
POST /notify-farmer-treatment
Content-Type: application/json

{
  "farmerId": "farmer_uid",
  "animalType": "chickens",
  "requestId": "abc123"
}
```
This endpoint fetches the farmer's FCM token and sends a notification.

### Notify All Farmers About New Alert
```
POST /notify-farmers-new-alert
Content-Type: application/json

{
  "alertType": "warning",
  "alertMessage": "Heavy rain expected tomorrow",
  "createdByName": "John Farmer"
}
```
This endpoint automatically fetches all farmers from Firestore and sends notifications about new alerts.

## Integration with React App

### Example: Call from React when farmer submits request

```javascript
// In FarmerDashboard.js after creating vetRequest
const response = await fetch('http://localhost:5000/notify-vets-new-request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    requestId: docRef.id,
    animalType: reportAnimalType,
    category: reportCategory
  })
});
```

### Example: Call from React when vet completes treatment

```javascript
// In VetRequests.js after updating vetRequest
const response = await fetch('http://localhost:5000/notify-farmer-treatment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    farmerId: selectedRequest.farmerId,
    animalType: selectedRequest.animalType,
    requestId: selectedRequest.id
  })
});
```

### Example: Call from React when farmer adds alert

```javascript
// In FarmerDashboard.js after creating alert
const response = await fetch('http://localhost:5000/notify-farmers-new-alert', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    alertType: 'warning',
    alertMessage: 'Heavy rain expected tomorrow',
    createdByName: currentUser?.displayName || 'A Farmer'
  })
});
```

## Environment Variables (Optional)

Create a `.env` file in the backend folder:

```
PORT=5000
NODE_ENV=development
```

## Deployment Options

### Option 1: Run Locally
```bash
npm start
```

### Option 2: Deploy to Heroku (Free)
```bash
heroku create smart-bio-farm-backend
git push heroku main
```

### Option 3: Deploy to Railway (Free)
1. Connect your GitHub repo
2. Railway will auto-detect Node.js
3. Add `serviceAccountKey.json` as a secret file

### Option 4: Deploy to Render (Free)
1. Connect your GitHub repo
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add `serviceAccountKey.json` as a secret file

## Security Notes

- ✅ CORS is enabled for all origins (restrict in production)
- ✅ Service account key should never be committed to Git
- ✅ Add `.gitignore` entry for `serviceAccountKey.json`
- ✅ Use environment variables for sensitive data in production

## Troubleshooting

### Server won't start
- Check if port 5000 is already in use
- Verify `serviceAccountKey.json` exists in backend folder
- Run `npm install` to ensure dependencies are installed

### Notifications not sending
- Check if FCM tokens are saved in Firestore
- Verify service account has proper permissions
- Check server logs for error messages

### CORS errors
- Ensure backend server is running
- Check if React app is making requests to correct URL
- Verify CORS is enabled in server.js

## Logs

The server logs all notification attempts:
- ✅ Successful sends
- ❌ Failed sends
- 📊 Success/failure counts

## Cost

**100% FREE** - No Firebase Blaze plan required!
- Runs on your local machine
- Can be deployed to free hosting services
- Only uses Firebase Admin SDK (no Cloud Functions)

---

**Status**: Ready to use! 🚀
