import React, { useState, useCallback } from 'react';

const ExtensionWindow = () => {
  const [activeTab, setActiveTab] = useState('transcription');
  const [helpCount, setHelpCount] = useState(3);
  const [calloutVisible, setCalloutVisible] = useState(true);
  const [transcriptionItems, setTranscriptionItems] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const topics = [
    'Technical Skills',
    'Project Experience', 
    'Problem Solving',
    'Team Collaboration',
    'Leadership Examples'
  ];

  const handleTabClick = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const closeCallout = useCallback(() => {
    setCalloutVisible(false);
  }, []);

  const addTranscriptionItem = useCallback((speaker, text, type) => {
    const newItem = {
      id: Date.now(),
      speaker,
      text,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTranscriptionItems(prev => [...prev, newItem]);
  }, []);

  const triggerHelp = useCallback(() => {
    if (inputValue.trim()) {
      addTranscriptionItem('User', inputValue.trim(), 'user');
      setTimeout(() => {
        addTranscriptionItem('AI', 'I can help you with that. Let me analyze the current conversation context...', 'ai');
      }, 1000);
      setInputValue('');
    } else {
      addTranscriptionItem('AI', 'I\'m ready to help! You can ask me questions about the interview or request specific assistance.', 'ai');
    }
    
    if (helpCount > 0) {
      setHelpCount(prev => prev - 1);
    }
  }, [inputValue, helpCount, addTranscriptionItem]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerHelp();
    }
  }, [triggerHelp]);

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
          {['Theme', 'Font', 'Bullet', 'Detail', 'Translate', 'Auto'].map((item, index) => (
            <button key={item} className="nav-item" role="tab" aria-selected="false">
              <div className={`nav-icon ${['Bullet', 'Detail', 'Auto'].includes(item) ? 'crown-badge' : ''}`}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                  {/* Icon paths would go here - simplified for example */}
                  <circle cx="9" cy="9" r="7"/>
                </svg>
                {['Bullet', 'Detail', 'Auto'].includes(item) && (
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
            <div className="transcription-list">
              {transcriptionItems.map((item) => (
                <div key={item.id} className={`transcription-item ${item.type}`}>
                  <div className="transcription-header">
                    <span className={`speaker ${item.type}`}>{item.speaker}</span>
                    <span className="timestamp">{item.timestamp}</span>
                  </div>
                  <div className="transcription-text">{item.text}</div>
                </div>
              ))}
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
          <button className="camera-btn" aria-label="Camera options">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z"/>
            </svg>
          </button>
          <input 
            type="text" 
            className="prompt-input" 
            placeholder="Type or OCR quick prompt. Please wait until a meeting host brings you in."
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
