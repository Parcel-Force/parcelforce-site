import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
  getDatabase, ref, get, child
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBqymK8EWPa9s7c_2uTUXzBONK3XfTipFU",
  authDomain: "parcelforcetracker.firebaseapp.com",
  databaseURL: "https://parcelforcetracker-default-rtdb.firebaseio.com",
  projectId: "parcelforcetracker",
  storageBucket: "parcelforcetracker.firebasestorage.app",
  messagingSenderId: "408904759435",
  appId: "1:408904759435:web:eba15d67580426198bbc8e"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.addEventListener('DOMContentLoaded', () => {
  checkAuthentication();
  const userEmail = localStorage.getItem('userEmail');
  loadUserEmail(userEmail);
  resetInactivityTimer();
  loadParcels(userEmail);
});

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Load and display user email
 */
function loadUserEmail(userEmail) {
  const emailElement = document.getElementById('userEmail');
  if (userEmail) {
    emailElement.textContent = `Logged in as: ${escapeHtml(userEmail)}`;
  }
}

/**
 * Load parcels filtered by user email
 */
function loadParcels(userEmail) {
  const parcelList = document.getElementById('parcelList');

  if (!userEmail) {
    parcelList.innerHTML = '<p style="color: #c8102e;">Error: User email not found. Please log in again.</p>';
    parcelList.focus();
    return;
  }

  parcelList.innerHTML = '<p>Loading your parcels...</p>';

  get(child(ref(db), 'parcels')).then((snapshot) => {
    // DEBUG: Uncomment to see Firebase data structure
    console.log('Firebase snapshot:', snapshot.val());

    if (!snapshot.exists()) {
      parcelList.innerHTML = '<p>No parcels found in database.</p>';
      parcelList.focus();
      return;
    }

    const allParcels = snapshot.val();
    
    // ✅ Filter parcels by user email (sender OR recipient)
    const userParcels = Object.entries(allParcels)
      .filter(([key, data]) => {
        // Handle null/undefined data
        if (!data || typeof data !== 'object') return false;
        
        return (data.userEmail === userEmail || data.recipientEmail === userEmail);
      });

    if (userParcels.length === 0) {
      parcelList.innerHTML = '<p style="text-align: center; color: #999;">You have no parcels yet. <a href="index.html">Start tracking</a></p>';
      parcelList.focus();
      return;
    }

    // ✅ Render parcel cards with proper escaping
    parcelList.innerHTML = userParcels.map(([key, data]) => {
      // Handle status array vs object
      let latestStatus = 'Unknown';
      let latestLocation = 'N/A';

      if (Array.isArray(data.status) && data.status.length > 0) {
        const latest = data.status[data.status.length - 1];
        latestStatus = latest.status || 'Unknown';
        latestLocation = latest.location || 'N/A';
      } else if (data.status && typeof data.status === 'object') {
        latestStatus = data.status.status || 'Unknown';
        latestLocation = data.status.location || 'N/A';
      }

      return `
        <div class="parcel-card">
          <strong>Tracking Number:</strong> ${escapeHtml(key)}<br>
          <strong>Status:</strong> ${escapeHtml(latestStatus)}<br>
          <strong>Location:</strong> ${escapeHtml(latestLocation)}<br>
          <strong>Updated:</strong> ${escapeHtml(data.lastUpdated || 'N/A')}<br>
          <a href="track.html?ref=${encodeURIComponent(key)}" rel="noopener noreferrer" aria-label="Track parcel ${escapeHtml(key)}">📍 Track Parcel</a><br>
          <a href="receipt.html?ref=${encodeURIComponent(key)}" rel="noopener noreferrer" aria-label="View invoice for ${escapeHtml(key)}">🧾 View Invoice</a>
        </div>
      `;
    }).join('');
    
    parcelList.focus();
  }).catch((error) => {
    console.error('Firebase READ error:', error);
    parcelList.innerHTML = `<p style="color: #c8102e;"><strong>Error:</strong> ${escapeHtml(error.message)}</p><p>Check Firebase rules and network connection.</p>`;
    parcelList.focus();
  });
}

/**
 * Check if user is logged in
 */
function checkAuthentication() {
  const authToken = localStorage.getItem('authToken');
  const userEmail = localStorage.getItem('userEmail');
  if (!authToken || !userEmail) {
    window.location.href = 'index.html';
  }
}

/**
 * Handle user logout
 */
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    window.location.href = 'index.html';
  }
}

/**
 * Auto-logout after 30 minutes of inactivity
 */
let inactivityTimeout;
function resetInactivityTimer() {
  clearTimeout(inactivityTimeout);
  inactivityTimeout = setTimeout(() => {
    alert('Your session has expired due to inactivity. Please log in again.');
    logout();
  }, 30 * 60 * 1000);
}

document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
document.addEventListener('scroll', resetInactivityTimer);
document.addEventListener('click', resetInactivityTimer);
