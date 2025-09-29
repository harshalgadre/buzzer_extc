import React, { useState, useCallback, useRef, useEffect } from 'react';

const ExtensionWindow = () => {
  const [activeTab, setActiveTab] = useState('transcription');
  const [helpCount, setHelpCount] = useState(3);
  const [calloutVisible, setCalloutVisible] = useState(true);
  const [transcriptionItems, setTranscriptionItems] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  
  // Audio states (screen sharing handled before overlay opens)
  const [isUserMicOn, setIsUserMicOn] = useState(false);
  const [isSystemAudioOn, setIsSystemAudioOn] = useState(false);

  // Question detection regex patterns
  const questionPatterns = [
    /\b(?:what|how|why|when|where|who|which|can you|could you|would you|do you|did you|will you|is|are|am)\b.*\?/i,
    /\b(?:explain|describe|tell me|show me|help me|teach me)\b.*/i,
    /\b(?:what is|how to|why does|when did|where can|who is|which one)\b.*/i,
    /\b(?:javascript|html|css|nodejs|node\.?js|react|angular|vue|python|java|c\+\+|programming|coding|development)\b.*[\?]*$/i
  ];

  // Gemini API configuration
  const geminiApiKey = 'AIzaSyALmZY3vJq-4PFIUaHl4ZZsYGXdMkI7fCM'; // Replace with your actual API key
  const geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
  
  // Refs for media streams and recognition
  const userMicStreamRef = useRef(null);
  const systemRecognitionRef = useRef(null);
  const userRecognitionRef = useRef(null);
  const transcriptionListRef = useRef(null);

  const topics = [
    'Technical Skills',
    'Project Experience', 
    'Problem Solving',
    'Team Collaboration',
    'Leadership Examples'
  ];

  // Detect if text contains a question
  const isQuestion = useCallback((text) => {
    return questionPatterns.some(pattern => pattern.test(text.trim()));
  }, [questionPatterns]);

  // Process detected question with Gemini AI
  const processQuestion = useCallback(async (question) => {
    try {
      console.log('Processing question with Gemini:', question);
      
      const response = await fetch(`${geminiApiUrl}?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an AI assistant helping with technical questions. Please provide a clear, concise answer to this question: "${question}". Keep the response under 200 words and focus on practical, actionable information.`
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (answer) {
        setCurrentQuestion(question);
        setCurrentAnswer(answer);
        return answer;
      } else {
        throw new Error('No answer received from API');
      }
    } catch (error) {
      console.error('Error processing question:', error);
      const fallbackAnswer = getFallbackAnswer(question);
      setCurrentQuestion(question);
      setCurrentAnswer(fallbackAnswer);
      return fallbackAnswer;
    }
  }, [geminiApiKey, geminiApiUrl]);

  // Fallback answers for when API fails
  const getFallbackAnswer = useCallback((question) => {
    const lowerQ = question.toLowerCase();
    
    if (lowerQ.includes('javascript')) {
      return 'JavaScript is a dynamic programming language primarily used for web development. It enables interactive web pages and is an essential part of modern web applications alongside HTML and CSS.';
    } else if (lowerQ.includes('html')) {
      return 'HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure and content of web pages using elements and tags.';
    } else if (lowerQ.includes('nodejs') || lowerQ.includes('node.js')) {
      return 'Node.js is a JavaScript runtime environment that allows you to run JavaScript on the server side. It\'s commonly used for building scalable web applications and APIs.';
    } else if (lowerQ.includes('css')) {
      return 'CSS (Cascading Style Sheets) is a stylesheet language used to describe the presentation and styling of HTML documents, controlling layout, colors, fonts, and visual appearance.';
    } else {
      return 'I\'d be happy to help with that question. Could you provide more specific details so I can give you a more targeted answer?';
    }
  }, []);

  const handleTabClick = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const closeCallout = useCallback(() => {
    setCalloutVisible(false);
  }, []);

  const addTranscriptionItem = useCallback((speaker, text, type) => {
    const newItem = {
      id: Date.now() + Math.random(),
      speaker,
      text,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTranscriptionItems(prev => [...prev, newItem]);
    
    // Auto-detect questions from transcription and process with AI
    if (type === 'user' || type === 'interviewer') {
      if (isQuestion(text)) {
        console.log('Question detected in transcription:', text);
        setTimeout(() => {
          processQuestion(text);
        }, 500); // Small delay to allow transcription to complete
      }
    }
    
    // Auto-scroll to bottom
    setTimeout(() => {
      if (transcriptionListRef.current) {
        transcriptionListRef.current.scrollTop = transcriptionListRef.current.scrollHeight;
      }
    }, 100);
  }, [isQuestion, processQuestion]);

  const triggerHelp = useCallback(() => {
    if (inputValue.trim()) {
      addTranscriptionItem('User', inputValue.trim(), 'user');
      
      // Check if it's a question and process with AI
      if (isQuestion(inputValue.trim())) {
        processQuestion(inputValue.trim());
      } else {
        setTimeout(() => {
          addTranscriptionItem('AI', 'I can help you with that. Let me analyze the current conversation context...', 'ai');
        }, 1000);
      }
      
      setInputValue('');
    } else {
      addTranscriptionItem('AI', 'I\'m ready to help! You can ask me questions about the interview or request specific assistance.', 'ai');
    }
    
    if (helpCount > 0) {
      setHelpCount(prev => prev - 1);
    }
  }, [inputValue, helpCount, addTranscriptionItem, isQuestion, processQuestion]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerHelp();
    }
  }, [triggerHelp]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      // System audio recognition (for interviewer)
      const systemRecognition = new SpeechRecognition();
      systemRecognition.continuous = true;
      systemRecognition.interimResults = false;
      systemRecognition.lang = 'en-US';
      
      systemRecognition.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const transcript = lastResult[0].transcript.trim();
          if (transcript) {
            addTranscriptionItem('Interviewer', transcript, 'interviewer');
          }
        }
      };
      
      systemRecognition.onerror = (event) => {
        console.error('System STT error:', event.error);
      };
      
      systemRecognitionRef.current = systemRecognition;

      // User microphone recognition
      const userRecognition = new SpeechRecognition();
      userRecognition.continuous = true;
      userRecognition.interimResults = false;
      userRecognition.lang = 'en-US';
      
      userRecognition.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const transcript = lastResult[0].transcript.trim();
          if (transcript) {
            addTranscriptionItem('User', transcript, 'user');
          }
        }
      };
      
      userRecognition.onerror = (event) => {
        console.error('User STT error:', event.error);
      };
      
      userRecognitionRef.current = userRecognition;
    }

    return () => {
      stopAllCapture();
    };
  }, [addTranscriptionItem]);

  // Initialize system audio capture (assuming screen sharing is already active)
  const initializeSystemAudio = useCallback(async () => {
    try {
      // System audio should already be available since screen sharing happened before overlay
      if (systemRecognitionRef.current) {
        setIsSystemAudioOn(true);
        systemRecognitionRef.current.start();
        addTranscriptionItem('AI', 'System audio transcription active.', 'ai');
      }
    } catch (error) {
      console.error('System audio initialization failed:', error);
      addTranscriptionItem('AI', 'System audio initialization failed.', 'ai');
    }
  }, [addTranscriptionItem]);

  // Toggle user microphone
  const toggleUserMic = useCallback(async () => {
    if (!isUserMicOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        userMicStreamRef.current = stream;
        setIsUserMicOn(true);
        
        if (userRecognitionRef.current) {
          userRecognitionRef.current.start();
        }
        
        addTranscriptionItem('AI', 'Started capturing your microphone audio.', 'ai');
      } catch (error) {
        console.error('Microphone access failed:', error);
        addTranscriptionItem('AI', 'Microphone access failed. Please allow microphone permissions.', 'ai');
      }
    } else {
      if (userMicStreamRef.current) {
        userMicStreamRef.current.getTracks().forEach(track => track.stop());
        userMicStreamRef.current = null;
      }
      
      if (userRecognitionRef.current) {
        try {
          userRecognitionRef.current.stop();
        } catch (e) {
          console.log('User recognition already stopped');
        }
      }
      
      setIsUserMicOn(false);
      addTranscriptionItem('AI', 'Stopped microphone capture.', 'ai');
    }
  }, [isUserMicOn, addTranscriptionItem]);

  // Stop all capture
  const stopAllCapture = useCallback(() => {
    if (userMicStreamRef.current) {
      userMicStreamRef.current.getTracks().forEach(track => track.stop());
      userMicStreamRef.current = null;
    }
    
    if (userRecognitionRef.current) {
      try {
        userRecognitionRef.current.stop();
      } catch (e) {
        console.log('User recognition already stopped');
      }
    }
    
    if (systemRecognitionRef.current) {
      try {
        systemRecognitionRef.current.stop();
      } catch (e) {
        console.log('System recognition already stopped');
      }
    }
    
    setIsUserMicOn(false);
    setIsSystemAudioOn(false);
  }, []);

  const clearQuestionAnswer = useCallback(() => {
    setCurrentQuestion(null);
    setCurrentAnswer(null);
  }, []);

  return (
    <div className="extension-window" role="main">

      {/* Left Sidebar */}
      <div className="left-sidebar" role="navigation" aria-label="Tool controls">
        <div className="sidebar-top">
          <div className="control-pill">
            <button className="pill-btn" aria-label="Screenshot">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4zm10-1.5H4A1.5 1.5 0 0 0 2.5 4v8A1.5 1.5 0 0 0 4 13.5h8a1.5 1.5 0 0 0 1.5-1.5V4A1.5 1.5 0 0 0 12 2.5z"/>
                <path d="M8 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0-1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
              </svg>
            </button>
            <button className="pill-btn" aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
          </div>
          
          <div className="logo-badge">
            <span className="logo-n">N</span>
          </div>
        </div>

        <nav className="sidebar-nav" role="tablist">
          {/* Microphone Button */}
          <button 
            className={`nav-item ${isUserMicOn ? 'active' : ''}`} 
            role="tab" 
            aria-selected={isUserMicOn}
            onClick={toggleUserMic}
            title={isUserMicOn ? 'Stop Microphone' : 'Start Microphone'}
          >
            <div className="nav-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                <rect x="7" y="2" width="4" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M4 9v1a5 5 0 0 0 10 0V9M9 14v2M7 16h4" stroke="currentColor" strokeWidth="1.5"/>
                {isUserMicOn && <circle cx="15" cy="4" r="2" fill="#ff0000"/>}
              </svg>
            </div>
            <span className="nav-label">Mic</span>
          </button>

          {['Theme', 'Font', 'Bullet', 'Detail'].map((item, index) => (
            <button key={item} className="nav-item" role="tab" aria-selected="false">
              <div className={`nav-icon ${['Bullet', 'Detail'].includes(item) ? 'crown-badge' : ''}`}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                  <circle cx="9" cy="9" r="7"/>
                </svg>
                {['Bullet', 'Detail'].includes(item) && (
                  <div className="crown">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="#FFD700">
                      <path d="M6 1l1.5 3h3l-2.5 2 1 3-3-2-3 2 1-3-2.5-2h3L6 1z"/>
                    </svg>
                  </div>
                )}
              </div>
              <span className="nav-label">{item}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Canvas */}
      <div className="main-canvas">
        <div className="illustration-container">
          {currentQuestion && currentAnswer ? (
            <div className="qa-display">
              <div className="qa-question">
                <div className="qa-label">Question:</div>
                <div className="qa-text">{currentQuestion}</div>
              </div>
              <div className="qa-answer">
                <div className="qa-label">AI Answer:</div>
                <div className="qa-text">{currentAnswer}</div>
              </div>
              <button className="qa-close" onClick={clearQuestionAnswer}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </button>
            </div>
          ) : (
            <svg className="main-illustration" width="400" height="300" viewBox="0 0 400 300" fill="none">
              {/* Illustration SVG content */}
              <ellipse cx="200" cy="250" rx="60" ry="20" fill="#3a3a3a" opacity="0.3"/>
              <rect x="120" y="180" width="40" height="80" rx="8" fill="#666" opacity="0.6"/>
              <rect x="240" y="180" width="40" height="80" rx="8" fill="#666" opacity="0.6"/>
              <circle cx="200" cy="140" r="25" fill="#d4a574" opacity="0.7"/>
              <rect x="180" y="165" width="40" height="60" rx="15" fill="#87ceeb" opacity="0.7"/>
              <ellipse cx="100" cy="220" rx="25" ry="15" fill="#8b4513" opacity="0.6"/>
              <ellipse cx="300" cy="220" rx="20" ry="12" fill="#daa520" opacity="0.6"/>
            </svg>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        <div className="tabs-container" role="tablist">
          <button 
            className={`tab-btn ${activeTab === 'topics' ? 'active' : ''}`}
            role="tab" 
            aria-selected={activeTab === 'topics'}
            onClick={() => handleTabClick('topics')}
          >
            Topics
          </button>
          <button 
            className={`tab-btn ${activeTab === 'transcription' ? 'active' : ''}`}
            role="tab" 
            aria-selected={activeTab === 'transcription'}
            onClick={() => handleTabClick('transcription')}
          >
            Transcription
          </button>
        </div>

        {calloutVisible && (
          <div className="callout" role="alert">
            <button className="callout-close" aria-label="Close notification" onClick={closeCallout}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L6 5.293l.646-.647a.5.5 0 0 1 .708.708L6.707 6l.647.646a.5.5 0 0 1-.708.708L6 6.707l-.646.647a.5.5 0 0 1-.708-.708L5.293 6l-.647-.646a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
            <p>Click an interviewer's speaking to trigger on the corresponding topic directly.</p>
          </div>
        )}

        <div className="panel-content">
          {activeTab === 'topics' ? (
            <div className="topics-list">
              {topics.map((topic, index) => (
                <div key={index} className="topic-item">{topic}</div>
              ))}
            </div>
          ) : (
            <div className="transcription-list" ref={transcriptionListRef}>
              {transcriptionItems.map((item) => (
                <div key={item.id} className={`chat-message ${item.type}`}>
                  <div className="chat-bubble">
                    <div className="chat-header">
                      <span className={`speaker ${item.type}`}>{item.speaker}</span>
                      <span className="timestamp">{item.timestamp}</span>
                    </div>
                    <div className="chat-text">{item.text}</div>
                  </div>
                </div>
              ))}
              {transcriptionItems.length === 0 && (
                <div className="empty-transcription">
                  <p>System audio is active. Click Mic to add voice transcription.</p>
                  <p className="status-info">
                    System Audio: {isSystemAudioOn ? '🟢 Active' : '🔴 Inactive'} | 
                    Mic: {isUserMicOn ? '🟢 Active' : '🔴 Inactive'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="drag-handle" aria-label="Resize panel">
          <div className="drag-dots"></div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bottom-bar">
        <div className="input-section">
          <button 
            className={`camera-btn ${isUserMicOn ? 'active' : ''}`} 
            aria-label="Toggle microphone"
            onClick={toggleUserMic}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="6" y="1" width="4" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M3 8v1a5 5 0 0 0 10 0V8M8 13v2M6 15h4" stroke="currentColor" strokeWidth="1.5"/>
              {isUserMicOn && <circle cx="13" cy="3" r="2" fill="#ff0000"/>}
            </svg>
          </button>
          <input 
            type="text" 
            className="prompt-input" 
            placeholder={
              isSystemAudioOn || isUserMicOn 
                ? "STT is active. Type additional prompts here..." 
                : "System audio ready. Click Mic to add voice input..."
            }
            aria-label="AI prompt input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        
        <button className="help-button" onClick={triggerHelp}>
          <span className="help-text">Help Me ({helpCount})</span>
          <span className="help-hint">(Enter or Space)</span>
        </button>
        
        <div className="bottom-right">
          <div className="status-indicators">
            {isSystemAudioOn && (
              <span className="status-badge system">
                � System
              </span>
            )}
            {isUserMicOn && (
              <span className="status-badge mic">
                🎤 Mic
              </span>
            )}
          </div>
          <label className="checkbox-label">
            <input type="checkbox" className="hide-conversation" />
            <span>Hide my conversation</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ExtensionWindow;
