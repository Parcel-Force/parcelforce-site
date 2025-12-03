// login.js (ES module)
// Replaces any Firebase logic with a local demo/auth stub.
// Keeps behaviour simple: validates inputs, simulates auth, stores a demo "currentUser" in localStorage.
// This is intentionally backend-free for development / static-site usage.

const form = document.getElementById('loginForm');
const emailEl = document.getElementById('email');
const passwordEl = document.getElementById('password');
const errorEl = document.getElementById('errorMsg');
const loginBtn = document.getElementById('loginBtn');
const loginBtnText = document.getElementById('loginBtnText');
const spinner = document.getElementById('loginSpinner');
const togglePasswordBtn = document.getElementById('togglePassword');

function showError(msg) {
  errorEl.style.display = 'block';
  errorEl.textContent = msg;
  errorEl.focus();
}

function clearError() {
  errorEl.style.display = 'none';
  errorEl.textContent = '';
}

// Simple demo user store helpers (localStorage)
const USERS_KEY = 'pf_demo_users';
const CURRENT_USER_KEY = 'pf_current_user';

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  } catch (e) {
    return {};
  }
}
function saveUsers(users) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch (e) {}
}

// For demo convenience: ensure a demo account exists
(function ensureDemoAccount() {
  const users = getUsers();
  if (!users['demo@parcelforce.test']) {
    users['demo@parcelforce.test'] = { name: 'Demo User', email: 'demo@parcelforce.test', password: 'password' };
    saveUsers(users);
  }
})();

function setCurrentUser(user) {
  try { localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user)); } catch (e) {}
}

// Basic validation
function validateInputs(email, password) {
  if (!email) return 'Enter your email address.';
  // basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
  if (!password) return 'Enter your password.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return '';
}

// Simulate authentication (no backend)
// - If email found in local users, password must match
// - If not found, ask the user to register
async function authenticate(email, password) {
  // simulate network delay
  await new Promise(r => setTimeout(r, 450));

  const users = getUsers();
  const user = users[email.toLowerCase()];
  if (!user) {
    return { ok: false, code: 'USER_NOT_FOUND', message: 'No account found for this email. Please sign up.' };
  }
  if (user.password !== password) {
    return { ok: false, code: 'WRONG_PASSWORD', message: 'Incorrect password. Try again or reset your password.' };
  }
  return { ok: true, user: { name: user.name, email: user.email } };
}

// UI helpers
function setLoading(on = true) {
  if (on) {
    loginBtn.setAttribute('disabled', 'disabled');
    spinner.style.display = 'inline-block';
    loginBtnText.textContent = 'Signing in...';
  } else {
    loginBtn.removeAttribute('disabled');
    spinner.style.display = 'none';
    loginBtnText.textContent = 'Login';
  }
}

// Toggle password visibility
if (togglePasswordBtn) {
  togglePasswordBtn.addEventListener('click', () => {
    const t = passwordEl.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordEl.setAttribute('type', t);
    togglePasswordBtn.textContent = t === 'password' ? 'Show' : 'Hide';
    togglePasswordBtn.setAttribute('aria-pressed', t === 'text' ? 'true' : 'false');
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError();

  const email = emailEl.value.trim().toLowerCase();
  const password = passwordEl.value;

  const validationError = validateInputs(email, password);
  if (validationError) {
    showError(validationError);
    if (validationError.includes('email')) emailEl.focus();
    else passwordEl.focus();
    return;
  }

  setLoading(true);
  const result = await authenticate(email, password).catch(err => ({ ok: false, message: 'Unexpected error' }));
  setLoading(false);

  if (!result.ok) {
    // friendly error for demo users
    if (result.code === 'USER_NOT_FOUND') {
      showError(result.message + ' You can <a href="register.html">create an account</a>.');
    } else {
      showError(result.message || 'Authentication failed.');
    }
    return;
  }

  // success: store demo "session" and redirect to index or to ref param
  setCurrentUser(result.user);
  // optional: support returnTo query param (e.g., ?redirect=/dashboard.html)
  const params = new URLSearchParams(location.search);
  const redirect = params.get('redirect') || 'index.html';
  // small success message, then redirect
  loginBtnText.textContent = 'Success!';
  setTimeout(() => {
    window.location.href = redirect;
  }, 600);
});

// Allow Enter on password to submit — handled by form submit listener already

// Accessibility: clear error when user types
[emailEl, passwordEl].forEach(el => {
  el.addEventListener('input', () => clearError());
});