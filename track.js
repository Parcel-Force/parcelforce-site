// track.js

// Read tracking number from query string
const params = new URLSearchParams(window.location.search);
const trackingNumber = params.get('ref');

document.getElementById('trackingNumber').textContent = `Tracking Number: ${trackingNumber}`;

let map, marker;

// Local parcel dictionary (replace with your actual data)
const parcels = {
  "PF557690344CN": {
    sender: "Woods Loan Office",
    receiver: "Ella Irene Pelling",
    address: "35, Ringley Road, Horsham, West Sussex RH12 4AS England",
    phone: "+447856968957",
    email: "ella@example.com",
    status: [
      { status: "Picked Up" },
      { status: "In Transit" },
      { status: "Delivered" }
    ]
  },
  "PF987654321UK": {
    sender: "David Callaghan",
    receiver: "Ellen Tshabalala",
    address: "210 Magdalena Willers Street, Pretoria",
    phone: "+27 74 654 9272",
    email: "ellen@example.com",
    status: [
      { status: "Picked Up" },
      { status: "In Transit" }
    ]
  }
};

// Lookup parcel
const parcel = parcels[trackingNumber];

if (!parcel) {
  document.getElementById('parcelDetails').innerHTML = `
    <h2>Parcel Not Found</h2>
    <p>No parcel found for reference: <strong>${trackingNumber}</strong></p>
    <button class="support-btn" onclick="window.location.href='index.html'">🔙 Back to Home</button>
  `;
} else {
  const latest = parcel.status[parcel.status.length - 1];

  document.getElementById('lastUpdated').textContent = new Date().toISOString();
  document.querySelector('.progress').style.width = getProgressWidth(parcel.status);

  const steps = document.querySelectorAll('.progress-step');
  const latestStatus = latest?.status.toLowerCase();
  steps.forEach(step => {
    step.classList.remove('active');
    if (step.textContent.toLowerCase().includes(latestStatus)) {
      step.classList.add('active');
    }
  });

  document.getElementById('recipientInfo').innerHTML = `
    <p><strong>Sender:</strong> ${parcel.sender}</p>
    <p><strong>Receiver:</strong> ${parcel.receiver}</p>
    <p><strong>Address:</strong> ${parcel.address}</p>
    <p><strong>Phone:</strong> ${parcel.phone}</p>
    <p><strong>Email:</strong> ${parcel.email}</p>
  `;

  // Example invoice list (local demo)
  const invoices = {
    "PF557690344CN": { parcelStatus: "Delivered" },
    "PF987654321UK": { parcelStatus: "In Transit" }
  };

  const list = document.getElementById('invoiceList');
  list.innerHTML = '';
  Object.keys(invoices).forEach(key => {
    const data = invoices[key];
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${key}</strong> – ${data.parcelStatus || 'Unknown'}
      <br><button class="support-btn" onclick="window.location.href='track.html?ref=${key}'">View Tracking</button>
    `;
    list.appendChild(li);
  });
}

// Progress bar helper
function getProgressWidth(statusArray) {
  if (!Array.isArray(statusArray)) return '0%';
  const stages = ['picked up', 'in transit', 'delivered'];
  const latest = statusArray[statusArray.length - 1]?.status?.toLowerCase();
  const index = stages.findIndex(s => latest.includes(s));
  return index >= 0 ? `${((index + 1) / stages.length) * 100}%` : '0%';
}
