import authService from './authService.js';

// Audio recognition variables
let recognition;
let finalTranscript = '';
let isRecognizing = false;
let screenStream = null;
let floatingWindow = null;

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
    
    // Add global keyboard shortcut listener
    setupKeyboardShortcuts();
    
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
        // Check if this is a question that needs AI response
        if (isQuestion(transcript)) {
          getAIResponse(transcript);
        }
      } else {
        interimTranscript += transcript;
      }
    }
    
    const transcriptText = finalTranscript + '<i>' + interimTranscript + '</i>';
    document.getElementById('transcript').innerHTML = transcriptText;
    
    // Update floating window if active
    if (floatingWindow && !floatingWindow.closed) {
      floatingWindow.document.getElementById('floating-transcript').innerHTML = transcriptText;
    }
  };

  recognition.onerror = function(event) {
    console.error('Recognition error:', event.error);
    document.getElementById('status').textContent = 'Error: ' + event.error;
  };
}

function isQuestion(text) {
  // Simple detection of technical interview questions
  const keywords = [
    'explain', 'what is', 'how would you', 'describe', 'difference between',
    'algorithm', 'data structure', 'complexity', 'implement', 'design pattern',
    'javascript', 'react', 'node', 'python', 'java', 'c++', 'sql', 'database'
  ];
  
  text = text.toLowerCase();
  return text.includes('?') || keywords.some(keyword => text.includes(keyword));
}

// Add this new function for keyboard shortcuts
function setupKeyboardShortcuts() {
  // Add event listener to the document for keyboard shortcuts
  document.addEventListener('keydown', function(event) {
    // Check for Ctrl+Space shortcut
    if (event.ctrlKey && event.code === 'Space') {
      event.preventDefault(); // Prevent default browser behavior
      
      // Get the last 30 seconds of transcript
      const lastText = getRecentTranscript();
      if (lastText.trim()) {
        // Force AI to answer regardless of question detection
        getAIResponse(lastText, true);
      }
    }
  });
  
  // Also add the listener to the floating window if it exists
  if (floatingWindow && !floatingWindow.closed) {
    floatingWindow.document.addEventListener('keydown', function(event) {
      if (event.ctrlKey && event.code === 'Space') {
        event.preventDefault();
        const lastText = getRecentTranscript();
        if (lastText.trim()) {
          getAIResponse(lastText, true);
        }
      }
    });
  }
}

// Function to get recent transcript (last 30 seconds or so)
function getRecentTranscript() {
  // Get the raw text without HTML tags
  const fullText = finalTranscript.trim();
  
  // Get approximately the last 200 characters or the full text if shorter
  const startPos = Math.max(0, fullText.length - 200);
  return fullText.substring(startPos);
}

async function getAIResponse(question, force = false) {
  try {
    document.getElementById('status').textContent = 'Getting AI response...';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const apiKey = 'AIzaSyDwaIDizAt1mWFV1EP_Vu1SRFYm-w6JBkc';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Explain node.js in simple terms.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048 // Try a higher token limit
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("API Response:", data);

    let answer = '';

    // Check for finishReason and extract answer if present
    if (
      data.candidates &&
      data.candidates.length > 0 &&
      data.candidates[0].finishReason !== "MAX_TOKENS"
    ) {
      const candidate = data.candidates[0];
      if (
        candidate.content &&
        candidate.content.parts &&
        candidate.content.parts.length > 0
      ) {
        answer = candidate.content.parts.map(part => part.text || '').join(' ');
      }
    }

    // If no answer or finishReason is MAX_TOKENS, use fallback
    if (!answer.trim()) {
      provideFallbackResponse(question);
      return;
    }

    const aiResponse = `<div class="ai-response"><strong>AI:</strong> ${answer}</div>`;
    document.getElementById('transcript').innerHTML += aiResponse;

    if (floatingWindow && !floatingWindow.closed) {
      floatingWindow.document.getElementById('floating-transcript').innerHTML += aiResponse;
    }

    document.getElementById('status').textContent = 'AI response received';
  } catch (error) {
    console.error('AI response error:', error);
    document.getElementById('status').textContent = `Error: ${error.message}`;

    const errorMsg = `<div class="ai-error">Failed to get AI response: ${error.message}. Try again.</div>`;
    document.getElementById('transcript').innerHTML += errorMsg;

    if (floatingWindow && !floatingWindow.closed) {
      floatingWindow.document.getElementById('floating-transcript').innerHTML += errorMsg;
    }

    provideFallbackResponse(question);
  }
}

// Add a fallback function for common technical questions
function provideFallbackResponse(question) {
  const questionLower = question.toLowerCase();
  let answer = '';
  
  if (questionLower.includes('node.js')) {
    answer = "Node.js is a JavaScript runtime built on Chrome's V8 engine that allows executing JavaScript code outside a web browser. It uses an event-driven, non-blocking I/O model making it lightweight and efficient for building scalable network applications. Key features include npm (package manager), asynchronous programming, and a rich ecosystem of libraries.";
  } else if (questionLower.includes('javascript')) {
    answer = "JavaScript is a high-level, interpreted programming language that conforms to the ECMAScript specification. It's primarily used for web development to create dynamic content, control multimedia, animate images, and much more. JavaScript is prototype-based with first-class functions, making it a multi-paradigm language supporting object-oriented, imperative, and functional programming styles.";
  } else if (questionLower.includes('react')) {
    answer = "React is a JavaScript library for building user interfaces, particularly single-page applications. It's maintained by Facebook and a community of developers. React allows developers to create large web applications that can change data without reloading the page. Key concepts include components, JSX, virtual DOM, and unidirectional data flow.";
  } else {
    return; // No fallback available
  }
  
  // Display the fallback answer
  const aiResponse = `<div class="ai-response"><strong>AI (Fallback):</strong> ${answer}</div>`;
  document.getElementById('transcript').innerHTML += aiResponse;
  
  // Update floating window if active
  if (floatingWindow && !floatingWindow.closed) {
    floatingWindow.document.getElementById('floating-transcript').innerHTML += aiResponse;
  }
  
  document.getElementById('status').textContent = 'Fallback response provided';
}

// Improve the screen capture function for better audio handling
async function captureScreenWithAudio() {
  try {
    // Request screen capture with audio
    screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    });
    
    // Extract audio tracks
    const audioTracks = screenStream.getAudioTracks();
    if (audioTracks.length === 0) {
      // If no audio track, show warning but continue
      document.getElementById('status').textContent = 'Warning: No audio detected in screen share';
    } else {
      document.getElementById('status').textContent = 'Capturing screen with audio...';
      
      // Create audio context to process the audio
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(new MediaStream([audioTracks[0]]));
      
      // Create an analyzer to monitor audio levels
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);
      
      // Set up audio monitoring
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Function to check audio levels periodically
      const checkAudioLevels = () => {
        if (!screenStream) return; // Stop if screen sharing ended
        
        analyzer.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        
        // Log audio levels for debugging
        if (average > 10) { // Only log when there's significant audio
          document.getElementById('audioLog').value += `[${new Date().toLocaleTimeString()}] Audio level: ${average.toFixed(2)}\n`;
        }
        
        // Continue monitoring
        requestAnimationFrame(checkAudioLevels);
      };
      
      // Start monitoring
      checkAudioLevels();
    }
    
    // Start recognition if not already running
    if (!isRecognizing) {
      finalTranscript = '';
      recognition.start();
      isRecognizing = true;
    }
    
    // Handle screen share ending
    screenStream.getVideoTracks()[0].onended = function() {
      stopScreenCapture();
    };
    
    // Create floating window automatically if not already open
    if (!floatingWindow || floatingWindow.closed) {
      createFloatingWindow();
    }
    
  } catch (error) {
    console.error('Screen capture error:', error);
    document.getElementById('status').textContent = 'Error: ' + error.message;
  }
}

// Update the floating window creation to include keyboard shortcut info
function createFloatingWindow() {
  // Create a small floating window
  floatingWindow = window.open('', 'floatingTranscript', 'width=400,height=300');
  
  // Add content and styling to the floating window
  floatingWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Interview Assistant</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 10px;
          background-color: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border-radius: 10px;
          overflow: hidden;
          user-select: none;
        }
        #floating-transcript {
          height: 220px;
          overflow-y: auto;
          margin-bottom: 10px;
          padding: 5px;
          border: 1px solid #ddd;
          border-radius: 5px;
          background-color: rgba(255, 255, 255, 0.8);
        }
        .controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        button {
          padding: 5px 10px;
          background-color: #4285f4;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin: 0 2px;
        }
        .shortcut-info {
          font-size: 11px;
          color: #666;
          margin-top: 5px;
          text-align: center;
        }
        .ai-response {
          margin-top: 10px;
          padding: 5px;
          background-color: #f0f7ff;
          border-left: 3px solid #4285f4;
        }
        .ai-error {
          margin-top: 10px;
          padding: 5px;
          background-color: #fff0f0;
          border-left: 3px solid #f44336;
          color: #f44336;
        }
      </style>
    </head>
    <body>
      <div id="floating-transcript">${document.getElementById('transcript').innerHTML}</div>
      <div class="controls">
        <button id="toggle-btn">Pause/Resume</button>
        <button id="ai-help-btn">Get AI Help</button>
        <button id="clear-btn">Clear</button>
        <button id="close-btn">Close</button>
      </div>
      <div class="shortcut-info">Press Ctrl+Space for instant AI help</div>
      <script>
        // Make window draggable
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        document.body.onmousedown = dragMouseDown;
        
        function dragMouseDown(e) {
          if (e.target.tagName === 'BUTTON') return; // Don't drag when clicking buttons
          e.preventDefault();
          pos3 = e.clientX;
          pos4 = e.clientY;
          document.onmouseup = closeDragElement;
          document.onmousemove = elementDrag;
        }
        
        function elementDrag(e) {
          e.preventDefault();
          pos1 = pos3 - e.clientX;
          pos2 = pos4 - e.clientY;
          pos3 = e.clientX;
          pos4 = e.clientY;
          window.moveBy(-pos1, -pos2);
        }
        
        function closeDragElement() {
          document.onmouseup = null;
          document.onmousemove = null;
        }
        
        // Button controls
        document.getElementById('toggle-btn').onclick = function() {
          window.opener.toggleRecognition();
        };
        
        document.getElementById('ai-help-btn').onclick = function() {
          const transcript = window.opener.finalTranscript;
          const recentText = transcript.slice(-200); // Get last 200 chars
          if (recentText.trim()) {
            window.opener.getAIResponse(recentText, true);
          }
        };
        
        document.getElementById('clear-btn').onclick = function() {
          document.getElementById('floating-transcript').innerHTML = '';
          window.opener.finalTranscript = '';
          window.opener.document.getElementById('transcript').innerHTML = '';
        };
        
        document.getElementById('close-btn').onclick = function() {
          window.close();
        };
        
        // Add keyboard shortcut
        document.addEventListener('keydown', function(event) {
          if (event.ctrlKey && event.code === 'Space') {
            event.preventDefault();
            const transcript = window.opener.finalTranscript;
            const recentText = transcript.slice(-200);
            if (recentText.trim()) {
              window.opener.getAIResponse(recentText, true);
            }
          }
        });
      </script>
    </body>
    </html>
  `);
  
  // Set window properties for "always on top" effect
  floatingWindow.document.title = "Interview Assistant";
  floatingWindow.focus();
}

function stopAllCapture() {
  // Stop recognition
  if (isRecognizing) {
    recognition.stop();
    isRecognizing = false;
  }
  
  // Stop screen capture
  stopScreenCapture();
  
  // Close floating window
  if (floatingWindow && !floatingWindow.closed) {
    floatingWindow.close();
    floatingWindow = null;
  }
  
  document.getElementById('status').textContent = 'All capture stopped';
}

function setupEventListeners() {
  const microphoneBtn = document.getElementById('microphoneBtn');
  const systemAudioBtn = document.getElementById('systemAudioBtn');
  const screenShareBtn = document.getElementById('screenShareBtn');
  const stopBtn = document.getElementById('stopBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  if (microphoneBtn) {
    microphoneBtn.addEventListener('click', function() {
      toggleRecognition();
    });
  }

  if (screenShareBtn) {
    screenShareBtn.addEventListener('click', function() {
      captureScreenWithAudio();
    });
  }

  if (systemAudioBtn) {
    systemAudioBtn.addEventListener('click', function() {
      document.getElementById('status').textContent = 'System audio capture initiated...';
      // Implement system audio capture logic here
    });
  }

  if (stopBtn) {
    stopBtn.addEventListener('click', function() {
      stopAllCapture();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function() {
      await authService.logout();
      window.location.reload();
    });
  }
}

function toggleRecognition() {
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
}

function stopScreenCapture() {
  if (screenStream) {
    screenStream.getTracks().forEach(track => track.stop());
    screenStream = null;
    document.getElementById('status').textContent = 'Screen capture stopped';
  }
}

// Add this function to help debug
function debugAPICall() {
  const apiKey = 'AIzaSyDwaIDizAt1mWFV1EP_Vu1SRFYm-w6JBkc';
  const testUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  fetch(testUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`API test failed: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("API Test Success:", data);
      document.getElementById('status').textContent = 'API connection successful';
    })
    .catch(error => {
      console.error("API Test Error:", error);
      document.getElementById('status').textContent = `API test failed: ${error.message}`;
    });
}

// Call this function to test API connectivity
// Add a button in your HTML to trigger this:
// <button id="testApiBtn">Test API Connection</button>