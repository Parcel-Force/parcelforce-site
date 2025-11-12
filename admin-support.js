import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";

// ✅ Your Firebase config
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

const requestList = document.getElementById('requestList');

get(ref(db, 'supportRequests')).then((snapshot) => {
  if (!snapshot.exists()) {
    requestList.innerHTML = '<p>No support requests found.</p>';
    return;
  }

  const requests = snapshot.val();
  const entries = Object.entries(requests).reverse(); // newest first

  requestList.innerHTML = entries.map(([key, data]) => `
    <div class="request-card">
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Tracking:</strong> ${data.tracking}</p>
      <p><strong>Message:</strong><br>${data.message}</p>
      <p class="timestamp">🕒 ${new Date(data.timestamp).toLocaleString()}</p>
    </div>
  `).join('');
}).catch((error) => {
  requestList.innerHTML = `<p>Error loading requests: ${error.message}</p>`;
});
