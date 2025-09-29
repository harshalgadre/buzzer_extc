// ExtensionWindow.js - Vanilla JavaScript implementation
class ExtensionWindow {
  constructor() {
    this.activeTab = 'transcription';
    this.helpCount = 3;
    this.calloutVisible = true;
    this.currentQuestion = null;
    this.currentAnswer = null;
    
    // Question detection regex patterns
    this.questionPatterns = [
      /\b(?:what|how|why|when|where|who|which|can you|could you|would you|do you|did you|will you|is|are|am)\b.*\?/i,
      /\b(?:explain|describe|tell me|show me|help me|teach me)\b.*/i,
      /\b(?:what is|how to|why does|when did|where can|who is|which one)\b.*/i,
      /\b(?:javascript|html|css|nodejs|node\.?js|react|angular|vue|python|java|c\+\+|programming|coding|development)\b.*[\?]*$/i
    ];
    
    // Gemini API configuration
    this.geminiApiKey = 'AIzaSyDhzNuE6LuryLNy6gl5ofNvg5ju93qEud4'; // Replace with your actual API key
    this.geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
    
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
    const input = document.querySelector('.prompt-input');
    const query = input ? input.value.trim() : '';
    
    if (query) {
      console.log('Help triggered with query:', query);
      this.addTranscriptionItem('User', query, 'user');
      
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
    
    // Auto-detect questions from transcription and process with AI
    if (type === 'user' || type === 'interviewer') {
      if (this.isQuestion(text)) {
        console.log('Question detected in transcription:', text);
        setTimeout(() => {
          this.processQuestion(text);
        }, 500); // Small delay to allow transcription to complete
      }
    }
    
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

  updateMainCanvas() {
    const canvas = document.querySelector('.main-canvas .illustration-container');
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
          <button class="qa-close" onclick="window.extensionWindow.clearQuestionAnswer()">
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

  updateUI() {
    this.updateHelpButton();
    this.updateContent();
    this.updateMainCanvas();
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
    
    /* Q&A Display Styles */
    .qa-display {
      padding: 20px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      margin: 20px;
      position: relative;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .qa-question, .qa-answer {
      margin-bottom: 16px;
    }
    
    .qa-answer {
      margin-bottom: 0;
    }
    
    .qa-label {
      font-weight: 600;
      font-size: 14px;
      color: #FF6A2B;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .qa-text {
      font-size: 15px;
      line-height: 1.5;
      color: #e5e5e5;
      background: rgba(0, 0, 0, 0.2);
      padding: 12px 16px;
      border-radius: 8px;
      border-left: 3px solid #FF6A2B;
    }
    
    .qa-close {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #bdbdbd;
      transition: all 0.2s;
    }
    
    .qa-close:hover {
      background: rgba(255, 0, 0, 0.2);
      color: #ff4444;
      transform: scale(1.1);
    }
    
    .qa-question .qa-text {
      border-left-color: #3b82f6;
    }
  `;
  document.head.appendChild(style);
});
