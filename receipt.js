// receipt.js — Manual version, no Firebase

const refNum = new URLSearchParams(window.location.search).get("ref") || "PF123456";

// Static parcel data
const invoiceData = {
  invoice: refNum,
  date: "13 Nov 2025",
  recipient: "Ellen Tshabalala",
  contact: "+27 74 654 92 72",
  recipientAddress: "210 Magdalena Willers Street, Lilnerpark, Pretoria, 0186",
  sender: "David Callaghan",
  senderContact: "+1 954 264 4309",
  senderAddress: "154-Notting Hill Gate, Kensington & Chelsea, London W11 3QG",
  items: [
    { description: "Clothing Dresses", quantity: 5, price: 250 },
    { description: "Apple Macbook Pro", quantity: 1, price: 2450 },
    { description: "iPhone 16 Pro Max", quantity: 1, price: 1650 },
    { description: "Brown Envelope", quantity: 1, price: 5000 },
    { description: "Luxury Footwear", quantity: 3, price: 1000 },
    { description: "Exclusive Surprise", quantity: 1, price: 500 }
  ]
};

// Populate fields
document.querySelector(".field-invoice").textContent = invoiceData.invoice;
document.querySelector(".field-date").textContent = invoiceData.date;
document.getElementById("recipientName").textContent = invoiceData.recipient;
document.getElementById("recipientContact").textContent = invoiceData.contact;
document.getElementById("recipientAddress").textContent = invoiceData.recipientAddress;
document.getElementById("senderName").textContent = invoiceData.sender;
document.getElementById("senderContact").textContent = invoiceData.senderContact;
document.getElementById("senderAddress").textContent = invoiceData.senderAddress;

// Items
const itemTableBody = document.getElementById("itemTableBody");
let subtotal = 0;
invoiceData.items.forEach(item => {
  const row = document.createElement("tr");
  const total = item.quantity * item.price;
  subtotal += total;
  row.innerHTML = `
    <td>${item.description}</td>
    <td>${item.quantity}</td>
    <td>£${item.price.toFixed(2)}</td>
    <td>£${total.toFixed(2)}</td>
  `;
  itemTableBody.appendChild(row);
});

// Summary
const vat = subtotal * 0.20;
const total = subtotal + vat;
document.getElementById("subtotalAmount").textContent = `£${subtotal.toFixed(2)}`;
document.getElementById("vatAmount").textContent = `£${vat.toFixed(2)}`;
document.getElementById("totalAmount").textContent = `£${total.toFixed(2)}`;

// QR Code
const qrTarget = `https://parcel-force.github.io/parcelforce-site/track.html?ref=${refNum}`;
QRCode.toCanvas(document.getElementById("qrCodeCanvas"), qrTarget, { width: 128 }, function (error) {
  if (error) console.error(error);
});
