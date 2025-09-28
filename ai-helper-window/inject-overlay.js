// inject-overlay.js - Script to inject the floating AI helper overlay into the page

(function() {
  // Prevent multiple injections
  if (document.getElementById('buzzer-ai-overlay')) {
    return;
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
          
          <div class="logo-badge">
            <span class="logo-n">N</span>
          </div>
        </div>

        <!-- Navigation controls -->
        <nav class="sidebar-nav" role="tablist">
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
          <button class="camera-btn" aria-label="Camera options">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z"/>
            </svg>
          </button>
          <input 
            type="text" 
            class="prompt-input" 
            placeholder="Type or OCR quick prompt. Please wait until a meeting host brings you in."
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
      pointer-events: auto !important;
    }

    #buzzer-ai-overlay .overlay-backdrop {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: rgba(0, 0, 0, 0.4) !important;
      backdrop-filter: blur(4px) !important;
      z-index: 1 !important;
    }

    #buzzer-ai-overlay .extension-window {
      position: relative !important;
      z-index: 2 !important;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      animation: slideIn 0.3s ease-out !important;
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
    
    #buzzer-ai-overlay .transcription-text {
      font-size: 14px !important;
      line-height: 1.4 !important;
      color: #e5e5e5 !important;
    }
    
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
  `;

  // Append to head to ensure proper CSS loading
  document.head.appendChild(style);
  document.body.appendChild(overlay);

  // Initialize the overlay functionality
  class OverlayExtensionWindow {
    constructor() {
      this.activeTab = 'transcription';
      this.helpCount = 3;
      this.calloutVisible = true;
      this.overlay = overlay;
      this.init();
    }

    init() {
      this.setupEventListeners();
      this.updateUI();
    }

    setupEventListeners() {
      // Close overlay
      const closeBtn = this.overlay.querySelector('.overlay-close');
      const backdrop = this.overlay.querySelector('.overlay-backdrop');
      
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.closeOverlay());
      }
      
      if (backdrop) {
        backdrop.addEventListener('click', () => this.closeOverlay());
      }

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

      // Navigation items
      const navItems = this.overlay.querySelectorAll('.nav-item');
      navItems.forEach(item => {
        item.addEventListener('click', () => {
          navItems.forEach(n => n.classList.remove('active'));
          item.classList.add('active');
        });
      });

      // Prevent clicks inside the window from closing the overlay
      const extensionWindow = this.overlay.querySelector('.extension-window');
      if (extensionWindow) {
        extensionWindow.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      }
    }

    closeOverlay() {
      this.overlay.style.opacity = '0';
      this.overlay.style.transform = 'scale(0.9)';
      setTimeout(() => {
        if (this.overlay && this.overlay.parentNode) {
          this.overlay.parentNode.removeChild(this.overlay);
        }
      }, 200);
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

    triggerHelp() {
      const input = this.overlay.querySelector('.prompt-input');
      const query = input ? input.value.trim() : '';
      
      if (query) {
        console.log('Help triggered with query:', query);
        this.addTranscriptionItem('User', query, 'user');
        setTimeout(() => {
          this.addTranscriptionItem('AI', 'I can help you with that. Let me analyze the current conversation context...', 'ai');
        }, 1000);
        
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

      const item = document.createElement('div');
      item.className = `transcription-item ${type}`;
      
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      item.innerHTML = `
        <div class="transcription-header">
          <span class="speaker ${type}">${speaker}</span>
          <span class="timestamp">${timestamp}</span>
        </div>
        <div class="transcription-text">${text}</div>
      `;

      list.appendChild(item);
      
      const content = this.overlay.querySelector('.panel-content');
      if (content) {
        content.scrollTop = content.scrollHeight;
      }
    }

    updateHelpButton() {
      const helpBtn = this.overlay.querySelector('.help-button');
      const helpText = helpBtn?.querySelector('.help-text');
      if (helpText) {
        helpText.textContent = `Help Me (${this.helpCount})`;
      }
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
            <!-- Transcription items will be added dynamically -->
          </div>
        `;
      }
    }

    updateUI() {
      this.updateHelpButton();
      this.updateContent();
    }
  }

  // Initialize the overlay
  new OverlayExtensionWindow();

})();