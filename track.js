// track.js

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
  }
});

function getProgressWidth(statusArray) {
  if (!Array.isArray(statusArray)) return '0%';
  const stages = ['picked up', 'in transit', 'delivered'];
  const latest = statusArray[statusArray.length - 1]?.status?.toLowerCase();
  const index = stages.findIndex(s => latest.includes(s));
  return index >= 0 ? `${((index + 1) / stages.length) * 100}%` : '0%';
}
