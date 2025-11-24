import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBqymK8EWPa9s7c_2uTUXzBONK3XfTipFU",
  authDomain: "parcelforcetracker.firebaseapp.com",
  databaseURL: "https://parcelforcetracker-default-rtdb.firebaseio.com",
  projectId: "parcelforcetracker",
  storageBucket: "parcelforcetracker.appspot.com",
  messagingSenderId: "408904759435",
  appId: "1:408904759435:web:eba15d67580426198bbc8e"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let map, marker;

function init() {
  const trackingNumber = getTrackingNumberFromURL();
  if (!trackingNumber) {
    displayInvoiceList();
    return;
  }
  displayTrackingNumber(trackingNumber);
  generateQRCode();
  initializeMap();
  fetchInvoiceData(trackingNumber);
}

function getTrackingNumberFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('ref');
}

function displayInvoiceList() {
  const container = document.getElementById('parcelDetails');
  container.innerHTML = `
    <h2>📦 All Invoices</h2>
    <ul id="invoiceList" class="status-list">
      <li class="loading">Loading all invoices...</li>
    </ul>
  `;
  const invoicesRef = ref(db, 'invoices');
  onValue(invoicesRef, (snapshot) => {
    const list = document.getElementById('invoiceList');
    list.innerHTML = '';
    if (snapshot.exists()) {
      const invoices = snapshot.val();
      Object.keys(invoices).forEach(key => {
        const data = invoices[key];
        const li = document.createElement('li');
        li.innerHTML = `
          <strong>${key}</strong> – ${data.parcelStatus || 'Unknown'}
          <br><button class="support-btn" onclick="window.location.href='track.html?ref=${key}'">View Tracking</button>
        `;
        list.appendChild(li);
      });
    } else {
      list.innerHTML = '<li>No invoices found in the system.</li>';
    }
  });
}

function displayTrackingNumber(trackingNumber) {
  document.getElementById('trackingNumber').textContent = `📦 Tracking: ${trackingNumber}`;
}

function generateQRCode() {
  QRCode.toCanvas(document.createElement('canvas'), window.location.href, { width:
