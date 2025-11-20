const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const path = require("path");

// Load Firebase admin private key
const serviceAccount = require(path.join(__dirname, "serviceAccountKey.json"));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

// Admin setup code - Store in environment variable for production
const ADMIN_SETUP_CODE = process.env.ADMIN_SETUP_CODE || "SMART_GOV_2025";

// Health check endpoint
app.get("/", (req, res) => {
  res.send({ status: "Server is running", timestamp: new Date() });
});

// 🔐 Validate admin code for government signup
app.post("/validate-admin-code", async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ 
        valid: false, 
        error: "Admin code is required" 
      });
    }
    
    // Validate code
    if (code === ADMIN_SETUP_CODE) {
      console.log("✅ Admin code validated successfully");
      return res.json({ valid: true });
    } else {
      console.log("❌ Invalid admin code attempt");
      return res.status(401).json({ 
        valid: false, 
        error: "Invalid admin code" 
      });
    }
  } catch (error) {
    console.error("Error validating admin code:", error);
    return res.status(500).json({ 
      valid: false, 
      error: "Server error" 
    });
  }
});

// 🔥 Send notification to a single user
app.post("/send-to-user", async (req, res) => {
  const { token, title, body, data } = req.body;

  if (!token) return res.status(400).send({ error: "FCM token missing" });

  const message = {
    notification: { title, body },
    token,
  };

  // Add optional data payload
  if (data) {
    message.data = data;
  }

  try {
    const response = await admin.messaging().send(message);
    console.log("Successfully sent message to user:", response);
    res.send({ success: true, response });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).send({ error: error.message });
  }
});

// 🔥 Send notification to multiple users (vets)
app.post("/send-to-vets", async (req, res) => {
  const { tokens, title, body, data } = req.body;

  if (!tokens || tokens.length === 0) {
    return res.status(400).send({ error: "Vet tokens missing" });
  }

  const message = {
    notification: { title, body }
  };

  // Add optional data payload
  if (data) {
    message.data = data;
  }

  try {
    // Send to each token individually
    const promises = tokens.map(token => 
      admin.messaging().send({ ...message, token })
    );

    const results = await Promise.allSettled(promises);
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;

    console.log(`Successfully sent ${successCount} messages to vets (${failureCount} failed)`);
    res.send({ 
      success: true, 
      successCount: successCount,
      failureCount: failureCount
    });
  } catch (error) {
    console.error("Error sending messages:", error);
    res.status(500).send({ error: error.message });
  }
});

// 🔥 Notify all vets about new request
app.post("/notify-vets-new-request", async (req, res) => {
  const { requestId, animalType, category } = req.body;

  try {
    // Fetch all veterinarians
    const vetsSnapshot = await db.collection("users")
      .where("role", "==", "veterinarian")
      .get();

    const tokens = [];
    vetsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.fcmToken) {
        tokens.push(data.fcmToken);
      }
    });

    if (tokens.length === 0) {
      return res.send({ success: true, message: "No veterinarian tokens found" });
    }

    const message = {
      notification: {
        title: "New Animal Treatment Request",
        body: `A farmer needs help with ${animalType} - ${category}`,
      },
      data: {
        requestId: requestId,
        animalType: animalType,
        url: "/vet-requests"
      }
    };

    // Send to each token individually
    const promises = tokens.map(token => 
      admin.messaging().send({ ...message, token })
    );

    const results = await Promise.allSettled(promises);
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Notified ${successCount} veterinarians (${failureCount} failed)`);
    
    res.send({ 
      success: true, 
      successCount: successCount,
      failureCount: failureCount 
    });
  } catch (error) {
    console.error("Error notifying vets:", error);
    res.status(500).send({ error: error.message });
  }
});

// 🔥 Notify farmer about treatment completion
app.post("/notify-farmer-treatment", async (req, res) => {
  const { farmerId, animalType, requestId } = req.body;

  try {
    // Fetch farmer data
    const farmerDoc = await db.collection("users").doc(farmerId).get();

    if (!farmerDoc.exists) {
      return res.status(404).send({ error: "Farmer not found" });
    }

    const farmerData = farmerDoc.data();
    const token = farmerData.fcmToken;

    if (!token) {
      return res.send({ success: true, message: "Farmer has no FCM token" });
    }

    const message = {
      notification: {
        title: "Treatment Completed!",
        body: `Your ${animalType} has been treated. Check the details now.`,
      },
      data: {
        requestId: requestId,
        animalType: animalType,
        url: "/farmer/requests"
      },
      token: token,
    };

    const response = await admin.messaging().send(message);
    console.log("Successfully notified farmer:", response);
    
    res.send({ success: true, response });
  } catch (error) {
    console.error("Error notifying farmer:", error);
    res.status(500).send({ error: error.message });
  }
});

// 🔥 Notify all farmers about new alert
app.post("/notify-farmers-new-alert", async (req, res) => {
  const { alertType, alertMessage, createdByName } = req.body;

  try {
    // Fetch all farmers
    const farmersSnapshot = await db.collection("users")
      .where("role", "==", "farmer")
      .get();

    const tokens = [];
    farmersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.fcmToken) {
        tokens.push(data.fcmToken);
      }
    });

    if (tokens.length === 0) {
      return res.send({ success: true, message: "No farmer tokens found" });
    }

    // Determine notification title based on alert type
    let title = "New Alert";
    if (alertType === "warning") {
      title = "⚠️ Warning Alert";
    } else if (alertType === "alert") {
      title = "🚨 Critical Alert";
    } else {
      title = "ℹ️ New Information";
    }

    const message = {
      notification: {
        title: title,
        body: `${createdByName}: ${alertMessage}`,
      },
      data: {
        alertType: alertType,
        url: "/farmer-dashboard"
      }
    };

    // Send to each token individually
    const promises = tokens.map(token => 
      admin.messaging().send({ ...message, token })
    );

    const results = await Promise.allSettled(promises);
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Notified ${successCount} farmers about new alert (${failureCount} failed)`);
    
    res.send({ 
      success: true, 
      successCount: successCount,
      failureCount: failureCount 
    });
  } catch (error) {
    console.error("Error notifying farmers:", error);
    res.status(500).send({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Notification server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/`);
});
