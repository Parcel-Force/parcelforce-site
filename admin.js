// admin.js
import { db, ref, set, get, child, remove } from './firebase.js';

document.getElementById('parcelForm').addEventListener('submit', submitParcel);

function submitParcel() {
  const trackingNumber = document.getElementById('trackingNumber').value.trim();
  const sender = document.getElementById('sender').value.trim();
  const receiver = document.getElementById('receiver').value.trim();
  const address = document.getElementById('address').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const deliveryFee = document.getElementById('deliveryFee').value.trim();
  const estimatedDelivery = document.getElementById('estimatedDelivery').value;
  const statusText = document.getElementById('status').value.trim();
  const parcelStatus = document.getElementById('parcelStatus').value;
  const latitude = document.getElementById('latitude').value.trim();
  const longitude = document.getElementById('longitude').value.trim();
  const lastUpdated = new Date().toISOString();

  const statusArray = statusText.split('\n').map(line => {
    const [timestamp, location, status, details] = line.split('|').map(s => s.trim());
    return { timestamp, location, status, details };
  });

  const parcelData = {
    sender,
    receiver,
    address,
    phone,
    email,
    deliveryFee,
    estimatedDelivery,
    status: statusArray,
    parcelStatus,
    latitude,
    longitude,
    lastUpdated
  };

  document.getElementById('loading').style.display = 'block';
  document.getElementById('feedback').textContent = '';

  // ✅ Save parcel data
  set(ref(db, 'parcels/' + trackingNumber), parcelData)
    .then(() => {
      // ✅ Auto-generate invoice
      const invoiceData = {
        timestamp: new Date().toLocaleDateString(),
        recipient: receiver,
        contact: phone,
        recipientAddress: address,
        sender: sender,
        senderContact: phone,
        senderAddress: address,
        items: [
          { description: "Parcel Delivery", quantity: 1, price: parseFloat(deliveryFee) }
        ],
        subtotal: parseFloat(deliveryFee)
      };

      return set(ref(db, 'invoices/' + trackingNumber), invoiceData);
    })
    .then(() => {
      document.getElementById('loading').style.display = 'none';
      document.getElementById('feedback').textContent = '✅ Parcel and invoice submitted successfully.';
      document.getElementById('parcelForm').reset();
      loadParcels();
    })
    .catch((error) => {
      document.getElementById('loading').style.display = 'none';
      document.getElementById('feedback').textContent = '❌ Error: ' + error.message;
    });
}

window.loadParcels = function () {
  const parcelList = document.getElementById('parcelList');
  parcelList.innerHTML = '📦 Loading parcels...';

  const dbRef = ref(db);
  get(child(dbRef, 'parcels')).then((snapshot) => {
    if (!snapshot.exists()) {
      parcelList.innerHTML = '<p>No parcels found.</p>';
      return;
    }

    const parcels = snapshot.val();
    parcelList.innerHTML = Object.entries(parcels).map(([key, data]) => {
      const latest = Array.isArray(data.status) ? data.status[data.status.length - 1] : {};
      return `
        <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #ccc; border-radius: 6px;">
          <strong>${key}</strong><br>
          Status: ${latest.status || 'Unknown'}<br>
          Location: ${latest.location || 'N/A'}<br>
          Updated: ${data.lastUpdated || 'N/A'}<br>
          <button onclick="editParcel('${key}')">✏️ Edit</button>
          <button onclick="deleteParcel('${key}')">🗑️ Delete</button>
        </div>
      `;
    }).join('');
  }).catch((error) => {
    parcelList.innerHTML = `<p>Error loading parcels: ${error.message}</p>`;
  });
};

window.editParcel = function (trackingNumber) {
  const dbRef = ref(db);
  get(child(dbRef, 'parcels/' + trackingNumber)).then((snapshot) => {
    if (!snapshot.exists()) return;

    const data = snapshot.val();
    document.getElementById('trackingNumber').value = trackingNumber;
    document.getElementById('sender').value = data.sender || '';
    document.getElementById('receiver').value = data.receiver || '';
    document.getElementById('address').value = data.address || '';
    document.getElementById('phone').value = data.phone || '';
    document.getElementById('email').value = data.email || '';
    document.getElementById('deliveryFee').value = data.deliveryFee || '';
    document.getElementById('estimatedDelivery').value = data.estimatedDelivery || '';
    document.getElementById('parcelStatus').value = data.parcelStatus || '';
    document.getElementById('latitude').value = data.latitude || '';
    document.getElementById('longitude').value = data.longitude || '';
    document.getElementById('status').value = Array.isArray(data.status)
      ? data.status.map(s => `${s.timestamp} | ${s.location} | ${s.status} | ${s.details}`).join('\n')
      : '';
  });
};

window.deleteParcel = function (trackingNumber) {
  if (!confirm(`Are you sure you want to delete parcel ${trackingNumber}?`)) return;

  Promise.all([
    remove(ref(db, 'parcels/' + trackingNumber)),
    remove(ref(db, 'invoices/' + trackingNumber))
  ])
    .then(() => {
      document.getElementById('feedback').textContent = `🗑️ Parcel and invoice ${trackingNumber} deleted.`;
      loadParcels();
    })
    .catch((error) => {
      document.getElementById('feedback').textContent = '❌ Error deleting parcel: ' + error.message;
    });
};
