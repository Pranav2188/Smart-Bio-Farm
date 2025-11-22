// Firebase Cloud Messaging Service Worker
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAGpDMlQR6SzVtSQjcgS1FsuNT4dTftJqI",
  authDomain: "smartbiofarm.firebaseapp.com",
  projectId: "smartbiofarm",
  storageBucket: "smartbiofarm.firebasestorage.app",
  messagingSenderId: "494318108784",
  appId: "1:494318108784:web:5eaebb70f86bf19e9db4b5"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message:", payload);

  const notificationTitle = payload.notification?.title || "Smart Bio Farm";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification",
    icon: "/Smart-Bio-Farm/logo192.png",
    badge: "/Smart-Bio-Farm/logo192.png",
    tag: payload.data?.tag || "default",
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log("Notification clicked:", event);
  event.notification.close();

  // Open the app when notification is clicked
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/Smart-Bio-Farm/')
  );
});
