// register.js (cleaned, no Firebase)

// Escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, (char) => map[char]);
}

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const errorMsg = document.getElementById('errorMsg');
  const successMsg = document.getElementById('successMsg');

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = escapeHtml(document.getElementById('name').value.trim());
    const email = escapeHtml(document.getElementById('email').value.trim());
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    errorMsg.textContent = '';
    errorMsg.style.display = 'none';
    successMsg.textContent = '';
    successMsg.style.display = 'none';

    if (!name || !email || !password || !confirmPassword) {
      errorMsg.textContent = 'Please fill in all fields.';
      errorMsg.style.display = 'block';
      return;
    }

    if (password.length < 6) {
      errorMsg.textContent = 'Password must be at least 6 characters.';
      errorMsg.style.display = 'block';
      return;
    }

    if (password !== confirmPassword) {
      errorMsg.textContent = 'Passwords do not match.';
      errorMsg.style.display = 'block';
      return;
    }

    const submitBtn = registerForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
      // 👉 Replace this with your own backend logic or localStorage
      // Example: save to localStorage for testing
      const userData = {
        name,
        email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(`user_${email}`, JSON.stringify(userData));

      successMsg.textContent = 'Account created successfully! Redirecting to login...';
      successMsg.style.display = 'block';

      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);

    } catch (error) {
      errorMsg.textContent = 'Registration failed. Please try again.';
      errorMsg.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
      console.error('Registration error:', error);
    }
  });
});
