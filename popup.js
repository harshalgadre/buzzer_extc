import authService from './authService.js';

// Audio recognition variables
let recognition;
let finalTranscript = '';
let isRecognizing = false;
let screenStream = null;
let floatingWindow = null;

// Helper function to update status with different styles
function updateStatus(message, type = 'normal') {
  const statusElement = document.getElementById('status');
  statusElement.textContent = message;
  
  // Remove existing status classes
  statusElement.classList.remove('error', 'loading');
  
  // Add appropriate class
  if (type === 'error') {
    statusElement.classList.add('error');
  } else if (type === 'loading') {
    statusElement.classList.add('loading');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // Initially show sign-in screen
  showSignInScreen();
  
  // Setup sign-in button
  document.getElementById('signin-btn').addEventListener('click', handleSignIn);
});

async function handleSignIn() {
  try {
    // Show loading state
    const signInBtn = document.getElementById('signin-btn');
    signInBtn.innerHTML = '<div class="loading"></div> Signing in...';
    signInBtn.disabled = true;
    
    // Attempt login
    await authService.login();
    
    // Fetch user info
    const user = await authService.fetchUserInfo();
    
    // Show main UI
    showMainUI(user);
    
  } catch (error) {
    console.error('Sign-in error:', error);
    // Reset sign-in button
    const signInBtn = document.getElementById('signin-btn');
    signInBtn.innerHTML = `
      <svg class="google-icon" viewBox="0 0 24 24">
        <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Sign in with Google
    `;
    signInBtn.disabled = false;
    
    alert('Sign-in failed. Please try again.');
  }
}

function showSignInScreen() {
  document.getElementById('signin-container').style.display = 'flex';
  document.getElementById('main-container').style.display = 'none';
}

function showMainUI(user) {
  // Hide sign-in screen
  document.getElementById('signin-container').style.display = 'none';
  
  // Show main UI
  document.getElementById('main-container').style.display = 'block';
  
  // Update user info
  document.getElementById('user-name').textContent = `Welcome, ${user.name}`;
  document.getElementById('user-email').textContent = user.email;
  if (user.picture) {
    document.getElementById('user-avatar').src = user.picture;
  }
  
  // Load stats from storage
  loadStats();
  
  // Initialize audio features
  initAudioRecognition();
  setupEventListeners();
  
  // Add global keyboard shortcut listener
  setupKeyboardShortcuts();
}

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
    const liveTextElement = document.getElementById('live-text');
    if (liveTextElement) {
      liveTextElement.innerHTML = transcriptText || 'Start speaking to see transcription here...';
    }
    
    // Update floating window if active
    if (floatingWindow && !floatingWindow.closed) {
      const floatingLiveText = floatingWindow.document.getElementById('live-text');
      if (floatingLiveText) {
        floatingLiveText.innerHTML = transcriptText || 'Start speaking to see transcription here...';
      }
    }
  };

  recognition.onerror = function(event) {
    console.error('Recognition error:', event.error);
      document.getElementById('status').textContent = 'All capture stopped';
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

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
                text: `Please provide a clear, concise answer to this interview question: ${question}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024
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

    // Format the answer for better readability
    const formattedAnswer = formatAIResponse(answer);

    // Display in compact horizontal layout
    const qaItem = document.createElement('div');
    qaItem.className = 'qa-item';
    qaItem.innerHTML = `
      <div class="qa-content">
        <div class="question">
          <div class="question-label">Question</div>
          <div class="question-text">${question}</div>
        </div>
        <div class="answer">
          <div class="answer-label">AI Answer</div>
          <div class="answer-text">${formattedAnswer}</div>
          <button class="expand-btn" style="display: ${formattedAnswer.split('\n').length > 4 || formattedAnswer.length > 200 ? 'block' : 'none'};">Expand</button>
        </div>
      </div>
    `;
    
    // Insert before the live text element
    const liveTextElement = document.getElementById('live-text');
    if (liveTextElement) {
      liveTextElement.parentNode.insertBefore(qaItem, liveTextElement);
    } else {
      document.getElementById('transcript').appendChild(qaItem);
    }
    
    // Auto-scroll transcript to bottom
    const transcriptElement = document.getElementById('transcript');
    transcriptElement.scrollTop = transcriptElement.scrollHeight;

    if (floatingWindow && !floatingWindow.closed) {
      const floatingQaItem = qaItem.cloneNode(true);
      const floatingLiveText = floatingWindow.document.getElementById('live-text');
      if (floatingLiveText) {
        floatingLiveText.parentNode.insertBefore(floatingQaItem, floatingLiveText);
      } else {
        floatingWindow.document.getElementById('floating-transcript').appendChild(floatingQaItem);
      }
      const floatingTranscript = floatingWindow.document.getElementById('floating-transcript');
      floatingTranscript.scrollTop = floatingTranscript.scrollHeight;
    }

    updateStatus('AI response received');
  } catch (error) {
    console.error('AI response error:', error);
    updateStatus(`Error: ${error.message}`, 'error');

    const errorItem = document.createElement('div');
    errorItem.className = 'qa-item error';
    errorItem.innerHTML = `
      <div class="qa-content">
        <div class="question">
          <div class="question-label">Question</div>
          <div class="question-text">${question}</div>
        </div>
        <div class="answer">
          <div class="answer-label">Error</div>
          <div class="answer-text">Failed to get AI response: ${error.message}. Please try again.</div>
        </div>
      </div>
    `;
    
    // Insert before the live text element
    const liveTextElement = document.getElementById('live-text');
    if (liveTextElement) {
      liveTextElement.parentNode.insertBefore(errorItem, liveTextElement);
    } else {
      document.getElementById('transcript').appendChild(errorItem);
    }
    
    // Auto-scroll transcript to bottom
    const transcriptElement = document.getElementById('transcript');
    transcriptElement.scrollTop = transcriptElement.scrollHeight;

    if (floatingWindow && !floatingWindow.closed) {
      floatingWindow.document.getElementById('floating-transcript').innerHTML += errorMsg;
    }

    provideFallbackResponse(question);
  }
}

// Format AI response for better readability
function formatAIResponse(text) {
  if (!text) return '';
  
  // Clean up the text
  let formatted = text.trim();
  
  // Split into paragraphs and format
  const paragraphs = formatted.split(/\n\s*\n/);
  
  formatted = paragraphs.map(paragraph => {
    let p = paragraph.trim();
    
    // Bold text for key terms and concepts
    p = p.replace(/\b(Node\.js|JavaScript|React|HTML|CSS|API|JSON|HTTP|HTTPS|REST|GraphQL|MongoDB|SQL|Python|Java|TypeScript)\b/g, '<strong>$1</strong>');
    
    // Emphasize important phrases
    p = p.replace(/\b(key features?|important|benefits?|advantages?|main|primary|essential|crucial)\b/gi, '<em>$1</em>');
    
    // Format code-like terms
    p = p.replace(/\b(npm|yarn|git|webpack|babel|eslint|prettier|jest|cypress|docker)\b/g, '<code>$1</code>');
    
    // Format common programming concepts
    p = p.replace(/\b(callback|promise|async|await|closure|prototype|DOM|virtual DOM|component|props|state|hook|reducer)\b/gi, '<code>$1</code>');
    
    return `<p>${p}</p>`;
  }).join('');
  
  return formatted;
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
  
  // Display the fallback answer with new horizontal layout
  const formattedAnswer = formatAIResponse(answer);
  const fallbackItem = document.createElement('div');
  fallbackItem.className = 'qa-item fallback';
  fallbackItem.innerHTML = `
    <div class="qa-content">
      <div class="question">
        <div class="question-label">Question</div>
        <div class="question-text">${question}</div>
      </div>
      <div class="answer">
        <div class="answer-label">Fallback Answer</div>
        <div class="answer-text">${formattedAnswer}</div>
      </div>
    </div>
  `;
  
  // Insert before the live text element
  const liveTextElement = document.getElementById('live-text');
  if (liveTextElement) {
    liveTextElement.parentNode.insertBefore(fallbackItem, liveTextElement);
  } else {
    document.getElementById('transcript').appendChild(fallbackItem);
  }
  
  // Auto-scroll transcript to bottom
  const transcriptElement = document.getElementById('transcript');
  transcriptElement.scrollTop = transcriptElement.scrollHeight;

  // Update floating window if active
  if (floatingWindow && !floatingWindow.closed) {
    const floatingFallbackItem = fallbackItem.cloneNode(true);
    const floatingLiveText = floatingWindow.document.getElementById('live-text');
    if (floatingLiveText) {
      floatingLiveText.parentNode.insertBefore(floatingFallbackItem, floatingLiveText);
    } else {
      floatingWindow.document.getElementById('floating-transcript').appendChild(floatingFallbackItem);
    }
  }

  updateStatus('Fallback response provided');
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
      <title>Buuzzr - Interview Assistant</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 16px;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
          color: #f8fafc;
          border-radius: 16px;
          overflow: hidden;
          user-select: none;
          position: relative;
          min-height: 100vh;
        }
        
        body::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }
        
        #floating-transcript {
          height: 200px;
          overflow-y: auto;
          margin-bottom: 16px;
          padding: 16px;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(59, 130, 246, 0.1);
          border-radius: 12px;
          position: relative;
          z-index: 1;
          box-shadow: 
            0 4px 20px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        
        #floating-transcript::-webkit-scrollbar {
          width: 6px;
        }
        
        #floating-transcript::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 3px;
        }
        
        #floating-transcript::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 3px;
        }
        
        .controls {
          display: flex;
          gap: 8px;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        
        button {
          padding: 8px 14px;
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 12px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 
            0 2px 8px rgba(59, 130, 246, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        
        button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
          transition: left 0.5s;
        }
        
        button:hover::before {
          left: 100%;
        }
        
        button:hover {
          transform: translateY(-1px);
          box-shadow: 
            0 4px 15px rgba(59, 130, 246, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        
        #close-btn {
          background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
          box-shadow: 
            0 2px 8px rgba(220, 38, 38, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        
        #close-btn:hover {
          box-shadow: 
            0 4px 15px rgba(220, 38, 38, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        
        .shortcut-info {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 12px;
          text-align: center;
          font-weight: 500;
          position: relative;
          z-index: 1;
        }
        
        /* QA Item styles for floating window - Compact Horizontal */
        .qa-item {
          margin-bottom: 16px;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 
            0 6px 20px rgba(0, 0, 0, 0.3),
            0 2px 6px rgba(59, 130, 246, 0.1);
          transition: all 0.3s ease;
        }
        
        .qa-item:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 12px 30px rgba(0, 0, 0, 0.4),
            0 4px 12px rgba(59, 130, 246, 0.2);
        }
        
        .qa-item:last-child {
          margin-bottom: 0;
        }

        .qa-content {
          display: flex;
          min-height: 80px;
          background: linear-gradient(135deg, 
            rgba(15, 23, 42, 0.95) 0%, 
            rgba(30, 41, 59, 0.9) 50%, 
            rgba(51, 65, 85, 0.85) 100%);
          backdrop-filter: blur(15px);
        }
        
        .question {
          flex: 1;
          background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.2) 0%, 
            rgba(99, 102, 241, 0.15) 50%, 
            rgba(37, 99, 235, 0.1) 100%);
          padding: 14px;
          border-right: 1px solid rgba(59, 130, 246, 0.3);
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .question::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(180deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%);
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
        }

        .question::after {
          content: 'Q';
          position: absolute;
          top: 6px;
          right: 8px;
          font-size: 11px;
          font-weight: 800;
          color: #60a5fa;
          background: rgba(59, 130, 246, 0.15);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid rgba(59, 130, 246, 0.4);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
        }

        .answer {
          flex: 1.2;
          background: linear-gradient(135deg, 
            rgba(16, 185, 129, 0.2) 0%, 
            rgba(34, 197, 94, 0.15) 50%, 
            rgba(5, 150, 105, 0.1) 100%);
          padding: 14px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .answer::before {
          content: '';
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(180deg, #10b981 0%, #22c55e 50%, #34d399 100%);
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
        }

        .answer::after {
          content: 'AI';
          position: absolute;
          top: 6px;
          right: 8px;
          font-size: 10px;
          font-weight: 800;
          color: #34d399;
          background: rgba(16, 185, 129, 0.15);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid rgba(16, 185, 129, 0.4);
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
        }
        
        .question-label, .answer-label {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 6px;
          opacity: 0.8;
        }

        .question-label {
          color: #60a5fa;
        }

        .answer-label {
          color: #34d399;
        }
        
        .question-text {
          font-size: 12px;
          color: #f8fafc;
          font-weight: 600;
          line-height: 1.4;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }
        
        .answer-text {
          font-size: 11px;
          color: #f1f5f9;
          line-height: 1.5;
          font-weight: 500;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
        }

        /* Fallback and Error Variants */
        .qa-item.fallback .answer {
          background: linear-gradient(135deg, 
            rgba(245, 158, 11, 0.2) 0%, 
            rgba(217, 119, 6, 0.15) 50%, 
            rgba(180, 83, 9, 0.1) 100%);
        }

        .qa-item.fallback .answer::before {
          background: linear-gradient(180deg, #f59e0b 0%, #d97706 50%, #fbbf24 100%);
          box-shadow: 0 0 15px rgba(245, 158, 11, 0.5);
        }

        .qa-item.fallback .answer-label {
          color: #fbbf24;
        }

        .qa-item.fallback .answer::after {
          content: 'FB';
          font-size: 8px;
          font-weight: 800;
          color: #fbbf24;
          background: rgba(245, 158, 11, 0.15);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid rgba(245, 158, 11, 0.4);
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
        }

        .qa-item.error .answer {
          background: linear-gradient(135deg, 
            rgba(239, 68, 68, 0.2) 0%, 
            rgba(220, 38, 38, 0.15) 50%, 
            rgba(185, 28, 28, 0.1) 100%);
        }

        .qa-item.error .answer::before {
          background: linear-gradient(180deg, #ef4444 0%, #dc2626 50%, #f87171 100%);
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
        }

        .qa-item.error .answer-label {
          color: #f87171;
        }

        .qa-item.error .answer::after {
          content: 'ER';
          font-size: 8px;
          font-weight: 800;
          color: #f87171;
          background: rgba(239, 68, 68, 0.15);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid rgba(239, 68, 68, 0.4);
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
        }

        .qa-item.error .answer-text {
          color: #fecaca;
        }
        
        #live-text {
          color: #94a3b8;
          font-style: italic;
          font-size: 11px;
          font-weight: 500;
          padding: 12px;
          text-align: center;
          border: 2px dashed rgba(148, 163, 184, 0.2);
          border-radius: 8px;
          background: rgba(148, 163, 184, 0.02);
          margin-top: 8px;
        }

        #live-text:not(:empty) {
          color: #e2e8f0;
          border-color: rgba(59, 130, 246, 0.3);
          background: rgba(59, 130, 246, 0.05);
          font-style: normal;
          text-align: left;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      </style>
    </head>
    <body>
      <div id="floating-transcript">${document.getElementById('transcript').innerHTML}</div>
      <div class="controls">
        <button id="toggle-btn">⏸️ Toggle</button>
        <button id="ai-help-btn">AI Assistant</button>
        <button id="clear-btn">🗑️ Clear</button>
        <button id="close-btn">❌ Close</button>
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

function loadStats() {
  chrome.storage.local.get(['sessionCount', 'transcriptCount'], (result) => {
    document.getElementById('session-count').textContent = result.sessionCount || 0;
    document.getElementById('transcript-count').textContent = result.transcriptCount || 0;
  });
}

function updateStats() {
  chrome.storage.local.get(['sessionCount', 'transcriptCount'], (result) => {
    const newSessionCount = (result.sessionCount || 0) + 1;
    const newTranscriptCount = (result.transcriptCount || 0) + 1;
    
    chrome.storage.local.set({
      sessionCount: newSessionCount,
      transcriptCount: newTranscriptCount
    });
    
    document.getElementById('session-count').textContent = newSessionCount;
    document.getElementById('transcript-count').textContent = newTranscriptCount;
  });
}

function setupEventListeners() {
  const microphoneBtn = document.getElementById('microphone-btn');
  const screenShareBtn = document.getElementById('screen-share-btn');
  const floatingBtn = document.getElementById('floating-btn');
  const stopBtn = document.getElementById('stop-btn');
  const logoutBtn = document.getElementById('logout-btn');

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

  if (floatingBtn) {
    floatingBtn.addEventListener('click', function() {
      openFloatingWindow();
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
      // Reload to show sign-in screen
      window.location.reload();
    });
  }
}

function toggleRecognition() {
  if (isRecognizing) {
    recognition.stop();
    isRecognizing = false;
    document.getElementById('status').textContent = 'Audio capture stopped';
  } else {
    finalTranscript = '';
    recognition.start();
    isRecognizing = true;
    document.getElementById('status').textContent = 'Listening for audio...';
    updateStats(); // Update stats when starting a new session
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