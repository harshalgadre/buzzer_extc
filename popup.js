// Application state
let currentScreen = 'login';
let userData = null;

// Simulate user data
const mockUserData = {
  name: 'Raj',
  balance: '$0.00',
  plan: 'Starter Plan (40 triggers per interview)'
};

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
      // Verify token is still valid
      const token = await new Promise((resolve) => {
        chrome.identity.getAuthToken({ interactive: false }, (token) => {
          resolve(token && !chrome.runtime.lastError ? token : null);
        });
      });

      if (token === stored.authToken) {
        userData = stored.user;
        showScreen('dashboard');
        return;
      }
    }
    
    // Show login screen if not authenticated
    showScreen('login');
  } catch (error) {
    console.error('Auth check failed:', error);
    showScreen('login');
  }
}

function setupEventListeners() {
  // Login screen
  document.getElementById('login-btn').addEventListener('click', handleLogin);
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

async function handleLogin() {
  try {
    // Show loading state
    showScreen('loading');

    // Use Chrome Identity API for Google OAuth
    const token = await new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(token);
        }
      });
    });

    if (token) {
      // Get user information from Google
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const userInfo = await response.json();
      
      // Store user data
      userData = {
        name: userInfo.name || userInfo.given_name || 'User',
        email: userInfo.email,
        balance: '$0.00',
        plan: 'Starter Plan (40 triggers per interview)',
        token: token
      };
      
      // Store in chrome storage
      chrome.storage.local.set({ 
        authToken: token,
        user: userData
      });
      
      showScreen('dashboard');
    }
  } catch (error) {
    console.error('Login failed:', error);
    
    // Show login screen again
    showScreen('login');
    
    // Show error message
    alert('Login failed. Please try again.');
  }
}

function handleSignup() {
  // Open signup page in new tab
  chrome.tabs.create({ url: 'https://Buzzer/signup' });
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
    // Get stored token
    const stored = await new Promise((resolve) => {
      chrome.storage.local.get(['authToken'], (result) => {
        resolve(result);
      });
    });

    console.log('Stored token:', stored.authToken);

    if (stored.authToken) {
      // Revoke token
      chrome.identity.removeCachedAuthToken({ token: stored.authToken });
      
      // Clear storage
      chrome.storage.local.remove(['authToken', 'user']);
      console.log('Token revoked and storage cleared');
    }
    
    userData = null;
    showScreen('login');
    console.log('Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    userData = null;
    showScreen('login');
  }
}

function handleSave() {
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
  
  // Store form data
  chrome.storage.local.set({ interviewSettings: formData });
  
  // Show success message and return to dashboard
  alert('Interview settings saved successfully!');
  showScreen('dashboard');
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
      currentScreen = 'login';
      break;
    case 'dashboard':
      document.getElementById('dashboard-screen').style.display = 'block';
      updateDashboardUI();
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