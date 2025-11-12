import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";

// ✅ Replace with your actual Firebase config
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

// ✅ Get reference number from URL
const urlParams = new URLSearchParams(window.location.search);
const refNum = urlParams.get("ref") || "RB123456789CN";

// ✅ Fetch invoice data from Firebase
const invoiceRef = ref(db, "invoices/" + refNum);
get(invoiceRef).then((snapshot) => {
  if (!snapshot.exists()) {
    alert("Invoice not found.");
    return;
  }

  const data = snapshot.val();

  // Basic fields
  document.querySelector(".field-invoice").textContent = refNum;
  document.querySelector(".field-date").textContent = data.timestamp || "";
  document.getElementById("recipientName").textContent = data.recipient || "";
  document.getElementById("recipientContact").textContent = data.contact || "";
  document.getElementById("recipientAddress").textContent = data.recipientAddress || "";
  document.getElementById("senderName").textContent = data.sender || "";
  document.getElementById("senderContact").textContent = data.senderContact || "";
  document.getElementById("senderAddress").textContent = data.senderAddress || "";

  // Item table
  const itemTableBody = document.getElementById("itemTableBody");
  itemTableBody.innerHTML = ""; // Clear static rows
  if (Array.isArray(data.items)) {
    data.items.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.description}</td>
        <td>${item.quantity}</td>
        <td>£ ${parseFloat(item.price).toFixed(2)}</td>
        <td>£ ${(item.quantity * item.price).toFixed(2)}</td>
      `;
      itemTableBody.appendChild(row);
    });
  }

  // Financial summary
  const subtotal = parseFloat(data.subtotal || 0);
  const vat = subtotal * 0.20;
  const total = subtotal + vat;

  document.getElementById("subtotalAmount").textContent = "£ " + subtotal.toFixed(2);
  document.getElementById("vatAmount").textContent = "£ " + vat.toFixed(2);
  document.getElementById("totalAmount").textContent = "£ " + total.toFixed(2);

  // ✅ Generate QR code linking to tracking page
  const qrCanvas = document.getElementById("qrCodeCanvas");
  const qrTarget = `https://yourdomain.com/track.html?ref=${refNum}`;
  QRCode.toCanvas(qrCanvas, qrTarget, { width: 128 }, function (error) {
    if (error) console.error(error);
  });
}).catch((error) => {
  console.error("Error fetching invoice:", error);
});
