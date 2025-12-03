// Main JavaScript for ParcelForce

document.addEventListener('DOMContentLoaded', () => {
  // Track Item Function
  function trackItem() {
    const trackingNumber = document.getElementById('trackingNumber').value.trim();
    if (!trackingNumber) {
      alert('Please enter a tracking number');
      return;
    }
    window.location.href = `track.html?id=${encodeURIComponent(trackingNumber)}`;
  }

  // Dark Mode Toggle
  function toggleDarkMode() {
    const body = document.body;
    const icon = document.getElementById('modeIcon');
    
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    
    icon.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDark);
  }

  // Event Listeners
  const trackButton = document.getElementById('trackButton');
  if (trackButton) {
    trackButton.addEventListener('click', trackItem);
  }

  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleDarkMode);
  }

  // Check for dark mode preference
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    const icon = document.getElementById('modeIcon');
    if (icon) {
      icon.textContent = '☀️';
    }
  }
});
