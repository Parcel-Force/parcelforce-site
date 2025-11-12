import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";

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

window.searchParcel = function () {
  const refNum = document.getElementById('searchInput').value.trim();
  const resultArea = document.getElementById('resultArea');
  resultArea.innerHTML = '🔄 Searching...';

  if (!refNum) {
    resultArea.innerHTML = '<p>Please enter a tracking number.</p>';
    return;
  }

  const dbRef = ref(db);
  get(child(dbRef, 'parcels/' + refNum)).then((snapshot) => {
    if (!snapshot.exists()) {
      resultArea.innerHTML = `<p>❌ Parcel <strong>${refNum}</strong> not found.</p>`;
      return;
    }

    const data = snapshot.val();
    const latest = Array.isArray(data.status) ? data.status[data.status.length - 1] : {};

    resultArea.innerHTML = `
      <div class="result-card">
        <strong>Tracking Number:</strong> ${refNum}<br>
        <strong>Status:</strong> ${latest.status || 'Unknown'}<br>
        <strong>Location:</strong> ${latest.location || 'N/A'}<br>
        <a href="track.html?ref=${refNum}" target="_blank">📍 Track Parcel</a><br>
        <a href="receipt.html?ref=${refNum}" target="_blank">🧾 View Invoice</a>
      </div>
    `;
  }).catch((error) => {
    resultArea.innerHTML = `<p>Error: ${error.message}</p>`;
  });
};
