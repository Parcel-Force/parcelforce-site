// track.js - Local Storage Version

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const trackingNumber = params.get('id');
  
  if (!trackingNumber) {
    showError('No tracking number provided');
    return;
  }

  document.getElementById('trackingNumber').textContent = `Tracking Number: ${trackingNumber}`;
  
  // Get parcel data from localStorage
  const parcels = JSON.parse(localStorage.getItem('parcels') || '[]');
  const parcel = parcels.find(p => p.id === trackingNumber);

  if (!parcel) {
    showError(`No parcel found with tracking number: ${trackingNumber}`);
    return;
  }

  // Update the UI with parcel data
  updateParcelUI(parcel);
  updateInvoices(trackingNumber);
});

function updateParcelUI(parcel) {
  const latestStatus = Array.isArray(parcel.status) && parcel.status.length > 0 
    ? parcel.status[parcel.status.length - 1] 
    : { status: 'Unknown', location: 'Unknown', timestamp: new Date().toISOString() };
  
  // Update last updated time
  document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
  
  // Update progress bar if element exists
  const progressBar = document.querySelector('.progress');
  if (progressBar) {
    progressBar.style.width = getProgressWidth(parcel.status || []);
  }
  
  // Update status steps
  const statusText = latestStatus.status.toLowerCase();
  const statusSteps = {
    'processing': 'step1',
    'in transit': 'step2',
    'out for delivery': 'step3',
    'delivered': 'step4'
  };
  
  // Reset all steps
  Object.values(statusSteps).forEach(stepId => {
    const step = document.getElementById(stepId);
    if (step) step.classList.remove('active');
  });
  
  // Activate current and previous steps
  let found = false;
  for (const [status, stepId] of Object.entries(statusSteps)) {
    const step = document.getElementById(stepId);
    if (step) {
      if (statusText.includes(status) || found) {
        step.classList.add('active');
        found = true;
      }
    }
  }
  
  // Update status steps if they exist
  const steps = document.querySelectorAll('.progress-step');
  if (steps.length > 0) {
    const latestStatusText = latestStatus.status.toLowerCase();
    steps.forEach(step => {
      step.classList.remove('active');
      if (step.textContent.toLowerCase().includes(latestStatusText)) {
        step.classList.add('active');
      }
    });
  }
  
  // Update recipient info
  const recipientInfo = document.getElementById('recipientInfo');
  if (recipientInfo) {
    recipientInfo.innerHTML = `
      <p><strong>Sender:</strong> ${parcel.sender || 'N/A'}</p>
      <p><strong>Receiver:</strong> ${parcel.receiver || 'N/A'}</p>
      <p><strong>Address:</strong> ${parcel.address || 'N/A'}</p>
      <p><strong>Phone:</strong> ${parcel.phone || 'N/A'}</p>
      <p><strong>Email:</strong> ${parcel.email || 'N/A'}</p>
      <p><strong>Current Status:</strong> ${latestStatus.status || 'Unknown'}</p>
      <p><strong>Location:</strong> ${latestStatus.location || 'In transit'}</p>
      <p><strong>Last Updated:</strong> ${latestStatus.timestamp ? new Date(latestStatus.timestamp).toLocaleString() : new Date().toLocaleString()}</p>
    `;
  }
  
  // Update status history if element exists
  const statusHistory = document.getElementById('statusHistory');
  if (statusHistory && Array.isArray(parcel.status)) {
    statusHistory.innerHTML = parcel.status
      .map(status => `
        <div class="status-update">
          <strong>${status.status}</strong>
          <p>${status.location || 'Unknown location'}</p>
          <small>${status.timestamp ? new Date(status.timestamp).toLocaleString() : 'Just now'}</small>
        </div>
      `)
      .join('');
  }
}

function updateInvoices(trackingNumber) {
  const list = document.getElementById('invoiceList');
  if (!list) return;
  
  list.innerHTML = `
    <div class="invoice-item">
      <p>No invoices found for this tracking number.</p>
      <p>In a production app, this would show invoice details.</p>
    </div>
  `;
}

function showError(message) {
  const parcelDetails = document.getElementById('parcelDetails');
  if (parcelDetails) {
    parcelDetails.innerHTML = `
      <div class="error-message">
        <h2>Parcel Not Found</h2>
        <p>${message}</p>
        <button class="support-btn" onclick="window.location.href='index.html'">🔙 Back to Home</button>
      </div>
    `;
  } else {
    document.body.innerHTML = `
      <div style="padding: 2rem; text-align: center;">
        <h2>Parcel Not Found</h2>
        <p>${message}</p>
        <button onclick="window.location.href='index.html'" style="margin-top: 1rem; padding: 0.5rem 1rem; cursor: pointer;">
          🔙 Back to Home
        </button>
      </div>
    `;
  }
}

function getProgressWidth(statusArray) {
  if (!Array.isArray(statusArray) || statusArray.length === 0) return '0%';
  
  const latestStatus = statusArray[statusArray.length - 1]?.status?.toLowerCase() || '';
  
  if (latestStatus.includes('delivered')) return '100%';
  if (latestStatus.includes('out for delivery')) return '75%';
  if (latestStatus.includes('in transit')) return '50%';
  if (latestStatus.includes('processing') || latestStatus.includes('received')) return '25%';
  return '0%';
}

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  return date.toLocaleString();
}
