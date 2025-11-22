const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/* 
|--------------------------------------------------------------------------
| 1. When Farmer Sends a Request → Notify Veterinarians
|--------------------------------------------------------------------------
*/
exports.notifyVetsOnRequest = functions.firestore
  .document("vetRequests/{requestId}")
  .onCreate(async (snap, context) => {
    const requestData = snap.data();

    console.log("New vet request created:", context.params.requestId);
    console.log("Request data:", requestData);
    console.log("Farmer ID:", requestData.farmerId);

    // Fetch all veterinarians
    const vetsSnap = await db.collection("users")
      .where("role", "==", "veterinarian")
      .get();

    const tokens = [];

    vetsSnap.forEach((doc) => {
      const data = doc.data();
      if (data.fcmToken) {
        tokens.push(data.fcmToken);
      }
    });

    if (tokens.length === 0) {
      console.log("No veterinarian tokens found.");
      return null;
    }

    console.log(`Sending notification to ${tokens.length} veterinarians`);

    const message = {
      notification: {
        title: "New Animal Treatment Request",
        body: `A farmer needs help with ${requestData.animalType} - ${requestData.category}`,
      },
      data: {
        requestId: context.params.requestId,
        animalType: requestData.animalType,
        url: "/vet-requests"
      },
      tokens: tokens,
    };

    try {
      const response = await admin.messaging().sendMulticast(message);
      console.log("Successfully sent notifications:", response.successCount);
      return response;
    } catch (error) {
      console.error("Error sending notifications:", error);
      return null;
    }
  });

/* 
|--------------------------------------------------------------------------
| 2. When Vet Adds a Treatment Report → Notify Farmer
|--------------------------------------------------------------------------
*/
exports.notifyFarmerOnTreatment = functions.firestore
  .document("vetReports/{reportId}")
  .onCreate(async (snap, context) => {
    const report = snap.data();
    const farmerId = report.farmerId;

    console.log("New vet report created:", context.params.reportId);
    console.log("Report data:", report);

    // Fetch farmer user data
    const farmerDoc = await db.collection("users").doc(farmerId).get();

    if (!farmerDoc.exists) {
      console.log("Farmer document not found:", farmerId);
      return null;
    }

    const farmerData = farmerDoc.data();
    const token = farmerData.fcmToken;

    if (!token) {
      console.log("Farmer has no FCM token.");
      return null;
    }

    console.log("Sending treatment notification to farmer:", farmerId);

    const message = {
      notification: {
        title: "Vet Submitted a Treatment Report",
        body: `Treatment report available for your ${report.animalType}`,
      },
      data: {
        reportId: context.params.reportId,
        animalType: report.animalType,
        url: "/farmer/requests"
      },
      token: token,
    };

    try {
      const response = await admin.messaging().send(message);
      console.log("Successfully sent notification to farmer:", response);
      return response;
    } catch (error) {
      console.error("Error sending notification to farmer:", error);
      return null;
    }
  });

/* 
|--------------------------------------------------------------------------
| 3. When Vet Completes Treatment (vetRequest status updated) → Notify Farmer
|--------------------------------------------------------------------------
*/
exports.notifyFarmerOnTreatmentComplete = functions.firestore
  .document("vetRequests/{requestId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Check if status changed to "completed"
    if (before.status !== "completed" && after.status === "completed") {
      console.log("Treatment completed for request:", context.params.requestId);

      const farmerId = after.farmerId;

      // Fetch farmer user data
      const farmerDoc = await db.collection("users").doc(farmerId).get();

      if (!farmerDoc.exists) {
        console.log("Farmer document not found:", farmerId);
        return null;
      }

      const farmerData = farmerDoc.data();
      const token = farmerData.fcmToken;

      if (!token) {
        console.log("Farmer has no FCM token.");
        return null;
      }

      console.log("Sending completion notification to farmer:", farmerId);

      const message = {
        notification: {
          title: "Treatment Completed!",
          body: `Your ${after.animalType} has been treated. Check the details now.`,
        },
        data: {
          requestId: context.params.requestId,
          animalType: after.animalType,
          url: "/farmer/requests"
        },
        token: token,
      };

      try {
        const response = await admin.messaging().send(message);
        console.log("Successfully sent completion notification:", response);
        return response;
      } catch (error) {
        console.error("Error sending completion notification:", error);
        return null;
      }
    }

    return null;
  });

/* 
|--------------------------------------------------------------------------
| 4. When Alert is Created → Notify User
|--------------------------------------------------------------------------
*/
exports.notifyUserOnAlert = functions.firestore
  .document("alerts/{alertId}")
  .onCreate(async (snap, context) => {
    const alert = snap.data();
    const userId = alert.userId;

    console.log("New alert created:", context.params.alertId);
    console.log("Alert data:", alert);

    // Fetch user data
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      console.log("User document not found:", userId);
      return null;
    }

    const userData = userDoc.data();
    const token = userData.fcmToken;

    if (!token) {
      console.log("User has no FCM token.");
      return null;
    }

    console.log("Sending alert notification to user:", userId);

    const message = {
      notification: {
        title: "New Alert",
        body: alert.message,
      },
      data: {
        alertId: context.params.alertId,
        type: alert.type || "info",
        url: "/dashboard"
      },
      token: token,
    };

    try {
      const response = await admin.messaging().send(message);
      console.log("Successfully sent alert notification:", response);
      return response;
    } catch (error) {
      console.error("Error sending alert notification:", error);
      return null;
    }
  });

/* 
|--------------------------------------------------------------------------
| 5. Callable Function - Store FCM Token
|--------------------------------------------------------------------------
*/
exports.storeUserToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const userId = context.auth.uid;
  const token = data.fcmToken;

  if (!token) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "FCM token is required"
    );
  }

  try {
    await db.collection("users").doc(userId).set(
      {
        fcmToken: token,
        fcmTokenUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    console.log("FCM token stored for user:", userId);
    return { success: true };
  } catch (error) {
    console.error("Error storing FCM token:", error);
    throw new functions.https.HttpsError("internal", "Failed to store token");
  }
});

/* 
|--------------------------------------------------------------------------
| 6. HTTP Function - Notify All Farmers About New Alert
|--------------------------------------------------------------------------
*/
exports.notifyFarmersNewAlert = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { alertType, alertMessage, createdByName } = req.body;

  if (!alertType || !alertMessage) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    // Fetch all farmers
    const farmersSnap = await db.collection("users")
      .where("role", "==", "farmer")
      .get();

    const tokens = [];
    farmersSnap.forEach((doc) => {
      const data = doc.data();
      if (data.fcmToken) {
        tokens.push(data.fcmToken);
      }
    });

    if (tokens.length === 0) {
      console.log("No farmer tokens found");
      res.json({ successCount: 0, message: "No farmers to notify" });
      return;
    }

    console.log(`Sending alert to ${tokens.length} farmers`);

    const message = {
      notification: {
        title: `${alertType.toUpperCase()} Alert`,
        body: alertMessage,
      },
      data: {
        alertType,
        createdBy: createdByName || "System",
        url: "/dashboard"
      },
      tokens: tokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log(`Alert sent: ${response.successCount} successful, ${response.failureCount} failed`);

    res.json({
      successCount: response.successCount,
      failureCount: response.failureCount
    });
  } catch (error) {
    console.error("Error sending alert notifications:", error);
    res.status(500).json({ error: "Failed to send notifications" });
  }
});

/* 
|--------------------------------------------------------------------------
| 7. HTTP Function - Notify All Vets About New Request
|--------------------------------------------------------------------------
*/
exports.notifyVetsNewRequest = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { farmerName, animalType, symptoms, urgency } = req.body;

  try {
    // Fetch all veterinarians
    const vetsSnap = await db.collection("users")
      .where("role", "==", "veterinarian")
      .get();

    const tokens = [];
    vetsSnap.forEach((doc) => {
      const data = doc.data();
      if (data.fcmToken) {
        tokens.push(data.fcmToken);
      }
    });

    if (tokens.length === 0) {
      console.log("No vet tokens found");
      res.json({ successCount: 0, message: "No vets to notify" });
      return;
    }

    console.log(`Sending request notification to ${tokens.length} vets`);

    const urgencyEmoji = urgency === "urgent" ? "🚨 " : urgency === "high" ? "⚠️ " : "";
    
    const message = {
      notification: {
        title: `${urgencyEmoji}New Treatment Request`,
        body: `${farmerName} needs help with ${animalType}`,
      },
      data: {
        farmerName: farmerName || "A Farmer",
        animalType: animalType || "animal",
        symptoms: symptoms || "",
        urgency: urgency || "normal",
        url: "/vet-requests"
      },
      tokens: tokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log(`Request notification sent: ${response.successCount} successful`);

    res.json({
      successCount: response.successCount,
      failureCount: response.failureCount
    });
  } catch (error) {
    console.error("Error sending vet notifications:", error);
    res.status(500).json({ error: "Failed to send notifications" });
  }
});

/* 
|--------------------------------------------------------------------------
| 8. HTTP Function - Notify Farmer About Treatment
|--------------------------------------------------------------------------
*/
exports.notifyFarmerTreatment = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { vetName, animalType, diagnosis, treatment } = req.body;

  try {
    // In a real scenario, you'd get the farmer's ID from the request
    // For now, we'll send to all farmers (you should modify this)
    const farmersSnap = await db.collection("users")
      .where("role", "==", "farmer")
      .get();

    const tokens = [];
    farmersSnap.forEach((doc) => {
      const data = doc.data();
      if (data.fcmToken) {
        tokens.push(data.fcmToken);
      }
    });

    if (tokens.length === 0) {
      console.log("No farmer tokens found");
      res.json({ success: false, message: "No farmers to notify" });
      return;
    }

    console.log(`Sending treatment notification to farmers`);

    const message = {
      notification: {
        title: "✅ Treatment Completed",
        body: `Dr. ${vetName} has completed treatment for your ${animalType}`,
      },
      data: {
        vetName: vetName || "Veterinarian",
        animalType: animalType || "animal",
        diagnosis: diagnosis || "",
        treatment: treatment || "",
        url: "/farmer/requests"
      },
      tokens: tokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log(`Treatment notification sent: ${response.successCount} successful`);

    res.json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount
    });
  } catch (error) {
    console.error("Error sending treatment notification:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

/* 
|--------------------------------------------------------------------------
| 9. HTTP Function - Validate Admin Code
|--------------------------------------------------------------------------
*/
exports.validateAdminCode = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { code } = req.body;
  
  // In production, store this in Firestore or environment variables
  const VALID_ADMIN_CODE = "SMART_GOV_2025";
  
  const valid = code === VALID_ADMIN_CODE;
  
  res.json({ valid });
});
