/**
 * Register Firebase Messaging Service Worker with proper scope for GitHub Pages
 */
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const swPath = `${process.env.PUBLIC_URL}/firebase-messaging-sw.js`;
      const registration = await navigator.serviceWorker.register(swPath, {
        scope: `${process.env.PUBLIC_URL}/`
      });
      console.log('Service Worker registered successfully:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};
