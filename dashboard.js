// dashboard.js — local-only version (Firebase removed)
// This file replaces any firebase usage with localStorage-based demo logic.
// It provides authentication checks, parcel loading, dark-mode handling and inactivity timeout.

// Storage keys used across the app (keep consistent with other pages)
const STORAGE_USER_KEY = 'pf_current_user';
const STORAGE_PARCELS_KEY = 'pf_parcels';
const STORAGE_DARKMODE_KEY = 'darkMode';

// Utility helpers
function qs(id) { return document.getElementById(id); }
function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str).replace(/[&<>"']/g, s => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[s]));
}

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem(STORAGE_USER_KEY)); } catch (e) { return null; }
}
function setCurrentUser(u) {
  try {
    if (u) localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_USER_KEY);
  } catch (e) { /* ignore */ }
}

function getParcels() {
  try { return JSON.parse(localStorage.getItem(STORAGE_PARCELS_KEY) || 'null') || []; } catch (e) { return []; }
}
function saveParcels(list) {
  try { localStorage.setItem(STORAGE_PARCELS_KEY, JSON.stringify(list || [])); } catch (e) { /* ignore */ }
}

// Developer-friendly: ensure demo user and sample parcels exist while developing locally.
// Remove or disable these helpers in production.
function ensureDemoUser() {
  let u = getCurrentUser();
  if (!u) {
    u = { email: 'demo@parcelforce.test', name: 'Demo User' };
    setCurrentUser(u);
  }
}
function ensureSampleParcels() {
  const existing = getParcels();
  if (!existing || existing.length === 0) {
    const sample = [
      { id: "PF557690344CN", status: "In Transit", recipient: "Ella I. Pelling", destination: "Horsham, UK", estimatedDelivery: "2025-11-25", lastUpdated: "2025-11-24" },
      { id: "RB123456789CN", status: "Collected", recipient: "Doreen van der Merwe", destination: "Pretoria, ZA", estimatedDelivery: "2025-11-26", lastUpdated: "2025-11-23" }
    ];
    saveParcels(sample);
    return sample;
  }
  return existing;
}

// UI rendering
function renderUserInfo() {
  const user = getCurrentUser();
  const userEmailEl = qs('userEmail');
  const welcomeEl = qs('welcomeMessage');

  if (user && user.email) {
    if (userEmailEl) userEmailEl.textContent = `📧 ${escapeHtml(user.email)}`;
    if (welcomeEl) welcomeEl.textContent = `Welcome back, ${escapeHtml(user.name || user.email.split('@')[0])}!`;
  }
}

function renderParcels(parcels) {
  const parcelListEl = qs('parcelList');
  if (!parcelListEl) return;

  parcelListEl.innerHTML = '';
  if (!parcels || parcels.length === 0) {
    parcelListEl.innerHTML = `
      <div class="empty-state" role="region" aria-label="Empty state">
        <h3>📭 No parcels yet</h3>
        <p>You don't have any tracked parcels at the moment.</p>
        <a href="index.html" class="view-details-link">Track Your First Parcel</a>
      </div>`;
    return;
  }

  const frag = document.createDocumentFragment();
  parcels.forEach(p => {
    const card = document.createElement('div');
    card.className = 'parcel-card';

    const statusLower = (p.status || '').toLowerCase();
    const statusClass = statusLower.includes('transit') ? 'status-in-transit'
                      : statusLower.includes('deliv') ? 'status-delivered'
                      : 'status-picked-up';

    card.innerHTML = `
      <h3>📦 ${escapeHtml(p.id)}</h3>
      <p><strong>Status:</strong> <span class="status-badge ${statusClass}">${escapeHtml(p.status || 'Unknown')}</span></p>
      <p><strong>Recipient:</strong> ${escapeHtml(p.recipient || 'N/A')}</p>
      <p><strong>Destination:</strong> ${escapeHtml(p.destination || 'N/A')}</p>
      <p><strong>Est. Delivery:</strong> ${escapeHtml(p.estimatedDelivery || 'N/A')}</p>
      <p><strong>Updated:</strong> ${escapeHtml(p.lastUpdated || 'N/A')}</p>
      <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
        <button class="view-details-btn" data-action="view" data-id="${escapeHtml(p.id)}">View Details →</button>
        <button class="view-details-btn" data-action="remove" data-id="${escapeHtml(p.id)}" style="background:#666">Remove</button>
      </div>
    `;
    frag.appendChild(card);
  });

  parcelListEl.appendChild(frag);
}

// High-level loader (replaces previous Firebase loader)
function loadParcelsForCurrentUser() {
  const parcelList = qs('parcelList');
  if (!parcelList) return;

  const user = getCurrentUser();
  if (!user || !user.email) {
    parcelList.innerHTML = '<p style="color: #c8102e;">Error: User not authenticated. Redirecting to login…</p>';
    parcelList.focus && parcelList.focus();
    setTimeout(() => { window.location.href = 'login.html'; }, 1200);
    return;
  }

  // Show spinner / loading state (kept simple)
  parcelList.innerHTML = '<div class="spinner" role="status" aria-label="Loading parcels"></div>';

  // Simulate async fetch (in a real app you'd call an API)
  setTimeout(() => {
    const parcels = ensureSampleParcels(); // returns sample if none exist
    // Optionally filter by user email if you store user-specific data on parcels:
    // const userParcels = parcels.filter(p => p.ownerEmail === user.email || p.recipientEmail === user.email);
    // For now, show all local parcels
    renderParcels(parcels);
    parcelList.focus && parcelList.focus();
  }, 500);
}

// Authentication check (local-only)
function checkAuthenticationLocal() {
  const user = getCurrentUser();
  if (!user || !user.email) {
    // show a small banner if present, then redirect to login
    const banner = qs('sessionBanner');
    if (banner) banner.style.display = 'block';
    setTimeout(() => { window.location.href = 'login.html'; }, 1800);
    return false;
  }
  return true;
}

// Logout (local-only)
function logoutLocal() {
  if (!confirm('Are you sure you want to logout?')) return;
  setCurrentUser(null);
  // optionally preserve parcels; to clear them uncomment next line:
  // saveParcels([]);
  window.location.href = 'login.html';
}

// Inactivity timer (logs out after timeout)
let inactivityTimeout;
function resetInactivityTimer() {
  clearTimeout(inactivityTimeout);
  inactivityTimeout = setTimeout(() => {
    alert('Your session has expired due to inactivity. Please log in again.');
    logoutLocal();
  }, 30 * 60 * 1000); // 30 minutes
}
['mousemove','keypress','scroll','click','touchstart'].forEach(evt => {
  document.addEventListener(evt, resetInactivityTimer, { passive: true });
});

// Dark mode
function applySavedDarkMode() {
  try {
    const saved = localStorage.getItem(STORAGE_DARKMODE_KEY);
    const isDark = saved === 'true' || saved === 'enabled';
    if (isDark) document.body.classList.add('dark-mode');
    const icon = qs('modeIcon');
    if (icon) icon.textContent = isDark ? '☀️' : '🌙';
    const darkToggle = qs('darkToggle');
    if (darkToggle) darkToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  } catch (e) { /* ignore */ }
}
function toggleDarkModeLocal() {
  const isDark = document.body.classList.toggle('dark-mode');
  try { localStorage.setItem(STORAGE_DARKMODE_KEY, isDark ? 'true' : 'false'); } catch(e){}
  const icon = qs('modeIcon');
  if (icon) icon.textContent = isDark ? '☀️' : '🌙';
  const darkToggle = qs('darkToggle');
  if (darkToggle) darkToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
}

// Event delegation for parcel actions
function installParcelHandlers() {
  const parcelList = qs('parcelList');
  if (!parcelList) return;
  parcelList.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const action = btn.getAttribute('data-action');
    if (action === 'view') {
      window.location.href = `track.html?ref=${encodeURIComponent(id)}`;
    } else if (action === 'remove') {
      if (!confirm(`Remove parcel ${id} from your list? This change is local only.`)) return;
      const parcels = getParcels().filter(p => p.id !== id);
      saveParcels(parcels);
      renderParcels(parcels);
    }
  });
}

// Initialization
function initDashboardModule() {
  // Make sure a demo user exists when developing locally
  ensureDemoUser();

  applySavedDarkMode();
  installParcelHandlers();

  // Wire up UI buttons (if present)
  const logoutBtn = qs('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logoutLocal);

  const darkToggle = qs('darkToggle');
  if (darkToggle) darkToggle.addEventListener('click', toggleDarkModeLocal);

  const printBtn = qs('printBtn');
  if (printBtn) printBtn.addEventListener('click', () => window.print());

  // Run auth check and load parcels
  document.addEventListener('DOMContentLoaded', () => {
    resetInactivityTimer();
    const ok = checkAuthenticationLocal();
    if (!ok) return;
    renderUserInfo();
    loadParcelsForCurrentUser();
  });
}

// Auto-run
initDashboardModule();

// Optional exports for testing (uncomment if you use modules/tests)
// export { getCurrentUser, setCurrentUser, getParcels, saveParcels, loadParcelsForCurrentUser, logoutLocal, toggleDarkModeLocal };