// admin.js — local-only admin panel (Firebase removed)
// Stores parcels in localStorage (demo mode) and provides basic CRUD from the admin UI.

const STORAGE_PARCELS_KEY = 'pf_parcels_admin';

function qs(id) { return document.getElementById(id); }
function escapeHtml(s) { return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function readParcels() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_PARCELS_KEY) || '[]');
  } catch (e) {
    console.warn('Failed to read parcels', e);
    return [];
  }
}
function saveParcels(list) {
  try {
    localStorage.setItem(STORAGE_PARCELS_KEY, JSON.stringify(list || []));
  } catch (e) {
    console.warn('Failed to save parcels', e);
  }
}

function generateId() {
  return `PF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
}

// Parse status textarea (one entry per line). Expected: timestamp | location | status | details
function parseStatusLines(text) {
  if (!text) return [];
  return text.split('\n').map(line => {
    const parts = line.split('|').map(p => p.trim());
    return {
      timestamp: parts[0] || new Date().toISOString(),
      location: parts[1] || '',
      status: parts[2] || '',
      details: parts[3] || ''
    };
  }).filter(s => s.status || s.location || s.details);
}

function renderParcelList() {
  const container = qs('parcelList');
  const parcels = readParcels();

  if (!container) return;
  container.innerHTML = '';

  if (!parcels || parcels.length === 0) {
    container.innerHTML = `<div class="parcel-entry"><div class="meta">No parcels yet.</div></div>`;
    return;
  }

  parcels.slice().reverse().forEach(p => {
    const el = document.createElement('div');
    el.className = 'parcel-entry';
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `
      <div><strong>${escapeHtml(p.id)}</strong> <span class="timestamp">(${escapeHtml(p.lastUpdated || '')})</span></div>
      <div><strong>Status:</strong> ${escapeHtml(p.status || '')}</div>
      <div><strong>Receiver:</strong> ${escapeHtml(p.receiver || '')}</div>
      <div><strong>Destination:</strong> ${escapeHtml(p.address || '')}</div>
    `;

    const actions = document.createElement('div');
    actions.className = 'actions';
    const viewBtn = document.createElement('button');
    viewBtn.textContent = 'View';
    viewBtn.type = 'button';
    viewBtn.addEventListener('click', () => {
      // populate form for editing
      populateFormForEdit(p);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Delete';
    removeBtn.type = 'button';
    removeBtn.className = 'small-btn danger';
    removeBtn.addEventListener('click', () => {
      if (!confirm(`Delete parcel ${p.id}? This is local-only.`)) return;
      const updated = readParcels().filter(x => x.id !== p.id);
      saveParcels(updated);
      renderParcelList();
      showFeedback(`Parcel ${p.id} deleted.`);
    });

    const trackLink = document.createElement('a');
    trackLink.textContent = 'Track';
    trackLink.href = `track.html?ref=${encodeURIComponent(p.id)}`;
    trackLink.target = '_blank';
    trackLink.rel = 'noopener noreferrer';
    trackLink.style.display = 'inline-block';
    trackLink.style.padding = '6px 10px';
    trackLink.style.background = '#0078D4';
    trackLink.style.color = '#fff';
    trackLink.style.borderRadius = '6px';
    trackLink.style.textDecoration = 'none';

    actions.appendChild(viewBtn);
    actions.appendChild(removeBtn);
    actions.appendChild(trackLink);

    el.appendChild(meta);
    el.appendChild(actions);
    container.appendChild(el);
  });
}

function populateFormForEdit(parcel) {
  qs('trackingNumber').value = parcel.id || '';
  qs('parcelStatus').value = parcel.status || 'Picked Up';
  qs('sender').value = parcel.sender || '';
  qs('receiver').value = parcel.receiver || '';
  qs('address').value = parcel.address || '';
  qs('phone').value = parcel.phone || '';
  qs('email').value = parcel.email || '';
  qs('deliveryFee').value = parcel.deliveryFee || '';
  qs('estimatedDelivery').value = parcel.estimatedDelivery ? parcel.estimatedDelivery.split('T')[0] : '';
  qs('status').value = (parcel.statusHistory || []).map(s => `${s.timestamp} | ${s.location} | ${s.status} | ${s.details}`).join('\n');
  qs('latitude').value = parcel.latitude || '';
  qs('longitude').value = parcel.longitude || '';
  qs('lastUpdated').value = parcel.lastUpdated || '';
  showFeedback(`Loaded ${parcel.id} into the form for editing. Submit to apply updates.`);
}

// Submit parcel (create or update)
window.submitParcel = function submitParcel() {
  clearFeedback();
  const idInput = qs('trackingNumber').value.trim();
  const id = idInput || generateId();

  const parcel = {
    id,
    status: qs('parcelStatus').value,
    sender: qs('sender').value.trim(),
    receiver: qs('receiver').value.trim(),
    address: qs('address').value.trim(),
    phone: qs('phone').value.trim(),
    email: qs('email').value.trim(),
    deliveryFee: qs('deliveryFee').value ? Number(qs('deliveryFee').value) : null,
    estimatedDelivery: qs('estimatedDelivery').value || null,
    statusHistory: parseStatusLines(qs('status').value),
    latitude: qs('latitude').value.trim(),
    longitude: qs('longitude').value.trim(),
    lastUpdated: new Date().toISOString()
  };

  // Basic validation
  if (!parcel.id || !parcel.receiver) {
    showFeedback('Tracking number and receiver are required.', true);
    return;
  }

  // Save: if exists update, else add
  const parcels = readParcels();
  const idx = parcels.findIndex(p => p.id === parcel.id);
  if (idx >= 0) {
    parcels[idx] = { ...parcels[idx], ...parcel };
    showFeedback(`Parcel ${parcel.id} updated.`);
  } else {
    parcels.push(parcel);
    showFeedback(`Parcel ${parcel.id} added.`);
  }
  saveParcels(parcels);
  renderParcelList();
  qs('parcelForm').reset();
}

// Clear all parcels (admin action)
function clearAllParcels() {
  if (!confirm('Clear all parcels from local storage? This cannot be undone.')) return;
  saveParcels([]);
  renderParcelList();
  showFeedback('All parcels cleared (local only).');
}

function showFeedback(msg, isError) {
  const f = qs('feedback');
  f.textContent = msg;
  f.style.color = isError ? '#c8102e' : '#0078D4';
}

function clearFeedback() {
  const f = qs('feedback');
  f.textContent = '';
}

// Attach handlers
document.addEventListener('DOMContentLoaded', () => {
  // ensure sample data for dev convenience (optional)
  if (readParcels().length === 0) {
    saveParcels([
      {
        id: 'PF557690344CN',
        status: 'In Transit',
        sender: 'Woods Loan Office',
        receiver: 'Ella I. Pelling',
        address: '35 Ringley Road, Horsham, UK',
        phone: '+44 7856 968957',
        email: 'no-reply@demo.local',
        deliveryFee: 8.5,
        estimatedDelivery: '2025-11-25',
        statusHistory: [
          { timestamp: '2025-11-04', location: 'UK Hub', status: 'Picked Up', details: '' },
          { timestamp: '2025-11-24', location: 'Transit', status: 'In Transit', details: '' }
        ],
        latitude: '51.0629',
        longitude: '-0.3270',
        lastUpdated: new Date().toISOString()
      }
    ]);
  }

  renderParcelList();

  // wire form submit
  const form = qs('parcelForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitParcel();
  });

  qs('refreshBtn').addEventListener('click', () => {
    renderParcelList();
    showFeedback('List refreshed.');
  });
  qs('clearAllBtn').addEventListener('click', clearAllParcels);

  // Reset clear feedback on form reset
  qs('clearBtn').addEventListener('click', () => {
    clearFeedback();
  });
});