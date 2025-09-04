import authService from './authService.js';

// Audio recognition variables
let recognition;
let finalTranscript = '';
let isRecognizing = false;

document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Check authentication
    if (!await authService.isAuthenticated()) {
      await authService.login();
    }
    
    // Show user info
    const user = await authService.fetchUserInfo();
    document.getElementById('user-info').textContent = `Welcome, ${user.name}`;
    document.getElementById('logoutBtn').style.display = 'block';
    
    // Initialize audio features
    initAudioRecognition();
    setupEventListeners();
    
  } catch (error) {
    console.error('Initialization error:', error);
    document.getElementById('status').textContent = 'Error: ' + error.message;
  }
});

function initAudioRecognition() {
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = function(event) {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }
    document.getElementById('transcript').innerHTML = finalTranscript + '<i>' + interimTranscript + '</i>';
  };

  recognition.onerror = function(event) {
    console.error('Recognition error:', event.error);
    document.getElementById('status').textContent = 'Error: ' + event.error;
  };
}

function setupEventListeners() {
  document.getElementById('microphoneBtn').addEventListener('click', function() {
    if (isRecognizing) {
      recognition.stop();
      isRecognizing = false;
      document.getElementById('status').textContent = 'Stopped';
    } else {
      finalTranscript = '';
      recognition.start();
      isRecognizing = true;
      document.getElementById('status').textContent = 'Listening...';
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', async function() {
    await authService.logout();
    window.location.reload();
  });
}