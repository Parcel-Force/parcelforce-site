// track.js
import { db } from './firebase.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";

const params = new URLSearchParams(window.location.search);
const trackingNumber = params.get('ref');
const parcelRef = ref(db, 'parcels/' + trackingNumber);

document.getElementById('trackingNumber').textContent = `Tracking Number: ${trackingNumber}`;

let map, marker;

onValue(parcelRef, (snapshot) => {
  if (!snapshot.exists()) {
    document.getElementById('parcelDetails').innerHTML = `
      <h2>Parcel Not Found</h2>
      <p>No parcel found for reference: <strong>${trackingNumber}</strong></p>
      <button class="support-btn" onclick="window.location.href='index.html'">🔙 Back to Home</button>
    `;
    return;
  }

  const data = snapshot.val();
  const latest = data.status[data.status.length - 1];

  document.getElementById('lastUpdated').textContent = new Date().toISOString();
  document.querySelector('.progress').style.width = getProgressWidth(data.status);

  const steps = document.querySelectorAll('.progress-step');
  const latestStatus = latest?.status.toLowerCase();
  steps.forEach(step => {
    step.classList.remove('active');
    if (step.textContent.toLowerCase().includes(latestStatus)) {
      step.classList.add('active');
    }
  });

  document.getElementById('recipientInfo').innerHTML = `
    <p><strong>Sender:</strong> ${data.sender}</p>
    <p><strong>Receiver:</strong> ${data.receiver}</p>
    <p><strong>Address:</strong> ${data.address}</p>
    <p><strong>Phone:</strong> ${data.phone}</p>
    <p><strong>Email:</strong> ${data.email}</p>
  `;

  document.querySelector('p strong + span')?.textContent = `R${data.deliveryFee}`;
  document.querySelector('p strong + span + span')?.textContent = data.estimatedDelivery;

  document.querySelector('.status-list').innerHTML = `
    <li><strong>Last Checkpoint:</strong> ${latest.location} — ${latest.status}</li>
  `;

  document.querySelector('.alert').innerHTML = `
    ⚠ Customs and delivery fee of <strong>R${data.deliveryFee}</strong> must be paid before parcel can proceed for Delivery
  `;

  if (latest.latitude && latest.longitude) {
    if (!map) {
      map = L.map('map').setView([latest.latitude, latest.longitude], 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      marker = L.marker([latest.latitude, latest.longitude]).addTo(map);
    } else {
      marker.setLatLng([latest.latitude, latest.longitude]);
      map.panTo([latest.latitude, latest.longitude]);
    }
  }
});

function getProgressWidth(statusArray) {
  if (!Array.isArray(statusArray)) return '0%';
  const stages = ['picked up', 'in transit', 'delivered'];
  const latest = statusArray[statusArray.length - 1]?.status?.toLowerCase();
  const index = stages.findIndex(s => latest.includes(s));
  return index >= 0 ? `${((index + 1) / stages.length) * 100}%` : '0%';
}
