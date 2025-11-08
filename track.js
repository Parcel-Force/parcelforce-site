// track.js
import { db } from './firebase.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";

const urlParams = new URLSearchParams(window.location.search);
const trackingNumber = urlParams.get('ref');
const parcelRef = ref(db, 'parcels/' + trackingNumber);

let map, marker;

onValue(parcelRef, (snapshot) => {
  document.getElementById('loading').style.display = 'none';

  if (!snapshot.exists()) {
    document.getElementById('parcelDetails').style.display = 'none';
    document.getElementById('fallbackMessage').style.display = 'block';
    document.getElementById('missingRef').textContent = trackingNumber || 'null';
    return;
  }

  const data = snapshot.val();
  const latest = data.status[data.status.length - 1];

  document.getElementById('parcelDetails').style.display = 'block';
  document.getElementById('fallbackMessage').style.display = 'none';

  document.getElementById('trackingNumber').textContent = trackingNumber;
  document.getElementById('sender').textContent = data.sender;
  document.getElementById('receiver').textContent = data.receiver;
  document.getElementById('address').textContent = data.address;
  document.getElementById('phone').textContent = data.phone;
  document.getElementById('email').textContent = data.email;
  document.getElementById('deliveryFee').textContent = `R${data.deliveryFee}`;
  document.getElementById('estimatedDelivery').textContent = data.estimatedDelivery;
  document.getElementById('timestamp').textContent = new Date().toLocaleString();

  const statusList = document.getElementById('status');
  statusList.innerHTML = '';

  if (Array.isArray(data.status) && data.status.length > 0) {
    data.status.forEach(update => {
      const item = document.createElement('li');
      const statusSpan = document.createElement('span');
      const statusClass = update.status.toLowerCase().replace(/\s+/g, '-');
      statusSpan.className = `status ${statusClass}`;
      statusSpan.textContent = `${update.timestamp} — ${update.location}: ${update.status} (${update.details})`;
      item.appendChild(statusSpan);
      statusList.appendChild(item);
    });

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
  } else {
    const item = document.createElement('li');
    item.textContent = "No status updates available yet.";
    statusList.appendChild(item);
  }

  const steps = document.querySelectorAll('.progress-step');
  const latestStatus = latest?.status.toLowerCase();
  steps.forEach(step => {
    step.classList.remove('active');
    if (step.textContent.toLowerCase().includes(latestStatus)) {
      step.classList.add('active');
    }
  });
});
