// inject-overlay.js - Script to inject the floating AI helper overlay into the page
// Version 2.1 - Updated STT and Dragging

(function() {
  console.log('🚀 Buzzer AI Overlay v2.1 Loading...');
  
  // Remove existing overlay if present (force refresh)
  const existing = document.getElementById('buzzer-ai-overlay');
  if (existing) {
    existing.remove();
    console.log('♻️ Removed existing overlay, loading fresh version...');
  }

  // Create the overlay container
  const overlay = document.createElement('div');
  overlay.id = 'buzzer-ai-overlay';
  overlay.innerHTML = `
    <div class="overlay-backdrop"></div>
    <div class="extension-window" role="main">
      <!-- Left Sidebar -->
      <div class="left-sidebar" role="navigation" aria-label="Tool controls">
        <!-- Top logo and pill controls -->
        <div class="sidebar-top">
          <div class="control-pill">
            <button class="pill-btn minimize-btn" aria-label="Minimize">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/>
              </svg>
            </button>
            <button class="pill-btn" aria-label="Screenshot">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4zm10-1.5H4A1.5 1.5 0 0 0 2.5 4v8A1.5 1.5 0 0 0 4 13.5h8a1.5 1.5 0 0 0 1.5-1.5V4A1.5 1.5 0 0 0 12 2.5z"/>
                <path d="M8 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0-1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
              </svg>
            </button>
            <button class="pill-btn overlay-close" aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
          </div>
          
          <div class="logo-badge" style="background: linear-gradient(135deg, #00ff88, #00cc66) !important;">
            <span class="logo-n" style="color: #000 !important; font-weight: bold;">N</span>
            <div style="position: absolute; top: -8px; right: -8px; background: #ff4444; color: white; border-radius: 50%; width: 16px; height: 16px; font-size: 10px; display: flex; align-items: center; justify-content: center; font-weight: bold;">2</div>
          </div>
        </div>

        <!-- Navigation controls -->
        <nav class="sidebar-nav" role="tablist">
          <!-- Microphone Button -->
          <button class="nav-item mic-btn" role="tab" aria-selected="false">
            <div class="nav-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                <rect x="7" y="2" width="4" height="8" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
                <path d="M4 9v1a5 5 0 0 0 10 0V9M9 14v2M7 16h4" stroke="currentColor" stroke-width="1.5"/>
              </svg>
            </div>
            <span class="nav-label">Mic</span>
          </button>

          <button class="nav-item" role="tab" aria-selected="false">
            <div class="nav-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5" fill="none"/>
                <path d="M9 3v12a6 6 0 0 0 0-12z" fill="currentColor"/>
              </svg>
            </div>
            <span class="nav-label">Theme</span>
          </button>

          <button class="nav-item" role="tab" aria-selected="false">
            <div class="nav-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                <path d="M4 4h10v2H4V4zm0 4h10v1H4V8zm0 3h7v1H4v-1z" fill="currentColor"/>
              </svg>
            </div>
            <span class="nav-label">Font</span>
          </button>

          <button class="nav-item" role="tab" aria-selected="false">
            <div class="nav-icon crown-badge">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                <circle cx="5" cy="6" r="1.5" fill="currentColor"/>
                <circle cx="5" cy="9" r="1.5" fill="currentColor"/>
                <circle cx="5" cy="12" r="1.5" fill="currentColor"/>
                <rect x="8" y="5" width="7" height="2" fill="currentColor"/>
                <rect x="8" y="8" width="7" height="2" fill="currentColor"/>
                <rect x="8" y="11" width="7" height="2" fill="currentColor"/>
              </svg>
              <div class="crown">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="#FFD700">
                  <path d="M6 1l1.5 3h3l-2.5 2 1 3-3-2-3 2 1-3-2.5-2h3L6 1z"/>
                </svg>
              </div>
            </div>
            <span class="nav-label">Bullet</span>
          </button>

          <button class="nav-item" role="tab" aria-selected="false">
            <div class="nav-icon crown-badge">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                <rect x="3" y="4" width="12" height="1" fill="currentColor"/>
                <rect x="3" y="7" width="12" height="1" fill="currentColor"/>
                <rect x="3" y="10" width="8" height="1" fill="currentColor"/>
                <rect x="3" y="13" width="10" height="1" fill="currentColor"/>
              </svg>
              <div class="crown">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="#FFD700">
                  <path d="M6 1l1.5 3h3l-2.5 2 1 3-3-2-3 2 1-3-2.5-2h3L6 1z"/>
                </svg>
              </div>
            </div>
            <span class="nav-label">Detail</span>
          </button>

          <button class="nav-item" role="tab" aria-selected="false">
            <div class="nav-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                <path d="M9 2a7 7 0 1 1 0 14A7 7 0 0 1 9 2zm0 1a6 6 0 1 0 0 12A6 6 0 0 0 9 3z" stroke="currentColor" stroke-width="1" fill="none"/>
                <path d="M6 7h6v4H6V7z" fill="currentColor"/>
                <path d="M7 8h4v2H7V8z" fill="#ffffff"/>
              </svg>
            </div>
            <span class="nav-label">Translate</span>
          </button>

          <button class="nav-item" role="tab" aria-selected="false">
            <div class="nav-icon crown-badge">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5" fill="none"/>
                <path d="M9 6v6l4-3-4-3z" fill="currentColor"/>
              </svg>
              <div class="crown">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="#FFD700">
                  <path d="M6 1l1.5 3h3l-2.5 2 1 3-3-2-3 2 1-3-2.5-2h3L6 1z"/>
                </svg>
              </div>
            </div>
            <span class="nav-label">Auto</span>
          </button>
        </nav>
      </div>

      <!-- Main Canvas -->
      <div class="main-canvas">
        <div class="illustration-container">
          <svg class="main-illustration" width="400" height="300" viewBox="0 0 400 300" fill="none">
            <!-- Ground shadow -->
            <ellipse cx="200" cy="250" rx="60" ry="20" fill="#3a3a3a" opacity="0.3"/>
            
            <!-- Left chair -->
            <rect x="120" y="180" width="40" height="80" rx="8" fill="#666" opacity="0.6"/>
            <rect x="115" y="175" width="50" height="12" rx="6" fill="#777" opacity="0.6"/>
            
            <!-- Right chair -->
            <rect x="240" y="180" width="40" height="80" rx="8" fill="#666" opacity="0.6"/>
            <rect x="235" y="175" width="50" height="12" rx="6" fill="#777" opacity="0.6"/>
            
            <!-- Person -->
            <circle cx="200" cy="140" r="25" fill="#d4a574" opacity="0.7"/>
            <rect x="180" y="165" width="40" height="60" rx="15" fill="#87ceeb" opacity="0.7"/>
            <rect x="175" y="155" width="50" height="25" rx="10" fill="#f5deb3" opacity="0.7"/>
            
            <!-- Dog (left) -->
            <ellipse cx="100" cy="220" rx="25" ry="15" fill="#8b4513" opacity="0.6"/>
            <circle cx="85" cy="210" r="12" fill="#8b4513" opacity="0.6"/>
            <ellipse cx="82" cy="207" rx="3" ry="8" fill="#654321" opacity="0.6"/>
            <ellipse cx="88" cy="207" rx="3" ry="8" fill="#654321" opacity="0.6"/>
            
            <!-- Cat (right) -->
            <ellipse cx="300" cy="220" rx="20" ry="12" fill="#daa520" opacity="0.6"/>
            <circle cx="315" cy="210" r="10" fill="#daa520" opacity="0.6"/>
            <polygon points="310,200 315,195 320,200" fill="#daa520" opacity="0.6"/>
            <polygon points="310,200 315,195 320,200" fill="#daa520" opacity="0.6"/>
          </svg>
        </div>
      </div>

      <!-- Right Panel -->
      <div class="right-panel">
        <!-- Tabs -->
        <div class="tabs-container" role="tablist">
          <button class="tab-btn" role="tab" aria-selected="false">Topics</button>
          <button class="tab-btn active" role="tab" aria-selected="true">Transcription</button>
        </div>

        <!-- Brown Callout -->
        <div class="callout" role="alert">
          <button class="callout-close" aria-label="Close notification">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L6 5.293l.646-.647a.5.5 0 0 1 .708.708L6.707 6l.647.646a.5.5 0 0 1-.708.708L6 6.707l-.646.647a.5.5 0 0 1-.708-.708L5.293 6l-.647-.646a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
          <p>Click an interviewer's speaking to trigger on the corresponding topic directly.</p>
        </div>

        <!-- Content Area -->
        <div class="panel-content">
          <div class="transcription-list">
            <!-- Transcription items will be added dynamically -->
          </div>
        </div>

        <!-- Drag Handle -->
        <div class="drag-handle" aria-label="Resize panel">
          <div class="drag-dots"></div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="bottom-bar">
        <div class="input-section">
          <button class="camera-btn" aria-label="Toggle microphone">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="6" y="1" width="4" height="8" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
              <path d="M3 8v1a5 5 0 0 0 10 0V8M8 13v2M6 15h4" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </button>
          <input 
            type="text" 
            class="prompt-input" 
            placeholder="Start screen sharing or mic first, then type prompts here..."
            aria-label="AI prompt input"
          >
        </div>
        
        <button class="help-button">
          <span class="help-text">Help Me (3)</span>
          <span class="help-hint">(Enter or Space)</span>
        </button>
        
        <div class="bottom-right">
          <label class="checkbox-label">
            <input type="checkbox" class="hide-conversation">
            <span>Hide my conversation</span>
          </label>
        </div>
      </div>
    </div>
  `;

  // Add styles for the overlay
  const style = document.createElement('style');
  style.textContent = `
    #buzzer-ai-overlay {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 999999 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      pointer-events: none !important;
    }

    #buzzer-ai-overlay .overlay-backdrop {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: rgba(0, 0, 0, 0.1) !important;
      backdrop-filter: blur(1px) !important;
      z-index: 1 !important;
      pointer-events: none !important;
    }

    #buzzer-ai-overlay .extension-window {
      position: relative !important;
      z-index: 2 !important;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      animation: slideIn 0.3s ease-out !important;
      pointer-events: auto !important;
      cursor: grab !important;
      user-select: none !important;
      min-width: 300px !important;
      min-height: 200px !important;
      resize: both !important;
      overflow: hidden !important;
    }
    
    #buzzer-ai-overlay .extension-window:active {
      cursor: grabbing !important;
    }
    
    #buzzer-ai-overlay .extension-window.resizing {
      cursor: nw-resize !important;
    }    #buzzer-ai-overlay .extension-window:active {
      cursor: grabbing !important;
    }
    
    #buzzer-ai-overlay .extension-window.dragging {
      transition: none !important;
    }
    
    #buzzer-ai-overlay .extension-window * {
      pointer-events: auto !important;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    
    /* Minimized state */
    #buzzer-ai-overlay.minimized .extension-window {
      width: 60px !important;
      height: 60px !important;
      border-radius: 50% !important;
      overflow: hidden !important;
      cursor: pointer !important;
      transition: all 0.3s ease !important;
    }
    
    #buzzer-ai-overlay.minimized .extension-window > *:not(.logo-badge) {
      display: none !important;
    }
    
    #buzzer-ai-overlay.minimized .logo-badge {
      position: absolute !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      width: 40px !important;
      height: 40px !important;
      margin: 0 !important;
    }
    
    #buzzer-minimized-logo {
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      width: 60px !important;
      height: 60px !important;
      border-radius: 50% !important;
      background: linear-gradient(135deg, #00ff88, #00cc66) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      z-index: 999999 !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
      font-size: 24px !important;
      font-weight: bold !important;
      color: #000 !important;
      user-select: none !important;
      transition: all 0.3s ease !important;
    }
    
    #buzzer-minimized-logo:hover {
      transform: scale(1.1) !important;
      box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4) !important;
    }

    /* Override any page styles that might interfere */
    #buzzer-ai-overlay * {
      box-sizing: border-box !important;
    }

    /* Make sure close button works */
    #buzzer-ai-overlay .overlay-close {
      cursor: pointer !important;
    }

    /* Dynamic content styles for the overlay */
    #buzzer-ai-overlay .transcription-item {
      padding: 12px 0 !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
    }
    
    #buzzer-ai-overlay .transcription-header {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      margin-bottom: 6px !important;
    }
    
    #buzzer-ai-overlay .speaker {
      font-weight: 600 !important;
      font-size: 13px !important;
    }
    
    #buzzer-ai-overlay .speaker.user {
      color: #3b82f6 !important;
    }
    
    #buzzer-ai-overlay .speaker.ai {
      color: #FF6A2B !important;
    }
    
    #buzzer-ai-overlay .speaker.interviewer {
      color: #10b981 !important;
    }
    
    #buzzer-ai-overlay .timestamp {
      font-size: 11px !important;
      color: #bdbdbd !important;
    }
    
            #buzzer-ai-overlay .chat-text {\n      font-size: 16px !important;\n      line-height: 1.4 !important;\n      color: inherit !important;\n      font-weight: 400 !important;\n      margin: 0 !important;\n    }\n    \n    #buzzer-ai-overlay .transcription-list {\n      padding: 16px 0 !important;\n      overflow-y: auto !important;\n      max-height: calc(100vh - 200px) !important;\n    }\n    \n    #buzzer-ai-overlay .transcription-list::after {\n      content: '' !important;\n      display: block !important;\n      clear: both !important;\n    }"
    
    #buzzer-ai-overlay .topic-item {
      padding: 12px 16px !important;
      margin-bottom: 8px !important;
      background: rgba(255, 255, 255, 0.05) !important;
      border-radius: 8px !important;
      cursor: pointer !important;
      transition: background 0.2s !important;
      font-size: 14px !important;
    }
    
    #buzzer-ai-overlay .topic-item:hover {
      background: rgba(255, 106, 43, 0.1) !important;
      color: #FF6A2B !important;
    }
    
    #buzzer-ai-overlay .topics-list {
      padding: 16px 0 !important;
    }
    
    /* Draggable window positioning */
    #buzzer-ai-overlay {
      align-items: flex-start !important;
      justify-content: flex-end !important;
      padding: 20px !important;
    }
    
    #buzzer-ai-overlay .extension-window {
      position: fixed !important;
      margin: 0 !important;
      transform: none !important;
      /* Initial position set by JavaScript */
    }
    
    #buzzer-ai-overlay .extension-window.dragging {
      transition: none !important;
      opacity: 0.9 !important;
    }
    
    /* Removed specific drag cursors since whole window is draggable */
    
    /* Responsive positioning for overlay */
    @media (max-width: 1400px) {
      #buzzer-ai-overlay .extension-window {
        width: 90vw !important;
        max-width: 1000px !important;
        height: auto !important;
        max-height: 80vh !important;
        top: 20px !important;
        right: 20px !important;
      }
    }
    
    @media (max-width: 1024px) {
      #buzzer-ai-overlay .extension-window {
        width: 95vw !important;
        height: 70vh !important;
        top: 10px !important;
        right: 10px !important;
        left: 10px !important;
      }
    }

    @media (max-height: 600px) {
      #buzzer-ai-overlay .extension-window {
        height: 85vh !important;
        max-height: none !important;
        top: 10px !important;
      }
    }
    
    @media (max-width: 768px) {
      #buzzer-ai-overlay .extension-window {
        width: 100vw !important;
        height: 100vh !important;
        top: 0 !important;
        right: 0 !important;
        left: 0 !important;
        border-radius: 0 !important;
        cursor: default !important;
      }
      
      #buzzer-ai-overlay .chat-text {
        font-size: 18px !important;
        line-height: 1.6 !important;
      }
      
      #buzzer-ai-overlay .chat-bubble {
        padding: 14px 18px !important;
        font-size: 16px !important;
      }
      
      #buzzer-ai-overlay .chat-message {
        max-width: 85% !important;
      }
    }
    
    /* WhatsApp-style chat bubbles starting from top */
    #buzzer-ai-overlay .chat-message {
      display: flex !important;
      margin: 8px 0 !important;
      padding: 0 16px !important;
      width: 100% !important;
      clear: both !important;
      flex-shrink: 0 !important;
      box-sizing: border-box !important;
    }
    
    #buzzer-ai-overlay .interim-message {
      display: flex !important;
      margin: 8px 16px !important;
      max-width: calc(100% - 32px) !important;
      opacity: 0.7 !important;
      animation: pulse 1.5s infinite !important;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 0.9; }
    }
    
    /* WhatsApp-style Chat Layout */
    #buzzer-ai-overlay .chat-message {
      margin-bottom: 8px !important;
      display: flex !important;
      clear: both !important;
    }
    
    /* System Audio (Interviewer) - Left side like received messages */
    #buzzer-ai-overlay .chat-message.interviewer {
      justify-content: flex-start !important;
      margin-right: 60px !important;
    }
    
    /* Mic Audio (You) - Right side like sent messages */
    #buzzer-ai-overlay .chat-message.user {
      justify-content: flex-end !important;
      margin-left: 60px !important;
    }
    
    /* AI messages - Center */
    #buzzer-ai-overlay .chat-message.ai {
      justify-content: center !important;
      margin: 16px 20px !important;
    }
    
    #buzzer-ai-overlay .chat-bubble {
      max-width: 75% !important;
      padding: 12px 16px !important;
      border-radius: 18px !important;
      position: relative !important;
      word-wrap: break-word !important;
      font-size: 15px !important;
      line-height: 1.4 !important;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
    }
    
    /* User bubble - Blue like WhatsApp sent messages (right side) */
    #buzzer-ai-overlay .chat-message.user .chat-bubble {
      background: #007AFF !important;
      color: white !important;
      border-bottom-right-radius: 4px !important;
    }

    /* Interviewer bubble - Gray like WhatsApp received messages (left side) */
    #buzzer-ai-overlay .chat-message.interviewer .chat-bubble {
      background: #E5E5EA !important;
      color: #000000 !important;
      border-bottom-left-radius: 4px !important;
    }

    /* AI messages */
    #buzzer-ai-overlay .chat-message.ai .chat-bubble {
      background: linear-gradient(135deg, #FF6B35, #F7931E) !important;
      color: white !important;
      text-align: center !important;
      border-radius: 18px !important;
      font-weight: 600 !important;
    }
    
    /* Sender labels */
    #buzzer-ai-overlay .chat-sender {
      font-size: 12px !important;
      font-weight: 600 !important;
      margin-bottom: 4px !important;
      opacity: 0.8 !important;
    }
    
    #buzzer-ai-overlay .chat-message.interviewer .chat-sender {
      color: #666 !important;
    }
    
    #buzzer-ai-overlay .chat-message.user .chat-sender {
      color: rgba(255,255,255,0.9) !important;
    }
    
    #buzzer-ai-overlay .timestamp {
      font-size: 11px !important;
      opacity: 0.7 !important;
      margin-top: 4px !important;
      text-align: right !important;
    }
    
    #buzzer-ai-overlay .chat-message.interviewer .timestamp {
      text-align: left !important;
    }

    /* Q&A Display Styles */
    #buzzer-ai-overlay .qa-display {
      padding: 20px !important;
      background: rgba(55, 55, 55, 0.95) !important;
      border-radius: 12px !important;
      margin: 20px !important;
      position: relative !important;
      backdrop-filter: blur(10px) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      max-height: 400px !important;
      overflow-y: auto !important;
    }
    
    #buzzer-ai-overlay .qa-question, 
    #buzzer-ai-overlay .qa-answer {
      margin-bottom: 16px !important;
    }
    
    #buzzer-ai-overlay .qa-answer {
      margin-bottom: 0 !important;
    }
    
    #buzzer-ai-overlay .qa-label {
      font-weight: 600 !important;
      font-size: 14px !important;
      color: #FF6A2B !important;
      margin-bottom: 8px !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
    }
    
    #buzzer-ai-overlay .qa-text {
      font-size: 15px !important;
      line-height: 1.5 !important;
      color: #e5e5e5 !important;
      background: rgba(0, 0, 0, 0.3) !important;
      padding: 12px 16px !important;
      border-radius: 8px !important;
      border-left: 3px solid #FF6A2B !important;
    }
    
    #buzzer-ai-overlay .qa-close {
      position: absolute !important;
      top: 12px !important;
      right: 12px !important;
      background: rgba(255, 255, 255, 0.1) !important;
      border: none !important;
      border-radius: 50% !important;
      width: 32px !important;
      height: 32px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      color: #bdbdbd !important;
      transition: all 0.2s !important;
    }
    
    #buzzer-ai-overlay .qa-close:hover {
      background: rgba(255, 0, 0, 0.2) !important;
      color: #ff4444 !important;
      transform: scale(1.1) !important;
    }
    
    #buzzer-ai-overlay .qa-question .qa-text {
      border-left-color: #3b82f6 !important;
    }
    
    /* Audio activity indicator */
    #buzzer-ai-overlay .audio-indicator {
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      background: #10b981 !important;
      color: white !important;
      padding: 12px 16px !important;
      border-radius: 8px !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
      z-index: 1000000 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-size: 14px !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
    }
    
    #buzzer-ai-overlay .audio-indicator.recording::before {
      content: "●" !important;
      color: #ef4444 !important;
      animation: blink 1s infinite !important;
    }
    
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    /* Live caption styles */
    #buzzer-live-caption {
      position: fixed !important;
      bottom: 20px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      background: rgba(0, 0, 0, 0.8) !important;
      color: white !important;
      padding: 12px 20px !important;
      border-radius: 24px !important;
      font-size: 16px !important;
      z-index: 1000000 !important;
      max-width: 80% !important;
      text-align: center !important;
      backdrop-filter: blur(4px) !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
    }
  `;

  // Append to head to ensure proper CSS loading
  document.head.appendChild(style);
  document.body.appendChild(overlay);

  // Initialize the overlay functionality
  class OverlayExtensionWindow {
    constructor() {
      console.log('🎯 NEW VERSION: OverlayExtensionWindow v2.1 Initializing...');
      this.activeTab = 'transcription';
      this.helpCount = 3;
      this.calloutVisible = true;
      this.overlay = overlay;
      this.isScreenSharing = window.buzzerScreenShareActive || false;
      this.isUserMicOn = false;
      this.isSystemAudioCapturing = false;
      this.transcriptionItems = [];
      this.screenStream = null;
      this.userMicStream = null;
      this.systemRecognition = null;
      this.userRecognition = null;
      this.currentQuestion = null;
      this.currentAnswer = null;
      this.audioActivityTimeout = null;
      this.liveCaptionElement = null;
      this.lastCaptionText = '';
      this.captionCheckInterval = null;
      this.captionTimeout = null;
      this.debounceTimer = null;
      
      // Question detection regex patterns
      this.questionPatterns = [
        /\b(?:what|how|why|when|where|who|which|can you|could you|would you|do you|did you|will you|is|are|am)\b.*\?/i,
        /\b(?:explain|describe|tell me|show me|help me|teach me)\b.*/i,
        /\b(?:what is|how to|why does|when did|where can|who is|which one)\b.*/i,
        /\b(?:javascript|html|css|nodejs|node\.?js|react|angular|vue|python|java|c\+\+|programming|coding|development)\b.*[\?]*$/i
      ];

      // Gemini API configuration
      this.geminiApiKey = 'AIzaSyALmZY3vJq-4PFIUaHl4ZZsYGXdMkI7fCM'; // Replace with your actual API key
      this.geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
      
      // Add version indicator to overlay
      this.addVersionIndicator();
      this.init();
    }

    addVersionIndicator() {
      // Add a small version badge to show new version is active
      const badge = document.createElement('div');
      badge.style.cssText = `
        position: fixed !important;
        top: 10px !important;
        left: 10px !important;
        background: #00ff00 !important;
        color: #000 !important;
        padding: 4px 8px !important;
        border-radius: 4px !important;
        font-size: 12px !important;
        font-weight: bold !important;
        z-index: 1000000 !important;
        font-family: monospace !important;
      `;
      badge.textContent = 'v2.1 ACTIVE';
      badge.id = 'buzzer-version-badge';
      document.body.appendChild(badge);
      
      // Remove after 3 seconds
      setTimeout(() => {
        const existingBadge = document.getElementById('buzzer-version-badge');
        if (existingBadge) existingBadge.remove();
      }, 3000);
    }

    init() {
      console.log('🔄 Initializing with improved STT and dragging...');
      console.log('🔍 Screen sharing status:', this.isScreenSharing);
      console.log('🔍 buzzerScreenShareActive:', window.buzzerScreenShareActive);
      
      this.setupEventListeners();
      this.updateUI();
      
      // Start system audio capture automatically with delay to prevent duplicates
      console.log('🎤 Starting system audio transcription...');
      setTimeout(() => {
        this.initializeScreenSharing();
      }, 1000);
      
      // Show ready message
      setTimeout(() => {
        console.log('✅ AI Helper v2.1 ready with system STT active!');
      }, 500);
      
      // Listen for audio chunks from background script
      this.setupAudioDataListener();
      
      // Set up live caption observer with debouncing
      this.setupLiveCaptionObserver();
    }

    setupEventListeners() {
      // Close overlay only via close button, not backdrop
      const closeBtn = this.overlay.querySelector('.overlay-close');
      const minimizeBtn = this.overlay.querySelector('.minimize-btn');
      
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.closeOverlay());
      }
      
      if (minimizeBtn) {
        console.log('🔧 Setting up minimize button listener...');
        minimizeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🔽 Minimize button clicked!');
          this.minimizeOverlay();
        });
        console.log('✅ Minimize button listener ready');
      }
      
      // Remove backdrop click to close - we want background to be clickable

      // Tab switching
      const tabButtons = this.overlay.querySelectorAll('.tab-btn');
      tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const isTranscription = e.target.textContent.trim() === 'Transcription';
          this.setActiveTab(isTranscription ? 'transcription' : 'topics');
        });
      });

      // Callout close
      const calloutClose = this.overlay.querySelector('.callout-close');
      if (calloutClose) {
        calloutClose.addEventListener('click', () => {
          this.closeCallout();
        });
      }

      // Help button
      const helpBtn = this.overlay.querySelector('.help-button');
      if (helpBtn) {
        helpBtn.addEventListener('click', () => {
          this.triggerHelp();
        });
      }

      // Input handling
      const input = this.overlay.querySelector('.prompt-input');
      if (input) {
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.triggerHelp();
          }
        });
      }

      // Navigation items with special handling for mic
      const navItems = this.overlay.querySelectorAll('.nav-item');
      navItems.forEach((item, index) => {
        item.addEventListener('click', () => {
          const label = item.querySelector('.nav-label').textContent;
          
          if (label === 'Mic') {
            this.toggleUserMic();
          } else {
            // Regular nav item
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
          }
        });
      });

      // Camera button (microphone)
      const cameraBtn = this.overlay.querySelector('.camera-btn');
      if (cameraBtn) {
        cameraBtn.addEventListener('click', () => {
          this.toggleUserMic();
        });
      }

      // Prevent clicks inside the window from closing the overlay and add drag functionality
      const extensionWindow = this.overlay.querySelector('.extension-window');
      if (extensionWindow) {
        // Set initial position explicitly
        extensionWindow.style.position = 'fixed';
        extensionWindow.style.top = '50px';
        extensionWindow.style.right = '50px';
        extensionWindow.style.left = 'auto';
        extensionWindow.style.bottom = 'auto';
        
        console.log('🎯 Initial position set for dragging');
        
        extensionWindow.addEventListener('click', (e) => {
          e.stopPropagation();
        });
        
        // Add drag functionality
        this.makeDraggable(extensionWindow);
      }
    }

    closeOverlay() {
      this.overlay.style.opacity = '0';
      this.overlay.style.transform = 'scale(0.9)';
      
      // Clear any intervals to prevent memory leaks
      if (this.captionCheckInterval) {
        clearInterval(this.captionCheckInterval);
        this.captionCheckInterval = null;
      }
      
      // Clear debounce timer
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
      }
      
      setTimeout(() => {
        if (this.overlay && this.overlay.parentNode) {
          this.overlay.parentNode.removeChild(this.overlay);
        }
      }, 200);
    }

    minimizeOverlay() {
      console.log('🔽 Minimizing overlay...');
      const extensionWindow = this.overlay.querySelector('.extension-window');
      
      // Hide the full overlay
      this.overlay.style.display = 'none';
      
      // Create minimized logo
      const minimizedLogo = document.createElement('div');
      minimizedLogo.id = 'buzzer-minimized-logo';
      minimizedLogo.innerHTML = 'N';
      minimizedLogo.title = 'Click to restore AI Helper';
      
      // Add click handler to restore
      minimizedLogo.addEventListener('click', () => this.restoreOverlay());
      
      document.body.appendChild(minimizedLogo);
      console.log('✅ Overlay minimized');
    }

    restoreOverlay() {
      console.log('🔼 Restoring overlay...');
      
      // Remove minimized logo
      const minimizedLogo = document.getElementById('buzzer-minimized-logo');
      if (minimizedLogo) {
        minimizedLogo.remove();
      }
      
      // Show the full overlay
      this.overlay.style.display = 'flex';
      
      console.log('✅ Overlay restored');
    }

    setActiveTab(tab) {
      this.activeTab = tab;
      
      const tabButtons = this.overlay.querySelectorAll('.tab-btn');
      tabButtons.forEach(btn => {
        const isActive = (tab === 'transcription' && btn.textContent.trim() === 'Transcription') ||
                        (tab === 'topics' && btn.textContent.trim() === 'Topics');
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive);
      });

      this.updateContent();
    }

    closeCallout() {
      const callout = this.overlay.querySelector('.callout');
      if (callout) {
        callout.style.opacity = '0';
        callout.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          callout.style.display = 'none';
        }, 200);
      }
      this.calloutVisible = false;
    }

    // Detect if text contains a question
    isQuestion(text) {
      return this.questionPatterns.some(pattern => pattern.test(text.trim()));
    }

    // Process detected question with Gemini AI
    async processQuestion(question) {
      try {
        console.log('Processing question with Gemini:', question);
        
        const response = await fetch(`${this.geminiApiUrl}?key=${this.geminiApiKey}`, {
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
          this.displayQuestionAnswer(question, answer);
          return answer;
        } else {
          throw new Error('No answer received from API');
        }
      } catch (error) {
        console.error('Error processing question:', error);
        const fallbackAnswer = this.getFallbackAnswer(question);
        this.displayQuestionAnswer(question, fallbackAnswer);
        return fallbackAnswer;
      }
    }

    // Fallback answers for when API fails
    getFallbackAnswer(question) {
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
    }

    // Display Q&A in the main canvas
    displayQuestionAnswer(question, answer) {
      this.currentQuestion = question;
      this.currentAnswer = answer;
      this.updateMainCanvas();
    }

    triggerHelp() {
      const input = this.overlay.querySelector('.prompt-input');
      const query = input ? input.value.trim() : '';
      
      if (query) {
        console.log('Help triggered with query:', query);
        this.addTranscriptionItem('You', query, 'user');
        
        // Check if it's a question and process with AI
        if (this.isQuestion(query)) {
          this.processQuestion(query);
        } else {
          setTimeout(() => {
            this.addTranscriptionItem('AI', 'I can help you with that. Let me analyze the current conversation context...', 'ai');
          }, 1000);
        }
        
        input.value = '';
      } else {
        this.addTranscriptionItem('AI', 'I\'m ready to help! You can ask me questions about the interview or request specific assistance.', 'ai');
      }

      if (this.helpCount > 0) {
        this.helpCount--;
        this.updateHelpButton();
      }
    }

    addTranscriptionItem(speaker, text, type) {
      const list = this.overlay.querySelector('.transcription-list');
      if (!list) return;

      // Create chat message with WhatsApp-style bubble and sender label
      const chatMessage = document.createElement('div');
      chatMessage.className = `chat-message ${type}`;
      
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Add sender label for better WhatsApp feel
      chatMessage.innerHTML = `
        <div class="chat-bubble">
          <div class="chat-sender">${speaker}</div>
          <div class="chat-text">${text}</div>
          <div class="timestamp">${timestamp}</div>
        </div>
      `;

      // Append to bottom like WhatsApp (newest messages at bottom)
      list.appendChild(chatMessage);
      
      // Auto-detect questions from transcription and process with AI
      if (type === 'user' || type === 'interviewer') {
        if (this.isQuestion(text)) {
          console.log('Question detected in transcription:', text);
          setTimeout(() => {
            this.processQuestion(text);
          }, 500); // Small delay to allow transcription to complete
        }
      }
      
      // Auto-scroll to show newest message
      list.scrollTop = list.scrollHeight;

      // Store in transcription items array (add to beginning for newest-first order)
      this.transcriptionItems.unshift({
        id: Date.now() + Math.random(),
        speaker,
        text,
        type,
        timestamp
      });
    }

    showInterimResult(speaker, text, type) {
      console.log('⚡ Showing interim result:', text);
      const list = this.overlay.querySelector('.transcription-list');
      if (!list) return;

      // Remove existing interim result
      this.hideInterimResult();

      // Create interim message with WhatsApp styling
      const interimMessage = document.createElement('div');
      interimMessage.className = `chat-message ${type} interim-message`;
      interimMessage.id = 'interim-result';
      
      interimMessage.innerHTML = `
        <div class="chat-bubble" style="opacity: 0.7; background: rgba(229,229,234,0.7) !important;">
          <div class="chat-sender" style="opacity: 0.6;">${speaker}</div>
          <div class="chat-text">${text}...</div>
        </div>
      `;

      // Add at bottom like regular messages
      list.appendChild(interimMessage);
      list.scrollTop = list.scrollHeight;
    }

    hideInterimResult() {
      const interimResult = this.overlay.querySelector('#interim-result');
      if (interimResult) {
        interimResult.remove();
      }
    }

    updateHelpButton() {
      const helpBtn = this.overlay.querySelector('.help-button');
      const helpText = helpBtn?.querySelector('.help-text');
      if (helpText) {
        helpText.textContent = `Help Me (${this.helpCount})`;
      }
    }

    updateMainCanvas() {
      const canvas = this.overlay.querySelector('.main-canvas .illustration-container');
      if (!canvas) return;

      if (this.currentQuestion && this.currentAnswer) {
        canvas.innerHTML = `
          <div class="qa-display">
            <div class="qa-question">
              <div class="qa-label">Question:</div>
              <div class="qa-text">${this.currentQuestion}</div>
            </div>
            <div class="qa-answer">
              <div class="qa-label">AI Answer:</div>
              <div class="qa-text">${this.currentAnswer}</div>
            </div>
            <button class="qa-close" onclick="window.buzzerOverlayInstance?.clearQuestionAnswer()">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
          </div>
        `;
      } else {
        // Reset to original illustration
        canvas.innerHTML = `
          <svg class="main-illustration" width="400" height="300" viewBox="0 0 400 300" fill="none">
            <ellipse cx="200" cy="250" rx="60" ry="20" fill="#3a3a3a" opacity="0.3"/>
            <rect x="120" y="180" width="40" height="80" rx="8" fill="#666" opacity="0.6"/>
            <rect x="115" y="175" width="50" height="12" rx="6" fill="#777" opacity="0.6"/>
            <rect x="240" y="180" width="40" height="80" rx="8" fill="#666" opacity="0.6"/>
            <rect x="235" y="175" width="50" height="12" rx="6" fill="#777" opacity="0.6"/>
            <circle cx="200" cy="140" r="25" fill="#d4a574" opacity="0.7"/>
            <rect x="180" y="165" width="40" height="60" rx="15" fill="#87ceeb" opacity="0.7"/>
            <rect x="175" y="155" width="50" height="25" rx="10" fill="#f5deb3" opacity="0.7"/>
            <ellipse cx="100" cy="220" rx="25" ry="15" fill="#8b4513" opacity="0.6"/>
            <circle cx="85" cy="210" r="12" fill="#8b4513" opacity="0.6"/>
            <ellipse cx="82" cy="207" rx="3" ry="8" fill="#654321" opacity="0.6"/>
            <ellipse cx="88" cy="207" rx="3" ry="8" fill="#654321" opacity="0.6"/>
            <ellipse cx="300" cy="220" rx="20" ry="12" fill="#daa520" opacity="0.6"/>
            <circle cx="315" cy="210" r="10" fill="#daa520" opacity="0.6"/>
            <polygon points="310,200 315,195 320,200" fill="#daa520" opacity="0.6"/>
            <polygon points="310,200 315,195 320,200" fill="#daa520" opacity="0.6"/>
          </svg>
        `;
      }
    }

    clearQuestionAnswer() {
      this.currentQuestion = null;
      this.currentAnswer = null;
      this.updateMainCanvas();
    }

    updateContent() {
      const contentArea = this.overlay.querySelector('.panel-content');
      if (!contentArea) return;

      if (this.activeTab === 'topics') {
        contentArea.innerHTML = `
          <div class="topics-list">
            <div class="topic-item">Technical Skills</div>
            <div class="topic-item">Project Experience</div>
            <div class="topic-item">Problem Solving</div>
            <div class="topic-item">Team Collaboration</div>
            <div class="topic-item">Leadership Examples</div>
          </div>
        `;
      } else {
        contentArea.innerHTML = `
          <div class="transcription-list">
          </div>
        `;
        
        // Re-add existing transcription items with WhatsApp styling
        const list = this.overlay.querySelector('.transcription-list');
        this.transcriptionItems.forEach(item => {
          const chatMessage = document.createElement('div');
          chatMessage.className = `chat-message ${item.type}`;
          chatMessage.innerHTML = `
            <div class="chat-bubble" data-sender="${item.speaker}">
              <div class="chat-sender">${item.speaker}</div>
              <div class="chat-text">${item.text}</div>
              <div class="timestamp">${item.timestamp}</div>
            </div>
          `;
          list.appendChild(chatMessage);
        });
        
        // Auto-scroll to bottom
        list.scrollTop = list.scrollHeight;
      }
    }

    initializeScreenSharing() {
      // Initialize system audio transcription (screen sharing already done in popup)
      console.log('🚀 Initializing system audio transcription...');
      
      this.isScreenSharing = true;
      
      // Just set up speech recognition, no screen sharing requests
      this.initSystemSTT();
      console.log('✅ System audio transcription ready');
    }

    stopSystemSTT() {
      console.log('🛑 Stopping system STT...');
      
      // Stop system audio capture
      if (this.isSystemAudioCapturing) {
        chrome.runtime.sendMessage({ action: 'stopCapture' }, (response) => {
          console.log('✅ System audio capture stopped');
        });
        this.isSystemAudioCapturing = false;
      }
      
      // Stop speech recognition
      if (this.systemRecognition) {
        try {
          this.systemRecognition.stop();
          console.log('✅ System audio transcription stopped');
        } catch (e) {
          console.log('System recognition already stopped');
        }
        this.systemRecognition = null;
      }
      
      // Clean up audio context
      if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = null;
      }
      
      this.isScreenSharing = false;
      console.log('✅ System audio transcription fully stopped');
    }

    stopScreenSharing() {
      this.stopSystemSTT();
      
      if (this.screenStream) {
        this.screenStream.getTracks().forEach(track => track.stop());
        this.screenStream = null;
      }
      
      if (this.systemRecognition) {
        try {
          this.systemRecognition.stop();
        } catch (e) {
          console.log('System recognition already stopped');
        }
      }
      
      this.isScreenSharing = false;
      this.addTranscriptionItem('AI', 'Screen sharing ended.', 'ai');
    }

    async toggleUserMic() {
      if (!this.isUserMicOn) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          this.userMicStream = stream;
          this.isUserMicOn = true;
          
          // Update UI
          this.updateNavItems();
          
          this.initUserSTT();
        } catch (error) {
          console.error('Microphone access failed:', error);
          this.addTranscriptionItem('AI', 'Microphone access failed. Please allow microphone permissions.', 'ai');
        }
      } else {
        if (this.userMicStream) {
          this.userMicStream.getTracks().forEach(track => track.stop());
          this.userMicStream = null;
        }
        
        if (this.userRecognition) {
          try {
            this.userRecognition.stop();
          } catch (e) {
            console.log('User recognition already stopped');
          }
        }
        
        this.isUserMicOn = false;
        
        // Update UI
        this.updateNavItems();
      }
    }

    initSystemSTT() {
      console.log('🔊 Initializing system audio transcription...');
      
      // Only show one initialization message
      if (!this.isSystemAudioCapturing) {
        this.addTranscriptionItem('System', '🎙️ System audio transcription initialized', 'ai');
      }
      
      // Request system audio capture from background script
      chrome.runtime.sendMessage({ action: 'captureSystemAudio' }, (response) => {
        if (response && response.success) {
          console.log('✅ System audio capture started successfully');
          this.isSystemAudioCapturing = true;
          
          // Set up Speech Recognition for transcription of captured audio
          this.setupSystemAudioTranscription();
        } else {
          console.error('❌ Failed to start system audio capture:', response?.error);
          this.addTranscriptionItem('System', 'Failed to start system audio capture. Please ensure tab audio permissions.', 'ai');
        }
      });
      
      // Listen for audio data from background script
      this.setupAudioDataListener();
    }
    
    setupSystemAudioTranscription() {
      console.log('🎤 Setting up system audio transcription processor...');
      
      // Initialize audio context for processing captured audio
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.error('Failed to create audio context:', e);
      }
      
      // For demo purposes, show that system audio capture is working
      this.addTranscriptionItem('System', '✅ System audio capture active - focusing on live captions', 'ai');
      
      console.log('✅ System audio transcription processor ready - focusing on live captions');
    }
    
    setupAudioDataListener() {
      // Listen for audio chunks from background script
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'audioChunk') {
          console.log('📡 Received audio chunk from background script, size:', message.data?.size);
          // We're not processing audio chunks anymore, focusing on live captions
        } else if (message.action === 'audioData') {
          console.log('📡 Received final audio data from background script');
          // We're not processing audio data anymore, focusing on live captions
        }
      });
    }
    
    showSystemAudioActivity(audioSize) {
      // Clear any existing timeout
      if (this.audioActivityTimeout) {
        clearTimeout(this.audioActivityTimeout);
      }
      
      // Show audio activity indicator
      let indicator = document.getElementById('buzzer-audio-activity');
      if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'buzzer-audio-activity';
        indicator.className = 'audio-indicator recording';
        indicator.innerHTML = '🎤 Interviewer audio detected';
        document.body.appendChild(indicator);
      }
      
      // Hide indicator after 2 seconds of inactivity
      this.audioActivityTimeout = setTimeout(() => {
        if (indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
        }
      }, 2000);
    }
    
    async processAudioChunk(audioBlob, size) {
      // Not processing audio chunks anymore, focusing on live captions
    }
    
    async processFinalAudio(audioBlob) {
      // Not processing final audio anymore, focusing on live captions
    }

    initUserSTT() {
      console.log('🎤 Starting User STT...');
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.error('❌ Speech Recognition not supported');
        return;
      }

      this.userRecognition = new SpeechRecognition();
      this.userRecognition.continuous = true;
      this.userRecognition.interimResults = true;
      this.userRecognition.lang = 'en-US';
      
      this.userRecognition.onresult = (event) => {
        console.log('🎙️ Candidate STT result received');
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript;
        
        if (event.results[last].isFinal) {
          console.log('✅ Candidate final transcript:', transcript);
          this.addTranscriptionItem('You', transcript, 'user');
        } else {
          console.log('⚡ Candidate interim:', transcript);
          this.showInterimResult('You', transcript, 'user');
        }
      };
      
      this.userRecognition.onerror = (event) => {
        console.error('🚨 User STT error:', event.error);
      };
      
      this.userRecognition.onend = () => {
        console.log('🔄 User STT ended, restarting...');
        if (this.isUserMicOn) {
          setTimeout(() => {
            try {
              this.userRecognition.start();
              console.log('🎤 User STT restarted');
            } catch (e) {
              console.log('Failed to restart user STT:', e);
            }
          }, 100);
        }
      };

      try {
        this.userRecognition.start();
        console.log('🚀 User STT started successfully!');
      } catch (error) {
        console.error('Failed to start user STT:', error);
      }
    }

    updateUI() {
      this.updateHelpButton();
      this.updateContent();
      this.updateNavItems();
    }

    updateNavItems() {
      // Update microphone button
      const micBtn = Array.from(this.overlay.querySelectorAll('.nav-item')).find(
        item => item.querySelector('.nav-label').textContent === 'Mic'
      );
      const cameraBtn = this.overlay.querySelector('.camera-btn');
      if (micBtn) {
        micBtn.classList.toggle('active', this.isUserMicOn);
      }
      if (cameraBtn) {
        cameraBtn.classList.toggle('active', this.isUserMicOn);
      }

      // Update input placeholder
      const input = this.overlay.querySelector('.prompt-input');
      if (input) {
        if (this.isScreenSharing && this.isUserMicOn) {
          input.placeholder = '🎤 Both audio sources active - Type additional prompts...';
        } else if (this.isScreenSharing) {
          input.placeholder = '🔊 Live captions active - Click mic for voice input...';
        } else if (this.isUserMicOn) {
          input.placeholder = '🎤 Mic active - Type additional prompts...';
        } else {
          input.placeholder = 'Start screen sharing and mic for transcription...';
        }
      }
    }

    makeDraggable(element) {
      let isDragging = false;
      let isResizing = false;
      let startX, startY, startLeft, startTop, startWidth, startHeight;
      
      const onMouseDown = (e) => {
        // Skip dragging if clicking on interactive elements
        const interactive = e.target.closest('button, input, textarea, .nav-item, .tab-btn, .help-button');
        if (interactive) return;
        
        const rect = element.getBoundingClientRect();
        const isNearEdge = (
          e.clientX > rect.right - 20 || 
          e.clientY > rect.bottom - 20 ||
          e.clientX < rect.left + 20 ||
          e.clientY < rect.top + 20
        );
        
        if (isNearEdge) {
          console.log('📐 Starting resize...');
          isResizing = true;
          element.classList.add('resizing');
        } else {
          console.log('🖱️ Starting drag...');
          isDragging = true;
          element.classList.add('dragging');
        }
        
        startX = e.clientX;
        startY = e.clientY;
        startLeft = rect.left;
        startTop = rect.top;
        startWidth = rect.width;
        startHeight = rect.height;
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        e.preventDefault();
      };
      
      const onMouseMove = (e) => {
        if (!isDragging && !isResizing) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        if (isResizing) {
          // Handle resizing
          let newWidth = startWidth + deltaX;
          let newHeight = startHeight + deltaY;
          
          // Set minimum and maximum sizes
          newWidth = Math.max(300, Math.min(newWidth, window.innerWidth - startLeft));
          newHeight = Math.max(200, Math.min(newHeight, window.innerHeight - startTop));
          
          element.style.width = newWidth + 'px';
          element.style.height = newHeight + 'px';
          
          console.log('📏 Resizing to:', newWidth, 'x', newHeight);
        } else {
          // Handle dragging
          let newLeft = startLeft + deltaX;
          let newTop = startTop + deltaY;
          
          console.log('📍 Moving to:', newLeft, newTop, '(delta:', deltaX, deltaY, ')');
          
          // Very liberal boundaries - allow almost complete freedom
          const minLeft = -element.offsetWidth + 50;
          const maxLeft = window.innerWidth - 50;
          const minTop = -50;
          const maxTop = window.innerHeight - 50;
          
          newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
          newTop = Math.max(minTop, Math.min(newTop, maxTop));
          
          // Force positioning
          element.style.position = 'fixed';
          element.style.left = newLeft + 'px';
          element.style.top = newTop + 'px';
          element.style.right = 'auto';
          element.style.bottom = 'auto';
          element.style.transform = 'none';
        }
      };
      
      const onMouseUp = () => {
        if (isDragging) {
          console.log('✅ Drag completed');
          isDragging = false;
          element.classList.remove('dragging');
        }
        if (isResizing) {
          console.log('✅ Resize completed');
          isResizing = false;
          element.classList.remove('resizing');
        }
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
      
      element.addEventListener('mousedown', onMouseDown);
      
      // Add hover effect for resize areas
      element.addEventListener('mousemove', (e) => {
        if (isDragging || isResizing) return;
        
        const rect = element.getBoundingClientRect();
        const isNearEdge = (
          e.clientX > rect.right - 20 || 
          e.clientY > rect.bottom - 20 ||
          e.clientX < rect.left + 20 ||
          e.clientY < rect.top + 20
        );
        
        if (isNearEdge) {
          element.style.cursor = 'nw-resize';
        } else {
          element.style.cursor = 'grab';
        }
      });
      
      // Touch support for mobile
      const onTouchStart = (e) => {
        // Skip dragging if touching interactive elements
        const interactive = e.target.closest('button, input, textarea, .nav-item, .tab-btn, .help-button');
        if (interactive) return;
        
        const touch = e.touches[0];
        console.log('👆 Touch drag starting...');
        isDragging = true;
        element.classList.add('dragging');
        
        startX = touch.clientX;
        startY = touch.clientY;
        
        // Get current position using getBoundingClientRect for accuracy
        const rect = element.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd);
        e.preventDefault();
      };
      
      const onTouchMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;
        
        let newLeft = startLeft + deltaX;
        let newTop = startTop + deltaY;
        
        console.log('👆 Touch moving to:', newLeft, newTop);
        
        // Very liberal boundaries
        const minLeft = -element.offsetWidth + 50;
        const maxLeft = window.innerWidth - 50;
        const minTop = -50;
        const maxTop = window.innerHeight - 50;
        
        newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
        newTop = Math.max(minTop, Math.min(newTop, maxTop));
        
        // Force positioning
        element.style.position = 'fixed';
        element.style.left = newLeft + 'px';
        element.style.top = newTop + 'px';
        element.style.right = 'auto';
        element.style.bottom = 'auto';
        element.style.transform = 'none';
      };
      
      const onTouchEnd = () => {
        isDragging = false;
        element.classList.remove('dragging');
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
      };
      
      element.addEventListener('touchstart', onTouchStart);
    }
    
    // Set up observer for live captions with debouncing to prevent spam
    setupLiveCaptionObserver() {
      console.log('🔍 Setting up live caption observer with debouncing...');
      
      // Create live caption element
      this.liveCaptionElement = document.createElement('div');
      this.liveCaptionElement.id = 'buzzer-live-caption';
      this.liveCaptionElement.style.display = 'none';
      document.body.appendChild(this.liveCaptionElement);
      
      // Use debouncing to prevent spam - only check every 3 seconds
      this.captionCheckInterval = setInterval(() => {
        this.checkForLiveCaptions();
      }, 3000);
    }
    
    // Check for live captions on the page
    checkForLiveCaptions() {
      // Common selectors for live captions in meeting platforms
      const captionSelectors = [
        '[data-placeholder="Transcript"]', // Google Meet
        '[aria-label="Live captions"]', // Zoom
        '.live-transcript', // Generic
        '.caption-text', // Generic
        '.transcript-text', // Generic
        '[class*="caption"]', // Class contains "caption"
        '[class*="transcript"]' // Class contains "transcript"
      ];
      
      for (const selector of captionSelectors) {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            if (element.textContent && element.textContent.trim() !== '') {
              this.processLiveCaptionWithDebounce(element.textContent);
            }
          });
        } catch (e) {
          console.log('Error querying selector:', selector, e);
        }
      }
    }
    
    // Process live caption text with debouncing to prevent spam
    processLiveCaptionWithDebounce(text) {
      // Clear existing debounce timer
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      
      // Set new debounce timer
      this.debounceTimer = setTimeout(() => {
        this.processLiveCaption(text);
      }, 500); // Wait 500ms before processing
    }
    
    // Process live caption text and add to transcription
    processLiveCaption(text) {
      // Only process if text has changed and is not empty
      if (!text || text.trim() === '' || this.lastCaptionText === text.trim()) {
        return;
      }
      
      this.lastCaptionText = text.trim();
      console.log('📺 Live caption detected:', text);
      
      // Update live caption display
      if (this.liveCaptionElement) {
        this.liveCaptionElement.textContent = text;
        this.liveCaptionElement.style.display = 'block';
        
        // Hide after 5 seconds of inactivity
        if (this.captionTimeout) {
          clearTimeout(this.captionTimeout);
        }
        this.captionTimeout = setTimeout(() => {
          this.liveCaptionElement.style.display = 'none';
        }, 5000);
      }
      
      // Add to transcription as system audio (interviewer)
      // But only if it's a substantial caption (not just a few words)
      if (text.trim().split(' ').length > 3) {
        this.addTranscriptionItem('Interviewer', text.trim(), 'interviewer');
      }
    }
  }

  // Initialize the overlay and make it globally accessible
  window.buzzerOverlayInstance = new OverlayExtensionWindow();

})();