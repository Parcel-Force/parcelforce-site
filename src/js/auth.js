// auth.js — local-only authentication (no Firebase)
// Simple demo auth: stores users in localStorage under 'pf_demo_users' and current user under 'pf_current_user'.
// Intended for development/local static sites. Do NOT use this for production authentication.

document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const loginBtnText = document.getElementById('loginBtnText');
  const signupBtnText = document.getElementById('signupBtnText');
  const feedbackEl = document.getElementById('feedback');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const switchLink = document.getElementById('switchLink');
  const divider = document.getElementById('divider');
  const formTitle = document.getElementById('formTitle');
  const formSubtitle = document.getElementById('formSubtitle');
  const authForm = document.getElementById('authForm');
  
  // Constants
  const STORAGE_USERS_KEY = 'pf_demo_users';
  const STORAGE_USER_KEY = 'pf_current_user';
  
  let isSignupMode = false;

  // --- Helper Functions ---
  function readUsers() {
    try { 
      return JSON.parse(localStorage.getItem(STORAGE_USERS_KEY) || '{}'); 
    } catch (e) { 
      console.error('Error reading users:', e);
      return {}; 
    }
  }

  function saveUsers(users) {
    try { 
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users)); 
    } catch (e) { 
      console.error('Error saving users:', e);
    }
  }

  function setCurrentUser(user) {
    try { 
      if (user) {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_USER_KEY);
      }
    } catch (e) {
      console.error('Error setting current user:', e);
    }
  }

  function clearCurrentUser() {
    try { 
      localStorage.removeItem(STORAGE_USER_KEY); 
    } catch (e) { 
      console.error('Error clearing current user:', e);
    }
  }

  function showFeedback(message, type = 'error') {
    if (!feedbackEl) return;
    
    feedbackEl.textContent = message;
    feedbackEl.className = type === 'success' ? 'success' : 'error';
    feedbackEl.classList.remove('success', 'error');
    feedbackEl.classList.add(type);
    feedbackEl.style.display = 'block';
    
    // Hide after a short while
    setTimeout(() => { 
      if (feedbackEl) feedbackEl.style.display = 'none'; 
    }, 5000);
  }

  function clearFeedback() {
    if (feedbackEl) {
      feedbackEl.textContent = '';
      feedbackEl.className = '';
      feedbackEl.style.display = 'none';
    }
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  function validatePassword(password) {
    return password && password.length >= 6;
  }

  function togglePasswordVisibility() {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      togglePasswordBtn.textContent = '👁️';
      togglePasswordBtn.setAttribute('aria-label', 'Hide password');
    } else {
      passwordInput.type = 'password';
      togglePasswordBtn.textContent = '👁️';
      togglePasswordBtn.setAttribute('aria-label', 'Show password');
    }
  }

  function switchAuthMode() {
    isSignupMode = !isSignupMode;
    
    if (isSignupMode) {
      // Switch to Sign Up mode
      if (formTitle) formTitle.textContent = '👋 Create Account';
      if (formSubtitle) formSubtitle.textContent = 'Create an account to track your parcels';
      if (loginBtn) loginBtn.style.display = 'none';
      if (signupBtn) signupBtn.style.display = 'block';
      if (switchLink) switchLink.textContent = 'Sign in';
      if (modeText) modeText.textContent = 'Already have an account? ';
      if (divider) divider.style.display = 'none';
    } else {
      // Switch to Login mode
      if (formTitle) formTitle.textContent = '🔐 Welcome Back';
      if (formSubtitle) formSubtitle.textContent = 'Sign in to track your parcels';
      if (loginBtn) loginBtn.style.display = 'block';
      if (signupBtn) signupBtn.style.display = 'none';
      if (switchLink) switchLink.textContent = 'Sign up';
      if (modeText) modeText.textContent = 'Don\'t have an account? ';
      if (divider) divider.style.display = 'block';
    }
    
    clearFeedback();
  }

  async function handleLogin() {
    clearFeedback();
    const email = (emailInput.value || '').trim().toLowerCase();
    const password = passwordInput.value || '';

    // Basic validation
    if (!email || !validateEmail(email)) {
      showFeedback('Please enter a valid email address');
      emailInput.focus();
      return;
    }

    if (!password) {
      showFeedback('Please enter your password');
      passwordInput.focus();
      return;
    }

    // Simulate API call
    try {
      // Show loading state
      if (loginBtnText) loginBtnText.textContent = 'Signing in...';
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const users = readUsers();
      const user = users[email];
      
      if (!user || user.password !== password) {
        throw new Error('Invalid email or password');
      }
      
      // Login successful
      setCurrentUser({ email: user.email, name: user.name });
      showFeedback('Login successful! Redirecting...', 'success');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
      
    } catch (error) {
      console.error('Login error:', error);
      showFeedback(error.message || 'Login failed. Please try again.');
    } finally {
      if (loginBtnText) loginBtnText.textContent = 'Log In';
    }
  }

  async function handleSignup() {
    clearFeedback();
    const email = (emailInput.value || '').trim().toLowerCase();
    const password = passwordInput.value || '';

    // Validation
    if (!email || !validateEmail(email)) {
      showFeedback('Please enter a valid email address');
      emailInput.focus();
      return;
    }

    if (!validatePassword(password)) {
      showFeedback('Password must be at least 6 characters long');
      passwordInput.focus();
      return;
    }

    // Simulate API call
    try {
      // Show loading state
      if (signupBtnText) signupBtnText.textContent = 'Creating account...';
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const users = readUsers();
      
      if (users[email]) {
        throw new Error('An account with this email already exists');
      }
      
      // Create new user
      users[email] = {
        email,
        password, // In a real app, never store plain text passwords!
        name: email.split('@')[0], // Use the part before @ as name
        createdAt: new Date().toISOString()
      };
      
      saveUsers(users);
      
      // Auto-login the new user
      setCurrentUser({ email, name: users[email].name });
      showFeedback('Account created successfully! Redirecting...', 'success');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
      
    } catch (error) {
      console.error('Signup error:', error);
      showFeedback(error.message || 'Signup failed. Please try again.');
    } finally {
      if (signupBtnText) signupBtnText.textContent = 'Create New Account';
    }
  }

  // --- Event Listeners ---
  if (authForm) {
    authForm.addEventListener('submit', function(e) {
      e.preventDefault();
      if (isSignupMode) {
        handleSignup();
      } else {
        handleLogin();
      }
    });
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', handleLogin);
  }

  if (signupBtn) {
    signupBtn.addEventListener('click', handleSignup);
  }

  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
  }

  if (switchLink) {
    switchLink.addEventListener('click', function(e) {
      e.preventDefault();
      switchAuthMode();
    });
  }

  // Initialize form
  if (signupBtn) signupBtn.style.display = 'none';
  if (divider) divider.style.display = 'block';
});
