// ExtensionWindow.js - Vanilla JavaScript implementation
class ExtensionWindow {
  constructor() {
    this.activeTab = 'transcription';
    this.helpCount = 3;
    this.calloutVisible = true;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateUI();
  }

  setupEventListeners() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const isTranscription = e.target.textContent.trim() === 'Transcription';
        this.setActiveTab(isTranscription ? 'transcription' : 'topics');
      });
    });

    // Callout close
    const closeBtn = document.querySelector('.callout-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeCallout();
      });
    }

    // Help button
    const helpBtn = document.querySelector('.help-button');
    if (helpBtn) {
      helpBtn.addEventListener('click', () => {
        this.triggerHelp();
      });
    }

    // Input handling
    const input = document.querySelector('.prompt-input');
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.triggerHelp();
        }
      });
    }

    // Navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        // Remove active state from all items
        navItems.forEach(n => n.classList.remove('active'));
        // Add active state to clicked item
        item.classList.add('active');
      });
    });
  }

  setActiveTab(tab) {
    this.activeTab = tab;
    
    // Update tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      const isActive = (tab === 'transcription' && btn.textContent.trim() === 'Transcription') ||
                      (tab === 'topics' && btn.textContent.trim() === 'Topics');
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });

    // Update content area
    this.updateContent();
  }

  closeCallout() {
    const callout = document.querySelector('.callout');
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
    const input = document.querySelector('.prompt-input');
    const query = input ? input.value.trim() : '';
    
    if (query) {
      console.log('Help triggered with query:', query);
      // Simulate AI processing
      this.addTranscriptionItem('User', query, 'user');
      setTimeout(() => {
        this.addTranscriptionItem('AI', 'I can help you with that. Let me analyze the current conversation context...', 'ai');
      }, 1000);
      
      input.value = '';
    } else {
      // Show help with current context
      this.addTranscriptionItem('AI', 'I\'m ready to help! You can ask me questions about the interview or request specific assistance.', 'ai');
    }

    // Decrement help count
    if (this.helpCount > 0) {
      this.helpCount--;
      this.updateHelpButton();
    }
  }

  addTranscriptionItem(speaker, text, type) {
    const list = document.querySelector('.transcription-list');
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
    
    // Auto-scroll to bottom
    const content = document.querySelector('.panel-content');
    if (content) {
      content.scrollTop = content.scrollHeight;
    }
  }

  updateHelpButton() {
    const helpBtn = document.querySelector('.help-button');
    const helpText = helpBtn?.querySelector('.help-text');
    if (helpText) {
      helpText.textContent = `Help Me (${this.helpCount})`;
    }
  }

  updateContent() {
    const contentArea = document.querySelector('.panel-content');
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.extensionWindow = new ExtensionWindow();
  
  // Add CSS for dynamic content
  const style = document.createElement('style');
  style.textContent = `
    .transcription-item {
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .transcription-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    
    .speaker {
      font-weight: 600;
      font-size: 13px;
    }
    
    .speaker.user {
      color: #3b82f6;
    }
    
    .speaker.ai {
      color: #FF6A2B;
    }
    
    .speaker.interviewer {
      color: #10b981;
    }
    
    .timestamp {
      font-size: 11px;
      color: #bdbdbd;
    }
    
    .transcription-text {
      font-size: 14px;
      line-height: 1.4;
      color: #e5e5e5;
    }
    
    .topic-item {
      padding: 12px 16px;
      margin-bottom: 8px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
      font-size: 14px;
    }
    
    .topic-item:hover {
      background: rgba(255, 106, 43, 0.1);
      color: #FF6A2B;
    }
    
    .topics-list {
      padding: 16px 0;
    }
  `;
  document.head.appendChild(style);
});
