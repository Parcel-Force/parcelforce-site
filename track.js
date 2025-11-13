// track.js (Manual version — no Firebase)

const params = new URLSearchParams(window.location.search);
const trackingNumber = params.get('ref');

document.getElementById('trackingNumber').textContent = `Tracking Number: ${trackingNumber}`;

let map, marker;

// Manually defined parcel data
const parcels = {
  "PF123456": {
    sender: "David Callaghan",
    receiver: "Ellen Tshabalala",
    address: "210 Magdalena Willers Street, Lilnerpark, Pretoria, 0186",
    phone: "+27746549272",
    email: "tellen864@gmail.com",
    deliveryFee: 2500,
    estimatedDelivery: "2025-11-13",
    status: [
      {
        status: "Picked Up",
        location: "London Warehouse",
        timestamp: "2025-11-11T10:00:00Z"
      },
      {
        status: "In Transit",
        location: "En route to Pretoria, South Africa",
        timestamp: "2025-11-12T18:30:00Z",
        latitude: -25.7461,
        longitude: 28.1881
      }
    ]
  }
};

const data = parcels[trackingNumber];

if (!data) {
  document.getElementById('parcelDetails').innerHTML = `
    <h2>Parcel Not Found</h2>
    <p>No parcel found for reference: <strong>${trackingNumber}</strong></p>
    <button class="support-btn" onclick="window.location.href='index.html'">🔙 Back to Home</button>
  `;
} else {
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
}

function getProgressWidth(statusArray) {
  if (!Array.isArray(statusArray)) return '0%';
  const stages = ['picked up', 'in transit', 'delivered'];
  const latest = statusArray[statusArray.length - 1]?.status?.toLowerCase();
  const index = stages.findIndex(s => latest.includes(s));
  return index >= 0 ? `${((index + 1) / stages.length) * 100}%` : '0%';
}
