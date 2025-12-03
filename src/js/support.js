

// ✅ Auto-fill email if logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById('email').value = user.email;
  }
});

// ✅ Auto-fill tracking number from URL
const urlParams = new URLSearchParams(window.location.search);
const refNum = urlParams.get("ref");
if (refNum) {
  document.getElementById('tracking').value = refNum;
}

// ✅ Submit support request
document.getElementById('supportForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const tracking = document.getElementById('tracking').value.trim();
  const message = document.getElementById('message').value.trim();

  const request = {
    name,
    email,
    tracking,
    message,
    timestamp: new Date().toISOString()
  };

  push(ref(db, 'supportRequests'), request)
    .then(() => {
      document.getElementById('feedback').textContent = '✅ Request submitted. We’ll get back to you shortly.';
      document.getElementById('supportForm').reset();
      if (auth.currentUser) {
        document.getElementById('email').value = auth.currentUser.email;
      }
      if (refNum) {
        document.getElementById('tracking').value = refNum;
      }
    })
    .catch((error) => {
      document.getElementById('feedback').textContent = '❌ Error: ' + error.message;
    });
});
