// AI Helper Logic
let sessionId = null;
let meetingTabId = null;
let interviewerStream = null;
let userStream = null;
let interviewerRecognition = null;
let userRecognition = null;
let authToken = null;
let sessionData = null;
let isRecording = false;
let currentInteraction = { interviewerText: '', userText: '', aiResponse: '' };
let startTime = Date.now();
let timerInterval = null;

// Backend API base URL
const API_BASE = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', async function() {
  await initializeAIHelper();
  setupEventListeners();
  startTimer();
});

async function initializeAIHelper() {
  try {
    // Load session and auth from storage
    const stored = await new Promise((resolve) => {
      chrome.storage.local.get(['currentSessionId', 'meetingTabId', 'authToken', 'user'], (result) => {
        resolve(result);
      });
    });

    sessionId = stored.currentSessionId;
    meetingTabId = stored.meetingTabId;
    authToken = stored.authToken;

    if (!sessionId || !meetingTabId || !authToken) {
      alert('Session not found. Please start from the popup.');
      closeWindow();
      return;
    }

    // Fetch session data
    const response = await fetch(`${API_BASE}/sessions/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (response.ok) {
      sessionData = await response.json();
    }

    // Request permissions and start streams
    await startAudioCapture();
    await startSTT();

    console.log('AI Helper initialized for session:', sessionId);
  } catch (error) {
    console.error('Initialization failed:', error);
    alert('Failed to initialize AI Helper: ' + error.message);
  }
}

async function startAudioCapture() {
  try {
    // Capture tab audio (interviewer)
    interviewerStream = await new Promise((resolve, reject) => {
      chrome.tabCapture.capture(
        { audio: true, video: false },
        (stream) => {
          if (chrome.runtime.lastError || !stream) {
            reject(new Error('Failed to capture tab audio'));
          } else {
            resolve(stream);
          }
        }
      );
    });

    // User microphone
    userStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Attach to video placeholder for visualization (optional)
    const videoPlaceholder = document.querySelector('.video-placeholder');
    if (interviewerStream) {
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(interviewerStream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      // Simple visualization can be added here
    }

    // Update mic toggle
    updateMicToggle(true);
  } catch (error) {
    console.error('Audio capture failed:', error);
    alert('Audio access denied. Please grant microphone and tab capture permissions.');
  }
}

async function startSTT() {
  if ('webkitSpeechRecognition' in window) {
    // User mic STT
    userRecognition = new webkitSpeechRecognition();
    userRecognition.continuous = true;
    userRecognition.interimResults = true;
    userRecognition.lang = sessionData?.meetingLanguage || 'en-US';

    userRecognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        currentInteraction.userText = finalTranscript;
        addToTranscription('user', finalTranscript);
        saveInteraction();
      }
    };

    userRecognition.onerror = (event) => {
      console.error('User STT error:', event.error);
    };

    userRecognition.start();

    // For interviewer, since SpeechRecognition doesn't support custom stream directly,
    // use MediaRecorder to record short clips and send to backend for transcription
    startInterviewerRecording();
  } else {
    alert('Speech Recognition not supported in this browser.');
  }
}

function startInterviewerRecording() {
  if (!interviewerStream) return;

  const mediaRecorder = new MediaRecorder(interviewerStream);
  let chunks = [];
  let silenceStart = null;
  const SILENCE_TIMEOUT = 2000; // 2 seconds silence to end utterance
  const RECORD_INTERVAL = 500; // Check every 500ms

  mediaRecorder.ondataavailable = (event) => {
    chunks.push(event.data);
  };

  mediaRecorder.onstop = async () => {
    if (chunks.length > 0) {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const text = await transcribeAudio(blob);
      if (text) {
        currentInteraction.interviewerText = text;
        addToTranscription('interviewer', text);
        if (isQuestion(text)) {
          const aiResponse = await generateAIResponse(text);
          currentInteraction.aiResponse = aiResponse;
          addToTranscription('ai', aiResponse);
          addTopic(aiResponse); // Extract key topics
        }
        saveInteraction();
      }
      chunks = [];
    }
    silenceStart = null;
  };

  mediaRecorder.start();
  isRecording = true;

  // Simple VAD using AudioContext (basic volume threshold)
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(interviewerStream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  source.connect(analyser);

  const checkVolume = () => {
    if (!isRecording) return;

    analyser.getByteFrequencyData(dataArray);
    const volume = dataArray.reduce((a, b) => a + b) / bufferLength;

    if (volume > 20) { // Threshold for speech
      if (silenceStart) silenceStart = null;
      mediaRecorder.requestData(); // Collect data
    } else if (!silenceStart) {
      silenceStart = Date.now();
    } else if (Date.now() - silenceStart > SILENCE_TIMEOUT) {
      mediaRecorder.stop();
      setTimeout(() => {
        mediaRecorder.start();
      }, 100);
    }

    requestAnimationFrame(checkVolume);
  };

  checkVolume();
}

async function transcribeAudio(blob) {
  const formData = new FormData();
  formData.append('audio', blob, 'interviewer.webm');

  try {
    const response = await fetch(`${API_BASE}/transcribe`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: formData
    });
    if (response.ok) {
      const { text } = await response.json();
      return text;
    }
  } catch (error) {
    console.error('Transcription failed:', error);
  }
  return '';
}

function isQuestion(text) {
  const questionRegex = /\b(what|how|why|when|where|who|which|tell me about|explain|describe|can you|could you|would you|do you|are you|is it|does it|will you|should I|can I)\b/i;
  return questionRegex.test(text);
}

async function generateAIResponse(question) {
  try {
    const prompt = `As an interview coach for ${sessionData.position} at ${sessionData.company}, answer this question: ${question}. Keep it concise and helpful. Context: ${sessionData.resume || ''}`;

    const response = await fetch(`${API_BASE}/sessions/${sessionId}/generate-ai-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ question, prompt })
    });

    if (response.ok) {
      const { response: aiText } = await response.json();
      return aiText;
    }
  } catch (error) {
    console.error('AI response generation failed:', error);
  }
  return 'Sorry, I could not generate a response at this time.';
}

function addToTranscription(speaker, text) {
  const log = document.getElementById('transcription-log');
  const item = document.createElement('li');
  item.className = `transcription-item ${speaker}-text`;
  item.textContent = `${speaker.toUpperCase()}: ${text}`;
  log.appendChild(item);
  log.scrollTop = log.scrollHeight;
}

function addTopic(text) {
  const list = document.getElementById('topics-list');
  const item = document.createElement('li');
  item.className = 'topic-item';
  item.textContent = extractTopic(text); // Simple extraction, e.g., first sentence
  list.appendChild(item);
  list.scrollTop = list.scrollHeight;
}

function extractTopic(text) {
  return text.split('.')[0] + '.';
}

async function saveInteraction() {
  try {
    await fetch(`${API_BASE}/sessions/${sessionId}/ai-interaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(currentInteraction)
    });
    currentInteraction = { interviewerText: '', userText: '', aiResponse: '' };
  } catch (error) {
    console.error('Save interaction failed:', error);
  }
}

function setupEventListeners() {
  document.getElementById('help-btn').addEventListener('click', handleHelp);
  document.getElementById('end-btn').addEventListener('click', closeWindow);
  document.getElementById('prompt-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleHelp();
  });

  // Mic toggle
  document.getElementById('mic-toggle').addEventListener('click', toggleMic);
}

async function handleHelp() {
  const promptInput = document.getElementById('prompt-input');
  const customPrompt = promptInput.value.trim();
  if (!customPrompt) return;

  const aiResponse = await generateAIResponse(customPrompt);
  addToTranscription('ai', aiResponse);
  addTopic(aiResponse);
  saveInteraction(); // Save with empty interviewer/user if custom
  promptInput.value = '';
}

function toggleMic() {
  const isOn = userRecognition ? !userRecognition.running : false;
  if (isOn) {
    userRecognition.stop();
    updateMicToggle(false);
  } else {
    userRecognition.start();
    updateMicToggle(true);
  }
}

function updateMicToggle(on) {
  const icon = document.getElementById('mic-icon');
  const text = document.querySelector('#mic-toggle span');
  if (on) {
    icon.classList.remove('off');
    text.textContent = 'Microphone: On';
  } else {
    icon.classList.add('off');
    text.textContent = 'Microphone: Off';
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    document.getElementById('time-display').textContent = `${minutes}:${seconds}`;
  }, 1000);
}

function closeWindow() {
  if (timerInterval) clearInterval(timerInterval);
  if (userRecognition) userRecognition.stop();
  if (interviewerStream) interviewerStream.getTracks().forEach(track => track.stop());
  if (userStream) userStream.getTracks().forEach(track => track.stop());
  saveInteraction(); // Save final
  window.close();
}

// Close on ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeWindow();
});
