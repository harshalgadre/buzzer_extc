 // Application state
let currentScreen = 'login';
let userData = null;
let authToken = null;

// Backend API base URL (local for development)
const API_BASE = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

async function initializeApp() {
  // Check if user is already authenticated
  await checkAuthStatus();
  
  // Setup event listeners
  setupEventListeners();
}

async function checkAuthStatus() {
  try {
    // Check stored auth data first
    const stored = await new Promise((resolve) => {
      chrome.storage.local.get(['authToken', 'user'], (result) => {
        resolve(result);
      });
    });

    if (stored.authToken && stored.user) {
      authToken = stored.authToken;
      userData = stored.user;

      // Optional: Verify token with backend
      try {
        const response = await fetch(`${API_BASE}/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        if (response.ok) {
          showScreen('dashboard');
          return;
        }
      } catch (err) {
        console.log('Token verification failed, but using stored data');
      }

      showScreen('dashboard');
      return;
    }

    // Show login screen if not authenticated
    showScreen('login');
  } catch (error) {
    console.error('Auth check failed:', error);
    showScreen('login');
  }
}

async function loadSessions() {
  if (!authToken) return;

  try {
    const response = await fetch(`${API_BASE}/sessions`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      console.error('Failed to load sessions');
      return;
    }

    const sessions = await response.json();
    displaySessions(sessions);
  } catch (error) {
    console.error('Error loading sessions:', error);
  }
}

function displaySessions(sessions) {
  const container = document.querySelector('.scheduled-interviews-section');
  if (!container) return;

  // Clear existing content except title
  const title = container.querySelector('.section-title');
  container.innerHTML = '';
  if (title) container.appendChild(title);

  if (sessions.length === 0) {
    const noSessions = document.createElement('p');
    noSessions.textContent = 'No sessions created yet. Click "Create New" to get started.';
    noSessions.style.color = '#9ca3af';
    noSessions.style.fontSize = '14px';
    container.appendChild(noSessions);
    return;
  }

  sessions.forEach(session => {
    const sessionCard = document.createElement('div');
    sessionCard.className = 'interview-card';
    sessionCard.innerHTML = `
      <h3 class="interview-title">${session.scenario}</h3>
      <p class="interview-position">${session.position || 'Position not specified'} at ${session.company || 'Company not specified'}</p>
      <p class="interview-time">${new Date(session.createdAt).toLocaleString()} (${session.meetingLanguage})</p>
      <p style="color: #d1d5db; font-size: 12px;">URL: ${session.meetingUrl}</p>
      ${session.liveCoding ? '<span class="premium-badge">Live Coding</span>' : ''}
      ${session.aiInterview ? '<span class="premium-badge">AI Interview</span>' : ''}
      <div style="display: flex; gap: 8px; margin-top: 16px;">
        <button class="start-btn open-meeting-btn" data-url="${session.meetingUrl}" style="flex: 1;">
          Open Meeting
        </button>
        <button class="start-btn start-ai-btn" data-session-id="${session._id}" data-meeting-url="${session.meetingUrl}" style="background: linear-gradient(135deg, #10b981, #059669); flex: 1;">
          Start AI Helper
        </button>
      </div>
    `;
    container.appendChild(sessionCard);
  });

  // Add event listeners
  document.querySelectorAll('.open-meeting-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const url = e.target.getAttribute('data-url');
      window.open(url, '_blank');
    });
  });

  document.querySelectorAll('.start-ai-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sessionId = e.target.getAttribute('data-session-id');
      const meetingUrl = e.target.getAttribute('data-meeting-url');
      startAIHelper(sessionId, meetingUrl);
    });
  });
}

function setupEventListeners() {
  // Login screen
  document.getElementById('google-login-btn').addEventListener('click', handleGoogleLogin);
  document.getElementById('website-login-btn').addEventListener('click', showLoginForm);
  document.getElementById('form-back-btn').addEventListener('click', hideLoginForm);
  document.getElementById('form-login-btn').addEventListener('click', handleWebsiteLogin);
  document.getElementById('signup-link').addEventListener('click', handleSignup);

  // Dashboard screen
  document.getElementById('create-new-btn').addEventListener('click', showCreateForm);

  // Logout buttons (both dashboard and form screens)
  const logoutButtons = document.querySelectorAll('.power-btn');
  logoutButtons.forEach(button => {
    button.addEventListener('click', handleLogout);
  });

  // Form screen
  document.getElementById('back-btn').addEventListener('click', showDashboard);
  document.getElementById('save-btn').addEventListener('click', handleSave);

  // Toggle switches
  setupToggleSwitches();
}

function setupToggleSwitches() {
  const toggles = ['desktop-toggle', 'live-coding-toggle', 'ai-interview-toggle'];
  
  toggles.forEach(toggleId => {
    const toggle = document.getElementById(toggleId);
    if (toggle) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
      });
    }
  });
}

async function handleGoogleLogin() {
  try {
    // Disable button during login
    const googleBtn = document.getElementById('google-login-btn');
    googleBtn.disabled = true;
    googleBtn.textContent = 'Signing in...';

    // Use Chrome Identity API for Google OAuth
    const idToken = await new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(token);
        }
      });
    });

    if (!idToken) {
      throw new Error('No token received');
    }

    // Send to backend for verification and user creation
    const response = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ idToken })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || 'Google login failed');
    }

    const { token, user } = await response.json();

    // Store in chrome storage
    authToken = token;
    userData = {
      ...user,
      name: user.fullName, // Map fullName to name for consistency
      balance: '$0.00',
      plan: 'Starter Plan (40 triggers per interview)'
    };

    chrome.storage.local.set({ 
      authToken,
      user: userData
    });

    showScreen('dashboard');
  } catch (error) {
    console.error('Google login failed:', error);
    
    // Re-enable button
    const googleBtn = document.getElementById('google-login-btn');
    googleBtn.disabled = false;
    googleBtn.textContent = 'Continue with Google';
    
    // Show error message
    alert(`Google login failed: ${error.message}. Please try again.`);
  }
}

function handleSignup() {
  // Open signup page in new tab
  chrome.tabs.create({ url: 'https://buzzer-nu.vercel.app/signup' });
}

function showLoginForm() {
  document.querySelector('.login-options').style.display = 'none';
  document.getElementById('login-form').style.display = 'flex';
}

function hideLoginForm() {
  document.getElementById('login-form').style.display = 'none';
  document.querySelector('.login-options').style.display = 'flex';
}

async function handleWebsiteLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (!email || !password) {
    alert('Please enter both email and password.');
    return;
  }

  try {
    // Disable button during login
    const loginBtn = document.getElementById('form-login-btn');
    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing in...';

    // Send to backend
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || 'Login failed');
    }

    const { token, user } = await response.json();

    // Store in chrome storage
    authToken = token;
    userData = {
      ...user,
      name: user.fullName, // Map fullName to name for consistency
      balance: '$0.00',
      plan: 'Starter Plan (40 triggers per interview)'
    };

    chrome.storage.local.set({ 
      authToken,
      user: userData
    });

    // Clear form
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';

    // Hide form and show options
    hideLoginForm();

    showScreen('dashboard');
  } catch (error) {
    console.error('Website login failed:', error);
    
    // Re-enable button
    const loginBtn = document.getElementById('form-login-btn');
    loginBtn.disabled = false;
    loginBtn.textContent = 'Login';

    alert(`Login failed: ${error.message}. If no account, register first.`);
  }
}

function showCreateForm() {
  showScreen('form');
}

function showDashboard() {
  showScreen('dashboard');
}

async function handleLogout() {
  console.log('Logout button clicked');
  try {
    // Clear storage
    chrome.storage.local.remove(['authToken', 'user']);
    authToken = null;
    userData = null;
    showScreen('login');
    console.log('Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    userData = null;
    showScreen('login');
  }
}

async function handleSave() {
  if (!authToken) {
    alert('Please login first.');
    showScreen('login');
    return;
  }

  // Get form data
  const formData = {
    scenario: document.getElementById('scenario-select').value,
    meetingUrl: document.getElementById('meeting-url').value,
    isDesktopCall: document.getElementById('desktop-toggle').classList.contains('active'),
    liveCoding: document.getElementById('live-coding-toggle').classList.contains('active'),
    aiInterview: document.getElementById('ai-interview-toggle').classList.contains('active'),
    position: document.getElementById('position').value,
    company: document.getElementById('company').value,
    meetingLanguage: document.getElementById('meeting-language').value,
    translationLanguage: document.getElementById('translation-language').value,
    resume: document.getElementById('resume').value
  };

  if (!formData.scenario || !formData.meetingUrl) {
    alert('Please fill scenario and meeting URL.');
    return;
  }

  try {
    // Disable button
    const saveBtn = document.getElementById('save-btn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    // Send to backend
    const response = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || 'Save failed');
    }

    const session = await response.json();

    // Show success
    alert('Interview settings saved successfully!');
    showScreen('dashboard');
  } catch (error) {
    console.error('Save failed:', error);
    alert(`Save failed: ${error.message}. Please check if backend is running.`);
  } finally {
    // Re-enable button
    const saveBtn = document.getElementById('save-btn');
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
  }
}

function showScreen(screenName) {
  // Hide all screens
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('dashboard-screen').style.display = 'none';
  document.getElementById('form-screen').style.display = 'none';
  
  // Show the requested screen
  switch(screenName) {
    case 'login':
      document.getElementById('login-screen').style.display = 'flex';
      // Reset login form state
      document.querySelector('.login-options').style.display = 'flex';
      document.getElementById('login-form').style.display = 'none';
      // Clear form fields
      document.getElementById('login-email').value = '';
      document.getElementById('login-password').value = '';
      // Reset button states
      document.getElementById('google-login-btn').disabled = false;
      document.getElementById('google-login-btn').textContent = 'Continue with Google';
      currentScreen = 'login';
      break;
    case 'dashboard':
      document.getElementById('dashboard-screen').style.display = 'block';
      updateDashboardUI();
      loadSessions();
      currentScreen = 'dashboard';
      break;
    case 'form':
      document.getElementById('form-screen').style.display = 'block';
      updateDashboardUI();
      currentScreen = 'form';
      break;
  }
}

function updateDashboardUI() {
  if (userData) {
    const userNameElements = document.querySelectorAll('#user-name, #user-name-form');
    const userBalanceElements = document.querySelectorAll('#user-balance');
    
    userNameElements.forEach(el => el.textContent = userData.name);
    userBalanceElements.forEach(el => el.textContent = userData.balance);
  }
}

async function startAIHelper(sessionId, meetingUrl) {
  try {
    console.log('Starting AI Helper for session:', sessionId, 'Meeting URL:', meetingUrl);
    
    // First, request screen sharing
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    });
    
    if (!stream) {
      alert('Screen sharing is required to start AI Helper.');
      return;
    }
    
    // Store session info and screen stream info for AI helper
    await new Promise((resolve) => {
      chrome.storage.local.set({
        'currentSession': {
          id: sessionId,
          meetingUrl: meetingUrl,
          startTime: Date.now(),
          hasScreenShare: true
        }
      }, resolve);
    });

    // Send message to background script to open AI helper with screen sharing already active
    chrome.runtime.sendMessage({
      action: 'openAIHelperWithScreenShare',
      sessionId: sessionId,
      meetingUrl: meetingUrl,
      screenStream: true
    });

    console.log('AI Helper request sent to background script with screen sharing');
    
    // Close the popup after starting
    window.close();
    
  } catch (error) {
    console.error('Failed to start AI Helper:', error);
    if (error.name === 'NotAllowedError') {
      alert('Screen sharing permission denied. Please allow screen sharing to use AI Helper.');
    } else {
      alert('Failed to start AI Helper. Please try again.');
    }
  }
}
