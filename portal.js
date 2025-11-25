// portal.js (cleaned, no Firebase)

// 🔍 Search Parcel function
window.searchParcel = async function () {
  const refNum = document.getElementById('searchInput').value.trim();
  const resultArea = document.getElementById('resultArea');
  resultArea.innerHTML = '🔄 Searching...';

  if (!refNum) {
    resultArea.innerHTML = '<p>Please enter a tracking number.</p>';
    return;
  }

  try {
    // 👉 Replace this with your own API call or backend logic
    // Example: const response = await fetch(`/api/parcels/${refNum}`);
    // const data = await response.json();

    // Temporary mock data for demonstration
    const data = {
      status: [
        { status: "In Transit", location: "Johannesburg Hub" },
        { status: "Out for Delivery", location: "Sandton" }
      ]
    };

    if (!data) {
      resultArea.innerHTML = `<p>❌ Parcel <strong>${refNum}</strong> not found.</p>`;
      return;
    }

    const latest = Array.isArray(data.status) ? data.status[data.status.length - 1] : {};

    resultArea.innerHTML = `
      <div class="result-card">
        <strong>Tracking Number:</strong> ${refNum}<br>
        <strong>Status:</strong> ${latest.status || 'Unknown'}<br>
        <strong>Location:</strong> ${latest.location || 'N/A'}<br>
        <a href="track.html?ref=${refNum}" target="_blank">📍 Track Parcel</a><br>
        <a href="receipt.html?ref=${refNum}" target="_blank">🧾 View Invoice</a>
      </div>
    `;
  } catch (error) {
    resultArea.innerHTML = `<p>Error: ${error.message}</p>`;
  }
};
