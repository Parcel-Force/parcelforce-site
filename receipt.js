// receipt.js
import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";

// Escape HTML
function escapeHtml(text) {
  if (!text) return "N/A";
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return String(text).replace(/[&<>"']/g, (char) => map[char]);
}

// Format currency
function formatCurrency(amount) {
  const num = parseFloat(amount);
  return isNaN(num) ? "£0.00" : `£${num.toFixed(2)}`;
}

// Format date/time
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("en-GB");
}
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return isNaN(date.getTime()) ? "--:--" : date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

// Populate invoice
function populateInvoice(data, refNum) {
  // Invoice details
  document.querySelector(".field-invoice").textContent = refNum;
  document.querySelector(".field-date").textContent = formatDate(data.createdAt || Date.now());
  document.getElementById("timestamp").textContent = formatTime(data.createdAt || Date.now());

  // Recipient
  document.getElementById("recipientName").textContent = escapeHtml(data.recipientName);
  document.getElementById("recipientContact").textContent = escapeHtml(data.recipientContact);
  document.getElementById("recipientAddress").textContent = escapeHtml(data.zone);

  // Sender
  document.getElementById("senderName").textContent = escapeHtml(data.senderName);
  document.getElementById("senderContact").textContent = escapeHtml(data.senderContact);
  document.getElementById("senderAddress").textContent = escapeHtml(data.senderEmail);

  // Items
  const tbody = document.getElementById("itemTableBody");
  tbody.innerHTML = "";
  const total = (data.itemQty || 0) * (data.itemPrice || 0);
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${escapeHtml(data.itemDescription)}</td>
    <td>${data.itemQty || 0}</td>
    <td>£${(data.itemPrice || 0).toFixed(2)}</td>
    <td>£${total.toFixed(2)}</td>
  `;
  tbody.appendChild(row);

  // Summary
  document.getElementById("subtotalAmount").textContent = data.subtotal || "£0.00";
  document.getElementById("vatAmount").textContent = data.vat || "£0.00";
  document.getElementById("totalAmount").textContent = data.total || "£0.00";

  // QR Code
  const trackingUrl = `${window.location.origin}/track.html?ref=${encodeURIComponent(refNum)}`;
  QRCode.toCanvas(document.getElementById("qrCodeCanvas"), trackingUrl, { width: 128 }, (error) => {
    if (error) console.error(error);
  });
}

// Get invoice ID from URL
const params = new URLSearchParams(window.location.search);
const invoiceId = params.get("id");

if (!invoiceId) {
  console.error("No invoice ID provided in URL");
} else {
  const invoiceRef = ref(db, `invoices/${invoiceId}`);
  onValue(invoiceRef, (snapshot) => {
    if (!snapshot.exists()) {
      console.error("Invoice not found");
      return;
    }
    populateInvoice(snapshot.val(), invoiceId);
  });
}

// Print shortcut
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "p") {
    e.preventDefault();
    window.print();
  }
});
