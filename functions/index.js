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
