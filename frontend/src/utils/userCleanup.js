// Utility to clean up all user-related data
export const clearAllUserData = () => {
  // Clear localStorage
  localStorage.clear();
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Clear any cookies (if they exist)
  document.cookie.split(";").forEach((c) => {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
  
  // Clear any potential indexedDB
  if (window.indexedDB) {
    const databases = ['user-data', 'auth', 'profile', 'appointments'];
    databases.forEach(dbName => {
      try {
        indexedDB.deleteDatabase(dbName);
      } catch (e) {
        // Ignore errors if database doesn't exist
      }
    });
  }
  
  console.log('All user data has been cleared');
};

// Reset user state to initial values
export const resetUserState = () => {
  // This would typically be called to reset React state
  // For now, we'll just log that state should be reset
  console.log('User state should be reset to initial values');
};

// Clear browser cache and storage
export const clearBrowserStorage = () => {
  try {
    // Clear service workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister();
        });
      });
    }
    
    // Clear cache storage
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
  } catch (error) {
    console.warn('Could not clear all browser storage:', error);
  }
};